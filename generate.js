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

            if (response.ok) {
                const data = await response.json();
                resultArea.textContent = data.result || "Content generated successfully!";
            } else {
                resultArea.textContent = "Error: Could not authorize or connect to the service.";
            }
        } catch (error) {
            console.error('Error:', error);
            resultArea.textContent = "Error: Failed to reach the AI server.";
        } finally {
            generateBtn.disabled = false;
            generateBtn.textContent = 'Generate Content';
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
