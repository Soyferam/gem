import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export default async (req, res) => {
  // Явно разрешаем запросы с вашего домена Vercel и локального development
  const allowedOrigins = [
    'https://gem-orpin-beta.vercel.app',
    'https://gem-h177aykds-aaas-projects-99f40aaf.vercel.app',
    'http://localhost:3001'
  ];
  
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Vary', 'Origin');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt, style } = req.body;
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent(`Ты — ${style}. Ответь: ${prompt}`);
    const response = await result.response;
    
    return res.status(200).json({ response: response.text() });
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ 
      error: 'Failed to generate response',
      details: error.message 
    });
  }
};