import Sheet from './Sheet.jsx';
import StandardsCard from './StandardsCard.jsx';
import { useStore, USER_NAMES } from '../store.jsx';
import { PHASES, phaseForWeek } from '../data/program.js';
import { weekNumber } from '../utils/dates.js';
import { useState } from 'react';
import { SUPA_CONFIGURED } from '../api/supabase.js';

export default function SettingsSheet({ open, onClose, onOpenLibrary }) {
  const { meData, identity, actions } = useStore();
  const [showAllStandards, setShowAllStandards] = useState(false);
  if (!meData) return null;

  const wkNum = weekNumber(meData.startDate);
  const auto = phaseForWeek(wkNum, null);
  const current = phaseForWeek(wkNum, meData.phaseOverride);

  return (
    <Sheet open={open} onClose={onClose} title="Settings" fullHeight>
      <div className="px-5 py-4 space-y-6">
        {/* Identity */}
        <Section title="You">
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(USER_NAMES).map(([k, v]) => (
              <button
                key={k}
                onClick={() => actions.setIdentity(k)}
                className={`py-3 rounded-xl border ${
                  identity === k ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300' : 'bg-zinc-800 border-zinc-700 text-zinc-300'
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        </Section>

        {/* Cardio tracking — per-user opt-in (adds a 5th nav icon when on) */}
        <Section title="Cardio tracking" sub="Adds a Cardio tab for baseline tests. Per-user — toggle independently.">
          <button
            onClick={() => actions.toggleCardioEnabled()}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border ${
              meData.cardio?.enabled
                ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                : 'bg-zinc-800 border-zinc-700 text-zinc-300'
            }`}
          >
            <span className="text-sm">{meData.cardio?.enabled ? 'Enabled' : 'Disabled'}</span>
            <span className={`w-10 h-5 rounded-full relative transition ${meData.cardio?.enabled ? 'bg-emerald-500' : 'bg-zinc-700'}`}>
              <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-zinc-100 transition ${meData.cardio?.enabled ? 'right-0.5' : 'left-0.5'}`} />
            </span>
          </button>
        </Section>

        {/* Library (was a nav tab — moved here to free that slot for Cardio) */}
        <Section title="Reference">
          <button
            onClick={onOpenLibrary}
            className="w-full bg-zinc-800 hover:bg-zinc-700 rounded-xl py-2.5 text-sm text-zinc-200"
          >
            Open exercise library
          </button>
        </Section>

        {/* Sync status */}
        <Section title="Sync">
          {SUPA_CONFIGURED ? (
            <div className="text-sm text-zinc-300 bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3">
              ✓ Connected to Supabase. Changes auto-sync between devices.
            </div>
          ) : (
            <div className="text-sm text-amber-300 bg-amber-500/10 border border-amber-500/30 rounded-xl p-3">
              ⚠ No Supabase credentials. Data is local only. See README.md to set up sync.
            </div>
          )}
          <button
            onClick={() => actions.pull()}
            className="mt-2 w-full bg-zinc-800 hover:bg-zinc-700 rounded-xl py-2.5 text-sm text-zinc-200"
          >
            Refresh from cloud
          </button>
          <button
            onClick={async () => {
              if (!confirm('Overwrite this device with whatever is in the cloud right now? Use this only if your data has gone missing locally.')) return;
              const ok = await actions.forceRestoreFromCloud();
              alert(ok ? 'Restored from cloud.' : 'Could not reach cloud — check your connection.');
            }}
            className="mt-2 w-full bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 rounded-xl py-2.5 text-sm"
          >
            Force restore from cloud
          </button>
          <p className="mt-1 text-[11px] text-zinc-500 leading-relaxed">
            Force restore overrides this device's data with the cloud copy, ignoring local edits and timestamps. Recovery only — not for daily sync.
          </p>
        </Section>

        {/* App version / update */}
        <Section title="App" sub="If new features aren't showing up after a deploy">
          <button
            onClick={() => {
              // Best-effort: clear caches, then hard reload bypassing the
              // cached html. iOS home-screen apps still sometimes need a
              // delete-and-re-add — see the README.
              if ('caches' in window) caches.keys().then(ks => ks.forEach(k => caches.delete(k)));
              location.reload();
            }}
            className="w-full bg-zinc-800 hover:bg-zinc-700 rounded-xl py-2.5 text-sm text-zinc-200"
          >
            Reload app (clear cache)
          </button>
          <p className="mt-2 text-[11px] text-zinc-500 leading-relaxed">
            If reload doesn't pull in new code on a home-screen app: long-press the icon, delete it, then re-add by visiting the URL in your browser and tapping Share → Add to Home Screen.
          </p>
        </Section>

        {/* Start date */}
        <Section title="Program start" sub="Week 1 begins on this date">
          <input
            type="date"
            value={meData.startDate}
            onChange={(e) => actions.setStartDate(e.target.value)}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2.5 text-sm text-zinc-100"
          />
          <div className="text-xs text-zinc-500 mt-2">Currently on week {wkNum}.</div>
        </Section>

        {/* Phase override */}
        <Section title="Phase" sub={`Auto: Phase ${auto.id} — ${auto.name}`}>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => actions.setPhaseOverride(null)}
              className={`py-2.5 rounded-xl text-sm border ${
                meData.phaseOverride == null ? 'bg-zinc-100 text-zinc-950 border-zinc-100' : 'bg-zinc-800 border-zinc-700 text-zinc-300'
              }`}
            >
              Auto
            </button>
            {PHASES.map((p) => (
              <button
                key={p.id}
                onClick={() => actions.setPhaseOverride(p.id)}
                className={`py-2.5 rounded-xl text-sm border ${
                  meData.phaseOverride === p.id ? 'bg-zinc-100 text-zinc-950 border-zinc-100' : 'bg-zinc-800 border-zinc-700 text-zinc-300'
                }`}
              >
                P{p.id}
              </button>
            ))}
          </div>
        </Section>

        {/* Phase standards */}
        <Section title={`Phase ${current.id} standards`} sub="Auto-checked when your PR meets the target">
          <StandardsCard phaseId={current.id} />
          <button
            onClick={() => setShowAllStandards(!showAllStandards)}
            className="mt-3 text-xs text-zinc-400 hover:text-zinc-200"
          >
            {showAllStandards ? 'Hide' : 'Show'} all phases
          </button>
          {showAllStandards && (
            <div className="mt-3 space-y-3">
              {PHASES.filter((p) => p.id !== current.id).map((p) => (
                <div key={p.id}>
                  <div className="text-[11px] uppercase tracking-wide text-zinc-500 mb-1">Phase {p.id} — {p.name}</div>
                  <StandardsCard phaseId={p.id} />
                </div>
              ))}
            </div>
          )}
        </Section>

        {/* Danger / data */}
        <Section title="Data">
          <button
            onClick={() => {
              const blob = new Blob([JSON.stringify(meData, null, 2)], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `calisthenics-${identity}-${new Date().toISOString().slice(0,10)}.json`;
              a.click();
              URL.revokeObjectURL(url);
            }}
            className="w-full bg-zinc-800 hover:bg-zinc-700 rounded-xl py-2.5 text-sm text-zinc-200"
          >
            Export JSON
          </button>
        </Section>
      </div>
    </Sheet>
  );
}

function Section({ title, sub, children }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wide text-zinc-500">{title}</div>
      {sub && <div className="text-[11px] text-zinc-600 mb-2">{sub}</div>}
      <div className={sub ? '' : 'mt-2'}>{children}</div>
    </div>
  );
}
