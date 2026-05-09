import { useStore, USER_NAMES } from '../store.jsx';
import { phaseForWeek } from '../data/program.js';
import { SESSION_TYPES } from '../data/program.js';
import { SKILL_LADDERS } from '../data/skillLadders.js';
import { weekId, weekNumber, allWeekIds } from '../utils/dates.js';
import ProgressRing from './ProgressRing.jsx';
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell } from 'recharts';

export default function FriendView() {
  const { meData, identity, otherIdentity, otherData } = useStore();
  if (!meData) return null;

  const me = stats(meData);
  const them = otherData ? stats(otherData) : null;

  return (
    <div className="px-4 pt-3 pb-24 max-w-xl mx-auto fade-in">
      <h1 className="text-xl font-bold text-zinc-100 mb-1">Compare</h1>
      <p className="text-xs text-zinc-500 mb-4">{USER_NAMES[identity]} vs {USER_NAMES[otherIdentity]} · this week + lifetime PRs</p>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <PersonCard you me={me} name={USER_NAMES[identity]} />
        {them ? (
          <PersonCard me={them} name={USER_NAMES[otherIdentity]} />
        ) : (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 text-center text-xs text-zinc-500 flex items-center justify-center">
            {USER_NAMES[otherIdentity]} hasn't logged anything yet.
          </div>
        )}
      </div>

      {them && (
        <>
          <h2 className="text-xs uppercase tracking-wide text-zinc-500 mt-6 mb-2">Last 8 weeks · sessions completed</h2>
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3 h-44">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyChart(meData, otherData)} barCategoryGap={6}>
                <XAxis dataKey="week" tick={{ fill: '#71717a', fontSize: 10 }} axisLine={{ stroke: '#3f3f46' }} tickLine={false} />
                <YAxis tick={{ fill: '#71717a', fontSize: 10 }} axisLine={{ stroke: '#3f3f46' }} tickLine={false} domain={[0, 4]} />
                <Tooltip cursor={{ fill: '#27272a' }} contentStyle={{ background: '#18181b', border: '1px solid #27272a', fontSize: 12 }} />
                <Bar dataKey="me" name={USER_NAMES[identity]} fill="#34d399" radius={[3,3,0,0]} />
                <Bar dataKey="them" name={USER_NAMES[otherIdentity]} fill="#a1a1aa" radius={[3,3,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <h2 className="text-xs uppercase tracking-wide text-zinc-500 mt-6 mb-2">Skill ladders</h2>
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl divide-y divide-zinc-800">
            {SKILL_LADDERS.map((l) => {
              const myRung = meData.ladders?.[l.id] ?? 0;
              const theirRung = otherData.ladders?.[l.id] ?? 0;
              const max = l.rungs.length - 1;
              return (
                <div key={l.id} className="px-4 py-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm text-zinc-200">{l.name}</span>
                    <span className="text-[11px] text-zinc-500">
                      {l.rungs[myRung].label} vs {l.rungs[theirRung].label}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Bar2 value={myRung / max} color="emerald" />
                    <Bar2 value={theirRung / max} color="zinc" />
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

function PersonCard({ me, name, you }) {
  return (
    <div className={`bg-zinc-900 border rounded-2xl p-4 ${you ? 'border-emerald-500/40' : 'border-zinc-800'}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-semibold text-zinc-100">{name}</span>
        {you && <span className="text-[10px] text-emerald-400">YOU</span>}
      </div>
      <ProgressRing value={me.pct} label={`${me.done}/4`} sub="this week" size={72} stroke={6} />
      <div className="mt-2 text-[11px] text-zinc-400 space-y-0.5">
        <div>Phase {me.phaseId} · Week {me.wkNum}</div>
        <div>Streak: <span className="text-emerald-400 font-medium">{me.streak}w</span></div>
      </div>
    </div>
  );
}

function Bar2({ value, color }) {
  const cls = color === 'emerald' ? 'bg-emerald-400' : 'bg-zinc-500';
  return (
    <div className="h-2 rounded-full bg-zinc-800 overflow-hidden">
      <div className={`h-full ${cls}`} style={{ width: `${value * 100}%` }} />
    </div>
  );
}

function stats(d) {
  const wid = weekId();
  const wkNum = weekNumber(d.startDate);
  const phase = phaseForWeek(wkNum, d.phaseOverride);
  const wk = d.weeks?.[wid] || {};
  const done = SESSION_TYPES.filter((s) => wk[s]).length;
  const streak = computeStreak(d);
  return { pct: done / SESSION_TYPES.length, done, wkNum, phaseId: phase.id, streak };
}

function computeStreak(d) {
  const weeks = d.weeks || {};
  const ids = Object.keys(weeks).sort().reverse();
  let s = 0;
  for (const id of ids) {
    const wk = weeks[id];
    const allDone = SESSION_TYPES.every((t) => wk[t]);
    if (allDone) s++;
    else if (id !== weekId()) break;
  }
  return s;
}

function weeklyChart(me, them) {
  // Last 8 weeks for whoever started earlier
  const start = me.startDate < them.startDate ? me.startDate : them.startDate;
  const ids = allWeekIds(start);
  const recent = ids.slice(-8);
  return recent.map((id) => {
    const meDone = me.weeks?.[id] ? SESSION_TYPES.filter((s) => me.weeks[id][s]).length : 0;
    const themDone = them.weeks?.[id] ? SESSION_TYPES.filter((s) => them.weeks[id][s]).length : 0;
    return { week: id.slice(-3), me: meDone, them: themDone };
  });
}
