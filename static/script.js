const API_URL = "https://cold-credit-3c5d.arsivals.workers.dev/";

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('chat-form');
  const input = document.getElementById('user-input');
  const messages = document.getElementById('messages');
  let loadingMessage = null;

  // Функция добавления сообщения
  const addMessage = (role, text) => {
    const div = document.createElement('div');
    div.className = `${role}-message`;
    
    // Сохраняем переносы строк
    div.innerHTML = text.replace(/\n/g, '<br>');
    
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
    return div;
  };

  // Удаление индикатора загрузки
  const removeLoading = () => {
    if (loadingMessage && loadingMessage.parentNode) {
      messages.removeChild(loadingMessage);
      loadingMessage = null;
    }
  };

  // Обработчик формы
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const message = input.value.trim();
    if (!message) return;

    // Добавляем сообщение пользователя
    addMessage('user', message);
    input.value = '';
    
    // Показываем индикатор загрузки
    removeLoading();
    loadingMessage = addMessage('status', 'ИИ думает...');

    try {
      // Отправляем запрос в Coldflare Worker
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt: message // Именно "prompt" ожидает Worker
        })
      });

      // Убираем индикатор загрузки
      removeLoading();

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Ошибка сервера');
      }

      // Получаем и отображаем ответ
      const data = await response.json();
      addMessage('ai', data.response);

    } catch (error) {
      removeLoading();
      console.error('Ошибка:', error);
      
      // Пытаемся извлечь понятное сообщение об ошибке
      let errorText = 'Ошибка соединения';
      try {
        if (error.message) {
          const errorObj = JSON.parse(error.message);
          errorText = errorObj.error || error.message;
        }
      } catch (e) {
        errorText = error.message;
      }
      
      addMessage('error', errorText);
    }
  });
});