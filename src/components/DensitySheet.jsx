import Sheet from './Sheet.jsx';
import { getExercise } from '../data/exercises.js';
import { SESSION_META } from '../data/program.js';
import { useStore } from '../store.jsx';
import { weekId } from '../utils/dates.js';
import { useEffect, useMemo, useState } from 'react';

// Specialized sheet for circuit-style Density sessions (Phase 1, 2, 4).
// Walk through one round at a time, showing every exercise in order with
// inputs prefilled to the prescribed target. User completes the round,
// fills in actuals (reps + optional weight, or held seconds), taps "Save
// round" — gets a fresh blank next round. Last round's save also marks
// the session complete.
export default function DensitySheet({ open, onClose, phase }) {
  const { actions, meData } = useStore();
  const session = phase?.sessions?.Density;
  const totalRounds = session?.rounds || 1;
  const meta = SESSION_META.Density;

  // Combine prescribed items with any user-added custom exercises for
  // Density into a single normalized list. Custom items appear at the end
  // of the round.
  const allItems = useMemo(() => {
    const prescribed = (session?.items || []).map((it) => {
      const d = parseDose(it.dose);
      return {
        ex: it.ex,
        name: null,                  // resolved from EXERCISES at render
        unit: d.type === 'hold' ? 'sec' : 'reps',
        target: d.target,
        doseString: it.dose,
        isCustom: false,
      };
    });
    const customs = Object.entries(meData?.customExercises || {})
      .filter(([, c]) => c.sessionType === 'Density' && !c.hidden)
      .map(([id, c]) => ({
        ex: id,
        name: c.name,
        unit: c.unit === 'sec' ? 'sec' : 'reps',
        target: c.target ?? null,
        doseString: c.target != null ? `${c.target}${c.unit === 'sec' ? 's' : ''}` : null,
        isCustom: true,
      }));
    return [...prescribed, ...customs];
  }, [session?.items, meData?.customExercises]);

  // Inputs (the rep/sec value the user achieved this round) — prefilled
  // to the target so a "did exactly as prescribed" round is one tap.
  const buildInitialInputs = (items) => {
    const out = {};
    for (const it of items || []) {
      if (it.target != null) out[it.ex] = String(it.target);
    }
    return out;
  };

  const [round, setRound] = useState(1);
  const [inputs, setInputs] = useState(() => buildInitialInputs(allItems));
  const [loads, setLoads]   = useState({}); // optional weight per exercise (lb)

  // Active hold-timer for one of the seconds-based exercises in the round.
  // Only one can run at a time. The interval below fills the input live.
  const [timing, setTiming] = useState(null); // { exerciseId, startedAt } | null
  useEffect(() => {
    if (!timing) return;
    const id = setInterval(() => {
      const secs = Math.floor((Date.now() - timing.startedAt) / 1000);
      setInputs((prev) => ({ ...prev, [timing.exerciseId]: String(secs) }));
    }, 200);
    return () => clearInterval(id);
  }, [timing]);

  // Between-rounds rest timer — auto-starts when you Save round, ticks
  // down, and vibrates at 0. Banner sits below the round selector.
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

  // Reset round + inputs + timers every time the sheet (re)opens. Logs
  // already pushed to Supabase aren't touched.
  useEffect(() => {
    if (open) {
      setRound(1);
      setInputs(buildInitialInputs(allItems));
      setLoads({});
    }
    setTiming(null);
    setRestRemaining(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Inline "+ Add exercise" form state
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newUnit, setNewUnit] = useState('reps');
  const [newTarget, setNewTarget] = useState('');

  // Today's count of distinct exercises logged in Density — informational
  // header so user can see what's been recorded already.
  const today = new Date().toISOString().slice(0, 10);
  const todayDensityLogs = useMemo(
    () => (meData?.logs || []).filter((l) => l.date === today && l.sessionType === 'Density'),
    [meData?.logs, today]
  );

  if (!open || !session) return null;
  if (!session.rounds) return null; // safety — only render for circuit format

  const wid = weekId();
  const isLast = round >= totalRounds;
  const isAlreadyComplete = !!meData?.weeks?.[wid]?.Density;

  const setInput = (exId, val) => {
    // Manual edit cancels any running hold-timer on this exercise so the
    // input doesn't get overwritten by the interval on the next tick.
    if (timing?.exerciseId === exId) setTiming(null);
    setInputs((prev) => ({ ...prev, [exId]: val }));
  };

  const setLoad = (exId, val) =>
    setLoads((prev) => ({ ...prev, [exId]: val }));

  // Tap ▶ on a seconds-based exercise to start the live counter; tap ■ to
  // stop. Only one timer runs at a time.
  const toggleExerciseTimer = (exId) => {
    if (timing?.exerciseId === exId) {
      setTiming(null);
    } else {
      setInputs((prev) => ({ ...prev, [exId]: '0' }));
      setTiming({ exerciseId: exId, startedAt: Date.now() });
    }
  };

  // Jump to an arbitrary round (manual selector tap) — kill all timers.
  const jumpToRound = (n) => {
    setRound(n);
    setInputs(buildInitialInputs(allItems));
    setLoads({});
    setTiming(null);
    setRestRemaining(0);
  };

  const submitCustom = () => {
    const name = newName.trim();
    if (!name) { setAdding(false); return; }
    const t = parseFloat(newTarget);
    actions.addCustomExercise('Density', name, {
      unit: newUnit,
      target: isFinite(t) ? t : undefined,
    });
    setNewName(''); setNewTarget(''); setNewUnit('reps');
    setAdding(false);
  };

  const saveRound = () => {
    // One log entry per exercise, tagged with the round number in notes.
    for (const item of allItems) {
      const raw = inputs[item.ex];
      const num = parseFloat(raw);
      if (!isFinite(num) || num <= 0) continue;
      const rawLoad = loads[item.ex];
      const loadNum = parseFloat(rawLoad);
      actions.addLog({
        exerciseId: item.ex,
        sessionType: 'Density',
        sets: 1,
        ...(item.unit === 'sec' ? { hold: num } : { reps: num }),
        ...(isFinite(loadNum) && loadNum > 0 ? { load: loadNum } : {}),
        notes: `Round ${round}/${totalRounds}`,
      });
    }
    // Any active exercise timer is now stale — kill it.
    setTiming(null);
    if (isLast) {
      if (!isAlreadyComplete) actions.toggleSession(wid, 'Density');
      onClose();
    } else {
      setRound(round + 1);
      setInputs(buildInitialInputs(allItems));
      setLoads({});
      setRestRemaining(60); // default Heria-style between-rounds rest
    }
  };

  return (
    <Sheet open={open} onClose={onClose} title="Density" fullHeight>
      <div className="px-5 py-4 space-y-4">
        {/* Round selector */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs uppercase tracking-wide text-zinc-500">Round</div>
            <div className="text-[11px] text-zinc-500">{todayDensityLogs.length} logs today</div>
          </div>
          <div className="flex gap-2">
            {Array.from({ length: totalRounds }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                onClick={() => jumpToRound(n)}
                className={`flex-1 py-2 rounded-xl text-sm font-bold border ${
                  n === round
                    ? 'bg-emerald-500 text-zinc-950 border-emerald-500'
                    : 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700'
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        {/* Between-rounds rest timer */}
        {restRemaining > 0 && (
          <div className="flex items-center gap-3 bg-amber-500/10 border border-amber-500/30 rounded-xl px-3 py-2">
            <span className="text-amber-200 font-bold tabular-nums text-lg">
              {formatMSS(restRemaining)}
            </span>
            <span className="text-[11px] uppercase tracking-wide text-amber-300/80">
              Rest before round {round}
            </span>
            <div className="ml-auto flex items-center gap-1">
              <button onClick={() => setRestRemaining((r) => Math.max(15, r - 15))} className="px-2 py-1 text-xs rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300">−15s</button>
              <button onClick={() => setRestRemaining((r) => r + 30)} className="px-2 py-1 text-xs rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300">+30s</button>
              <button onClick={() => setRestRemaining(0)} className="px-2 py-1 text-xs rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-400">×</button>
            </div>
          </div>
        )}

        {/* Heria-style note + per-session note */}
        {meta?.info && (
          <div className="text-xs bg-emerald-500/10 border border-emerald-500/20 text-emerald-200 rounded-lg px-3 py-2 leading-relaxed">
            {meta.info}
          </div>
        )}
        {session.note && (
          <div className="text-xs bg-amber-500/10 border border-amber-500/20 text-amber-300 rounded-lg px-3 py-2">
            {session.note}
          </div>
        )}

        {/* Exercise list */}
        <div>
          <div className="text-xs uppercase tracking-wide text-zinc-500 mb-2">
            In order — minimal rest between
          </div>
          <ul className="space-y-2">
            {allItems.map((item, i) => {
              const ex = item.isCustom
                ? { name: item.name, cue: '' }
                : getExercise(item.ex);
              const isTiming = timing?.exerciseId === item.ex;
              return (
                <li key={`${item.ex}-${i}`} className="relative bg-zinc-800/50 border border-zinc-800 rounded-xl p-3">
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 inline-flex w-7 h-7 rounded-full bg-zinc-700 text-zinc-200 text-xs items-center justify-center flex-shrink-0 font-bold">
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between gap-2">
                        <div className="font-medium text-zinc-100 truncate">{ex.name}</div>
                        {item.doseString && (
                          <div className="text-[11px] text-emerald-300 tabular-nums flex-shrink-0">
                            {item.doseString}
                          </div>
                        )}
                      </div>
                      {ex.cue && (
                        <p className="text-[11px] text-zinc-500 mt-0.5 line-clamp-2">{ex.cue}</p>
                      )}

                      {/* Inputs: reps + weight, OR seconds with timer */}
                      <div className="mt-2 flex items-center gap-1.5">
                        <input
                          type="number"
                          inputMode="decimal"
                          value={inputs[item.ex] ?? ''}
                          onChange={(e) => setInput(item.ex, e.target.value)}
                          placeholder={item.target != null ? String(item.target) : '–'}
                          className={`w-16 bg-zinc-900 border rounded-lg px-2 py-1.5 text-sm placeholder:text-zinc-500 ${
                            isTiming ? 'border-amber-500/60 text-amber-200' : 'border-zinc-700 text-zinc-100'
                          }`}
                        />
                        {item.unit === 'sec' ? (
                          <>
                            <button
                              onClick={() => toggleExerciseTimer(item.ex)}
                              className={`w-8 h-8 rounded flex items-center justify-center text-sm ${
                                isTiming
                                  ? 'text-amber-300 bg-amber-500/20'
                                  : 'text-zinc-300 bg-zinc-700 hover:bg-zinc-600'
                              }`}
                              aria-label={isTiming ? 'Stop hold timer' : 'Start hold timer'}
                              type="button"
                            >
                              {isTiming ? '■' : '▶'}
                            </button>
                            <span className="text-xs text-zinc-500">sec</span>
                          </>
                        ) : (
                          <>
                            <span className="text-xs text-zinc-500 mr-1">reps</span>
                            <input
                              type="number"
                              inputMode="decimal"
                              value={loads[item.ex] ?? ''}
                              onChange={(e) => setLoad(item.ex, e.target.value)}
                              placeholder="—"
                              className="w-14 bg-zinc-900 border border-zinc-700 rounded-lg px-2 py-1.5 text-sm text-zinc-100 placeholder:text-zinc-500"
                            />
                            <span className="text-xs text-zinc-500">lb</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Tiny × on custom items to remove from the circuit */}
                  {item.isCustom && (
                    <button
                      onClick={() => actions.hideCustomExercise(item.ex)}
                      className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full text-zinc-600 hover:text-rose-400 hover:bg-zinc-900 flex items-center justify-center text-xs"
                      aria-label="Remove custom exercise"
                      type="button"
                    >×</button>
                  )}
                </li>
              );
            })}
          </ul>

          {/* + Add exercise — inline form */}
          {adding ? (
            <div className="mt-2 bg-zinc-800/60 border border-zinc-700 rounded-xl p-3 space-y-2">
              <input
                autoFocus
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Exercise name…"
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500"
              />
              <div className="flex items-center gap-2">
                <div className="flex bg-zinc-900 border border-zinc-700 rounded-md p-0.5 text-xs">
                  <button
                    type="button"
                    onClick={() => setNewUnit('reps')}
                    className={`px-2.5 py-1 rounded ${newUnit === 'reps' ? 'bg-zinc-100 text-zinc-950' : 'text-zinc-400'}`}
                  >reps</button>
                  <button
                    type="button"
                    onClick={() => setNewUnit('sec')}
                    className={`px-2.5 py-1 rounded ${newUnit === 'sec' ? 'bg-zinc-100 text-zinc-950' : 'text-zinc-400'}`}
                  >sec</button>
                </div>
                <input
                  type="number"
                  inputMode="decimal"
                  value={newTarget}
                  onChange={(e) => setNewTarget(e.target.value)}
                  placeholder="target"
                  className="flex-1 bg-zinc-900 border border-zinc-700 rounded-lg px-2 py-1.5 text-sm text-zinc-100 placeholder:text-zinc-500"
                />
                <button
                  type="button"
                  onClick={submitCustom}
                  className="px-3 py-1.5 rounded-lg bg-emerald-500 text-zinc-950 text-sm font-bold"
                >Add</button>
                <button
                  type="button"
                  onClick={() => { setAdding(false); setNewName(''); setNewTarget(''); }}
                  className="px-3 py-1.5 rounded-lg bg-zinc-800 text-zinc-300 text-sm"
                >Cancel</button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setAdding(true)}
              className="w-full mt-2 text-sm text-zinc-400 hover:text-zinc-100 border border-dashed border-zinc-700 hover:border-zinc-500 rounded-xl py-2.5"
            >
              + Add exercise
            </button>
          )}
        </div>

        {/* Save round / Finish button */}
        <button
          onClick={saveRound}
          className="w-full font-bold rounded-2xl py-4 text-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 transition"
        >
          {isLast
            ? `Save round ${round} & mark complete`
            : `Save round ${round} · start round ${round + 1}`}
        </button>

        {isAlreadyComplete && (
          <button
            onClick={() => actions.toggleSession(wid, 'Density')}
            className="w-full text-xs text-zinc-500 hover:text-rose-400 py-1"
          >
            Undo complete
          </button>
        )}
      </div>
    </Sheet>
  );
}

function formatMSS(secs) {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

// Parse the dose string from a session item ("10", "8", "30s", "8 (chest to bar)")
// into a typed { type: 'reps' | 'hold', target: number | null } shape so the
// circuit UI can pick the right field and prefill the right number.
function parseDose(dose) {
  if (!dose) return { type: 'reps', target: null };
  const holdMatch = dose.match(/(\d+(?:\.\d+)?)\s*s\b/);
  if (holdMatch) return { type: 'hold', target: parseFloat(holdMatch[1]) };
  const repsMatch = dose.match(/(\d+)/);
  if (repsMatch) return { type: 'reps', target: parseInt(repsMatch[1], 10) };
  return { type: 'reps', target: null };
}
