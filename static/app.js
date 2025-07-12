class App {
  static async init() {
    try {
      if (window.Telegram && Telegram.WebApp?.initDataUnsafe?.user?.id) {
        Telegram.WebApp.ready();
        Telegram.WebApp.expand();
      }

      const userId = ApiService.getUserId();
      const userData = await this.checkUserData(userId);

      document.getElementById('loader').style.display = 'none';

      if (!userData || !userData.name || !userData.running_frequency) {
        // Показываем квиз
        document.getElementById('quiz-container').style.display = 'flex';
        quiz.init();
      } else {
        // Показываем чат
        document.getElementById('chat-container').style.display = 'flex';
        window.startChat(true, userData);
      }
    } catch (error) {
      console.error('Ошибка при инициализации:', error);
      document.getElementById('loader').textContent = 'Ошибка загрузки. Пожалуйста, обновите страницу.';
    }
  }

  static async checkUserData(userId) {
    try {
      const data = await ApiService.fetchUserData(userId);
      return data?.data || null;
    } catch (error) {
      console.error('Error checking user data:', error);
      return null;
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
