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
    quizData[st.key] = st.key === 'dominant_style_consent' && quizData.coaching_style !== 'АБСОЛЮТНЫЙ ДОМИНАТОР' ? 'нет' : val;
    if (i + 1 < steps.length) showStep(i + 1);
    else finishQuiz();
  };
}

async function finishQuiz() {
  await saveQuizData(quizData);
  quizContainer.style.display = 'none';
  chatContainer.style.display = 'block';
  const style = quizData.coaching_style;
  const prompt = `Ты — ${style}. Пользователь только что прошёл квиз.\nИмя: ${quizData.name}. Хочет бегать ${quizData.running_frequency} раза(раз) в неделю.\nПриветствуй его и мотивируй в выбранном стиле. Используй только русский язык, избегай лишних символов и англицизмов.`;
  const reply = await sendMessageToAI(prompt);
  document.getElementById('messages').innerHTML += `<div class="msg ai">🤖 ${reply}</div>`;
}

window.showStep = showStep;
window.finishQuiz = finishQuiz;


// === chat.js ===
function startChat() {
  quizContainer.style.display = 'none';
  chatContainer.style.display = 'block';

  const messagesDiv = document.getElementById('messages');
  const form = document.getElementById('chat-form');
  const input = document.getElementById('user-input');

  form.onsubmit = async (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;

    messagesDiv.innerHTML += `<div class="msg user">👤 ${text}</div>`;
    input.value = '';

    const reply = await sendMessageToAI(text);
    messagesDiv.innerHTML += `<div class="msg ai">🤖 ${reply}</div>`;
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  };
}

window.startChat = startChat;