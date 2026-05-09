import { PHASE_STANDARDS } from '../data/phaseStandards.js';
import { useStore } from '../store.jsx';

// Phase standards checklist — auto-fills "current best" from logs.
// Used inside SettingsSheet (and could be embedded elsewhere later).
export default function StandardsCard({ phaseId }) {
  const { meData, actions } = useStore();
  const list = PHASE_STANDARDS[phaseId] || [];
  if (!meData) return null;

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl divide-y divide-zinc-800">
      {list.map((std) => {
        const logs = meData.logs.filter((l) => l.exerciseId === std.exerciseId);
        const best = std.unit === 'sec'
          ? max(logs.map((l) => l.hold))
          : max(logs.map((l) => l.reps));
        const auto = best != null && best >= std.target;
        const confirmedAt = meData.standardsConfirmed?.[phaseId]?.[std.id];
        const checked = !!confirmedAt || auto;

        return (
          <div key={std.id} className="px-4 py-3 flex items-center gap-3">
            <button
              onClick={() => actions.toggleStandard(phaseId, std.id)}
              className={`w-6 h-6 rounded-md border-2 flex items-center justify-center text-xs flex-shrink-0 ${
                checked ? 'bg-emerald-500 border-emerald-500 text-zinc-950' : 'border-zinc-700'
              }`}
            >
              {checked ? '✓' : ''}
            </button>
            <div className="flex-1 min-w-0">
              <div className="text-sm text-zinc-100">{std.label}</div>
              <div className="text-[11px] text-zinc-500">
                target {std.target}{std.unit === 'sec' ? 's' : ' reps'}
                {best != null && (
                  <> · best <span className={best >= std.target ? 'text-emerald-400' : 'text-zinc-300'}>{best}{std.unit === 'sec' ? 's' : ''}</span></>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function max(arr) {
  let m = null;
  for (const v of arr) if (v != null && (m == null || v > m)) m = v;
  return m;
}
