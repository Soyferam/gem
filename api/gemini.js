import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "AIzaSyCkpbO8aOKpAl6NhCwBpZv6ZiuCAP-klu8");

export default async (req, res) => {
  // Настройка CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST allowed' });
  }

  try {
    const { prompt, style = "Энерджайзер-Зажигалка" } = req.body;
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const fullPrompt = `Ты - ${style}, персональный тренер по бегу. Ответь кратко (1-2 предложения): ${prompt}`;
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    
    res.status(200).json({ response: response.text() });
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ 
      error: 'Failed to generate response',
      details: error.message 
    });
  }
};