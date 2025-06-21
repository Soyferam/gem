import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "YOUR_API_KEY");

export default async (req, res) => {
  // Настройки CORS
 // В начале обработчика запроса (до основной логики)
res.setHeader('Access-Control-Allow-Origin', 'https://gem-orpin-beta.vercel.app');
res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

// Для предварительных OPTIONS-запросов
if (req.method === 'OPTIONS') {
  return res.status(200).end();
}

  // Основная логика
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST allowed' });
  }

  try {
    const { prompt, style = "Энерджайзер-Зажигалка" } = req.body;
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const result = await model.generateContent(
      `Ты — ${style}, персональный тренер по бегу. Ответь кратко: ${prompt}`
    );
    
    res.status(200).json({ 
      response: (await result.response).text() 
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
};