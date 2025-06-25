// Проверяем, прошел ли пользователь квиз
async function checkUserQuiz(userId) {
  try {
    const response = await fetch(`https://script.google.com/macros/s/AKfycb.../exec?user_id=${userId}`);
    const data = await response.json();
    return data.exists ? data : false;
  } catch (error) {
    console.error('Error checking user:', error);
    return false;
  }
}

// Инициализация при загрузке
async function initApp() {
  // Получаем userId из Telegram WebApp
  const userId = window.Telegram.WebApp.initDataUnsafe.user?.id || 'test_user';
  
  const userData = await checkUserQuiz(userId);
  
  if (!userData) {
    // Показываем квиз
    const quiz = new Quiz(userId);
    showQuiz(quiz);
  } else {
    // Показываем чат с первым сообщением от AI
    showChat();
    sendFirstAIMessage(userData);
  }
}

// Функция для первого сообщения AI
function sendFirstAIMessage(userData) {
  const prompt = `Ты — ${userData.coaching_style}. Пользователь только что завершил квиз. 
  Его имя: ${userData.name}. Он хочет бегать ${userData.running_frequency} в неделю. 
  Его мотивация: ${userData.primary_motivation}. 
  Приветствуй его и дай первую мотивацию согласно выбранному стилю.`;
  
  // Отправляем запрос к Gemini API...
}