import Sheet from './Sheet.jsx';
import { getExercise } from '../data/exercises.js';
import { useStore } from '../store.jsx';
import { useEffect, useRef, useState } from 'react';
import { fmtDate } from '../utils/dates.js';

const TODAY = () => new Date().toISOString().slice(0, 10);
const YESTERDAY = () => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return fmtDate(d);
};

// Tap-to-learn + quick log for a single exercise. Handles built-in
// program exercises and user-added custom ones (id starts with "custom-").
//
// Props:
//   exerciseId    — id from exercises.js or a custom id
//   prescription  — optional "Today: 4 × 8–12" or "Target: 30s" banner string
//   sessionType   — 'Push' | 'Pull' | 'Skill+Legs' | 'Density' to scope logs
//   closeOnLog    — when true, log() closes the sheet (used when the session
//                   is already complete and the user is just adding one extra)
export default function ExerciseSheet({
  exerciseId, prescription, sessionType, closeOnLog = false, open, onClose,
}) {
  const { actions, meData } = useStore();
  const custom = meData?.customExercises?.[exerciseId];
  const ex = custom
    ? { name: custom.name, cue: '' }
    : getExercise(exerciseId);

  const [sets, setSets] = useState('');
  const [reps, setReps] = useState('');
  const [hold, setHold] = useState('');
  const [load, setLoad] = useState('');
  const [rpe,  setRpe]  = useState('');
  const [notes, setNotes] = useState('');
  const [logDate, setLogDate] = useState('today');     // 'today' | 'yesterday'
  const [side,    setSide]    = useState('both');      // 'both' | 'left' | 'right'

  // Per-set values. Default empty array = "use the scalar fields above".
  // When the user expands it, this becomes a list of per-set { reps, hold, load }
  // strings — one entry per set. We render reps/hold input based on which
  // primary field the user filled (Reps vs Hold).
  const [perSet, setPerSet] = useState([]); // array of { reps, hold, load } strings

  // ---- hold timer (live stopwatch that fills the Hold field) ----
  const [holdRunning, setHoldRunning] = useState(false);
  const holdStartRef = useRef(0);
  useEffect(() => {
    if (!holdRunning) return;
    holdStartRef.current = Date.now();
    setHold('0');
    const id = setInterval(() => {
      setHold(String(Math.floor((Date.now() - holdStartRef.current) / 1000)));
    }, 200);
    return () => clearInterval(id);
  }, [holdRunning]);

  // ---- rest timer (Hold-button driven) ----
  const [restRemaining, setRestRemaining] = useState(0);
  useEffect(() => {
    if (restRemaining <= 0) return;
    const id = setInterval(() => {
      setRestRemaining((r) => {
        if (r <= 1) {
          if (typeof navigator !== 'undefined' && 'vibrate' in navigator) navigator.vibrate(250);
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [restRemaining]);

  // Stop timers + reset transient state if the sheet closes.
  useEffect(() => {
    if (!open) {
      setHoldRunning(false);
      setRestRemaining(0);
      setPerSet([]);
    }
  }, [open]);

  const isHoldExercise = !!hold && !reps;
  const sideToPersist = side === 'both' ? undefined : side;

  const log = () => {
    // Pull per-set arrays if the user filled the expander, otherwise fall
    // back to the scalar reps/hold/load. perSet is filtered to entries
    // with at least one filled value.
    const cleaned = perSet.filter((row) =>
      row.reps !== '' || row.hold !== '' || row.load !== ''
    );
    const usePerSet = cleaned.length > 0;

    const perSetReps  = usePerSet ? cleaned.map((r) => safeNum(r.reps)) : null;
    const perSetHold  = usePerSet ? cleaned.map((r) => safeNum(r.hold)) : null;
    const perSetLoad  = usePerSet ? cleaned.map((r) => safeNum(r.load)) : null;

    actions.addLog({
      exerciseId,
      sessionType: sessionType || null,
      date: logDate === 'today' ? TODAY() : YESTERDAY(),
      sets:  usePerSet ? cleaned.length : num(sets),
      reps:  num(reps),
      hold:  num(hold),
      load:  num(load),
      rpe:   num(rpe),
      notes: notes.trim(),
      ...(sideToPersist ? { side: sideToPersist } : {}),
      ...(usePerSet && hasAny(perSetReps) ? { perSetReps } : {}),
      ...(usePerSet && hasAny(perSetHold) ? { perSetHold } : {}),
      ...(usePerSet && hasAny(perSetLoad) ? { perSetLoad } : {}),
    });

    // Clear inputs for the next set
    setSets(''); setReps(''); setHold(''); setLoad(''); setRpe(''); setNotes('');
    setHoldRunning(false);
    setPerSet([]);

    if (closeOnLog) onClose();
  };

  // Hold-button click: toggles hold, swaps with rest timer.
  const toggleHold = () => {
    if (holdRunning) {
      setHoldRunning(false);
      setRestRemaining(90);
    } else {
      setRestRemaining(0);
      setHoldRunning(true);
    }
  };

  // Per-set expander helpers
  const startPerSet = () => {
    // Seed list with one row prefilled from the current scalar fields
    setPerSet([{ reps, hold, load }]);
  };
  const addSet = () =>
    setPerSet((rows) => [...rows, { reps: '', hold: '', load: '' }]);
  const setPerSetField = (i, key, val) =>
    setPerSet((rows) => rows.map((r, idx) => (idx === i ? { ...r, [key]: val } : r)));
  const removePerSet = (i) =>
    setPerSet((rows) => rows.filter((_, idx) => idx !== i));

  // History (any session) — newest first. First entry is "last logged".
  const history = (meData?.logs || [])
    .filter((l) => l.exerciseId === exerciseId)
    .slice()
    .reverse();
  const last = history[0];

  return (
    <Sheet open={open} onClose={onClose} title={ex.name}>
      <div className="px-5 py-4 space-y-5">
        {prescription && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-3 py-2 flex items-baseline gap-2">
            <span className="text-[10px] uppercase tracking-wide text-emerald-400/70">Today</span>
            <span className="text-sm text-emerald-200 font-medium">{prescription}</span>
          </div>
        )}

        {ex.cue && (
          <div>
            <div className="text-xs uppercase tracking-wide text-zinc-500 mb-1">How-to</div>
            <p className="text-sm text-zinc-300 leading-relaxed">{ex.cue}</p>
          </div>
        )}

        <div>
          {/* Header: section label + date toggle + side toggle */}
          <div className="flex items-baseline justify-between mb-2 gap-2">
            <div className="text-xs uppercase tracking-wide text-zinc-500">Quick log</div>
            <div className="flex items-center gap-2">
              <div className="text-[10px] flex bg-zinc-800 rounded-md p-0.5">
                <button
                  onClick={() => setSide('both')}
                  className={`px-2 py-0.5 rounded ${side === 'both' ? 'bg-zinc-100 text-zinc-950' : 'text-zinc-400'}`}
                >Both</button>
                <button
                  onClick={() => setSide('left')}
                  className={`px-2 py-0.5 rounded ${side === 'left' ? 'bg-zinc-100 text-zinc-950' : 'text-zinc-400'}`}
                >L</button>
                <button
                  onClick={() => setSide('right')}
                  className={`px-2 py-0.5 rounded ${side === 'right' ? 'bg-zinc-100 text-zinc-950' : 'text-zinc-400'}`}
                >R</button>
              </div>
              <div className="text-[10px] flex bg-zinc-800 rounded-md p-0.5">
                <button
                  onClick={() => setLogDate('today')}
                  className={`px-2 py-0.5 rounded ${logDate === 'today' ? 'bg-zinc-100 text-zinc-950' : 'text-zinc-400'}`}
                >Today</button>
                <button
                  onClick={() => setLogDate('yesterday')}
                  className={`px-2 py-0.5 rounded ${logDate === 'yesterday' ? 'bg-zinc-100 text-zinc-950' : 'text-zinc-400'}`}
                >Yesterday</button>
              </div>
            </div>
          </div>

          {/* "Beat" hint — what you logged most recently */}
          {last && (
            <div className="mb-2 text-xs text-zinc-400">
              <span className="text-emerald-400">Beat:</span>{' '}
              <span className="text-zinc-200">{summarizeLog(last)}</span>
              <span className="text-zinc-600"> · {last.date}</span>
            </div>
          )}

          {/* Primary fields (hidden when in per-set mode — replaced below) */}
          {perSet.length === 0 && (
            <>
              <div className="grid grid-cols-3 gap-2">
                <Field label="Sets" value={sets} onChange={setSets} placeholder="–" />
                <Field label="Reps" value={reps} onChange={setReps} placeholder="–" />
                {/* Hold field with inline stopwatch button */}
                <label className="block">
                  <span className="text-[10px] uppercase tracking-wide text-zinc-500">Hold (s)</span>
                  <div className="relative mt-1">
                    <input
                      type="number"
                      inputMode="decimal"
                      value={hold}
                      placeholder="–"
                      onChange={(e) => { setHold(e.target.value); setHoldRunning(false); }}
                      className={`w-full pr-9 bg-zinc-800 border rounded-lg px-2 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 ${holdRunning ? 'border-amber-500/60 text-amber-200' : 'border-zinc-700'}`}
                    />
                    <button
                      onClick={toggleHold}
                      className={`absolute right-1 top-1/2 -translate-y-1/2 w-7 h-7 rounded flex items-center justify-center text-sm ${holdRunning ? 'text-amber-300 bg-amber-500/20' : 'text-zinc-300 bg-zinc-700 hover:bg-zinc-600'}`}
                      aria-label={holdRunning ? 'Stop hold timer' : 'Start hold timer'}
                      type="button"
                    >
                      {holdRunning ? '■' : '▶'}
                    </button>
                  </div>
                </label>
                <Field label="Load (lb)" value={load} onChange={setLoad} placeholder="–" />
                <Field label="RPE 1–10"  value={rpe}  onChange={setRpe}  placeholder="–" />
                <label className="block">
                  <span className="text-[10px] uppercase tracking-wide text-zinc-500">Rest</span>
                  <div className={`mt-1 rounded-lg px-2 py-2 text-sm tabular-nums border flex items-center justify-between ${
                    restRemaining > 0
                      ? 'bg-amber-500/15 border-amber-500/30 text-amber-200 font-bold'
                      : 'bg-zinc-800 border-zinc-700 text-zinc-500'
                  }`}>
                    <span>{restRemaining > 0 ? formatMSS(restRemaining) : '—'}</span>
                    {restRemaining > 0 && (
                      <button
                        onClick={() => setRestRemaining(0)}
                        className="text-amber-300/70 hover:text-amber-200 text-xs ml-1"
                        type="button"
                      >×</button>
                    )}
                  </div>
                </label>
              </div>

              {restRemaining > 0 && (
                <div className="mt-2 flex justify-end gap-1.5">
                  <button onClick={() => setRestRemaining((r) => Math.max(15, r - 15))} className="px-2 py-1 text-xs rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300">−15s</button>
                  <button onClick={() => setRestRemaining((r) => r + 30)} className="px-2 py-1 text-xs rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300">+30s</button>
                </div>
              )}

              <button
                onClick={startPerSet}
                type="button"
                className="mt-2 text-xs text-zinc-400 hover:text-zinc-100 underline-offset-2 hover:underline"
              >
                Log a different value per set →
              </button>
            </>
          )}

          {/* Per-set mode — replaces the scalar grid */}
          {perSet.length > 0 && (
            <div className="space-y-2">
              <div className="text-[10px] uppercase tracking-wide text-zinc-500">
                Per-set ({perSet.length} {perSet.length === 1 ? 'set' : 'sets'})
              </div>
              {perSet.map((row, i) => (
                <div key={i} className="grid grid-cols-[24px_1fr_1fr_1fr_24px] gap-1.5 items-center">
                  <span className="text-xs text-zinc-500 tabular-nums">#{i + 1}</span>
                  <input
                    type="number" inputMode="decimal"
                    value={row.reps}
                    onChange={(e) => setPerSetField(i, 'reps', e.target.value)}
                    placeholder="reps"
                    className="bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-1.5 text-sm text-zinc-100 placeholder:text-zinc-500"
                  />
                  <input
                    type="number" inputMode="decimal"
                    value={row.hold}
                    onChange={(e) => setPerSetField(i, 'hold', e.target.value)}
                    placeholder="sec"
                    className="bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-1.5 text-sm text-zinc-100 placeholder:text-zinc-500"
                  />
                  <input
                    type="number" inputMode="decimal"
                    value={row.load}
                    onChange={(e) => setPerSetField(i, 'load', e.target.value)}
                    placeholder="lb"
                    className="bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-1.5 text-sm text-zinc-100 placeholder:text-zinc-500"
                  />
                  <button
                    onClick={() => removePerSet(i)}
                    className="text-zinc-500 hover:text-rose-400 text-xs"
                    type="button"
                  >×</button>
                </div>
              ))}
              <div className="flex items-center justify-between">
                <button
                  onClick={addSet}
                  type="button"
                  className="text-xs text-zinc-300 bg-zinc-800 hover:bg-zinc-700 rounded-lg px-3 py-1.5"
                >+ Add set</button>
                <button
                  onClick={() => setPerSet([])}
                  type="button"
                  className="text-xs text-zinc-500 hover:text-zinc-200"
                >← back to single value</button>
              </div>
            </div>
          )}

          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Notes (optional)"
            className="mt-3 w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500"
            rows={2}
          />
          <button
            onClick={log}
            className="mt-3 w-full bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold rounded-xl py-3"
          >
            Log set
          </button>
        </div>

        {history.length > 0 && (
          <div>
            <div className="text-xs uppercase tracking-wide text-zinc-500 mb-2">Recent</div>
            <ul className="space-y-1">
              {history.slice(0, 5).map((h) => (
                <li key={h.id} className="text-xs text-zinc-400 flex items-center justify-between bg-zinc-800/40 rounded-lg px-3 py-2">
                  <span>{h.date}</span>
                  <span className="text-zinc-300">{summarizeLog(h)}</span>
                  <button onClick={() => actions.removeLog(h.id)} className="text-zinc-500 hover:text-rose-400 ml-2">×</button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </Sheet>
  );
}

function Field({ label, value, onChange, placeholder }) {
  return (
    <label className="block">
      <span className="text-[10px] uppercase tracking-wide text-zinc-500">{label}</span>
      <input
        type="number"
        inputMode="decimal"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-2 text-sm text-zinc-100 placeholder:text-zinc-500"
      />
    </label>
  );
}

function num(s) { const n = parseFloat(s); return isFinite(n) ? n : null; }
function safeNum(s) { const n = parseFloat(s); return isFinite(n) ? n : null; }
function hasAny(arr) { return arr && arr.some((v) => v != null); }

export function summarizeLog(l) {
  const repsText = Array.isArray(l.perSetReps)
    ? l.perSetReps.filter((v) => v != null).join('/')
    : (l.reps != null ? `${l.reps}` : null);
  const holdText = Array.isArray(l.perSetHold)
    ? l.perSetHold.filter((v) => v != null).join('/') + 's'
    : (l.hold != null ? `${l.hold}s` : null);
  const loadText = Array.isArray(l.perSetLoad)
    ? '+' + l.perSetLoad.filter((v) => v != null).join('/') + 'lb'
    : (l.load != null ? `+${l.load}lb` : null);
  const setsText = (l.sets && !Array.isArray(l.perSetReps) && !Array.isArray(l.perSetHold))
    ? `${l.sets}×`
    : null;
  const sideText = l.side === 'left' ? 'L' : l.side === 'right' ? 'R' : null;
  return [setsText, repsText && `${repsText} reps`, holdText, loadText, l.rpe && `RPE ${l.rpe}`, sideText]
    .filter(Boolean).join(' · ') || '—';
}

function formatMSS(secs) {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}
