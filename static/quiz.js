class Quiz {
  constructor() {
    // Определяем шаги квиза — вопросы, типы ответов и варианты выбора
    this.steps = [
      { 
        key: 'name', 
        text: 'Привет! Давай знакомиться 😊 Как я могу к тебе обращаться?', 
        type: 'text' 
      },
      { 
        key: 'running_frequency', 
        text: (name) => `Очень приятно, ${name}! Рад, что ты здесь, чтобы сделать бег частью своей жизни. Скажи, пожалуйста, сколько раз в неделю ты стремишься или хотела бы выходить на пробежку?`,
        type: 'select', 
        options: [
          {value: '1 раз', text: '1 раз'},
          {value: '2 раза', text: '2 раза'},
          {value: '3 раза', text: '3 раза'},
          {value: 'Больше 3 раз', text: 'Больше 3 раз'},
          {value: 'Пока не определился/лась', text: 'Пока не определился/лась'}
        ],
        placeholder: 'Выбрать'
      },
      { 
        key: 'preferred_days', 
        text: (name, data) => `Понял, ${name}! ${data.running_frequency} – отличное начало или продолжение! А есть ли дни недели, которые тебе обычно удобнее всего для бега? Можешь выбрать несколько.`,
        type: 'checkbox',
        options: [
          'Понедельник',
          'Вторник',
          'Среда',
          'Четверг',
          'Пятница',
          'Суббота',
          'Воскресенье',
          'Любые дни, по настроению'
        ]
      },
      { 
        key: 'primary_motivation', 
        text: (name, data) => `${name}, теперь немного о твоей мотивации. Что для тебя главное, когда ты думаешь о беге? Что тебя вдохновляет или какую цель преследуешь?`,
        type: 'checkbox',
        options: [
          'Почувствовать прилив энергии и бодрости',
          'Снять стресс и разгрузить голову',
          'Поддерживать или улучшить физическую форму',
          'Контролировать или сбросить вес',
          'Просто побыть на свежем воздухе и подвигаться',
          'Улучшить выносливость'
        ],
        otherOption: true // Разрешаем добавить свой вариант
      },
      { 
        key: 'overcome_triggers', 
        text: (name, data) => `Это знакомые многим трудности! А когда ты сталкиваешься с таким препятствием (например, усталостью или ленью), есть ли что-то, что обычно помогает тебе все-таки собраться и побежать? Твои личные "лайфхаки"?`,
        type: 'checkbox',
        options: [
          'Включить любимую энергичную музыку',
          'Подумать о приятном чувстве после пробежки',
          'Данное себе обещание или цель',
          'Просто начать, не думая, а там втянусь',
          'Договоренность с кем-то или поддержка близких'
        ],
        otherOption: true // Можно добавить свой способ
      },
      { 
        key: 'coaching_style', 
        text: (name, data) => `Спасибо за честные ответы, ${name}! Это поможет AI-коучу тебя понимать. Последний вопрос: представь, что AI-коуч – это твой персональный мотиватор для бега. Какой стиль общения тебе ближе?`,
        type: 'custom-select',
        options: Object.keys(Config.coachingStyles) // Варианты стилей из конфига
      }
    ];
    
    this.currentStep = 0;   // Индекс текущего шага квиза
    this.quizData = {};     // Собранные ответы пользователя
    this.selectedStyle = null; // Выбранный стиль коуча (для кастомного селекта)
  }

  // Запуск квиза — получаем userId и показываем первый вопрос
  async init() {
    this.userId = ApiService.getUserId();
    this.showStep(0);
  }

  // Отображение вопроса по индексу шага
  showStep(i) {
    this.currentStep = i;
    const step = this.steps[i];
    const container = document.getElementById('quiz-container');
    
    // Получаем текст вопроса (строка или функция)
    const questionText = Prompts.getQuizStepPrompt(step, this.quizData.name, this.quizData);
    container.style.display = 'flex';
    container.innerHTML = `<h3 class="quiz-question">${questionText}</h3>`;
    
    let inputHtml = '';
    
    // Генерируем HTML для поля ввода в зависимости от типа вопроса
    switch(step.type) {
      case 'text':
        inputHtml = `<input class="quiz-input" id="input" required />`;
        break;
      case 'select':
        inputHtml = `
          <select class="quiz-select" id="input" required>
            <option value="" disabled selected>${step.placeholder || 'Выбрать'}</option>
            ${step.options.map(o => 
              `<option value="${o.value}">${o.text || o}</option>`
            ).join('')}
          </select>
        `;
        break;
      case 'checkbox':
        inputHtml = `
          <div class="checkbox-group">
            ${step.options.map((option, idx) => `
              <div class="checkbox-item">
                <input type="checkbox" id="option-${idx}" value="${option}">
                <label for="option-${idx}">${option}</label>
              </div>
            `).join('')}
            ${step.otherOption ? `
              <div style="margin-top: 10px;">
                <input type="text" class="quiz-input" id="other-input" placeholder="Другое (напишите свой вариант)" style="width: 100%; padding: 10px; box-sizing: border-box;">
              </div>
            ` : ''}
          </div>
        `;
        break;
      case 'custom-select':
        // Для выбора стиля — кнопки с подсказками
        inputHtml = `
          <div class="style-select-container">
            <div class="style-buttons-container">
              ${step.options.map(style => `
                <div>
                  <div class="style-button-row">
                    <button class="style-button" data-style="${style}" onclick="quiz.selectStyle('${style}')">${style}</button>
                    <button class="style-info-button" onclick="quiz.showStyleTooltip('${style}')">i</button>
                  </div>
                  <div id="tooltip-${style}" class="style-tooltip" style="display:none;">
                    ${Config.coachingStyles[style]}
                  </div>
                </div>
              `).join('')}
            </div>
            <input type="hidden" id="style-input" value="">
          </div>
        `;
        break;
    }
    
    // Добавляем кнопку "Далее", у checkbox и custom-select по умолчанию она отключена
    container.innerHTML += inputHtml + `<button class="quiz-button" id="next" ${step.type === 'checkbox' || step.type === 'custom-select' ? 'disabled' : ''}>Далее</button>`;
    
    const nextBtn = document.getElementById('next');
    const input = step.type === 'checkbox' ? null : document.getElementById('input');
    
    // Для checkbox: активируем кнопку, если выбран хоть один чекбокс или введён другой вариант
    if (step.type === 'checkbox') {
      const checkboxes = container.querySelectorAll('input[type="checkbox"]');
      const otherInput = container.querySelector('#other-input');
      
      const updateNextBtn = () => {
        const anyChecked = Array.from(checkboxes).some(cb => cb.checked) || 
                         (otherInput && otherInput.value.trim() !== '');
        nextBtn.disabled = !anyChecked;
      };
      
      checkboxes.forEach(cb => {
        cb.addEventListener('change', updateNextBtn);
      });
      
      if (otherInput) {
        otherInput.addEventListener('input', updateNextBtn);
      }
    } else if (input) {
      // Для текстовых и select полей — кнопка активна только если есть текст/выбор
      input.addEventListener('input', () => {
        nextBtn.disabled = input.value.trim() === '';
      });
      input.focus();
    }
    
    // Обработчик клика на кнопку "Далее"
    nextBtn.onclick = () => this.handleNextStep(step);
  }

  // Обработка выбора стиля коуча (custom-select)
  selectStyle(style) {
    if (this.selectedStyle) {
      const prevButton = document.querySelector(`.style-button[data-style="${this.selectedStyle}"]`);
      if (prevButton) prevButton.classList.remove('selected');
    }
    
    this.selectedStyle = style;
    const selectedButton = document.querySelector(`.style-button[data-style="${style}"]`);
    if (selectedButton) selectedButton.classList.add('selected');
    
    document.getElementById('next').disabled = false;
  }

  // Показать или скрыть подсказку по стилю
  showStyleTooltip(style) {
    const tooltip = document.getElementById(`tooltip-${style}`);
    tooltip.style.display = tooltip.style.display === 'block' ? 'none' : 'block';
  }

  // Обработка перехода к следующему шагу после нажатия "Далее"
  handleNextStep(step) {
    let val;
    
    if (step.type === 'checkbox') {
      // Для чекбоксов собираем все выбранные значения + доп. поле, если есть
      const selected = Array.from(document.querySelectorAll('input[type="checkbox"]:checked'))
        .map(cb => cb.value);
      if (step.otherOption) {
        const otherVal = document.querySelector('#other-input')?.value.trim();
        if (otherVal) selected.push(otherVal);
      }
      val = selected.join(', ');
    } else if (step.type === 'custom-select') {
      // Для выбора стиля используем selectedStyle
      val = this.selectedStyle;
      if (!val) return; // Если стиль не выбран — не идем дальше
    } else {
      // Для остальных — просто берем значение из input
      val = document.getElementById('input').value.trim();
    }
    
    if (!val && step.type !== 'checkbox') return; // Без значения нельзя идти дальше
    
    this.quizData[step.key] = val; // Сохраняем ответ
    
    if (this.currentStep + 1 < this.steps.length) {
      this.showStep(this.currentStep + 1); // Показать следующий шаг
    } else {
      this.finishQuiz(); // Все шаги пройдены — заканчиваем квиз
    }
  }

  // Финализация квиза — сохраняем данные и запускаем чат
  async finishQuiz() {
    document.getElementById('quiz-container').style.display = 'none';
    document.getElementById('loader').style.display = 'flex';
    
    try {
      // Добавляем служебные поля в данные
      this.quizData.last_messages = [];
      this.quizData.last_greet_ts = new Date().toISOString();
      this.quizData.signup_date = new Date().toISOString();
      
      // Сохраняем на сервере через API
      await ApiService.saveQuizData(this.userId, this.quizData);
      
      // Скрываем загрузку и показываем чат
      document.getElementById('chat-container').style.display = 'flex';
      document.getElementById('loader').style.display = 'none';
      
      // Запускаем чат с новыми данными
      window.startChat(false, this.quizData);
    } catch (error) {
      console.error('Ошибка при завершении квиза:', error);
      document.getElementById('loader').textContent = 'Ошибка загрузки. Пожалуйста, попробуйте позже.';
    }
  }
}

// Экспортируем экземпляр квиза в глобальную область видимости
window.quiz = new Quiz();
