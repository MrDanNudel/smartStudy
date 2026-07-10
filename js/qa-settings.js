// ===============================
// Q&A Settings Logic — Full Updated Version (with Subtopics + Mastery per Subtopic)
// ===============================

console.log("⚡ qa-settings.js loaded");

// Utils
const clamp = (v, min, max) => Math.min(Math.max(v, min), max);

// Subject from URL
function getSubjectKey() {
  const url = new URL(window.location.href);
  return url.searchParams.get("subject") || "chemistry";
}

// Subject display names
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
  statsDynamics: "יסודות בסטטיסטיקה ודינמיקה",
  ClassEducation: "ניהול כיתה",
  volleyball: "כדור עף",
  handball: "כדור יד",
  developmentalPsychology: "פסיכולוגיה התפתחותית",
  sportHistory: "היסטוריה של הספורט",
  educationalThought: "מחשבת החינוך",
};

// Elements
const els = {
  subjectLabel: document.getElementById("subjectLabel"),
  subtopicSelect: document.getElementById("subtopicSelect"),

  numInput: document.getElementById("numQuestions"),
  numHint: document.getElementById("numHint"),
  startBtn: document.getElementById("startBtn"),
  modeSelect: document.getElementById("questionMode"),
  clearBtn: document.getElementById("clearStorageBtn"),
  statusBar: document.getElementById("statusBar"),

  masteryLabel: document.getElementById("masteryLabel"),
  masteryFill: document.getElementById("masteryFill"),
  masteryNote: document.getElementById("masteryNote"),

  subtopicMasteryContainer: document.getElementById("subtopicMasteryContainer"),
};

// Global banks
let fullBank = [];
let hardRaw = [];
let easyRaw = [];

window.hardQuestions = [];
window.easyQuestions = [];

let currentMode = "all";
let currentSubtopic = "all";

// ===============================
// ⭐ Load Subtopics Dynamically
// ===============================
function loadSubtopics(subjectKey) {
  const bank = window.qaBanks[subjectKey] || [];
  const select = els.subtopicSelect;

  select.innerHTML = "";

  // Default "all"
  const allOption = document.createElement("option");
  allOption.value = "all";
  allOption.textContent = "🌐 לכל הנושאים";
  select.appendChild(allOption);

  // Unique subtopics
  const subtopics = [...new Set(bank.map((q) => q.subtopic))];

  subtopics.forEach((topic) => {
    const opt = document.createElement("option");
    opt.value = topic;
    opt.textContent = topic;
    select.appendChild(opt);
  });
}

// ===============================
// ⭐ Mastery Bar (overall)
// ===============================
function updateMastery() {
  const total = fullBank.length;
  const easy = window.easyQuestions.length;

  const percent = total > 0 ? Math.round((easy / total) * 100) : 0;

  els.masteryLabel.textContent = `אתה שולט על ${percent}% מהשאלות`;
  els.masteryFill.style.width = percent + "%";

  let smart = "";
  if (percent <= 20) smart = "אתה רק בתחילת הדרך — קדימה!";
  else if (percent <= 40) smart = "אתה מתחמם, יש התקדמות.";
  else if (percent <= 60) smart = "הולך ומשתפר!";
  else if (percent <= 80) smart = "יפה מאוד! שליטה טובה בחומר.";
  else if (percent <= 95) smart = "כמעט שם! שליטה מצוינת.";
  else smart = "אתה שולט בכל החומר! אלוף 🔥";

  els.masteryNote.textContent = smart;
}

// ===============================
// ⭐ Mastery per Subtopic
// ===============================
function updateSubtopicMastery() {
  const container = els.subtopicMasteryContainer;
  if (!container) return;

  container.innerHTML = "";

  if (!fullBank || fullBank.length === 0) return;

  // כל תתי הנושאים במאגר
  const subtopics = [...new Set(fullBank.map((q) => q.subtopic))];

  subtopics.forEach((topic) => {
    const questionsInTopic = fullBank.filter((q) => q.subtopic === topic);
    const total = questionsInTopic.length;

    // משתמשים ב-easyRaw (מחרוזות) כדי לבדוק אילו שאלות סומנו כקלות
    const easyCount = questionsInTopic.filter((q) =>
      easyRaw.includes(q.q),
    ).length;

    const percent = total > 0 ? Math.round((easyCount / total) * 100) : 0;

    // wrapper
    const item = document.createElement("div");
    item.className = "subtopic-item";

    const label = document.createElement("div");
    label.className = "subtopic-label";
    label.textContent = `${topic} — ${percent}%`;

    const barOuter = document.createElement("div");
    barOuter.className = "subtopic-bar-outer";

    const barInner = document.createElement("div");
    barInner.className = "subtopic-bar-inner";
    barInner.style.width = `${percent}%`;

    // אם יש שליטה מלאה – צבע ירוק
    if (percent === 100) {
      barInner.classList.add("subtopic-bar-full");
    }

    barOuter.appendChild(barInner);
    item.appendChild(label);
    item.appendChild(barOuter);

    container.appendChild(item);
  });
}

// ===============================
// ⭐ Graph
// ===============================
function renderProgressChart(total, easy, hard, unsorted) {
  const ctx = document.getElementById("qaProgressChart");

  new Chart(ctx, {
    type: "bar",
    data: {
      labels: ["סה״כ", "קלות", "קשות", "לא מסומן"],
      datasets: [
        {
          data: [total, easy, hard, unsorted],
          backgroundColor: ["#8cd0ff", "#4effc3", "#ff6b6b", "#9fc6ff"],
          borderRadius: 12,
          barThickness: 60,
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
// ⭐ Active bank (mode + subtopic)
// ===============================
function getActiveBank() {
  let bank;

  if (currentMode === "hard") bank = window.hardQuestions;
  else if (currentMode === "easy") bank = window.easyQuestions;
  else if (currentMode === "unsorted")
    bank = fullBank.filter(
      (q) => !hardRaw.includes(q.q) && !easyRaw.includes(q.q),
    );
  else bank = fullBank;

  if (currentSubtopic !== "all") {
    bank = bank.filter((q) => q.subtopic === currentSubtopic);
  }

  return bank;
}

// ===============================
// ⭐ Update range according to filters
// ===============================
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

// ===============================
// INIT
// ===============================
window.addEventListener("DOMContentLoaded", () => {
  const subjectKey = getSubjectKey();
  fullBank = (window.qaBanks && window.qaBanks[subjectKey]) || [];

  hardRaw = JSON.parse(localStorage.getItem("hardQuestions") || "[]");
  easyRaw = JSON.parse(localStorage.getItem("easyQuestions") || "[]");

  window.hardQuestions = fullBank.filter((q) => hardRaw.includes(q.q));
  window.easyQuestions = fullBank.filter((q) => easyRaw.includes(q.q));

  const unsorted =
    fullBank.length - window.hardQuestions.length - window.easyQuestions.length;

  const totalCount = fullBank.length;

  // Set title
  els.subjectLabel.textContent = subjectTitles[subjectKey] || subjectKey;

  // Load subtopics + mastery
  loadSubtopics(subjectKey);

  // Status bar
  els.statusBar.querySelector(".total").textContent =
    `📄 סה״כ שאלות: ${totalCount}`;
  els.statusBar.querySelector(".easy").textContent =
    `💡 שאלות קלות: ${window.easyQuestions.length}`;
  els.statusBar.querySelector(".hard").textContent =
    `💪 שאלות קשות: ${window.hardQuestions.length}`;
  els.statusBar.querySelector(".unsorted").textContent =
    `❔ שאלות שלא סומנו: ${unsorted}`;

  // Graph + mastery
  renderProgressChart(
    totalCount,
    window.easyQuestions.length,
    window.hardQuestions.length,
    unsorted,
  );

  updateMastery();
  updateSubtopicMastery();

  // Initial range
  updateRange();

  // Mode change
  els.modeSelect.addEventListener("change", () => {
    currentMode = els.modeSelect.value;
    updateRange();
  });

  // Subtopic change
  els.subtopicSelect.addEventListener("change", () => {
    currentSubtopic = els.subtopicSelect.value;
    updateRange();
  });

  // Clamp numeric
  els.numInput.addEventListener("input", () => {
    els.numInput.value = clamp(
      Number(els.numInput.value),
      1,
      Number(els.numInput.max),
    );
  });

  // Start practice
  els.startBtn.addEventListener("click", () => {
    const count = clamp(
      Number(els.numInput.value),
      1,
      Number(els.numInput.max),
    );

    const selectedSubtopic = els.subtopicSelect.value;

    const settings = {
      subject: subjectKey,
      subtopic: selectedSubtopic,
      mode: currentMode,
      numQuestions: count,
    };

    localStorage.setItem("qa_settings", JSON.stringify(settings));

    window.location.href = `qa.html?subject=${subjectKey}&mode=${currentMode}&questions=${count}&subtopic=${selectedSubtopic}`;
  });

  // Clear markings
  els.clearBtn.addEventListener("click", () => {
    if (confirm("למחוק את כל הסימונים?")) {
      localStorage.setItem("hardQuestions", "[]");
      localStorage.setItem("easyQuestions", "[]");
      location.reload();
    }
  });
});
