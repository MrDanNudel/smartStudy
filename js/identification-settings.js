window.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const subjectFromUrl = params.get("subject");

  const subjectKey =
    subjectFromUrl || localStorage.getItem("selectedSubjectKey") || "";

  const pageTitle = document.getElementById("pageTitle");
  const allTopicsCheckbox = document.getElementById("allTopicsCheckbox");
  const allTopicsCount = document.getElementById("allTopicsCount");
  const topicsContainer = document.getElementById("topicsContainer");
  const slidesBtn = document.getElementById("slides-btn");
  const slidesValue = document.getElementById("slides-value");
  const availableSlidesText = document.getElementById("availableSlidesText");
  const startBtn = document.getElementById("start-btn");
  const statusMessage = document.getElementById("statusMessage");

  const modal = document.getElementById("modal");
  const modalInput = document.getElementById("modal-input");
  const modalHelp = document.getElementById("modal-help");
  const saveBtn = document.getElementById("save-btn");
  const cancelBtn = document.getElementById("cancel-btn");

  const prevPageBtn = document.getElementById("prev-page");
  const homePageBtn = document.getElementById("home-page");

  pageTitle.textContent =
    subjectKey === "anatomy" ? "אנטומיה" : "נושא לא מוגדר";

  if (subjectKey) {
    localStorage.setItem("selectedSubjectKey", subjectKey);
  }

  const bank = getIdentificationBank(subjectKey);
  let numSlides = bank.length;

  renderTopics();
  updateSettings();

  allTopicsCheckbox?.addEventListener("change", () => {
    const topicCheckboxes = getTopicCheckboxes();

    topicCheckboxes.forEach((checkbox) => {
      checkbox.checked = allTopicsCheckbox.checked;
    });

    setSlidesToMaximum();
  });

  topicsContainer?.addEventListener("change", (event) => {
    if (!event.target.matches('input[type="checkbox"][data-topic]')) {
      return;
    }

    const topicCheckboxes = getTopicCheckboxes();
    const selectedCount = topicCheckboxes.filter(
      (checkbox) => checkbox.checked,
    ).length;

    allTopicsCheckbox.checked =
      topicCheckboxes.length > 0 && selectedCount === topicCheckboxes.length;

    allTopicsCheckbox.indeterminate =
      selectedCount > 0 && selectedCount < topicCheckboxes.length;

    setSlidesToMaximum();
  });

  slidesBtn?.addEventListener("click", () => {
    const maximum = getFilteredSlides().length;

    if (maximum === 0) {
      alert("יש לבחור לפחות נושא אחד שיש בו שקופיות.");
      return;
    }

    modalInput.min = "1";
    modalInput.max = String(maximum);
    modalInput.value = String(Math.min(Math.max(numSlides, 1), maximum));
    modalHelp.textContent = `ניתן לבחור בין 1 ל־${maximum} שקופיות.`;

    openModal();
  });

  saveBtn?.addEventListener("click", () => {
    const maximum = getFilteredSlides().length;
    let value = Number(modalInput.value);

    if (!Number.isFinite(value) || !Number.isInteger(value)) {
      alert("יש להזין מספר שלם ותקין.");
      return;
    }

    value = Math.min(Math.max(value, 1), maximum);
    numSlides = value;

    closeModal();
    updateSettings();
  });

  cancelBtn?.addEventListener("click", closeModal);

  modal?.addEventListener("click", (event) => {
    if (event.target === modal) {
      closeModal();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modal?.classList.contains("show")) {
      closeModal();
    }
  });

  startBtn?.addEventListener("click", () => {
    if (subjectKey !== "anatomy") {
      alert("מבחן הזיהוי זמין כרגע רק בנושא אנטומיה.");
      return;
    }

    const selectedTopics = getSelectedTopics();
    const filteredSlides = getFilteredSlides();

    if (selectedTopics.length === 0 || filteredSlides.length === 0) {
      alert("יש לבחור לפחות נושא אחד שיש בו שקופיות.");
      return;
    }

    numSlides = Math.min(Math.max(numSlides, 1), filteredSlides.length);

    const settings = {
      subject: "anatomy",
      topics: selectedTopics,
      numSlides,
      shuffle: true,
    };

    localStorage.setItem("identificationSettings", JSON.stringify(settings));

    const query = new URLSearchParams({
      subject: "anatomy",
      topics: selectedTopics.join(","),
      slides: String(numSlides),
    });

    window.location.href = `identification-test.html?${query.toString()}`;
  });

  prevPageBtn?.addEventListener("click", () => {
    window.location.href = `select-method.html?subject=${encodeURIComponent(
      subjectKey || "anatomy",
    )}`;
  });

  homePageBtn?.addEventListener("click", () => {
    localStorage.removeItem("selectedSubjectKey");
    localStorage.removeItem("selectedSubjectLabel");
    localStorage.removeItem("selectedMethodKey");
    localStorage.removeItem("selectedMethodLabel");

    window.location.href = "index.html";
  });

  function getIdentificationBank(key) {
    if (
      window.identificationBanks &&
      Array.isArray(window.identificationBanks[key])
    ) {
      return window.identificationBanks[key];
    }

    if (Array.isArray(window.identificationBank)) {
      return window.identificationBank;
    }

    return [];
  }

  function getSlideTopic(slide) {
    const topic = slide?.topic || slide?.subtopic || slide?.category;

    return typeof topic === "string" && topic.trim()
      ? topic.trim()
      : "ללא נושא";
  }

  function getTopics() {
    return [...new Set(bank.map(getSlideTopic))].sort((a, b) =>
      a.localeCompare(b, "he"),
    );
  }

  function renderTopics() {
    const topics = getTopics();

    topicsContainer.innerHTML = "";
    allTopicsCount.textContent = formatSlides(bank.length);

    if (subjectKey !== "anatomy") {
      topicsContainer.innerHTML =
        '<p class="empty-message">מבחן הזיהוי זמין כרגע רק באנטומיה.</p>';
      allTopicsCheckbox.checked = false;
      allTopicsCheckbox.disabled = true;
      return;
    }

    if (topics.length === 0) {
      topicsContainer.innerHTML =
        '<p class="empty-message">עדיין לא נטען מאגר שקופיות זיהוי.</p>';
      allTopicsCheckbox.checked = false;
      allTopicsCheckbox.disabled = true;
      return;
    }

    topics.forEach((topic, index) => {
      const topicCount = bank.filter(
        (slide) => getSlideTopic(slide) === topic,
      ).length;

      const label = document.createElement("label");
      label.className = "topic-option";
      label.htmlFor = `topic-${index}`;

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.id = `topic-${index}`;
      checkbox.dataset.topic = topic;
      checkbox.checked = true;

      const textWrap = document.createElement("span");
      textWrap.className = "topic-option__text";

      const title = document.createElement("strong");
      title.textContent = topic;

      const count = document.createElement("small");
      count.textContent = formatSlides(topicCount);

      textWrap.append(title, count);
      label.append(checkbox, textWrap);
      topicsContainer.appendChild(label);
    });
  }

  function getTopicCheckboxes() {
    return [
      ...topicsContainer.querySelectorAll('input[type="checkbox"][data-topic]'),
    ];
  }

  function getSelectedTopics() {
    return getTopicCheckboxes()
      .filter((checkbox) => checkbox.checked)
      .map((checkbox) => checkbox.dataset.topic);
  }

  function getFilteredSlides() {
    const selectedTopics = new Set(getSelectedTopics());

    return bank.filter((slide) => selectedTopics.has(getSlideTopic(slide)));
  }

  function setSlidesToMaximum() {
    numSlides = getFilteredSlides().length;
    updateSettings();
  }

  function updateSettings() {
    const availableCount = getFilteredSlides().length;

    if (availableCount === 0) {
      numSlides = 0;
      slidesValue.textContent = "אין שקופיות זמינות";
      availableSlidesText.textContent = "לא נמצאו שקופיות בנושאים שנבחרו";
      slidesBtn.disabled = true;
      startBtn.disabled = true;

      statusMessage.textContent =
        bank.length === 0
          ? "לאחר שנחבר את מאגר הזיהוי, הנושאים יופיעו כאן אוטומטית."
          : "בחר לפחות נושא אחד כדי להתחיל.";
      return;
    }

    numSlides = Math.min(Math.max(numSlides, 1), availableCount);

    slidesValue.textContent = formatSlides(numSlides);
    availableSlidesText.textContent = `זמינות ${formatSlides(
      availableCount,
    )} בנושאים שנבחרו`;

    slidesBtn.disabled = false;
    startBtn.disabled = subjectKey !== "anatomy";
    statusMessage.textContent = "";
  }

  function formatSlides(count) {
    if (count === 1) {
      return "שקופית אחת";
    }

    return `${count} שקופיות`;
  }

  function openModal() {
    modal.classList.add("show");
    modal.setAttribute("aria-hidden", "false");
    modalInput.focus();
    modalInput.select();
  }

  function closeModal() {
    modal.classList.remove("show");
    modal.setAttribute("aria-hidden", "true");
  }
});
