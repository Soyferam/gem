async function initChat() {
  const form = document.getElementById('chat-form');
  const input = document.getElementById('user-input');
  const messages = document.getElementById('messages');

  const addMessage = (role, text) => {
    const div = document.createElement('div');
    div.className = `${role}-message`;
    div.innerHTML = text.replace(/\n/g, '<br>');
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
  };

  // Приветственное сообщение от AI
  const userData = await fetchUserData();
  const name = userData?.name || 'друг';
  const style = userData?.coaching_style || '';
  const motivation = userData?.primary_motivation || '';
  const prompt = `Ты — AI-коуч в стиле "${style}". Пользователь ${name} хочет бегать. Его мотивация: ${motivation}. Помоги ему начать с первого совета.`;

  const aiGreeting = await sendMessageToAI(prompt);
  addMessage('ai', aiGreeting);

  // Обработка сообщений
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const message = input.value.trim();
    if (!message) return;
    addMessage('user', message);
    input.value = '';

    const aiResponse = await sendMessageToAI(message);
    addMessage('ai', aiResponse);
  });
}