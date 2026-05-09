import { useStore } from '../store.jsx';
import { SKILL_LADDERS } from '../data/skillLadders.js';
import { getExercise } from '../data/exercises.js';
import ExerciseSheet from './ExerciseSheet.jsx';
import { useMemo, useState } from 'react';

// PR table — best hold and best reps for every rung in every ladder.
export default function PRsView() {
  const { meData } = useStore();
  const [open, setOpen] = useState(null);

  const rows = useMemo(() => {
    if (!meData) return [];
    const out = [];
    for (const ladder of SKILL_LADDERS) {
      for (const r of ladder.rungs) {
        const logs = meData.logs.filter((l) => l.exerciseId === r.id);
        const bestHold = max(logs.map((l) => l.hold));
        const bestReps = max(logs.map((l) => l.reps));
        const lastDate = logs.length ? logs.map((l) => l.date).sort().slice(-1)[0] : null;
        out.push({
          ladder: ladder.name,
          ladderColor: ladder.color,
          ex: r,
          bestHold, bestReps, lastDate,
          unit: r.unit || ladder.unit,
        });
      }
    }
    return out;
  }, [meData]);

  if (!meData) return null;

  return (
    <div className="px-4 pt-3 pb-24 max-w-xl mx-auto fade-in">
      <h1 className="text-xl font-bold text-zinc-100 mb-1">Personal records</h1>
      <p className="text-xs text-zinc-500 mb-4">Best you've ever logged for each progression. Tap to log a new attempt.</p>

      <div className="space-y-3">
        {Object.entries(groupByLadder(rows)).map(([ladderName, items]) => (
          <div key={ladderName} className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
            <div className="px-4 py-2 border-b border-zinc-800 text-xs uppercase tracking-wide text-zinc-400">
              {ladderName}
            </div>
            <ul>
              {items.map((row) => {
                const target = row.ex.target;
                const best = row.unit === 'sec' ? row.bestHold : row.bestReps;
                const hit = best != null && best >= target;
                return (
                  <li key={row.ex.id}>
                    <button
                      onClick={() => setOpen(row.ex.id)}
                      className="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-zinc-800/40 border-t border-zinc-800/50 first:border-t-0"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-zinc-100 truncate">{row.ex.label}</div>
                        <div className="text-[11px] text-zinc-500 mt-0.5">
                          target {target}{row.unit === 'sec' ? 's' : ' reps'}
                          {row.lastDate && <> · last {row.lastDate}</>}
                        </div>
                      </div>
                      <div className={`text-sm font-bold tabular-nums ${hit ? 'text-emerald-400' : 'text-zinc-300'}`}>
                        {best != null ? `${best}${row.unit === 'sec' ? 's' : ''}` : '—'}
                      </div>
                      {hit && <span className="text-emerald-400 text-xs">✓</span>}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      <ExerciseSheet open={!!open} exerciseId={open} onClose={() => setOpen(null)} />
    </div>
  );
}

function groupByLadder(rows) {
  return rows.reduce((acc, r) => {
    (acc[r.ladder] ||= []).push(r);
    return acc;
  }, {});
}

function max(arr) {
  let m = null;
  for (const v of arr) if (v != null && (m == null || v > m)) m = v;
  return m;
}
