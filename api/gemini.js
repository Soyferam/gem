// Импорт клиента Google Generative AI SDK
import { GoogleGenerativeAI } from '@google/generative-ai';

// Инициализация клиента с использованием API-ключа из переменных окружения
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Основной экспортируемый обработчик запроса
export default async (req, res) => {
  // Устанавливаем заголовки CORS, чтобы разрешить кросс-доменные запросы
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Обработка preflight-запросов браузера
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  // Разрешаем только POST-запросы
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST allowed' });
  }

  try {
    // Извлекаем prompt из тела запроса
    const { prompt } = req.body;

    // Получаем модель Gemini (используется "gemini-1.5-flash" для быстрого ответа)
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Отправляем промпт в модель и генерируем ответ
    const result = await model.generateContent({
      contents: [{ parts: [{ text: prompt }] }]
    });

    // Отправляем ответ клиенту
    return res.status(200).json({ 
      response: (await result.response).text() 
    });
  } catch (error) {
    // Обработка ошибок и отправка статуса 500 с деталями
    console.error('Error:', error);
    return res.status(500).json({ 
      error: 'AI request failed',
      details: error.message 
    });
  }
};
