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
        text: (name) => `Очень приятно, ${name}! Сколько раз в неделю ты хочешь бегать?`,
        type: 'select', 
        options: [
          {value: '1 раз', text: '1 раз'},
          {value: '2 раза', text: '2 раза'},
          {value: '3 раза', text: '3 раза'},
          {value: '4+ раза', text: '4+ раза'}
        ],
        placeholder: 'Выбрать'
      },
      { 
        key: 'preferred_days', 
        text: (name, data) => `${name}, какие дни тебе удобны для бега? Можно выбрать несколько.`,
        type: 'checkbox',
        options: [
          'Понедельник',
          'Вторник',
          'Среда',
          'Четверг',
          'Пятница',
          'Суббота',
          'Воскресенье',
          'Любые дни'
        ]
      },
      { 
        key: 'primary_motivation', 
        text: (name, data) => `${name}, что тебя мотивирует бегать?`,
        type: 'checkbox',
        options: [
          'Улучшение здоровья',
          'Снижение веса',
          'Снятие стресса',
          'Улучшение формы',
          'Соревнование',
          'Другое'
        ],
        otherOption: true
      },
      { 
        key: 'coaching_style', 
        text: (name, data) => `${name}, выбери стиль общения:`,
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
    
    const questionText = typeof step.text === 'function' 
      ? step.text(this.quizData.name || '', this.quizData) 
      : step.text;
    
    container.style.display = 'flex';
    container.innerHTML = `<h3 class="quiz-question">${questionText}</h3>`;
    
    let inputHtml = '';
    
    if (step.type === 'text') {
      inputHtml = `<input class="quiz-input" id="input" required autofocus>`;
    } 
    else if (step.type === 'select') {
      inputHtml = `
        <select class="quiz-select" id="input" required>
          <option value="" disabled selected>${step.placeholder || 'Выбрать'}</option>
          ${step.options.map(o => 
            `<option value="${o.value}">${o.text}</option>`
          ).join('')}
        </select>
      `;
    }
    else if (step.type === 'checkbox') {
      inputHtml = `
        <div class="checkbox-group">
          ${step.options.map((option, idx) => `
            <div class="checkbox-item">
              <input type="checkbox" id="option-${idx}" value="${option}">
              <label for="option-${idx}">${option}</label>
            </div>
          `).join('')}
          ${step.otherOption ? `
            <input type="text" class="quiz-input" id="other-input" placeholder="Укажите свой вариант">
          ` : ''}
        </div>
      `;
    }
    else if (step.type === 'custom-select') {
      inputHtml = `
        <div class="style-select-container">
          <div class="style-buttons-container">
            ${step.options.map(style => `
              <div>
                <div class="style-button-row">
                  <button class="style-button" data-style="${style}">${style}</button>
                  <button class="style-info-button">i</button>
                </div>
                <div class="style-tooltip">${Config.coachingStyles[style]}</div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }
    
    container.innerHTML += inputHtml + `<button class="quiz-button" id="next" ${step.type === 'custom-select' || step.type === 'checkbox' ? 'disabled' : ''}>Далее</button>`;
    
    this.setupStepEvents(step);
  }

  setupStepEvents(step) {
    const nextBtn = document.getElementById('next');
    
    if (step.type === 'checkbox') {
      const checkboxes = document.querySelectorAll('input[type="checkbox"]');
      const otherInput = document.getElementById('other-input');
      
      const updateButton = () => {
        const anyChecked = Array.from(checkboxes).some(cb => cb.checked) || 
                         (otherInput && otherInput.value.trim() !== '');
        nextBtn.disabled = !anyChecked;
      };
      
      checkboxes.forEach(cb => cb.addEventListener('change', updateButton));
      if (otherInput) otherInput.addEventListener('input', updateButton);
    } 
    else if (step.type === 'custom-select') {
      const buttons = document.querySelectorAll('.style-button');
      const infoButtons = document.querySelectorAll('.style-info-button');
      
      buttons.forEach(btn => {
        btn.addEventListener('click', () => {
          document.querySelectorAll('.style-button').forEach(b => b.classList.remove('selected'));
          btn.classList.add('selected');
          this.selectedStyle = btn.dataset.style;
          nextBtn.disabled = false;
        });
      });
      
      infoButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const tooltip = btn.parentElement.nextElementSibling;
          tooltip.style.display = tooltip.style.display === 'block' ? 'none' : 'block';
        });
      });
    }
    else {
      const input = document.getElementById('input');
      input.addEventListener('input', () => {
        nextBtn.disabled = input.value.trim() === '';
      });
    }
    
    nextBtn.addEventListener('click', () => this.handleNextStep(step));
  }

  handleNextStep(step) {
    let value;
    
    if (step.type === 'checkbox') {
      const selected = Array.from(document.querySelectorAll('input[type="checkbox"]:checked'))
        .map(cb => cb.value);
      if (step.otherOption) {
        const otherVal = document.getElementById('other-input')?.value.trim();
        if (otherVal) selected.push(otherVal);
      }
      value = selected.join(', ');
    } 
    else if (step.type === 'custom-select') {
      value = this.selectedStyle;
    }
    else {
      value = document.getElementById('input').value.trim();
    }
    
    if (!value) return;
    
    this.quizData[step.key] = value;
    
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
      await ApiService.saveQuizData(this.userId, this.quizData);
      
      document.getElementById('chat-container').style.display = 'flex';
      document.getElementById('loader').style.display = 'none';
      
      window.startChat(false, this.quizData);
    } catch (error) {
      console.error('Finish quiz error:', error);
      document.getElementById('loader').textContent = 'Ошибка сохранения данных';
    }
  }
}

window.quiz = new Quiz();