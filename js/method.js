// הצגת הנושא שנבחר
const label = localStorage.getItem("selectedSubjectLabel");
const chosenEl = document.getElementById("chosenSubject");
if (chosenEl) chosenEl.textContent = label ? `נושא שנבחר: ${label}` : "";

// חזרה
document.querySelector(".back-btn")?.addEventListener("click", () => {
  window.location.href = "index.html";
});

// בחירת שיטה
document.querySelectorAll(".method-card").forEach((card) => {
  card.addEventListener("click", () => {
    const methodKey = card.dataset.method;
    const methodLabel = card.innerText.trim();
    localStorage.setItem("selectedMethodKey", methodKey);
    localStorage.setItem("selectedMethodLabel", methodLabel);

    window.location.href =
      methodKey === "quiz" ? "quiz-mode.html" : "answers-mode.html";
  });
});
