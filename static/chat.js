function startChat() {
  quizContainer.style.display = 'none';
  chatContainer.style.display = 'block';

  const messagesDiv = document.getElementById('messages');
  const form = document.getElementById('chat-form');
  const input = document.getElementById('user-input');

  form.onsubmit = async (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;

    // Показать сообщение пользователя
    messagesDiv.innerHTML += `<div class="msg user">👤 ${text}</div>`;
    input.value = '';

    // Ответ от AI
    const reply = await sendMessageToAI(text);
    messagesDiv.innerHTML += `<div class="msg ai">🤖 ${reply}</div>`;
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  };
}

window.startChat = startChat;

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', async () => {
  window.quizContainer = document.getElementById('quiz-container');
  window.chatContainer = document.getElementById('chat-container');
  const u = await fetchUserData();
  if (u?.success && u.data.exists) return startChat();
  quizContainer.style.display = 'block';
  showStep(0); // showStep из quiz.js
});