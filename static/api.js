// Класс для работы с внешними API: получение и сохранение данных, взаимодействие с AI
class ApiService {
  // Получение данных пользователя по userId из Google Sheets
  static async fetchUserData(userId) {
    try {
      const res = await fetch(`${Config.SHEETS_API_URL}?user_id=${userId}`);
      if (!res.ok) throw new Error('Network response was not ok');
      return await res.json();
    } catch (error) {
      console.error('Error fetching user data:', error);
      throw error;
    }
  }

  // Сохранение данных квиза пользователя (включая профиль и историю)
  static async saveQuizData(userId, data) {
    try {
      const res = await fetch(Config.SHEETS_API_URL, {
        method: 'POST',
        body: JSON.stringify({ user_id: userId, ...data }),
        headers: { 'Content-Type': 'application/json' }
      });
      if (!res.ok) throw new Error('Network response was not ok');
      return await res.json();
    } catch (error) {
      console.error('Error saving quiz data:', error);
      throw error;
    }
  }

  // Отправка запроса к AI (Gemini API) с текстом prompt и получение ответа
  static async sendMessageToAI(prompt) {
    try {
      const res = await fetch(Config.GEMINI_API_URL, {
        method: 'POST',
        body: JSON.stringify({ prompt }),
        headers: { 'Content-Type': 'application/json' }
      });
      if (!res.ok) throw new Error('Network response was not ok');
      const json = await res.json();
      return json?.response || 'Ошибка от AI';
    } catch (error) {
      console.error('Error sending message to AI:', error);
      throw error;
    }
  }

  // Получение userId из Telegram WebApp или возврат тестового значения
  static getUserId() {
    try {
      return Telegram.WebApp.initDataUnsafe.user?.id?.toString() || 'test_user';
    } catch (e) {
      return 'test_user';
    }
  }
}

// Делаем ApiService доступным глобально для других модулей
window.ApiService = ApiService;
