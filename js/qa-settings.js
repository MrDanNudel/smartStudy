// ===============================
// Q&A Settings Logic — With Progress Chart
// ===============================

console.log("⚡ QA-Settings.js loaded");

// Utility
const normalize = (s) => s?.trim()?.normalize("NFKC") || "";
const clamp = (v, min, max) => Math.min(Math.max(v, min), max);

// Subject from URL
function getSubjectKey() {
  const url = new URL(window.location.href);
  return url.searchParams.get("subject") || "chemistry";
}

// Subject names
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

// Elements
const els = {
  subjectLabel: document.getElementById("subjectLabel"),
  numInput: document.getElementById("numQuestions"),
  numHint: document.getElementById("numHint"),
  startBtn: document.getElementById("startBtn"),
  modeSelect: document.getElementById("questionMode"),
  clearBtn: document.getElementById("clearStorageBtn"),
  statusBar: document.getElementById("statusBar"),
};

// ===============================
// ⭐ גרף
// ===============================
function renderProgressChart(h, e, u) {
  const ctx = document.getElementById("qaProgressChart");

  new Chart(ctx, {
    type: "bar",
    data: {
      labels: ["קשות", "קלות", "לא מסומן"],
      datasets: [
        {
          label: "סטטוס התקדמות",
          data: [h, e, u], // ← תוקן!
          backgroundColor: ["#ff6b6b", "#4effc3", "#9fc6ff"],
          borderRadius: 12,
          barThickness: 70, // טיפה יותר דק
        },
      ],
    },
    options: {
      plugins: { legend: { display: false } },
      animation: { duration: 900 },
      scales: {
        x: { ticks: { color: "#fff" }, grid: { display: false } },
        y: { beginAtZero: true, ticks: { color: "#9fdcff" } },
      },
    },
  });
}

// ===============================
// INIT
// ===============================
(function init() {
  const subjectKey = getSubjectKey();
  const allQuestions = window.qaBanks?.[subjectKey] || [];

  els.subjectLabel.textContent = subjectTitles[subjectKey] || subjectKey;

  const hardRaw = JSON.parse(localStorage.getItem("hardQuestions") || "[]");
  const easyRaw = JSON.parse(localStorage.getItem("easyQuestions") || "[]");

  const hardQuestions = allQuestions.filter((q) => hardRaw.includes(q.q));
  const easyQuestions = allQuestions.filter((q) => easyRaw.includes(q.q));

  const unsorted =
    allQuestions.length - hardQuestions.length - easyQuestions.length;

  // Update status bar
  function updateStatusBar() {
    els.statusBar.querySelector(
      ".hard"
    ).textContent = `💪 שאלות קשות: ${hardQuestions.length}`;
    els.statusBar.querySelector(
      ".easy"
    ).textContent = `💡 שאלות קלות: ${easyQuestions.length}`;
    els.statusBar.querySelector(
      ".unsorted"
    ).textContent = `📄 שאלות שלא סומנו: ${unsorted}`;
  }

  updateStatusBar();

  // גרף
  renderProgressChart(hardQuestions.length, easyQuestions.length, unsorted);

  // טווח שאלות
  let currentMode = "all";

  function getActiveBank() {
    if (currentMode === "hard") return hardQuestions;
    if (currentMode === "easy") return easyQuestions;
    return allQuestions;
  }

  function updateRange() {
    const bank = getActiveBank();
    const count = bank.length;

    if (count === 0) {
      els.numHint.textContent = "⚠️ אין שאלות";
      els.startBtn.disabled = true;
      els.numInput.disabled = true;
      return;
    }

    els.startBtn.disabled = false;
    els.numInput.disabled = false;

    els.numInput.min = 1;
    els.numInput.max = count;
    els.numInput.value = clamp(Number(els.numInput.value), 1, count);

    els.numHint.textContent = `1–${count}`;
  }

  updateRange();

  els.modeSelect.addEventListener("change", () => {
    currentMode = els.modeSelect.value;
    updateRange();
  });

  els.numInput.addEventListener("input", () => {
    els.numInput.value = clamp(
      Number(els.numInput.value),
      1,
      Number(els.numInput.max)
    );
  });

  // התחלת תרגול
  els.startBtn.addEventListener("click", () => {
    const count = clamp(
      Number(els.numInput.value),
      1,
      Number(els.numInput.max)
    );

    const settings = {
      subject: subjectKey,
      mode: currentMode,
      numQuestions: count,
    };

    localStorage.setItem("qa_settings", JSON.stringify(settings));

    window.location.href = `qa.html?subject=${subjectKey}&mode=${currentMode}&questions=${count}`;
  });

  els.clearBtn.addEventListener("click", () => {
    if (confirm("למחוק את כל השאלות שסומנו?")) {
      localStorage.setItem("hardQuestions", "[]");
      localStorage.setItem("easyQuestions", "[]");
      location.reload();
    }
  });
})();
