class Chat {
  constructor() {
    this.messages = [];
    this.hasSentGreeting = false;
  }

  async init(userData, skipGreeting = false) {
    this.userData = userData;
    this.userId = ApiService.getUserId();
    
    document.getElementById('chat-container').style.display = 'flex';
    this.setBackgroundImage(this.userData.coaching_style);
    
    const messagesDiv = document.getElementById('messages');
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

      await this.handleUserMessage(text, messagesDiv);
      input.value = '';
      button.disabled = true;
    };

    if (this.userData.last_messages && this.userData.last_messages.length > 0) {
      this.restoreChatHistory();
    } else if (!skipGreeting) {
      await this.sendGreetingMessage();
    }
  }

  async handleUserMessage(text, messagesDiv) {
    const userMsgDiv = document.createElement('div');
    userMsgDiv.className = 'chat-message user-message';
    userMsgDiv.textContent = text;
    messagesDiv.appendChild(userMsgDiv);
    
    const aiMsgDiv = document.createElement('div');
    aiMsgDiv.className = 'chat-message ai-message';
    aiMsgDiv.textContent = '...';
    messagesDiv.appendChild(aiMsgDiv);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;

    try {
      const reply = await this.getAIResponse(text);
      this.typeText(aiMsgDiv, reply);
      
      this.updateMessageHistory(text, reply);
      await ApiService.saveQuizData(this.userId, this.userData);
    } catch (error) {
      aiMsgDiv.textContent = 'Извините, произошла ошибка. Пожалуйста, попробуйте еще раз.';
      console.error('Ошибка при отправке сообщения:', error);
    }
  }

  async getAIResponse(text) {
  const isFirst = !this.hasSentGreeting;
  let prompt;
  
  if (isFirst) {
    prompt = Prompts.getGreetingPrompt(this.userData);
    this.hasSentGreeting = true;
  } else {
    const history = this.userData.last_messages || [];
    prompt = Prompts.getChatPrompt(this.userData, text, history);
  }
  
  return await ApiService.sendMessageToAI(prompt);
}

  updateMessageHistory(userText, aiText) {
  // Ограничиваем историю последними 15ю сообщениями 
  this.userData.last_messages = [
    ...(this.userData.last_messages || []), 
    { role: 'user', text: userText }, 
    { role: 'ai', text: aiText }
  ].slice(-4);
}

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
      aiMsgDiv.textContent = 'Привет! Давайте начнем наше путешествие в мир бега!';
      console.error('Ошибка при отправке приветствия:', error);
    }
  }

  restoreChatHistory() {
    const messagesDiv = document.getElementById('messages');
    messagesDiv.innerHTML = '';
    
    this.userData.last_messages.forEach(msg => {
      const msgDiv = document.createElement('div');
      msgDiv.className = `chat-message ${msg.role === 'user' ? 'user-message' : 'ai-message'}`;
      msgDiv.textContent = msg.text;
      messagesDiv.appendChild(msgDiv);
    });
    
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
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