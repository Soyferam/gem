import { startQuiz } from './quiz.js';
import { startChat } from './chat.js';

const SHEETS_API = "https://script.google.com/macros/s/AKfycbzj-2-t4uuy0mrkisVNzyNS9PWnd7epZkVC4FYonslewl1JWXE57O6D8G8optnMQsoP/exec";

window.addEventListener('DOMContentLoaded', async () => {
  const tg = window.Telegram?.WebApp;
  if (!tg || !tg.initDataUnsafe?.user?.id) {
    alert("Ошибка: Telegram Mini App не инициализировался");
    return;
  }

  tg.expand(); // Разворачиваем WebApp
  const userId = tg.initDataUnsafe.user.id.toString();

  try {
    const res = await fetch(`${SHEETS_API}?user_id=${userId}`);
    const data = await res.json();

    if (data.exists === false) {
      console.log("Новый пользователь. Запуск квиза.");
      document.getElementById("quiz-container").style.display = "block";
      startQuiz(userId);
    } else {
      console.log("Пользователь найден. Запуск чата.");
      document.getElementById("chat-container").style.display = "block";
      startChat(data);
    }
  } catch (err) {
    console.error("Ошибка при обращении к Google Sheets API:", err);
    alert("Ошибка загрузки. Попробуйте позже.");
  }
});
