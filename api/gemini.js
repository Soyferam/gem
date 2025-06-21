import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "AIzaSyCkpbO8aOKpAl6NhCwBpZv6ZiuCAP-klu8");

export default async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST requests allowed' });
  }

  try {
    const { prompt, style = "Энерджайзер-Зажигалка" } = req.body;
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await model.generateContent(
      `Ты — ${style}, персональный тренер по бегу. Ответь кратко (1-2 предложения): ${prompt}`
    );
    
    res.status(200).json({ 
      response: (await result.response).text() 
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ 
      error: 'Failed to generate response',
      details: error.message 
    });
  }
};