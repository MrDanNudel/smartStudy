// ================================
// קריאת הגדרות מה־URL / localStorage
// ================================
const url = new URLSearchParams(location.search);
const saved = JSON.parse(localStorage.getItem("examSettings") || "{}");
const questionSubtopic = document.getElementById("questionSubtopic");
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
  educationalThought: "מחשבת החינוך",
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
const settingsBtn = document.getElementById("settingsBtn");
const methodBtn = document.getElementById("methodBtn");
const endHomeBtn = document.getElementById("endHomeBtn");

// ================================
// טעינת סטטוס קל/קשה
// ================================
let difficultyMap = JSON.parse(localStorage.getItem("easyHardStats") || "{}");

function saveDifficulty() {
  localStorage.setItem("easyHardStats", JSON.stringify(difficultyMap));
}

// ================================
// קבלת מצב השאלה
// ================================
// כל ערך שאינו easy או hard נחשב "לא סומנה".
// הדבר מטפל גם בערכים ישנים מסוג neutral.
function getQuestionStatus(question) {
  const status = difficultyMap[question.id];

  if (status === "easy" || status === "hard") {
    return status;
  }

  return "unsorted";
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

let bank = originalBank.filter((question) => {
  const matchesSubtopic =
    settings.subtopic === "all" || question.subtopic === settings.subtopic;

  const matchesType =
    settings.type === "all" || getQuestionStatus(question) === settings.type;

  return matchesSubtopic && matchesType;
});

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
let correctAnswers = 0;
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
function getExamResultText(percent) {
  if (percent === 100) {
    return {
      title: "מושלם! 🏆",
      subtitle: `ענית נכון על ${percent}% מהמבחן. שליטה מלאה בחומר!`,
    };
  }

  if (percent >= 90) {
    return {
      title: "מצוין! 🌟",
      subtitle: `ענית נכון על ${percent}% מהמבחן. הישג מרשים מאוד!`,
    };
  }

  if (percent >= 75) {
    return {
      title: "כל הכבוד! 👏",
      subtitle: `ענית נכון על ${percent}% מהמבחן. יש לך שליטה טובה בחומר.`,
    };
  }

  if (percent >= 60) {
    return {
      title: "עבודה טובה 👍",
      subtitle: `ענית נכון על ${percent}% מהמבחן. עוד קצת תרגול ותשתפר משמעותית.`,
    };
  }

  if (percent >= 40) {
    return {
      title: "יש מקום לשיפור 📚",
      subtitle: `ענית נכון על ${percent}% מהמבחן. כדאי לחזור על הנושאים שבהם טעית.`,
    };
  }

  if (percent >= 20) {
    return {
      title: "ממשיכים להתאמן 💪",
      subtitle: `ענית נכון על ${percent}% מהמבחן. חזרה נוספת על החומר תעזור לך.`,
    };
  }

  return {
    title: "כדאי לנסות שוב 🔄",
    subtitle: `ענית נכון על ${percent}% מהמבחן. מומלץ לעבור שוב על החומר לפני ניסיון נוסף.`,
  };
}
// ================================
// הצגת שאלה
// ================================
function loadQuestion() {
  const item = bank[current];

  if (!item) {
    const correctPercent =
      bank.length > 0 ? Math.round((correctAnswers / bank.length) * 100) : 0;

    const resultText = getExamResultText(correctPercent);

    endExam(resultText.title, resultText.subtitle);

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

  if (questionSubtopic) {
    questionSubtopic.textContent = `${item.subtopic || "ללא תת־נושא"}`;
  }

  qText.textContent = item.q;

  qMeta.textContent = `שאלה ${current + 1} מתוך ${bank.length}`;

  resetCircles();

  const currentStatus = getQuestionStatus(item);

  if (currentStatus === "easy") {
    circleEasy?.classList.add("active");
  }

  if (currentStatus === "hard") {
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

  // מונע לחיצה נוספת לאחר בחירת תשובה
  buttons.forEach((button) => {
    button.classList.add("disabled");
    button.disabled = true;
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

  // סימון התשובה שנבחרה
  if (visualIndex !== -1) {
    const chosenButton = buttons[visualIndex];

    chosenButton?.classList.add(isCorrect ? "correct" : "wrong");
  }

  // הצגת התשובה הנכונה
  correctButton?.classList.add("correct");

  // ================================
  // ספירת תשובות נכונות ושגויות
  // ================================
  if (isCorrect) {
    correctAnswers += 1;
  } else {
    fails += 1;
  }

  // ================================
  // עדכון רמת השאלה
  // ================================
  const previousStatus = getQuestionStatus(item);
  let nextStatus = previousStatus;

  if (isCorrect) {
    if (previousStatus === "unsorted") {
      nextStatus = "easy";
    } else if (previousStatus === "hard") {
      nextStatus = "unsorted";
    }
  } else {
    if (previousStatus === "unsorted") {
      nextStatus = "hard";
    } else if (previousStatus === "easy") {
      nextStatus = "unsorted";
    }
  }

  // מצב ללא סימון נשמר באמצעות מחיקת הרשומה
  if (nextStatus === "unsorted") {
    delete difficultyMap[id];
  } else {
    difficultyMap[id] = nextStatus;
  }

  saveDifficulty();
  updateHud();

  // ================================
  // בדיקת מספר הפסילות
  // ================================
  if (settings.maxFails !== 0 && fails > settings.maxFails) {
    setTimeout(() => {
      const answeredQuestions = correctAnswers + fails;

      const correctPercent =
        answeredQuestions > 0
          ? Math.round((correctAnswers / answeredQuestions) * 100)
          : 0;

      endExam(
        "חרגת ממספר הפסילות",
        `ענית נכון על ${correctPercent}% מהשאלות שענית עליהן.`,
      );
    }, 700);

    return;
  }

  // ================================
  // מעבר לשאלה הבאה
  // ================================
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
  correctAnswers = 0;

  shuffle(bank);

  endOverlay.classList.remove("show");

  updateHud();
  loadQuestion();
});

// ================================
// חזרה לבחירת שיטה
// ================================
// ================================
// מעבר להגדרות המבחן
// ================================
settingsBtn?.addEventListener("click", () => {
  location.href = `exam-settings.html?subject=${encodeURIComponent(subjectKey)}`;
});

// ================================
// מעבר לבחירת שיטת התרגול
// ================================
methodBtn?.addEventListener("click", () => {
  location.href = `select-method.html?subject=${encodeURIComponent(subjectKey)}`;
});

// ================================
// מעבר לדף הבית
// ================================
endHomeBtn?.addEventListener("click", () => {
  localStorage.removeItem("selectedSubjectKey");
  localStorage.removeItem("selectedSubjectLabel");
  localStorage.removeItem("selectedMethodKey");
  localStorage.removeItem("selectedMethodLabel");

  location.href = "index.html";
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
