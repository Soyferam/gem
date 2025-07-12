class Quiz {
  constructor() {
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
        otherOption: true
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
        otherOption: true
      },
      { 
        key: 'coaching_style', 
        text: (name, data) => `Спасибо за честные ответы, ${name}! Это поможет AI-коучу тебя понимать. Последний вопрос: представь, что AI-коуч – это твой персональный мотиватор для бега. Какой стиль общения тебе ближе?`,
        type: 'custom-select',
        options: Object.keys(Config.coachingStyles)
      }
    ];
    
    this.currentStep = 0;
    this.quizData = {};
    this.selectedStyle = null;
  }

  async init() {
    this.userId = ApiService.getUserId();
    this.showStep(0);
  }

  showStep(i) {
    this.currentStep = i;
    const step = this.steps[i];
    const container = document.getElementById('quiz-container');
    
    const questionText = Prompts.getQuizStepPrompt(step, this.quizData.name, this.quizData);
    container.style.display = 'flex';
    container.innerHTML = `<h3 class="quiz-question">${questionText}</h3>`;
    
    let inputHtml = '';
    
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
        inputHtml = `
          <div class="style-select-container">
            <div class="style-buttons-container">
              ${step.options.map(style => `
                <div>
                  <div class="style-button-row">
                    <button class="style-button" data-style="${style}" onclick="quiz.selectStyle('${style}')">${style}</button>
                    <button class="style-info-button" onclick="quiz.showStyleTooltip('${style}')">i</button>
                  </div>
                  <div id="tooltip-${style}" class="style-tooltip">
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
    
    container.innerHTML += inputHtml + `<button class="quiz-button" id="next" ${step.type === 'checkbox' || step.type === 'custom-select' ? 'disabled' : ''}>Далее</button>`;
    
    const nextBtn = document.getElementById('next');
    const input = step.type === 'checkbox' ? null : document.getElementById('input');
    
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
      input.addEventListener('input', () => {
        nextBtn.disabled = input.value.trim() === '';
      });
      input.focus();
    }
    
    nextBtn.onclick = () => this.handleNextStep(step);
  }

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

  showStyleTooltip(style) {
    const tooltip = document.getElementById(`tooltip-${style}`);
    tooltip.style.display = tooltip.style.display === 'block' ? 'none' : 'block';
  }

  handleNextStep(step) {
    let val;
    
    if (step.type === 'checkbox') {
      const selected = Array.from(document.querySelectorAll('input[type="checkbox"]:checked'))
        .map(cb => cb.value);
      if (step.otherOption) {
        const otherVal = document.querySelector('#other-input')?.value.trim();
        if (otherVal) selected.push(otherVal);
      }
      val = selected.join(', ');
    } else if (step.type === 'custom-select') {
      val = this.selectedStyle;
      if (!val) return;
    } else {
      val = document.getElementById('input').value.trim();
    }
    
    if (!val && step.type !== 'checkbox') return;
    
    this.quizData[step.key] = val;
    
    if (this.currentStep + 1 < this.steps.length) {
      this.showStep(this.currentStep + 1);
    } else {
      this.finishQuiz();
    }
  }

  async finishQuiz() {
    document.getElementById('quiz-container').style.display = 'none';
    document.getElementById('loader').style.display = 'flex';
    
    try {
      this.quizData.last_messages = [];
      this.quizData.last_greet_ts = new Date().toISOString();
      this.quizData.signup_date = new Date().toISOString();
      
      await ApiService.saveQuizData(this.userId, this.quizData);
      
      document.getElementById('chat-container').style.display = 'flex';
      document.getElementById('loader').style.display = 'none';
      
      window.startChat(false, this.quizData);
    } catch (error) {
      console.error('Ошибка при завершении квиза:', error);
      document.getElementById('loader').textContent = 'Ошибка загрузки. Пожалуйста, попробуйте позже.';
    }
  }
}

window.quiz = new Quiz();