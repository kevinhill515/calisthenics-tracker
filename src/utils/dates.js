// All week math is ISO Mon→Sun. The user said completion matters, not the
// specific day, so we represent a week with a single id like "2026-W19".

const MS_PER_DAY = 86_400_000;

/** Parse a YYYY-MM-DD string into a local-noon Date (avoids DST/TZ edges). */
export function parseDate(s) {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d, 12, 0, 0, 0);
}

/** Format a Date as YYYY-MM-DD in local time. */
export function fmtDate(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Monday-of-week for a given Date (Mon=1...Sun=7). */
export function mondayOf(d) {
  const day = d.getDay() || 7; // Sun=0 → 7
  const m = new Date(d);
  m.setHours(12, 0, 0, 0);
  m.setDate(m.getDate() - (day - 1));
  return m;
}

export function sundayOf(d) {
  const m = mondayOf(d);
  const s = new Date(m);
  s.setDate(s.getDate() + 6);
  return s;
}

/** Number of complete weeks elapsed since startDate (week 1 = the start week). */
export function weekNumber(startDate, asOf = new Date()) {
  const start = mondayOf(parseDate(startDate));
  const now = mondayOf(asOf);
  const diff = Math.floor((now - start) / (MS_PER_DAY * 7));
  return diff + 1;
}

/** Stable id for a week: ISO year + week number e.g. "2026-W19". */
export function weekId(asOf = new Date()) {
  const d = new Date(asOf);
  d.setHours(12, 0, 0, 0);
  // ISO week: Thursday of the same week defines the year.
  const day = d.getDay() || 7;
  d.setDate(d.getDate() + 4 - day);
  const yearStart = new Date(d.getFullYear(), 0, 1);
  const week = Math.ceil(((d - yearStart) / MS_PER_DAY + 1) / 7);
  return `${d.getFullYear()}-W${String(week).padStart(2, '0')}`;
}

/** Format range like "May 4 – 10". */
export function fmtWeekRange(asOf = new Date()) {
  const m = mondayOf(asOf);
  const s = sundayOf(asOf);
  const fmt = (d) => d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  return `${fmt(m)} – ${fmt(s)}`;
}

/** All weekIds between startDate and now, oldest → newest. */
export function allWeekIds(startDate, asOf = new Date()) {
  const ids = [];
  let cursor = mondayOf(parseDate(startDate));
  const end = mondayOf(asOf);
  while (cursor <= end) {
    ids.push(weekId(cursor));
    cursor = new Date(cursor.getTime() + 7 * MS_PER_DAY);
  }
  return ids;
}
