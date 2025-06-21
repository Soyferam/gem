// Конфигурация API (ЗАМЕНИТЕ 'gem-orpin-beta' на ваш реальный проект Vercel)
const API_CONFIG = {
  local: 'http://localhost:3000/api/gemini',
  production: 'https://gem-orpin-beta.vercel.app/api/gemini' // ← Вот здесь исправьте!
};

// Получаем текущий URL API с проверкой
const getApiUrl = () => {
  const isLocal = window.location.hostname === 'localhost' || 
                 window.location.hostname === '127.0.0.1';
  
  return isLocal ? API_CONFIG.local : API_CONFIG.production;
};

// Функция добавления сообщения (без изменений)
const addMessage = (role, text) => {
  const messages = document.getElementById('messages');
  const msgElement = document.createElement('div');
  msgElement.className = `message ${role}-message`;
  msgElement.textContent = text;
  messages.appendChild(msgElement);
  messages.scrollTop = messages.scrollHeight;
  return msgElement;
};

// Улучшенная функция отправки сообщения
const sendMessageToAI = async (message) => {
  try {
    const loadingMsg = addMessage('status', 'Коуч печатает...');
    const apiUrl = getApiUrl();
    
    console.log('Отправка запроса к:', apiUrl); // Логирование URL
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        prompt: message,
        style: document.querySelector('input[name="style"]:checked')?.value || "Энерджайзер-Зажигалка"
      })
    });

    loadingMsg.remove();
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.error || `HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    addMessage('ai', data.response);
  } catch (error) {
    console.error('Ошибка запроса:', error);
    addMessage('error', `Ошибка: ${error.message}`);
  }
};

// Инициализация чата
document.addEventListener('DOMContentLoaded', () => {
  const chatForm = document.getElementById('chat-form');
  const userInput = document.getElementById('user-input');

  chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const message = userInput.value.trim();
    if (!message) return;
    
    addMessage('user', message);
    userInput.value = '';
    await sendMessageToAI(message);
  });
});