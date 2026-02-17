const API_BASE = "http://127.0.0.1:8000";
const API_KEY = "ai-service-secret-token"; // Matched with auth.py

document.addEventListener('DOMContentLoaded', () => {
    const generateBtn = document.getElementById('generateBtn');
    const promptInput = document.getElementById('promptInput');
    const resultArea = document.getElementById('resultArea');
    const copyBtn = document.getElementById('copyBtn');
    const downloadBtn = document.getElementById('downloadBtn');

    generateBtn.addEventListener('click', async () => {
        const text = promptInput.value.trim();
        if (!text) return;

        generateBtn.disabled = true;
        generateBtn.textContent = 'Generating...';
        resultArea.textContent = 'Please wait while I generate your content...';

        try {
            const response = await fetch(`${API_BASE}/api/ai/generator`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'X-API-Key': API_KEY
                },
                body: JSON.stringify({ prompt: text })
            });

            const contentType = response.headers.get("content-type");
            let data = {};
            if (contentType && contentType.includes("application/json")) {
                data = await response.json();
            }

            if (response.ok) {
                resultArea.textContent = data.result || data.message || "Content generated successfully!";
            } else if (response.status === 429) {
                resultArea.textContent = "Error: Rate limit exceeded. Please wait a minute.";
            } else if (response.status === 403) {
                resultArea.textContent = "Error: Unauthorized. Check your API key.";
            } else {
                resultArea.textContent = `Error: ${data.detail || "Server error occurred."}`;
            }
        } catch (error) {
            console.error('Error:', error);
            resultArea.textContent = "Error: Failed to reach the AI server. Check your connection.";
        } finally {
            generateBtn.disabled = false;
            generateBtn.innerHTML = '<i class="fas fa-wand-magic-sparkles"></i> Generate Content';
        }
    });

    if (copyBtn) {
        copyBtn.addEventListener('click', () => {
            const content = resultArea.textContent;
            navigator.clipboard.writeText(content).then(() => {
                const originalText = copyBtn.innerHTML;
                copyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
                setTimeout(() => copyBtn.innerHTML = originalText, 2000);
            });
        });
    }

    if (downloadBtn) {
        downloadBtn.addEventListener('click', () => {
            const content = resultArea.textContent;
            const blob = new Blob([content], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'generated-ai-content.txt';
            a.click();
            URL.revokeObjectURL(url);
        });
    }
});
