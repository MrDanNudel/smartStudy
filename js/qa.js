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

// ערבוב שאלות
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// משתנים גלובליים
let fullBank = [...bank];
let currentBank = [...fullBank].slice(0, numQuestions);
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
const orderMode = document.getElementById("orderMode");
const randomMode = document.getElementById("randomMode");

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

// === טוען שאלה ===
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
}

// === עדכון בר התקדמות ===
function updateProgress() {
  const progressPercent = ((current + 1) / currentBank.length) * 100;
  progressBar.style.width = `${progressPercent}%`;
  progressText.textContent = `שאלה ${current + 1} מתוך ${currentBank.length}`;
}

// === הצגת תשובה ===
showAnswerBtn.onclick = () => {
  const q = currentBank[current];
  const correct = q.a[q.correct] || q.a;

  if (!feedback.classList.contains("show")) {
    feedback.innerHTML = `
      <div class="answer-wrapper">
        ✅ <span class="correct-answer">${correct}</span>
        <span class="info-icon" title="פירוט נוסף">❓</span>
      </div>
    `;
    feedback.classList.add("show");
    showAnswerBtn.textContent = "הסתר תשובה";

    const infoIcon = document.querySelector(".info-icon");
    infoIcon.addEventListener("click", showExplanationPopup);
  } else {
    feedback.innerHTML = "";
    feedback.classList.remove("show");
    showAnswerBtn.textContent = "הצג תשובה";
  }
};

// === פופאפ הסבר מעמיק ===
function showExplanationPopup() {
  const popup = document.createElement("div");
  popup.className = "explain-popup";
  popup.innerHTML = `
    <div class="popup-box">
      <p>פירוט מעמיק לתשובה בקרוב...!</p>
      <button id="closePopupBtn">סגור</button>
    </div>
  `;
  document.body.appendChild(popup);
  document
    .getElementById("closePopupBtn")
    .addEventListener("click", () => popup.remove());
}

// === ניווט קדימה / אחורה ===
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

// === מעבר בין מצבים (לפי הסדר / אקראי) ===
orderMode.addEventListener("change", () => {
  if (orderMode.checked) {
    currentBank = [...fullBank].slice(0, numQuestions);
    current = 0;
    loadQuestion();
  }
});
randomMode.addEventListener("change", () => {
  if (randomMode.checked) {
    currentBank = shuffle([...fullBank]).slice(0, numQuestions);
    current = 0;
    loadQuestion();
  }
});

// === טעינה ראשונית ===
window.addEventListener("DOMContentLoaded", () => {
  loadQuestion();
});
