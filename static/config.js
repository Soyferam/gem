const Config = {
  SHEETS_API_URL: 'https://cold-credit-3c5d.arsivals.workers.dev/sheet',
  GEMINI_API_URL: 'https://cold-credit-3c5d.arsivals.workers.dev/gemini',
  
  coachingStyles: {
    'Железный Наставник': 'Строгий, но справедливый. Будет держать вас в тонусе.',
    'Энерджайзер-Зажигалка': 'Энергичный и мотивирующий. Заряжает энергией.',
    'Спокойный Мудрец': 'Мудрый и поддерживающий. Дает взвешенные советы.',
    'АБСОЛЮТНЫЙ ДОМИНАТОР': 'Жесткий и требовательный. Только для сильных духом.'
  },
  
  backgroundImages: {
    'Железный Наставник': 'bg/iron.jpg',
    'Энерджайзер-Зажигалка': 'bg/energizer.jpg',
    'Спокойный Мудрец': 'bg/sage.jpg',
    'АБСОЛЮТНЫЙ ДОМИНАТОР': 'bg/dominator.jpg',
    'default': 'bg/default.jpg'
  }
};

window.Config = Config;