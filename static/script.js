const BASE_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:3000' 
  : 'https://your-project-name.vercel.app';

// Функции для работы с чатом
const addMessage = (role, text) => {
  const messages = document.getElementById('messages');
  const msgElement = document.createElement('div');
  msgElement.className = `message ${role}-message`;
  msgElement.textContent = text;
  messages.appendChild(msgElement);
  messages.scrollTop = messages.scrollHeight;
  return msgElement;
};

const sendMessageToAI = async (message) => {
  try {
    const loadingMsg = addMessage('status', 'Коуч печатает...');
    
    const response = await fetch(`${BASE_URL}/api/gemini`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        prompt: message,
        style: document.querySelector('input[name="style"]:checked')?.value || "Энерджайзер-Зажигалка"
      })
    });

    loadingMsg.remove();
    
    if (!response.ok) throw new Error(await response.text());
    const data = await response.json();
    addMessage('ai', data.response);
  } catch (error) {
    addMessage('error', 'Ошибка: ' + error.message);
  }
};

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('chat-form');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const input = document.getElementById('user-input');
    const message = input.value.trim();
    if (!message) return;
    
    addMessage('user', message);
    input.value = '';
    sendMessageToAI(message);
  });
});