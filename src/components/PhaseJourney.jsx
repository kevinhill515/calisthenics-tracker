import { PHASES, phaseForWeek } from '../data/program.js';

// Small 5-segment progress bar showing position across the whole
// Foundation → Elite arc. Active segment fills proportionally with
// weeks-into-phase / weeks-in-phase.
export default function PhaseJourney({ startDate, weekNum, phaseOverride }) {
  const phase = phaseForWeek(weekNum, phaseOverride);
  const phaseStart = phase.weekRange[0];
  const phaseEnd = phase.weekRange[1];
  const weeksInPhase = phaseEnd === 999 ? 12 : phaseEnd - phaseStart + 1;
  const weeksDone = Math.max(1, Math.min(weekNum - phaseStart + 1, weeksInPhase));

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3 mb-3">
      <div className="flex items-center justify-between mb-2">
        <div className="text-[11px] uppercase tracking-wide text-zinc-500">Journey</div>
        <div className="text-[11px] text-zinc-400">
          Phase {phase.id} · week {weeksDone}/{weeksInPhase === 12 && phaseEnd === 999 ? '∞' : weeksInPhase}
        </div>
      </div>
      <div className="flex gap-1">
        {PHASES.map((p) => {
          const fill =
            p.id < phase.id ? 100 :
            p.id > phase.id ? 0 :
            (weeksDone / weeksInPhase) * 100;
          const active = p.id === phase.id;
          return (
            <div key={p.id} className="flex-1 min-w-0">
              <div className="h-1.5 bg-zinc-800 rounded overflow-hidden">
                <div
                  className={`h-full ${active ? 'bg-emerald-400' : 'bg-emerald-700'}`}
                  style={{ width: `${fill}%` }}
                />
              </div>
              <div className={`text-[9px] mt-1 text-center truncate ${active ? 'text-emerald-300' : 'text-zinc-600'}`}>
                P{p.id}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
