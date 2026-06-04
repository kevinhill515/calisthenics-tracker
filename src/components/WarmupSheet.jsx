import Sheet from './Sheet.jsx';
import ExerciseSheet from './ExerciseSheet.jsx';
import { WARMUP_ROUTINES } from '../data/warmups.js';
import { getExercise } from '../data/exercises.js';
import { useStore } from '../store.jsx';
import { useMemo, useState } from 'react';
import { today } from '../utils/dates.js';

const TODAY = today;

// Sheet for a warmup routine (e.g. "Wrist + shoulder prep"). Lists each
// movement with its cue and prescription. Tap any movement to open the
// regular ExerciseSheet for that movement and log sets/reps/seconds.
export default function WarmupSheet({ open, onClose, warmupId, sessionType }) {
  const { meData } = useStore();
  const [openMove, setOpenMove] = useState(null);

  // Hooks must always run on every render — compute these unconditionally,
  // and short-circuit the return after.
  const today = TODAY();
  const todayCounts = useMemo(() => {
    const m = {};
    for (const l of meData?.logs || []) {
      if (l.date !== today) continue;
      // Allow legacy logs (no sessionType) to show in any warmup, same
      // as SessionSheet's logic.
      if (l.sessionType && l.sessionType !== sessionType) continue;
      m[l.exerciseId] = (m[l.exerciseId] || 0) + 1;
    }
    return m;
  }, [meData?.logs, today, sessionType]);

  const w = WARMUP_ROUTINES[warmupId];
  if (!open || !w) return null;

  return (
    <>
      <Sheet open={open} onClose={onClose} title={w.name} fullHeight>
        <div className="px-5 py-4 space-y-4">
          <div className="text-xs uppercase tracking-wide text-zinc-500">
            {w.duration} · run before every {sessionType} session
          </div>

          {w.why && (
            <div className="text-sm text-zinc-300 bg-amber-500/10 border border-amber-500/20 rounded-xl px-3 py-2">
              <span className="text-amber-300 font-medium">Why: </span>
              {w.why}
            </div>
          )}

          <div className="text-[11px] text-zinc-500">
            Tap any movement to log sets, reps, or hold time for it.
          </div>

          <ul className="space-y-2">
            {w.items.map((it, i) => {
              const ex = getExercise(it.ex);
              const count = todayCounts[it.ex] || 0;
              return (
                <li key={i}>
                  <button
                    onClick={() => setOpenMove(it.ex)}
                    className={`w-full text-left bg-zinc-800/50 hover:bg-zinc-800 border rounded-xl p-3 transition active:scale-[0.99] ${
                      count > 0 ? 'border-emerald-500/40' : 'border-zinc-800'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="mt-0.5 inline-flex w-6 h-6 rounded-full bg-zinc-700 text-zinc-300 text-[11px] items-center justify-center flex-shrink-0">
                        {i + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline justify-between gap-2 mb-0.5">
                          <div className="font-medium text-zinc-100">{ex.name}</div>
                          <div className="text-[11px] text-emerald-300 tabular-nums flex-shrink-0">
                            {it.dose}
                          </div>
                        </div>
                        <p className="text-xs text-zinc-400 leading-relaxed">{ex.cue}</p>
                      </div>
                      {count > 0 && (
                        <span className="flex items-center gap-1 text-xs text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 rounded-full px-2 py-0.5 flex-shrink-0">
                          <span className="text-emerald-400">✓</span>
                          <span className="tabular-nums">{count}×</span>
                        </span>
                      )}
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </Sheet>

      <ExerciseSheet
        open={!!openMove}
        exerciseId={openMove}
        prescription={openMove ? w.items.find((it) => it.ex === openMove)?.dose : null}
        sessionType={sessionType}
        onClose={() => setOpenMove(null)}
      />
    </>
  );
}
