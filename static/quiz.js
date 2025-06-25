document.addEventListener('DOMContentLoaded', async () => {
  const quizContainer = document.getElementById('quiz-container');
  const chatContainer = document.getElementById('chat-container');

  const existingData = await fetchUserData();

  if (existingData && existingData.exists !== false) {
    // Пользователь уже проходил квиз
    startChat();
    return;
  }

  // Отобразить квиз
  quizContainer.style.display = 'block';
  quizContainer.innerHTML = `
    <h2>Давай начнём!</h2>
    <form id="quiz-form">
      <label>Имя:</label>
      <input name="name" required>

      <label>Сколько раз в неделю хочешь бегать?</label>
      <select name="running_frequency" required>
        <option value="1">1 раз</option>
        <option value="2">2 раза</option>
        <option value="3">3 раза</option>
        <option value="4+">Больше 3 раз</option>
      </select>

      <label>Выбери стиль общения:</label>
      <select name="coaching_style" required>
        <option value="Железный Наставник">Железный Наставник</option>
        <option value="Энерджайзер-Зажигалка">Энерджайзер-Зажигалка</option>
        <option value="Спокойный Мудрец">Спокойный Мудрец</option>
        <option value="АБСОЛЮТНЫЙ ДОМИНАТОР">АБСОЛЮТНЫЙ ДОМИНАТОР</option>
      </select>

      <label>Подтверди, если выбрал ДОМИНАТОРА:</label>
      <select name="dominant_style_consent">
        <option value="нет">Нет</option>
        <option value="да">Да</option>
      </select>

      <button type="submit">Готово</button>
    </form>
  `;

  document.getElementById('quiz-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());

    await saveQuizData(data);
    quizContainer.style.display = 'none';
    startChat();
  });
});

function startChat() {
  document.getElementById('chat-container').style.display = 'block';
  initChat(); // вызывается из chat.js
}