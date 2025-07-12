const Prompts = {
  getGreetingPrompt: (userData) => {
    return `Ты — ${userData.coaching_style}. Пользователь только что прошёл квиз.
Имя: ${userData.name}. Хочет бегать ${userData.running_frequency} раза(раз) в неделю.
Приветствуй его и мотивируй в выбранном стиле. Используй только русский язык, избегай лишних символов и англицизмов.`;
  },

  getChatPrompt: (userData, userMessage, isFirst = false) => {
    const profileText = `Пользователь: ${userData.name}, бегает ${userData.running_frequency}, 
удобные дни: ${userData.preferred_days}, мотивация: ${userData.primary_motivation}, 
триггеры: ${userData.overcome_triggers}, стиль: ${userData.coaching_style}`;
    
    const history = (userData.last_messages || []).concat([{ role: 'user', text: userMessage }]);
    let prompt = `${profileText}\n\nИстория диалога:\n`;
    
    history.forEach(m => {
      prompt += (m.role === 'user' ? 'Пользователь: ' : 'AI: ') + m.text + '\n';
    });
    
    if (isFirst && !userData.hasSentGreeting) {
      prompt += `Ответь от мужского имени. Поздравь что он вместе с Duco AI. Задай полезные и воодушевляющие вопросы: 
когда планируешь начать бегать? где хочешь бегать (улица, стадион)? какие у тебя цели — вес, форма, дисциплина? 
Пиши дружелюбно, коротко (2-3 предложения).`;
    } else {
      prompt += 'Ответь кратко от мужского имени, понятно и с заботой. Не здоровайся. Предложи что-то. Раскрой его мысль. Не больше 3-4 предложений.';
    }
    
    return prompt;
  },

  getQuizStepPrompt: (step, name, data) => {
    if (typeof step.text === 'function') {
      return step.text(name || '', data);
    }
    return step.text;
  }
};

window.Prompts = Prompts;