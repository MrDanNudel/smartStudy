// ===============================
// Q&A Settings Logic — Smart Study (Deep Debug Mode)
// ===============================

console.log("✅ QA Settings script loaded and running!");

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
  football: "יסודות בכדורגל",
  statistics1: "סטטיסטיקה – חלק א׳",
  physics: "פיזיקה",
};

// מאגר כללי (נטען מהקובץ data/qa-bank.js)
const qaBanks = window.qaBanks || {}; // { chemistry: [...], physics: [...], ... }

// אחסון אלמנטים חשובים לשימוש חוזר
const els = {
  subjectLabel: document.getElementById("subjectLabel"),
  numInput: document.getElementById("numQuestions"),
  numHint: document.getElementById("numHint"),
  startBtn: document.getElementById("startBtn"),
  modeSelect: document.getElementById("questionMode"),
};

// פונקציית עזר — שמירה בטווח
function clamp(v, a, b) {
  return Math.min(Math.max(v, a), b);
}

(function init() {
  console.log("🚀 init() התחיל לפעול");

  const subjectKey = getSubjectKey();
  const title = subjectTitles[subjectKey] || subjectKey;
  if (els.subjectLabel) els.subjectLabel.textContent = title;

  // טעינת מאגר השאלות
  const allQuestions = qaBanks[subjectKey] || [];
  console.log(`📘 נושא "${subjectKey}" כולל ${allQuestions.length} שאלות`);

  // טעינת שאלות שסומנו כקשות ב-localStorage
  const hardQTexts = JSON.parse(localStorage.getItem("hardQuestions") || "[]");

  // השוואה עם normalizing כדי למנוע בעיות של רווחים, ניקוד וכו'
  const normalize = (str) => str?.trim()?.normalize("NFKC") || "";
  const hardQuestions = allQuestions.filter((q) =>
    hardQTexts.some((hq) => normalize(hq) === normalize(q.q))
  );

  let currentMode = "all";

  // === DEBUG הדפסות עיקריות ===
  console.groupCollapsed("📊 QA Settings Debug Info");
  console.log("🧩 נושא נבחר:", subjectKey);
  console.log('🧮 סה"כ שאלות בנושא:', allQuestions.length);
  console.log("🔥 שאלות שסומנו כקשות ב-localStorage:", hardQTexts);
  console.log(
    "✅ אותרו בפועל במאגר (לאחר normalization):",
    hardQuestions.length
  );
  if (hardQuestions.length === 0 && hardQTexts.length > 0) {
    console.warn(
      "⚠️ יש שאלות שסומנו כקשות אך לא נמצאו התאמות — ייתכן שיש הבדל קטן בטקסט (רווח, ניקוד וכו')."
    );
  }
  console.groupEnd();

  // עדכון טווח שדות לפי מצב תרגול
  function updateRange() {
    const selectedQuestions =
      currentMode === "hard" ? hardQuestions : allQuestions;
    const count = selectedQuestions.length;

    console.groupCollapsed("⚙️ updateRange()");
    console.log("מצב נוכחי:", currentMode);
    console.log("כמות שאלות נבחרות:", count);
    console.groupEnd();

    if (count === 0) {
      els.numHint.textContent =
        currentMode === "hard"
          ? "⚠️ אין שאלות שסומנו כמאתגרות בנושא זה"
          : "⚠️ אין שאלות זמינות לנושא זה";
      els.numInput.value = "";
      els.numInput.disabled = true;
      els.startBtn.disabled = true;
      els.startBtn.title = "אין שאלות זמינות לתרגול";
      return;
    }

    const min = 1;
    const max = count;
    els.numInput.disabled = false;
    els.numInput.min = String(min);
    els.numInput.max = String(max);
    els.numInput.value = clamp(Number(els.numInput.value) || 1, min, max);
    els.numHint.textContent = `${min}–${max}`;
    els.startBtn.disabled = false;
    els.startBtn.title = "";
  }

  // שינוי מצב תרגול (כל השאלות / מאתגרות)
  if (els.modeSelect) {
    els.modeSelect.addEventListener("change", () => {
      currentMode = els.modeSelect.value;
      console.log("🌀 שינוי מצב:", currentMode);
      updateRange();
    });
  }

  // הגבלת טווח בעת הקלדה
  els.numInput.addEventListener("input", () => {
    const v = clamp(Number(els.numInput.value), 1, Number(els.numInput.max));
    els.numInput.value = v;
  });

  // התחלת תרגול שאלות-תשובות
  els.startBtn.addEventListener("click", () => {
    const count = clamp(
      Number(els.numInput.value),
      1,
      Number(els.numInput.max)
    );

    if (currentMode === "hard" && hardQuestions.length === 0) {
      alert("לא קיימות שאלות שסומנו כמאתגרות בנושא זה.");
      console.warn("🟡 לחיצה על התחל — אין שאלות מאתגרות זמינות");
      return;
    }

    const settings = {
      mode: currentMode,
      subject: subjectKey,
      numQuestions: count,
      timestamp: Date.now(),
    };

    console.groupCollapsed("🚀 Starting QA Session");
    console.log("מצב:", currentMode);
    console.log("שאלות נבחרות:", count);
    console.log("שמירה ב-localStorage:", settings);
    console.groupEnd();

    localStorage.setItem("qa_settings", JSON.stringify(settings));
    window.location.href = `qa.html?subject=${subjectKey}&mode=${currentMode}&questions=${count}`;
  });

  updateRange();
})();
