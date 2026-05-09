import { useState } from 'react';
import { StoreProvider, useStore, USER_NAMES } from './store.jsx';
import IdentityPicker from './components/IdentityPicker.jsx';
import BottomNav from './components/BottomNav.jsx';
import WeekView from './components/WeekView.jsx';
import SkillsView from './components/SkillsView.jsx';
import PRsView from './components/PRsView.jsx';
import LibraryView from './components/LibraryView.jsx';
import FriendView from './components/FriendView.jsx';
import SettingsSheet from './components/SettingsSheet.jsx';

export default function App() {
  return (
    <StoreProvider>
      <Shell />
    </StoreProvider>
  );
}

function Shell() {
  const { hydrated, identity } = useStore();
  const [tab, setTab] = useState('week');
  const [settings, setSettings] = useState(false);

  if (!hydrated) {
    return (
      <div className="h-full flex items-center justify-center text-zinc-500">…</div>
    );
  }
  if (!identity) return <IdentityPicker />;

  return (
    <div className="min-h-full flex flex-col bg-zinc-950">
      <TopBar onSettings={() => setSettings(true)} />
      <main className="flex-1">
        {tab === 'week'    && <WeekView />}
        {tab === 'skills'  && <SkillsView />}
        {tab === 'prs'     && <PRsView />}
        {tab === 'library' && <LibraryView />}
        {tab === 'friend'  && <FriendView />}
      </main>
      <BottomNav tab={tab} setTab={setTab} />
      <SettingsSheet open={settings} onClose={() => setSettings(false)} />
    </div>
  );
}

function TopBar({ onSettings }) {
  const { identity } = useStore();
  return (
    <header className="safe-top sticky top-0 bg-zinc-950/90 backdrop-blur z-30 border-b border-zinc-900">
      <div className="max-w-xl mx-auto flex items-center justify-between px-4 py-2.5">
        <div className="flex items-center gap-2">
          <span className="w-7 h-7 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-sm">⌁</span>
          <span className="text-sm font-semibold text-zinc-200">Calisthenics</span>
        </div>
        <button
          onClick={onSettings}
          className="w-9 h-9 rounded-full bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 flex items-center justify-center text-zinc-400"
          aria-label="Settings"
        >
          <span className="text-base">⚙</span>
        </button>
      </div>
    </header>
  );
}
