const quizSteps = [
  { key: 'name', text: 'Как тебя зовут?', type: 'text' },
  { key: 'running_frequency', text: 'Сколько раз в неделю хочешь бегать?', type: 'select', options: ['1', '2', '3', '4+'] },
  { key: 'coaching_style', text: 'Выбери стиль общения:', type: 'select', options: ['Железный Наставник', 'Энерджайзер-Зажигалка', 'Спокойный Мудрец', 'АБСОЛЮТНЫЙ ДОМИНАТОР'] }
];

let quizData = {};
let currentStep = 0;

const quizContainer = document.getElementById('quiz-container');
const chatContainer = document.getElementById('chat-container');

function showStep(i) {
  currentStep = i;
  const step = quizSteps[i];
  quizContainer.innerHTML = `<h3>${step.text}</h3>`;

  let inputHtml = '';
  if (step.type === 'text') {
    inputHtml = `<input id="input" type="text" required autofocus />`;
  } else if (step.type === 'select') {
    inputHtml = `<select id="input" required>
      ${step.options.map(o => `<option value="${o}">${o}</option>`).join('')}
    </select>`;
  }
  quizContainer.innerHTML += inputHtml;
  quizContainer.innerHTML += `<button id="next">Далее</button>`;

  document.getElementById('next').onclick = () => {
    const val = document.getElementById('input').value.trim();
    if (!val) {
      alert('Пожалуйста, введите значение');
      return;
    }
    quizData[step.key] = val;

    if (currentStep + 1 < quizSteps.length) {
      showStep(currentStep + 1);
    } else {
      finishQuiz();
    }
  };
}

async function finishQuiz() {
  // Сохраняем данные квиза
  await saveQuizData(quizData);

  // Скрываем квиз и показываем чат
  quizContainer.style.display = 'none';
  chatContainer.style.display = 'block';

  // Формируем приветственное сообщение от AI
  const prompt = `Ты — ${quizData.coaching_style}. Пользователь ${quizData.name} хочет бегать ${quizData.running_frequency} раз в неделю. Приветствуй и мотивируй коротко, по-русски.`;
  const reply = await sendMessageToAI(prompt);

  const messagesDiv = document.getElementById('messages');
  messagesDiv.innerHTML = `<div class="msg ai">${reply}</div>`;

  startChat();
}

// Экспортируем функции в глобальный объект, если нужно
window.showStep = showStep;
window.finishQuiz = finishQuiz;
