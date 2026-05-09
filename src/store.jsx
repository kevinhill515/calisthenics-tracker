// Single global store. Source of truth lives in localStorage; Supabase is
// the sync layer (debounced writes, on-mount + on-focus reads). Identity
// is whichever name was picked at first launch (Kevin or Bucky).

import { createContext, useContext, useEffect, useMemo, useReducer, useRef, useCallback, useState } from 'react';
import { fetchAllUsers, upsertUser, SUPA_CONFIGURED } from './api/supabase.js';
import { weekId } from './utils/dates.js';
import { uid } from './utils/ids.js';

const USERS = ['kevin', 'bucky'];
const LS_IDENTITY = 'calis.identity';
const LS_DATA = (name) => `calis.data.${name}`;

const TODAY = () => new Date().toISOString().slice(0, 10);

// True when the data looks like a fresh / empty default — no logged
// sessions, no logs, no ladder rungs set. Used by pull() to decide
// whether to override a "newer" but empty local state with cloud data.
function isEssentiallyEmpty(d) {
  if (!d) return true;
  return Object.keys(d.weeks || {}).length === 0
      && (d.logs || []).length === 0
      && Object.keys(d.ladders || {}).length === 0
      && Object.keys(d.standardsConfirmed || {}).length === 0
      && Object.keys(d.customExercises || {}).length === 0;
}

// One-shot migration. Old data used ISO week ids ("2026-W19") under
// `weeks`. We've since switched to Saturday-anchored ids ("2026-05-09"),
// so any old keys would silently disappear from the week view. Roll
// them onto the current week so the user keeps any taps they made.
function migrateWeeks(data) {
  if (!data || !data.weeks) return data;
  const isoKey = /^\d{4}-W\d{2}$/;
  const out = {};
  let touched = false;
  for (const [k, v] of Object.entries(data.weeks)) {
    if (isoKey.test(k)) {
      const into = weekId();
      out[into] = { ...(out[into] || {}), ...v };
      touched = true;
    } else {
      out[k] = v;
    }
  }
  return touched ? { ...data, weeks: out } : data;
}

const DEFAULT_DATA = () => ({
  startDate: TODAY(),
  phaseOverride: null,
  // weeks: { "2026-W19": { Push: true, Pull: false, ... } }
  weeks: {},
  // logs: array of { id, date, weekId, sessionType, exerciseId, sets, reps, hold, load, rpe, notes }
  logs: [],
  // ladders: { ladderId: <currentRungIndex> }
  ladders: {},
  // standardsConfirmed: { phaseId: { standardId: 'YYYY-MM-DD' or true } }
  standardsConfirmed: {},
  // customExercises: { [id]: { name, sessionType, hidden? } }
  // Persisted forever (even when hidden) so old logs still resolve a name.
  customExercises: {},
});

function reducer(state, action) {
  switch (action.type) {
    case 'hydrate':
      return { ...state, ...action.payload, hydrated: true };
    case 'setIdentity':
      return { ...state, identity: action.name };
    case 'setUserData':
      return { ...state, users: { ...state.users, [action.name]: action.data } };
    case 'patchSelf': {
      const cur = state.users[state.identity] || DEFAULT_DATA();
      const next = action.fn(cur);
      return { ...state, users: { ...state.users, [state.identity]: next } };
    }
    default:
      return state;
  }
}

const StoreCtx = createContext(null);

export function StoreProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, {
    hydrated: false,
    identity: null,                  // 'kevin' | 'bucky' | null
    users: { kevin: DEFAULT_DATA(), bucky: DEFAULT_DATA() },
  });

  // ---------- hydrate from localStorage on mount ----------
  useEffect(() => {
    const identity = localStorage.getItem(LS_IDENTITY);
    const users = {};
    for (const u of USERS) {
      try {
        const raw = localStorage.getItem(LS_DATA(u));
        const parsed = raw ? { ...DEFAULT_DATA(), ...JSON.parse(raw) } : DEFAULT_DATA();
        users[u] = migrateWeeks(parsed);
      } catch {
        users[u] = DEFAULT_DATA();
      }
    }
    dispatch({ type: 'hydrate', payload: { identity, users } });
  }, []);

  // ---------- pull from supabase on mount + on focus ----------
  // `readyToPush` gates writes to Supabase: must stay false until the FIRST
  // pull completes, otherwise an empty in-memory state on a fresh device
  // (cleared cache, re-installed home-screen app) gets pushed up before the
  // pull arrives, overwriting the user's actual data on the server.
  const lastPulled = useRef(0);
  const [readyToPush, setReadyToPush] = useState(false);
  const pull = useCallback(async () => {
    if (!SUPA_CONFIGURED) {
      setReadyToPush(true);
      return;
    }
    const rows = await fetchAllUsers();
    rows.forEach((row) => {
      const name = (row.name || '').toLowerCase();
      if (!USERS.includes(name)) return;
      const remote = row.data || {};
      // Local has a "lastTouched" timestamp. If remote is newer, take it.
      // ALSO take remote when local looks essentially empty but remote has
      // real content — recovers from a previous bug that stamped an empty
      // local state with a fresh timestamp ahead of the cloud copy.
      const local = JSON.parse(localStorage.getItem(LS_DATA(name)) || '{}');
      const localTs = local._touched || 0;
      const remoteTs = new Date(row.updated_at || 0).getTime();
      const localEmpty = isEssentiallyEmpty(local);
      const remoteHasData = !isEssentiallyEmpty(remote);
      if (remoteTs >= localTs || (localEmpty && remoteHasData)) {
        const merged = migrateWeeks({ ...DEFAULT_DATA(), ...remote, _touched: remoteTs });
        localStorage.setItem(LS_DATA(name), JSON.stringify(merged));
        dispatch({ type: 'setUserData', name, data: merged });
      }
    });
    lastPulled.current = Date.now();
    setReadyToPush(true);
  }, []);

  useEffect(() => {
    if (!state.hydrated) return;
    pull();
    const onFocus = () => { if (Date.now() - lastPulled.current > 15_000) pull(); };
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [state.hydrated, pull]);

  // ---------- persist self changes (debounced supabase push) ----------
  // Only fires once readyToPush is true (i.e. the initial pull from
  // Supabase has finished). Until then, we leave both localStorage and
  // the cloud row alone — the values currently in state may just be the
  // empty defaults, and pushing those would wipe the cloud copy.
  const pushTimer = useRef(null);
  const myData = state.users[state.identity];

  useEffect(() => {
    if (!state.hydrated || !state.identity || !myData) return;
    if (!readyToPush) return;
    const stamped = { ...myData, _touched: Date.now() };
    localStorage.setItem(LS_DATA(state.identity), JSON.stringify(stamped));
    if (pushTimer.current) clearTimeout(pushTimer.current);
    pushTimer.current = setTimeout(() => {
      upsertUser(state.identity, stamped);
    }, 800);
  }, [myData, state.identity, state.hydrated, readyToPush]);

  // ---------- actions ----------
  const setIdentity = useCallback((name) => {
    localStorage.setItem(LS_IDENTITY, name);
    dispatch({ type: 'setIdentity', name });
  }, []);

  const patch = useCallback((fn) => dispatch({ type: 'patchSelf', fn }), []);

  const toggleSession = useCallback((wid, sessionType) => {
    patch((d) => {
      const wk = { ...(d.weeks[wid] || {}) };
      wk[sessionType] = !wk[sessionType];
      return { ...d, weeks: { ...d.weeks, [wid]: wk } };
    });
  }, [patch]);

  const addLog = useCallback((entry) => {
    patch((d) => ({
      ...d,
      logs: [...d.logs, { id: uid(), weekId: weekId(), date: TODAY(), ...entry }],
    }));
  }, [patch]);

  const removeLog = useCallback((id) => {
    patch((d) => ({ ...d, logs: d.logs.filter((l) => l.id !== id) }));
  }, [patch]);

  const setLadderRung = useCallback((ladderId, rungIndex) => {
    patch((d) => ({ ...d, ladders: { ...d.ladders, [ladderId]: rungIndex } }));
  }, [patch]);

  const toggleStandard = useCallback((phaseId, standardId) => {
    patch((d) => {
      const phase = { ...(d.standardsConfirmed[phaseId] || {}) };
      if (phase[standardId]) delete phase[standardId];
      else phase[standardId] = TODAY();
      return { ...d, standardsConfirmed: { ...d.standardsConfirmed, [phaseId]: phase } };
    });
  }, [patch]);

  const setStartDate = useCallback((iso) => patch((d) => ({ ...d, startDate: iso })), [patch]);
  const setPhaseOverride = useCallback((p) => patch((d) => ({ ...d, phaseOverride: p })), [patch]);

  // Add a one-off custom exercise scoped to a session type. Returns the id
  // so the caller can immediately open the ExerciseSheet on it.
  const addCustomExercise = useCallback((sessionType, name) => {
    const id = `custom-${uid()}`;
    patch((d) => ({
      ...d,
      customExercises: {
        ...(d.customExercises || {}),
        [id]: { name: name.trim(), sessionType, hidden: false },
      },
    }));
    return id;
  }, [patch]);

  // "Remove" hides a custom exercise from the session list. We never delete
  // the metadata so old log entries still resolve a name.
  const hideCustomExercise = useCallback((id) => {
    patch((d) => {
      const cur = (d.customExercises || {})[id];
      if (!cur) return d;
      return {
        ...d,
        customExercises: { ...d.customExercises, [id]: { ...cur, hidden: true } },
      };
    });
  }, [patch]);

  const value = useMemo(
    () => ({
      ...state,
      meData: myData,
      otherIdentity: state.identity === 'kevin' ? 'bucky' : 'kevin',
      otherData: state.identity ? state.users[state.identity === 'kevin' ? 'bucky' : 'kevin'] : null,
      actions: {
        setIdentity,
        toggleSession,
        addLog,
        removeLog,
        setLadderRung,
        toggleStandard,
        setStartDate,
        setPhaseOverride,
        addCustomExercise,
        hideCustomExercise,
        pull,
      },
    }),
    [state, myData, setIdentity, toggleSession, addLog, removeLog, setLadderRung, toggleStandard, setStartDate, setPhaseOverride, addCustomExercise, hideCustomExercise, pull]
  );

  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreCtx);
  if (!ctx) throw new Error('useStore must be used inside <StoreProvider>');
  return ctx;
}

export const USER_NAMES = { kevin: 'Kevin', bucky: 'Bucky' };
