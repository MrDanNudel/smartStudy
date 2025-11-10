// שליפת פרמטרים מה-URL
const params = new URLSearchParams(window.location.search);
const subjectKey = params.get("subject");
const numQuestions = parseInt(params.get("questions")) || 10;

// שליפת שאלות
let bank = banks[subjectKey] || [];

if (bank.length === 0) {
  alert("לא נמצאו שאלות לנושא זה");
  window.location.href = "index.html";
}

// ערבוב שאלות ובחירת כמות
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

bank = shuffle([...bank]).slice(0, numQuestions); // ✅ קודם חותכים לפי הכמות שביקשו

let current = 0;

// אלמנטים
const questionText = document.getElementById("questionText");
const answerInput = document.getElementById("answerInput");
const showAnswerBtn = document.getElementById("showAnswerBtn");
const feedback = document.getElementById("feedback");
const progressText = document.getElementById("progressText");
const nextBtn = document.getElementById("nextQuestion");
const prevBtn = document.getElementById("prevQuestion");
const subjectTitle = document.querySelector(".subject-name");
const progressBar = document.getElementById("progressBar");

// שמות נושאים
const SUBJECT_TITLES = {
  anatomy: "אנטומיה",
  chemistry: "כימיה",
  psychology: "פסיכולוגיה",
  literacy: "אוריינות שפתית",
  basketball: "יסודות בכדורסל",
  athletics: "יסודות באתלטיקה",
  statistics: "סטטיסטיקה",
  football: "יסודות בכדורגל",
  physics: "פיזיקה",
};
subjectTitle.textContent = SUBJECT_TITLES[subjectKey] || "נושא לא ידוע";

// === הצגת שאלה ===
function loadQuestion() {
  const q = bank[current];

  // הגנה – אם אין שאלה
  if (!q) return;

  questionText.textContent = q.q;
  feedback.classList.remove("show");
  feedback.innerHTML = "";
  answerInput.value = "";
  showAnswerBtn.textContent = "הצג תשובה";

  // עדכון מצב כפתורים
  prevBtn.disabled = current === 0;
  nextBtn.disabled = current === bank.length - 1;

  // עדכון התקדמות
  updateProgress();
}

// === עדכון בר התקדמות ===
function updateProgress() {
  const progressPercent = ((current + 1) / bank.length) * 100;
  progressBar.style.width = `${progressPercent}%`;
  progressText.textContent = `שאלה ${current + 1} מתוך ${bank.length}`;
}

// === כפתור הצגת תשובה / הסתרה ===
showAnswerBtn.onclick = () => {
  const q = bank[current];
  const correct = q.a[q.correct] || q.a;

  if (!feedback.classList.contains("show")) {
    feedback.innerHTML = `<div>✅ <span class="correct-answer">${correct}</span></div>`;
    feedback.classList.add("show");
    showAnswerBtn.textContent = "הסתר תשובה";
  } else {
    feedback.innerHTML = "";
    feedback.classList.remove("show");
    showAnswerBtn.textContent = "הצג תשובה";
  }
};

// === ניווט קדימה ===
nextBtn.onclick = () => {
  if (current < bank.length - 1) {
    current++;
    loadQuestion();
  }
};

// === ניווט אחורה ===
prevBtn.onclick = () => {
  if (current > 0) {
    current--;
    loadQuestion();
  }
};

// ✅ טעינה רק אחרי שבנינו את השאלות
window.addEventListener("DOMContentLoaded", () => {
  loadQuestion();
});
