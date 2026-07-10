// ================================
// קריאת הגדרות מה־URL / localStorage
// ================================
const url = new URLSearchParams(location.search);
const saved = JSON.parse(localStorage.getItem("examSettings") || "{}");

// ================================
// שמות נושאים
// ================================
const SUBJECT_TITLES = {
  anatomy: "אנטומיה",
  chemistry: "כימיה",
  psychology: "פסיכולוגיה",
  literacy: "אוריינות שפתית",
  basketball: "יסודות בכדורסל",
  athletics: "יסודות באתלטיקה",
  football: "יסודות בכדורגל",
  physics: "פיזיקה",
  statistics1: "סטטיסטיקה – חלק א׳",
  biochemistry: "ביוכימיה",
  volleyball: "כדור עף",
  handball: "כדור יד",
  developmentalPsychology: "פסיכולוגיה התפתחותית",
  sportHistory: "היסטוריה של הספורט",
};

// ================================
// מפתח ושם הנושא
// ================================
const subjectKey =
  url.get("subject") ||
  saved.subject ||
  localStorage.getItem("selectedSubjectKey") ||
  "";

const subjectLabel =
  SUBJECT_TITLES[subjectKey] ||
  localStorage.getItem("selectedSubjectLabel") ||
  "נושא לא מוגדר";

// ================================
// פרמטרים
// ================================
const settings = {
  subtopic: url.get("subtopic") || saved.subtopic || "all",
  type: url.get("type") || saved.type || "all",

  timePerQuestion: !Number.isNaN(Number.parseInt(url.get("time"), 10))
    ? Number.parseInt(url.get("time"), 10)
    : saved.timePerQuestion || 30,

  numQuestions: !Number.isNaN(Number.parseInt(url.get("questions"), 10))
    ? Number.parseInt(url.get("questions"), 10)
    : saved.numQuestions || 20,

  maxFails: !Number.isNaN(Number.parseInt(url.get("fails"), 10))
    ? Number.parseInt(url.get("fails"), 10)
    : (saved.maxFails ?? 5),
};

// ================================
// אלמנטים
// ================================
const subjectTitle = document.getElementById("subjectTitle");
const qText = document.getElementById("questionText");
const qMeta = document.getElementById("qMeta");
const optionsWrap = document.getElementById("options");
const barFill = document.getElementById("barFill");
const timeLeft = document.getElementById("timeLeft");
const failsView = document.getElementById("failsView");
const progressView = document.getElementById("progressView");

const endOverlay = document.getElementById("endOverlay");
const endTitle = document.getElementById("endTitle");
const endSub = document.getElementById("endSub");

const circleEasy = document.getElementById("examCircleEasy");
const circleHard = document.getElementById("examCircleHard");

const prevBtn = document.getElementById("prevBtn");
const homeBtn = document.getElementById("homeBtn");
const againBtn = document.getElementById("againBtn");
const backBtn = document.getElementById("backBtn");

// ================================
// טעינת סטטוס קל/קשה
// ================================
let difficultyMap = JSON.parse(localStorage.getItem("easyHardStats") || "{}");

function saveDifficulty() {
  localStorage.setItem("easyHardStats", JSON.stringify(difficultyMap));
}

// ================================
// ניווט עליון
// ================================
prevBtn?.addEventListener("click", () => {
  const target = `exam-settings.html?subject=${encodeURIComponent(subjectKey)}`;

  if (history.length > 1) {
    history.back();
  } else {
    location.href = target;
  }
});

homeBtn?.addEventListener("click", () => {
  localStorage.removeItem("selectedSubjectKey");
  localStorage.removeItem("selectedSubjectLabel");
  localStorage.removeItem("selectedMethodKey");
  localStorage.removeItem("selectedMethodLabel");

  location.href = "index.html";
});

// ================================
// הצגת שם הנושא
// ================================
if (subjectTitle) {
  subjectTitle.textContent = subjectLabel;

  requestAnimationFrame(() => {
    subjectTitle.classList.add("visible");
  });
}

// ================================
// טעינת המאגר
// ================================
const originalBank = Array.isArray(window.examBank)
  ? window.examBank.slice()
  : [];

let bank = originalBank.slice();

// ================================
// שלב 1 — סינון לפי תת־נושא
// ================================
if (settings.subtopic !== "all") {
  bank = bank.filter((question) => question.subtopic === settings.subtopic);
}

// אם תת־הנושא לא קיים
if (bank.length === 0 && settings.subtopic !== "all") {
  console.warn("⚠️ לא נמצאו שאלות לתת־הנושא:", settings.subtopic);

  bank = originalBank.slice();
}

// ================================
// שלב 2 — סינון לפי קל/קשה
// ================================
if (settings.type === "easy") {
  bank = bank.filter((question) => difficultyMap[question.id] === "easy");
} else if (settings.type === "hard") {
  bank = bank.filter((question) => difficultyMap[question.id] === "hard");
}

// fallback אם סינון הקושי מחק הכול
if (bank.length === 0 && settings.type !== "all") {
  console.warn("⚠️ לא נמצאו שאלות ברמת הקושי שנבחרה.");

  bank = originalBank.slice();

  if (settings.subtopic !== "all") {
    bank = bank.filter((question) => question.subtopic === settings.subtopic);
  }
}

// ================================
// שלב 3 — ערבוב וחיתוך כמות
// ================================
shuffle(bank);

const actualQuestionCount = Math.min(settings.numQuestions, bank.length);

bank = bank.slice(0, actualQuestionCount);

if (bank.length === 0) {
  alert("לא נמצאו שאלות מתאימות למסננים שבחרת.");
}

// ================================
// סטייט
// ================================
let current = 0;
let fails = 0;
let timerId = null;
let timeLeftSec = settings.timePerQuestion;

// ================================
// התחלה
// ================================
updateHud();
loadQuestion();

// ================================
// טיימר
// ================================
function startTimer() {
  clearInterval(timerId);

  timeLeftSec = settings.timePerQuestion;

  if (barFill) {
    barFill.style.transform = "scaleX(1)";
  }

  drawTime();

  const total = settings.timePerQuestion;

  timerId = setInterval(() => {
    timeLeftSec -= 0.05;

    if (timeLeftSec <= 0) {
      clearInterval(timerId);
      handleAnswer(-1);
      return;
    }

    const ratio = Math.max(0, timeLeftSec / total);

    if (barFill) {
      barFill.style.transform = `scaleX(${ratio.toFixed(3)})`;
    }

    drawTime();
  }, 50);
}

function drawTime() {
  const seconds = Math.max(0, Math.ceil(timeLeftSec));

  if (timeLeft) {
    timeLeft.textContent = `נשארו ${seconds} שניות...`;
  }
}

// ================================
// הצגת שאלה
// ================================
function loadQuestion() {
  const item = bank[current];

  if (!item) {
    endExam("המבחן נגמר", `סיימת ${bank.length} שאלות. כל הכבוד 👏`);
    return;
  }

  if (
    !Array.isArray(item.options) ||
    item.options.length < 4 ||
    typeof item.correct !== "number"
  ) {
    console.error("❌ שאלה פגומה:", item);

    endExam("שגיאה במבחן", "אחת השאלות חסרה או אינה תקינה.");

    return;
  }

  qText.textContent = item.q;

  qMeta.textContent = `שאלה ${current + 1} מתוך ${bank.length}`;

  resetCircles();

  if (difficultyMap[item.id] === "easy") {
    circleEasy?.classList.add("active");
  }

  if (difficultyMap[item.id] === "hard") {
    circleHard?.classList.add("active");
  }

  const answers = item.options;
  const order = [0, 1, 2, 3];

  shuffle(order);

  optionsWrap.innerHTML = "";

  order.forEach((realIndex, visualIndex) => {
    const button = document.createElement("button");

    button.className = "option";
    button.type = "button";
    button.textContent = answers[realIndex];

    button.dataset.realIndex = String(realIndex);
    button.dataset.visualIndex = String(visualIndex);

    button.addEventListener("click", () => {
      handleAnswer(visualIndex);
    });

    optionsWrap.appendChild(button);
  });

  startTimer();
}

// ================================
// איפוס עיגולי קושי
// ================================
function resetCircles() {
  circleEasy?.classList.remove("active");
  circleHard?.classList.remove("active");
}

// ================================
// טיפול בבחירת תשובה
// ================================
function handleAnswer(visualIndex) {
  const item = bank[current];

  if (!item) {
    return;
  }

  const id = item.id;
  const buttons = [...optionsWrap.children];

  buttons.forEach((button) => {
    button.classList.add("disabled");
  });

  clearInterval(timerId);

  const realChosenIndex =
    visualIndex === -1
      ? -1
      : Number.parseInt(buttons[visualIndex]?.dataset.realIndex, 10);

  const correctButton = buttons.find(
    (button) => Number.parseInt(button.dataset.realIndex, 10) === item.correct,
  );

  const isCorrect = realChosenIndex === item.correct;

  if (visualIndex !== -1) {
    const chosenButton = buttons[visualIndex];

    chosenButton?.classList.add(isCorrect ? "correct" : "wrong");
  }

  correctButton?.classList.add("correct");

  if (!isCorrect) {
    fails += 1;
  }

  // ================================
  // עדכון רמת השאלה
  // ================================
  const previousStatus = difficultyMap[id] || "neutral";

  if (isCorrect) {
    if (previousStatus === "neutral") {
      difficultyMap[id] = "easy";
    } else if (previousStatus === "hard") {
      difficultyMap[id] = "neutral";
    }
  } else {
    if (previousStatus === "neutral") {
      difficultyMap[id] = "hard";
    } else if (previousStatus === "easy") {
      difficultyMap[id] = "neutral";
    }
  }

  saveDifficulty();
  updateHud();

  if (settings.maxFails !== 0 && fails > settings.maxFails) {
    setTimeout(() => {
      endExam("חרגת ממספר הפסילות", "המבחן נגמר. נסה שוב ✋");
    }, 700);

    return;
  }

  setTimeout(() => {
    current += 1;

    updateHud();
    loadQuestion();
  }, 1500);
}

// ================================
// HUD
// ================================
function updateHud() {
  if (settings.maxFails === 0) {
    failsView.textContent = `תשובות לא נכונות: ${fails}`;
  } else {
    failsView.textContent = `תשובות לא נכונות: ${fails} / ${settings.maxFails}`;
  }

  const total = bank.length || 1;

  const progress = Math.round((current / total) * 100);

  progressView.textContent = `התקדמות: ${progress}%`;
}

// ================================
// סיום מבחן
// ================================
function endExam(title, subtitle) {
  clearInterval(timerId);

  endTitle.textContent = title;
  endSub.textContent = subtitle;

  endOverlay.classList.add("show");
}

// ================================
// ניסיון חוזר
// ================================
againBtn?.addEventListener("click", () => {
  current = 0;
  fails = 0;

  shuffle(bank);

  endOverlay.classList.remove("show");

  updateHud();
  loadQuestion();
});

// ================================
// חזרה לבחירת שיטה
// ================================
backBtn?.addEventListener("click", () => {
  location.href = `select-method.html?subject=${encodeURIComponent(subjectKey)}`;
});

// ================================
// ערבוב מערך
// ================================
function shuffle(array) {
  for (let index = array.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));

    [array[index], array[randomIndex]] = [array[randomIndex], array[index]];
  }

  return array;
}
