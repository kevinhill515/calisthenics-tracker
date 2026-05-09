import { useStore, USER_NAMES } from '../store.jsx';

export default function IdentityPicker() {
  const { actions } = useStore();
  return (
    <div className="min-h-full flex flex-col items-center justify-center px-6 py-12 fade-in">
      <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mb-5">
        <span className="text-emerald-400 text-3xl">⌁</span>
      </div>
      <h1 className="text-2xl font-bold text-zinc-100 mb-1">Calisthenics Tracker</h1>
      <p className="text-zinc-400 text-sm mb-10">Foundation → Elite. Pick who you are.</p>

      <div className="w-full max-w-sm grid grid-cols-2 gap-3">
        {Object.entries(USER_NAMES).map(([key, label]) => (
          <button
            key={key}
            onClick={() => actions.setIdentity(key)}
            className="flex flex-col items-center gap-2 py-6 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-emerald-500/40 hover:bg-zinc-800 transition active:scale-[0.98]"
          >
            <span className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center text-xl font-bold text-zinc-300">
              {label[0]}
            </span>
            <span className="font-medium text-zinc-100">{label}</span>
          </button>
        ))}
      </div>

      <p className="mt-8 text-xs text-zinc-500 text-center max-w-sm">
        You can switch later in Settings. Both users sync across devices through the same Supabase project.
      </p>
    </div>
  );
}
