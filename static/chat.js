const chatContainer = document.getElementById('chat-container');
const messagesDiv = document.getElementById('messages');
const chatForm = document.getElementById('chat-form');
const userInput = document.getElementById('user-input');
const sendBtn = chatForm.querySelector('button');

function appendMessage(text, role) {
  const div = document.createElement('div');
  div.className = `msg ${role}`;
  div.textContent = text;
  messagesDiv.appendChild(div);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

async function startChat() {
  userInput.disabled = false;
  sendBtn.disabled = true;

  userInput.addEventListener('input', () => {
    sendBtn.disabled = userInput.value.trim() === '';
  });

  chatForm.onsubmit = async (e) => {
    e.preventDefault();
    const text = userInput.value.trim();
    if (!text) return;

    appendMessage(`👤 ${text}`, 'user');
    userInput.value = '';
    sendBtn.disabled = true;

    // Формируем prompt для AI (можно добавить контекст из quizData)
    const prompt = text;

    const reply = await sendMessageToAI(prompt);
    appendMessage(`🤖 ${reply}`, 'ai');
  };
}

window.startChat = startChat;
