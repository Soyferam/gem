import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const PORT = process.env.PORT || 4000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Разрешаем CORS для всех источников (можно настроить под нужный origin)
app.use(cors());

// Отдаём статику из папки static рядом с серверным файлом
app.use(express.static(path.join(__dirname, "static")));

// Парсим JSON тело запроса
app.use(express.json());

// Прокси-эндпоинт для запросов к Ollama API
app.post("/api/proxy", async (req, res) => {
  const { prompt, stream = false } = req.body;

  try {
    const response = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama3",
        prompt,
        stream,
      }),
    });

    const data = await response.json();
    console.log("Ответ от Ollama:", data);
    res.json(data);
  } catch (err) {
    console.error("Ошибка обращения к Ollama:", err);
    res.status(500).json({ error: "Ошибка прокси-сервера" });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Сервер работает на http://localhost:${PORT}`);
});
