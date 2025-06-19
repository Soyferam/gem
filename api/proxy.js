export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Метод не поддерживается' });
  }

  const { prompt, stream = false } = req.body;

  try {
    const ollamaRes = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama3",
        prompt,
        stream
      }),
    });

    const data = await ollamaRes.json();
    res.status(200).json(data);
  } catch (error) {
    console.error("Ошибка обращения к Ollama:", error);
    res.status(500).json({
