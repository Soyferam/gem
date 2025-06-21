import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export default async (req, res) => {
  // Настройки CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST requests allowed' });
  }

  try {
    const { prompt, style } = req.body;
    
    // Используем актуальную модель (gemini-1.5-flash или gemini-1.5-pro)
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",  // Быстрая и недорогая модель
      // model: "gemini-1.5-pro", // Более продвинутая версия
    });

    // Новый формат запроса
    const result = await model.generateContent({
      contents: [{
        parts: [{
          text: `Ты — ${style}. Ответь: ${prompt}`
        }]
      }]
    });

    const response = result.response;
    const text = response.text();
    
    return res.status(200).json({ response: text });
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ 
      error: 'Failed to generate response',
      details: error.message 
    });
  }
};