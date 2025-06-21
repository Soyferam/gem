// Функция для добавления сообщений в чат
const addMessage = (role, text) => {
  const messages = document.getElementById('messages');
  const msgElement = document.createElement('div');
  
  // Определяем классы для разных типов сообщений
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
  
  // Возвращаем элемент для возможного удаления (для индикатора загрузки)
  return msgElement;
};

// Функция для отправки сообщения на сервер
const sendMessageToAI = async (message) => {
  try {
    // Добавляем индикатор загрузки
    const loadingIndicator = addMessage('status', 'Коуч печатает...');
    
    const response = await fetch('/api/gemini', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        prompt: message,
        style: "Энерджайзер-Зажигалка"
      })
    });
    
    // Удаляем индикатор загрузки
    loadingIndicator.remove();
    
    if (!response.ok) {
      throw new Error(`Ошибка сервера: ${response.status}`);
    }
    
    const data = await response.json();
    addMessage('ai', data.response);
  } catch (error) {
    console.error('Ошибка:', error);
    addMessage('error', `Ошибка: ${error.message}`);
  }
};

// Инициализация чата
const initChat = () => {
  const chatForm = document.getElementById('chat-form');
  const userInput = document.getElementById('user-input');
  
  if (!chatForm || !userInput) {
    console.error('Не найдены необходимые элементы DOM');
    return;
  }
  
  chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const message = userInput.value.trim();
    
    if (!message) return;
    
    addMessage('user', message);
    userInput.value = '';
    sendMessageToAI(message);
  });
};

// Запускаем чат после загрузки DOM
document.addEventListener('DOMContentLoaded', initChat);