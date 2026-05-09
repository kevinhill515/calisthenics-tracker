# Calisthenics Tracker

A mobile-first weekly tracker for the Foundation → Elite calisthenics program. Built for Kevin & Bucky to log sessions, track PRs, and watch each other's progress.

- **Stack**: React 18 + Vite 5 + Tailwind v4 + Recharts
- **Backend**: Supabase (free tier) — single `calis_users` table, two rows
- **Hosting**: GitHub Pages (free, static)

## Local setup

```bash
npm install
cp .env.example .env
# fill in VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY (see below)
npm run dev
```

The app falls back to local-only storage if Supabase isn't configured, so you can play with it before doing the cloud setup.

### Note on the network-share workflow (Kevin's machine)

The project lives on `\\FS01\USERS\khill\calisthenics-tracker`, which is mapped twice on this machine — once at `H:` and once at `Y:`. Vite/Rollup's html plugin canonicalizes paths through `Y:` during build, so **always run `npm install`, `npm run dev`, and `npm run build` from the `Y:` letter** (or use `cd /y/calisthenics-tracker` in Git Bash). Running from `H:` causes a "fileName must not be absolute" error during build. Once the project is pushed to GitHub and deploys run on a regular local clone (or via GitHub Actions in a Linux runner), this quirk goes away.

## Supabase setup (one time, ~5 minutes)

1. Go to https://supabase.com → new project. Pick the **Free** tier. Region near you. Save the database password somewhere safe (you won't need it for the app, but you'll want it for any future schema changes).

2. Once the project finishes provisioning, grab two values from **Project Settings → API**:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon / public** key → `VITE_SUPABASE_ANON_KEY`

   Put them in `.env` (for local dev) and into GitHub Secrets later (for the deploy).

3. Open the **SQL Editor** and paste this whole block, then **Run**:

   ```sql
   create table if not exists calis_users (
     name        text primary key,
     data        jsonb not null default '{}'::jsonb,
     updated_at  timestamptz not null default now()
   );

   alter table calis_users enable row level security;

   -- Anyone with the anon key can read either row (it's a 2-person app).
   drop policy if exists "anon_read" on calis_users;
   create policy "anon_read" on calis_users
     for select using (true);

   -- Writes are restricted to the two known names so the public anon key
   -- can't be used to create arbitrary rows.
   drop policy if exists "anon_insert" on calis_users;
   create policy "anon_insert" on calis_users
     for insert with check (name in ('kevin','bucky'));

   drop policy if exists "anon_update" on calis_users;
   create policy "anon_update" on calis_users
     for update using (name in ('kevin','bucky'));

   -- Seed both rows.
   insert into calis_users (name) values ('kevin'), ('bucky')
     on conflict (name) do nothing;
   ```

4. That's it. Restart `npm run dev` and the badge in **Settings → Sync** should read green.

### Why is the anon key safe to ship in the JS bundle?

Supabase's `anon` key is *publishable* — every row-level policy above limits what it can do. A malicious user can read your two rows (they're not secrets — your friend already sees them) but can't insert other rows or read other tables.

If you want hard isolation in the future, we can layer in [Supabase Auth magic links](https://supabase.com/docs/guides/auth/auth-magic-link) and tighten the RLS policies — but for two friends, this is the right amount of friction.

## Deploy to GitHub Pages (via GitHub Actions)

Pushes to `main` auto-build and publish to `gh-pages` via the workflow in `.github/workflows/deploy.yml`. Two repo secrets must be set first:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Add them at: **GitHub repo → Settings → Secrets and variables → Actions → New repository secret**.

After secrets are set, every `git push` triggers a build. The site lands at `https://<your-username>.github.io/calisthenics-tracker/` ~1 minute after Actions finishes (visible in the **Actions** tab).

## Add to home screen (mobile)

- **iPhone**: Safari → Share → *Add to Home Screen*
- **Android**: Chrome → ⋮ → *Install app*

The app respects iOS safe-area insets and uses dark theme for OLED.

## What gets tracked

| Data | Where it lives |
|---|---|
| Weekly session completion (Push / Pull / Skill+Legs / Density) | `data.weeks["2026-W19"].Push: true` |
| Per-exercise sets, reps, holds, load, RPE, notes | `data.logs[]` |
| Skill ladder current rung | `data.ladders.planche: 2` |
| Phase standards confirmed | `data.standardsConfirmed[phaseId]` |
| Program start date + manual phase override | `data.startDate`, `data.phaseOverride` |

`data` is one JSONB blob per user. localStorage is the source of truth on each device; Supabase is the sync layer (debounced writes, refresh on focus). If you're offline, you keep working — it pushes when you come back.

## Project layout

```
src/
  App.jsx                         — top-level shell + tab routing
  main.jsx                        — react entry
  index.css                       — tailwind + base styles
  store.jsx                       — global state, sync, all actions
  api/supabase.js                 — REST wrapper
  data/
    program.js                    — 5 phases, 4 sessions each
    exercises.js                  — exercise dictionary (cue + yt link)
    skillLadders.js               — 9 progression ladders
    phaseStandards.js             — phase test standards
  utils/
    dates.js                      — week math (ISO Mon→Sun)
    ids.js                        — uuid
  components/
    IdentityPicker.jsx            — first-launch name pick
    BottomNav.jsx                 — 5-tab nav
    WeekView.jsx                  — main weekly tracker
    SessionSheet.jsx              — exercise list + complete button
    ExerciseSheet.jsx             — how-to + quick log + history
    SkillsView.jsx                — 9 ladders w/ sparklines
    PRsView.jsx                   — best-ever per progression
    LibraryView.jsx               — searchable exercise reference
    FriendView.jsx                — Kevin vs Bucky comparison
    SettingsSheet.jsx             — identity, start date, phase, standards, export
    StandardsCard.jsx             — phase standards checklist
    Sheet.jsx                     — bottom-sheet primitive
    ProgressRing.jsx              — circular progress
```

## License

Private — for Kevin & Bucky.
