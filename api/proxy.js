export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { prompt, stream = false } = req.body;

  try {
    const ollamaResponse = await fetch("http://127.0.0.1:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama3",
        prompt: prompt,
        stream: stream
      })
    });

    const data = await ollamaResponse.json();
    res.status(200).json(data);
  } catch (error) {
    console.error("Ошибка обращения к Ollama:", error);
    res.status(500).json({ error: "Ошибка сервера Ollama" });
  }
}
