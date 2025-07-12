const SHEETS_API_URL = 'https://cold-credit-3c5d.arsivals.workers.dev/sheet';
const GEMINI_API_URL = 'https://cold-credit-3c5d.arsivals.workers.dev/gemini';

const getUserId = () => {
  try {
    return Telegram.WebApp.initDataUnsafe.user?.id?.toString() || 'test_user';
  } catch (e) {
    return 'test_user';
  }
};

async function fetchUserData() {
  const user_id = getUserId();
  const res = await fetch(`${SHEETS_API_URL}?user_id=${user_id}`);
  return await res.json();
}

async function saveQuizData(data) {
  const user_id = getUserId();
  const body = { user_id, ...data };
  const res = await fetch(SHEETS_API_URL, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' }
  });
  return await res.json();
}

async function sendMessageToAI(prompt) {
  const res = await fetch(GEMINI_API_URL, {
    method: 'POST',
    body: JSON.stringify({ prompt }),
    headers: { 'Content-Type': 'application/json' }
  });
  const json = await res.json();
  return json?.response || 'Ошибка от AI';
}

window.fetchUserData = fetchUserData;
window.saveQuizData = saveQuizData;
window.sendMessageToAI = sendMessageToAI;
window.getUserId = getUserId;
