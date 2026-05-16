import Sheet from './Sheet.jsx';
import { useStore } from '../store.jsx';
import { getExercise } from '../data/exercises.js';
import { summarizeLog } from './ExerciseSheet.jsx';
import { formatValue } from '../utils/cardio.js';
import { parseDate } from '../utils/dates.js';
import { SESSION_TYPES } from '../data/program.js';

// Read-only sheet showing everything logged on a single date — the day's
// workout. Opens when the user taps a cell in the ActivityHeatmap.
export default function DayDetailSheet({ open, date, onClose }) {
  const { meData } = useStore();
  if (!open || !date) return null;

  // Workout logs that landed on this date
  const dayLogs = (meData?.logs || []).filter((l) => l.date === date);
  const byType = groupBySessionType(dayLogs);

  // Cardio attempts logged this date
  const cardioEntries = [];
  for (const [id, bl] of Object.entries(meData?.cardio?.baselines || {})) {
    for (const e of (bl.entries || [])) {
      if (e.date === date) {
        cardioEntries.push({ id, name: bl.name, type: bl.type, value: e.value, notes: e.notes });
      }
    }
  }

  const totalCount = dayLogs.length + cardioEntries.length;

  return (
    <Sheet open={open} onClose={onClose} title={fmtPretty(date)} fullHeight>
      <div className="px-5 py-4 space-y-4">
        {totalCount === 0 ? (
          <div className="text-sm text-zinc-400 bg-zinc-900 border border-zinc-800 rounded-2xl px-4 py-8 text-center">
            Nothing logged on this day.
          </div>
        ) : (
          <>
            <div className="text-xs text-zinc-500">
              {totalCount} log{totalCount === 1 ? '' : 's'} · {dayLogs.length} workout, {cardioEntries.length} cardio
            </div>

            {/* Session-grouped workout logs */}
            {SESSION_TYPES.concat(['Other']).map((type) => {
              const group = byType[type];
              if (!group || group.length === 0) return null;
              return (
                <SessionGroup key={type} type={type} logs={group} />
              );
            })}

            {/* Cardio entries */}
            {cardioEntries.length > 0 && (
              <div>
                <div className="text-[11px] uppercase tracking-wide text-zinc-500 mb-2">Cardio</div>
                <ul className="bg-zinc-900 border border-zinc-800 rounded-2xl divide-y divide-zinc-800">
                  {cardioEntries.map((c, i) => (
                    <li key={i} className="px-4 py-3 flex items-center justify-between">
                      <div className="text-sm text-zinc-100">{c.name}</div>
                      <div className="text-sm font-bold tabular-nums text-emerald-300">
                        {formatValue(c.value, c.type)}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </div>
    </Sheet>
  );
}

function SessionGroup({ type, logs }) {
  // Group logs by exercise so each movement appears once with all sets
  const byExercise = {};
  for (const l of logs) {
    (byExercise[l.exerciseId] ||= []).push(l);
  }
  const exerciseCount = Object.keys(byExercise).length;

  return (
    <div>
      <div className="flex items-baseline justify-between mb-1.5">
        <div className="text-[11px] uppercase tracking-wide text-zinc-400">{type}</div>
        <div className="text-[10px] text-zinc-600">
          {logs.length} set{logs.length === 1 ? '' : 's'} · {exerciseCount} exercise{exerciseCount === 1 ? '' : 's'}
        </div>
      </div>
      <ul className="bg-zinc-900 border border-zinc-800 rounded-2xl divide-y divide-zinc-800">
        {Object.entries(byExercise).map(([exId, entries]) => {
          const ex = exId.startsWith('custom-') ? { name: '(custom)' } : getExercise(exId);
          return (
            <li key={exId} className="px-4 py-3">
              <div className="text-sm font-medium text-zinc-100">{ex.name}</div>
              <ul className="mt-1 space-y-0.5">
                {entries.map((e) => (
                  <li key={e.id} className="text-xs text-zinc-400 flex items-center gap-2">
                    <span className="text-zinc-300">{summarizeLog(e)}</span>
                    {e.notes && <span className="text-zinc-500 truncate">· {e.notes}</span>}
                  </li>
                ))}
              </ul>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function groupBySessionType(logs) {
  const out = {};
  for (const l of logs) {
    const k = l.sessionType || 'Other';
    (out[k] ||= []).push(l);
  }
  return out;
}

function fmtPretty(d) {
  const dt = parseDate(d);
  return dt.toLocaleDateString(undefined, {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  });
}
