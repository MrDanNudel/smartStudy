// ===============================
// משתנים ראשיים
// ===============================
const modal = document.getElementById("modal");
const modalInput = document.getElementById("modal-input");
const modalTitle = document.getElementById("modal-title");
const saveBtn = document.getElementById("save-btn");
const cancelBtn = document.getElementById("cancel-btn");

const timeBtn = document.getElementById("time-btn");
const questionsBtn = document.getElementById("questions-btn");
const failsBtn = document.getElementById("fails-btn");

const timeValue = document.getElementById("time-value");
const questionsValue = document.getElementById("questions-value");
const failsValue = document.getElementById("fails-value");

// ===============================
// טעינת סטטוס קל/קשה מה-localStorage
// ===============================
let difficultyMap = JSON.parse(localStorage.getItem("easyHardStats") || "{}");

let settings = {
  subtopic: "all",
  type: "all", // all / easy / hard
  timePerQuestion: 30,
  numQuestions: 20,
  maxFails: 5,
};

let currentField = null;

// מספר שאלות מקסימלי שיש בתת הנושא ובמסנן
let maxQuestionsAvailable = 100;

// ===============================
// פתיחת חלון קלט
// ===============================
function openModal(field, title, min, max, suffix) {
  currentField = { field, min, max, suffix };
  modalTitle.textContent = title;
  modalInput.value = settings[field];
  modal.style.display = "flex";
  modalInput.focus();
  modalInput.min = min;
  modalInput.max = max;
}

// ===============================
// שמירת ערך
// ===============================
saveBtn.addEventListener("click", () => {
  const val = parseInt(modalInput.value);

  if (isNaN(val) || val < currentField.min || val > currentField.max) {
    alert(`הכנס ערך בין ${currentField.min} ל-${currentField.max}`);
    return;
  }

  settings[currentField.field] = val;
  modal.style.display = "none";
  updateUI();
});

cancelBtn.addEventListener("click", () => (modal.style.display = "none"));

// ===============================
// עדכון ממשק
// ===============================
function updateUI() {
  timeValue.textContent = `${settings.timePerQuestion} שניות`;
  questionsValue.textContent = `${settings.numQuestions} שאלות`;

  if (settings.maxFails === 0) {
    failsValue.textContent = "ללא הגבלת טעויות";
  } else {
    failsValue.textContent = `עד ${settings.maxFails} פסילות`;
  }

  localStorage.setItem("examSettings", JSON.stringify(settings));
}

// ===============================
// חישוב מחדש של מספר שאלות זמינות
// ===============================
function recalcMaxQuestions() {
  if (!window.examBank) {
    maxQuestionsAvailable = 10;
    return;
  }

  let filtered = examBank.slice();

  // --- סינון לפי נושא ---
  const subject = localStorage.getItem("selectedSubjectKey");
  if (subject) {
    filtered = filtered.filter((q) => q.subject === subject);
  }

  // --- סינון לפי תת־נושא ---
  if (settings.subtopic !== "all") {
    filtered = filtered.filter((q) => q.subtopic === settings.subtopic);
  }

  // --- סינון לפי רמת קושי ---
  if (settings.type === "easy") {
    // easy = שאלות שלא סומנו עדיין או שסומנו כקלות
    filtered = filtered.filter(
      (q) => !difficultyMap[q.id] || difficultyMap[q.id] === "easy"
    );
  } else if (settings.type === "hard") {
    // hard = רק שאלות שסומנו כקשות
    filtered = filtered.filter((q) => difficultyMap[q.id] === "hard");
  }

  maxQuestionsAvailable = filtered.length;

  if (settings.numQuestions > maxQuestionsAvailable) {
    settings.numQuestions = maxQuestionsAvailable;
  }

  updateUI();
}

// ===============================
// טעינה ראשונית
// ===============================
window.addEventListener("load", () => {
  const saved = localStorage.getItem("examSettings");
  if (saved) settings = JSON.parse(saved);

  updateUI();
  recalcMaxQuestions();

  document.getElementById("subtopicSelect").addEventListener("change", (e) => {
    settings.subtopic = e.target.value;
    recalcMaxQuestions();
  });

  document.getElementById("typeSelect").addEventListener("change", (e) => {
    settings.type = e.target.value;
    recalcMaxQuestions();
  });
});

// ===============================
// כפתורי פתיחת מודאלים
// ===============================
timeBtn.addEventListener("click", () =>
  openModal("timePerQuestion", "הגדר זמן לכל שאלה", 10, 90, " שניות")
);

questionsBtn.addEventListener("click", () =>
  openModal(
    "numQuestions",
    `בחר מספר שאלות (עד ${maxQuestionsAvailable})`,
    5,
    maxQuestionsAvailable,
    " שאלות"
  )
);

failsBtn.addEventListener("click", () =>
  openModal("maxFails", "הגדר מספר פסילות", 0, 5, " פסילות")
);

// ===============================
// כפתור התחל מבחן
// ===============================
document.getElementById("start-btn").addEventListener("click", () => {
  localStorage.setItem("examSettings", JSON.stringify(settings));

  const subject = localStorage.getItem("selectedSubjectKey") || "none";

  const query = new URLSearchParams({
    subject: subject,
    subtopic: settings.subtopic,
    type: settings.type,
    time: settings.timePerQuestion,
    questions: settings.numQuestions,
    fails: settings.maxFails,
  }).toString();

  window.location.href = `exam.html?${query}`;
});
