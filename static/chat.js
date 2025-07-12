class Chat {
  constructor() {
    this.messages = [];          // Массив сообщений в текущей сессии
    this.hasSentGreeting = false; // Флаг, отправлено ли приветственное сообщение AI
  }

  // Инициализация чата с данными пользователя
  async init(userData, skipGreeting = false) {
    this.userData = userData;
    this.userId = ApiService.getUserId();

    // Показываем контейнер с чатом и устанавливаем фон в соответствии со стилем коуча
    document.getElementById('chat-container').style.display = 'flex';
    this.setBackgroundImage(this.userData.coaching_style);

    const messagesDiv = document.getElementById('messages');
    const chatForm = document.getElementById('chat-form');
    const input = document.getElementById('user-input');
    const button = chatForm.querySelector('button');

    input.disabled = false;      // Разрешаем ввод пользователю
    button.disabled = true;      // Кнопка отправки пока неактивна

    // Активируем кнопку отправки только при наличии текста в поле ввода
    input.addEventListener('input', () => {
      button.disabled = input.value.trim() === '';
    });

    // Обработка отправки формы (сообщения пользователя)
    chatForm.onsubmit = async (e) => {
      e.preventDefault();
      const text = input.value.trim();
      if (!text) return;

      await this.handleUserMessage(text, messagesDiv);
      input.value = '';          // Очищаем поле ввода после отправки
      button.disabled = true;    // Деактивируем кнопку
    };

    // Если есть сохранённая история сообщений — восстанавливаем её
    if (this.userData.last_messages && this.userData.last_messages.length > 0) {
      this.restoreChatHistory();
    } else if (!skipGreeting) {
      // Иначе отправляем приветственное сообщение от AI
      await this.sendGreetingMessage();
    }
  }

  // Обработка нового сообщения от пользователя
  async handleUserMessage(text, messagesDiv) {
    // Добавляем сообщение пользователя в чат
    const userMsgDiv = document.createElement('div');
    userMsgDiv.className = 'chat-message user-message';
    userMsgDiv.textContent = text;
    messagesDiv.appendChild(userMsgDiv);

    // Создаём контейнер для ответа AI с временным текстом "..."
    const aiMsgDiv = document.createElement('div');
    aiMsgDiv.className = 'chat-message ai-message';
    aiMsgDiv.textContent = '...';
    messagesDiv.appendChild(aiMsgDiv);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;

    try {
      // Получаем ответ от AI
      const reply = await this.getAIResponse(text);

      // Постепенно выводим текст ответа в чат (эффект печати)
      this.typeText(aiMsgDiv, reply);

      // Обновляем историю сообщений в данных пользователя
      this.updateMessageHistory(text, reply);

      // Сохраняем обновлённые данные пользователя с историей в API
      await ApiService.saveQuizData(this.userId, this.userData);
    } catch (error) {
      // При ошибке показываем сообщение об ошибке
      aiMsgDiv.textContent = 'Извините, произошла ошибка. Пожалуйста, попробуйте еще раз.';
      console.error('Ошибка при отправке сообщения:', error);
    }
  }

  // Формируем и отправляем запрос к AI с учётом профиля пользователя и истории диалога
  async getAIResponse(text) {
    const isFirst = !this.hasSentGreeting;
    const prompt = Prompts.getChatPrompt(this.userData, text, isFirst);
    this.hasSentGreeting = true;
    return await ApiService.sendMessageToAI(prompt);
  }

  // Обновляем историю сообщений пользователя (максимум 15 последних сообщений)
  updateMessageHistory(userText, aiText) {
    this.userData.last_messages = [
      ...(this.userData.last_messages || []),
      { role: 'user', text: userText },
      { role: 'ai', text: aiText }
    ].slice(-15);
  }

  // Отправка приветственного сообщения от AI при старте чата
  async sendGreetingMessage() {
    const messagesDiv = document.getElementById('messages');
    const aiMsgDiv = document.createElement('div');
    aiMsgDiv.className = 'chat-message ai-message';
    aiMsgDiv.textContent = '...';
    messagesDiv.appendChild(aiMsgDiv);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;

    try {
      const reply = await ApiService.sendMessageToAI(
        Prompts.getGreetingPrompt(this.userData)
      );

      this.typeText(aiMsgDiv, reply);
      this.userData.last_messages = [{ role: 'ai', text: reply }];
      await ApiService.saveQuizData(this.userId, this.userData);
    } catch (error) {
      // При ошибке отправляем дефолтное приветствие
      aiMsgDiv.textContent = 'Привет! Давайте начнем наше путешествие в мир бега!';
      console.error('Ошибка при отправке приветствия:', error);
    }
  }

  // Восстановление истории чата из сохранённых сообщений
  restoreChatHistory() {
    const messagesDiv = document.getElementById('messages');
    messagesDiv.innerHTML = '';

    (this.userData.last_messages || []).forEach(msg => {
      const msgDiv = document.createElement('div');
      msgDiv.className = `chat-message ${msg.role === 'user' ? 'user-message' : 'ai-message'}`;
      msgDiv.textContent = msg.text;
      messagesDiv.appendChild(msgDiv);
    });

    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  }

  // Эффект печати текста по символам с заданной скоростью
  typeText(el, text, speed = 20) {
    let i = 0;
    el.textContent = '';
    const interval = setInterval(() => {
      if (i < text.length) {
        el.textContent += text[i];
        el.parentElement.scrollTop = el.parentElement.scrollHeight;
        i++;
      } else {
        clearInterval(interval);
      }
    }, speed);
  }

  // Устанавливаем фон в зависимости от выбранного стиля коуча
  setBackgroundImage(style) {
    const url = Config.backgroundImages[style] || Config.backgroundImages.default;
    document.body.style.setProperty('--bg-url', `url(${url})`);
  }
}

// Экспортируем экземпляр чата в глобальную область
window.chat = new Chat();

// Функция для запуска чата с возможностью пропуска приветствия и передачи локальных данных
window.startChat = (skipGreeting = false, localQuizData = null) => {
  chat.init(localQuizData, skipGreeting);
};
