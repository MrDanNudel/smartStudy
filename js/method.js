// =====================================================
// SMART STUDY — METHOD PAGE LOGIC
// =====================================================

// אפקט כניסה חלק לדף
window.addEventListener("DOMContentLoaded", () => {
  document.body.classList.add("fade-in");

  // הצגת הנושא שנבחר
  const label = localStorage.getItem("selectedSubjectLabel");
  const chosenEl = document.getElementById("chosenSubject");
  if (chosenEl) {
    if (label) {
      chosenEl.textContent = `נושא שנבחר: ${label}`;
      // אפקט הופעה עדין לשורת הנושא
      chosenEl.style.opacity = 0;
      setTimeout(() => {
        chosenEl.style.transition = "opacity 0.8s ease";
        chosenEl.style.opacity = 1;
      }, 200);
    } else {
      chosenEl.textContent = "";
    }
  }
});

// חזרה לעמוד הבית (מאפסת את הבחירה)
document.querySelector(".back-btn")?.addEventListener("click", () => {
  // איפוס הבחירה מה־localStorage
  localStorage.removeItem("selectedSubjectKey");
  localStorage.removeItem("selectedSubjectLabel");

  // אפקט מעבר חלק לאחור
  document.body.classList.add("fade-out");
  setTimeout(() => {
    window.location.href = "index.html";
  }, 400);
});

// בחירת שיטת תרגול
document.querySelectorAll(".method-card").forEach((card) => {
  card.addEventListener("click", () => {
    const methodKey = card.dataset.method;
    const methodLabel = card.innerText.trim();

    // שמירת השיטה הנבחרת
    localStorage.setItem("selectedMethodKey", methodKey);
    localStorage.setItem("selectedMethodLabel", methodLabel);

    // שליפת הנושא הנבחר כדי להעביר אותו הלאה
    const subjectLabel =
      localStorage.getItem("selectedSubjectLabel") || "כימיה";
    const subjectKey = localStorage.getItem("selectedSubjectKey") || "";

    // אפקט מעבר חלק קדימה
    document.body.classList.add("fade-out");

    setTimeout(() => {
      // מעבר לעמוד ההגדרות אם זו שיטת המבחן האמריקאי
      if (methodKey === "exam") {
        window.location.href = `exam-settings.html?subject=${encodeURIComponent(
          subjectLabel
        )}&key=${subjectKey}`;
      } else if (methodKey === "quiz") {
        window.location.href = "quiz-mode.html";
      } else {
        window.location.href = "answers-mode.html";
      }
    }, 400);
  });
});
