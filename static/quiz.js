import { startChat } from "./chat.js";

const SHEETS_API =
  "https://script.google.com/macros/s/AKfycbzj-2-t4uuy0mrkisVNzyNS9PWnd7epZkVC4FYonslewl1JWXE57O6D8G8optnMQsoP/exec";

const steps = [
  { key: "name", question: "Как мне к тебе обращаться?", type: "text" },
  {
    key: "running_frequency",
    question: "Сколько раз в неделю ты хочешь бегать?",
    type: "options",
    options: ["1 раз", "2 раза", "3 раза", "Больше 3", "Пока не знаю"],
  },
  {
    key: "preferred_days",
    question: "В какие дни тебе удобнее всего бегать?",
    type: "multi",
    options: ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс", "По настроению"],
  },
  {
    key: "primary_motivation",
    question: "Что тебя больше всего мотивирует?",
    type: "options",
    options: [
      "Похудеть",
      "Энергия",
      "Снять стресс",
      "Физ. форма",
      "Просто подвигаться",
      "Другое",
    ],
  },
  {
    key: "main_obstacles",
    question: "Что чаще всего мешает тебе выйти на пробежку?",
    type: "options",
    options: ["Лень", "Усталость", "Погода", "Время", "Нет компании", "Другое"],
  },
  {
    key: "overcome_triggers",
    question: "Что помогает тебе всё-таки собраться и побежать?",
    type: "options",
    options: ["Музыка", "Мысль о результате", "Договорённость", "Просто начать", "Другое"],
  },
  {
    key: "coaching_style",
    question: "Какой стиль общения тебе ближе всего?",
    type: "options",
    options: [
      "Железный Наставник",
      "Энерджайзер-Зажигалка",
      "Спокойный Мудрец",
      "АБСОЛЮТНЫЙ ДОМИНАТОР",
    ],
  },
];

let state = {
  currentStep: 0,
  answers: {},
};

let userId = null;

export function startQuiz(id) {
  userId = id;
  renderStep();
}

function renderStep() {
  const container = document.getElementById("quiz-container");
  container.innerHTML = "";

  const step = steps[state.currentStep];

  const question = document.createElement("p");
  question.textContent = step.question;
  container.appendChild(question);

  if (step.type === "text") {
    const input = document.createElement("input");
    input.type = "text";
    input.placeholder = "Ответ...";
    container.appendChild(input);

    const btn = document.createElement("button");
    btn.textContent = "Далее";
    btn.onclick = () => {
      const val = input.value.trim();
      if (val) nextStep(step.key, val);
      else alert("Пожалуйста, введите ответ");
    };
    container.appendChild(btn);
  } else if (step.type === "options") {
    step.options.forEach((opt) => {
      const btn = document.createElement("button");
      btn.textContent = opt;
      btn.onclick = () => nextStep(step.key, opt);
      container.appendChild(btn);
    });
  } else if (step.type === "multi") {
    const selected = new Set();

    step.options.forEach((opt) => {
      const btn = document.createElement("button");
      btn.textContent = opt;
      btn.onclick = () => {
        btn.classList.toggle("selected");
        if (selected.has(opt)) selected.delete(opt);
        else selected.add(opt);
      };
      container.appendChild(btn);
    });

    const nextBtn = document.createElement("button");
    nextBtn.textContent = "Далее";
    nextBtn.onclick = () => {
      if (selected.size > 0) nextStep(step.key, Array.from(selected).join(", "));
      else alert("Пожалуйста, выберите хотя бы один вариант");
    };
    container.appendChild(nextBtn);
  }
}

function nextStep(key, value) {
  state.answers[key] = value;
  state.currentStep++;
  if (state.currentStep < steps.length) {
    renderStep();
  } else {
    submitAnswers();
  }
}

async function submitAnswers() {
  const payload = {
    user_id: userId,
    signup_date: new Date().toISOString(),
    ...state.answers,
    dominant_style_consent: state.answers.coaching_style === "АБСОЛЮТНЫЙ ДОМИНАТОР" ? "да" : "нет",
  };

  try {
    const res = await fetch(SHEETS_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const result = await res.json();

    if (result.success) {
      document.getElementById("quiz-container").style.display = "none";
      startChat(payload);
    } else {
      alert("Ошибка отправки данных. Попробуйте ещё раз.");
    }
  } catch (err) {
    console.error("Ошибка отправки:", err);
    alert("Ошибка соединения. Повторите позже.");
  }
}
