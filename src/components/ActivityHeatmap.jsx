import { fmtDate } from '../utils/dates.js';

// 28 most recent days, 7 columns × 4 rows. Each cell shaded by how many
// log entries land on that date — feels good to see filled cells march
// across the grid, instantly answers "did I train Wednesday?".
export default function ActivityHeatmap({ logs }) {
  const today = new Date();
  const days = [];
  // Most recent saturday (so columns line up with the Sat-Fri week)
  const todayDay = today.getDay();
  const daysBackToSat = (todayDay + 1) % 7; // Sat=6: 0; Sun=0: 1; Fri=5: 6
  const startSat = new Date(today);
  startSat.setDate(today.getDate() - daysBackToSat - 21); // 4 weeks back
  for (let i = 0; i < 28; i++) {
    const d = new Date(startSat);
    d.setDate(startSat.getDate() + i);
    const ds = fmtDate(d);
    const count = logs.filter((l) => l.date === ds).length;
    const isFuture = d > today;
    days.push({ date: ds, count, isFuture, isToday: ds === fmtDate(today) });
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3 mb-3">
      <div className="flex items-center justify-between mb-2">
        <div className="text-[11px] uppercase tracking-wide text-zinc-500">Activity · last 4 weeks</div>
        <div className="flex items-center gap-1.5 text-[10px] text-zinc-500">
          <span>less</span>
          <div className="w-2 h-2 rounded-sm bg-zinc-800" />
          <div className="w-2 h-2 rounded-sm bg-emerald-900" />
          <div className="w-2 h-2 rounded-sm bg-emerald-700" />
          <div className="w-2 h-2 rounded-sm bg-emerald-400" />
          <span>more</span>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1.5">
        <DayLabel d="S" />
        <DayLabel d="S" />
        <DayLabel d="M" />
        <DayLabel d="T" />
        <DayLabel d="W" />
        <DayLabel d="T" />
        <DayLabel d="F" />
        {days.map((d) => (
          <div
            key={d.date}
            title={`${d.date} — ${d.count} log${d.count === 1 ? '' : 's'}`}
            className={`aspect-square rounded ${cellColor(d)} ${d.isToday ? 'ring-1 ring-emerald-300' : ''}`}
          />
        ))}
      </div>
    </div>
  );
}

function DayLabel({ d }) {
  return <div className="text-[9px] text-zinc-600 text-center">{d}</div>;
}

function cellColor({ count, isFuture }) {
  if (isFuture)    return 'bg-zinc-900 border border-zinc-800';
  if (count === 0) return 'bg-zinc-800';
  if (count < 3)   return 'bg-emerald-900';
  if (count < 6)   return 'bg-emerald-700';
  return 'bg-emerald-400';
}
