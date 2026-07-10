window.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);

  const subjectKey =
    params.get("subject") || localStorage.getItem("selectedSubjectKey") || "";

  if (subjectKey) {
    localStorage.setItem("selectedSubjectKey", subjectKey);
  }

  const SUBJECT_TITLES = {
    educationalThought: "מחשבת החינוך",
    anatomy: "אנטומיה",
    chemistry: "כימיה",
    psychology: "פסיכולוגיה",
    literacy: "אוריינות שפתית",
    basketball: "יסודות בכדורסל",
    athletics: "יסודות באתלטיקה",
    football: "יסודות בכדורגל",
    physics: "פיזיקה",
    statistics1: "סטטיסטיקה – חלק א׳",
    biochemistry: "ביוכימיה",
    volleyball: "כדור עף",
    handball: "כדור יד",
    developmentalPsychology: "פסיכולוגיה התפתחותית",
    sportHistory: "היסטוריה של הספורט",
  };

  const pageTitle = document.getElementById("pageTitle");
  const subtopicSelect = document.getElementById("subtopicSelect");
  const typeSelect = document.getElementById("typeSelect");

  const timeBtn = document.getElementById("time-btn");
  const questionsBtn = document.getElementById("questions-btn");
  const failsBtn = document.getElementById("fails-btn");
  const startBtn = document.getElementById("start-btn");

  const timeValue = document.getElementById("time-value");
  const questionsValue = document.getElementById("questions-value");
  const failsValue = document.getElementById("fails-value");

  const modal = document.getElementById("modal");
  const modalTitle = document.getElementById("modal-title");
  const modalInput = document.getElementById("modal-input");
  const saveBtn = document.getElementById("save-btn");
  const cancelBtn = document.getElementById("cancel-btn");

  const prevPageBtn = document.getElementById("prev-page");
  const homePageBtn = document.getElementById("home-page");

  const masteryLabel = document.getElementById("masteryLabel");
  const masteryFill = document.getElementById("masteryFill");
  const masteryNote = document.getElementById("masteryNote");

  const subtopicMasteryContainer = document.getElementById(
    "subtopicMasteryContainer",
  );

  const statusBar = document.getElementById("statusBar");
  const clearProgressBtn = document.getElementById("clearProgressBtn");

  pageTitle.textContent =
    SUBJECT_TITLES[subjectKey] ||
    localStorage.getItem("selectedSubjectLabel") ||
    "נושא לא מוגדר";

  let bank = [];

  if (window.examBanks && Array.isArray(window.examBanks[subjectKey])) {
    bank = window.examBanks[subjectKey];
  } else if (Array.isArray(window.examBank)) {
    bank = window.examBank;
  }

  let difficultyMap = readDifficultyMap();

  console.log("נושא:", subjectKey);
  console.log("מספר שאלות במאגר:", bank.length);
  console.log("שאלה ראשונה:", bank[0]);

  loadSubtopics(bank);
  updateProgressDisplay();

  let timePerQuestion = 30;

  // מציג מראש את כל השאלות הזמינות
  let numQuestions = bank.length || 1;

  let maxFails = 5;
  let currentSetting = "";

  updateSettingsDisplay();
  updateAvailableQuestionCount();

  timeBtn?.addEventListener("click", () => {
    openModal("בחר זמן לכל שאלה", timePerQuestion, 5, 300, "time");
  });

  questionsBtn?.addEventListener("click", () => {
    const maximum = getFilteredBank().length;

    if (maximum === 0) {
      alert("אין שאלות המתאימות לסינון שבחרת.");
      return;
    }

    openModal(
      "בחר מספר שאלות",
      Math.min(numQuestions, maximum),
      1,
      maximum,
      "questions",
    );
  });
  failsBtn?.addEventListener("click", () => {
    openModal(
      "בחר מספר פסילות בין 1 ל־20.<br>אם ברצונך להיבחן ללא הגבלת פסילות, בחר 0.",
      maxFails,
      0,
      20,
      "fails",
    );
  });

  saveBtn?.addEventListener("click", () => {
    let value = Number(modalInput.value);

    if (!Number.isFinite(value)) {
      alert("יש להזין מספר תקין.");
      return;
    }

    const min = Number(modalInput.min);
    const max = Number(modalInput.max);

    value = Math.min(Math.max(value, min), max);

    if (currentSetting === "time") {
      timePerQuestion = value;
    }

    if (currentSetting === "questions") {
      numQuestions = value;
    }

    if (currentSetting === "fails") {
      maxFails = value;
    }

    updateSettingsDisplay();
    closeModal();
  });

  cancelBtn?.addEventListener("click", closeModal);

  modal?.addEventListener("click", (event) => {
    if (event.target === modal) {
      closeModal();
    }
  });
  // שינוי תת־נושא
  subtopicSelect?.addEventListener("change", () => {
    // מחזיר אוטומטית להצגת כל השאלות בתת־הנושא החדש
    typeSelect.value = "all";

    setQuestionsToMaximum();
  });

  // שינוי סוג שאלות
  typeSelect?.addEventListener("change", () => {
    setQuestionsToMaximum();
  });

  startBtn?.addEventListener("click", () => {
    const filteredBank = getFilteredBank();

    if (bank.length === 0) {
      alert("לא נמצא מאגר שאלות עבור הנושא שנבחר.");
      return;
    }

    if (filteredBank.length === 0) {
      alert("לא נמצאו שאלות המתאימות לסינון שבחרת.");
      return;
    }

    numQuestions = Math.min(Math.max(numQuestions, 1), filteredBank.length);

    const settings = {
      subject: subjectKey,
      subtopic: subtopicSelect.value,
      type: typeSelect.value,
      timePerQuestion,
      numQuestions,
      maxFails,
    };

    localStorage.setItem("examSettings", JSON.stringify(settings));

    const query = new URLSearchParams({
      subject: subjectKey,
      subtopic: subtopicSelect.value,
      type: typeSelect.value,
      time: String(timePerQuestion),
      questions: String(numQuestions),
      fails: String(maxFails),
    });

    window.location.href = `exam.html?${query.toString()}`;
  });

  clearProgressBtn?.addEventListener("click", () => {
    const approved = confirm(
      "למחוק את כל סימוני הקושי וההתקדמות במבחנים האמריקאיים?",
    );

    if (!approved) {
      return;
    }

    localStorage.setItem("easyHardStats", "{}");
    difficultyMap = {};

    updateProgressDisplay();
    setQuestionsToMaximum();
  });

  prevPageBtn?.addEventListener("click", () => {
    window.location.href = `select-method.html?subject=${encodeURIComponent(subjectKey)}`;
  });

  homePageBtn?.addEventListener("click", () => {
    localStorage.removeItem("selectedSubjectKey");
    localStorage.removeItem("selectedSubjectLabel");
    localStorage.removeItem("selectedMethodKey");
    localStorage.removeItem("selectedMethodLabel");

    window.location.href = "index.html";
  });

  function readDifficultyMap() {
    try {
      const parsed = JSON.parse(localStorage.getItem("easyHardStats") || "{}");

      return parsed && typeof parsed === "object" ? parsed : {};
    } catch (error) {
      console.error("שגיאה בקריאת easyHardStats:", error);

      return {};
    }
  }

  function loadSubtopics(questionBank) {
    subtopicSelect.innerHTML = `<option value="all">כל התתי־נושאים</option>`;

    const subtopics = [
      ...new Set(
        questionBank
          .map((question) => question.subtopic)
          .filter(
            (subtopic) =>
              typeof subtopic === "string" && subtopic.trim() !== "",
          ),
      ),
    ];

    subtopics.sort((a, b) => a.localeCompare(b, "he"));

    subtopics.forEach((subtopic) => {
      const option = document.createElement("option");

      option.value = subtopic;
      option.textContent = subtopic;

      subtopicSelect.appendChild(option);
    });

    if (questionBank.length > 0 && subtopics.length === 0) {
      console.error("נמצאו שאלות, אך לא נמצא בהן שדה subtopic.");
    }
  }

  function getQuestionStatus(question) {
    const status = difficultyMap[question.id];

    if (status === "easy" || status === "hard") {
      return status;
    }

    return "unsorted";
  }

  function getFilteredBank() {
    let filtered = [...bank];

    const selectedSubtopic = subtopicSelect.value;
    const selectedType = typeSelect.value;

    if (selectedSubtopic !== "all") {
      filtered = filtered.filter(
        (question) => question.subtopic === selectedSubtopic,
      );
    }

    if (selectedType !== "all") {
      filtered = filtered.filter(
        (question) => getQuestionStatus(question) === selectedType,
      );
    }

    return filtered;
  }

  function setQuestionsToMaximum() {
    const availableCount = getFilteredBank().length;

    if (availableCount === 0) {
      questionsValue.textContent = "אין שאלות מתאימות";

      startBtn.disabled = true;
      questionsBtn.disabled = true;

      return;
    }

    startBtn.disabled = false;
    questionsBtn.disabled = false;

    numQuestions = availableCount;

    updateSettingsDisplay();
  }

  function updateAvailableQuestionCount() {
    const availableCount = getFilteredBank().length;

    if (availableCount === 0) {
      questionsValue.textContent = "אין שאלות מתאימות";

      startBtn.disabled = true;
      questionsBtn.disabled = true;

      return;
    }

    startBtn.disabled = false;
    questionsBtn.disabled = false;

    if (numQuestions > availableCount) {
      numQuestions = availableCount;
    }

    if (numQuestions < 1) {
      numQuestions = 1;
    }

    updateSettingsDisplay();
  }

  function updateProgressDisplay() {
    const total = bank.length;

    const easyCount = bank.filter(
      (question) => getQuestionStatus(question) === "easy",
    ).length;

    const hardCount = bank.filter(
      (question) => getQuestionStatus(question) === "hard",
    ).length;

    const unsortedCount = total - easyCount - hardCount;

    const masteryPercent =
      total > 0 ? Math.round((easyCount / total) * 100) : 0;

    if (masteryLabel) {
      masteryLabel.textContent = `אתה שולט על ${masteryPercent}% מהשאלות`;
    }

    if (masteryFill) {
      masteryFill.style.width = `${masteryPercent}%`;
    }

    if (masteryNote) {
      masteryNote.textContent = getMasteryMessage(masteryPercent);
    }

    if (statusBar) {
      const totalElement = statusBar.querySelector(".total");

      const easyElement = statusBar.querySelector(".easy");

      const hardElement = statusBar.querySelector(".hard");

      const unsortedElement = statusBar.querySelector(".unsorted");

      if (totalElement) {
        totalElement.textContent = `📄 סה״כ שאלות: ${total}`;
      }

      if (easyElement) {
        easyElement.textContent = `💡 שאלות קלות: ${easyCount}`;
      }

      if (hardElement) {
        hardElement.textContent = `💪 שאלות קשות: ${hardCount}`;
      }

      if (unsortedElement) {
        unsortedElement.textContent = `❔ שאלות שלא סומנו: ${unsortedCount}`;
      }
    }

    updateSubtopicMastery();
  }

  function getMasteryMessage(percent) {
    if (percent <= 20) {
      return "אתה רק בתחילת הדרך — קדימה!";
    }

    if (percent <= 40) {
      return "אתה מתחמם, יש התקדמות.";
    }

    if (percent <= 60) {
      return "הולך ומשתפר!";
    }

    if (percent <= 80) {
      return "יפה מאוד! שליטה טובה בחומר.";
    }

    if (percent <= 95) {
      return "כמעט שם! שליטה מצוינת.";
    }

    return "אתה שולט בכל החומר! אלוף 🔥";
  }

  function updateSubtopicMastery() {
    if (!subtopicMasteryContainer) {
      return;
    }

    subtopicMasteryContainer.innerHTML = "";

    if (bank.length === 0) {
      return;
    }

    const subtopics = [
      ...new Set(
        bank
          .map((question) => question.subtopic)
          .filter(
            (subtopic) =>
              typeof subtopic === "string" && subtopic.trim() !== "",
          ),
      ),
    ];

    subtopics
      .sort((a, b) => a.localeCompare(b, "he"))
      .forEach((subtopic) => {
        const questionsInSubtopic = bank.filter(
          (question) => question.subtopic === subtopic,
        );

        const total = questionsInSubtopic.length;

        const easyCount = questionsInSubtopic.filter(
          (question) => getQuestionStatus(question) === "easy",
        ).length;

        const hardCount = questionsInSubtopic.filter(
          (question) => getQuestionStatus(question) === "hard",
        ).length;

        const percent = total > 0 ? Math.round((easyCount / total) * 100) : 0;

        const item = document.createElement("div");

        item.className = "subtopic-item";

        const label = document.createElement("div");

        label.className = "subtopic-label";

        label.textContent =
          `${subtopic} — ${percent}% ` +
          `(קלות ${easyCount}, קשות ${hardCount})`;

        const barOuter = document.createElement("div");

        barOuter.className = "subtopic-bar-outer";

        const barInner = document.createElement("div");

        barInner.className = "subtopic-bar-inner";

        barInner.style.width = `${percent}%`;

        if (percent === 100) {
          barInner.classList.add("subtopic-bar-full");
        }

        barOuter.appendChild(barInner);
        item.appendChild(label);
        item.appendChild(barOuter);

        subtopicMasteryContainer.appendChild(item);
      });
  }

  function openModal(title, value, min, max, setting) {
    currentSetting = setting;

    modalTitle.innerHTML = title;
    modalInput.value = value;
    modalInput.min = min;
    modalInput.max = max;

    modal.classList.add("show");

    modalInput.focus();
    modalInput.select();
  }

  function closeModal() {
    modal.classList.remove("show");
    currentSetting = "";
  }

  function updateSettingsDisplay() {
    timeValue.textContent = `${timePerQuestion} שניות`;

    questionsValue.textContent = `${numQuestions} שאלות`;

    failsValue.textContent =
      maxFails === 0 ? "ללא הגבלת פסילות" : `עד ${maxFails} פסילות`;
  }
});
