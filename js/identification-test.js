window.addEventListener("DOMContentLoaded", () => {
  const QUESTION_TIME_SECONDS = 30;

  const params = new URLSearchParams(window.location.search);
  const storedSettings = readJson("identificationSettings") || {};

  const settings = {
    subject: params.get("subject") || storedSettings.subject || "anatomy",
    topics: parseTopics(params.get("topics"), storedSettings.topics),
    numSlides: getPositiveInteger(
      params.get("slides"),
      storedSettings.numSlides,
    ),
    shuffle: storedSettings.shuffle !== false,
  };

  const examScreen = document.getElementById("examScreen");
  const resultsScreen = document.getElementById("resultsScreen");
  const emptyScreen = document.getElementById("emptyScreen");
  const questionCounter = document.getElementById("questionCounter");
  const topicLabel = document.getElementById("topicLabel");
  const questionTitle = document.getElementById("questionTitle");
  const slideImage = document.getElementById("slideImage");
  const imageError = document.getElementById("imageError");
  const answerForm = document.getElementById("answerForm");
  const answerInput = document.getElementById("answerInput");
  const nextBtn = document.getElementById("nextBtn");
  const timerText = document.getElementById("timerText");
  const timerFill = document.getElementById("timerFill");
  const scoreTitle = document.getElementById("scoreTitle");
  const scorePercent = document.getElementById("scorePercent");
  const scoreMessage = document.getElementById("scoreMessage");
  const reviewBtn = document.getElementById("reviewBtn");
  const retryBtn = document.getElementById("retryBtn");
  const reviewSection = document.getElementById("reviewSection");
  const reviewList = document.getElementById("reviewList");
  const backBtn = document.getElementById("backBtn");
  const homeBtn = document.getElementById("homeBtn");
  const emptyBackBtn = document.getElementById("emptyBackBtn");

  let slides = buildExamSlides();
  let currentIndex = 0;
  let answers = [];
  let timerId = null;
  let questionStartedAt = 0;
  let examFinished = false;
  let isAdvancing = false;

  if (slides.length === 0) {
    showEmptyState();
    return;
  }

  renderQuestion();

  answerForm.addEventListener("submit", (event) => {
    event.preventDefault();
    saveAnswerAndContinue(false);
  });

  reviewBtn.addEventListener("click", () => {
    reviewSection.hidden = false;
    renderReview();
    reviewSection.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  retryBtn.addEventListener("click", () => {
    window.location.reload();
  });

  backBtn.addEventListener("click", () => {
    if (!canLeaveExam()) return;
    examFinished = true;
    window.location.href = "identification-settings.html?subject=anatomy";
  });

  emptyBackBtn.addEventListener("click", () => {
    window.location.href = "identification-settings.html?subject=anatomy";
  });

  homeBtn.addEventListener("click", () => {
    if (!canLeaveExam()) return;
    examFinished = true;
    window.location.href = "index.html";
  });

  window.addEventListener("beforeunload", (event) => {
    if (!examFinished && answers.length < slides.length) {
      event.preventDefault();
      event.returnValue = "";
    }
  });

  function buildExamSlides() {
    const bank = getIdentificationBank(settings.subject);
    const selectedTopics = new Set(settings.topics);

    let filtered = bank.filter((slide) => {
      return (
        selectedTopics.size === 0 || selectedTopics.has(getSlideTopic(slide))
      );
    });

    if (settings.shuffle) {
      filtered = shuffleArray(filtered);
    }

    const requestedCount = Math.min(settings.numSlides, filtered.length);
    return filtered.slice(0, requestedCount);
  }

  function renderQuestion() {
    isAdvancing = false;
    const slide = slides[currentIndex];
    const isLastQuestion = currentIndex === slides.length - 1;

    questionCounter.textContent = `שאלה ${currentIndex + 1} מתוך ${slides.length}`;
    topicLabel.textContent = getSlideTopic(slide);
    questionTitle.textContent =
      slide.prompt || slide.question || "מה מופיע בתמונה?";
    nextBtn.textContent = isLastQuestion ? "סיום המבחן" : "לשאלה הבאה";

    imageError.hidden = true;
    slideImage.hidden = false;
    slideImage.alt = slide.imageAlt || slide.alt || "תמונה לזיהוי באנטומיה";
    slideImage.src = slide.image || slide.imageSrc || "";

    slideImage.onerror = () => {
      slideImage.hidden = true;
      imageError.hidden = false;
    };

    answerInput.value = "";
    answerInput.disabled = false;
    nextBtn.disabled = false;
    answerInput.focus();

    startTimer();
  }

  function startTimer() {
    stopTimer();
    questionStartedAt = performance.now();
    updateTimer(QUESTION_TIME_SECONDS);

    timerId = window.setInterval(() => {
      const elapsedSeconds = (performance.now() - questionStartedAt) / 1000;
      const remaining = Math.max(QUESTION_TIME_SECONDS - elapsedSeconds, 0);

      updateTimer(remaining);

      if (remaining <= 0) {
        saveAnswerAndContinue(true);
      }
    }, 100);
  }

  function updateTimer(remainingSeconds) {
    const roundedSeconds = Math.ceil(remainingSeconds);
    const percent = (remainingSeconds / QUESTION_TIME_SECONDS) * 100;

    timerText.textContent = String(roundedSeconds);
    timerFill.style.width = `${Math.max(percent, 0)}%`;
    timerFill.classList.toggle(
      "timer__fill--warning",
      percent <= 40 && percent > 20,
    );
    timerFill.classList.toggle("timer__fill--danger", percent <= 20);
  }

  function stopTimer() {
    if (timerId !== null) {
      window.clearInterval(timerId);
      timerId = null;
    }
  }

  function saveAnswerAndContinue(timedOut) {
    if (isAdvancing || examFinished) return;

    isAdvancing = true;
    stopTimer();
    answerInput.disabled = true;
    nextBtn.disabled = true;

    const slide = slides[currentIndex];
    const userAnswer = answerInput.value.trim();
    const acceptedAnswers = getAcceptedAnswers(slide);
    const isCorrect = acceptedAnswers.some(
      (acceptedAnswer) =>
        normalizeAnswer(acceptedAnswer) === normalizeAnswer(userAnswer),
    );

    answers.push({
      slide,
      userAnswer,
      isCorrect,
      timedOut,
      elapsedSeconds: Math.min(
        QUESTION_TIME_SECONDS,
        Math.round((performance.now() - questionStartedAt) / 100) / 10,
      ),
    });

    if (currentIndex < slides.length - 1) {
      currentIndex += 1;
      renderQuestion();
      return;
    }

    finishExam();
  }

  function finishExam() {
    stopTimer();
    examFinished = true;
    examScreen.hidden = true;
    resultsScreen.hidden = false;

    const correctCount = answers.filter((answer) => answer.isCorrect).length;
    const percent = Math.round((correctCount / answers.length) * 100);

    scoreTitle.textContent = `ענית נכון על ${correctCount} מתוך ${answers.length}`;
    scorePercent.textContent = `${percent}%`;
    scoreMessage.textContent = getScoreMessage(percent);

    localStorage.setItem(
      "lastIdentificationResult",
      JSON.stringify({
        finishedAt: new Date().toISOString(),
        subject: settings.subject,
        topics: settings.topics,
        total: answers.length,
        correct: correctCount,
        percent,
      }),
    );

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function renderReview() {
    reviewList.innerHTML = "";

    answers.forEach((answer, index) => {
      const card = document.createElement("article");
      card.className = `review-card${answer.isCorrect ? " review-card--correct" : ""}`;

      const image = document.createElement("img");
      image.src = answer.slide.image || answer.slide.imageSrc || "";
      image.alt = answer.slide.imageAlt || answer.slide.alt || "שקופית מהמבחן";

      const content = document.createElement("div");
      content.className = "review-card__content";

      const title = document.createElement("h3");
      title.textContent = `שאלה ${index + 1}: ${
        answer.slide.prompt || answer.slide.question || "מה מופיע בתמונה?"
      }`;

      const status = document.createElement("p");
      status.className = "review-card__status";
      status.textContent = answer.isCorrect ? "✓ תשובה נכונה" : "✕ תשובה שגויה";

      const userLine = createAnswerLine(
        "התשובה שלך:",
        answer.userAnswer || (answer.timedOut ? "לא נענתה בזמן" : "לא נענתה"),
      );
      const correctLine = createAnswerLine(
        "התשובה הנכונה:",
        getMainAnswer(answer.slide),
      );

      content.append(title, status, userLine, correctLine);
      card.append(image, content);
      reviewList.appendChild(card);
    });
  }

  function createAnswerLine(label, value) {
    const line = document.createElement("p");
    const strong = document.createElement("strong");
    strong.textContent = `${label} `;
    line.append(strong, document.createTextNode(value));
    return line;
  }

  function showEmptyState() {
    examFinished = true;
    examScreen.hidden = true;
    resultsScreen.hidden = true;
    emptyScreen.hidden = false;
  }

  function canLeaveExam() {
    return (
      examFinished ||
      window.confirm("המבחן עדיין לא הסתיים. לצאת ממנו ולאבד את התשובות?")
    );
  }

  function getIdentificationBank(subject) {
    if (
      window.identificationBanks &&
      Array.isArray(window.identificationBanks[subject])
    ) {
      return window.identificationBanks[subject];
    }

    return Array.isArray(window.identificationBank)
      ? window.identificationBank
      : [];
  }

  function getSlideTopic(slide) {
    return String(
      slide.topic || slide.subtopic || slide.category || "ללא נושא",
    ).trim();
  }

  function getAcceptedAnswers(slide) {
    const answersList = Array.isArray(slide.acceptedAnswers)
      ? slide.acceptedAnswers
      : Array.isArray(slide.answers)
        ? slide.answers
        : [];

    return [getMainAnswer(slide), ...answersList]
      .map((answer) => String(answer || "").trim())
      .filter(Boolean);
  }

  function getMainAnswer(slide) {
    return String(
      slide.correctAnswer || slide.answer || "לא הוגדרה תשובה",
    ).trim();
  }

  function normalizeAnswer(value) {
    return String(value || "")
      .normalize("NFKD")
      .replace(/[\u0591-\u05c7]/g, "")
      .toLocaleLowerCase("he")
      .replace(/[\u05f3\u05f4'\".,:;!?()\[\]{}\-–—_/\\]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function shuffleArray(items) {
    const copy = [...items];

    for (let index = copy.length - 1; index > 0; index -= 1) {
      const randomIndex = Math.floor(Math.random() * (index + 1));
      [copy[index], copy[randomIndex]] = [copy[randomIndex], copy[index]];
    }

    return copy;
  }

  function parseTopics(queryValue, storedTopics) {
    if (queryValue) {
      return queryValue
        .split(",")
        .map((topic) => topic.trim())
        .filter(Boolean);
    }

    return Array.isArray(storedTopics) ? storedTopics : [];
  }

  function getPositiveInteger(queryValue, storedValue) {
    const parsed = Number(queryValue || storedValue || 1);
    return Number.isInteger(parsed) && parsed > 0 ? parsed : 1;
  }

  function readJson(key) {
    try {
      return JSON.parse(localStorage.getItem(key));
    } catch {
      return null;
    }
  }

  function getScoreMessage(percent) {
    if (percent >= 90) return "שליטה מצוינת בחומר 👏";
    if (percent >= 75) return "תוצאה טובה מאוד — עוד חזרה קטנה ואתה שם.";
    if (percent >= 60) return "בסיס טוב. כדאי לעבור על התשובות שפספסת.";
    return "כדאי לעבור על התשובות ולנסות שוב לאחר חזרה על החומר.";
  }
});
