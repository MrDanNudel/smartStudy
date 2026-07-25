(() => {
  "use strict";

  /*
    =========================================================
    מנוע למידה ויזואלית כללי
    =========================================================

    העמוד מתאים את עצמו לפי המקצוע שנבחר דרך:
      visual-learning.html?subject=anatomy

    אפשר גם לשמור לפני המעבר לעמוד:
      localStorage.setItem("selectedSubject", "anatomy");

    המבנה המומלץ לכל מקצוע:
      window.visualLearningSubjects = {
        anatomy: {
          title: "לימוד ושינון אנטומיה",
          description: "שרירים • עצמות • רצועות • מערכות גוף",
          defaultTopic: "general",
          topics: {
            general: {
              label: "כללי",
              items: [...]
            }
          }
        }
      };

    הקוד תומך גם במאגרים הישנים שלך:
      item.image
      item.images
      item.answer
      item.answerHe
      item.type

    וגם במבנה החדש:
      item.slides = [
        {
          id: "slide-1",
          image: "imgs/example.png",
          explanation: "...",
          explanationHe: "..."
        },
        {
          id: "slide-2",
          video: "videos/example.mp4",
          explanation: "..."
        }
      ];
  */

  /* =========================
     הגדרות כלליות
  ========================= */

  const STORAGE_KEYS = {
    selectedSubject: "selectedSubject",
    language: "studyLanguage",
    ratings: "visualLearningRatings",
  };

  const FILTERS = {
    ALL: "all",
    EASY: "easy",
    HARD: "hard",
    UNMARKED: "unmarked",
  };

  const RATINGS = {
    EASY: "easy",
    HARD: "hard",
  };

  /* =========================
     חיבור לאלמנטים ב־HTML
  ========================= */

  const elements = {
    pageTitle: document.getElementById("pageTitle"),
    pageDescription: document.getElementById("pageDescription"),
    topicSelect: document.getElementById("topicSelect"),

    filterButtons: [...document.querySelectorAll("[data-filter]")],
    randomBtn: document.getElementById("randomBtn"),
    resetBtn: document.getElementById("resetBtn"),

    emptyState: document.getElementById("emptyState"),
    emptyStateText: document.getElementById("emptyStateText"),
    showAllBtn: document.getElementById("showAllBtn"),
    learningCard: document.getElementById("learningCard"),

    progressText: document.getElementById("progressText"),
    statusText: document.getElementById("statusText"),
    levelBadge: document.getElementById("levelBadge"),

    itemTitle: document.getElementById("itemTitle"),
    itemSubtitle: document.getElementById("itemSubtitle"),

    mediaBox: document.getElementById("mediaBox"),
    previousMediaArea: document.getElementById("previousMediaArea"),
    nextMediaArea: document.getElementById("nextMediaArea"),
    itemImage: document.getElementById("itemImage"),
    itemVideo: document.getElementById("itemVideo"),
    mediaFallback: document.getElementById("mediaFallback"),

    previousBtn: document.getElementById("previousBtn"),
    nextBtn: document.getElementById("nextBtn"),

    progressLabel: document.getElementById("progressLabel"),
    progressPercentage: document.getElementById("progressPercentage"),
    progressTrack: document.getElementById("progressTrack"),
    progressBar: document.getElementById("progressBar"),

    explanationHeading: document.getElementById("explanationHeading"),
    explanationContent: document.getElementById("explanationContent"),

    easyBtn: document.getElementById("easyBtn"),
    hardBtn: document.getElementById("hardBtn"),

    bottomPreviousBtn: document.getElementById("bottomPreviousBtn"),
    bottomNextBtn: document.getElementById("bottomNextBtn"),
  };

  const missingElements = Object.entries(elements)
    .filter(([, value]) => value === null)
    .map(([key]) => key);

  if (missingElements.length > 0) {
    console.error(
      "חסרים אלמנטים ב־HTML הדרושים ל־visual-learning.js:",
      missingElements,
    );

    return;
  }

  /* =========================
     מצב האפליקציה
  ========================= */

  const state = {
    subjectKey: "",
    subject: null,
    topicKey: "",
    allEntries: [],
    visibleEntries: [],
    currentIndex: 0,
    currentFilter: FILTERS.ALL,
    isRandomMode: false,
    language: localStorage.getItem(STORAGE_KEYS.language) || "he",
    ratings: readJSON(STORAGE_KEYS.ratings, {}),
  };

  /* =========================
     כלי עזר
  ========================= */

  function readJSON(key, fallbackValue) {
    try {
      const value = JSON.parse(localStorage.getItem(key));

      return value ?? fallbackValue;
    } catch (error) {
      console.warn(`לא ניתן לקרוא את ${key} מ־localStorage`, error);

      return fallbackValue;
    }
  }

  function saveRatings() {
    localStorage.setItem(STORAGE_KEYS.ratings, JSON.stringify(state.ratings));
  }

  function escapeHTML(value = "") {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function shuffleArray(array) {
    const shuffled = [...array];

    for (let index = shuffled.length - 1; index > 0; index -= 1) {
      const randomIndex = Math.floor(Math.random() * (index + 1));

      [shuffled[index], shuffled[randomIndex]] = [
        shuffled[randomIndex],
        shuffled[index],
      ];
    }

    return shuffled;
  }

  function slugify(value = "") {
    return String(value)
      .trim()
      .toLowerCase()
      .replace(/[^\p{L}\p{N}]+/gu, "-")
      .replace(/^-+|-+$/g, "");
  }

  function getUrlSubject() {
    const params = new URLSearchParams(window.location.search);

    return params.get("subject") || "";
  }

  function getSelectedSubjectKey(subjects) {
    const fromUrl = getUrlSubject();

    const fromStorage = localStorage.getItem(STORAGE_KEYS.selectedSubject);

    const firstAvailable = Object.keys(subjects)[0] || "";

    if (fromUrl && subjects[fromUrl]) {
      return fromUrl;
    }

    if (fromStorage && subjects[fromStorage]) {
      return fromStorage;
    }

    return firstAvailable;
  }

  function getTranslatedValue(source, fieldName, fallback = "") {
    if (!source) {
      return fallback;
    }

    if (state.language === "he") {
      return (
        source[`${fieldName}He`] ||
        source[`${fieldName}Hebrew`] ||
        source[fieldName] ||
        fallback
      );
    }

    return (
      source[fieldName] ||
      source[`${fieldName}En`] ||
      source[`${fieldName}English`] ||
      source[`${fieldName}He`] ||
      fallback
    );
  }

  function normalizeText(value) {
    if (Array.isArray(value)) {
      return value.filter(Boolean).join(" • ");
    }

    if (value === null || value === undefined) {
      return "";
    }

    return String(value);
  }

  function stopCurrentVideo() {
    elements.itemVideo.pause();
    elements.itemVideo.currentTime = 0;
    elements.itemVideo.removeAttribute("src");
    elements.itemVideo.load();
  }

  /* =========================
     בניית מקצוע אנטומיה מהמאגרים הישנים
  ========================= */

  function buildLegacyAnatomySubject() {
    const topicDefinitions = [
      ["general", "כללי", "generalData"],

      ["upperBodyMuscles", "שרירי פלג גוף עליון", "upperBodyMusclesData"],

      ["upperBodyData", "פלג גוף עליון", "upperBodyData"],

      ["circulatorySystem", "מחזור הדם והלב", "circulatorySystemData"],

      ["respiratorySystem", "מערכת הנשימה", "respiratorySystemData"],

      ["nervousSystem", "מערכת העצבים", "nervousSystemData"],

      ["abdominalMuscles", "שרירי בטן", "abdominalMusclesData"],

      ["lowerBodyMuscles", "שרירים – פלג גוף תחתון", "musclesData"],

      ["lowerBodyBones", "עצמות – פלג גוף תחתון", "lowerBodyBonesData"],

      [
        "lowerBodyLigaments",
        "רצועות ומייצבי מפרקים – פלג גוף תחתון",
        "lowerBodyLigamentsData",
      ],

      ["footbones", "עצמות – כף רגל", "footData"],
    ];

    const topics = {};

    topicDefinitions.forEach(([topicKey, label, globalVariableName]) => {
      const items = window[globalVariableName];

      if (Array.isArray(items)) {
        topics[topicKey] = {
          label,
          items,
        };
      }
    });

    if (Object.keys(topics).length === 0) {
      return null;
    }

    return {
      title: "לימוד ושינון אנטומיה",

      description: "שרירים • עצמות • רצועות • מערכות גוף",

      defaultTopic: topics.general ? "general" : Object.keys(topics)[0],

      topics,
    };
  }

  function getSubjectsRegistry() {
    const registry = {
      ...(window.visualLearningSubjects || {}),
    };

    if (!registry.anatomy) {
      const legacyAnatomy = buildLegacyAnatomySubject();

      if (legacyAnatomy) {
        registry.anatomy = legacyAnatomy;
      }
    }

    return registry;
  }

  /* =========================
     המרת הנתונים לשקופיות אחידות
  ========================= */
  function getItemType(item) {
    if (item.type) return item.type;

    if (
      item.origin ||
      item.originHe ||
      item.insertion ||
      item.insertionHe ||
      item.actions ||
      item.actionsHe
    ) {
      return "muscle";
    }

    if (
      item.answer &&
      /Origin:|Insertion:|Actions:|Action:|התחלה:|אחיזה:|פעולות:|פעולה:/i.test(
        item.answer,
      )
    ) {
      return "muscle";
    }

    return "default";
  }

  function getItemTitle(item) {
    return (
      getTranslatedValue(item, "title") ||
      getTranslatedValue(item, "q") ||
      getTranslatedValue(item, "name") ||
      "פריט ללא שם"
    );
  }

  function getItemSubtitle(item) {
    const explicitSubtitle =
      getTranslatedValue(item, "subtitle") ||
      getTranslatedValue(item, "subTitle");

    if (explicitSubtitle) return explicitSubtitle;

    const type = getItemType(item);

    if (type === "muscle") {
      return (
        item.qHebrew ||
        item.qHe ||
        item.hebrewName ||
        item.nameHebrew ||
        item.subtopic ||
        "שריר"
      );
    }

    const typeLabels = {
      system: "מערכת אנטומית",
      bone: "עצם",
      joint: "מפרק",
      ligament: "רצועה",
      muscle: "שריר",
    };

    return item.subtopic || typeLabels[type] || "";
  }

  function getSlideExplanation(item, slide) {
    const slideExplanation =
      getTranslatedValue(slide, "explanation") ||
      getTranslatedValue(slide, "description") ||
      getTranslatedValue(slide, "answer");

    if (slideExplanation) return slideExplanation;

    return (
      getTranslatedValue(item, "explanation") ||
      getTranslatedValue(item, "description") ||
      getTranslatedValue(item, "answer")
    );
  }

  function normalizeSlide(item, rawSlide, slideIndex) {
    const slide =
      typeof rawSlide === "string"
        ? { image: rawSlide }
        : { ...(rawSlide || {}) };

    const mediaType =
      slide.mediaType ||
      slide.type ||
      (slide.video || slide.videoSrc ? "video" : "image");

    const mediaSrc =
      slide.mediaSrc ||
      slide.src ||
      slide.image ||
      slide.imageSrc ||
      slide.video ||
      slide.videoSrc ||
      "";

    return {
      id:
        slide.id ||
        `${item.id || slugify(getItemTitle(item)) || "item"}-slide-${
          slideIndex + 1
        }`,

      mediaType,
      mediaSrc,

      alt: getTranslatedValue(slide, "alt") || getItemTitle(item),

      title: getTranslatedValue(slide, "title") || getItemTitle(item),

      subtitle: getTranslatedValue(slide, "subtitle") || getItemSubtitle(item),

      explanation: getSlideExplanation(item, slide),

      raw: slide,
    };
  }

  function getItemSlides(item) {
    if (Array.isArray(item.slides) && item.slides.length > 0) {
      return item.slides.map((slide, index) =>
        normalizeSlide(item, slide, index),
      );
    }

    if (Array.isArray(item.media) && item.media.length > 0) {
      return item.media.map((slide, index) =>
        normalizeSlide(item, slide, index),
      );
    }

    if (Array.isArray(item.images) && item.images.length > 0) {
      return item.images
        .filter(Boolean)
        .map((image, index) => normalizeSlide(item, { image }, index));
    }

    if (item.image) {
      return [
        normalizeSlide(
          item,
          {
            image: item.image,
          },
          0,
        ),
      ];
    }

    if (item.video || item.videoSrc) {
      return [
        normalizeSlide(
          item,
          {
            video: item.video || item.videoSrc,
          },
          0,
        ),
      ];
    }

    return [
      normalizeSlide(
        item,
        {
          mediaType: "none",
          explanation: getSlideExplanation(item, {}),
        },
        0,
      ),
    ];
  }

  function flattenTopicItems(items) {
    const entries = [];

    items.forEach((item, itemIndex) => {
      const itemId =
        item.id ||
        `${state.subjectKey}-${state.topicKey}-item-${itemIndex + 1}`;

      const slides = getItemSlides(item);

      slides.forEach((slide, slideIndex) => {
        const entryId = [
          state.subjectKey,
          state.topicKey,
          itemId,
          slide.id || `slide-${slideIndex + 1}`,
        ].join("::");

        entries.push({
          id: entryId,
          itemId,
          itemIndex,
          slideIndex,
          totalSlidesInItem: slides.length,
          item,
          slide,
        });
      });
    });

    return entries;
  }

  /* =========================
     טעינת המקצוע ותתי־הנושאים
  ========================= */

  function initializeSubject() {
    const subjects = getSubjectsRegistry();

    const subjectKey = getSelectedSubjectKey(subjects);

    if (!subjectKey || !subjects[subjectKey]) {
      showFatalState(
        "לא נמצא מקצוע ללמידה",
        "יש להגדיר מקצוע בתוך window.visualLearningSubjects או לטעון את מאגרי האנטומיה.",
      );

      return false;
    }

    state.subjectKey = subjectKey;
    state.subject = subjects[subjectKey];

    localStorage.setItem(STORAGE_KEYS.selectedSubject, subjectKey);

    document.title =
      state.subject.browserTitle || state.subject.title || "למידה ויזואלית";

    elements.pageTitle.textContent = state.subject.title || "למידה ויזואלית";

    elements.pageDescription.textContent =
      state.subject.description ||
      "בחרו תת־נושא והתחילו ללמוד באמצעות תמונות, סרטונים והסברים";

    populateTopics();

    return true;
  }

  function populateTopics() {
    const topics = state.subject.topics || {};
    const topicKeys = Object.keys(topics);

    elements.topicSelect.innerHTML = "";

    if (topicKeys.length === 0) {
      showFatalState(
        "אין תתי־נושאים במקצוע הזה",
        "יש להוסיף לפחות תת־נושא אחד למאפיין topics.",
      );

      return;
    }

    const allTopicsOption = document.createElement("option");

    allTopicsOption.value = "all";
    allTopicsOption.textContent = "כל הנושאים";

    elements.topicSelect.append(allTopicsOption);

    topicKeys.forEach((topicKey) => {
      const topic = topics[topicKey];
      const option = document.createElement("option");

      option.value = topicKey;

      option.textContent = topic.label || topic.title || topicKey;

      elements.topicSelect.append(option);
    });

    const savedTopic = localStorage.getItem(
      `visualLearningTopic:${state.subjectKey}`,
    );

    const preferredTopic =
      savedTopic === "all" || topics[savedTopic]
        ? savedTopic
        : state.subject.defaultTopic === "all"
          ? "all"
          : state.subject.defaultTopic && topics[state.subject.defaultTopic]
            ? state.subject.defaultTopic
            : "all";

    elements.topicSelect.value = preferredTopic;

    selectTopic(preferredTopic);
  }

  function selectTopic(topicKey) {
    const topics = state.subject.topics || {};

    state.topicKey = topicKey;
    state.currentFilter = FILTERS.ALL;
    state.currentIndex = 0;
    state.isRandomMode = false;

    localStorage.setItem(`visualLearningTopic:${state.subjectKey}`, topicKey);

    let items = [];

    if (topicKey === "all") {
      Object.entries(topics).forEach(([currentTopicKey, topic]) => {
        const topicItems = Array.isArray(topic.items)
          ? topic.items
          : Array.isArray(topic.data)
            ? topic.data
            : [];

        topicItems.forEach((item) => {
          items.push({
            ...item,

            visualTopicKey: currentTopicKey,

            visualTopicLabel: topic.label || topic.title || currentTopicKey,
          });
        });
      });
    } else {
      const topic = topics[topicKey];

      if (!topic) {
        return;
      }

      const topicItems = Array.isArray(topic.items)
        ? topic.items
        : Array.isArray(topic.data)
          ? topic.data
          : [];

      items = topicItems.map((item) => ({
        ...item,

        visualTopicKey: topicKey,

        visualTopicLabel: topic.label || topic.title || topicKey,
      }));
    }

    state.allEntries = flattenTopicItems(items);

    updateFilterButtons();
    updateRandomButton();
    buildVisibleEntries();
  }

  /* =========================
     סינון, ערבוב ואיפוס
  ========================= */

  function getRating(entry) {
    return state.ratings[entry.id] || "";
  }

  function setRating(entry, rating) {
    const currentRating = getRating(entry);

    if (currentRating === rating) {
      delete state.ratings[entry.id];
    } else {
      state.ratings[entry.id] = rating;
    }

    saveRatings();
  }

  function filterEntries(entries) {
    if (state.currentFilter === FILTERS.EASY) {
      return entries.filter((entry) => getRating(entry) === RATINGS.EASY);
    }

    if (state.currentFilter === FILTERS.HARD) {
      return entries.filter((entry) => getRating(entry) === RATINGS.HARD);
    }

    if (state.currentFilter === FILTERS.UNMARKED) {
      return entries.filter((entry) => !getRating(entry));
    }

    return [...entries];
  }

  function buildVisibleEntries({ preserveEntryId = "" } = {}) {
    const filteredEntries = filterEntries(state.allEntries);

    state.visibleEntries = state.isRandomMode
      ? shuffleArray(filteredEntries)
      : filteredEntries;

    if (preserveEntryId) {
      const preservedIndex = state.visibleEntries.findIndex(
        (entry) => entry.id === preserveEntryId,
      );

      state.currentIndex =
        preservedIndex >= 0
          ? preservedIndex
          : Math.min(
              state.currentIndex,
              Math.max(0, state.visibleEntries.length - 1),
            );
    } else {
      state.currentIndex = 0;
    }

    render();
  }

  function setFilter(filterName) {
    const currentEntry = getCurrentEntry();

    state.currentFilter = filterName;

    updateFilterButtons();

    buildVisibleEntries({
      preserveEntryId: currentEntry?.id || "",
    });
  }

  function toggleRandomMode() {
    const currentEntry = getCurrentEntry();

    state.isRandomMode = !state.isRandomMode;

    updateRandomButton();

    buildVisibleEntries({
      preserveEntryId: currentEntry?.id || "",
    });
  }

  function resetCurrentTopicRatings() {
    const approved = window.confirm("לאפס את כל הסימונים בתת־הנושא הנוכחי?");

    if (!approved) return;

    state.allEntries.forEach((entry) => {
      delete state.ratings[entry.id];
    });

    saveRatings();

    state.currentFilter = FILTERS.ALL;
    state.currentIndex = 0;

    updateFilterButtons();
    buildVisibleEntries();
  }

  function getCurrentEntry() {
    return state.visibleEntries[state.currentIndex] || null;
  }

  function render() {
    if (state.visibleEntries.length === 0) {
      renderEmptyState();
      return;
    }

    elements.emptyState.hidden = true;
    elements.learningCard.hidden = false;

    const entry = getCurrentEntry();

    renderHeading(entry);
    renderMedia(entry);
    renderExplanation(entry);
    renderProgress(entry);
    renderRating(entry);
    renderNavigation();
  }

  function renderEmptyState() {
    stopCurrentVideo();

    elements.learningCard.hidden = true;
    elements.emptyState.hidden = false;

    const messages = {
      easy: "עדיין לא סומנו תמונות כקלות בתת־הנושא הזה.",

      hard: "עדיין לא סומנו תמונות כקשות בתת־הנושא הזה.",

      unmarked: "כל התמונות בתת־הנושא הזה כבר סומנו.",

      all: "לא נמצאו פריטי למידה בתת־הנושא הזה.",
    };

    elements.emptyStateText.textContent =
      messages[state.currentFilter] || "אין כרגע פריטים שמתאימים לסינון שבחרת.";
  }

  function showFatalState(title, message) {
    elements.learningCard.hidden = true;
    elements.emptyState.hidden = false;

    const emptyTitle = elements.emptyState.querySelector("h2");

    if (emptyTitle) {
      emptyTitle.textContent = title;
    }

    elements.emptyStateText.textContent = message;
    elements.showAllBtn.hidden = true;
  }

  function renderHeading(entry) {
    elements.itemTitle.textContent =
      entry.slide.title || getItemTitle(entry.item);

    const topicLabel = entry.item.visualTopicLabel || "";

    const subtitle = entry.slide.subtitle || getItemSubtitle(entry.item);

    elements.itemSubtitle.textContent =
      topicLabel && subtitle
        ? `${topicLabel} • ${subtitle}`
        : topicLabel || subtitle;

    elements.itemSubtitle.hidden = !elements.itemSubtitle.textContent.trim();
  }

  function hideAllMedia() {
    elements.itemImage.hidden = true;
    elements.itemVideo.hidden = true;
    elements.mediaFallback.hidden = true;
  }

  function renderMedia(entry) {
    hideAllMedia();
    stopCurrentVideo();

    const { mediaType, mediaSrc, alt } = entry.slide;

    if (!mediaSrc || mediaType === "none") {
      elements.mediaFallback.hidden = false;
      return;
    }

    if (mediaType === "video") {
      elements.itemVideo.src = mediaSrc;
      elements.itemVideo.hidden = false;
      elements.itemVideo.load();

      return;
    }

    elements.itemImage.alt = alt || getItemTitle(entry.item);

    elements.itemImage.src = mediaSrc;
    elements.itemImage.hidden = false;
  }

  function getExplanationRows(entry) {
    const item = entry.item;
    const slide = entry.slide;

    const rows = [];

    const slideExplanation = slide.explanation;

    if (slideExplanation) {
      rows.push({
        label: state.language === "he" ? "הסבר" : "Explanation",

        value: slideExplanation,
      });
    }

    const type = getItemType(item);

    if (type === "muscle") {
      const muscleFields = [
        ["description", "תיאור כללי", "General description"],

        ["origin", "התחלה", "Origin"],

        ["insertion", "אחיזה", "Insertion"],

        ["actions", "פעולה", "Action"],

        ["recommendedExercises", "תרגילים מומלצים", "Recommended exercises"],
      ];

      muscleFields.forEach(([field, labelHe, labelEn]) => {
        const value = getTranslatedValue(item, field);

        if (value) {
          rows.push({
            label: state.language === "he" ? labelHe : labelEn,

            value,
          });
        }
      });
    } else {
      const genericFields = [
        ["location", "מיקום", "Location"],

        ["pathway", "מסלול / מעבר מידע", "Pathway"],

        ["functions", "תפקידים", "Functions"],

        ["keyStructures", "מבנים מרכזיים", "Key structures"],

        ["influencingFactors", "גורמים משפיעים", "Influencing factors"],

        ["recommendedExercises", "תרגול מומלץ", "Study practice"],
      ];

      genericFields.forEach(([field, labelHe, labelEn]) => {
        const value = getTranslatedValue(item, field);

        if (value) {
          rows.push({
            label: state.language === "he" ? labelHe : labelEn,

            value,
          });
        }
      });
    }

    if (rows.length === 0) {
      const fallbackAnswer = getTranslatedValue(item, "answer");

      if (fallbackAnswer) {
        rows.push({
          label: state.language === "he" ? "הסבר" : "Explanation",

          value: fallbackAnswer,
        });
      }
    }

    return rows;
  }

  function renderExplanation(entry) {
    const rows = getExplanationRows(entry);

    elements.explanationHeading.textContent = "הסבר";

    elements.explanationContent.setAttribute("dir", "rtl");

    const rowsHTML = rows.length
      ? rows
          .map(({ label, value }) => {
            const cleanLabel =
              label === "הסבר" || label === "Explanation" ? "" : label;

            return `
            <div class="answer-row">
              ${
                cleanLabel
                  ? `
                    <strong class="answer-label">
                      ${escapeHTML(cleanLabel)}:
                    </strong>
                  `
                  : ""
              }

              <div class="answer-text">
                ${escapeHTML(normalizeText(value))}
              </div>
            </div>
          `;
          })
          .join("")
      : `
        <p class="empty-explanation">
          לא נוסף עדיין הסבר לתמונה הזאת.
        </p>
      `;

    elements.explanationContent.innerHTML = rowsHTML;
  }

  function renderProgress(entry) {
    const total = state.visibleEntries.length;
    const position = state.currentIndex + 1;

    const percentage = total > 0 ? (position / total) * 100 : 0;

    elements.progressText.textContent = `תמונה ${position} מתוך ${total}`;

    elements.progressLabel.textContent = "";
    elements.progressLabel.hidden = true;

    elements.progressPercentage.textContent = `${Math.round(percentage)}%`;

    elements.progressBar.style.width = `${percentage}%`;

    elements.progressTrack.setAttribute(
      "aria-valuenow",
      String(Math.round(percentage)),
    );

    elements.progressTrack.setAttribute(
      "aria-valuetext",
      `${position} מתוך ${total}`,
    );
  }

  function renderRating(entry) {
    const rating = getRating(entry);

    elements.levelBadge.classList.remove("easy", "hard", "unmarked");

    elements.easyBtn.classList.toggle("active", rating === RATINGS.EASY);

    elements.hardBtn.classList.toggle("active", rating === RATINGS.HARD);

    elements.easyBtn.setAttribute(
      "aria-pressed",
      String(rating === RATINGS.EASY),
    );

    elements.hardBtn.setAttribute(
      "aria-pressed",
      String(rating === RATINGS.HARD),
    );

    if (rating === RATINGS.EASY) {
      elements.statusText.textContent = "קל";

      elements.levelBadge.classList.add("easy");

      elements.levelBadge.title = "סומן כקל";

      elements.levelBadge.setAttribute("aria-label", "התמונה סומנה כקלה");

      return;
    }

    if (rating === RATINGS.HARD) {
      elements.statusText.textContent = "קשה";

      elements.levelBadge.classList.add("hard");

      elements.levelBadge.title = "סומן כקשה";

      elements.levelBadge.setAttribute("aria-label", "התמונה סומנה כקשה");

      return;
    }

    elements.statusText.textContent = "לא סומן";

    elements.levelBadge.classList.add("unmarked");

    elements.levelBadge.title = "לא סומן";

    elements.levelBadge.setAttribute("aria-label", "התמונה עדיין לא סומנה");
  }

  function renderNavigation() {
    const isFirst = state.currentIndex === 0;

    const isLast = state.currentIndex === state.visibleEntries.length - 1;

    [
      elements.previousBtn,
      elements.previousMediaArea,
      elements.bottomPreviousBtn,
    ].forEach((button) => {
      button.disabled = isFirst;
    });

    [elements.nextBtn, elements.nextMediaArea, elements.bottomNextBtn].forEach(
      (button) => {
        button.disabled = isLast;
      },
    );
  }

  function updateFilterButtons() {
    elements.filterButtons.forEach((button) => {
      const isActive = button.dataset.filter === state.currentFilter;

      button.classList.toggle("active", isActive);

      button.setAttribute("aria-pressed", String(isActive));
    });
  }

  function updateRandomButton() {
    elements.randomBtn.classList.toggle("active", state.isRandomMode);

    elements.randomBtn.setAttribute("aria-pressed", String(state.isRandomMode));

    elements.randomBtn.textContent = state.isRandomMode
      ? "לפי הסדר"
      : "רנדומלי";
  }

  /* =========================
     ניווט
  ========================= */

  function nextEntry() {
    if (state.currentIndex >= state.visibleEntries.length - 1) {
      return;
    }

    state.currentIndex += 1;

    render();
  }

  function previousEntry() {
    if (state.currentIndex <= 0) {
      return;
    }

    state.currentIndex -= 1;

    render();
  }

  function jumpFromProgress(event) {
    if (state.visibleEntries.length === 0) {
      return;
    }

    const rect = elements.progressTrack.getBoundingClientRect();

    const clickX = event.clientX - rect.left;

    const ratio = Math.min(1, Math.max(0, clickX / rect.width));

    state.currentIndex = Math.min(
      state.visibleEntries.length - 1,

      Math.floor(ratio * state.visibleEntries.length),
    );

    render();
  }

  function markCurrentEntry(rating) {
    const entry = getCurrentEntry();

    if (!entry) return;

    setRating(entry, rating);

    /*
      אם נמצאים בתוך סינון קלות, קשות או לא סומנו,
      שינוי הדירוג יכול להוציא את התמונה מהרשימה.
    */

    if (state.currentFilter !== FILTERS.ALL) {
      buildVisibleEntries({
        preserveEntryId: entry.id,
      });

      return;
    }

    renderRating(entry);
  }

  elements.topicSelect.addEventListener("change", (event) => {
    selectTopic(event.target.value);
  });

  elements.filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      setFilter(button.dataset.filter);
    });
  });

  elements.randomBtn.addEventListener("click", toggleRandomMode);

  elements.resetBtn.addEventListener("click", resetCurrentTopicRatings);

  elements.showAllBtn.addEventListener("click", () => {
    setFilter(FILTERS.ALL);
  });

  elements.easyBtn.addEventListener("click", () => {
    markCurrentEntry(RATINGS.EASY);
  });

  elements.hardBtn.addEventListener("click", () => {
    markCurrentEntry(RATINGS.HARD);
  });

  elements.previousBtn.addEventListener("click", previousEntry);

  elements.previousMediaArea.addEventListener("click", previousEntry);

  elements.bottomPreviousBtn.addEventListener("click", previousEntry);

  elements.nextBtn.addEventListener("click", nextEntry);

  elements.nextMediaArea.addEventListener("click", nextEntry);

  elements.bottomNextBtn.addEventListener("click", nextEntry);

  elements.progressTrack.addEventListener("click", jumpFromProgress);

  elements.itemImage.addEventListener("error", () => {
    elements.itemImage.hidden = true;

    elements.mediaFallback.hidden = false;
  });

  elements.itemVideo.addEventListener("error", () => {
    elements.itemVideo.hidden = true;

    elements.mediaFallback.hidden = false;
  });

  window.addEventListener("keydown", (event) => {
    const target = event.target;

    const isTyping =
      target instanceof HTMLInputElement ||
      target instanceof HTMLTextAreaElement ||
      target instanceof HTMLSelectElement ||
      target?.isContentEditable;

    if (isTyping) {
      return;
    }

    const key = event.key.toLowerCase();

    if (event.key === "ArrowLeft") {
      event.preventDefault();

      nextEntry();

      return;
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();

      previousEntry();

      return;
    }

    if (key === "e") {
      event.preventDefault();

      markCurrentEntry(RATINGS.EASY);

      return;
    }

    if (key === "h") {
      event.preventDefault();

      markCurrentEntry(RATINGS.HARD);
    }
  });

  /* =========================
     אתחול
  ========================= */

  if (initializeSubject()) {
    updateFilterButtons();

    updateRandomButton();
  }
})();
