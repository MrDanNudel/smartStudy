// ==========================
//  משתנים ראשיים
// ==========================
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

let settings = {
  timePerQuestion: 30, // שניות
  numQuestions: 20,
  maxFails: 5,
};

let currentField = null;

// ==========================
//  פתיחת חלון קלט
// ==========================
function openModal(field, title, min, max, suffix) {
  currentField = { field, min, max, suffix };
  modalTitle.textContent = title;
  modalInput.value = settings[field];
  modal.style.display = "flex";
  modalInput.focus();
  modalInput.min = min;
  modalInput.max = max;
}

// ==========================
//  שמירה
// ==========================
saveBtn.addEventListener("click", () => {
  const val = parseInt(modalInput.value);
  if (isNaN(val) || val < currentField.min || val > currentField.max) {
    alert(`הזן ערך בין ${currentField.min} ל-${currentField.max}`);
    return;
  }
  settings[currentField.field] = val;
  modal.style.display = "none";
  updateUI();
});

// ==========================
//  ביטול
// ==========================
cancelBtn.addEventListener("click", () => (modal.style.display = "none"));

// ==========================
//  כפתורי פתיחת הגדרות
// ==========================
timeBtn.addEventListener("click", () =>
  openModal("timePerQuestion", "הגדר זמן לשאלה (בשניות)", 10, 90, " שניות")
);
questionsBtn.addEventListener("click", () =>
  openModal("numQuestions", "הגדר מספר שאלות", 10, 50, " שאלות")
);
failsBtn.addEventListener("click", () =>
  openModal("maxFails", "הגדר מספר פסילות", 0, 5, " פסילות")
);

// ==========================
//  עדכון תצוגה
// ==========================
function updateUI() {
  timeValue.textContent = `${settings.timePerQuestion} שניות`;
  questionsValue.textContent = `${settings.numQuestions} שאלות`;
  failsValue.textContent = `עד ${settings.maxFails} פסילות`;
  localStorage.setItem("examSettings", JSON.stringify(settings));
}

// ==========================
//  טעינה ראשונית
// ==========================
window.addEventListener("load", () => {
  const saved = localStorage.getItem("examSettings");
  if (saved) settings = JSON.parse(saved);
  updateUI();

  // --- הצגת הנושא שנבחר בכותרת ---
  const params = new URLSearchParams(window.location.search);
  const subject = params.get("subject");
  const titleEl = document.querySelector(".page-title");

  if (titleEl) {
    if (subject) {
      titleEl.textContent = `הגדרות למבחן ב: ${subject}`;
    } else {
      titleEl.textContent = "הגדרות למבחן";
    }
  }
});

// ==========================
//  התחלת מבחן
// ==========================
// ==========================
//  התחלת מבחן
// ==========================
document.getElementById("start-btn").addEventListener("click", () => {
  // שומר את ההגדרות (גם אם המשתמש לא שינה כלום)
  localStorage.setItem("examSettings", JSON.stringify(settings));

  // מעביר לדף הבחינה עם פרמטרים ב־URL
  const query = new URLSearchParams({
    time: settings.timePerQuestion,
    questions: settings.numQuestions,
    fails: settings.maxFails,
  }).toString();

  window.location.href = `exam.html?${query}`;
});

// ==========================
//  ניווט עליון
// ==========================

// כפתור חזרה לעמוד הקודם
document.getElementById("prev-page").addEventListener("click", () => {
  if (window.history.length > 1) {
    window.history.back();
  } else {
    window.location.href = "select-method.html";
  }
});

// כפתור חזרה לעמוד הבית + איפוס נושא נבחר
document.getElementById("home-page").addEventListener("click", () => {
  localStorage.removeItem("selectedSubjectLabel");
  localStorage.removeItem("selectedSubjectKey");
  window.location.href = "index.html";
});
