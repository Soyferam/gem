const Prompts = {
  getGreetingPrompt: (userData) => {
    return `Ты — ${userData.coaching_style}.
Имя пользователя: ${userData.name}.
Он хочет бегать ${userData.running_frequency} раза(раз) в неделю.
Он только присоединился к команде Duco AI.

Приветствуй его в выбранном стиле. Задай 2–3 полезных, конкретных вопроса:
— когда он планирует первую пробежку?
— где хочет бегать (улица, стадион)?
— какие цели перед собой ставит (форма, вес, дисциплина)?

Пиши кратко, без смайликов, строго на русском, дружелюбным тоном. Не используй англицизмы. Избегай фраз вроде "ты прошёл квиз".`;
  },

  getChatPrompt: (userData, userMessage, isFirst = false) => {
    const profileText = `Профиль пользователя:
Имя: ${userData.name}
Частота пробежек: ${userData.running_frequency}
Удобные дни: ${userData.preferred_days}
Мотивация: ${userData.primary_motivation}
Триггеры преодоления: ${userData.overcome_triggers}
Стиль общения коуча: ${userData.coaching_style}`;

    const history = (userData.last_messages || []).concat([{ role: 'user', text: userMessage }]);
    let prompt = `${profileText}\n\nИстория диалога:\n`;

    history.forEach(m => {
      prompt += (m.role === 'user' ? 'Пользователь: ' : 'AI: ') + m.text + '\n';
    });

    if (isFirst) {
      prompt += `Ответь от мужского имени. Не повторяй приветствие. Продолжай диалог по делу — прокомментируй его ответ и задай уточняющий вопрос. Не более 3 предложений. Без формального "привет", "здравствуй".`;
    } else {
      prompt += `Ответь кратко от мужского имени. Без приветствий. Поддержи, предложи следующее действие или углубись в его мотивацию. Максимум 3–4 предложения.`;
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
