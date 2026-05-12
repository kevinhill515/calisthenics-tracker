import { useStore } from '../store.jsx';
import { useState } from 'react';
import CardioBaselineSheet from './CardioBaselineSheet.jsx';
import { formatValue, bestEntry, TYPES, TYPE_LABELS } from '../utils/cardio.js';

const BUILTIN_ORDER = ['mile', '2mile', 'jumprope'];

export default function CardioView() {
  const { meData } = useStore();
  const [openId, setOpenId] = useState(null);
  const [adding, setAdding] = useState(false);

  if (!meData) return null;
  const baselines = meData.cardio?.baselines || {};
  const ids = orderIds(baselines);

  return (
    <div className="px-4 pt-3 pb-24 max-w-xl mx-auto fade-in">
      <h1 className="text-xl font-bold text-zinc-100 mb-1">Cardio baselines</h1>
      <p className="text-xs text-zinc-500 mb-4">
        Test at the start of each phase. Lower = better for time-based tests; higher = better for everything else.
      </p>

      <ul className="space-y-2">
        {ids.map((id) => {
          const bl = baselines[id];
          const best = bestEntry(bl.entries, bl.type);
          return (
            <li key={id}>
              <button
                onClick={() => setOpenId(id)}
                className="w-full text-left bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-2xl p-4 flex items-center gap-3"
              >
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-zinc-100">{bl.name}</div>
                  <div className="text-[11px] text-zinc-500 mt-0.5">
                    {best ? `Best · ${best.date}` : 'No attempts yet — tap to log one'}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold tabular-nums text-zinc-100">
                    {formatValue(best?.value, bl.type)}
                  </div>
                  <div className="text-[10px] uppercase tracking-wide text-zinc-500">
                    {labelFor(bl.type)}
                  </div>
                </div>
              </button>
            </li>
          );
        })}
      </ul>

      {adding ? (
        <AddBaselineForm onCancel={() => setAdding(false)} onDone={() => setAdding(false)} />
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="w-full mt-3 text-sm text-zinc-400 hover:text-zinc-100 border border-dashed border-zinc-700 hover:border-zinc-500 rounded-xl py-3"
        >
          + Add baseline test
        </button>
      )}

      <CardioBaselineSheet
        baselineId={openId}
        open={!!openId}
        onClose={() => setOpenId(null)}
      />
    </div>
  );
}

// Order: built-ins first (mile, 2mile, jumprope), then user-added by name.
function orderIds(baselines) {
  const builtins = BUILTIN_ORDER.filter((id) => baselines[id]);
  const customs = Object.keys(baselines)
    .filter((id) => !BUILTIN_ORDER.includes(id))
    .sort((a, b) => (baselines[a].name || '').localeCompare(baselines[b].name || ''));
  return [...builtins, ...customs];
}

function labelFor(type) {
  if (type === 'time')     return 'time';
  if (type === 'duration') return 'duration';
  if (type === 'distance') return 'mi';
  return 'reps';
}

function AddBaselineForm({ onCancel, onDone }) {
  const { actions } = useStore();
  const [name, setName] = useState('');
  const [type, setType] = useState('time');
  const [target, setTarget] = useState('');

  const submit = () => {
    if (!name.trim()) return;
    actions.addCardioBaseline({
      name: name.trim(),
      type,
      target: target ? parseFloat(target) : undefined,
    });
    onDone();
  };

  return (
    <div className="mt-3 bg-zinc-900 border border-zinc-700 rounded-2xl p-3 space-y-2">
      <input
        autoFocus
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Test name (e.g. 5K, Plank max)"
        className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500"
      />
      <div>
        <div className="text-[10px] uppercase tracking-wide text-zinc-500 mb-1">Type</div>
        <div className="grid grid-cols-2 gap-1.5">
          {TYPES.map((t) => (
            <button
              key={t}
              onClick={() => setType(t)}
              className={`text-xs py-1.5 rounded-lg border ${
                type === t
                  ? 'bg-zinc-100 text-zinc-950 border-zinc-100'
                  : 'bg-zinc-800 border-zinc-700 text-zinc-300'
              }`}
            >
              {TYPE_LABELS[t]}
            </button>
          ))}
        </div>
      </div>
      <div className="flex gap-2 pt-1">
        <button
          onClick={onCancel}
          className="flex-1 px-3 py-2 rounded-lg bg-zinc-800 text-zinc-300 text-sm"
        >Cancel</button>
        <button
          onClick={submit}
          disabled={!name.trim()}
          className="flex-1 px-3 py-2 rounded-lg bg-emerald-500 disabled:bg-zinc-700 disabled:text-zinc-500 text-zinc-950 font-bold text-sm"
        >Add</button>
      </div>
    </div>
  );
}
