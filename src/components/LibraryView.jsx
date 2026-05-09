import { useState, useMemo } from 'react';
import { EXERCISES } from '../data/exercises.js';
import ExerciseSheet from './ExerciseSheet.jsx';

export default function LibraryView() {
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(null);

  const items = useMemo(() => {
    const all = Object.entries(EXERCISES).map(([id, ex]) => ({ id, ...ex }));
    const needle = q.trim().toLowerCase();
    if (!needle) return all.sort((a, b) => a.name.localeCompare(b.name));
    return all
      .filter((e) => e.name.toLowerCase().includes(needle) || (e.cue || '').toLowerCase().includes(needle))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [q]);

  return (
    <div className="px-4 pt-3 pb-24 max-w-xl mx-auto fade-in">
      <h1 className="text-xl font-bold text-zinc-100 mb-1">Exercise library</h1>
      <p className="text-xs text-zinc-500 mb-3">Tap any exercise for a how-to and YouTube tutorials.</p>

      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search… (e.g. tuck planche)"
        className="w-full bg-zinc-900 border border-zinc-800 focus:border-emerald-500/40 rounded-xl px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-500 mb-3 outline-none"
      />

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
        <ul>
          {items.map((e) => (
            <li key={e.id}>
              <button
                onClick={() => setOpen(e.id)}
                className="w-full text-left px-4 py-3 hover:bg-zinc-800/40 border-t border-zinc-800/50 first:border-t-0"
              >
                <div className="text-sm font-medium text-zinc-100">{e.name}</div>
                {e.cue && <div className="text-[11px] text-zinc-500 line-clamp-2 mt-0.5">{e.cue}</div>}
              </button>
            </li>
          ))}
          {items.length === 0 && (
            <li className="px-4 py-8 text-center text-sm text-zinc-500">No matches.</li>
          )}
        </ul>
      </div>

      <ExerciseSheet open={!!open} exerciseId={open} onClose={() => setOpen(null)} />
    </div>
  );
}
