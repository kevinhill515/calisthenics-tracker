import { useStore } from '../store.jsx';
import { SKILL_LADDERS } from '../data/skillLadders.js';
import { useState } from 'react';
import ExerciseSheet from './ExerciseSheet.jsx';
import { LineChart, Line, ResponsiveContainer, YAxis } from 'recharts';

const COLOR_BAR = {
  rose:    'bg-rose-400',
  sky:     'bg-sky-400',
  amber:   'bg-amber-400',
  emerald: 'bg-emerald-400',
  violet:  'bg-violet-400',
  orange:  'bg-orange-400',
  fuchsia: 'bg-fuchsia-400',
  cyan:    'bg-cyan-400',
  lime:    'bg-lime-400',
};
const COLOR_TEXT = {
  rose:    '#fb7185',
  sky:     '#38bdf8',
  amber:   '#fbbf24',
  emerald: '#34d399',
  violet:  '#a78bfa',
  orange:  '#fb923c',
  fuchsia: '#e879f9',
  cyan:    '#22d3ee',
  lime:    '#a3e635',
};

export default function SkillsView() {
  const { meData, actions } = useStore();
  const [openExercise, setOpenExercise] = useState(null);
  if (!meData) return null;

  return (
    <div className="px-4 pt-3 pb-24 max-w-xl mx-auto fade-in">
      <h1 className="text-xl font-bold text-zinc-100 mb-1">Skill ladders</h1>
      <p className="text-xs text-zinc-500 mb-4">Tap a rung to set your current level. Tap the title to view how-to.</p>

      <div className="space-y-3">
        {SKILL_LADDERS.map((ladder) => {
          const current = meData.ladders?.[ladder.id] ?? 0;
          const pct = (current / (ladder.rungs.length - 1)) * 100;
          // sparkline: best PR per rung over time, oldest → newest, for current rung exercise
          const currentRung = ladder.rungs[current];
          const series = bestSeries(meData.logs || [], currentRung.id, currentRung.unit || ladder.unit);

          return (
            <div key={ladder.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-2">
                <h2 className="font-semibold text-zinc-100">{ladder.name}</h2>
                <span className="text-xs text-zinc-500">{current + 1}/{ladder.rungs.length}</span>
              </div>

              <div className="h-1.5 rounded-full bg-zinc-800 overflow-hidden mb-3">
                <div className={`h-full ${COLOR_BAR[ladder.color]}`} style={{ width: `${pct}%` }} />
              </div>

              <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1 -mx-1 px-1">
                {ladder.rungs.map((r, i) => {
                  const active = i === current;
                  const passed = i < current;
                  return (
                    <button
                      key={r.id}
                      onClick={() => actions.setLadderRung(ladder.id, i)}
                      onDoubleClick={() => setOpenExercise(r.id)}
                      className={`flex-shrink-0 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition ${
                        active
                          ? 'bg-zinc-100 text-zinc-950 border-zinc-100'
                          : passed
                          ? 'bg-zinc-800 text-zinc-400 border-zinc-800'
                          : 'bg-transparent text-zinc-500 border-zinc-800 hover:border-zinc-700'
                      }`}
                    >
                      {i + 1}. {r.label}
                    </button>
                  );
                })}
              </div>

              <div className="mt-3 flex items-center gap-3">
                <button
                  onClick={() => setOpenExercise(currentRung.id)}
                  className="text-xs text-zinc-300 hover:text-emerald-400 underline-offset-2 hover:underline"
                >
                  {currentRung.label} · target {currentRung.target}{(currentRung.unit || ladder.unit) === 'sec' ? 's' : ' reps'}
                </button>
                {series.length > 1 && (
                  <div className="flex-1 h-8">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={series} margin={{ top: 2, right: 2, bottom: 2, left: 2 }}>
                        <YAxis hide domain={['dataMin', 'dataMax']} />
                        <Line type="monotone" dataKey="v" stroke={COLOR_TEXT[ladder.color]} strokeWidth={2} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <ExerciseSheet
        open={!!openExercise}
        exerciseId={openExercise}
        onClose={() => setOpenExercise(null)}
      />
    </div>
  );
}

// Returns [{v}] sparkline series for the best (max) value of `field`
// per logged date, oldest → newest. For unit==='sec' uses hold; reps otherwise.
function bestSeries(logs, exerciseId, unit) {
  const byDate = new Map();
  for (const l of logs) {
    if (l.exerciseId !== exerciseId) continue;
    const v = unit === 'sec' ? l.hold : l.reps;
    if (v == null) continue;
    const cur = byDate.get(l.date) || 0;
    if (v > cur) byDate.set(l.date, v);
  }
  return [...byDate.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([_, v]) => ({ v }));
}
