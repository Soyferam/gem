import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenerativeAI } from '@google/generative-ai';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = 3000;

// Middleware для обработки JSON
app.use(express.json());

// Инициализация Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "AIzaSyCkpbO8aOKpAl6NhCwBpZv6ZiuCAP-klu8");

// API роут
app.post('/api/gemini', async (req, res) => {
  try {
    const { prompt } = req.body;
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    
    res.json({ response: response.text() });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to generate response' });
  }
});

// Статические файлы
app.use(express.static(path.join(__dirname, 'static')));

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});