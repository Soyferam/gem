// Конфигурация API (ЗАМЕНИТЕ 'gem-orpin-beta' на имя вашего проекта Vercel)
const API_CONFIG = {
  local: 'http://localhost:3000/api/gemini',
  production: 'https://your-project-name.vercel.app/api/gemini' // ← Замените на ваш домен!
};

// Определяем текущий URL API
const getApiUrl = () => {
  // Проверяем локальное окружение
  const isLocalDevelopment = 
    window.location.hostname === 'localhost' || 
    window.location.hostname === '127.0.0.1' ||
    window.location.port === '3000';
  
  return isLocalDevelopment ? API_CONFIG.local : API_CONFIG.production;
};

// Улучшенная функция добавления сообщений
const addMessage = (role, text) => {
  const messages = document.getElementById('messages');
  if (!messages) {
    console.error('Элемент messages не найден');
    return null;
  }

  const msgElement = document.createElement('div');
  msgElement.className = `message ${role}-message`;
  msgElement.textContent = text;
  messages.appendChild(msgElement);
  
  // Плавная прокрутка к новому сообщению
  setTimeout(() => {
    messages.scrollTop = messages.scrollHeight;
  }, 10);
  
  return msgElement;
};

// Улучшенная функция отправки сообщения с обработкой ошибок
const sendMessageToAI = async (message) => {
  let loadingMsg = null;
  
  try {
    // Показываем индикатор загрузки
    loadingMsg = addMessage('status', 'Коуч печатает...');
    const apiUrl = getApiUrl();
    
    console.log('[DEBUG] Отправка запроса к:', apiUrl);
    console.log('[DEBUG] Отправляемые данные:', {
      prompt: message,
      style: document.querySelector('input[name="style"]:checked')?.value || "Энерджайзер-Зажигалка"
    });

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

    console.log('[DEBUG] Ответ сервера:', response);

    if (!response.ok) {
      // Пытаемся получить JSON с ошибкой или текст
      const errorData = await response.json().catch(async () => ({
        error: await response.text() || `HTTP error ${response.status}`
      }));
      throw new Error(errorData.error || 'Неизвестная ошибка сервера');
    }

    const data = await response.json();
    console.log('[DEBUG] Данные ответа:', data);
    
    addMessage('ai', data.response);
  } catch (error) {
    console.error('[ERROR] Ошибка запроса:', error);
    
    // Форматируем сообщение об ошибке
    let errorMessage = error.message;
    try {
      const errorObj = JSON.parse(error.message);
      errorMessage = errorObj.error || error.message;
    } catch (e) {}
    
    addMessage('error', `Ошибка: ${errorMessage}`);
  } finally {
    // Убираем индикатор загрузки, если он был создан
    if (loadingMsg && loadingMsg.parentNode) {
      loadingMsg.remove();
    }
  }
};

// Инициализация чата с защитой от ошибок
const initChat = () => {
  try {
    const chatForm = document.getElementById('chat-form');
    const userInput = document.getElementById('user-input');

    if (!chatForm || !userInput) {
      throw new Error('Не найдены необходимые элементы формы');
    }

    chatForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const message = userInput.value.trim();
      
      if (!message) {
        addMessage('error', 'Пожалуйста, введите сообщение');
        return;
      }
      
      addMessage('user', message);
      userInput.value = '';
      await sendMessageToAI(message);
    });

    console.log('[DEBUG] Чат успешно инициализирован');
  } catch (error) {
    console.error('[ERROR] Ошибка инициализации чата:', error);
    alert('Произошла ошибка при загрузке чата. Пожалуйста, обновите страницу.');
  }
};

// Запускаем чат после полной загрузки DOM
document.addEventListener('DOMContentLoaded', initChat);