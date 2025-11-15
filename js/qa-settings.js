// ===============================
// Q&A Settings Logic — Full Updated Version
// ===============================

console.log("⚡ qa-settings.js loaded");

// Utility
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

  masteryLabel: document.getElementById("masteryLabel"),
  masteryFill: document.getElementById("masteryFill"),
  masteryNote: document.getElementById("masteryNote"),
};

// Global banks
let fullBank = [];
let hardRaw = [];
let easyRaw = [];

window.hardQuestions = [];
window.easyQuestions = [];

// ===============================
// ⭐ Mastery Bar (Dynamic)
// ===============================
function updateMastery() {
  const total = fullBank.length;
  const easy = window.easyQuestions.length;

  const percent = total > 0 ? Math.round((easy / total) * 100) : 0;

  els.masteryLabel.textContent = `אתה שולט על ${percent}% מהשאלות`;
  els.masteryFill.style.width = percent + "%";

  // Smart text
  let smart = "";
  if (percent <= 20) smart = "אתה רק בתחילת הדרך — קדימה!";
  else if (percent <= 40) smart = "אתה מתחמם, יש התקדמות.";
  else if (percent <= 60) smart = "הולך ומשתפר!";
  else if (percent <= 80) smart = "יפה מאוד! שליטה טובה בחומר.";
  else if (percent <= 95) smart = "כמעט שם! שליטה מצוינת.";
  else smart = "אתה שולט בכל החומר! אלוף 🔥";

  els.masteryNote.textContent = smart;

  // Dynamic color
  let color = "#29ccff";
  if (percent <= 40) color = "#4ecbff";
  else if (percent <= 70) color = "#00d4ff";
  else if (percent <= 90) color = "#1affff";
  else color = "#4effc3";

  els.masteryFill.style.background = color;
}

// ===============================
// ⭐ Graph
// ===============================
function renderProgressChart(h, e, u) {
  const ctx = document.getElementById("qaProgressChart");

  new Chart(ctx, {
    type: "bar",
    data: {
      labels: ["קשות", "קלות", "לא מסומן"],
      datasets: [
        {
          label: "סטטוס",
          data: [h, e, u],
          backgroundColor: ["#ff6b6b", "#4effc3", "#9fc6ff"],
          borderRadius: 12,
          barThickness: 70,
        },
      ],
    },
    options: {
      plugins: { legend: { display: false }, tooltip: { enabled: false } },
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
window.addEventListener("DOMContentLoaded", () => {
  const subjectKey = getSubjectKey();

  fullBank = (window.qaBanks && window.qaBanks[subjectKey]) || [];

  hardRaw = JSON.parse(localStorage.getItem("hardQuestions") || "[]");
  easyRaw = JSON.parse(localStorage.getItem("easyQuestions") || "[]");

  // Convert to usable arrays
  window.hardQuestions = fullBank.filter((q) => hardRaw.includes(q.q));
  window.easyQuestions = fullBank.filter((q) => easyRaw.includes(q.q));

  const unsorted =
    fullBank.length - window.hardQuestions.length - window.easyQuestions.length;

  // Title
  els.subjectLabel.textContent = subjectTitles[subjectKey] || subjectKey;

  // Status bar update
  els.statusBar.querySelector(
    ".hard"
  ).textContent = `💪 שאלות קשות: ${window.hardQuestions.length}`;
  els.statusBar.querySelector(
    ".easy"
  ).textContent = `💡 שאלות קלות: ${window.easyQuestions.length}`;
  els.statusBar.querySelector(
    ".unsorted"
  ).textContent = `📄 שאלות שלא סומנו: ${unsorted}`;

  // Graph
  renderProgressChart(
    window.hardQuestions.length,
    window.easyQuestions.length,
    unsorted
  );

  // Mastery bar
  updateMastery();

  // Filtering
  let currentMode = "all";

  function getActiveBank() {
    if (currentMode === "hard") return window.hardQuestions;
    if (currentMode === "easy") return window.easyQuestions;
    if (currentMode === "unsorted")
      return fullBank.filter(
        (q) => !hardRaw.includes(q.q) && !easyRaw.includes(q.q)
      );

    return fullBank;
  }

  // Update range
  function updateRange() {
    const bank = getActiveBank();
    const count = bank.length;

    if (count === 0) {
      els.numHint.textContent = "⚠️ אין שאלות";
      els.numInput.disabled = true;
      els.startBtn.disabled = true;
      els.numInput.value = "-";
      return;
    }

    els.numInput.disabled = false;
    els.startBtn.disabled = false;

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

  // Start practice
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

  // Clear storage
  els.clearBtn.addEventListener("click", () => {
    if (confirm("למחוק את כל הסימונים?")) {
      localStorage.setItem("hardQuestions", "[]");
      localStorage.setItem("easyQuestions", "[]");
      location.reload();
    }
  });
});
