import express from "express";
import fetch from "node-fetch";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const PORT = 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Отдаём статические файлы из папки static
app.use(express.static(path.join(__dirname, "static")));
app.use(express.json());

// Прокси для Ollama
app.post("/api/proxy", async (req, res) => {
  const { prompt, stream = false } = req.body;

  try {
    const response = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama3",
        prompt,
        stream
      })
    });

    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error("Ошибка обращения к Ollama:", err);
    res.status(500).json({ error: "Ошибка прокси-сервера" });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Сервер работает: http://localhost:${PORT}`);
});
