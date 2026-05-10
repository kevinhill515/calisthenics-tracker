// Exercise dictionary. Each entry has a short cue (how-to) and a YouTube
// search URL. Search URLs are used over hardcoded video IDs so links don't
// rot — clicking opens YouTube with a curated query that surfaces tutorials
// from FitnessFAQs / Chris Heria / similar trusted sources.

const yt = (q) =>
  'https://www.youtube.com/results?search_query=' + encodeURIComponent(q);

export const EXERCISES = {
  // ---------- warmup movements (bundled into routines via warmups.js) ----------
  'wrist-circles': {
    name: 'Wrist circles',
    cue: 'Interlace fingers in front of chest, slowly circle wrists in both directions through full range of motion.',
    yt: yt('wrist circles warmup'),
  },
  'fingers-fwd-wrist-hold': {
    name: 'Fingers-forward wrist hold',
    cue: 'On all fours, hands flat on the floor with fingers pointing toward your knees. Slowly rock weight forward and back over the wrists. Should feel a strong stretch in the inner forearms.',
    yt: yt('fingers forward wrist stretch'),
  },
  'fingers-back-wrist-hold': {
    name: 'Fingers-back wrist hold',
    cue: 'On all fours, hands flat on the floor with fingers pointing AWAY from you (palms still down). Slowly rock weight back over the heels of the hands.',
    yt: yt('fingers back wrist stretch'),
  },
  'fingers-side-wrist-hold': {
    name: 'Fingers-sideways wrist hold',
    cue: 'On all fours, fingers pointing to the right, slowly rock weight side to side. Switch to fingers pointing left.',
    yt: yt('sideways wrist stretch'),
  },
  'prayer-stretch': {
    name: 'Prayer stretch',
    cue: 'Palms together at chest height. Slowly lower the hands toward your waist while keeping the palms pressed together. Stop when you feel a strong stretch in the inner forearms.',
    yt: yt('prayer stretch wrists'),
  },
  'reverse-prayer': {
    name: 'Reverse prayer stretch',
    cue: 'Backs of hands pressed together at chest height. Slowly raise upward as far as you can while keeping the backs of hands touching.',
    yt: yt('reverse prayer stretch'),
  },
  'band-dislocate': {
    name: 'Band dislocates',
    cue: 'Hold a resistance band wide overhead with straight arms. Rotate it backward over your head until it touches your back, then forward over your head. Wider grip = easier.',
    yt: yt('band dislocates shoulder'),
  },
  'prone-ytw': {
    name: 'Prone Y / T / W raises',
    cue: 'Lying face-down: arms in a Y overhead, lift hands off the floor. Lower. Then T (arms straight out). Then W (elbows bent, hands by ears). Squeeze shoulder blades on each rep.',
    yt: yt('prone y t w raises'),
  },
  'banded-face-pull': {
    name: 'Banded face pulls',
    cue: 'Anchor a band at face height. Pull both ends to your face with elbows wide and high. Squeeze the rear delts at the end. Slow eccentric back to start.',
    yt: yt('banded face pull'),
  },
  'banded-pull-apart': {
    name: 'Band pull-aparts',
    cue: 'Hold a band wide at chest height with straight arms. Pull arms wide, squeeze shoulder blades together hard. Slow back to start.',
    yt: yt('band pull apart'),
  },
  'protraction-retraction': {
    name: 'Protraction / retraction holds',
    cue: 'In a plank with locked-out arms, slowly cycle through full protraction (push the floor away, upper back rounds) and full retraction (pinch blades, chest sinks).',
    yt: yt('scapular protraction retraction plank'),
  },
  'eccentric-wrist-flexion': {
    name: 'Eccentric loaded wrist flexion',
    cue: 'Hold a light dumbbell in one hand, palm up, forearm resting on a bench so the wrist hangs over the edge. Slowly lower the wrist down (eccentric only); use the other hand to reset the weight. Build tendon strength over weeks.',
    yt: yt('eccentric wrist flexion'),
  },

  // ---------- prep (legacy / aggregate) ----------
  'wrist-shoulder-prep': {
    name: 'Wrist + shoulder prep',
    cue: '10 min routine: wrist circles, fingers-forward holds, fingers-back holds, prayer + reverse prayer stretches, scapular push-ups, band dislocates, prone Y/T/W raises.',
    yt: yt('wrist shoulder warm up calisthenics'),
  },
  'wrist-prep': {
    name: 'Wrist prep',
    cue: '5–10 min: fingers forward/back/sideways floor holds, wrist circles, eccentric loaded flexion. Earn the ability to handstand and planche.',
    yt: yt('wrist prep planche fitnessfaqs'),
  },
  'scapular-prep': {
    name: 'Scapular prep',
    cue: '10 min: scap pulls, scap push-ups, protraction/retraction holds, banded face pulls. Wakes up the muscles that own the front lever.',
    yt: yt('scapular prep front lever'),
  },

  // ---------- planche line ----------
  'pseudo-planche-lean': {
    name: 'Pseudo planche lean (PPL)',
    cue: 'Plank with hands by hips, fingers pointing back. Lean shoulders forward over the wrists, arms straight, hips down, glutes squeezed.',
    yt: yt('pseudo planche lean tutorial'),
  },
  'frog-stand': {
    name: 'Frog stand',
    cue: 'Hands flat on floor, elbows tucked into knees, lean weight forward and lift feet. Builds the wrist + balance for tuck planche.',
    yt: yt('frog stand to tuck planche fitnessfaqs'),
  },
  'tuck-planche': {
    name: 'Tuck planche',
    cue: 'Knees pulled tight to chest, hips above shoulders, arms straight, scapulae protracted (push the floor away). Hold quality > hold time.',
    yt: yt('tuck planche tutorial fitnessfaqs'),
  },
  'adv-tuck-planche': {
    name: 'Advanced tuck planche',
    cue: 'Tuck planche but with a flat back — knees move away from chest, hips drop to shoulder height. Big jump in difficulty from tuck.',
    yt: yt('advanced tuck planche tutorial'),
  },
  'straddle-planche': {
    name: 'Straddle planche',
    cue: 'Legs straight and split wide, body parallel to floor, scapulae fully protracted. The jump from advanced tuck takes months.',
    yt: yt('straddle planche progression'),
  },
  'half-lay-planche': {
    name: 'Half-lay planche',
    cue: 'Legs together but bent at the hips ~90°. Bridge between straddle and full planche.',
    yt: yt('half lay planche'),
  },
  'full-planche': {
    name: 'Full planche',
    cue: 'Body fully horizontal, legs straight together, parallel to floor. Elite static — straight-arm strength is the limiter.',
    yt: yt('full planche tutorial'),
  },
  'maltese': {
    name: 'Maltese',
    cue: 'Beyond full planche — body and arms parallel to floor, hands at hip level. Years of straight-arm strength work.',
    yt: yt('maltese gymnastics'),
  },
  'planche-lean-pushup': {
    name: 'Planche lean push-up',
    cue: 'Push-up from a deep planche lean position. Trains the same line as planche under load.',
    yt: yt('planche lean push up'),
  },
  'tuck-planche-pushup': {
    name: 'Tuck planche push-up',
    cue: 'From tuck planche, lower chest down and press back up. Strict, no rocking.',
    yt: yt('tuck planche push up'),
  },
  'straddle-planche-pushup': {
    name: 'Straddle planche push-up',
    cue: 'Press from straddle planche. Crushing for shoulders.',
    yt: yt('straddle planche push up'),
  },
  'full-planche-pushup': {
    name: 'Full planche push-up',
    cue: 'From full planche, lower chest to the floor with arms straight throughout, then press back up. Top of the calisthenics pushing tree.',
    yt: yt('full planche push up'),
  },
  'planche-press-from-lsit': {
    name: 'Planche press from L-sit',
    cue: 'From L-sit on parallettes, press up into planche with straight arms. Compression + straight-arm strength.',
    yt: yt('planche press from l sit'),
  },
  'maltese-pulls': {
    name: 'Maltese pulls (band-assisted)',
    cue: 'Lying on bench/floor with band assist — pull straight arms from overhead to maltese position. Builds Maltese-specific strength.',
    yt: yt('maltese pulls band'),
  },

  // ---------- front lever line ----------
  'german-hang': {
    name: 'German hang (skin-the-cat hold)',
    cue: 'From a hang, pull legs through your arms until you hang behind. Knees tucked or assisted to start. Massive shoulder mobility builder.',
    yt: yt('german hang tutorial'),
  },
  'tuck-fl-raise': {
    name: 'Tuck front lever raise (feet on ground)',
    cue: 'Hang from the bar, lift hips into tuck front lever position by pulling shoulders down and back. Lower with control.',
    yt: yt('tuck front lever raise'),
  },
  'tuck-fl': {
    name: 'Tuck front lever',
    cue: 'Hang under the bar, knees to chest, body parallel to floor. Lats engaged, scapulae depressed.',
    yt: yt('tuck front lever fitnessfaqs'),
  },
  'adv-tuck-fl': {
    name: 'Advanced tuck front lever',
    cue: 'Tuck front lever with a flat back — knees away from chest, hips drop. The honest progression check before straddle.',
    yt: yt('advanced tuck front lever'),
  },
  'single-leg-fl': {
    name: 'Single-leg front lever',
    cue: 'One leg straight, other tucked. Halfway between adv tuck and straddle.',
    yt: yt('single leg front lever'),
  },
  'straddle-fl': {
    name: 'Straddle front lever',
    cue: 'Legs straight and split wide, body parallel to floor. Big leverage step from advanced tuck.',
    yt: yt('straddle front lever progression'),
  },
  'half-lay-fl': {
    name: 'Half-lay front lever',
    cue: 'Legs together but bent at hips ~90°. Last stop before full front lever.',
    yt: yt('half lay front lever'),
  },
  'full-fl': {
    name: 'Full front lever',
    cue: 'Body fully horizontal, legs straight together. Lats own this hold.',
    yt: yt('full front lever tutorial'),
  },
  'fl-row': {
    name: 'Front lever row',
    cue: 'From front lever (any progression), pull bar to chest while staying horizontal. Lower with control.',
    yt: yt('front lever row tuck'),
  },
  'fl-pull': {
    name: 'Front lever pull',
    cue: 'From dead hang, pull up into front lever position keeping arms straight, then lower. Trains the entry to front lever.',
    yt: yt('front lever pull straight arm'),
  },
  'ice-cream-maker': {
    name: 'Ice cream makers',
    cue: 'From top of pull-up, lean back to inverted hang with control, return. Brutal lat + bicep eccentric.',
    yt: yt('ice cream makers calisthenics'),
  },
  'dragon-flag': {
    name: 'Dragon flag',
    cue: 'Lying on bench gripping behind head, lift entire body straight off the bench, lower slowly. Stalin-level core.',
    yt: yt('dragon flag tutorial'),
  },
  'dragon-flag-negative': {
    name: 'Dragon flag negative',
    cue: 'Same as dragon flag but only the eccentric — lower as slow as possible from vertical.',
    yt: yt('dragon flag negative'),
  },

  // ---------- back lever line ----------
  'tuck-back-lever': {
    name: 'Tuck back lever',
    cue: 'From a german hang, tuck knees to chest with body parallel to the floor, facing down. First real back lever hold.',
    yt: yt('tuck back lever'),
  },
  'adv-tuck-bl': {
    name: 'Advanced tuck back lever',
    cue: 'Tuck back lever with a flat back. Knees away from chest.',
    yt: yt('advanced tuck back lever'),
  },
  'straddle-bl': {
    name: 'Straddle back lever',
    cue: 'Legs straight, wide split. Brutal on biceps and elbows — warm up thoroughly.',
    yt: yt('straddle back lever'),
  },
  'full-bl': {
    name: 'Full back lever',
    cue: 'Legs straight together, body parallel to floor face-down. Huge bicep tendon demand — never skip prep.',
    yt: yt('full back lever tutorial'),
  },

  // ---------- handstand line ----------
  'wall-walk': {
    name: 'Wall walk',
    cue: 'From plank, walk feet up the wall while hands move toward the wall, ending in chest-to-wall handstand. Walk back down.',
    yt: yt('wall walk handstand'),
  },
  'wall-handstand-ctw': {
    name: 'Wall handstand (chest-to-wall)',
    cue: 'Belly facing the wall, fully vertical, hands ~6" from the wall. The honest handstand position. Hold quietly.',
    yt: yt('chest to wall handstand'),
  },
  'wall-handstand-btw': {
    name: 'Wall handstand (back-to-wall)',
    cue: 'Back facing the wall — easier balance but tends to leave you arched. Use heel pulls / toe pulls to find balance.',
    yt: yt('back to wall handstand'),
  },
  'freestanding-handstand': {
    name: 'Freestanding handstand',
    cue: 'Kick up to balance, fingers gripping the floor, hollow body, eyes on hands. Practice often, never to failure.',
    yt: yt('freestanding handstand tutorial'),
  },
  'handstand-kickup': {
    name: 'Handstand kick-up practice',
    cue: 'Practice kicking up to balance away from the wall. 10 quality attempts > 30 sloppy ones.',
    yt: yt('handstand kick up to balance'),
  },
  'stalder-press-negative': {
    name: 'Stalder press negative',
    cue: 'From handstand, lower with straight arms and bent legs (or straddle) to L-sit/pike. Eccentric for press handstand.',
    yt: yt('stalder press handstand negative'),
  },
  'press-handstand': {
    name: 'Press handstand (straddle)',
    cue: 'From standing pike, lift hips overhead with straight arms while pressing into a straddle handstand. Compression-heavy.',
    yt: yt('straddle press handstand'),
  },
  'wall-hspu': {
    name: 'Wall handstand push-up',
    cue: 'Chest-to-wall handstand, lower head to the floor, press back up. Use bands or pike progression to build to strict.',
    yt: yt('wall handstand push up'),
  },
  'wall-straddle-hspu': {
    name: 'Wall straddle handstand push-up',
    cue: 'Wall handstand push-up with legs in a straddle to keep balance easier while still strict.',
    yt: yt('wall straddle handstand push up'),
  },
  'freestanding-hspu': {
    name: 'Freestanding handstand push-up',
    cue: 'Strict handstand push-up with no wall. Kick up, lower head, press up without losing balance.',
    yt: yt('freestanding handstand push up'),
  },
  'one-arm-handstand-prep': {
    name: 'One-arm handstand prep',
    cue: 'Weight shifts in handstand, one-arm tuck holds against wall. Build slowly — wrists pay the price for impatience.',
    yt: yt('one arm handstand prep'),
  },

  // ---------- pull line / one-arm pull-up ----------
  'pull-up': {
    name: 'Pull-up',
    cue: 'Dead hang start, chin clearly over bar, no kipping. Scapulae depress before elbows bend.',
    yt: yt('strict pull up form'),
  },
  'weighted-pullup': {
    name: 'Weighted pull-up',
    cue: 'Strict pull-up with weight belt or vest. Add ~2.5–5 lb per week.',
    yt: yt('weighted pull up'),
  },
  'archer-pullup': {
    name: 'Archer pull-up',
    cue: 'Pull up to one shoulder while the opposite arm stays straight. Steady tempo, no kipping.',
    yt: yt('archer pull up tutorial'),
  },
  'typewriter-pullup': {
    name: 'Typewriter pull-up',
    cue: 'Pull up, then slide horizontally side to side at the top. Insane lat strength.',
    yt: yt('typewriter pull up'),
  },
  'oa-chin-negative': {
    name: 'One-arm chin-up negative',
    cue: 'From the top of a chin-up (palm to face), let go with one hand and lower as slowly as possible. Track descent in seconds.',
    yt: yt('one arm chin up negative'),
  },
  'assisted-oap': {
    name: 'Assisted one-arm pull-up',
    cue: 'One-arm pull-up using a band, towel, or other-hand assist. Reduce the assistance over time.',
    yt: yt('assisted one arm pull up band'),
  },
  'oap': {
    name: 'One-arm pull-up',
    cue: 'Strict one-arm pull-up: no kipping, chin clears the bar. The grail of pulling.',
    yt: yt('one arm pull up tutorial'),
  },
  'australian-pullup': {
    name: 'Australian pull-up (inverted row)',
    cue: 'Hang under a low bar, body straight, pull chest to bar. Elevate feet to make harder.',
    yt: yt('australian pull up inverted row'),
  },
  'scapular-pullup': {
    name: 'Scapular pull-up',
    cue: 'Dead hang, depress and retract scapulae without bending elbows. Owns the front lever pull.',
    yt: yt('scapular pull up'),
  },
  'active-hang': {
    name: 'Active hang',
    cue: 'Dead hang from the bar with shoulders engaged (scapulae depressed and slightly retracted). Not a passive ragdoll hang — keep tension. Track time.',
    yt: yt('active hang vs passive hang'),
  },

  // ---------- push line ----------
  'push-up': {
    name: 'Push-up',
    cue: 'Plank position, lower chest to floor with elbows ~45°, full lockout. Strict tempo.',
    yt: yt('strict push up form'),
  },
  'diamond-pushup': {
    name: 'Diamond push-up',
    cue: 'Hands together forming a diamond under sternum. Smashes triceps.',
    yt: yt('diamond push up'),
  },
  'pseudo-planche-pushup': {
    name: 'Pseudo planche push-up',
    cue: 'Push-up with hands by hips, fingers pointing back, lean forward as you lower.',
    yt: yt('pseudo planche push up'),
  },
  'pike-pushup': {
    name: 'Pike push-up',
    cue: 'Downward-dog position, lower head between hands, press back up. Vertical pressing precursor to the handstand push-up.',
    yt: yt('pike push up tutorial'),
  },
  'archer-pushup': {
    name: 'Archer push-up',
    cue: 'Wide hands, push-up to one side while the opposite arm stays nearly straight. Builds OA push.',
    yt: yt('archer push up tutorial'),
  },
  'dip': {
    name: 'Dip',
    cue: 'Parallel bars, lower until shoulders are below elbows, full lockout up. No kipping.',
    yt: yt('strict dip parallel bars'),
  },
  'ring-dip': {
    name: 'Ring dip',
    cue: 'Dip on rings — instability adds shoulder demand. Turn rings out at top.',
    yt: yt('ring dip tutorial'),
  },
  'weighted-dip': {
    name: 'Weighted dip',
    cue: 'Strict dip with weight belt. Don\'t shrug — keep shoulders down.',
    yt: yt('weighted dip form'),
  },
  'scapular-pushup': {
    name: 'Scapular push-up',
    cue: 'Plank position, protract and retract scapulae without bending elbows. Wake-up for pressing.',
    yt: yt('scapular push up'),
  },

  // ---------- muscle-up line ----------
  'explosive-pullup': {
    name: 'Explosive pull-up (chest-to-bar)',
    cue: 'Strict pull where chest hits the bar — taught for muscle-up transition. No kipping.',
    yt: yt('explosive pull up chest to bar'),
  },
  'muscle-up-negative': {
    name: 'Slow muscle-up negative',
    cue: 'From the top of a muscle-up (dip lockout), lower slowly through the transition. The fastest way to learn the move.',
    yt: yt('slow muscle up negative'),
  },
  'bar-muscle-up': {
    name: 'Bar muscle-up (kipped)',
    cue: 'Explosive pull, hip drive, transition over the bar. Fine as a stepping stone — but the goal is strict.',
    yt: yt('bar muscle up tutorial'),
  },
  'strict-muscle-up': {
    name: 'Strict muscle-up',
    cue: 'No kip, no swing — pull, transition, dip. Slow and clean.',
    yt: yt('strict muscle up'),
  },
  'ring-muscle-up': {
    name: 'Ring muscle-up',
    cue: 'False grip, pull, transition with rings turning out. Hardest variation due to instability.',
    yt: yt('ring muscle up tutorial'),
  },
  'weighted-muscle-up': {
    name: 'Weighted muscle-up',
    cue: 'Strict muscle-up with added load. Save for late phase 4 / phase 5.',
    yt: yt('weighted muscle up'),
  },
  'burpee-pullup': {
    name: 'Burpee pull-up',
    cue: 'Burpee → jump for the bar → pull-up. Conditioning circuit.',
    yt: yt('burpee pull up'),
  },

  // ---------- human flag line ----------
  'vertical-pole-press': {
    name: 'Vertical pole press',
    cue: 'Stand next to vertical pole, press top hand against pole, build straight-arm shoulder strength one side at a time.',
    yt: yt('vertical pole press flag'),
  },
  'side-plank-leg-raised': {
    name: 'Side plank with top leg raised',
    cue: 'Side plank, lift top leg parallel to floor. Owns the obliques.',
    yt: yt('side plank top leg raise'),
  },
  'flag-chamber': {
    name: 'Flag chamber hold (top leg only)',
    cue: 'Grip pole, body sideways, knees tucked or top leg only extended. First real flag hold.',
    yt: yt('human flag chamber hold'),
  },
  'flag-top-leg-extended': {
    name: 'Top-leg-extended flag',
    cue: 'Top leg straight out, bottom leg tucked. Halfway to full.',
    yt: yt('human flag top leg extended'),
  },
  'full-flag': {
    name: 'Full human flag',
    cue: 'Body sideways and straight, both legs extended, parallel to ground. The whole body fights gravity.',
    yt: yt('full human flag tutorial'),
  },
  'flag-pull': {
    name: 'Flag pulls',
    cue: 'From chamber, pull body up and back down. Trains entry to full flag.',
    yt: yt('human flag pulls'),
  },

  // ---------- core / L-sit ----------
  'l-sit-tuck': {
    name: 'L-sit (tuck)',
    cue: 'On parallettes/floor, knees up, feet off floor, arms straight, lift body off ground.',
    yt: yt('tuck l sit'),
  },
  'l-sit-advanced-tuck': {
    name: 'L-sit (advanced tuck)',
    cue: 'L-sit with knees away from chest, shins horizontal. Bridge to one-leg.',
    yt: yt('advanced tuck l sit'),
  },
  'l-sit-one-leg': {
    name: 'L-sit (one leg)',
    cue: 'One leg straight, other tucked. Side-to-side training builds toward full L-sit.',
    yt: yt('one leg l sit'),
  },
  'l-sit-full': {
    name: 'L-sit (full)',
    cue: 'Both legs straight and horizontal, hips compressed. Demands compression strength.',
    yt: yt('full l sit'),
  },
  'v-sit': {
    name: 'V-sit',
    cue: 'L-sit but legs lifted higher than horizontal toward V shape. Rare compression.',
    yt: yt('v sit progression'),
  },
  'manna': {
    name: 'Manna',
    cue: 'Behind-the-arms compression beyond V-sit. Years of compression flexibility.',
    yt: yt('manna gymnastics tutorial'),
  },
  'hollow-body-hold': {
    name: 'Hollow body hold',
    cue: 'On back, low back pressed to floor, arms overhead, legs straight just off the ground. Owns midline.',
    yt: yt('hollow body hold tutorial'),
  },
  'arch-body-hold': {
    name: 'Arch body hold',
    cue: 'Face down, arms overhead, lift chest and legs off the floor. Posterior chain mirror to hollow.',
    yt: yt('arch body hold superman'),
  },
  'hollow-rock': {
    name: 'Hollow body rock',
    cue: 'Hollow position, rock back and forth without losing the shape.',
    yt: yt('hollow body rock'),
  },
  'arch-rock': {
    name: 'Arch body rock',
    cue: 'Arch position, rock back and forth without losing the shape.',
    yt: yt('arch body rock'),
  },
  'v-up': {
    name: 'V-up',
    cue: 'From flat, sit up while reaching hands to feet, forming a V. Dynamic compression.',
    yt: yt('v up exercise'),
  },

  // ---------- legs ----------
  'pistol-squat': {
    name: 'Pistol squat',
    cue: 'Single-leg squat to full depth, opposite leg straight. Use a counterweight or box assist to start.',
    yt: yt('pistol squat tutorial'),
  },
  'weighted-pistol-squat': {
    name: 'Weighted pistol squat',
    cue: 'Pistol squat with a dumbbell or kettlebell held at chest. Keep the heel down and the back leg from the floor.',
    yt: yt('weighted pistol squat'),
  },
  'shrimp-squat': {
    name: 'Shrimp squat',
    cue: 'Single-leg squat with the back foot held behind by the same-side hand, knee tracks straight ahead, descent under control.',
    yt: yt('shrimp squat tutorial'),
  },
  'pistol-squat-progression': {
    name: 'Pistol squat progression',
    cue: 'Box-assisted pistol → grab toe pistol → free pistol. One step at a time.',
    yt: yt('pistol squat progression box'),
  },
  'bulgarian-split-squat': {
    name: 'Bulgarian split squat',
    cue: 'Rear foot elevated on bench, drop into split, front knee tracks toes.',
    yt: yt('bulgarian split squat form'),
  },
  'nordic-curl-negative': {
    name: 'Nordic curl negative',
    cue: 'Knees padded, feet anchored, lower body forward with hamstrings until you fall, push back up. Eccentric only at first.',
    yt: yt('nordic curl negative'),
  },
  'nordic-curl': {
    name: 'Nordic curl',
    cue: 'Full Nordic — eccentric and concentric on hamstrings alone. Brutal.',
    yt: yt('nordic curl tutorial'),
  },
  'weighted-nordic-curl': {
    name: 'Weighted Nordic curl',
    cue: 'Full Nordic with a plate or dumbbell held at the chest. Add load only after multiple clean unweighted reps.',
    yt: yt('weighted nordic curl'),
  },
  'calf-raise': {
    name: 'Calf raise',
    cue: 'Slow up, full range pause at top, controlled down.',
    yt: yt('standing calf raise'),
  },
  'squat': {
    name: 'Squat (bodyweight)',
    cue: 'Feet shoulder-width, knees track toes, full depth.',
    yt: yt('bodyweight squat form'),
  },
};

export function getExercise(id) {
  return EXERCISES[id] || { name: id, cue: '', yt: yt(id) };
}
