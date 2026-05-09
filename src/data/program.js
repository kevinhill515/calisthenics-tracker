// The 5 phases of the Calisthenics Mastery Plan, encoded for the app.
//
// SESSION_TYPES is the canonical 4-session week. The week tracks
// completion per session — not per day. Hit each one any day Mon–Sun.

export const SESSION_TYPES = ['Push', 'Pull', 'Skill+Legs', 'Density'];

export const SESSION_META = {
  Push:        { color: 'rose',    icon: '↑', focus: 'Planche line + horizontal/vertical pressing' },
  Pull:        { color: 'sky',     icon: '↓', focus: 'Front lever line + horizontal/vertical pulling' },
  'Skill+Legs':{ color: 'amber',   icon: '✦', focus: 'Handstand, flag, dynamic skills, lower body' },
  Density:     { color: 'emerald', icon: '⟳', focus: 'Heria-style circuit / freestyle' },
};

export const PHASES = [
  // ============ PHASE 1 ============
  {
    id: 1,
    name: 'Foundation',
    weekRange: [1, 4],
    goal: 'Establish baseline strength, joint integrity, and movement quality. Earn the right to skill-train.',
    note: 'Progression weeks 1→3: add 1 rep per set per week, or +5s on holds. Week 4 is deload (cut sets in half).',
    sessions: {
      Push: { items: [
        { ex: 'wrist-shoulder-prep', dose: '10 min' },
        { ex: 'pseudo-planche-lean', dose: '4 × 15s' },
        { ex: 'push-up',             dose: '4 × 8–12' },
        { ex: 'dip',                 dose: '4 × 6–10' },
        { ex: 'pike-pushup',         dose: '3 × 6–10' },
        { ex: 'scapular-pushup',     dose: '3 × 12' },
        { ex: 'hollow-body-hold',    dose: '3 × 30s' },
      ]},
      Pull: { items: [
        { ex: 'scapular-prep',     dose: '10 min' },
        { ex: 'german-hang',       dose: '4 × 15s (assisted, knees tucked)' },
        { ex: 'pull-up',           dose: '4 × 5–8' },
        { ex: 'australian-pullup', dose: '4 × 8–12' },
        { ex: 'tuck-fl-raise',     dose: '3 × 8' },
        { ex: 'scapular-pullup',   dose: '4 × 8' },
        { ex: 'arch-body-hold',    dose: '3 × 30s' },
      ]},
      'Skill+Legs': { items: [
        { ex: 'wrist-prep',                dose: '10 min' },
        { ex: 'wall-handstand-ctw',        dose: '5 × 30s' },
        { ex: 'frog-stand',                dose: '5 × max (entries to tuck planche)' },
        { ex: 'pistol-squat-progression',  dose: '4 × 5/leg (box assisted)' },
        { ex: 'nordic-curl-negative',      dose: '3 × 5' },
        { ex: 'calf-raise',                dose: '3 × 15' },
        { ex: 'l-sit-tuck',                dose: '5 × max (parallettes)' },
      ]},
      Density: { note: '3 rounds, minimal rest', items: [
        { ex: 'push-up',          dose: '10' },
        { ex: 'pull-up',          dose: '8' },
        { ex: 'dip',              dose: '10' },
        { ex: 'squat',            dose: '15' },
        { ex: 'hollow-body-hold', dose: '30s' },
      ]},
    },
  },

  // ============ PHASE 2 ============
  {
    id: 2,
    name: 'Strength Base',
    weekRange: [5, 12],
    goal: 'Build the strict pulling, pressing, and core strength all advanced skills depend on. Introduce the easiest static skill variations.',
    note: '3 weeks loading, week 4 deload. Cycle: weeks 5–7 build, 8 deload, 9–11 build, 12 deload.',
    sessions: {
      Push: { items: [
        { ex: 'wrist-shoulder-prep',   dose: '10 min' },
        { ex: 'tuck-planche',          dose: '5 × 8–15s (rest 2 min)', skill: true },
        { ex: 'pseudo-planche-pushup', dose: '4 × 6–8' },
        { ex: 'diamond-pushup',        dose: '4 × 8–12' },
        { ex: 'ring-dip',              dose: '4 × 6–10 (or parallette dips)' },
        { ex: 'pike-pushup',           dose: '4 × 5–8 (feet elevated → wall)' },
        { ex: 'hollow-rock',           dose: '3 × 30s' },
      ]},
      Pull: { items: [
        { ex: 'scapular-prep',     dose: '10 min' },
        { ex: 'tuck-fl',           dose: '5 × 8–15s', skill: true },
        { ex: 'weighted-pullup',   dose: '4 × 5 (start +5lb, add weekly)' },
        { ex: 'fl-row',            dose: '4 × 6–8 (tuck)' },
        { ex: 'australian-pullup', dose: '4 × 8–10 (feet elevated)' },
        { ex: 'scapular-pullup',   dose: '3 × 30s + active hang' },
        { ex: 'arch-rock',         dose: '3 × 30s' },
      ]},
      'Skill+Legs': { items: [
        { ex: 'wrist-prep',                dose: '10 min' },
        { ex: 'wall-walk',                 dose: '5 reps' },
        { ex: 'wall-handstand-ctw',        dose: '5 × 45s' },
        { ex: 'handstand-kickup',          dose: '10 attempts' },
        { ex: 'vertical-pole-press',       dose: '4 × 20s/side' },
        { ex: 'side-plank-leg-raised',     dose: '4 × 30s/side' },
        { ex: 'bulgarian-split-squat',     dose: '4 × 8/leg' },
        { ex: 'nordic-curl-negative',      dose: '4 × 5' },
        { ex: 'l-sit-tuck',                dose: '5 × max (→ advanced tuck)' },
      ]},
      Density: { note: '4 rounds', items: [
        { ex: 'explosive-pullup', dose: '8 (chest to bar)' },
        { ex: 'archer-pushup',    dose: '10 (5/side)' },
        { ex: 'dip',              dose: '8' },
        { ex: 'burpee-pullup',    dose: '5' },
        { ex: 'l-sit-tuck',       dose: '30s' },
      ]},
    },
  },

  // ============ PHASE 3 ============
  {
    id: 3,
    name: 'Skill Acquisition',
    weekRange: [13, 24],
    goal: 'Lock in tuck planche and tuck front lever. Build advanced tuck and the muscle-up. First freestanding handstand. Begin one-arm pull-up work.',
    note: 'Static holds compound slowly. If you can hold tuck planche 15s clean, attempt advanced tuck for 5s. Chase leverage, not time on a regression.',
    sessions: {
      Push: { items: [
        { ex: 'wrist-shoulder-prep',   dose: '10–15 min' },
        { ex: 'adv-tuck-planche',      dose: '6 × 5–10s (cycle hardest clean variation)', skill: true },
        { ex: 'planche-lean-pushup',   dose: '4 × 5' },
        { ex: 'ring-dip',              dose: '4 × 5–6 (or weighted)' },
        { ex: 'wall-hspu',             dose: '4 × 4–6 (band assisted → strict)' },
        { ex: 'pseudo-planche-pushup', dose: '3 × 6 (deep)' },
        { ex: 'hollow-body-hold',      dose: '3 rounds + V-up complex' },
      ]},
      Pull: { items: [
        { ex: 'scapular-prep',  dose: '10 min' },
        { ex: 'adv-tuck-fl',    dose: '6 × 5–10s (→ straddle front lever attempts)', skill: true },
        { ex: 'fl-pull',        dose: '4 × 5 (tuck → adv tuck)' },
        { ex: 'weighted-pullup',dose: '5 × 3 (heavy)' },
        { ex: 'archer-pullup',  dose: '4 × 4/side' },
        { ex: 'ice-cream-maker',dose: '3 × 5 (tuck)' },
        { ex: 'dragon-flag-negative', dose: '4 × 5' },
      ]},
      'Skill+Legs': { items: [
        { ex: 'wrist-prep',              dose: '10 min + shoulder mobility' },
        { ex: 'wall-handstand-btw',      dose: '3 × 30s' },
        { ex: 'handstand-kickup',        dose: '10 attempts' },
        { ex: 'stalder-press-negative',  dose: '4 × 3' },
        { ex: 'explosive-pullup',        dose: '4 × 3 (sternum-to-bar)' },
        { ex: 'dip',                     dose: '4 × 5 (straight bar)' },
        { ex: 'muscle-up-negative',      dose: '4 × 3 (slow)' },
        { ex: 'flag-chamber',            dose: '4 × 8s/side' },
        { ex: 'pistol-squat',            dose: '4 × 5/leg' },
        { ex: 'nordic-curl',             dose: '4 × 5–6' },
      ]},
      Density: { note: 'EMOM 20 min, then 10 min skill flow', items: [
        { ex: 'pull-up',          dose: 'min 1: 5 reps' },
        { ex: 'dip',              dose: 'min 2: 8 reps' },
        { ex: 'push-up',          dose: 'min 3: 8 + 5 explosive' },
        { ex: 'tuck-fl',          dose: 'min 4: 30s tuck front lever or planche hold' },
      ]},
    },
  },

  // ============ PHASE 4 ============
  {
    id: 4,
    name: 'Advanced Statics',
    weekRange: [25, 40],
    goal: 'Straddle planche and straddle front lever. Strict freestanding handstand push-up. One-arm pull-up. Clean human flag.',
    note: 'Listen to elbows and shoulders. Tendons adapt slower than muscle — if anything aches sharply, deload immediately.',
    sessions: {
      Push: { items: [
        { ex: 'wrist-shoulder-prep',     dose: '15 min + finger holds' },
        { ex: 'straddle-planche',        dose: '8 × 3–8s (very low rep, very high quality)', skill: true },
        { ex: 'tuck-planche-pushup',     dose: '4 × 3 (→ adv tuck variation)' },
        { ex: 'stalder-press-negative',  dose: '4 × 3 (pseudo planche press to handstand neg)' },
        { ex: 'wall-hspu',               dose: '4 × 3–5 (ring or deficit)' },
        { ex: 'maltese-pulls',           dose: '3 × 5 (band-assisted, lying)' },
        { ex: 'hollow-body-hold',        dose: '3 × 45s (weighted)' },
      ]},
      Pull: { items: [
        { ex: 'scapular-prep',     dose: '10 min' },
        { ex: 'straddle-fl',       dose: '8 × 3–8s (→ half-lay attempts)', skill: true },
        { ex: 'fl-pull',           dose: '4 × 3 (tuck → straddle)' },
        { ex: 'oa-chin-negative',  dose: '5 × 3s descent (alternating sides)' },
        { ex: 'archer-pullup',     dose: '4 × 3/side (deep)' },
        { ex: 'weighted-pullup',   dose: '4 × 3 (BW + 30%+)' },
        { ex: 'tuck-back-lever',   dose: '5 × 5–10s (→ adv tuck → straddle)' },
        { ex: 'dragon-flag',       dose: '4 × 5' },
      ]},
      'Skill+Legs': { items: [
        { ex: 'wrist-prep',              dose: '10 min' },
        { ex: 'freestanding-handstand',  dose: '5 × max (free balance)' },
        { ex: 'press-handstand',         dose: '5 × 3 (straddle press from pike)' },
        { ex: 'freestanding-hspu',       dose: '4 × 3 (band assist → strict)' },
        { ex: 'one-arm-handstand-prep',  dose: '5 × 10s shifts/tuck holds' },
        { ex: 'full-flag',               dose: '6 × 3–8s/side' },
        { ex: 'flag-pull',               dose: '3 × 3/side (chamber to full)' },
        { ex: 'strict-muscle-up',        dose: '4 × 2–3 (slow)' },
        { ex: 'weighted-muscle-up',      dose: '3 × 1' },
        { ex: 'pistol-squat',            dose: '4 × 5/leg (weighted)' },
        { ex: 'nordic-curl',             dose: '4 × 5 (full ROM)' },
      ]},
      Density: { note: 'Lighter — recovery is critical at this phase. 3 rounds + 10 min mobility', items: [
        { ex: 'strict-muscle-up', dose: '5' },
        { ex: 'dip',              dose: '10' },
        { ex: 'push-up',          dose: '10' },
        { ex: 'l-sit-tuck',       dose: '30s' },
      ]},
    },
  },

  // ============ PHASE 5 ============
  {
    id: 5,
    name: 'Elite',
    weekRange: [41, 999],
    goal: 'Full planche, full front lever, multiple one-arm pull-ups, multiple freestanding handstand push-ups, clean human flag, combos.',
    note: 'Pick two priority skills per cycle, train heavy 2x/week, maintain everything else 1x/week. Cycle priorities every 8–12 weeks.',
    sessions: {
      Push: { items: [
        { ex: 'wrist-shoulder-prep',     dose: '15 min' },
        { ex: 'full-planche',            dose: '10 × 3–8s (straddle → full attempts)', skill: true },
        { ex: 'straddle-planche-pushup', dose: '5 × 2–3' },
        { ex: 'planche-press-from-lsit', dose: '4 × 2' },
        { ex: 'maltese',                 dose: '4 × 3s (band-assisted)' },
        { ex: 'tuck-fl',                 dose: '3 × 15s (maintenance)' },
      ]},
      Pull: { items: [
        { ex: 'scapular-prep',         dose: '10 min' },
        { ex: 'full-fl',               dose: '8 × 3–8s', skill: true },
        { ex: 'oap',                   dose: '6 × 1–2/side' },
        { ex: 'assisted-oap',          dose: '4 × 3' },
        { ex: 'fl-pull',               dose: '4 × 3 (straddle → full)' },
        { ex: 'freestanding-handstand',dose: '15 min (maintenance)' },
      ]},
      'Skill+Legs': { items: [
        { ex: 'freestanding-handstand', dose: '10 min free + press handstand work' },
        { ex: 'press-handstand',        dose: '10 min' },
        { ex: 'full-flag',              dose: '10 min holds + transitions' },
        { ex: 'ring-muscle-up',         dose: '10 min combos' },
        { ex: 'pistol-squat',           dose: '20 min lower body strength' },
      ]},
      Density: { note: 'Light density / freestyle flow + 30 min film and refine', items: [
        { ex: 'strict-muscle-up',        dose: 'combo: muscle-up → planche push-up → back lever → straddle front lever row' },
      ]},
    },
  },
];

export function phaseForWeek(weekNumber, override) {
  if (override != null) return PHASES.find(p => p.id === override) || PHASES[0];
  return PHASES.find(p => weekNumber >= p.weekRange[0] && weekNumber <= p.weekRange[1]) || PHASES[PHASES.length - 1];
}

// Deload weeks: every 4th week within phase 1 and 2 (per the program).
// Phase 3+ also follows the same 3-on/1-off rhythm.
export function isDeloadWeek(weekNumber) {
  return weekNumber > 0 && weekNumber % 4 === 0;
}
