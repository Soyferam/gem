class Chat {
  constructor() {
    this.hasSentGreeting = false;
  }

  async init(userData, skipGreeting = false) {
    this.userData = userData || {};
    this.userId = ApiService.getUserId();
    
    document.getElementById('chat-container').style.display = 'flex';
    this.setBackgroundImage(this.userData.coaching_style);
    
    const messagesDiv = document.getElementById('messages');
    messagesDiv.innerHTML = '';
    
    // Восстановление истории
    if (this.userData.last_messages?.length > 0) {
      this.userData.last_messages.forEach(msg => {
        const msgDiv = document.createElement('div');
        msgDiv.className = `chat-message ${msg.role === 'user' ? 'user-message' : 'ai-message'}`;
        msgDiv.textContent = msg.text;
        messagesDiv.appendChild(msgDiv);
      });
      messagesDiv.scrollTop = messagesDiv.scrollHeight;
    } 
    else if (!skipGreeting) {
      await this.sendGreetingMessage();
    }

    this.setupChatForm();
  }

  setupChatForm() {
    const chatForm = document.getElementById('chat-form');
    const input = document.getElementById('user-input');
    const button = chatForm.querySelector('button');

    input.disabled = false;
    button.disabled = true;

    input.addEventListener('input', () => {
      button.disabled = input.value.trim() === '';
    });

    chatForm.onsubmit = async (e) => {
      e.preventDefault();
      const text = input.value.trim();
      if (!text) return;

      await this.handleUserMessage(text);
      input.value = '';
      button.disabled = true;
    };
  }

  async handleUserMessage(text) {
    const messagesDiv = document.getElementById('messages');
    
    // Сообщение пользователя
    const userMsgDiv = document.createElement('div');
    userMsgDiv.className = 'chat-message user-message';
    userMsgDiv.textContent = text;
    messagesDiv.appendChild(userMsgDiv);
    
    // Ответ бота
    const aiMsgDiv = document.createElement('div');
    aiMsgDiv.className = 'chat-message ai-message';
    aiMsgDiv.textContent = '...';
    messagesDiv.appendChild(aiMsgDiv);
    
    messagesDiv.scrollTop = messagesDiv.scrollHeight;

    try {
      const reply = await this.getAIResponse(text);
      this.typeText(aiMsgDiv, reply);
      
      // Обновляем историю
      this.userData.last_messages = [
        ...(this.userData.last_messages || []),
        { role: 'user', text },
        { role: 'ai', text: reply }
      ].slice(-50); // Ограничиваем историю
      
      await ApiService.saveQuizData(this.userId, this.userData);
    } catch (error) {
      console.error('Chat error:', error);
      aiMsgDiv.textContent = 'Произошла ошибка. Пожалуйста, попробуйте еще раз.';
    }
  }

  async getAIResponse(text) {
    const isFirst = !this.hasSentGreeting && (!this.userData.last_messages || this.userData.last_messages.length === 0);
    
    if (isFirst) {
      this.hasSentGreeting = true;
      return await ApiService.sendMessageToAI(
        Prompts.getGreetingPrompt(this.userData)
      );
    } else {
      return await ApiService.sendMessageToAI(
        Prompts.getChatPrompt(this.userData, text, this.userData.last_messages || [])
      );
    }
  }

  async sendGreetingMessage() {
    const messagesDiv = document.getElementById('messages');
    const aiMsgDiv = document.createElement('div');
    aiMsgDiv.className = 'chat-message ai-message';
    aiMsgDiv.textContent = '...';
    messagesDiv.appendChild(aiMsgDiv);
    
    messagesDiv.scrollTop = messagesDiv.scrollHeight;

    try {
      const reply = await this.getAIResponse('');
      this.typeText(aiMsgDiv, reply);
      
      this.userData.last_messages = [{ role: 'ai', text: reply }];
      await ApiService.saveQuizData(this.userId, this.userData);
    } catch (error) {
      console.error('Greeting error:', error);
      aiMsgDiv.textContent = 'Привет! Давайте начнем!';
    }
  }

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

  setBackgroundImage(style) {
    const url = Config.backgroundImages[style] || Config.backgroundImages.default;
    document.body.style.setProperty('--bg-url', `url(${url})`);
  }
}

window.chat = new Chat();
window.startChat = (skipGreeting = false, localQuizData = null) => {
  chat.init(localQuizData, skipGreeting);
};