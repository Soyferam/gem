class App {
  // Инициализация приложения при загрузке страницы
  static async init() {
    try {
      // Проверяем, что мы внутри Telegram WebApp и пользователь авторизован
      if (window.Telegram && Telegram.WebApp?.initDataUnsafe?.user?.id) {
        Telegram.WebApp.ready();   // Сообщаем, что приложение готово
        Telegram.WebApp.expand();  // Раскрываем окно WebApp по максимуму
      }

      // Получаем идентификатор пользователя
      const userId = ApiService.getUserId();
      // Проверяем, есть ли данные пользователя в базе
      const userData = await this.checkUserData(userId);

      // Скрываем индикатор загрузки
      document.getElementById('loader').style.display = 'none';

      if (!userData || !userData.name || !userData.running_frequency) {
        // Если данных нет или профиль неполный — показываем квиз
        document.getElementById('quiz-container').style.display = 'flex';
        quiz.init();
      } else {
        // Иначе показываем чат с AI и передаём данные пользователя
        document.getElementById('chat-container').style.display = 'flex';
        window.startChat(true, userData);
      }
    } catch (error) {
      console.error('Ошибка при инициализации:', error);
      // При ошибке показываем сообщение об ошибке пользователю
      document.getElementById('loader').textContent = 'Ошибка загрузки. Пожалуйста, обновите страницу.';
    }
  }

  // Получение и проверка данных пользователя по userId
  static async checkUserData(userId) {
    try {
      const data = await ApiService.fetchUserData(userId);
      // Возвращаем данные из ответа или null, если нет
      return data?.data || null;
    } catch (error) {
      console.error('Error checking user data:', error);
      return null;
    }
  }
}

// Запускаем инициализацию после загрузки DOM
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
