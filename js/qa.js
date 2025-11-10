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

// ערבוב השאלות
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
bank = shuffle(bank).slice(0, numQuestions);

let current = 0;

// שליפת אלמנטים
const questionText = document.getElementById("questionText");
const answerInput = document.getElementById("answerInput");
const showAnswerBtn = document.getElementById("showAnswerBtn");
const feedback = document.getElementById("feedback");
const progressText = document.getElementById("progressText");
const nextBtn = document.getElementById("nextQuestion");
const prevBtn = document.getElementById("prevQuestion");

// הצגת שאלה ראשונה
loadQuestion();

function loadQuestion() {
  const q = bank[current];
  questionText.textContent = q.q;
  feedback.textContent = "";
  progressText.textContent = `שאלה ${current + 1} מתוך ${bank.length}`;
  answerInput.value = "";
  answerInput.style.display = "block";
  showAnswerBtn.style.display = "inline-block";

  prevBtn.disabled = current === 0;
  nextBtn.disabled = current === bank.length - 1;
}

// כפתור "הצג תשובה"
showAnswerBtn.onclick = () => {
  const q = bank[current];
  const userAnswer = answerInput.value.trim();

  // הצגת תשובות
  feedback.innerHTML = `
    <div>🔹 <b>התשובה שלך:</b> ${userAnswer || "לא נכתבה תשובה"}</div>
    <div>✅ <b>תשובה נכונה:</b> ${q.a[q.correct]}</div>
  `;
  feedback.style.color = "#7ddfff";

  // הסתרת קלט וכפתור
  answerInput.style.display = "none";
  showAnswerBtn.style.display = "none";
};

// ניווט קדימה
nextBtn.onclick = () => {
  if (current < bank.length - 1) {
    current++;
    loadQuestion();
  }
};

// ניווט אחורה
prevBtn.onclick = () => {
  if (current > 0) {
    current--;
    loadQuestion();
  }
};
