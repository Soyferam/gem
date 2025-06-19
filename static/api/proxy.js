// api/proxy.js
export default async function handler(req, res) {
  const { prompt } = req.body;

  const ollamaResponse = await fetch("http://localhost:11434/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "llama3",
      prompt: prompt,
      stream: false
    })
  });

  const data = await ollamaResponse.json();
  res.status(200).json(data);
}