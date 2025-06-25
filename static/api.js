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
  const json = await res.json();
  return json?.data || null;
}

async function saveQuizData(data) {
  const user_id = getUserId();
  const body = { user_id, ...data };
  const res = await fetch(SHEETS_API_URL, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' }
  });
  const json = await res.json();
  return json;
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