const params = new URLSearchParams(window.location.search);
const query = params.get("q");

const resultsDiv = document.getElementById("results");
const searchBox = document.getElementById("searchBox");

searchBox.value = query;

async function fetchResults(q) {
    resultsDiv.innerHTML = "Searching...";

    const res = await fetch(
        `http://127.0.0.1:8000/rag?query=${encodeURIComponent(q)}`
    );

    const data = await res.json();

    // ✅ PUT IT HERE
    let html = `
        <div class="answer-card">
            <p class="answer">${data.answer}</p>
        </div>

        <div class="sources">
            <h3>Sources</h3>
    `;

    // Then add sources
    data.sources.slice(0, 4).forEach(src => {
        html += `
            <div class="sourceChunk">
                ${src.text.substring(0, 300)}...
            </div>
        `;
    });

    // Close the sources div
    html += `</div>`;

    // Render everything
    resultsDiv.innerHTML = html;
}

document.getElementById("searchBtn").onclick = () => {
    const q = searchBox.value.trim();
    if (!q) return;

    window.location.href =
        `results.html?q=${encodeURIComponent(q)}`;
};


if (query) fetchResults(query);
