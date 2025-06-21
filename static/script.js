const COLD_FLARE_URL = "https://cold-credit-3c5d.arsivals.workers.dev/";

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('chat-form');
  const input = document.getElementById('user-input');
  const messages = document.getElementById('messages');

  const addMessage = (role, text) => {
    const div = document.createElement('div');
    div.className = `${role}-message`;
    div.textContent = text;
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const message = input.value.trim();
    if (!message) return;

    addMessage('user', message);
    input.value = '';

    try {
      // Показываем индикатор загрузки
      const loadingMsg = addMessage('status', 'ИИ думает...');
      
      const response = await fetch(COLD_FLARE_URL, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ 
          prompt: message,
          style: "Энерджайзер" // Можно добавить выбор стиля
        })
      });

      // Убираем индикатор загрузки
      messages.removeChild(loadingMsg);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      addMessage('ai', data.response);
    } catch (error) {
      console.error('Error:', error);
      addMessage('error', `Ошибка: ${error.message}`);
    }
  });
});