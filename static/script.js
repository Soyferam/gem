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
    removeLoading(); // На всякий случай убираем предыдущий индикатор
    
    try {
      // Добавляем новый индикатор загрузки
      loadingMessage = addMessage('status', 'ИИ думает...');
      
      const response = await fetch(COLD_FLARE_URL, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          prompt: message,
          style: "Энерджайзер"
        })
      });

      removeLoading();

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const errorMsg = errorData?.error || `HTTP error ${response.status}`;
        throw new Error(errorMsg);
      }

      const data = await response.json();
      addMessage('ai', data.response);
    } catch (error) {
      removeLoading();
      console.error('Error:', error);
      addMessage('error', `Ошибка: ${error.message}`);
    }
  });
});