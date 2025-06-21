const COLD_FLARE_URL = "https://cold-credit-3c5d.arsivals.workers.dev/";

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('chat-form');
  const input = document.getElementById('user-input');
  const messages = document.getElementById('messages');
  let loadingMessage = null;

  // Функция добавления сообщения в чат
  const addMessage = (role, text) => {
    const div = document.createElement('div');
    div.className = `${role}-message`;
    div.textContent = text;
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
    return div;
  };

  // Функция удаления индикатора загрузки
  const removeLoading = () => {
    if (loadingMessage && loadingMessage.parentNode) {
      messages.removeChild(loadingMessage);
    }
    loadingMessage = null;
  };

  // Обработчик отправки формы
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
      console.log("Отправка запроса:", message);
      
      // Отправляем запрос к Coldflare Worker
      const response = await fetch(COLD_FLARE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          prompt: message,
          style: "Энерджайзер"
        })
      });

      console.log("Получен ответ:", response);

      // Убираем индикатор загрузки
      removeLoading();

      // Обрабатываем ответ
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Текст ошибки:", errorText);
        throw new Error(errorText || `HTTP error ${response.status}`);
      }

      const data = await response.json();
      console.log("Данные ответа:", data);
      
      if (data.error) {
        throw new Error(data.error);
      }

      // Добавляем ответ ИИ
      addMessage('ai', data.response || data.message || "Получен пустой ответ");

    } catch (error) {
      removeLoading();
      console.error("Полная ошибка:", error);
      
      // Пытаемся извлечь понятное сообщение об ошибке
      let errorMsg = "Неизвестная ошибка";
      try {
        if (error.message) {
          const errorObj = JSON.parse(error.message);
          errorMsg = errorObj.error || error.message;
        }
      } catch (e) {
        errorMsg = error.message || "Ошибка при обработке запроса";
      }
      
      addMessage('error', `Ошибка: ${errorMsg}`);
    }
  });
});