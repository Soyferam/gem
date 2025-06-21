// Конфигурация API (ЗАМЕНИТЕ на ваш реальный домен Vercel)
const API_CONFIG = {
  local: 'http://localhost:3001/api/gemini',
  production: 'https://gem-orpin-beta.vercel.app/api/gemini' // Убедитесь что это ваш домен!
};

// Получаем текущий URL API с проверкой
const getApiUrl = () => {
  // Для локальной разработки
  if (window.location.hostname === 'localhost' || 
      window.location.hostname === '127.0.0.1' ||
      window.location.port === '3000') {
    return API_CONFIG.local;
  }
  // Для продакшена
  return API_CONFIG.production;
};

// Функция добавления сообщения
const addMessage = (role, text) => {
  const messages = document.getElementById('messages');
  const msgElement = document.createElement('div');
  msgElement.className = `message ${role}-message`;
  msgElement.textContent = text;
  messages.appendChild(msgElement);
  messages.scrollTop = messages.scrollHeight;
  return msgElement;
};

// Функция отправки сообщения с улучшенной обработкой ошибок
const sendMessageToAI = async (message) => {
  let loadingMsg = null;
  
  try {
    loadingMsg = addMessage('status', 'Коуч печатает...');
    const apiUrl = getApiUrl();
    
    console.log('Отправка запроса к:', apiUrl);
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        prompt: message,
        style: document.querySelector('input[name="style"]:checked')?.value || 
              "Энерджайзер-Зажигалка"
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || `HTTP error ${response.status}`);
    }

    const data = await response.json();
    addMessage('ai', data.response);
    
  } catch (error) {
    console.error('Ошибка:', error);
    addMessage('error', `Ошибка: ${error.message}`);
  } finally {
    if (loadingMsg && loadingMsg.parentNode) {
      loadingMsg.remove();
    }
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