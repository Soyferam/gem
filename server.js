import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenerativeAI } from '@google/generative-ai';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = 3001; // Теперь фронт и бек на одном порту

// Middleware
app.use(cors());
app.use(express.json());

// Favicon fix
app.get('/favicon.ico', (req, res) => res.status(204).end());

// API Route
app.post('/api/gemini', async (req, res) => {
  try {
    const { prompt } = req.body;
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent(prompt);
    res.json({ response: (await result.response).text() });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Статика
app.use(express.static(path.join(__dirname, 'static')));

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));