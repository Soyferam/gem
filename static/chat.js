const API_URL = "https://cold-credit-3c5d.arsivals.workers.dev/";

export function startChat(userData) {
  document.getElementById("chat-container").style.display = "block";

  const form = document.getElementById("chat-form");
  const input = document.getElementById("user-input");
  const messages = document.getElementById("messages");
  let loadingMessage = null;

  const addMessage = (role, text) => {
    const div = document.createElement("div");
    div.className = `${role}-message`;
    div.innerHTML = text.replace(/\n/g, "<br>");
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
    return div;
  };

  const removeLoading = () => {
    if (loadingMessage && loadingMessage.parentNode) {
      messages.removeChild(loadingMessage);
      loadingMessage = null;
    }
  };

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const message = input.value.trim();
    if (!message) return;

    addMessage("user", message);
    input.value = "";
    removeLoading();
    loadingMessage = addMessage("status", "ИИ думает...");

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: message }),
      });

      removeLoading();

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Ошибка сервера");
      }

      const data = await response.json();
      addMessage("ai", data.response);
    } catch (error) {
      removeLoading();
      console.error("Ошибка:", error);

      let errorText = "Ошибка соединения";
      try {
        if (error.message) {
          const errorObj = JSON.parse(error.message);
          errorText = errorObj.error || error.message;
        }
      } catch (e) {
        errorText = error.message;
      }
      addMessage("error", errorText);
    }
  });

  addMessage("ai", `Привет, ${userData.name || "друг"}! Готов(а) к пробежке?`);
}
