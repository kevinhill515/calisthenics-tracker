import Sheet from './Sheet.jsx';
import { useStore } from '../store.jsx';
import { useState } from 'react';
import { parseInputForType, formatValue, bestEntry, isLowerBetter, TYPE_LABELS } from '../utils/cardio.js';
import { today as TODAY } from '../utils/dates.js';
import { LineChart, Line, ResponsiveContainer, YAxis } from 'recharts';

// One-baseline sheet: log a new attempt, see history, sparkline.
export default function CardioBaselineSheet({ baselineId, open, onClose }) {
  const { meData, actions } = useStore();
  const bl = meData?.cardio?.baselines?.[baselineId];

  const [value, setValue] = useState('');
  const [date,  setDate]  = useState(TODAY());
  const [notes, setNotes] = useState('');

  if (!open || !bl) return null;

  const entries = bl.entries || [];
  const best = bestEntry(entries, bl.type);
  const sortedByDate = [...entries].sort((a, b) => a.date.localeCompare(b.date));
  const sparkline = sortedByDate.map((e) => ({ v: e.value }));

  const log = () => {
    const parsed = parseInputForType(value, bl.type);
    if (parsed == null) return;
    actions.logCardioEntry(baselineId, {
      date,
      value: parsed,
      notes: notes.trim() || undefined,
    });
    setValue(''); setNotes(''); setDate(TODAY());
  };

  const placeholder =
    bl.type === 'time' || bl.type === 'duration' ? '6:42 or 402' :
    bl.type === 'distance' ? '3.10' :
    '120';

  const isCustom = !['mile', '2mile', 'jumprope'].includes(baselineId);

  return (
    <Sheet open={open} onClose={onClose} title={bl.name} fullHeight>
      <div className="px-5 py-4 space-y-5">
        {/* Best & sparkline */}
        <div className="bg-zinc-800/50 border border-zinc-800 rounded-2xl p-4 flex items-center gap-4">
          <div className="flex-1">
            <div className="text-[10px] uppercase tracking-wide text-zinc-500">{TYPE_LABELS[bl.type]}</div>
            <div className="text-2xl font-bold text-zinc-100 mt-0.5 tabular-nums">
              {formatValue(best?.value, bl.type)}
            </div>
            <div className="text-[11px] text-zinc-500 mt-0.5">
              {best?.date ? `Best · ${best.date}` : 'No attempts yet'}
            </div>
          </div>
          {sparkline.length > 1 && (
            <div className="w-24 h-12">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={sparkline} margin={{ top: 2, right: 2, bottom: 2, left: 2 }}>
                  <YAxis hide
                    domain={['dataMin', 'dataMax']}
                    // For "lower is better" tests, invert visually so up = improvement.
                    reversed={isLowerBetter(bl.type)}
                  />
                  <Line type="monotone" dataKey="v" stroke="#34d399" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Log new attempt */}
        <div>
          <div className="text-xs uppercase tracking-wide text-zinc-500 mb-2">Log attempt</div>
          <div className="grid grid-cols-2 gap-2">
            <label className="block">
              <span className="text-[10px] uppercase tracking-wide text-zinc-500">Value</span>
              <input
                type="text"
                inputMode={bl.type === 'time' || bl.type === 'duration' ? 'text' : 'decimal'}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={placeholder}
                className="mt-1 w-full bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-2 text-sm text-zinc-100 placeholder:text-zinc-500"
              />
            </label>
            <label className="block">
              <span className="text-[10px] uppercase tracking-wide text-zinc-500">Date</span>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="mt-1 w-full bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-2 text-sm text-zinc-100"
              />
            </label>
          </div>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Notes (optional — conditions, how it felt, etc.)"
            rows={2}
            className="mt-2 w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500"
          />
          <button
            onClick={log}
            disabled={parseInputForType(value, bl.type) == null}
            className="mt-3 w-full bg-emerald-500 hover:bg-emerald-400 disabled:bg-zinc-700 disabled:text-zinc-500 text-zinc-950 font-bold rounded-xl py-3"
          >
            Save attempt
          </button>
        </div>

        {/* History */}
        {entries.length > 0 && (
          <div>
            <div className="text-xs uppercase tracking-wide text-zinc-500 mb-2">History</div>
            <ul className="space-y-1">
              {[...entries].reverse().map((e, i) => {
                const origIndex = entries.length - 1 - i;
                const isBest = best && e.date === best.date && e.value === best.value;
                return (
                  <li key={origIndex} className={`flex items-center justify-between rounded-lg px-3 py-2 text-xs ${isBest ? 'bg-emerald-500/10 border border-emerald-500/30' : 'bg-zinc-800/40'}`}>
                    <span className={isBest ? 'text-emerald-300' : 'text-zinc-400'}>{e.date}</span>
                    <span className={`tabular-nums ${isBest ? 'text-emerald-300 font-bold' : 'text-zinc-200'}`}>
                      {formatValue(e.value, bl.type)}
                    </span>
                    {e.notes && <span className="text-zinc-500 truncate max-w-[40%]">{e.notes}</span>}
                    <button
                      onClick={() => actions.removeCardioEntry(baselineId, origIndex)}
                      className="text-zinc-500 hover:text-rose-400 ml-2"
                    >×</button>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {/* Remove custom baseline */}
        {isCustom && (
          <button
            onClick={() => {
              if (!confirm(`Remove "${bl.name}" baseline? Entries will be deleted.`)) return;
              actions.removeCardioBaseline(baselineId);
              onClose();
            }}
            className="w-full text-xs text-zinc-500 hover:text-rose-400 py-2"
          >
            Remove this baseline
          </button>
        )}
      </div>
    </Sheet>
  );
}
