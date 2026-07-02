from fastapi import FastAPI, UploadFile, File, Query
from sentence_transformers import SentenceTransformer
import numpy as np
import os
import requests
from pypdf import PdfReader
from io import BytesIO
import faiss
import pickle
from groq import Groq
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

faiss_index = None
chunks = []
app = FastAPI()
api_key = os.getenv("API_KEY")
model = None
client = Groq(api_key=api_key)




app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # allow this origin to make requests
    allow_credentials=True,
    allow_methods=["*"],      # allow GET, POST, etc.
    allow_headers=["*"],      # allow headers
)

def get_model():
    global model
    if model is None:
        model = SentenceTransformer("all-MiniLM-L6-v2")
    return model

def generate_answer(prompt: str) -> str:
    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {
                    "role": "system",
                    "content": "You are a helpful assistant that answers using provided context only."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0.3,
            max_tokens=200
        )

        return response.choices[0].message.content.strip()

    except Exception as e:
        print("Groq Error:", e)
        return "Error generating response."


def save_index_and_chunks(index, chunks):
    os.makedirs("data", exist_ok=True)
    faiss.write_index(index, "data/faiss.index")

    with open("data/chunks.pkl", "wb") as f:
        pickle.dump(chunks, f)


def create_faiss_index(embeddings):
    dim = embeddings.shape[1]
    index = faiss.IndexFlatL2(dim)
    index.add(embeddings)
    return index

def rag_answer(question):
    # 1. Search top 3 chunks
    retrieved_chunks = search_similar_chunks(question)  # your Day 3 function

    if not retrieved_chunks:
        return {
            "question": question,
            "answer": "I don't know",
            "sources": []
        }

    # 2. Build prompt
    prompt = build_prompt(retrieved_chunks, question)

    # 3. Generate answer
    answer = generate_answer(prompt)

    return {
        "question": question,
        "answer": answer,
        "sources": retrieved_chunks
    }


def embed_chunks(chunks):
    model = get_model()
    embeddings = model.encode(chunks)
    return np.array(embeddings).astype("float32")


def embed_text(text: str):
    model = get_model()
    embedding = model.encode([text])
    return np.array(embedding).astype("float32")


def chunk_text(text, chunk_size=60):
    words = text.split()
    chunks = []

    for i in range(0, len(words), chunk_size):
        chunk = " ".join(words[i:i + chunk_size])
        chunks.append(chunk)

    return chunks


def extract_text_from_pdf(file_bytes: bytes) -> str:
    reader = PdfReader(BytesIO(file_bytes))
    text = ""
    for page in reader.pages:
        text += page.extract_text() + "\n"
    return text

def build_prompt(chunks, question):
    context = "\n\n".join(
        [f"- {chunk['text']}" for chunk in chunks]
    )

    prompt = f"""
Answer the question using ONLY the context below.
If the answer is not present, say "I don't know".

Context:
{context}

Question:
{question}

Answer:
"""
    return prompt

def search_similar_chunks(query, top_k=3):
    global faiss_index, chunks
    if faiss_index is None:
        return []

    # 1. Embed query
    model = get_model()
    query_vec = embed_text(query)


    # 2. Search FAISS
    distances, indices = faiss_index.search(query_vec, k=top_k)

    # 3. Collect top chunks
    results = []
    for idx, dist in zip(indices[0], distances[0]):
        results.append({
            "text": chunks[idx],   # match your prompt builder
            "score": float(dist)
        })

    return results

@app.on_event("startup")
def load_index():
    global faiss_index, chunks

    if os.path.exists("data/faiss.index"):
        faiss_index = faiss.read_index("data/faiss.index")
        with open("data/chunks.pkl", "rb") as f:
            chunks = pickle.load(f)
        print("FAISS index loaded")
    else:
        print("No FAISS index found")


# @app.get("/search")
# def search(query: str = Query(...)):
#     if faiss_index is None:
#         return {"error": "No index found. Upload a PDF first."}

#     query_vector = embed_text(query)
#     distances, indices = faiss_index.search(query_vector, k=3)
#     results = []
#     for idx, score in zip(indices[0], distances[0]):
#         results.append({
#             "chunk": chunks[idx],
#             "score": float(score)
#         })
#     return {
#         "query": query,
#         "results": results
#     }

@app.get("/search")
def search(query: str):
    if faiss_index is None:
        return {"error": "Upload a PDF first"}

    model = get_model()
    query_vec = model.encode([query]).astype("float32")
    distances, indices = faiss_index.search(query_vec, k=3)

    return {"results": [chunks[i] for i in indices[0]]}


@app.get("/")
def root():
    return {"status": "API running"}


@app.post("/input")
async def upload_pdf(file: UploadFile = File(...)):
    global faiss_index, chunks

    text = extract_text_from_pdf(await file.read())
    new_chunks = chunk_text(text, chunk_size=400)

    embeddings = embed_chunks(new_chunks)
    dim = embeddings.shape[1]

    if faiss_index is None:
        faiss_index = faiss.IndexFlatL2(dim)
    else:
        assert faiss_index.d == dim, "Embedding dimension mismatch"

    faiss_index.add(embeddings)
    chunks.extend(new_chunks)

    # ✅ SAVE TO DISK
    save_index_and_chunks(faiss_index, chunks)

    print("TOTAL CHUNKS STORED:", len(chunks))

    return {
        "status": "success",
        "total_chunks": len(chunks)
    }



@app.get("/rag")
def rag_endpoint(query: str):
    print(f"Received query: {query}") 
    return rag_answer(query)

# Triggering a fresh, lightweight backend deployment