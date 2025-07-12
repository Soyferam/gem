class App {
  static async init() {
    try {
      document.getElementById('loader').style.display = 'flex';
      
      if (window.Telegram?.WebApp?.initDataUnsafe?.user?.id) {
        Telegram.WebApp.ready();
        Telegram.WebApp.expand();
      }
      
      const userId = ApiService.getUserId();
      const userData = await this.checkUserData(userId);
      
      if (!userData || !userData.name) {
        document.getElementById('loader').style.display = 'none';
        document.getElementById('quiz-container').style.display = 'flex';
        quiz.init();
      } else {
        // Проверяем, есть ли история сообщений
        if (userData.last_messages?.length > 0) {
          document.getElementById('loader').style.display = 'none';
          await startChat(true, userData);
        } else {
          document.getElementById('loader').style.display = 'none';
          await startChat(false, userData);
        }
      }
    } catch (error) {
      console.error('App init error:', error);
      document.getElementById('loader').textContent = 'Ошибка загрузки. Пожалуйста, обновите страницу.';
    }
  }

  static async checkUserData(userId) {
    try {
      const response = await ApiService.fetchUserData(userId);
      return response?.data || null;
    } catch (error) {
      console.error('Fetch user error:', error);
      return null;
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  App.init();
});