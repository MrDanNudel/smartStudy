// אנימציית כניסה
window.addEventListener("DOMContentLoaded", () => {
  document.body.classList.add("fade-in");

  // תמיד מעדכן את המקצוע מה-URL
  const params = new URLSearchParams(window.location.search);
  const subjectFromUrl = params.get("subject");

  if (subjectFromUrl) {
    // שמירת ה-Key
    localStorage.setItem("selectedSubjectKey", subjectFromUrl);

    // ניסיון למציאת ה-TILE כדי להוציא את השם
    const subjectTile = document.querySelector(
      `.tile[data-key="${subjectFromUrl}"]`
    );

    if (subjectTile) {
      // שמירת ה-Label
      localStorage.setItem(
        "selectedSubjectLabel",
        subjectTile.textContent.trim()
      );
    }
  }

  // הצגת הנושא שנבחר בחלק העליון
  const label = localStorage.getItem("selectedSubjectLabel");
  const chosen = document.getElementById("chosenSubject");

  if (chosen) {
    if (label) {
      chosen.textContent = `נושא שנבחר: ${label}`;
      chosen.style.opacity = 0;
      setTimeout(() => {
        chosen.style.transition = "opacity 0.8s ease";
        chosen.style.opacity = 1;
      }, 150);
    } else {
      chosen.textContent = "";
    }
  }
});

// חזרה אחורה — איפוס בחירה
document.querySelector(".back-btn")?.addEventListener("click", () => {
  localStorage.removeItem("selectedSubjectKey");
  localStorage.removeItem("selectedSubjectLabel");

  document.body.classList.add("fade-out");
  setTimeout(() => {
    window.location.href = "index.html";
  }, 300);
});

// בחירת שיטת תרגול
document.querySelectorAll(".method-card").forEach((card) => {
  card.addEventListener("click", () => {
    const methodKey = card.dataset.method;

    const subjectKey = localStorage.getItem("selectedSubjectKey") || "";
    const subjectLabel = localStorage.getItem("selectedSubjectLabel") || "";

    localStorage.setItem("selectedMethodKey", methodKey);
    localStorage.setItem("selectedMethodLabel", card.innerText.trim());

    document.body.classList.add("fade-out");

    setTimeout(() => {
      // מעבר לעמוד ההגדרות למבחן אמריקאי
      if (methodKey === "exam") {
        window.location.href = `exam-settings.html?subject=${subjectKey}`;
      }

      // מעבר למצב שאלות־תשובות
      else if (methodKey === "qa") {
        window.location.href = `qa-settings.html?subject=${subjectKey}`;
      }

      // מצב "בקרוב"
      else {
        window.location.href = "quiz-mode.html";
      }
    }, 300);
  });
});
