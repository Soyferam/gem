class App {
  static async init() {
    console.log('App initialization started'); // лог
    

    
    try {
      // Добавим искусственную задержку для тестирования loader
      document.getElementById('loader').style.display = 'flex';
      document.getElementById('loader').textContent = 'Загрузка Duco AI...';
      
      await new Promise(resolve => setTimeout(resolve, 1000)); // 1 сек задержка

      if (window.Telegram && Telegram.WebApp?.initDataUnsafe?.user?.id) {
        Telegram.WebApp.ready();
        Telegram.WebApp.expand();
        console.log('Telegram WebApp initialized');
      }
      
      const userId = ApiService.getUserId();
      console.log('User ID:', userId);
      
      const userData = await this.checkUserData(userId);
      console.log('User data:', userData);

      if (!userData || !userData.name || !userData.running_frequency) {
        console.log('Showing quiz');
        document.getElementById('loader').style.display = 'none';
        document.getElementById('quiz-container').style.display = 'flex';
        quiz.init();
      } else {
        console.log('Starting chat');
        await startChat(true, userData);
      }
    } catch (error) {
      console.error('Initialization error:', error);
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