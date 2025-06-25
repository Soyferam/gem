const SHEETS_API_URL = 'https://script.google.com/macros/s/AKfycbw8iAI4fw1GePyzCU4rcTN2n1wWnkJkfAAokQn_YRGrpgPuvvDQDq3shR-qUtVFllOp/exec';
const GEMINI_API_URL = "https://cold-credit-3c5d.arsivals.workers.dev/";

// Условно фейковый ID, если нет Telegram WebApp
const getUserId = () => {
  try {
    return Telegram.WebApp.initDataUnsafe.user?.id?.toString() || 'test_user';
  } catch (e) {
    return 'test_user';
  }
};

// Получить данные пользователя
async function fetchUserData() {
  const user_id = getUserId();
  const res = await fetch(`${SHEETS_API_URL}?user_id=${user_id}`);
  const json = await res.json();
  return json?.data || null;
}

// Сохранить данные квиза
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

// Отправить запрос в Gemini
async function sendMessageToAI(prompt) {
  const res = await fetch(GEMINI_API_URL, {
    method: 'POST',
    body: JSON.stringify({ prompt }),
    headers: { 'Content-Type': 'application/json' }
  });
  const json = await res.json();
  return json?.response || 'Ошибка от AI';
}