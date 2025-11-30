// ברגע שהמסמך נטען
window.addEventListener("DOMContentLoaded", () => {
  document.body.classList.remove("fade-in", "fade-out");

  requestAnimationFrame(() => {
    document.body.classList.add("fade-in");
  });
});

// בעת בחירת נושא
document.querySelectorAll(".tile").forEach((btn) => {
  btn.addEventListener("click", () => {
    const subjectKey = btn.dataset.key || "";
    const subjectLabel = btn.textContent.trim();

    // שמירה לתוך localStorage
    localStorage.setItem("selectedSubjectKey", subjectKey);
    localStorage.setItem("selectedSubjectLabel", subjectLabel);

    // אנימציה
    document.body.classList.remove("fade-in");
    document.body.classList.add("fade-out");

    // מעבר לעמוד הבא
    setTimeout(() => {
      window.location.href = `select-method.html?subject=${subjectKey}`;
    }, 400);
  });
});
