// Warmup routines. Each routine is the "first item" of a session (Push,
// Pull, or Skill+Legs) and bundles 5–9 prep movements. Each movement is
// a regular exercise from EXERCISES — so the user can log sets/reps/secs
// against each one and PRs / phase-standard tracking still flows through.

export const WARMUP_ROUTINES = {
  'wrist-shoulder-prep': {
    name: 'Wrist + shoulder prep',
    duration: '~10 min',
    why:
      'Earns the right to load wrists in planche progressions and shoulders in pressing. Skipping this is the #1 cause of wrist tendinitis in calisthenics.',
    items: [
      { ex: 'wrist-circles',         dose: '20 each direction' },
      { ex: 'fingers-fwd-wrist-hold',dose: '30s × 2' },
      { ex: 'fingers-back-wrist-hold',dose:'30s × 2' },
      { ex: 'fingers-side-wrist-hold',dose:'20s each side' },
      { ex: 'prayer-stretch',        dose: '30s' },
      { ex: 'reverse-prayer',        dose: '30s' },
      { ex: 'scapular-pushup',       dose: '12 reps' },
      { ex: 'band-dislocate',        dose: '10 reps' },
      { ex: 'prone-ytw',             dose: '8 reps each shape' },
    ],
  },
  'scapular-prep': {
    name: 'Scapular prep',
    duration: '~10 min',
    why:
      'Wakes up scapular control — the foundation of front lever and pull-up strength. Without this, pulling power leaks at the shoulder blade.',
    items: [
      { ex: 'scapular-pullup',  dose: '8 reps × 2' },
      { ex: 'scapular-pushup',  dose: '12 reps' },
      { ex: 'banded-face-pull', dose: '15 reps' },
      { ex: 'active-hang',      dose: '20s × 2' },
      { ex: 'protraction-retraction', dose: '5s holds × 5' },
      { ex: 'banded-pull-apart',dose: '15 reps' },
      { ex: 'prone-ytw',        dose: '8 reps each shape' },
    ],
  },
  'wrist-prep': {
    name: 'Wrist prep',
    duration: '~5–10 min',
    why:
      'Handstands and planche progressions punish weak wrists. Loading the wrists daily for tendon adaptation is non-negotiable in this program.',
    items: [
      { ex: 'wrist-circles',          dose: '20 each direction' },
      { ex: 'fingers-fwd-wrist-hold', dose: '30s × 2' },
      { ex: 'fingers-back-wrist-hold',dose: '30s × 2' },
      { ex: 'fingers-side-wrist-hold',dose: '20s each side' },
      { ex: 'eccentric-wrist-flexion',dose: '8 reps each side' },
    ],
  },
};

export function isWarmup(exerciseId) {
  return Object.prototype.hasOwnProperty.call(WARMUP_ROUTINES, exerciseId);
}
