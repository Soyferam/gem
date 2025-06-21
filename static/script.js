const COLD_FLARE_URL = "https://cold-credit-3c5d.arsivals.workers.dev/";

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('chat-form');
  const input = document.getElementById('user-input');
  const messages = document.getElementById('messages');
  let loadingMessage = null;

  const addMessage = (role, text) => {
    const div = document.createElement('div');
    div.className = `${role}-message`;
    div.textContent = text;
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
    return div;
  };

  const removeLoading = () => {
    if (loadingMessage && loadingMessage.parentNode) {
      messages.removeChild(loadingMessage);
    }
    loadingMessage = null;
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const message = input.value.trim();
    if (!message) return;

    addMessage('user', message);
    input.value = '';
    removeLoading();
    loadingMessage = addMessage('status', 'ИИ думает...');

    try {
      // Новый формат запроса, соответствующий API
      const response = await fetch(COLD_FLARE_URL, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: message
            }]
          }]
        })
      });

      removeLoading();

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Ошибка сервера');
      }

      const data = await response.json();
      
      // Обрабатываем разные форматы ответа
      const aiResponse = data.response?.text() || 
                        data.candidates?.[0]?.content?.parts?.[0]?.text ||
                        data.text ||
                        "Не удалось получить ответ";
      
      addMessage('ai', aiResponse);
    } catch (error) {
      removeLoading();
      console.error('Error:', error);
      addMessage('error', `Ошибка: ${error.message}`);
    }
  });
});