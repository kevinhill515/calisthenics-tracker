import Sheet from './Sheet.jsx';
import { getExercise } from '../data/exercises.js';
import { SESSION_META } from '../data/program.js';
import { useStore } from '../store.jsx';
import { weekId } from '../utils/dates.js';
import { useEffect, useMemo, useState } from 'react';

// Specialized sheet for circuit-style Density sessions (Phase 1, 2, 4).
// Walk through one round at a time, showing every exercise in order with
// an input prefilled to the prescribed target. User completes the whole
// round, fills in actual numbers, taps "Save round" — gets a fresh blank
// next round. Last round's save also marks the session complete.
export default function DensitySheet({ open, onClose, phase }) {
  const { actions, meData } = useStore();
  const session = phase?.sessions?.Density;
  const totalRounds = session?.rounds || 1;
  const meta = SESSION_META.Density;

  // Initial inputs: prefilled to the target value (so a "did exactly as
  // prescribed" round is one tap, not five number-pads).
  const buildInitialInputs = (items) => {
    const out = {};
    for (const it of items || []) {
      const d = parseDose(it.dose);
      if (d.target != null) out[it.ex] = String(d.target);
    }
    return out;
  };

  const [round, setRound] = useState(1);
  const [inputs, setInputs] = useState(() => buildInitialInputs(session?.items));

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
      setInputs(buildInitialInputs(session?.items));
    }
    setTiming(null);
    setRestRemaining(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

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
    setInputs(buildInitialInputs(session.items));
    setTiming(null);
    setRestRemaining(0);
  };

  const saveRound = () => {
    // One log entry per exercise, tagged with the round number in notes.
    for (const item of session.items) {
      const raw = inputs[item.ex];
      const num = parseFloat(raw);
      if (!isFinite(num) || num <= 0) continue;
      const d = parseDose(item.dose);
      actions.addLog({
        exerciseId: item.ex,
        sessionType: 'Density',
        sets: 1,
        ...(d.type === 'hold' ? { hold: num } : { reps: num }),
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
      setInputs(buildInitialInputs(session.items));
      setRestRemaining(60); // default Heria-style between-rounds rest
    }
  };

  return (
    <Sheet open={open} onClose={onClose} title="Density" fullHeight>
      <div className="px-5 py-4 space-y-4">
        {/* Round selector — defaults to the active round but user can jump */}
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

        {/* Between-rounds rest timer — auto-starts after Save round (not last) */}
        {restRemaining > 0 && (
          <div className="flex items-center gap-3 bg-amber-500/10 border border-amber-500/30 rounded-xl px-3 py-2">
            <span className="text-amber-200 font-bold tabular-nums text-lg">
              {formatMSS(restRemaining)}
            </span>
            <span className="text-[11px] uppercase tracking-wide text-amber-300/80">
              Rest before round {round}
            </span>
            <div className="ml-auto flex items-center gap-1">
              <button
                onClick={() => setRestRemaining((r) => Math.max(15, r - 15))}
                className="px-2 py-1 text-xs rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
              >−15s</button>
              <button
                onClick={() => setRestRemaining((r) => r + 30)}
                className="px-2 py-1 text-xs rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
              >+30s</button>
              <button
                onClick={() => setRestRemaining(0)}
                className="px-2 py-1 text-xs rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-400"
              >×</button>
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

        {/* The flow — exercises in order with inputs prefilled to target */}
        <div>
          <div className="text-xs uppercase tracking-wide text-zinc-500 mb-2">
            In order — minimal rest between
          </div>
          <ul className="space-y-2">
            {session.items.map((item, i) => {
              const ex = getExercise(item.ex);
              const d = parseDose(item.dose);
              const unit = d.type === 'hold' ? 'sec' : 'reps';
              return (
                <li key={i} className="bg-zinc-800/50 border border-zinc-800 rounded-xl p-3">
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 inline-flex w-7 h-7 rounded-full bg-zinc-700 text-zinc-200 text-xs items-center justify-center flex-shrink-0 font-bold">
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between gap-2">
                        <div className="font-medium text-zinc-100 truncate">{ex.name}</div>
                        <div className="text-[11px] text-emerald-300 tabular-nums flex-shrink-0">
                          {item.dose}
                        </div>
                      </div>
                      {ex.cue && (
                        <p className="text-[11px] text-zinc-500 mt-0.5 line-clamp-2">{ex.cue}</p>
                      )}
                      <div className="mt-2 flex items-center gap-2">
                        <input
                          type="number"
                          inputMode="decimal"
                          value={inputs[item.ex] ?? ''}
                          onChange={(e) => setInput(item.ex, e.target.value)}
                          placeholder={d.target != null ? String(d.target) : '–'}
                          className={`flex-1 bg-zinc-900 border rounded-lg px-2 py-1.5 text-sm placeholder:text-zinc-500 ${
                            timing?.exerciseId === item.ex
                              ? 'border-amber-500/60 text-amber-200'
                              : 'border-zinc-700 text-zinc-100'
                          }`}
                        />
                        {/* Inline play/stop only on seconds-based exercises */}
                        {d.type === 'hold' && (
                          <button
                            onClick={() => toggleExerciseTimer(item.ex)}
                            className={`w-8 h-8 rounded flex items-center justify-center text-sm ${
                              timing?.exerciseId === item.ex
                                ? 'text-amber-300 bg-amber-500/20'
                                : 'text-zinc-300 bg-zinc-700 hover:bg-zinc-600'
                            }`}
                            aria-label={timing?.exerciseId === item.ex ? 'Stop hold timer' : 'Start hold timer'}
                            type="button"
                          >
                            {timing?.exerciseId === item.ex ? '■' : '▶'}
                          </button>
                        )}
                        <span className="text-xs text-zinc-500 min-w-[28px]">{unit}</span>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
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
