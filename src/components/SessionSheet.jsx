import Sheet from './Sheet.jsx';
import ExerciseSheet from './ExerciseSheet.jsx';
import WarmupSheet from './WarmupSheet.jsx';
import { getExercise } from '../data/exercises.js';
import { SESSION_META } from '../data/program.js';
import { WARMUP_ROUTINES, isWarmup } from '../data/warmups.js';
import { useStore } from '../store.jsx';
import { weekId } from '../utils/dates.js';
import { useMemo, useState } from 'react';

const TODAY = () => new Date().toISOString().slice(0, 10);

// Detail view for a session card. Lists prescribed exercises plus any
// custom exercises the user has added for this session type. Exercises
// the user has logged today (FROM THIS SESSION) get a green check + count.
//
// Crucially: today-counts filter by sessionType so a push-up logged in
// the Push session doesn't show up as "already done" on Density.
export default function SessionSheet({ open, onClose, sessionType, phase }) {
  const { actions, meData } = useStore();
  const [exerciseOpen, setExerciseOpen] = useState(null); // {id, prescription} | null
  const [warmupOpen, setWarmupOpen]   = useState(null);   // warmup id | null
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState('');

  // Hooks must always run on every render — compute these unconditionally,
  // then short-circuit the return.
  const today = TODAY();

  const todayCounts = useMemo(() => {
    const m = {};
    for (const l of meData?.logs || []) {
      if (l.date !== today) continue;
      // Scope to this session's logs only. Old logs without sessionType
      // (l.sessionType undefined) won't match — that's fine, they predate
      // this fix and shouldn't auto-tick anything.
      if (l.sessionType !== sessionType) continue;
      m[l.exerciseId] = (m[l.exerciseId] || 0) + 1;
    }
    return m;
  }, [meData?.logs, today, sessionType]);

  const customItems = useMemo(() => {
    if (!sessionType) return [];
    const entries = Object.entries(meData?.customExercises || {});
    return entries
      .filter(([, c]) => c.sessionType === sessionType && !c.hidden)
      .map(([id, c]) => ({ id, name: c.name }));
  }, [meData?.customExercises, sessionType]);

  if (!sessionType || !phase) return null;
  const session = phase.sessions[sessionType];
  if (!session) return null;

  const wid = weekId();
  const isDone = !!meData?.weeks?.[wid]?.[sessionType];
  const meta = SESSION_META[sessionType];

  const submitCustom = () => {
    const name = newName.trim();
    if (!name) { setAdding(false); return; }
    const id = actions.addCustomExercise(sessionType, name);
    setNewName('');
    setAdding(false);
    setExerciseOpen({ id, prescription: null });
  };

  // Count of warmup sub-movements logged today, used to show progress on
  // the warmup row at the session level.
  const warmupSubCount = (warmupId) => {
    const r = WARMUP_ROUTINES[warmupId];
    if (!r) return 0;
    return r.items.filter((it) => (todayCounts[it.ex] || 0) > 0).length;
  };

  return (
    <>
      <Sheet open={open} onClose={onClose} title={`${sessionType} — Phase ${phase.id}`} fullHeight>
        <div className="px-5 py-4 space-y-4">
          {/* Status banner when already complete — clarifies the user can keep adding */}
          {isDone && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-3 py-2 text-sm text-emerald-300 flex items-start gap-2">
              <span className="text-emerald-400 leading-none">✓</span>
              <span>
                <span className="font-medium">Session complete.</span>{' '}
                Tap any exercise to log additional sets — it stays marked complete.
              </span>
            </div>
          )}

          <div>
            <div className="text-xs uppercase tracking-wide text-zinc-500">Focus</div>
            <p className="text-sm text-zinc-300 mt-1">{meta?.focus}</p>
          </div>

          {/* Density: explain Heria-style format */}
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

          <div className="space-y-2">
            {session.items.map((item, i) => {
              if (isWarmup(item.ex)) {
                const w = WARMUP_ROUTINES[item.ex];
                const total = w.items.length;
                const done = warmupSubCount(item.ex);
                const allDone = done >= total;
                return (
                  <Row
                    key={i}
                    badge={allDone ? '✓' : '◐'}
                    badgeStyle={
                      allDone
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : 'bg-amber-500/20 text-amber-300'
                    }
                    title={w.name}
                    sub={`${item.dose} · ${total} movements`}
                    countLabel={allDone ? 'all' : (done > 0 ? `${done}/${total}` : null)}
                    onClick={() => setWarmupOpen(item.ex)}
                  />
                );
              }
              const ex = getExercise(item.ex);
              const count = todayCounts[item.ex] || 0;
              return (
                <Row
                  key={i}
                  badge={item.skill ? '★' : i + 1}
                  badgeStyle={item.skill ? 'bg-emerald-500/20 text-emerald-300' : 'bg-zinc-700 text-zinc-300'}
                  title={ex.name}
                  sub={item.dose}
                  countLabel={count > 0 ? `${count}×` : null}
                  onClick={() => setExerciseOpen({ id: item.ex, prescription: item.dose })}
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
                  countLabel={count > 0 ? `${count}×` : null}
                  onClick={() => setExerciseOpen({ id: c.id, prescription: null })}
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
                <button onClick={submitCustom} className="px-3 py-2 rounded-lg bg-emerald-500 text-zinc-950 text-sm font-bold">Add</button>
                <button onClick={() => { setAdding(false); setNewName(''); }} className="px-3 py-2 rounded-lg bg-zinc-800 text-zinc-300 text-sm">Cancel</button>
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

          {/* Bottom action area: */}
          {/* - Not complete: big "Mark session complete" button */}
          {/* - Already complete: "Done" closes the sheet (keeps it complete), */}
          {/*   small secondary "Undo complete" link below */}
          {!isDone ? (
            <button
              onClick={() => { actions.toggleSession(wid, sessionType); onClose(); }}
              className="w-full font-bold rounded-2xl py-4 text-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 transition"
            >
              Mark session complete
            </button>
          ) : (
            <div className="space-y-2">
              <button
                onClick={onClose}
                className="w-full font-bold rounded-2xl py-4 text-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-100 transition"
              >
                Done
              </button>
              <button
                onClick={() => { actions.toggleSession(wid, sessionType); }}
                className="w-full text-xs text-zinc-500 hover:text-rose-400 py-1"
              >
                Undo complete
              </button>
            </div>
          )}
        </div>
      </Sheet>

      <ExerciseSheet
        open={!!exerciseOpen}
        exerciseId={exerciseOpen?.id}
        prescription={exerciseOpen?.prescription}
        sessionType={sessionType}
        // When the session is already marked complete, the user is just
        // adding a forgotten exercise — close back to the session sheet
        // after logging instead of leaving them on the exercise screen.
        closeOnLog={isDone}
        onClose={() => setExerciseOpen(null)}
      />

      <WarmupSheet
        open={!!warmupOpen}
        warmupId={warmupOpen}
        sessionType={sessionType}
        onClose={() => setWarmupOpen(null)}
      />
    </>
  );
}

// Single row in the session list. Optional `countLabel` shows green pill on right.
function Row({ badge, badgeStyle, title, sub, countLabel, onClick, onRemove }) {
  const highlight = !!countLabel;
  return (
    <div className={`relative bg-zinc-800/50 hover:bg-zinc-800 border rounded-xl transition ${highlight ? 'border-emerald-500/40' : 'border-zinc-800'}`}>
      <button onClick={onClick} className="w-full text-left p-3 flex items-start gap-3 active:scale-[0.99]">
        <span className={`mt-0.5 inline-flex w-6 h-6 rounded-full text-[11px] items-center justify-center flex-shrink-0 ${badgeStyle}`}>
          {badge}
        </span>
        <div className="flex-1 min-w-0">
          <div className="font-medium text-zinc-100 truncate">{title}</div>
          <div className="text-xs text-zinc-400 mt-0.5">{sub}</div>
        </div>
        {countLabel ? (
          <span className="flex items-center gap-1 text-xs text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 rounded-full px-2 py-0.5 flex-shrink-0">
            <span className="text-emerald-400">✓</span>
            <span className="tabular-nums">{countLabel}</span>
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
