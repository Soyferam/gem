const steps = [
  { key: 'name', text: 'Как тебя зовут?', type: 'text' },
  { key: 'running_frequency', text: 'Сколько раз в неделю хочешь бегать?', type: 'select', options: ['1', '2', '3', '4+'] },
  { key: 'coaching_style', text: 'Выбери стиль общения:', type: 'select', options: ['Железный Наставник', 'Энерджайзер-Зажигалка', 'Спокойный Мудрец', 'АБСОЛЮТНЫЙ ДОМИНАТОР'] },
  { key: 'dominant_style_consent', text: 'Подтверждаешь "ДОМИНАТОРА"?', type: 'select', options: ['нет', 'да'] }
];

let quizData = {};

function showStep(i) {
  const st = steps[i];
  quizContainer.innerHTML = `<h3>${st.text}</h3>`;
  let inputHtml = st.type === 'text'
    ? `<input id="input" required>`
    : `<select id="input">${st.options.map(o => `<option value="${o}">${o}</option>`).join('')}</select>`;
  quizContainer.innerHTML += inputHtml + `<button id="next">Далее</button>`;
  document.getElementById('next').onclick = () => {
    const val = document.getElementById('input').value.trim();
    if (!val) return;
    quizData[st.key] = st.type === 'select' && st.key === 'dominant_style_consent' && quizData.coaching_style !== 'АБСОЛЮТНЫЙ ДОМИНАТОР' ? 'нет' : val;
    if (i + 1 < steps.length) showStep(i + 1);
    else finishQuiz();
  };
}

async function finishQuiz() {
  await saveQuizData(quizData);
  quizContainer.style.display = 'none';
  startChat(); // будет глобально доступна
}