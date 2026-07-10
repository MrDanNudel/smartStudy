window.addEventListener("DOMContentLoaded", () => {
  // איפוס מחלקות אנימציה
  document.body.classList.remove("fade-in", "fade-out");

  // אנימציית כניסה
  requestAnimationFrame(() => {
    document.body.classList.add("fade-in");
  });

  // קריאת הנושא מהכתובת
  const params = new URLSearchParams(window.location.search);
  const subjectFromUrl = params.get("subject");

  // אם הנושא הגיע מהכתובת, שומרים אותו
  if (subjectFromUrl) {
    localStorage.setItem("selectedSubjectKey", subjectFromUrl);
  }

  // קבלת מפתח הנושא
  const subjectKey =
    subjectFromUrl || localStorage.getItem("selectedSubjectKey") || "";

  // קבלת שם הנושא
  const subjectLabel =
    localStorage.getItem("selectedSubjectLabel") || "נושא לא מוגדר";

  // הצגת שם הנושא שנבחר
  const chosenSubject = document.getElementById("chosenSubject");

  if (chosenSubject) {
    chosenSubject.textContent = `נושא נבחר: ${subjectLabel}`;

    chosenSubject.style.opacity = "0";

    setTimeout(() => {
      chosenSubject.style.transition = "opacity 0.8s ease";
      chosenSubject.style.opacity = "1";
    }, 150);
  }

  // איתור הכפתורים
  const quizBtn = document.getElementById("quizBtn");
  const showBtn = document.getElementById("showBtn");
  const backBtn = document.querySelector(".back-btn");

  // שאלות אמריקאיות
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

  // שאלות ותשובות
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

  // חזרה לדף הראשי
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

  setTimeout(() => {
    window.location.href = url;
  }, 400);
}
