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
let maxQuestionsForSubject = 100; // ברירת מחדל — נעדכן לפי הנושא בפועל

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
  const val = Number.parseInt(modalInput.value, 10);
  if (Number.isNaN(val) || val < currentField.min || val > currentField.max) {
    alert(`הזן ערך בין ${currentField.min} ל-${currentField.max}`);
    return;
  }
  settings[currentField.field] = val; // נשמר כמספר
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
  openModal(
    "numQuestions",
    `הגדר מספר שאלות (עד ${maxQuestionsForSubject})`,
    5,
    maxQuestionsForSubject,
    " שאלות"
  )
);
failsBtn.addEventListener("click", () =>
  openModal("maxFails", "הגדר מספר פסילות", 0, 5, " פסילות")
);

// ==========================
//  עדכון תצוגה
// ==========================
function updateUI() {
  // עדכון זמן ושאלות
  timeValue.textContent = `${settings.timePerQuestion} שניות`;
  questionsValue.textContent = `${settings.numQuestions} שאלות`;

  // עדכון הפסילות
  const fails = Number(settings.maxFails);
  const failsValueEl = document.getElementById("fails-value");

  if (failsValueEl) {
    failsValueEl.textContent =
      fails === 0 ? "ללא הגבלת טעויות" : `עד ${fails} פסילות`;
  }

  // שמירה
  localStorage.setItem("examSettings", JSON.stringify(settings));
}

// ==========================
//  טעינה ראשונית
// ==========================
window.addEventListener("load", () => {
  // --- שליפת הנושא ---
  const params = new URLSearchParams(window.location.search);
  const subject = params.get("subject");
  const key =
    params.get("key") ||
    localStorage.getItem("selectedSubjectKey") ||
    "chemistry";

  // --- קביעת כמות השאלות לפי הנושא ---
  // (כאן אתה צריך לוודא שהמשתנים של הבנקים כבר נטענו לפני קובץ זה)
  try {
    const bank =
      (typeof banks !== "undefined" && banks[key]) ||
      (typeof psychologyQuestions !== "undefined" &&
        key === "psychology" &&
        psychologyQuestions) ||
      [];

    maxQuestionsForSubject = Array.isArray(bank) ? bank.length : 100;

    // אם המשתמש שמר הגדרות קודם
    const saved = localStorage.getItem("examSettings");
    if (saved) settings = JSON.parse(saved);

    // ודא שהערך לא חורג מהכמות בפועל
    if (settings.numQuestions > maxQuestionsForSubject) {
      settings.numQuestions = maxQuestionsForSubject;
    }

    updateUI();

    // הצגת כותרת הנושא
    const titleEl = document.querySelector(".page-title");
    if (titleEl) {
      titleEl.textContent = subject
        ? `הגדרות למבחן ב: ${subject}`
        : "הגדרות למבחן";
    }

    console.log(`נושא: ${key} | מספר שאלות זמינות: ${maxQuestionsForSubject}`);
  } catch (err) {
    console.error("שגיאה בקריאת בנק השאלות:", err);
  }
});

// ==========================
//  התחלת מבחן
// ==========================
document.getElementById("start-btn").addEventListener("click", () => {
  localStorage.setItem("examSettings", JSON.stringify(settings));

  const params = new URLSearchParams(window.location.search);
  const subject =
    params.get("subject") ||
    localStorage.getItem("selectedSubjectLabel") ||
    "נושא לא מוגדר";
  const key =
    params.get("key") ||
    localStorage.getItem("selectedSubjectKey") ||
    "chemistry";

  const query = new URLSearchParams({
    time: settings.timePerQuestion,
    questions: settings.numQuestions,
    fails: settings.maxFails,
    subject: subject,
    key: key,
  }).toString();

  window.location.href = `exam.html?${query}`;
});

// ==========================
//  ניווט עליון
// ==========================
document.getElementById("prev-page").addEventListener("click", () => {
  if (window.history.length > 1) {
    window.history.back();
  } else {
    window.location.href = "select-method.html";
  }
});

document.getElementById("home-page").addEventListener("click", () => {
  localStorage.removeItem("selectedSubjectLabel");
  localStorage.removeItem("selectedSubjectKey");
  window.location.href = "index.html";
});
