// ברגע שהמסמך נטען
window.addEventListener("DOMContentLoaded", () => {
  // מנקה את כל המחלקות מה-body
  document.body.classList.remove("fade-in", "fade-out");

  // מוסיף את אפקט הכניסה אחרי שברור שאין fade-out
  requestAnimationFrame(() => {
    document.body.classList.add("fade-in");
  });
});

// בעת בחירת נושא
document.querySelectorAll(".tile").forEach((btn) => {
  btn.addEventListener("click", () => {
    const subjectKey = btn.dataset.key || "";
    const subjectLabel = btn.textContent.trim();

    localStorage.setItem("selectedSubjectKey", subjectKey);
    localStorage.setItem("selectedSubjectLabel", subjectLabel);

    document.body.classList.remove("fade-in");
    document.body.classList.add("fade-out");

    setTimeout(() => {
      window.location.href = "select-method.html";
    }, 400);
  });
});
