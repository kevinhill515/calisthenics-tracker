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
//   sessionType   — optional 'Push' | 'Pull' | 'Skill+Legs' | 'Density' so the
//                   log entry is scoped to the session that opened this sheet
export default function ExerciseSheet({ exerciseId, prescription, sessionType, open, onClose }) {
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
  const [logDate, setLogDate] = useState('today'); // 'today' | 'yesterday'

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

  // ---- rest timer ----
  // Driven by the Hold-timer button: ■ (stop hold) starts the rest timer,
  // ▶ (start hold) cancels it. Log set does NOT touch the rest timer —
  // user logs after the whole exercise (all sets) is done.
  const [restRemaining, setRestRemaining] = useState(0); // 0 = not running
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

  // Stop both timers if the sheet closes.
  useEffect(() => {
    if (!open) {
      setHoldRunning(false);
      setRestRemaining(0);
    }
  }, [open]);

  const log = () => {
    actions.addLog({
      exerciseId,
      sessionType: sessionType || null,
      date: logDate === 'today' ? TODAY() : YESTERDAY(),
      sets:  num(sets),
      reps:  num(reps),
      hold:  num(hold),
      load:  num(load),
      rpe:   num(rpe),
      notes: notes.trim(),
    });
    setSets(''); setReps(''); setHold(''); setLoad(''); setRpe(''); setNotes('');
    setHoldRunning(false);
    // Note: don't touch the rest timer here — it's hold-button-driven, and
    // user logs at the very end of the exercise after all sets are done.
  };

  // Hold-button click: toggles hold, swaps with rest timer.
  const toggleHold = () => {
    if (holdRunning) {
      setHoldRunning(false);
      setRestRemaining(90);  // start rest when you stop the hold
    } else {
      setRestRemaining(0);   // cancel rest when you start a new hold
      setHoldRunning(true);
    }
  };

  // History (any session) — newest first. The first entry is "last logged".
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
          <div className="flex items-baseline justify-between mb-2">
            <div className="text-xs uppercase tracking-wide text-zinc-500">Quick log</div>
            {/* Date toggle — log against today or yesterday */}
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

          {/* "Beat" hint — what you logged most recently */}
          {last && (
            <div className="mb-2 text-xs text-zinc-400">
              <span className="text-emerald-400">Beat:</span>{' '}
              <span className="text-zinc-200">{summarizeLog(last)}</span>
              <span className="text-zinc-600"> · {last.date}</span>
            </div>
          )}

          <div className="grid grid-cols-3 gap-2">
            <Field label="Sets" value={sets} onChange={setSets} placeholder="–" />
            <Field label="Reps" value={reps} onChange={setReps} placeholder="–" />
            {/* Hold field with inline stopwatch button — toggleHold also
                drives the rest timer (start rest on stop, cancel on start) */}
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
            {/* Rest timer cell — directly under Hold, right of RPE.
                Shows the live countdown when active; "—" when idle. */}
            <label className="block">
              <span className="text-[10px] uppercase tracking-wide text-zinc-500">Rest</span>
              <div
                className={`mt-1 rounded-lg px-2 py-2 text-sm tabular-nums border flex items-center justify-between ${
                  restRemaining > 0
                    ? 'bg-amber-500/15 border-amber-500/30 text-amber-200 font-bold'
                    : 'bg-zinc-800 border-zinc-700 text-zinc-500'
                }`}
              >
                <span>{restRemaining > 0 ? formatMSS(restRemaining) : '—'}</span>
                {restRemaining > 0 && (
                  <button
                    onClick={() => setRestRemaining(0)}
                    className="text-amber-300/70 hover:text-amber-200 text-xs ml-1"
                    aria-label="Stop rest timer"
                    type="button"
                  >×</button>
                )}
              </div>
            </label>
          </div>

          {/* Rest timer +/- controls — shown only when active */}
          {restRemaining > 0 && (
            <div className="mt-2 flex justify-end gap-1.5">
              <button
                onClick={() => setRestRemaining((r) => Math.max(15, r - 15))}
                className="px-2 py-1 text-xs rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
              >−15s</button>
              <button
                onClick={() => setRestRemaining((r) => r + 30)}
                className="px-2 py-1 text-xs rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
              >+30s</button>
            </div>
          )}
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Notes (optional)"
            className="mt-2 w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500"
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

function summarizeLog(l) {
  return [
    l.sets && `${l.sets}×`,
    l.reps && `${l.reps} reps`,
    l.hold && `${l.hold}s`,
    l.load && `+${l.load}lb`,
    l.rpe  && `RPE ${l.rpe}`,
  ].filter(Boolean).join(' · ') || '—';
}

function formatMSS(secs) {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}
