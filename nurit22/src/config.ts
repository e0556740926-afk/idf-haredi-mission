// כל הטקסטים, הצבעים והתזמונים של הסרטון — במקום אחד.
// זמנים בשניות אלא אם כתוב אחרת.

export const VIDEO = {
  width: 1920,
  height: 1080,
  fps: 30,
  /** שנייה למעבר בסוף כל סצנה */
  transitionSec: 1,
  /** אורך קול כשהקובץ חסר */
  placeholderVoiceSec: 18,
};

export const COLORS = {
  night: "#07142e",
  blue: "#0c1d46",
  gold: "#e0b862",
  goldLight: "#f6d58c",
  cream: "#fbf1dc",
};

export const FONTS = {
  title: "Suez One",
  body: "Heebo",
};

export const BRAND = {
  airline: "NUR Airlines",
  flight: "טיסה 22",
  tagline: "22 טעמים מסביב לעולם",
  passportName: "NURIT 22",
  passportLabel: "דרכון",
  stampNumber: "22",
  stampRing: "NUR AIRLINES · FLIGHT 22 · NUR AIRLINES · FLIGHT 22 · ",
  placeholderImage: "תמונה",
  cabin: "FIRST CLASS",
  menuTitle: "תפריט הטעימות",
};

export const AUDIO = {
  /** עוצמת מוזיקה רגילה */
  musicVolume: 0.7,
  /** עוצמת מוזיקה כשיש קול (יחסית למקור) */
  musicDuckedVolume: 0.25,
  /** עוצמת מוזיקה בסוף */
  musicEndVolume: 0.9,
  /** זמן מעבר עוצמה (שניות) */
  musicFadeSec: 0.8,
  voiceVolume: 1,
  sfxVolume: 0.8,
};

/** ציר הזמן של ההוק בסצנה 0 (שניות מתחילת הסצנה) */
export const HOOK = {
  totalSec: 9,
  spotlightOn: 0.3,
  passportIn: [0.9, 2.4],
  stampImpact: 2.9,
  passportOpen: [3.6, 4.6],
  mapDraw: [4.3, 6.0],
  takeoff: 6.0,
  cameraDive: [6.2, 7.2],
  titleIn: 7.0,
};

/** ציר הזמן של סצנות המדינות (שניות מתחילת הסצנה) */
export const COUNTRY_TIMING = {
  /** המטוס משלים את הטיסה ונוחת */
  landing: [0, 1.4],
  /** זום פנימה אל המדינה */
  zoomIn: [1.0, 2.4],
  nameIn: 1.8,
  motifIn: 2.0,
  /** אייקוני המאכלים: התחלה, משך שרטוט, מרווח בין אייקונים */
  iconsIn: 2.2,
  iconDraw: 1.3,
  iconStagger: 0.5,
  /** המשפט הראשון לא יופיע לפני */
  firstTextAt: 1.2,
  /** זום על המדינה */
  zoom: 3.2,
};

/** ציר הזמן של סצנת הסיום (שניות) */
export const FINALE_TIMING = {
  routes: 4,
  table: 4.5,
  logo: 4.5,
  endLine: 4,
  black: 1,
};

export const TITLE = "לטעום את העולם איתך";

export type Scene = {
  id: string;
  voice: string;
  /** משפטים — כל משפט מופיע בתורו, לפי מספר המילים */
  sentences: string[];
};

export const INTRO: Scene = {
  id: "scene-00",
  voice: "voice/scene-00.mp3",
  sentences: [
    "נורית שלי, חשבתי לאן לקחת אותך ליום ההולדת.",
    "אבל איך בוחרים מקום אחד למישהי שרוצה לטעום הכול?",
    "אז הערב החלטתי להביא אלייך קצת מכל מקום.",
    "ובכל עצירה, לספר לך משהו עלייך… ועלינו.",
  ],
};

export type Country = Scene & {
  name: string;
  gate: string;
  foods: [string, string, string];
  /** [longitude, latitude] */
  coords: [number, number];
  /** מוטיב עיצובי: lanterns | photos | neon | mandala | papel | lamps */
  motif: "lanterns" | "photos" | "neon" | "mandala" | "papel" | "lamps";
  /** דוגמת זהב חרוטה: seigaiha | quatrefoil | lattice | jali | talavera | star */
  pattern: "seigaiha" | "quatrefoil" | "lattice" | "jali" | "talavera" | "star";
};

export const HOME_COORDS: [number, number] = [34.8, 32.1];

export const COUNTRIES: Country[] = [
  {
    id: "scene-01",
    voice: "voice/scene-01.mp3",
    name: "יפן",
    gate: "שער 1",
    foods: ["מוצ׳י", "אדממה", "מאצ׳ה"],
    coords: [139.7, 35.7],
    motif: "lanterns",
    pattern: "seigaiha",
    sentences: [
      "נתחיל ביפן, עם משהו קטן שמפתיע מבפנים.",
      "וזה מה שאני אוהב בלהכיר אותך: שגם כשנדמה לי שאני כבר מכיר, יש עוד משהו לגלות.",
      "ואני רוצה להמשיך להכיר אותך ככה, עוד ועוד.",
    ],
  },
  {
    id: "scene-02",
    voice: "voice/scene-02.mp3",
    name: "איטליה",
    gate: "שער 2",
    foods: ["בוראטה", "פרמזן בדבש", "אמרטי"],
    coords: [12.5, 41.9],
    motif: "photos",
    pattern: "quatrefoil",
    sentences: [
      "באיטליה הייתי רוצה לשבת איתך שעות.",
      "להזמין עוד משהו קטן, לדבר, לשכוח מה השעה.",
      "האמת? לא חייבים להגיע עד איטליה בשביל זה.",
      "אני פשוט אוהב להיות איתך.",
    ],
  },
  {
    id: "scene-03",
    voice: "voice/scene-03.mp3",
    name: "קוריאה",
    gate: "שער 3",
    foods: ["קימצ׳י", "אצות", "גוצ׳וג׳אנג"],
    coords: [127, 37.5],
    motif: "neon",
    pattern: "lattice",
    sentences: [
      "בקוריאה יש קצת חריף וקצת מתוק.",
      "כי עם כל הרומנטיקה, אני מאחל לנו גם לדעת לעבור את הרגעים שפחות מתוקים.",
      "להקשיב, להשלים, ולזכור שאנחנו באותו צד.",
      "גם כשאנחנו לא מסכימים מה להזמין.",
    ],
  },
  {
    id: "scene-04",
    voice: "voice/scene-04.mp3",
    name: "הודו",
    gate: "שער 4",
    foods: ["פפאדם", "סמוסה", "לאסי מנגו"],
    coords: [77.2, 28.6],
    motif: "mandala",
    pattern: "jali",
    sentences: [
      "הודו היא בשביל הסקרנות שלך.",
      "בשביל הרצון לטעום ולנסות, וההתלהבות כשמגיע לשולחן משהו שעוד לא הכרת.",
      "אני כבר מחכה לגלות מה יהיה הדבר הבא שנתאהב בו יחד.",
    ],
  },
  {
    id: "scene-05",
    voice: "voice/scene-05.mp3",
    name: "מקסיקו",
    gate: "שער 5",
    foods: ["אלוטה", "סלסה ורדה", "שוקולד צ׳ילי"],
    coords: [-99.1, 19.4],
    motif: "papel",
    pattern: "talavera",
    sentences: [
      "במקסיקו נעצור בשביל הכיף.",
      "לאכול עם הידיים, לצחוק עם פה מלא, להזמין משהו חריף מדי ולהתחרט ביחד.",
      "אני רוצה שיהיו לנו המון רגעים כאלה.",
      "סתם אנחנו, נהנים.",
    ],
  },
  {
    id: "scene-06",
    voice: "voice/scene-06.mp3",
    name: "טורקיה ודובאי",
    gate: "שער 6",
    foods: ["שוקולד דובאי", "חלומי בדבש", "לוקום"],
    coords: [42, 32],
    motif: "lamps",
    pattern: "star",
    sentences: [
      "ולסיום, משהו מתוק ומפנק.",
      "כי היום רציתי שתשבי, תיהני, ותדעי שכל זה הוכן במחשבה עלייך.",
      "על מה שאת אוהבת.",
      "ועל החיוך שקיוויתי לראות כשזה יתחיל.",
    ],
  },
];

export const FINALE = {
  id: "scene-07",
  voice: "voice/scene-07.mp3",
  tableCaption: "כל העולם, כאן על השולחן",
  sentences: [
    "נורית שלי, יש עוד כל כך הרבה מקומות שאני רוצה לראות איתך.",
    "אבל יותר מהכול, אני רוצה את החיים שלנו יחד.",
    "את הארוחות, את השיחות, את השטויות, ואת כל הדברים שעוד יהפכו לזיכרונות שלנו.",
    "יום הולדת שמח, אהובה שלי.",
    "אני אוהב אותך.",
  ],
  endLine: "ועכשיו… טועמים?",
};
