// Single global store. Source of truth lives in localStorage; Supabase is
// the sync layer (debounced writes, on-mount + on-focus reads). Identity
// is whichever name was picked at first launch (Kevin or Bucky).

import { createContext, useContext, useEffect, useMemo, useReducer, useRef, useCallback } from 'react';
import { fetchAllUsers, upsertUser, SUPA_CONFIGURED } from './api/supabase.js';
import { weekId } from './utils/dates.js';
import { uid } from './utils/ids.js';

const USERS = ['kevin', 'bucky'];
const LS_IDENTITY = 'calis.identity';
const LS_DATA = (name) => `calis.data.${name}`;

const TODAY = () => new Date().toISOString().slice(0, 10);

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
        users[u] = raw ? { ...DEFAULT_DATA(), ...JSON.parse(raw) } : DEFAULT_DATA();
      } catch {
        users[u] = DEFAULT_DATA();
      }
    }
    dispatch({ type: 'hydrate', payload: { identity, users } });
  }, []);

  // ---------- pull from supabase on mount + on focus ----------
  const lastPulled = useRef(0);
  const pull = useCallback(async () => {
    if (!SUPA_CONFIGURED) return;
    const rows = await fetchAllUsers();
    rows.forEach((row) => {
      const name = (row.name || '').toLowerCase();
      if (!USERS.includes(name)) return;
      const remote = row.data || {};
      // Local has a "lastTouched" timestamp. If remote is newer, take it.
      const local = JSON.parse(localStorage.getItem(LS_DATA(name)) || '{}');
      const localTs = local._touched || 0;
      const remoteTs = new Date(row.updated_at || 0).getTime();
      if (remoteTs >= localTs) {
        const merged = { ...DEFAULT_DATA(), ...remote, _touched: remoteTs };
        localStorage.setItem(LS_DATA(name), JSON.stringify(merged));
        dispatch({ type: 'setUserData', name, data: merged });
      }
    });
    lastPulled.current = Date.now();
  }, []);

  useEffect(() => {
    if (!state.hydrated) return;
    pull();
    const onFocus = () => { if (Date.now() - lastPulled.current > 15_000) pull(); };
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [state.hydrated, pull]);

  // ---------- persist self changes (debounced supabase push) ----------
  const pushTimer = useRef(null);
  const myData = state.users[state.identity];

  useEffect(() => {
    if (!state.hydrated || !state.identity || !myData) return;
    const stamped = { ...myData, _touched: Date.now() };
    localStorage.setItem(LS_DATA(state.identity), JSON.stringify(stamped));
    if (pushTimer.current) clearTimeout(pushTimer.current);
    pushTimer.current = setTimeout(() => {
      upsertUser(state.identity, stamped);
    }, 800);
  }, [myData, state.identity, state.hydrated]);

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
        pull,
      },
    }),
    [state, myData, setIdentity, toggleSession, addLog, removeLog, setLadderRung, toggleStandard, setStartDate, setPhaseOverride, pull]
  );

  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreCtx);
  if (!ctx) throw new Error('useStore must be used inside <StoreProvider>');
  return ctx;
}

export const USER_NAMES = { kevin: 'Kevin', bucky: 'Bucky' };
