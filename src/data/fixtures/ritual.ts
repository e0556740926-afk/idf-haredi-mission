import type { Ritual } from '../types';

export const ritual: Ritual = {
  id: 'ritual-2026-09',
  periodLabel: 'ספטמבר',
  streakMonths: 3,
  followUps: [
    { label: 'לבטל את המנוי ל־X', done: true },
    { label: 'לבדוק ביטוח רכב', done: false },
  ],
  decisions: [
    {
      index: 0,
      question: 'חדר הכושר עלה ב־42 ₪ לחודש — מנהלים מו״מ או מבטלים?',
      visibility: 'shared',
      text: null,
      owner: null,
      dueDate: null,
      deferred: false,
      autoCheckedDone: null,
    },
    {
      index: 1,
      question: 'הגן מתייקר ב־180 ₪ מספטמבר — מאיזו קטגוריה זה בא?',
      visibility: 'shared',
      text: null,
      owner: null,
      dueDate: null,
      deferred: false,
      autoCheckedDone: null,
    },
    {
      index: 2,
      question: 'החיסכון לחופשה בקצב של 12 חודשים — מעלים את ההפרשה ל־700 ₪?',
      visibility: 'shared',
      text: null,
      owner: null,
      dueDate: null,
      deferred: false,
      autoCheckedDone: null,
    },
  ],
  winTitle: 'ביטלתם שני מנויים',
  winAmount: 1428,
};
