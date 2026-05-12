// Helpers for the cardio baseline UI.
//
// Each baseline has a `type` that controls whether lower or higher
// numbers are "better", how values are stored, and how they're shown.
//
//   type        | stored as | direction      | shown as
//   ------------|-----------|----------------|---------
//   'time'      | seconds   | lower = better | M:SS  (e.g. mile time)
//   'duration'  | seconds   | higher = better| M:SS  (e.g. jump rope max)
//   'reps'      | integer   | higher = better| N
//   'distance'  | miles     | higher = better| N.NN mi

export const TYPES = ['time', 'duration', 'reps', 'distance'];

export const TYPE_LABELS = {
  time:     'Time (lower = better)',
  duration: 'Duration (higher = better)',
  reps:     'Reps',
  distance: 'Distance (mi)',
};

export function isLowerBetter(type) {
  return type === 'time';
}

/** Parse user-typed input into the stored value for a given baseline type.
 *  Accepts "M:SS" for time/duration, plain numbers otherwise. */
export function parseInputForType(raw, type) {
  if (raw == null) return null;
  const s = String(raw).trim();
  if (!s) return null;
  if (type === 'time' || type === 'duration') {
    if (s.includes(':')) {
      const [m, sec] = s.split(':').map((n) => parseFloat(n));
      if (!isFinite(m)) return null;
      return Math.round(m * 60 + (isFinite(sec) ? sec : 0));
    }
    const n = parseFloat(s);
    return isFinite(n) ? Math.round(n) : null;
  }
  const n = parseFloat(s);
  return isFinite(n) ? n : null;
}

/** Format a stored value for display. */
export function formatValue(v, type) {
  if (v == null) return '—';
  if (type === 'time' || type === 'duration') {
    const m = Math.floor(v / 60);
    const s = Math.floor(v % 60);
    return `${m}:${String(s).padStart(2, '0')}`;
  }
  if (type === 'distance') return `${v.toFixed(2)} mi`;
  if (type === 'reps')     return `${v}`;
  return `${v}`;
}

/** Best value across entries — min for time, max otherwise. Returns
 *  { value, date } or null if no entries. */
export function bestEntry(entries, type) {
  if (!entries || !entries.length) return null;
  const lower = isLowerBetter(type);
  let best = entries[0];
  for (const e of entries) {
    if (e.value == null) continue;
    if (best.value == null) { best = e; continue; }
    if (lower ? e.value < best.value : e.value > best.value) best = e;
  }
  return best;
}
