window.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);

  const subjectKey =
    params.get("subject") || localStorage.getItem("selectedSubjectKey") || "";

  if (subjectKey) {
    localStorage.setItem("selectedSubjectKey", subjectKey);
  }

  const SUBJECT_TITLES = {
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

  console.log("נושא:", subjectKey);
  console.log("מספר שאלות במאגר:", bank.length);
  console.log("שאלה ראשונה:", bank[0]);

  loadSubtopics(bank);

  let timePerQuestion = 30;
  let numQuestions = Math.min(20, bank.length || 20);
  let maxFails = 5;

  updateSettingsDisplay();

  let currentSetting = "";

  timeBtn?.addEventListener("click", () => {
    openModal("בחר זמן לכל שאלה", timePerQuestion, 5, 300, "time");
  });

  questionsBtn?.addEventListener("click", () => {
    const maximum = Math.max(1, getFilteredBank().length);

    openModal(
      "בחר מספר שאלות",
      Math.min(numQuestions, maximum),
      1,
      maximum,
      "questions",
    );
  });

  failsBtn?.addEventListener("click", () => {
    openModal("בחר מספר פסילות — 0 ללא הגבלה", maxFails, 0, 100, "fails");
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

  subtopicSelect?.addEventListener("change", () => {
    const availableCount = getFilteredBank().length;

    if (availableCount > 0 && numQuestions > availableCount) {
      numQuestions = availableCount;
      updateSettingsDisplay();
    }
  });

  typeSelect?.addEventListener("change", () => {
    const availableCount = getFilteredBank().length;

    if (availableCount > 0 && numQuestions > availableCount) {
      numQuestions = availableCount;
      updateSettingsDisplay();
    }
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

    numQuestions = Math.min(numQuestions, filteredBank.length);

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

  function loadSubtopics(questionBank) {
    subtopicSelect.innerHTML = `<option value="all">כל התתי-נושאים</option>`;

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
      const difficultyMap = JSON.parse(
        localStorage.getItem("easyHardStats") || "{}",
      );

      filtered = filtered.filter(
        (question) => difficultyMap[question.id] === selectedType,
      );
    }

    return filtered;
  }

  function openModal(title, value, min, max, setting) {
    currentSetting = setting;

    modalTitle.textContent = title;
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
