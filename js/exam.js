// ================================
// קריאת הגדרות מה־URL / localStorage
// ================================
const url = new URLSearchParams(location.search);
const settings = {
  timePerQuestion:
    parseInt(url.get("time")) ||
    JSON.parse(localStorage.getItem("examSettings") || "{}").timePerQuestion ||
    30,
  numQuestions:
    parseInt(url.get("questions")) ||
    JSON.parse(localStorage.getItem("examSettings") || "{}").numQuestions ||
    20,
  maxFails:
    parseInt(url.get("fails")) ||
    JSON.parse(localStorage.getItem("examSettings") || "{}").maxFails ||
    5,
};

const subjectLabel =
  url.get("subject") || localStorage.getItem("selectedSubjectLabel") || "כימיה";
const subjectKey =
  url.get("key") || localStorage.getItem("selectedSubjectKey") || "chemistry";

// ================================
// הפניות לאלמנטים
// ================================
const subjectTitle = document.getElementById("subjectTitle");
const qText = document.getElementById("questionText");
const qMeta = document.getElementById("qMeta");
const optionsWrap = document.getElementById("options");
const barFill = document.getElementById("barFill");
const timeLeft = document.getElementById("timeLeft");
const failsView = document.getElementById("failsView");
const progressView = document.getElementById("progressView");
const endOverlay = document.getElementById("endOverlay");
const endTitle = document.getElementById("endTitle");
const endSub = document.getElementById("endSub");

// ================================
// ניווט עליון
// ================================
document.getElementById("prevBtn").addEventListener("click", () => {
  history.length > 1 ? history.back() : (location.href = "select-method.html");
});

document.getElementById("homeBtn").addEventListener("click", () => {
  localStorage.removeItem("selectedSubjectKey");
  localStorage.removeItem("selectedSubjectLabel");
  location.href = "index.html";
});

// ================================
// כותרת נושא
// ================================
subjectTitle.textContent = subjectLabel;
requestAnimationFrame(() => subjectTitle.classList.add("visible"));

// ================================
// מאגר שאלות – כימיה
// ================================
const chemistryQuestions = [
  { q: "מהו הסימן הכימי של מים?", a: ["H2O", "HO2", "O2H", "H3O"], correct: 0 },
  { q: "כמה פרוטונים יש במימן רגיל?", a: ["1", "0", "2", "3"], correct: 0 },
  {
    q: "איזה קשר קיים במולקולת NaCl?",
    a: ["יוני", "קובלנטי", "מתכתי", "מימני"],
    correct: 0,
  },
  {
    q: "מה ה-pH של מים טהורים בטמפרטורת חדר?",
    a: ["7", "0", "14", "4"],
    correct: 0,
  },
  {
    q: "איזה חלקיק בעל מטען שלילי?",
    a: ["אלקטרון", "פרוטון", "נויטרון", "אלפה"],
    correct: 0,
  },
  {
    q: "איזוטופים של אותו יסוד נבדלים במספר ה־",
    a: ["נויטרונים", "פרוטונים", "אלקטרונים", "מטענים"],
    correct: 0,
  },
  {
    q: "איזו קבוצה נקראת ‘גזים אצילים’?",
    a: ["קבוצה 18", "קבוצה 1", "קבוצה 7", "קבוצה 2"],
    correct: 0,
  },
  { q: "מה הסמל הכימי של פחמן?", a: ["C", "Ca", "Cr", "Co"], correct: 0 },
  {
    q: "איזו חומצה נמצאת בקיבה?",
    a: ["HCl", "H2SO4", "HNO3", "CH3COOH"],
    correct: 0,
  },
  {
    q: "איזה תהליך משחרר אנרגיה?",
    a: ["אקסותרמי", "אנדותרמי", "איזותרמי", "איזוברי"],
    correct: 0,
  },
  { q: "מהו CH4?", a: ["מתאן", "אתאן", "בנזן", "אתילן"], correct: 0 },
  {
    q: "איזו יחידה מודדת כמות חומר?",
    a: ["מול", "גרם", "ליטר", "ג׳אול"],
    correct: 0,
  },
  { q: "איזו מולקולה פולרית?", a: ["H2O", "CO2", "CH4", "O2"], correct: 0 },
  {
    q: "מה שם התהליך מעבר מנוזל לגז?",
    a: ["אידוי", "עיבוי", "התכה", "קפיאה"],
    correct: 0,
  },
  {
    q: "איזה יסוד הוא מתכת אלקלית?",
    a: ["נתרן", "ברום", "כספית", "אלומיניום"],
    correct: 0,
  },
  {
    q: "איזה גז מהווה כ־78% מהאוויר?",
    a: ["חנקן", "חמצן", "ארגון", "פחמן דו־חמצני"],
    correct: 0,
  },
  {
    q: "מהו CaCO3?",
    a: ["סידן פחמתי", "סידן כלורי", "סידן חנקתי", "סידן תחמוצתי"],
    correct: 0,
  },
  {
    q: "איזה גז משתחרר בתגובה חומצה + מתכת?",
    a: ["מימן", "חמצן", "חנקן", "פחמן דו־חמצני"],
    correct: 0,
  },
  {
    q: "איזה יסוד מרכזי בחלבונים?",
    a: ["חנקן", "נתרן", "ברזל", "סידן"],
    correct: 0,
  },
  {
    q: "איזו מולקולה ארומטית?",
    a: ["בנזן", "פרופאן", "אתילן", "אצטון"],
    correct: 0,
  },
];
// ================================
// מאגר שאלות — אנטומיה
// ================================
const anatomyQuestions = [
  {
    q: "מהו האיבר הגדול ביותר בגוף האדם?",
    a: ["העור", "הלב", "הכבד", "המוח"],
    correct: 0,
  },
  {
    q: "מהו תפקיד מערכת השלד?",
    a: [
      "תמיכה והגנה על איברים פנימיים",
      "עיכול מזון",
      "ויסות חום הגוף",
      "נשימה",
    ],
    correct: 0,
  },
  { q: "כמה חוליות יש בעמוד השדרה?", a: ["33", "25", "20", "40"], correct: 0 },
  {
    q: "איזו עצם נחשבת לעצם הארוכה ביותר בגוף?",
    a: ["עצם הירך", "עצם השוק", "עצם האמה", "עצם הבריח"],
    correct: 0,
  },
  {
    q: "מהו תפקיד תאי הדם האדומים?",
    a: ["הובלת חמצן", "קרישת דם", "הגנה על הגוף", "שמירת חום"],
    correct: 0,
  },
  {
    q: "היכן ממוקם שריר הדלתואיד?",
    a: ["בכתף", "ברגל", "בגב", "בבטן"],
    correct: 0,
  },
  {
    q: "איזו מערכת אחראית על שליטה בגוף?",
    a: ["מערכת העצבים", "מערכת הנשימה", "מערכת הדם", "מערכת השתן"],
    correct: 0,
  },
  {
    q: "מה תפקיד מערכת הנשימה?",
    a: ["החלפת גזים", "פירוק מזון", "שאיבת דם", "וויסות טמפרטורה"],
    correct: 0,
  },
  {
    q: "איזו מערכת מפרישה פסולת נוזלית מהגוף?",
    a: ["מערכת השתן", "מערכת העיכול", "מערכת השרירים", "מערכת הדם"],
    correct: 0,
  },
  {
    q: "איזה סוג מפרק יש בברך?",
    a: ["צירי", "כדורי", "סיבובי", "מישורי"],
    correct: 0,
  },
  {
    q: "מהו התפקיד של המוח הקטן?",
    a: ["שיווי משקל ותיאום תנועות", "ראייה", "שמיעה", "דיבור"],
    correct: 0,
  },
  { q: "כמה חדרים יש בלב האדם?", a: ["4", "2", "3", "5"], correct: 0 },
  {
    q: "מהו התפקיד של הכבד?",
    a: ["סינון רעלים מהדם", "נשימה", "ייצור דם", "וויסות טמפרטורה"],
    correct: 0,
  },
  {
    q: "איזו עצם מגינה על המוח?",
    a: ["הגולגולת", "הצלעות", "האגן", "עמוד השדרה"],
    correct: 0,
  },
  {
    q: "מהו השריר הראשי בכיפוף המרפק?",
    a: ["בייספס", "טרייספס", "דלתואיד", "טרפז"],
    correct: 0,
  },
  {
    q: "מה תפקידה של מערכת העיכול?",
    a: [
      "פירוק מזון וספיגת חומרים",
      "נשימה",
      "שמירה על חום הגוף",
      "שליטה עצבית",
    ],
    correct: 0,
  },
  {
    q: "מהי היחידה הבסיסית של מערכת העצבים?",
    a: ["נוירון", "תא שריר", "תא דם", "תא עצם"],
    correct: 0,
  },
  {
    q: "מה תפקיד תאי הדם הלבנים?",
    a: ["הגנה מפני מחלות", "הובלת חמצן", "קרישת דם", "וויסות חומציות"],
    correct: 0,
  },
  {
    q: "מהו תפקיד מערכת השרירים?",
    a: ["תנועה וייצוב הגוף", "עיכול מזון", "סינון דם", "ייצור אנרגיה"],
    correct: 0,
  },
  {
    q: "מה תפקיד מערכת הלב וכלי הדם?",
    a: ["הובלת חמצן וחומרי מזון", "עיכול חלבונים", "שמירת חום", "סינון פסולת"],
    correct: 0,
  },
  {
    q: "היכן ממוקם שריר הגסטרוקנמיוס?",
    a: ["בשוק", "בזרוע", "בבטן", "בגב"],
    correct: 0,
  },
  {
    q: "איזו מערכת אחראית על ויסות טמפרטורת הגוף?",
    a: ["מערכת העור", "מערכת השרירים", "מערכת הדם", "מערכת העיכול"],
    correct: 0,
  },
  {
    q: "מהי היחידה הבסיסית של העצם?",
    a: ["תא עצם (אוסטאוציט)", "תא שריר", "תא דם", "תא שומן"],
    correct: 0,
  },
  {
    q: "מהו תפקיד מערכת הרבייה?",
    a: ["ייצור תאי מין", "עיכול מזון", "נשימה", "סינון רעלים"],
    correct: 0,
  },
  {
    q: "מהו תפקיד העור?",
    a: ["הגנה על הגוף", "ייצור הורמונים", "סינון דם", "וויסות סוכר"],
    correct: 0,
  },
  {
    q: "איזו מערכת אחראית לשמירה על יציבה?",
    a: ["השלד והשרירים", "מערכת הדם", "מערכת העצבים", "מערכת הנשימה"],
    correct: 0,
  },
  {
    q: "איזו עצם מחברת בין הכתף לעצם החזה?",
    a: ["עצם הבריח", "האגן", "השכמה", "האמה"],
    correct: 0,
  },
  {
    q: "מהו החלק במוח שאחראי על חשיבה וזיכרון?",
    a: ["קליפת המוח", "המוח הקטן", "גזע המוח", "הצרבלום"],
    correct: 0,
  },
  {
    q: "מהי ריאה?",
    a: ["איבר נשימתי", "איבר עיכול", "איבר עצבי", "איבר רבייה"],
    correct: 0,
  },
  {
    q: "איזו עצם מגינה על איברי החזה?",
    a: ["הצלעות", "האגן", "השכמה", "עמוד השדרה"],
    correct: 0,
  },
  {
    q: "מהו תפקידה של מערכת הלימפה?",
    a: [
      "הגנה חיסונית וסילוק נוזלים עודפים",
      "נשימה",
      "עיכול חלבונים",
      "וויסות טמפרטורה",
    ],
    correct: 0,
  },
  {
    q: "מהו תפקיד הכליות?",
    a: ["סינון פסולת נוזלית מהדם", "נשימה", "ייצור חלבונים", "וויסות קצב הלב"],
    correct: 0,
  },
  {
    q: "איזה סוג רקמה מהווה את השרירים?",
    a: ["רקמת שריר", "רקמת חיבור", "רקמת עצב", "רקמת אפיתל"],
    correct: 0,
  },
  {
    q: "מהי רקמת אפיתל?",
    a: [
      "רקמה שמכסה ומגנה על איברים",
      "רקמה מוליכה",
      "רקמה מפרקת",
      "רקמה מתכווצת",
    ],
    correct: 0,
  },
  {
    q: "איזו מערכת אחראית על יצירת תנועה?",
    a: ["השרירים והשלד", "מערכת העצבים", "מערכת הדם", "מערכת העיכול"],
    correct: 0,
  },
  {
    q: "מהו הורמון האחראי על ויסות רמת הסוכר?",
    a: ["אינסולין", "אדרנלין", "אסטרוגן", "קורטיזול"],
    correct: 0,
  },
  {
    q: "איזה איבר אחראי על ייצור אינסולין?",
    a: ["הלבלב", "הכבד", "הכליות", "הטחול"],
    correct: 0,
  },
];

// מאגר לפי נושא
// מאגר לפי נושא
const banks = {
  chemistry: chemistryQuestions,
  anatomy: anatomyQuestions,
};

// ================================
// לוגיקת מבחן
// ================================
let bank = (banks[subjectKey] || chemistryQuestions).slice();
shuffle(bank);
bank = bank.slice(0, settings.numQuestions);

let current = 0;
let fails = 0;
let timerId = null;
let timeLeftSec = settings.timePerQuestion;

updateHud();
loadQuestion();

// ================================
// טיימר
// ================================
function startTimer() {
  clearInterval(timerId);
  timeLeftSec = settings.timePerQuestion;
  drawTime();

  const total = settings.timePerQuestion;
  timerId = setInterval(() => {
    timeLeftSec -= 0.05;
    if (timeLeftSec <= 0) {
      clearInterval(timerId);
      handleAnswer(-1);
      return;
    }

    const ratio = Math.max(0, timeLeftSec / total);
    barFill.style.transform = `scaleX(${ratio.toFixed(3)})`;
    drawTime();
  }, 50);
}

function drawTime() {
  const sec = Math.max(0, Math.ceil(timeLeftSec));
  timeLeft.textContent = `..נשארו ${sec} שניות`;
}

// ================================
// הצגת שאלה
// ================================
function loadQuestion() {
  const item = bank[current];
  if (!item) {
    endExam("המבחן נגמר", "סיימת את כל השאלות! כל הכבוד 👏");
    return;
  }

  qText.textContent = item.q;
  qMeta.textContent = `שאלה ${current + 1} מתוך ${settings.numQuestions}`;

  const idxs = [0, 1, 2, 3];
  shuffle(idxs);

  optionsWrap.innerHTML = "";
  idxs.forEach((i) => {
    const btn = document.createElement("button");
    btn.className = "option";
    btn.textContent = item.a[i];
    btn.addEventListener("click", () => handleAnswer(i));
    optionsWrap.appendChild(btn);
  });

  startTimer();
}

// ================================
// טיפול בבחירת תשובה
// ================================
function handleAnswer(chosenIndex) {
  [...optionsWrap.children].forEach((b) => b.classList.add("disabled"));
  clearInterval(timerId);

  const item = bank[current];
  const buttons = [...optionsWrap.children];
  const correctText = item.a[item.correct];
  let chosenBtn = null,
    correctBtn = null;

  buttons.forEach((b) => {
    if (b.textContent === correctText) correctBtn = b;
  });

  if (chosenIndex === -1) {
    fails++;
  } else {
    chosenBtn = buttons.find((b) => b.textContent === item.a[chosenIndex]);
    if (chosenIndex === item.correct) {
      chosenBtn.classList.add("correct");
    } else {
      fails++;
      chosenBtn && chosenBtn.classList.add("wrong");
    }
  }

  if (chosenIndex !== item.correct)
    correctBtn && correctBtn.classList.add("correct");

  updateHud();

  if (fails > settings.maxFails) {
    setTimeout(
      () => endExam("חרגת ממספר הפסילות", "המבחן נגמר. נסה שוב מאוחר יותר ✋"),
      700
    );
    return;
  }

  setTimeout(() => {
    current++;
    updateHud();
    loadQuestion();
  }, 800);
}

// ================================
// עדכון HUD
// ================================
function updateHud() {
  failsView.textContent = `פסילות: ${fails} / ${settings.maxFails}`;
  const progress = Math.round((current / settings.numQuestions) * 100);
  progressView.textContent = `התקדמות: ${progress}%`;
}

// ================================
// סיום מבחן
// ================================
function endExam(title, sub) {
  clearInterval(timerId);
  endTitle.textContent = title;
  endSub.textContent = sub;
  endOverlay.classList.add("show");
}

document.getElementById("againBtn").addEventListener("click", () => {
  current = 0;
  fails = 0;
  bank = (banks[subjectKey] || chemistryQuestions).slice();
  shuffle(bank);
  bank = bank.slice(0, settings.numQuestions);
  endOverlay.classList.remove("show");
  updateHud();
  loadQuestion();
});

document.getElementById("backBtn").addEventListener("click", () => {
  location.href = "select-method.html";
});

// ================================
// פונקציה לעירבוב שאלות
// ================================
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
