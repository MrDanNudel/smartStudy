// ================================
// קריאת הגדרות מה־URL / localStorage
// ================================
const url = new URLSearchParams(location.search);
const saved = JSON.parse(localStorage.getItem("examSettings") || "{}");

const settings = {
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
  url.get("subject") || localStorage.getItem("selectedSubjectLabel") || "כימיה";

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
// טעינת מאגר
// ================================
let bank = (window.examBank || []).slice();
shuffle(bank);
bank = bank.slice(0, settings.numQuestions);

let current = 0;
let fails = 0;
let timerId = null;
let timeLeftSec = settings.timePerQuestion;

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
  timeLeft.textContent = `..נשארו ${sec} שניות`;
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

  qText.textContent = item.q;
  qMeta.textContent = `שאלה ${current + 1} מתוך ${settings.numQuestions}`;

  const answers = item.a || item.options;

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

  resetCircles();
  startTimer();
}

// ================================
// איפוס העיגולים
// ================================
function resetCircles() {
  circleEasy.classList.remove("active");
  circleHard.classList.remove("active");
}

// ================================
// טיפול בבחירת תשובה — מתוקן ✔
// ================================
function handleAnswer(visualIndex) {
  const buttons = [...optionsWrap.children];

  buttons.forEach((b) => b.classList.add("disabled"));
  clearInterval(timerId);

  const item = bank[current];
  const answers = item.a || item.options;

  const realChosenIndex =
    visualIndex === -1 ? -1 : parseInt(buttons[visualIndex].dataset.realIndex);

  const correctBtn = buttons.find(
    (b) => parseInt(b.dataset.realIndex) === item.correct
  );

  let isCorrect = realChosenIndex === item.correct;

  // ============================
  // ⭐ הפעלת עיגולים לפי הצלחה ⭐
  // ============================
  if (isCorrect) {
    circleEasy.classList.add("active");
  } else {
    circleHard.classList.add("active");
  }

  // סימון בחירה
  if (visualIndex !== -1) {
    const chosenBtn = buttons[visualIndex];
    if (isCorrect) chosenBtn.classList.add("correct");
    else chosenBtn.classList.add("wrong");
  } else {
    fails++;
  }

  correctBtn.classList.add("correct");

  if (!isCorrect) fails++;

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
  }, 1800);
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

  bank = (window.examBank || []).slice();
  shuffle(bank);
  bank = bank.slice(0, settings.numQuestions);

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
