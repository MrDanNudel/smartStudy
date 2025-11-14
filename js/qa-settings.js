// ===============================
// Q&A Settings Logic — Smart Study (Deep Debug Mode)
// ===============================

console.log("✅ QA Settings script loaded and running!");

// קריאת פרמטר subject מה-URL
function getSubjectKey() {
  const url = new URL(window.location.href);
  return url.searchParams.get("subject") || "chemistry";
}

// שמות בעברית
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

// מאגר השאלות
const qaBanks = window.qaBanks || {};

// אלמנטים מהדף
const els = {
  subjectLabel: document.getElementById("subjectLabel"),
  numInput: document.getElementById("numQuestions"),
  numHint: document.getElementById("numHint"),
  startBtn: document.getElementById("startBtn"),
  modeSelect: document.getElementById("questionMode"),
  statusBar: document.getElementById("statusBar"),
};

// שמירה בטווח
function clamp(v, a, b) {
  return Math.min(Math.max(v, a), b);
}

(function init() {
  console.log("🚀 init() התחיל לפעול");

  const subjectKey = getSubjectKey();
  const title = subjectTitles[subjectKey] || subjectKey;
  if (els.subjectLabel) els.subjectLabel.textContent = title;

  // טעינת מאגר השאלות לנושא
  const allQuestions = qaBanks[subjectKey] || [];

  // טעינת שאלות שסומנו כקשות/קלות
  const hardQTexts = JSON.parse(localStorage.getItem("hardQuestions") || "[]");
  const easyQTexts = JSON.parse(localStorage.getItem("easyQuestions") || "[]");

  const normalize = (s) => s?.trim()?.normalize("NFKC") || "";

  const hardQuestions = allQuestions.filter((q) =>
    hardQTexts.some((hq) => normalize(hq) === normalize(q.q))
  );

  const easyQuestions = allQuestions.filter((q) =>
    easyQTexts.some((eq) => normalize(eq) === normalize(q.q))
  );

  const unsortedQuestions = allQuestions.filter(
    (q) => !hardQTexts.includes(q.q) && !easyQTexts.includes(q.q)
  );

  // ==============
  // תיבת סטטוס
  // ==============
  function updateStatusBar() {
    if (!els.statusBar) return;

    els.statusBar.querySelector(
      ".hard"
    ).textContent = `💪 שאלות קשות: ${hardQuestions.length}`;

    els.statusBar.querySelector(
      ".easy"
    ).textContent = `💡 שאלות קלות: ${easyQuestions.length}`;

    els.statusBar.querySelector(
      ".unsorted"
    ).textContent = `📄 שאלות שלא סומנו: ${unsortedQuestions.length}`;
  }

  console.groupCollapsed("📊 QA Settings Debug Info");
  console.log("נושא:", subjectKey);
  console.log("סה״כ שאלות:", allQuestions.length);
  console.log("קשות:", hardQuestions.length);
  console.log("קלות:", easyQuestions.length);
  console.log("לא מסומנות:", unsortedQuestions.length);
  console.groupEnd();

  // ⭐ מופעל כאן — כדי שהסטטוס יוצג מיד
  updateStatusBar();

  // מצב ברירת מחדל
  let currentMode = "all";

  // עדכון טווח
  function updateRange() {
    let selectedQuestions =
      currentMode === "hard"
        ? hardQuestions
        : currentMode === "easy"
        ? easyQuestions
        : allQuestions;

    const count = selectedQuestions.length;

    if (count === 0) {
      els.numHint.textContent = "⚠️ אין שאלות במצב זה";
      els.numInput.value = "";
      els.numInput.disabled = true;
      els.startBtn.disabled = true;
      return;
    }

    els.numInput.disabled = false;
    els.numInput.min = "1";
    els.numInput.max = count;
    els.numInput.value = clamp(Number(els.numInput.value) || 1, 1, count);
    els.numHint.textContent = `1–${count}`;
    els.startBtn.disabled = false;
  }

  if (els.modeSelect) {
    els.modeSelect.addEventListener("change", () => {
      currentMode = els.modeSelect.value;
      updateRange();
    });
  }

  els.numInput.addEventListener("input", () => {
    const v = clamp(Number(els.numInput.value), 1, Number(els.numInput.max));
    els.numInput.value = v;
  });

  els.startBtn.addEventListener("click", () => {
    const count = clamp(
      Number(els.numInput.value),
      1,
      Number(els.numInput.max)
    );

    const settings = {
      mode: currentMode,
      subject: subjectKey,
      numQuestions: count,
      timestamp: Date.now(),
    };

    localStorage.setItem("qa_settings", JSON.stringify(settings));
    window.location.href = `qa.html?subject=${subjectKey}&mode=${currentMode}&questions=${count}`;
  });

  updateRange();
})();
