import { useState } from 'react';
import ProgressRing from './ProgressRing.jsx';
import SessionSheet from './SessionSheet.jsx';
import DensitySheet from './DensitySheet.jsx';
import PhaseJourney from './PhaseJourney.jsx';
import ActivityHeatmap from './ActivityHeatmap.jsx';
import WeeklyRecap from './WeeklyRecap.jsx';
import { SESSION_TYPES, SESSION_META, phaseForWeek, isDeloadWeek } from '../data/program.js';
import { useStore, USER_NAMES } from '../store.jsx';
import { weekId, weekNumber, fmtWeekRange } from '../utils/dates.js';

const COLOR_MAP = {
  rose:    'bg-rose-500/15 text-rose-300 border-rose-500/30',
  sky:     'bg-sky-500/15 text-sky-300 border-sky-500/30',
  amber:   'bg-amber-500/15 text-amber-300 border-amber-500/30',
  emerald: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
};

export default function WeekView() {
  const { meData, otherIdentity, otherData, identity } = useStore();
  const [openSession, setOpenSession] = useState(null);

  if (!meData) return null;
  const wid = weekId();
  const wkNum = weekNumber(meData.startDate);
  const phase = phaseForWeek(wkNum, meData.phaseOverride);
  const deload = isDeloadWeek(wkNum);

  const myWk = meData.weeks?.[wid] || {};
  const myDoneCount = SESSION_TYPES.filter((s) => myWk[s]).length;

  const otherWk = otherData?.weeks?.[wid] || {};
  const otherDone = SESSION_TYPES.filter((s) => otherWk[s]).length;

  const streak = computeStreak(meData);

  return (
    <div className="px-4 pt-3 pb-24 max-w-xl mx-auto fade-in">
      {/* Phase header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="text-xs text-zinc-500">Week {wkNum} · {fmtWeekRange()}</div>
          <h1 className="text-xl font-bold text-zinc-100 mt-0.5">
            Phase {phase.id} — {phase.name}
          </h1>
        </div>
        {deload && (
          <span className="text-[10px] uppercase tracking-wider bg-amber-500/15 text-amber-300 border border-amber-500/30 rounded-full px-2 py-1">
            Deload week
          </span>
        )}
      </div>

      {/* Phase journey progress bar (5 segments, current segment fills with weeks-into-phase) */}
      <PhaseJourney
        startDate={meData.startDate}
        weekNum={wkNum}
        phaseOverride={meData.phaseOverride}
      />

      {/* Hero ring + streak + friend pill */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex items-center gap-4 mb-4">
        <ProgressRing
          value={myDoneCount / SESSION_TYPES.length}
          label={`${myDoneCount}/${SESSION_TYPES.length}`}
          sub="this week"
          size={92}
        />
        <div className="flex-1 min-w-0">
          <div className="text-xs text-zinc-500">{USER_NAMES[identity]}</div>
          <div className="text-sm text-zinc-300 mt-0.5">
            {myDoneCount === 4 ? 'Week locked in 🔥' : `${4 - myDoneCount} session${4-myDoneCount===1?'':'s'} left`}
          </div>
          <div className="mt-2 inline-flex items-center gap-1 text-xs bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 rounded-full px-2 py-0.5">
            <span>🔥</span> {streak}-week streak
          </div>
        </div>
        {otherData && (
          <div className="flex flex-col items-center text-center min-w-[60px]">
            <ProgressRing
              value={otherDone / SESSION_TYPES.length}
              label={`${otherDone}/${SESSION_TYPES.length}`}
              size={56} stroke={5}
            />
            <div className="text-[10px] text-zinc-500 mt-1 truncate">{USER_NAMES[otherIdentity]}</div>
          </div>
        )}
      </div>

      {/* Session cards */}
      <div className="space-y-2.5">
        {SESSION_TYPES.map((s) => {
          const done = !!myWk[s];
          const meta = SESSION_META[s];
          return (
            <button
              key={s}
              onClick={() => setOpenSession(s)}
              className={`w-full text-left bg-zinc-900 border rounded-2xl p-4 flex items-center gap-3 transition active:scale-[0.99] ${
                done ? 'border-emerald-500/40' : 'border-zinc-800 hover:border-zinc-700'
              }`}
            >
              <div className={`w-11 h-11 rounded-xl border flex items-center justify-center text-lg flex-shrink-0 ${COLOR_MAP[meta.color]}`}>
                {meta.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-zinc-100">{s}</div>
                <div className="text-xs text-zinc-500 truncate">{meta.focus}</div>
              </div>
              <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition ${
                done ? 'bg-emerald-500 border-emerald-500 text-zinc-950' : 'border-zinc-700 text-transparent'
              }`}>
                ✓
              </div>
            </button>
          );
        })}
      </div>

      {/* Weekly recap — appears once all 4 sessions are marked complete */}
      {myDoneCount === SESSION_TYPES.length && <WeeklyRecap meData={meData} />}

      {/* 28-day activity heatmap (Sat-Fri columns) */}
      <div className="mt-4">
        <ActivityHeatmap logs={meData.logs || []} />
      </div>

      {/* Phase context */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-4">
        <div className="text-xs uppercase tracking-wide text-zinc-500 mb-1">Phase goal</div>
        <p className="text-sm text-zinc-300 leading-relaxed">{phase.goal}</p>
        {phase.note && (
          <p className="mt-2 text-xs text-zinc-500 leading-relaxed">{phase.note}</p>
        )}
      </div>

      {/* Density circuits get a dedicated round-by-round sheet; all other
          sessions (and EMOM / freestyle Density in later phases) fall
          through to the standard list-style sheet. */}
      {openSession === 'Density' && phase.sessions.Density?.rounds ? (
        <DensitySheet
          open={!!openSession}
          phase={phase}
          onClose={() => setOpenSession(null)}
        />
      ) : (
        <SessionSheet
          open={!!openSession}
          sessionType={openSession}
          phase={phase}
          onClose={() => setOpenSession(null)}
        />
      )}
    </div>
  );
}

// Consecutive prior weeks where all 4 sessions were done. Counts the
// current week only if it's complete.
function computeStreak(d) {
  const weeks = d.weeks || {};
  const ids = Object.keys(weeks).sort().reverse();
  let streak = 0;
  for (const id of ids) {
    const wk = weeks[id];
    const done = SESSION_TYPES.every((s) => wk[s]);
    if (done) streak++;
    else if (id !== weekId()) break; // missing past week breaks streak
    else continue; // current week incomplete is OK, just doesn't count
  }
  return streak;
}
