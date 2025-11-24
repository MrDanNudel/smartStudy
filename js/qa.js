// ===============================
// Q&A Practice Logic — Smart Study (Subtopic + Circles Edition)
// ===============================

// === שליפת פרמטרים מה-URL ===
const params = new URLSearchParams(window.location.search);
const subjectKey = params.get("subject") || "chemistry";
const currentModeFromUrl = params.get("mode") || "all";
const numQuestionsRequested = parseInt(params.get("questions"), 10) || 10;
const selectedSubtopic = params.get("subtopic") || "all";

// === טעינת מאגר ===
let bank = (window.qaBanks && window.qaBanks[subjectKey]) || [];

if (!bank || bank.length === 0) {
  alert("לא נמצאו שאלות לנושא זה");
  window.location.href = "index.html";
}

// ⭐ סינון לפי תת־נושא
if (selectedSubtopic !== "all") {
  bank = bank.filter((q) => q.subtopic === selectedSubtopic);
}

// === ערבוב ===
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// === מצב GLOBAL ===
const fullBank = [...bank]; // כל השאלות של הנושא + תת-הנושא (לא לפי מצב תרגול)
let currentMode = currentModeFromUrl;

let filteredBank = [];
let currentBank = [];
let current = 0;

// === טעינת סימוני קל/קשה מהזיכרון (GLOBAL לכל האפליקציה) ===
let hardQuestions = JSON.parse(localStorage.getItem("hardQuestions") || "[]"); // ["שאלה 1", ...]
let easyQuestions = JSON.parse(localStorage.getItem("easyQuestions") || "[]");

// === אלמנטים ===
const questionText = document.getElementById("questionText");
const progressText = document.getElementById("progressText");
const progressBar = document.getElementById("progressBar");

const showAnswerBtn = document.getElementById("showAnswerBtn");
const answerInput = document.getElementById("answerInput");
const feedback = document.getElementById("feedback");

const nextBtn = document.getElementById("nextQuestion");
const prevBtn = document.getElementById("prevQuestion");

const orderMode = document.getElementById("orderMode");
const randomMode = document.getElementById("randomMode");

const circleEasy = document.getElementById("circleEasy");
const circleHard = document.getElementById("circleHard");

// === שמות נושאים ===
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
};

document.querySelector(".subject-name").textContent =
  SUBJECT_TITLES[subjectKey] || subjectKey;

// === הצגת תת־נושא מתחת לכותרת ===
const subtopicNameEl = document.getElementById("subtopicName");
if (subtopicNameEl) {
  if (selectedSubtopic !== "all") {
    // תת־נושא ספציפי שנבחר
    subtopicNameEl.textContent = selectedSubtopic;
  } else {
    // אם לא רוצים שורה בכלל במצב "כל תתי-הנושאים" אפשר לשים "".
    subtopicNameEl.textContent = "כל תתי־הנושאים";
  }
}

// ===============================
// ⭐ בניית מאגר שאלות לפי מצב (all / hard / easy / unsorted) + תת־נושא
// ===============================
function buildFilteredBank() {
  if (currentMode === "hard") {
    filteredBank = fullBank.filter((q) => hardQuestions.includes(q.q.trim()));
  } else if (currentMode === "easy") {
    filteredBank = fullBank.filter((q) => easyQuestions.includes(q.q.trim()));
  } else if (currentMode === "unsorted") {
    filteredBank = fullBank.filter(
      (q) =>
        !hardQuestions.includes(q.q.trim()) &&
        !easyQuestions.includes(q.q.trim())
    );
  } else {
    filteredBank = fullBank.slice(); // all
  }

  // fallback אם אין שאלות במצב הזה
  if (filteredBank.length === 0) {
    filteredBank = fullBank.slice();
    currentMode = "all";
  }

  const maxCount = Math.min(numQuestionsRequested, filteredBank.length);

  const ordered = filteredBank.slice(0, maxCount);
  const randomd = shuffle(filteredBank.slice()).slice(0, maxCount);

  currentBank = orderMode.checked ? ordered : randomd;
  current = 0;
}

// ===============================
// צבע עיגולים
// ===============================
function updateCircleState(questionTxt) {
  const q = questionTxt.trim();

  circleEasy.classList.remove("active");
  circleHard.classList.remove("active");

  if (easyQuestions.includes(q)) {
    circleEasy.classList.add("active");
  } else if (hardQuestions.includes(q)) {
    circleHard.classList.add("active");
  }
}

// ===============================
// טעינת שאלה למסך
// ===============================
function loadQuestion() {
  const q = currentBank[current];
  if (!q) return;

  questionText.textContent = q.q;

  feedback.classList.remove("show");
  feedback.innerHTML = "";
  answerInput.value = "";
  showAnswerBtn.textContent = "הצג תשובה";

  prevBtn.disabled = current === 0;
  nextBtn.disabled = current === currentBank.length - 1;

  updateProgress();
  updateCircleState(q.q);
}

// ===============================
// בר התקדמות
// ===============================
function updateProgress() {
  const total = currentBank.length;
  const percent = ((current + 1) / total) * 100;
  progressBar.style.width = percent + "%";
  progressText.textContent = `שאלה ${current + 1} מתוך ${total}`;
}

// ===============================
// כפתור הצגת / הסתרת תשובה
// ===============================
showAnswerBtn.onclick = () => {
  const q = currentBank[current];
  const correct = q.answer || q.a;

  if (!feedback.classList.contains("show")) {
    feedback.innerHTML = `✅ ${correct}`;
    feedback.classList.add("show");
    showAnswerBtn.textContent = "הסתר תשובה";
  } else {
    feedback.innerHTML = "";
    feedback.classList.remove("show");
    showAnswerBtn.textContent = "הצג תשובה";
  }
};

// ===============================
// ניווט
// ===============================
nextBtn.onclick = () => {
  if (current < currentBank.length - 1) {
    current++;
    loadQuestion();
  }
};

prevBtn.onclick = () => {
  if (current > 0) {
    current--;
    loadQuestion();
  }
};

// ===============================
// סימון כקל
// ===============================
circleEasy.addEventListener("click", () => {
  const qText = questionText.textContent.trim();

  if (easyQuestions.includes(qText)) {
    easyQuestions = easyQuestions.filter((q) => q !== qText);
    circleEasy.classList.remove("active");
  } else {
    hardQuestions = hardQuestions.filter((q) => q !== qText);
    easyQuestions.push(qText);

    circleEasy.classList.add("active");
    circleHard.classList.remove("active");
  }

  localStorage.setItem("easyQuestions", JSON.stringify(easyQuestions));
  localStorage.setItem("hardQuestions", JSON.stringify(hardQuestions));

  updateStatusBar();
});

// ===============================
// סימון כקשה
// ===============================
circleHard.addEventListener("click", () => {
  const qText = questionText.textContent.trim();

  if (hardQuestions.includes(qText)) {
    hardQuestions = hardQuestions.filter((q) => q !== qText);
    circleHard.classList.remove("active");
  } else {
    easyQuestions = easyQuestions.filter((q) => q !== qText);
    hardQuestions.push(qText);

    circleHard.classList.add("active");
    circleEasy.classList.remove("active");
  }

  localStorage.setItem("easyQuestions", JSON.stringify(easyQuestions));
  localStorage.setItem("hardQuestions", JSON.stringify(hardQuestions));

  updateStatusBar();
});

// ===============================
// סטטוס תחתון — מחושב רק על השאלות של הנושא + תת־הנושא הנוכחי
// ===============================
function updateStatusBar() {
  const total = fullBank.length; // כל השאלות של הנושא/תת-נושא הנוכחי
  const bankTexts = fullBank.map((q) => q.q.trim());

  const hard = hardQuestions.filter((q) => bankTexts.includes(q.trim())).length;
  const easy = easyQuestions.filter((q) => bankTexts.includes(q.trim())).length;

  const unmarked = Math.max(total - hard - easy, 0); // הגנה מפני מספר שלילי

  const hardEl = document.getElementById("hardCount");
  const easyEl = document.getElementById("easyCount");
  const unmarkedEl = document.getElementById("unmarkedCount");

  if (hardEl) hardEl.textContent = `💪 שאלות קשות: ${hard}`;
  if (easyEl) easyEl.textContent = `💡 שאלות קלות: ${easy}`;
  if (unmarkedEl) unmarkedEl.textContent = `📄 שאלות שלא סומנו: ${unmarked}`;
}

// ===============================
// מצב סדר / אקראי
// ===============================
orderMode.addEventListener("change", () => {
  if (orderMode.checked) {
    currentBank = filteredBank.slice(0, currentBank.length);
    current = 0;
    loadQuestion();
  }
});

randomMode.addEventListener("change", () => {
  if (randomMode.checked) {
    currentBank = shuffle(filteredBank.slice()).slice(0, currentBank.length);
    current = 0;
    loadQuestion();
  }
});

// ===============================
// התחלת תרגול
// ===============================
window.addEventListener("DOMContentLoaded", () => {
  buildFilteredBank();
  loadQuestion();
  updateStatusBar();
});

// ===============================
// קיצורי מקלדת
// ===============================
window.addEventListener("keydown", (e) => {
  const key = e.key.toLowerCase();
  const code = e.code.toLowerCase();

  if (key === " " || code === "space") {
    e.preventDefault();
    showAnswerBtn.click();
    return;
  }

  if (key === "arrowright") {
    e.preventDefault();
    prevBtn.click();
    return;
  }

  if (key === "arrowleft") {
    e.preventDefault();
    nextBtn.click();
    return;
  }

  if (key === "e") {
    e.preventDefault();
    circleEasy.click();
    return;
  }

  if (key === "h") {
    e.preventDefault();
    circleHard.click();
    return;
  }
});
