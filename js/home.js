document.querySelectorAll(".tile").forEach((btn) => {
  btn.addEventListener("click", () => {
    localStorage.setItem("selectedSubjectKey", btn.dataset.key);
    localStorage.setItem("selectedSubjectLabel", btn.textContent.trim());
    window.location.href = "select-method.html";
  });
});
