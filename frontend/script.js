const uploadBtn = document.getElementById("uploadBtn");
const pdfInput = document.getElementById("pdfInput");
const uploadStatus = document.getElementById("uploadStatus");

const askBtn = document.getElementById("askBtn");
const questionInput = document.getElementById("questionInput");
const answerSection = document.getElementById("answerSection");

pdfInput.addEventListener("change", async () => {
    if (!pdfInput.files.length) return;

    const formData = new FormData();
    formData.append("file", pdfInput.files[0]);

    uploadStatus.innerText = "Uploading PDF...";

    try {
        const res = await fetch("http://localhost:8000/input", {
            method: "POST",
            body: formData
        });

        if (!res.ok) throw new Error("Upload failed");

        uploadStatus.innerText = "✅ PDF uploaded successfully";
    } catch (err) {
        uploadStatus.innerText = "❌ Upload failed";
    }
});


// askBtn.addEventListener("click", async () => {
//     const question = questionInput.value.trim();
//     //alert(question);
//     if (!question) {
//         alert("Please type a question!");
//         return;
//     }

//     answerSection.innerHTML = "Fetching answer...";

//     try {
//         const response = await fetch(`http://127.0.0.1:8000/rag?query=${encodeURIComponent(question)}`);

//         const data = await response.json();
//         let html = `<p><strong>Q:</strong> ${data.question}</p>`;
//         html += `<p><strong>A:</strong> ${data.answer}</p>`;
//         html += `<h3>Sources:</h3>`;
//         data.sources.forEach(src => {
//             html += `<div class="sourceChunk">- ${src.text}</div>`;
//         });

//         answerSection.innerHTML = html;
//     } catch (err) {
//         answerSection.innerHTML = "Failed to fetch answer. Check console.";
//         console.error(err);
//     }
// });

askBtn.addEventListener("click", () => {
    const question = questionInput.value.trim();
    if (!question) return;

    window.location.href =
        `results.html?q=${encodeURIComponent(question)}`;
});

questionInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") askBtn.click();
});
