window.addEventListener("DOMContentLoaded", () => {
  // ================================
  // איתור האלמנטים
  // ================================

  const subjectGrid = document.querySelector(".subject-grid");

  const subjectCards = [
    ...document.querySelectorAll(".subject-card[data-key]"),
  ];

  const searchInput = document.getElementById("subjectSearch");
  const clearSearchButton = document.getElementById("clearSubjectSearch");
  const noSubjectsMessage = document.getElementById("noSubjectsMessage");
  const subjectsLoader = document.getElementById("subjectsLoader");

  // ================================
  // הגדרות חיפוש
  // ================================

  const SEARCH_DELAY = 160;
  const GRID_FADE_DURATION = 140;
  const LOADER_DURATION = 260;

  let inputTimer = null;
  let searchProcessTimer = null;
  let searchVersion = 0;
  let isFiltering = false;

  // ================================
  // ניקוי טקסט לצורך השוואה
  // ================================

  function normalizeSearchText(value) {
    return String(value).trim().toLocaleLowerCase("he").replace(/\s+/g, " ");
  }

  // ================================
  // קבלת שם הנושא מהכרטיס
  // ================================

  function getSubjectLabel(card) {
    const titleElement = card.querySelector(".subject-card__title");

    if (titleElement) {
      return titleElement.textContent.trim();
    }

    return card.textContent.trim();
  }

  // ================================
  // מצב כפתור האיפוס
  // ================================

  function updateClearButton() {
    if (!clearSearchButton) {
      return;
    }

    const hasText = Boolean(searchInput?.value.trim());

    clearSearchButton.hidden = !hasText;
  }

  // ================================
  // הצגת מצב טעינה
  // ================================

  function showLoader() {
    subjectsLoader?.removeAttribute("hidden");
    subjectsLoader?.setAttribute("aria-hidden", "false");

    subjectGrid?.classList.add("is-hiding");
    subjectGrid?.classList.remove("is-visible");

    if (noSubjectsMessage) {
      noSubjectsMessage.hidden = true;
    }

    searchInput?.classList.add("is-searching");
  }

  // ================================
  // הסתרת מצב טעינה
  // ================================

  function hideLoader() {
    subjectsLoader?.setAttribute("hidden", "");
    subjectsLoader?.setAttribute("aria-hidden", "true");

    searchInput?.classList.remove("is-searching");
  }

  // ================================
  // קביעת הכרטיסים המתאימים
  // ================================

  function filterCards(searchValue) {
    let visibleCardsCount = 0;

    subjectCards.forEach((card) => {
      const subjectLabel = normalizeSearchText(getSubjectLabel(card));

      const shouldShow =
        searchValue === "" || subjectLabel.includes(searchValue);

      card.hidden = !shouldShow;

      if (shouldShow) {
        visibleCardsCount += 1;
      }
    });

    return visibleCardsCount;
  }

  // ================================
  // סיום החיפוש והצגת התוצאות
  // ================================

  function finishSearch(version, searchValue) {
    if (version !== searchVersion) {
      return;
    }

    const visibleCardsCount = filterCards(searchValue);

    hideLoader();

    requestAnimationFrame(() => {
      if (version !== searchVersion) {
        return;
      }

      subjectGrid?.classList.remove("is-hiding");

      requestAnimationFrame(() => {
        subjectGrid?.classList.add("is-visible");
      });
    });

    if (noSubjectsMessage) {
      noSubjectsMessage.hidden = visibleCardsCount !== 0;
    }

    isFiltering = false;
  }

  // ================================
  // הפעלת חיפוש
  // ================================

  function runSearch() {
    const version = ++searchVersion;

    const searchValue = normalizeSearchText(searchInput?.value || "");

    window.clearTimeout(searchProcessTimer);

    isFiltering = true;

    showLoader();

    /*
      קודם מחכים שהגריד ייעלם,
      לאחר מכן מציגים לזמן קצר את הטעינה,
      ורק אז מסדרים ומציגים את התוצאות.
    */
    searchProcessTimer = window.setTimeout(() => {
      finishSearch(version, searchValue);
    }, GRID_FADE_DURATION + LOADER_DURATION);
  }

  // ================================
  // הקלדה בשורת החיפוש
  // ================================

  function handleSearchInput() {
    updateClearButton();

    window.clearTimeout(inputTimer);

    inputTimer = window.setTimeout(() => {
      runSearch();
    }, SEARCH_DELAY);
  }

  // ================================
  // ניקוי החיפוש
  // ================================

  function clearSubjectSearch() {
    if (!searchInput) {
      return;
    }

    window.clearTimeout(inputTimer);
    window.clearTimeout(searchProcessTimer);

    searchInput.value = "";

    updateClearButton();
    runSearch();

    searchInput.focus();
  }

  // ================================
  // אירועי שורת החיפוש
  // ================================

  searchInput?.addEventListener("input", handleSearchInput);

  clearSearchButton?.addEventListener("click", clearSubjectSearch);

  searchInput?.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && searchInput.value.trim()) {
      clearSubjectSearch();
    }
  });

  // ================================
  // לחיצה על כרטיס נושא
  // ================================

  subjectCards.forEach((button) => {
    button.addEventListener("click", () => {
      if (isFiltering) {
        return;
      }

      const subjectKey = button.dataset.key?.trim() || "";
      const subjectLabel = getSubjectLabel(button);

      if (!subjectKey) {
        console.error("לא נמצא data-key בכרטיס הנושא");
        return;
      }

      if (button.classList.contains("is-opening")) {
        return;
      }

      button.classList.add("is-opening");

      localStorage.setItem("selectedSubjectKey", subjectKey);
      localStorage.setItem("selectedSubjectLabel", subjectLabel);

      window.setTimeout(() => {
        window.location.href = `select-method.html?subject=${encodeURIComponent(subjectKey)}`;
      }, 150);
    });
  });

  // ================================
  // מצב התחלתי
  // ================================

  subjectCards.forEach((card) => {
    card.hidden = false;
    card.classList.remove("is-opening");
  });

  subjectsLoader?.setAttribute("hidden", "");
  subjectsLoader?.setAttribute("aria-hidden", "true");

  subjectGrid?.classList.remove("is-hiding");
  subjectGrid?.classList.add("is-visible");

  if (noSubjectsMessage) {
    noSubjectsMessage.hidden = true;
  }

  updateClearButton();
});
