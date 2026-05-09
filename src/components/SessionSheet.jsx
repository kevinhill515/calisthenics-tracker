import Sheet from './Sheet.jsx';
import ExerciseSheet from './ExerciseSheet.jsx';
import { getExercise } from '../data/exercises.js';
import { SESSION_META } from '../data/program.js';
import { useStore } from '../store.jsx';
import { weekId } from '../utils/dates.js';
import { useMemo, useState } from 'react';

const TODAY = () => new Date().toISOString().slice(0, 10);

// Detail view for a session card. Lists prescribed exercises plus any
// custom exercises the user has added for this session type. Exercises
// the user has logged today get a green check + set count.
export default function SessionSheet({ open, onClose, sessionType, phase }) {
  const { actions, meData } = useStore();
  const [exerciseOpen, setExerciseOpen] = useState(null);
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState('');

  if (!sessionType || !phase) return null;
  const session = phase.sessions[sessionType];
  if (!session) return null;

  const wid = weekId();
  const today = TODAY();
  const isDone = !!meData?.weeks?.[wid]?.[sessionType];
  const meta = SESSION_META[sessionType];

  // Quick lookup: how many sets did I log for each exercise today?
  const todayCounts = useMemo(() => {
    const m = {};
    for (const l of meData?.logs || []) {
      if (l.date !== today) continue;
      m[l.exerciseId] = (m[l.exerciseId] || 0) + 1;
    }
    return m;
  }, [meData?.logs, today]);

  // Custom exercises for this session type, in insertion order, hidden filtered out.
  const customItems = useMemo(() => {
    const entries = Object.entries(meData?.customExercises || {});
    return entries
      .filter(([, c]) => c.sessionType === sessionType && !c.hidden)
      .map(([id, c]) => ({ id, name: c.name }));
  }, [meData?.customExercises, sessionType]);

  const submitCustom = () => {
    const name = newName.trim();
    if (!name) { setAdding(false); return; }
    const id = actions.addCustomExercise(sessionType, name);
    setNewName('');
    setAdding(false);
    setExerciseOpen(id);
  };

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
              const count = todayCounts[item.ex] || 0;
              return (
                <Row
                  key={i}
                  badge={item.skill ? '★' : i + 1}
                  badgeStyle={item.skill ? 'bg-emerald-500/20 text-emerald-300' : 'bg-zinc-700 text-zinc-300'}
                  title={ex.name}
                  sub={item.dose}
                  count={count}
                  onClick={() => setExerciseOpen(item.ex)}
                />
              );
            })}

            {customItems.length > 0 && (
              <div className="text-[11px] uppercase tracking-wide text-zinc-500 mt-4 mb-1 px-1">
                Custom
              </div>
            )}
            {customItems.map((c) => {
              const count = todayCounts[c.id] || 0;
              return (
                <Row
                  key={c.id}
                  badge="+"
                  badgeStyle="bg-zinc-700 text-zinc-400"
                  title={c.name}
                  sub="Custom exercise"
                  count={count}
                  onClick={() => setExerciseOpen(c.id)}
                  onRemove={() => actions.hideCustomExercise(c.id)}
                />
              );
            })}

            {adding ? (
              <div className="bg-zinc-800/60 border border-zinc-700 rounded-xl p-2 flex gap-2">
                <input
                  autoFocus
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') submitCustom();
                    if (e.key === 'Escape') { setAdding(false); setNewName(''); }
                  }}
                  placeholder="Exercise name…"
                  className="flex-1 bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500"
                />
                <button
                  onClick={submitCustom}
                  className="px-3 py-2 rounded-lg bg-emerald-500 text-zinc-950 text-sm font-bold"
                >Add</button>
                <button
                  onClick={() => { setAdding(false); setNewName(''); }}
                  className="px-3 py-2 rounded-lg bg-zinc-800 text-zinc-300 text-sm"
                >Cancel</button>
              </div>
            ) : (
              <button
                onClick={() => setAdding(true)}
                className="w-full mt-2 text-sm text-zinc-400 hover:text-zinc-100 border border-dashed border-zinc-700 hover:border-zinc-500 rounded-xl py-2.5"
              >
                + Add custom exercise
              </button>
            )}
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

// Single exercise row in the session list. Shows a green check + set count
// when the user has logged anything for it today.
function Row({ badge, badgeStyle, title, sub, count, onClick, onRemove }) {
  return (
    <div className={`relative bg-zinc-800/50 hover:bg-zinc-800 border rounded-xl transition ${count > 0 ? 'border-emerald-500/40' : 'border-zinc-800'}`}>
      <button
        onClick={onClick}
        className="w-full text-left p-3 flex items-start gap-3 active:scale-[0.99]"
      >
        <span className={`mt-0.5 inline-flex w-6 h-6 rounded-full text-[11px] items-center justify-center flex-shrink-0 ${badgeStyle}`}>
          {badge}
        </span>
        <div className="flex-1 min-w-0">
          <div className="font-medium text-zinc-100 truncate">{title}</div>
          <div className="text-xs text-zinc-400 mt-0.5">{sub}</div>
        </div>
        {count > 0 ? (
          <span className="flex items-center gap-1 text-xs text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 rounded-full px-2 py-0.5 flex-shrink-0">
            <span className="text-emerald-400">✓</span>
            <span className="tabular-nums">{count}×</span>
          </span>
        ) : (
          <span className="text-zinc-500">›</span>
        )}
      </button>
      {onRemove && (
        <button
          onClick={(e) => { e.stopPropagation(); onRemove(); }}
          className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full text-zinc-600 hover:text-rose-400 hover:bg-zinc-900 flex items-center justify-center text-xs"
          aria-label="Remove from session"
        >×</button>
      )}
    </div>
  );
}
