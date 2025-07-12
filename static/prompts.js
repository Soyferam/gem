const Prompts = {
  // Формирует приветственное сообщение для AI на основе данных пользователя
  getGreetingPrompt: (userData) => {
    return `Ты — ${userData.coaching_style}.
Имя пользователя: ${userData.name}.
Он хочет бегать ${userData.running_frequency} в неделю. Мотивация: ${userData.primary_motivation}.

Поприветствуй его кратко. Ободри и сподвигни начать бег уже на этой неделе. Задай 1–2 вопроса, опираясь на его ответы (например: удобные дни — ${userData.preferred_days}).
Максимум 3–4 предложения. Без фраз «ты прошёл квиз». Без англицизмов и смайлов.`;
  },

  // Формирует подсказку для AI, учитывая профиль пользователя, историю диалога и последнее сообщение пользователя
  getChatPrompt: (userData, userMessage, isFirst = false) => {
    const profileText = `Профиль:
Имя: ${userData.name}
Бегает: ${userData.running_frequency}
Дни: ${userData.preferred_days}
Мотивация: ${userData.primary_motivation}
Триггеры: ${userData.overcome_triggers}
Стиль: ${userData.coaching_style}`;

    // Формируем диалог из истории и последнего сообщения
    const history = (userData.last_messages || []).concat([{ role: 'user', text: userMessage }]);
    let prompt = `${profileText}\n\nДиалог:\n`;

    history.forEach(m => {
      prompt += (m.role === 'user' ? 'Пользователь: ' : 'AI: ') + m.text + '\n';
    });

    if (isFirst) {
      // Особые инструкции для первого ответа от AI
      prompt += `Ответь от мужского имени. Не здоровайся. Поддержи ответ пользователя, прокомментируй и задай конкретный вопрос. 2–3 предложения.`;
    } else {
      // Инструкция для последующих сообщений — кратко, по делу, без приветствий
      prompt += `Ответь кратко. Без приветствий. Продолжай по делу — мотивация, следующий шаг, полезный совет. 2–4 предложения.`;
    }

    return prompt;
  },

  // Возвращает текст вопроса для шага квиза (может быть функцией или строкой)
  getQuizStepPrompt: (step, name, data) => {
    if (typeof step.text === 'function') {
      return step.text(name || '', data);
    }
    return step.text;
  }
};

// Делаем объект Prompts глобально доступным
window.Prompts = Prompts;
