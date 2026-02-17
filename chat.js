const API_BASE = "http://127.0.0.1:8000";
const API_KEY = "ai-service-secret-token"; // Matched with auth.py

document.addEventListener('DOMContentLoaded', () => {
    const chatForm = document.getElementById('chatForm');
    const chatBox = document.getElementById('chatBox');
    const userInput = document.getElementById('userInput');
    const clearBtn = document.getElementById('clearBtn');

    const addMessage = (text, isUser = false) => {
        const msgDiv = document.createElement('div');
        msgDiv.className = `message ${isUser ? 'user-msg' : 'ai-msg'}`;
        msgDiv.textContent = text;
        chatBox.appendChild(msgDiv);
        chatBox.scrollTop = chatBox.scrollHeight;
    };

    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const text = userInput.value.trim();
        if (!text) return;

        addMessage(text, true);
        userInput.value = '';

        try {
            const response = await fetch(`${API_BASE}/api/ai/chatbot`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'X-API-Key': API_KEY
                },
                body: JSON.stringify({ message: text })
            });

            const contentType = response.headers.get("content-type");
            let data = {};
            if (contentType && contentType.includes("application/json")) {
                data = await response.json();
            }

            if (response.ok) {
                addMessage(data.message || "I received your message!");
            } else if (response.status === 403) {
                addMessage("Error: Unauthorized. API Key is missing or invalid.");
            } else {
                addMessage(`Error: ${data.detail || "Failed to get response from AI."}`);
            }
        } catch (error) {
            console.error('Error:', error);
            addMessage("Error: Failed to reach the AI server. Check your connection.");
        }
    });

    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            chatBox.innerHTML = '';
            addMessage("Conversation cleared. How else can I help you?");
        });
    }

    // Welcome message
    setTimeout(() => {
        addMessage("Hello! I'm your AI Chatbot. How can I assist you today?");
    }, 500);
});

