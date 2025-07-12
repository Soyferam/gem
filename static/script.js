// Функция проверки, прошёл ли пользователь квиз, по userId
async function checkUserQuiz(userId) {
  try {
    // Запрос к Google Apps Script API, который проверяет наличие данных пользователя
    const response = await fetch(`https://script.google.com/macros/s/AKfycb.../exec?user_id=${userId}`);
    const data = await response.json();
    // Возвращаем данные, если пользователь существует, иначе false
    return data.exists ? data : false;
  } catch (error) {
    console.error('Error checking user:', error);
    return false; // При ошибке тоже возвращаем false
  }
}

// Функция инициализации приложения при загрузке страницы
async function initApp() {
  // Получаем userId из Telegram WebApp (или ставим тестового пользователя)
  const userId = window.Telegram.WebApp.initDataUnsafe.user?.id || 'test_user';
  
  // Проверяем, есть ли у пользователя данные квиза
  const userData = await checkUserQuiz(userId);
  
  if (!userData) {
    // Если данных нет — показываем квиз (реализация showQuiz не в этом файле)
    const quiz = new Quiz(userId);
    showQuiz(quiz);
  } else {
    // Если данные есть — показываем чат и отправляем первое сообщение AI
    showChat();
    sendFirstAIMessage(userData);
  }
}

// Отправка первого приветственного сообщения AI после прохождения квиза
function sendFirstAIMessage(userData) {
  // Формируем промпт для AI на основе данных пользователя
  const prompt = `Ты — ${userData.coaching_style}. Пользователь только что завершил квиз. 
  Его имя: ${userData.name}. Он хочет бегать ${userData.running_frequency} в неделю. 
  Его мотивация: ${userData.primary_motivation}. 
  Приветствуй его и дай первую мотивацию согласно выбранному стилю.`;

}
