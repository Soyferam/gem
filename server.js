import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const PORT = process.env.PORT || 4000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Разрешаем CORS для всех доменов (можно указать конкретные origin)
app.use(cors());

app.use(express.static(path.join(__dirname, "static")));
app.use(express.json());

// Прокси-эндпоинт для Ollama
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
    res.json(data);
  } catch (err) {
    console.error("Ошибка обращения к Ollama:", err);
    res.status(500).json({ error: "Ошибка прокси-сервера" });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Сервер работает на http://localhost:${PORT}`);
});
