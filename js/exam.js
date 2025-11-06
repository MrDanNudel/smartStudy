// ================================
// קריאת הגדרות מה־URL / localStorage
// ================================
const url = new URLSearchParams(location.search);
const settings = {
  timePerQuestion:
    parseInt(url.get("time")) ||
    JSON.parse(localStorage.getItem("examSettings") || "{}").timePerQuestion ||
    30,
  numQuestions:
    parseInt(url.get("questions")) ||
    JSON.parse(localStorage.getItem("examSettings") || "{}").numQuestions ||
    20,
  maxFails:
    parseInt(url.get("fails")) ||
    JSON.parse(localStorage.getItem("examSettings") || "{}").maxFails ||
    5,
};

const subjectLabel =
  url.get("subject") || localStorage.getItem("selectedSubjectLabel") || "כימיה";
const subjectKey =
  url.get("key") || localStorage.getItem("selectedSubjectKey") || "chemistry";

// ================================
// הפניות לאלמנטים
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

// ================================
// כותרת נושא
// ================================
subjectTitle.textContent = subjectLabel;
requestAnimationFrame(() => subjectTitle.classList.add("visible"));

// ================================
// מאגר שאלות – כימיה
// ================================
const chemistryQuestions = [
  { q: "מהו הסימן הכימי של מים?", a: ["H2O", "HO2", "O2H", "H3O"], correct: 0 },
  { q: "כמה פרוטונים יש במימן רגיל?", a: ["1", "0", "2", "3"], correct: 0 },
  {
    q: "איזה קשר קיים במולקולת NaCl?",
    a: ["יוני", "קובלנטי", "מתכתי", "מימני"],
    correct: 0,
  },
  {
    q: "מה ה-pH של מים טהורים בטמפרטורת חדר?",
    a: ["7", "0", "14", "4"],
    correct: 0,
  },
  {
    q: "איזה חלקיק בעל מטען שלילי?",
    a: ["אלקטרון", "פרוטון", "נויטרון", "אלפה"],
    correct: 0,
  },
  {
    q: "איזוטופים של אותו יסוד נבדלים במספר ה־",
    a: ["נויטרונים", "פרוטונים", "אלקטרונים", "מטענים"],
    correct: 0,
  },
  {
    q: "איזו קבוצה נקראת ‘גזים אצילים’?",
    a: ["קבוצה 18", "קבוצה 1", "קבוצה 7", "קבוצה 2"],
    correct: 0,
  },
  { q: "מה הסמל הכימי של פחמן?", a: ["C", "Ca", "Cr", "Co"], correct: 0 },
  {
    q: "איזו חומצה נמצאת בקיבה?",
    a: ["HCl", "H2SO4", "HNO3", "CH3COOH"],
    correct: 0,
  },
  {
    q: "איזה תהליך משחרר אנרגיה?",
    a: ["אקסותרמי", "אנדותרמי", "איזותרמי", "איזוברי"],
    correct: 0,
  },
  { q: "מהו CH4?", a: ["מתאן", "אתאן", "בנזן", "אתילן"], correct: 0 },
  {
    q: "איזו יחידה מודדת כמות חומר?",
    a: ["מול", "גרם", "ליטר", "ג׳אול"],
    correct: 0,
  },
  { q: "איזו מולקולה פולרית?", a: ["H2O", "CO2", "CH4", "O2"], correct: 0 },
  {
    q: "מה שם התהליך מעבר מנוזל לגז?",
    a: ["אידוי", "עיבוי", "התכה", "קפיאה"],
    correct: 0,
  },
  {
    q: "איזה יסוד הוא מתכת אלקלית?",
    a: ["נתרן", "ברום", "כספית", "אלומיניום"],
    correct: 0,
  },
  {
    q: "איזה גז מהווה כ־78% מהאוויר?",
    a: ["חנקן", "חמצן", "ארגון", "פחמן דו־חמצני"],
    correct: 0,
  },
  {
    q: "מהו CaCO3?",
    a: ["סידן פחמתי", "סידן כלורי", "סידן חנקתי", "סידן תחמוצתי"],
    correct: 0,
  },
  {
    q: "איזה גז משתחרר בתגובה חומצה + מתכת?",
    a: ["מימן", "חמצן", "חנקן", "פחמן דו־חמצני"],
    correct: 0,
  },
  {
    q: "איזה יסוד מרכזי בחלבונים?",
    a: ["חנקן", "נתרן", "ברזל", "סידן"],
    correct: 0,
  },
  {
    q: "איזו מולקולה ארומטית?",
    a: ["בנזן", "פרופאן", "אתילן", "אצטון"],
    correct: 0,
  },
];

// מאגר לפי נושא
const banks = {
  chemistry: chemistryQuestions,
};

// ================================
// לוגיקת מבחן
// ================================
let bank = (banks[subjectKey] || chemistryQuestions).slice();
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

  const idxs = [0, 1, 2, 3];
  shuffle(idxs);

  optionsWrap.innerHTML = "";
  idxs.forEach((i) => {
    const btn = document.createElement("button");
    btn.className = "option";
    btn.textContent = item.a[i];
    btn.addEventListener("click", () => handleAnswer(i));
    optionsWrap.appendChild(btn);
  });

  startTimer();
}

// ================================
// טיפול בבחירת תשובה
// ================================
function handleAnswer(chosenIndex) {
  [...optionsWrap.children].forEach((b) => b.classList.add("disabled"));
  clearInterval(timerId);

  const item = bank[current];
  const buttons = [...optionsWrap.children];
  const correctText = item.a[item.correct];
  let chosenBtn = null,
    correctBtn = null;

  buttons.forEach((b) => {
    if (b.textContent === correctText) correctBtn = b;
  });

  if (chosenIndex === -1) {
    fails++;
  } else {
    chosenBtn = buttons.find((b) => b.textContent === item.a[chosenIndex]);
    if (chosenIndex === item.correct) {
      chosenBtn.classList.add("correct");
    } else {
      fails++;
      chosenBtn && chosenBtn.classList.add("wrong");
    }
  }

  if (chosenIndex !== item.correct)
    correctBtn && correctBtn.classList.add("correct");

  updateHud();

  if (fails > settings.maxFails) {
    setTimeout(
      () => endExam("חרגת ממספר הפסילות", "המבחן נגמר. נסה שוב מאוחר יותר ✋"),
      700
    );
    return;
  }

  setTimeout(() => {
    current++;
    updateHud();
    loadQuestion();
  }, 800);
}

// ================================
// עדכון HUD
// ================================
function updateHud() {
  failsView.textContent = `פסילות: ${fails} / ${settings.maxFails}`;
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
  bank = (banks[subjectKey] || chemistryQuestions).slice();
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
// פונקציה לעירבוב שאלות
// ================================
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
