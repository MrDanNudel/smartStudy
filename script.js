// ניווט/פעולה בלחיצה על אריח.
// כרגע מציג הודעה — אפשר להחליף בנתיב אמיתי לכל נושא.
document.querySelectorAll(".tile").forEach((btn) => {
  btn.addEventListener("click", () => {
    const key = btn.dataset.key;
    // דוגמה: window.location.href = `subjects/${key}.html`;
    alert(`נבחר נושא: ${btn.textContent.trim()}`);
  });
});
