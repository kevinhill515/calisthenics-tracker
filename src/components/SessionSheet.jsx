import Sheet from './Sheet.jsx';
import ExerciseSheet from './ExerciseSheet.jsx';
import { getExercise } from '../data/exercises.js';
import { SESSION_META } from '../data/program.js';
import { useStore } from '../store.jsx';
import { weekId } from '../utils/dates.js';
import { useState } from 'react';

// Detail view for a session card. Lists prescribed exercises with the
// program's prescription, and a tap-to-mark-complete primary action.
export default function SessionSheet({ open, onClose, sessionType, phase }) {
  const { actions, meData } = useStore();
  const [exerciseOpen, setExerciseOpen] = useState(null);

  if (!sessionType || !phase) return null;
  const session = phase.sessions[sessionType];
  if (!session) return null;

  const wid = weekId();
  const isDone = !!meData?.weeks?.[wid]?.[sessionType];
  const meta = SESSION_META[sessionType];

  return (
    <>
      <Sheet open={open} onClose={onClose} title={`${sessionType} — Phase ${phase.id}`} fullHeight>
        <div className="px-5 py-4 space-y-4">
          <div>
            <div className="text-xs uppercase tracking-wide text-zinc-500">Focus</div>
            <p className="text-sm text-zinc-300 mt-1">{meta?.focus}</p>
          </div>

          {session.note && (
            <div className="text-xs bg-amber-500/10 border border-amber-500/20 text-amber-300 rounded-lg px-3 py-2">
              {session.note}
            </div>
          )}

          <div className="space-y-2">
            {session.items.map((item, i) => {
              const ex = getExercise(item.ex);
              return (
                <button
                  key={i}
                  onClick={() => setExerciseOpen(item.ex)}
                  className="w-full text-left bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-800 rounded-xl p-3 flex items-start gap-3 transition active:scale-[0.99]"
                >
                  <span className={`mt-0.5 inline-flex w-6 h-6 rounded-full text-[11px] items-center justify-center ${item.skill ? 'bg-emerald-500/20 text-emerald-300' : 'bg-zinc-700 text-zinc-300'}`}>
                    {item.skill ? '★' : i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-zinc-100 truncate">{ex.name}</div>
                    <div className="text-xs text-zinc-400 mt-0.5">{item.dose}</div>
                  </div>
                  <span className="text-zinc-500">›</span>
                </button>
              );
            })}
          </div>

          <button
            onClick={() => { actions.toggleSession(wid, sessionType); onClose(); }}
            className={`w-full font-bold rounded-2xl py-4 text-lg transition ${
              isDone
                ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                : 'bg-emerald-500 hover:bg-emerald-400 text-zinc-950'
            }`}
          >
            {isDone ? 'Mark incomplete' : 'Mark session complete'}
          </button>
        </div>
      </Sheet>

      <ExerciseSheet
        open={!!exerciseOpen}
        exerciseId={exerciseOpen}
        onClose={() => setExerciseOpen(null)}
      />
    </>
  );
}
