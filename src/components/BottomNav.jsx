const BASE_TABS = [
  { id: 'week',    label: 'Week',    icon: '◧' },
  { id: 'skills',  label: 'Skills',  icon: '⊿' },
  { id: 'prs',     label: 'PRs',     icon: '★' },
  { id: 'friend',  label: 'Friend',  icon: '◐' },
];

// 5th icon when this user has cardio tracking enabled in Settings.
const CARDIO_TAB = { id: 'cardio', label: 'Cardio', icon: '♡' };

export default function BottomNav({ tab, setTab, cardioEnabled = false }) {
  const tabs = cardioEnabled
    ? [BASE_TABS[0], BASE_TABS[1], BASE_TABS[2], CARDIO_TAB, BASE_TABS[3]]
    : BASE_TABS;
  const cols = tabs.length === 5 ? 'grid-cols-5' : 'grid-cols-4';

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-zinc-950/95 backdrop-blur border-t border-zinc-800 safe-bottom z-40">
      <div className={`max-w-xl mx-auto grid ${cols}`}>
        {tabs.map((t) => {
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex flex-col items-center gap-0.5 py-2.5 transition ${
                active ? 'text-emerald-400' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <span className="text-lg leading-none">{t.icon}</span>
              <span className="text-[10px] font-medium tracking-wide">{t.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
