// Phase entry/exit standards. Each is { id, label, exerciseId, target, unit }.
// `exerciseId` is the skill PR row that auto-fills `current best` from logs.

export const PHASE_STANDARDS = {
  1: [
    { id: 'p1-pushup',  label: 'Push-ups (strict)',         exerciseId: 'push-up',           target: 20, unit: 'rep' },
    { id: 'p1-pullup',  label: 'Pull-ups (strict)',         exerciseId: 'pull-up',           target: 8,  unit: 'rep' },
    { id: 'p1-dip',     label: 'Dips (strict)',             exerciseId: 'dip',               target: 10, unit: 'rep' },
    { id: 'p1-hollow',  label: 'Hollow body hold',          exerciseId: 'hollow-body-hold',  target: 30, unit: 'sec' },
    { id: 'p1-hang',    label: 'Active hang',               exerciseId: 'scapular-pullup',   target: 30, unit: 'sec' },
  ],
  2: [
    { id: 'p2-pullup',  label: 'Pull-ups (strict)',         exerciseId: 'pull-up',           target: 12, unit: 'rep' },
    { id: 'p2-dip',     label: 'Dips (strict)',             exerciseId: 'dip',               target: 15, unit: 'rep' },
    { id: 'p2-pike',    label: 'Pike push-ups',             exerciseId: 'pike-pushup',       target: 10, unit: 'rep' },
    { id: 'p2-tuckpl',  label: 'Tuck planche (clean)',      exerciseId: 'tuck-planche',      target: 15, unit: 'sec' },
    { id: 'p2-tuckfl',  label: 'Tuck front lever (clean)',  exerciseId: 'tuck-fl',           target: 15, unit: 'sec' },
    { id: 'p2-wallhs',  label: 'Wall handstand (chest)',    exerciseId: 'wall-handstand-ctw',target: 60, unit: 'sec' },
    { id: 'p2-lsit',    label: 'L-sit (tuck)',              exerciseId: 'l-sit-tuck',        target: 20, unit: 'sec' },
  ],
  3: [
    { id: 'p3-advtpl',  label: 'Advanced tuck planche',     exerciseId: 'adv-tuck-planche',  target: 10, unit: 'sec' },
    { id: 'p3-advtfl',  label: 'Advanced tuck FL',          exerciseId: 'adv-tuck-fl',       target: 10, unit: 'sec' },
    { id: 'p3-mu',      label: 'Strict muscle-up',          exerciseId: 'strict-muscle-up',  target: 1,  unit: 'rep' },
    { id: 'p3-fhs',     label: 'Freestanding handstand',    exerciseId: 'freestanding-handstand', target: 10, unit: 'sec' },
    { id: 'p3-oapneg',  label: 'One-arm chin negative',     exerciseId: 'oa-chin-negative',  target: 5,  unit: 'sec' },
    { id: 'p3-strhspu', label: 'Wall straddle HSPU',        exerciseId: 'wall-straddle-hspu',target: 5,  unit: 'rep' },
    { id: 'p3-flag',    label: 'Human flag (chamber/tuck)', exerciseId: 'flag-chamber',      target: 8,  unit: 'sec' },
  ],
  4: [
    { id: 'p4-strpl',   label: 'Straddle planche',          exerciseId: 'straddle-planche',  target: 5,  unit: 'sec' },
    { id: 'p4-strfl',   label: 'Straddle front lever',      exerciseId: 'straddle-fl',       target: 5,  unit: 'sec' },
    { id: 'p4-fhspu',   label: 'Freestanding HSPU',         exerciseId: 'freestanding-hspu', target: 1,  unit: 'rep' },
    { id: 'p4-oap',     label: 'One-arm pull-up',           exerciseId: 'oap',               target: 1,  unit: 'rep' },
    { id: 'p4-flag',    label: 'Full human flag',           exerciseId: 'full-flag',         target: 5,  unit: 'sec' },
    { id: 'p4-bl',      label: 'Back lever (full)',         exerciseId: 'full-bl',           target: 10, unit: 'sec' },
  ],
  5: [
    { id: 'p5-pl',      label: 'Full planche',              exerciseId: 'full-planche',      target: 3,  unit: 'sec' },
    { id: 'p5-fl',      label: 'Full front lever',          exerciseId: 'full-fl',           target: 3,  unit: 'sec' },
    { id: 'p5-oap',     label: 'Multiple OAP (each side)',  exerciseId: 'oap',               target: 2,  unit: 'rep' },
    { id: 'p5-fhspu',   label: 'Multiple freestanding HSPU',exerciseId: 'freestanding-hspu', target: 3,  unit: 'rep' },
    { id: 'p5-rmu',     label: 'Clean ring muscle-up',      exerciseId: 'ring-muscle-up',    target: 1,  unit: 'rep' },
  ],
};
