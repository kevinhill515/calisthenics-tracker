// Weeks for this app run Saturday → Friday. Saturday is day 1.
// (User specified May 9 2026, a Saturday, as the program kickoff.)
//
// We use the Saturday-of-week date string as the stable id for a week,
// e.g. "2026-05-09" represents the Sat May 9 → Fri May 15 week. Stable
// across timezones and trivially comparable.

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

/** Today's date as YYYY-MM-DD in local time.
 *  NEVER use `new Date().toISOString().slice(0,10)` for this — that's the
 *  UTC date, which is a day ahead of local in evenings on Pacific time
 *  and breaks "logged today" filters. */
export function today() {
  return fmtDate(new Date());
}

/** Most-recent Saturday on or before `d`. JS getDay: Sun=0..Sat=6. */
export function weekStartOf(d) {
  const day = d.getDay();
  const diff = (day - 6 + 7) % 7; // days since the prior Saturday
  const m = new Date(d);
  m.setHours(12, 0, 0, 0);
  m.setDate(m.getDate() - diff);
  return m;
}

/** The Friday that closes the same week. */
export function weekEndOf(d) {
  const start = weekStartOf(d);
  const e = new Date(start);
  e.setDate(e.getDate() + 6);
  return e;
}

/** Stable id for the week containing `asOf` — the Saturday's YYYY-MM-DD. */
export function weekId(asOf = new Date()) {
  return fmtDate(weekStartOf(asOf));
}

/** Number of complete weeks elapsed since startDate (week 1 = the start week). */
export function weekNumber(startDate, asOf = new Date()) {
  const start = weekStartOf(parseDate(startDate));
  const now = weekStartOf(asOf);
  const diff = Math.floor((now - start) / (MS_PER_DAY * 7));
  return diff + 1;
}

/** Format the current week as "May 9 – 15". */
export function fmtWeekRange(asOf = new Date()) {
  const s = weekStartOf(asOf);
  const e = weekEndOf(asOf);
  const fmt = (d) => d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  return `${fmt(s)} – ${fmt(e)}`;
}

/** All weekIds between startDate and asOf, oldest → newest. */
export function allWeekIds(startDate, asOf = new Date()) {
  const ids = [];
  let cursor = weekStartOf(parseDate(startDate));
  const end = weekStartOf(asOf);
  while (cursor <= end) {
    ids.push(weekId(cursor));
    cursor = new Date(cursor.getTime() + 7 * MS_PER_DAY);
  }
  return ids;
}
