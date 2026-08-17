window.addEventListener("DOMContentLoaded", () => {
  // ================================
  // מידע על כל הנושאים
  // ================================

  const SUBJECT_INFO = {
    sportHistory: {
      title: "היסטוריה של הספורט",
      image: "./imgs/sport-history.jpg",
      description:
        "לימוד התפתחות הספורט לאורך ההיסטוריה, מהעולם העתיק ועד הספורט המודרני. הנושא כולל את המשחקים האולימפיים, תרבויות ספורט שונות, אישים מרכזיים ואירועים שהשפיעו על עולם הספורט.",
    },

    generalKnowledge: {
      title: "ידע כללי",
      image: "./imgs/general-knowledge.png",
      description:
        "הרחבת הידע במגוון תחומים מרכזיים. הנושא כולל גאוגרפיה, היסטוריה, מדע, טבע, גוף האדם, חלל, טכנולוגיה, תרבות, אמנות, ספרות, ספורט ואישים חשובים.",
    },

    developmentalPsychology: {
      title: "פסיכולוגיה התפתחותית",
      image: "./imgs/developmental-psychology.jpg",
      description:
        "לימוד ההתפתחות האנושית לאורך מעגל החיים, מהילדות ועד הבגרות. הנושא עוסק בהתפתחות קוגניטיבית, רגשית, חברתית ומוסרית ובתיאוריות מרכזיות בתחום.",
    },

    educationalThought: {
      title: "מחשבת החינוך",
      image: "./imgs/educational-thought.jpg",
      description:
        "היכרות עם רעיונות ותפיסות מרכזיות בתחום החינוך. הנושא עוסק בפילוסופים, בגישות חינוכיות שונות ובשאלות הנוגעות למטרות החינוך, תפקיד המורה ותפקיד התלמיד.",
    },

    literacy: {
      title: "אוריינות שפתית",
      image: "./imgs/literacy.png",
      description:
        "פיתוח הבנה ושימוש נכון בשפה הכתובה והמדוברת. הנושא כולל הבנת הנקרא, כתיבה, אוצר מילים, דיוק לשוני, ניבים וכללים מרכזיים בעברית.",
    },

    anatomy: {
      title: "אנטומיה",
      image: "./imgs/anatomy.png",
      description:
        "היכרות עם מבנה גוף האדם ועם מערכותיו. הנושא כולל עצמות, שרירים, מפרקים, מערכות גוף ותפקידם בתנועה, ביציבה ובפעילות גופנית.",
    },

    chemistry: {
      title: "כימיה",
      image: "./imgs/chemistry.png",
      description:
        "לימוד החומרים המרכיבים את העולם והתהליכים המתרחשים ביניהם. הנושא כולל מבנה האטום, קשרים כימיים, תגובות, תרכובות ועקרונות בסיסיים בכימיה.",
    },

    psychology: {
      title: "פסיכולוגיה",
      image: "./imgs/psychology.png",
      description:
        "לימוד תהליכים נפשיים והתנהגותיים. הנושא עוסק בחשיבה, רגש, מוטיבציה, זיכרון, למידה, אישיות והשפעת הסביבה על ההתנהגות האנושית.",
    },

    basketball: {
      title: "כדורסל",
      image: "./imgs/basketball.png",
      description:
        "לימוד יסודות משחק הכדורסל, כולל כדרור, מסירה, קליעה, תנועה ללא כדור, הגנה, חוקים ועקרונות בסיסיים של משחק קבוצתי.",
    },

    athletics: {
      title: "אתלטיקה",
      image: "./imgs/athletics.png",
      description:
        "לימוד מקצועות האתלטיקה השונים, ובהם ריצות, קפיצות וזריקות. הנושא כולל טכניקה, חוקים, עקרונות אימון וביצוע נכון של מיומנויות.",
    },

    football: {
      title: "כדורגל",
      image: "./imgs/football.png",
      description:
        "לימוד יסודות משחק הכדורגל, כולל מסירה, בעיטה, כדרור, עצירת כדור, תנועה במגרש, הגנה, התקפה וחוקי המשחק.",
    },

    statistics1: {
      title: "סטטיסטיקה א׳",
      image: "./imgs/statistics-1.png",
      description:
        "לימוד שיטות לאיסוף, ארגון וניתוח נתונים. הנושא כולל מדדי מרכז ופיזור, התפלגויות, מתאם, גרפים והבנת תוצאות סטטיסטיות.",
    },

    statsDynamics: {
      title: "סטטיקה ודינמיקה",
      image: "./imgs/statics-dynamics.png",
      description:
        "לימוד כוחות ותנועה בגופים. הנושא כולל מהירות, תאוצה, נפילה חופשית, פירוק כוחות, שיווי משקל, חיכוך, מומנטים ועקרונות מכניים.",
    },

    biochemistry: {
      title: "ביוכימיה",
      image: "./imgs/biochemistry.png",
      description:
        "לימוד התהליכים הכימיים המתרחשים בגוף ובתאים. הנושא כולל חלבונים, פחמימות, שומנים, אנזימים, הפקת אנרגיה, גליקוליזה ומעגל קרבס.",
    },

    volleyball: {
      title: "כדורעף",
      image: "./imgs/volleyball.png",
      description:
        "לימוד יסודות משחק הכדורעף, כולל מסירה תחתית ועליונה, מכת פתיחה, הנחתה, חסימה, מיקום במגרש ועבודה קבוצתית.",
    },

    handball: {
      title: "כדוריד",
      image: "./imgs/handball.png",
      description:
        "לימוד יסודות משחק הכדוריד, כולל מסירה, כדרור, זריקה לשער, תנועה, הגנה, התקפה, עבודת צוות וחוקי המשחק.",
    },
    financialEducation: {
      title: "חינוך פיננסי",
      image: "./imgs/financial-education.png",
      description:
        "לימוד עקרונות להתנהלות כלכלית נכונה. הנושא כולל ניהול תקציב, הכנסות והוצאות, חיסכון, הלוואות, ריביות, אשראי, השקעות וקבלת החלטות פיננסיות אחראיות.",
    },

    nutrition: {
      title: "תזונה",
      image: "./imgs/nutrition.png",
      description:
        "לימוד עקרונות התזונה והקשר בין מזון, בריאות וביצועים גופניים. הנושא כולל אבות המזון, מאזן אנרגיה, מערכת העיכול, ויטמינים, מינרלים, שתייה ותזונת ספורט.",
    },
  };

  // ================================
  // אנימציית כניסה
  // ================================

  document.body.classList.remove("fade-in", "fade-out");

  requestAnimationFrame(() => {
    document.body.classList.add("fade-in");
  });

  // ================================
  // קריאת הנושא מהכתובת
  // ================================

  const params = new URLSearchParams(window.location.search);
  const subjectFromUrl = params.get("subject");

  if (subjectFromUrl) {
    localStorage.setItem("selectedSubjectKey", subjectFromUrl);
  }

  const subjectKey =
    subjectFromUrl || localStorage.getItem("selectedSubjectKey") || "";

  const subjectInfo = SUBJECT_INFO[subjectKey] || {
    title: localStorage.getItem("selectedSubjectLabel") || "נושא לא מוגדר",
    image: "./imgs/literacy.png",
    description:
      "לא נמצא תיאור מפורט לנושא שנבחר. ניתן להמשיך לבחירת שיטת התרגול.",
  };

  localStorage.setItem("selectedSubjectLabel", subjectInfo.title);

  // ================================
  // הצגת פרטי הנושא
  // ================================

  const subjectImage = document.getElementById("subjectImage");
  const subjectTitle = document.getElementById("subjectTitle");
  const subjectDescription = document.getElementById("subjectDescription");
  const chosenSubject = document.getElementById("chosenSubject");

  if (subjectImage) {
    subjectImage.src = subjectInfo.image;
    subjectImage.alt = `תמונה בנושא ${subjectInfo.title}`;

    subjectImage.addEventListener("error", () => {
      subjectImage.src = "./imgs/literacy.png";
      subjectImage.alt = "תמונת נושא חלופית";
    });
  }

  if (subjectTitle) {
    subjectTitle.textContent = subjectInfo.title;
  }

  if (subjectDescription) {
    subjectDescription.textContent = subjectInfo.description;
  }

  if (chosenSubject) {
    chosenSubject.textContent = `נושא נבחר: ${subjectInfo.title}`;
  }

  // ================================
  // איתור הכפתורים
  // ================================

  const quizBtn = document.getElementById("quizBtn");
  const showBtn = document.getElementById("showBtn");
  const visualBtn = document.getElementById("visualBtn");
  const backBtn = document.querySelector(".back-btn");

  // ================================
  // מבחן אמריקאי
  // ================================

  quizBtn?.addEventListener("click", () => {
    if (!subjectKey) {
      alert("לא נבחר נושא לתרגול.");
      return;
    }

    localStorage.setItem("selectedMethodKey", "quiz");
    localStorage.setItem("selectedMethodLabel", "מבחן שאלות אמריקאיות");

    navigateWithFade(
      `exam-settings.html?subject=${encodeURIComponent(subjectKey)}`,
    );
  });

  // ================================
  // שאלות ותשובות
  // ================================

  showBtn?.addEventListener("click", () => {
    if (!subjectKey) {
      alert("לא נבחר נושא לתרגול.");
      return;
    }

    localStorage.setItem("selectedMethodKey", "show");
    localStorage.setItem("selectedMethodLabel", "הצגת שאלות ותשובות");

    navigateWithFade(
      `qa-settings.html?subject=${encodeURIComponent(subjectKey)}`,
    );
  });

  // ================================
  // למידה ויזואלית
  // ================================

  visualBtn?.addEventListener("click", () => {
    if (!subjectKey) {
      alert("לא נבחר נושא לתרגול.");
      return;
    }

    localStorage.setItem("selectedMethodKey", "visual");
    localStorage.setItem("selectedMethodLabel", "למידה ויזואלית");

    navigateWithFade(
      `visual-learning.html?subject=${encodeURIComponent(subjectKey)}`,
    );
  });

  // ================================
  // חזרה לדף הראשי
  // ================================

  backBtn?.addEventListener("click", () => {
    localStorage.removeItem("selectedMethodKey");
    localStorage.removeItem("selectedMethodLabel");

    navigateWithFade("index.html");
  });
});

/**
 * מעבר לדף אחר עם אנימציית יציאה.
 *
 * @param {string} url כתובת היעד
 */
function navigateWithFade(url) {
  document.body.classList.remove("fade-in");
  document.body.classList.add("fade-out");

  window.setTimeout(() => {
    window.location.href = url;
  }, 350);
}
