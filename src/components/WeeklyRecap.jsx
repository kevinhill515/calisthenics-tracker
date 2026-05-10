import { SKILL_LADDERS } from '../data/skillLadders.js';
import { weekId, fmtDate, parseDate } from '../utils/dates.js';

// Celebration card that appears on the Week tab once the user hits 4/4
// session completions for the current Sat-Fri week. Pulls a few quick
// stats and any new PRs the user set this week.
export default function WeeklyRecap({ meData }) {
  const wid = weekId();
  const allLogs = meData.logs || [];
  const thisWeekLogs = allLogs.filter((l) => l.weekId === wid);
  const earlierLogs  = allLogs.filter((l) => l.weekId !== wid);

  const setsLogged = thisWeekLogs.length;
  const distinctExercises = new Set(thisWeekLogs.map((l) => l.exerciseId)).size;
  const newPRs = countNewPRs(thisWeekLogs, earlierLogs);

  return (
    <div className="bg-emerald-500/10 border border-emerald-500/40 rounded-2xl p-4 mt-4">
      <div className="flex items-center gap-2 text-emerald-300 font-bold mb-2">
        <span className="text-lg">🔥</span>
        <span>Week locked in</span>
      </div>
      <p className="text-xs text-zinc-300 mb-3">
        All four sessions complete. Snapshot of the week:
      </p>
      <div className="grid grid-cols-3 gap-2">
        <Stat n={setsLogged} label="set logs" />
        <Stat n={distinctExercises} label="exercises" />
        <Stat n={newPRs} label={newPRs === 1 ? 'new PR' : 'new PRs'} accent />
      </div>
    </div>
  );
}

function Stat({ n, label, accent }) {
  return (
    <div className={`rounded-xl p-2 text-center ${accent ? 'bg-emerald-500/20' : 'bg-zinc-800/60'}`}>
      <div className={`text-xl font-bold tabular-nums ${accent ? 'text-emerald-300' : 'text-zinc-100'}`}>{n}</div>
      <div className="text-[10px] uppercase tracking-wide text-zinc-400">{label}</div>
    </div>
  );
}

// "New PRs this week" = number of skill-ladder rungs whose best-ever
// number was set/improved by a log entry from this week. Compares the
// max for an exercise across this week's logs to the max across all
// other logs.
function countNewPRs(thisWeek, earlier) {
  let count = 0;
  const tracked = new Set();
  for (const ladder of SKILL_LADDERS) {
    for (const r of ladder.rungs) {
      if (tracked.has(r.id)) continue;
      tracked.add(r.id);
      const unit = r.unit || ladder.unit;
      const field = unit === 'sec' ? 'hold' : 'reps';
      const thisMax = max(thisWeek, r.id, field);
      const prevMax = max(earlier, r.id, field);
      if (thisMax != null && (prevMax == null || thisMax > prevMax)) count++;
    }
  }
  return count;
}

function max(logs, exId, field) {
  let m = null;
  for (const l of logs) {
    if (l.exerciseId !== exId) continue;
    const v = l[field];
    if (v == null) continue;
    if (m == null || v > m) m = v;
  }
  return m;
}
