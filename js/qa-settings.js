// ===============================
// Q&A Settings Logic — Smart Study
// ===============================

// קריאת פרמטר subject מה-URL (לדוגמה: ?subject=chemistry)
function getSubjectKey() {
  const url = new URL(window.location.href);
  return url.searchParams.get("subject") || "chemistry"; // ברירת מחדל
}

// מיפוי שם ידידותי לנושא בעברית
const subjectTitles = {
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

// מאגר כללי (נטען מהקובץ data/qa-bank.js)
const qaBanks = window.qaBanks || {}; // { chemistry: [...], physics: [...], ... }

// אחסון אלמנטים חשובים לשימוש חוזר
const els = {
  subjectLabel: document.getElementById("subjectLabel"),
  subjectBadge: document.getElementById("subjectBadge"),
  numInput: document.getElementById("numQuestions"),
  numHint: document.getElementById("numHint"),
  startBtn: document.getElementById("startBtn"),
};

(function init() {
  const subjectKey = getSubjectKey();
  console.log("subjectKey =", subjectKey);

  // שם הנושא בעברית (או אנגלית אם לא קיים תרגום)
  const title = subjectTitles[subjectKey] || subjectKey;

  // הצגת שם הנושא בכותרת ובתגית
  els.subjectLabel.textContent = title;
  els.subjectBadge.textContent = title;

  // טעינת מאגר השאלות לפי הנושא
  const bank = qaBanks[subjectKey] || [];
  const max = Math.max(10, bank.length);
  const min = 10;

  // הגדרת טווח הבחירה של מספר השאלות
  els.numInput.min = String(min);
  els.numInput.max = String(max);
  els.numInput.value = Math.min(
    Math.max(min, Number(els.numInput.value) || min),
    max
  );
  updateHint();

  // שינוי דינמי בעת הקלדה
  els.numInput.addEventListener("input", clampAndUpdate);

  // התחלת תרגול שאלות-תשובות
  els.startBtn.addEventListener("click", () => {
    const count = clamp(Number(els.numInput.value), min, max);

    // שמירת ההגדרות ב-localStorage
    const settings = {
      mode: "qa", // שאלות-תשובות
      subject: subjectKey,
      numQuestions: count,
      timestamp: Date.now(),
    };
    localStorage.setItem("qa_settings", JSON.stringify(settings));

    // ניווט לעמוד התרגול בפועל
    window.location.href = "qa-practice.html";
  });

  // פונקציות עזר
  function clampAndUpdate() {
    els.numInput.value = clamp(Number(els.numInput.value), min, max);
    updateHint();
  }

  function updateHint() {
    els.numHint.textContent = `${min}–${max}`;
  }
})();

// החזרת ערך בטווח תקין
function clamp(v, a, b) {
  return Math.min(Math.max(v, a), b);
}
