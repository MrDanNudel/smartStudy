// ברגע שהמסמך נטען
window.addEventListener("DOMContentLoaded", () => {
  // איפוס מחלקות האנימציה
  document.body.classList.remove("fade-in", "fade-out");

  // הפעלת אנימציית כניסה
  requestAnimationFrame(() => {
    document.body.classList.add("fade-in");
  });

  // איתור כל כרטיסי הנושאים
  const subjectCards = document.querySelectorAll(".subject-card[data-key]");

  // הוספת אירוע לחיצה לכל כרטיס
  subjectCards.forEach((btn) => {
    btn.addEventListener("click", () => {
      const subjectKey = btn.dataset.key || "";

      const titleElement = btn.querySelector(".subject-card__title");

      const subjectLabel = titleElement
        ? titleElement.textContent.trim()
        : btn.textContent.trim();

      // בדיקה שהכפתור מכיל data-key
      if (!subjectKey) {
        console.error("לא נמצא data-key בכרטיס הנושא");
        return;
      }

      // שמירת הנושא שנבחר
      localStorage.setItem("selectedSubjectKey", subjectKey);

      localStorage.setItem("selectedSubjectLabel", subjectLabel);

      // אנימציית יציאה
      document.body.classList.remove("fade-in");
      document.body.classList.add("fade-out");

      // מעבר לעמוד בחירת שיטת התרגול
      setTimeout(() => {
        window.location.href = `select-method.html?subject=${encodeURIComponent(subjectKey)}`;
      }, 400);
    });
  });
});
