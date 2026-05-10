import Sheet from './Sheet.jsx';
import { getExercise } from '../data/exercises.js';
import { useStore } from '../store.jsx';
import { useState } from 'react';

// Tap-to-learn + quick log for a single exercise. Handles built-in
// program exercises and user-added custom ones (id starts with "custom-").
//
// Props:
//   exerciseId    — id from exercises.js or a custom id
//   prescription  — optional "today" prescription string (e.g. "4 × 8–12") or
//                   target text from a skill ladder (e.g. "Target: 30s")
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
  const [rpe, setRpe] = useState('');
  const [notes, setNotes] = useState('');

  const log = () => {
    actions.addLog({
      exerciseId,
      sessionType: sessionType || null,
      sets:  num(sets),
      reps:  num(reps),
      hold:  num(hold),
      load:  num(load),
      rpe:   num(rpe),
      notes: notes.trim(),
    });
    setSets(''); setReps(''); setHold(''); setLoad(''); setRpe(''); setNotes('');
  };

  // Recent history of this exercise (any session). Showing last 5 across
  // all sessions is fine — these are the user's PRs, not session-specific.
  const history = (meData?.logs || [])
    .filter((l) => l.exerciseId === exerciseId)
    .slice(-5)
    .reverse();

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
          <div className="text-xs uppercase tracking-wide text-zinc-500 mb-2">Quick log</div>
          <div className="grid grid-cols-3 gap-2">
            <Field label="Sets"      value={sets} onChange={setSets} placeholder="–" />
            <Field label="Reps"      value={reps} onChange={setReps} placeholder="–" />
            <Field label="Hold (s)"  value={hold} onChange={setHold} placeholder="–" />
            <Field label="Load (lb)" value={load} onChange={setLoad} placeholder="–" />
            <Field label="RPE 1–10"  value={rpe}  onChange={setRpe}  placeholder="–" />
          </div>
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
              {history.map((h) => (
                <li key={h.id} className="text-xs text-zinc-400 flex items-center justify-between bg-zinc-800/40 rounded-lg px-3 py-2">
                  <span>{h.date}</span>
                  <span className="text-zinc-300">
                    {[
                      h.sets && `${h.sets}×`,
                      h.reps && `${h.reps} reps`,
                      h.hold && `${h.hold}s`,
                      h.load && `+${h.load}lb`,
                      h.rpe  && `RPE ${h.rpe}`,
                    ].filter(Boolean).join(' · ') || '—'}
                  </span>
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
