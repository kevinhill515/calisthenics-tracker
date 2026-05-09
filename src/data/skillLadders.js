// Skill progressions and foundation trackers.
//
// Each ladder is an ordered list of progression rungs. `unit` controls
// what we track for each rung — 'sec' for static holds, 'rep' for
// rep-based moves. The user's "current rung" advances when they hit the
// prescribed quality bar (handled in the UI).
//
// `tracker: true` marks a section that's NOT a sequential progression
// (e.g. Foundations) — the UI hides the progression bar and treats each
// rung as an independent stat tracker.

export const SKILL_LADDERS = [
  {
    id: 'foundations',
    name: 'Foundations — Bodyweight Basics',
    color: 'yellow',
    unit: 'rep',
    tracker: true,
    rungs: [
      { id: 'dip',              label: 'Dip (strict, max reps)',     target: 15, unit: 'rep' },
      { id: 'active-hang',      label: 'Active Hang',                 target: 60, unit: 'sec' },
      { id: 'hollow-body-hold', label: 'Hollow Body Hold',            target: 60, unit: 'sec' },
      { id: 'arch-body-hold',   label: 'Arch Body Hold',              target: 60, unit: 'sec' },
      { id: 'dragon-flag',      label: 'Dragon Flag',                 target: 5,  unit: 'rep' },
    ],
  },
  {
    id: 'planche',
    name: 'Planche Line',
    color: 'rose',
    unit: 'sec',
    rungs: [
      { id: 'pseudo-planche-lean',  label: 'Pseudo Planche Lean',      target: 30 },
      { id: 'frog-stand',           label: 'Frog Stand',                target: 30 },
      { id: 'tuck-planche',         label: 'Tuck Planche',              target: 15 },
      { id: 'adv-tuck-planche',     label: 'Advanced Tuck Planche',     target: 15 },
      { id: 'straddle-planche',     label: 'Straddle Planche',          target: 10 },
      { id: 'half-lay-planche',     label: 'Half-Lay Planche',          target: 8  },
      { id: 'full-planche',         label: 'Full Planche',              target: 5  },
      { id: 'maltese',              label: 'Maltese',                   target: 3  },
    ],
  },
  {
    id: 'front-lever',
    name: 'Front Lever Line',
    color: 'sky',
    unit: 'sec',
    rungs: [
      { id: 'tuck-fl',         label: 'Tuck Front Lever',              target: 15 },
      { id: 'adv-tuck-fl',     label: 'Advanced Tuck Front Lever',     target: 15 },
      { id: 'single-leg-fl',   label: 'Single-Leg Front Lever',        target: 10 },
      { id: 'straddle-fl',     label: 'Straddle Front Lever',          target: 10 },
      { id: 'half-lay-fl',     label: 'Half-Lay Front Lever',          target: 8  },
      { id: 'full-fl',         label: 'Full Front Lever',              target: 5  },
    ],
  },
  {
    id: 'back-lever',
    name: 'Back Lever Line',
    color: 'violet',
    unit: 'sec',
    rungs: [
      { id: 'german-hang',     label: 'German Hang',                   target: 30 },
      { id: 'tuck-back-lever', label: 'Tuck Back Lever',               target: 15 },
      { id: 'adv-tuck-bl',     label: 'Advanced Tuck Back Lever',      target: 15 },
      { id: 'straddle-bl',     label: 'Straddle Back Lever',           target: 10 },
      { id: 'full-bl',         label: 'Full Back Lever',               target: 10 },
    ],
  },
  {
    id: 'handstand',
    name: 'Handstand Line',
    color: 'amber',
    unit: 'sec',
    rungs: [
      { id: 'wall-walk',              label: 'Wall Walk (5 reps)',                  target: 5,  unit: 'rep' },
      { id: 'wall-handstand-ctw',     label: 'Wall Handstand (Chest-to-Wall)',      target: 60 },
      { id: 'wall-handstand-btw',     label: 'Wall Handstand (Back-to-Wall)',       target: 60 },
      { id: 'freestanding-handstand', label: 'Freestanding Handstand',              target: 30 },
      { id: 'press-handstand',        label: 'Press Handstand',                     target: 1, unit: 'rep' },
    ],
  },
  {
    id: 'hspu',
    name: 'Handstand Push-Up Line',
    color: 'pink',
    unit: 'rep',
    rungs: [
      { id: 'pike-pushup',         label: 'Pike Push-Up',                            target: 10 },
      { id: 'wall-hspu',           label: 'Wall Handstand Push-Up',                  target: 5  },
      { id: 'wall-straddle-hspu',  label: 'Wall Straddle Handstand Push-Up',         target: 5  },
      { id: 'freestanding-hspu',   label: 'Freestanding Handstand Push-Up',          target: 1  },
    ],
  },
  {
    id: 'pull-up',
    name: 'Pull-Up → One-Arm Pull-Up',
    color: 'emerald',
    unit: 'rep',
    rungs: [
      { id: 'pull-up',          label: 'Strict Pull-Up',                       target: 12 },
      { id: 'weighted-pullup',  label: 'Weighted Pull-Up (Bodyweight + 50%)',  target: 5  },
      { id: 'archer-pullup',    label: 'Archer Pull-Up',                       target: 5  },
      { id: 'typewriter-pullup',label: 'Typewriter Pull-Up',                   target: 3  },
      { id: 'oa-chin-negative', label: 'One-Arm Chin-Up Negative (descent)',   target: 8, unit: 'sec' },
      { id: 'assisted-oap',     label: 'Assisted One-Arm Pull-Up',             target: 5  },
      { id: 'oap',              label: 'One-Arm Pull-Up',                      target: 1  },
    ],
  },
  {
    id: 'push-line',
    name: 'Push-Up → Planche Push-Up',
    color: 'orange',
    unit: 'rep',
    rungs: [
      { id: 'push-up',                 label: 'Push-Up',                  target: 30 },
      { id: 'diamond-pushup',          label: 'Diamond Push-Up',          target: 15 },
      { id: 'pseudo-planche-pushup',   label: 'Pseudo Planche Push-Up',   target: 8  },
      { id: 'tuck-planche-pushup',     label: 'Tuck Planche Push-Up',     target: 5  },
      { id: 'straddle-planche-pushup', label: 'Straddle Planche Push-Up', target: 3  },
      { id: 'full-planche',            label: 'Full Planche Push-Up',     target: 1  },
    ],
  },
  {
    id: 'flag',
    name: 'Human Flag Line',
    color: 'fuchsia',
    unit: 'sec',
    rungs: [
      { id: 'vertical-pole-press',    label: 'Vertical Pole Press',           target: 20 },
      { id: 'side-plank-leg-raised',  label: 'Side Plank, Top Leg Raised',    target: 30 },
      { id: 'flag-chamber',           label: 'Flag Chamber Hold',             target: 10 },
      { id: 'flag-top-leg-extended',  label: 'Top-Leg-Extended Flag',         target: 8  },
      { id: 'full-flag',              label: 'Full Human Flag',               target: 5  },
      { id: 'flag-pull',              label: 'Flag Pulls / Presses',          target: 3, unit: 'rep' },
    ],
  },
  {
    id: 'muscle-up',
    name: 'Muscle-Up Line',
    color: 'cyan',
    unit: 'rep',
    rungs: [
      { id: 'pull-up',            label: 'Strict Pull-Up + Strict Dip',    target: 1 },
      { id: 'explosive-pullup',   label: 'Explosive Pull-Up (Chest-to-Bar)', target: 5 },
      { id: 'bar-muscle-up',      label: 'Bar Muscle-Up (Kipped)',          target: 3 },
      { id: 'strict-muscle-up',   label: 'Strict Bar Muscle-Up',            target: 3 },
      { id: 'ring-muscle-up',     label: 'Ring Muscle-Up',                  target: 1 },
      { id: 'weighted-muscle-up', label: 'Weighted Muscle-Up',              target: 1 },
    ],
  },
  {
    id: 'l-sit',
    name: 'L-Sit / Compression',
    color: 'lime',
    unit: 'sec',
    rungs: [
      { id: 'l-sit-tuck',           label: 'Tuck L-Sit',          target: 30 },
      { id: 'l-sit-advanced-tuck',  label: 'Advanced Tuck L-Sit', target: 20 },
      { id: 'l-sit-one-leg',        label: 'One-Leg L-Sit',       target: 15 },
      { id: 'l-sit-full',           label: 'Full L-Sit',          target: 30 },
      { id: 'v-sit',                label: 'V-Sit',               target: 10 },
      { id: 'manna',                label: 'Manna',               target: 5  },
    ],
  },
  {
    id: 'lower-body',
    name: 'Lower Body — Pistol Squat Line',
    color: 'teal',
    unit: 'rep',
    rungs: [
      { id: 'bulgarian-split-squat',    label: 'Bulgarian Split Squat',        target: 8 },
      { id: 'pistol-squat-progression', label: 'Pistol Squat (box assisted)',  target: 5 },
      { id: 'pistol-squat',             label: 'Pistol Squat',                 target: 5 },
      { id: 'weighted-pistol-squat',    label: 'Weighted Pistol Squat',        target: 5 },
      { id: 'shrimp-squat',             label: 'Shrimp Squat',                 target: 5 },
    ],
  },
  {
    id: 'hamstrings',
    name: 'Hamstrings — Nordic Curl Line',
    color: 'indigo',
    unit: 'rep',
    rungs: [
      { id: 'nordic-curl-negative', label: 'Nordic Curl (negative only)', target: 5 },
      { id: 'nordic-curl',          label: 'Nordic Curl (full)',           target: 5 },
      { id: 'weighted-nordic-curl', label: 'Weighted Nordic Curl',         target: 3 },
    ],
  },
];
