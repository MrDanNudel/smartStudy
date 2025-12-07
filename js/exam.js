// ================================
// קריאת הגדרות מה־URL / localStorage
// ================================
const url = new URLSearchParams(location.search);
const saved = JSON.parse(localStorage.getItem("examSettings") || "{}");

// פרמטרים
const settings = {
  subtopic: decodeURIComponent(url.get("subtopic") || "all"),
  type: url.get("type") || "all",
  timePerQuestion: !isNaN(parseInt(url.get("time")))
    ? parseInt(url.get("time"))
    : saved.timePerQuestion || 30,
  numQuestions: !isNaN(parseInt(url.get("questions")))
    ? parseInt(url.get("questions"))
    : saved.numQuestions || 20,
  maxFails: !isNaN(parseInt(url.get("fails")))
    ? parseInt(url.get("fails"))
    : saved.maxFails || 5,
};

const subjectLabel =
  url.get("subject") || localStorage.getItem("selectedSubjectLabel") || "נושא";

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
document.getElementById("prevBtn").addEventListener("click", () => {
  history.length > 1 ? history.back() : (location.href = "select-method.html");
});

document.getElementById("homeBtn").addEventListener("click", () => {
  localStorage.removeItem("selectedSubjectKey");
  localStorage.removeItem("selectedSubjectLabel");
  location.href = "index.html";
});

subjectTitle.textContent = subjectLabel;
requestAnimationFrame(() => subjectTitle.classList.add("visible"));

// ================================
// טעינת המאגר — examBank
// ================================
let bank = (window.examBank || []).slice();

// ================================
// ⭐ שלב 1 — סינון לפי תת־נושא
// ================================
if (settings.subtopic !== "all") {
  bank = bank.filter((q) => q.subtopic === settings.subtopic);
}

// אם תת־נושא לא קיים → fallback
if (bank.length === 0) {
  console.warn("⚠️ No questions for subtopic:", settings.subtopic);
  bank = (window.examBank || []).slice();
}

// ================================
// ⭐ שלב 2 — סינון לפי קל/קשה
// ================================
if (settings.type === "easy") {
  bank = bank.filter((q) => difficultyMap[q.id] === "easy");
} else if (settings.type === "hard") {
  bank = bank.filter((q) => difficultyMap[q.id] === "hard");
}

// fallback אם הסינון מחק את הכול
if (bank.length === 0) {
  console.warn("⚠️ Difficulty filter empty → using all");
  bank = (window.examBank || []).slice();
  if (settings.subtopic !== "all") {
    bank = bank.filter((q) => q.subtopic === settings.subtopic);
  }
}

// ================================
// ⭐ שלב 3 — ערבוב + חיתוך כמות
// ================================
shuffle(bank);
bank = bank.slice(0, settings.numQuestions);

if (bank.length === 0) {
  alert("❗ לא נמצאו שאלות מתאימות למסננים שבחרת!");
}

// ================================
// סטייט
// ================================
let current = 0;
let fails = 0;
let timerId = null;
let timeLeftSec = settings.timePerQuestion;

// התחלה
updateHud();
loadQuestion();

// ================================
// טיימר
// ================================
function startTimer() {
  clearInterval(timerId);
  timeLeftSec = settings.timePerQuestion;
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
    barFill.style.transform = `scaleX(${ratio.toFixed(3)})`;
    drawTime();
  }, 50);
}

function drawTime() {
  const sec = Math.max(0, Math.ceil(timeLeftSec));
  timeLeft.textContent = `נשארו ${sec} שניות...`;
}

// ================================
// הצגת שאלה
// ================================
function loadQuestion() {
  const item = bank[current];
  if (!item) {
    endExam("המבחן נגמר", "סיימת את כל השאלות! כל הכבוד 👏");
    return;
  }

  if (!item.options || item.options.length < 4) {
    console.error("❌ שאלה פגומה:", item);
    endExam("שגיאה במבחן", "שאלה חסרה/לא תקינה.");
    return;
  }

  // טקסט שאלה
  qText.textContent = item.q;
  qMeta.textContent = `שאלה ${current + 1} מתוך ${settings.numQuestions}`;

  // עיגולי סטטוס
  resetCircles();
  if (difficultyMap[item.id] === "easy") circleEasy.classList.add("active");
  if (difficultyMap[item.id] === "hard") circleHard.classList.add("active");

  // תשובות
  const answers = item.options;
  const order = [0, 1, 2, 3];
  shuffle(order);

  optionsWrap.innerHTML = "";

  order.forEach((realIndex, visualIndex) => {
    const btn = document.createElement("button");
    btn.className = "option";
    btn.textContent = answers[realIndex];

    btn.dataset.realIndex = realIndex;
    btn.dataset.visualIndex = visualIndex;

    btn.addEventListener("click", () => handleAnswer(visualIndex));
    optionsWrap.appendChild(btn);
  });

  startTimer();
}

// ================================
// איפוס עיגולים
// ================================
function resetCircles() {
  circleEasy.classList.remove("active");
  circleHard.classList.remove("active");
}

// ================================
// טיפול בבחירת תשובה
// ================================
function handleAnswer(visualIndex) {
  const item = bank[current];
  const id = item.id;

  const buttons = [...optionsWrap.children];
  buttons.forEach((b) => b.classList.add("disabled"));
  clearInterval(timerId);

  const realChosenIndex =
    visualIndex === -1 ? -1 : parseInt(buttons[visualIndex].dataset.realIndex);

  const correctBtn = buttons.find(
    (b) => parseInt(b.dataset.realIndex) === item.correct
  );

  const isCorrect = realChosenIndex === item.correct;

  if (visualIndex !== -1) {
    const chosenBtn = buttons[visualIndex];
    chosenBtn.classList.add(isCorrect ? "correct" : "wrong");
  }
  correctBtn.classList.add("correct");

  if (!isCorrect) fails++;

  // עדכון רמת השאלה
  const prev = difficultyMap[id] || "neutral";

  if (isCorrect) {
    if (prev === "neutral") difficultyMap[id] = "easy";
    else if (prev === "hard") difficultyMap[id] = "neutral";
  } else {
    if (prev === "neutral") difficultyMap[id] = "hard";
    else if (prev === "easy") difficultyMap[id] = "neutral";
  }

  saveDifficulty();
  updateHud();

  if (settings.maxFails !== 0 && fails > settings.maxFails) {
    setTimeout(
      () => endExam("חרגת ממספר הפסילות", "המבחן נגמר. נסה שוב ✋"),
      700
    );
    return;
  }

  setTimeout(() => {
    current++;
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

  const progress = Math.round((current / settings.numQuestions) * 100);
  progressView.textContent = `התקדמות: ${progress}%`;
}

// ================================
// סיום מבחן
// ================================
function endExam(title, sub) {
  clearInterval(timerId);
  endTitle.textContent = title;
  endSub.textContent = sub;
  endOverlay.classList.add("show");
}

document.getElementById("againBtn").addEventListener("click", () => {
  current = 0;
  fails = 0;

  shuffle(bank);
  endOverlay.classList.remove("show");
  updateHud();
  loadQuestion();
});

document.getElementById("backBtn").addEventListener("click", () => {
  location.href = "select-method.html";
});

// ================================
// shuffle
// ================================
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
