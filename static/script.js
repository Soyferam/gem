// Конфигурация API
const API_CONFIG = {
  local: 'http://localhost:3000/api/gemini',
  production: 'https://your-project-name.vercel.app/api/gemini'
};

// Определяем текущий URL API
const getApiUrl = () => {
  if (window.location.hostname === 'localhost') {
    console.log('Используется локальный API:', API_CONFIG.local);
    return API_CONFIG.local;
  }
  console.log('Используется продакшен API:', API_CONFIG.production);
  return API_CONFIG.production;
};

// Функция для добавления сообщений в чат
const addMessage = (role, text) => {
  const messages = document.getElementById('messages');
  const msgElement = document.createElement('div');
  
  // Стили для разных типов сообщений
  const messageClasses = {
    user: 'user-message',
    ai: 'ai-message',
    error: 'error-message',
    status: 'status-message'
  };
  
  msgElement.className = `message ${messageClasses[role] || ''}`;
  msgElement.textContent = text;
  messages.appendChild(msgElement);
  messages.scrollTop = messages.scrollHeight;
  
  return msgElement;
};

// Функция отправки сообщения на сервер
const sendMessageToAI = async (message) => {
  try {
    // Показываем индикатор загрузки
    const loadingMsg = addMessage('status', 'Коуч печатает....');
    
    // Получаем выбранный стиль
    const selectedStyle = document.querySelector('input[name="style"]:checked')?.value || "Энерджайзер-Зажигалка";
    
    // Отправляем запрос
    const response = await fetch(getApiUrl(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: message,
        style: selectedStyle
      })
    });

    // Убираем индикатор загрузки
    loadingMsg.remove();

    // Обрабатываем ответ
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || `Ошибка сервера: ${response.status}`);
    }

    const data = await response.json();
    addMessage('ai', data.response);
    
  } catch (error) {
    console.error('Ошибка запроса:', error);
    addMessage('error', `Ошибка: ${error.message}`);
  }
};

// Инициализация чата
const initChat = () => {
  const chatForm = document.getElementById('chat-form');
  const userInput = document.getElementById('user-input');

  if (!chatForm || !userInput) {
    console.error('Не найдены необходимые элементы чата');
    return;
  }

  chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const message = userInput.value.trim();
    
    if (!message) {
      addMessage('error', 'Пожалуйста, введите сообщение');
      return;
    }
    
    addMessage('user', message);
    userInput.value = '';
    sendMessageToAI(message);
  });
};

// Запускаем чат после загрузки страницы
document.addEventListener('DOMContentLoaded', initChat);

// Экспортируем функции для тестирования (если нужно)
if (window.Cypress) {
  window.chatFunctions = {
    addMessage,
    sendMessageToAI,
    getApiUrl
  };
}