/*
  מאגר שקופיות למבחן הזיהוי.

  לכל שקופית יש להגדיר:
  - id: מזהה ייחודי.
  - topic: שם הנושא שיופיע בדף ההגדרות.
  - image: הנתיב לתמונה.
  - imageAlt: תיאור נגיש של התמונה, בלי לחשוף את התשובה.
  - prompt: השאלה שתוצג מעל התמונה.
  - correctAnswer: התשובה הראשית שתוצג בסקירה.
  - acceptedAnswers: ניסוחים נוספים שגם ייחשבו נכונים.

  דוגמה לשקופית:

  {
    id: "bones-001",
    topic: "עצמות",
    image: "imgs/identification/humerus-01.jpg",
    imageAlt: "איור אנטומי עם סימון של עצם",
    prompt: "איזו עצם מסומנת בתמונה?",
    correctAnswer: "עצם הזרוע",
    acceptedAnswers: ["הומרוס", "humerus"],
  }
*/

window.identificationBanks = {
  anatomy: [],
};
