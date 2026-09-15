/**
 * ECL opcode table for Touhou 8, recovered from th08web-ref/src/EclRunLow.inl
 * and EclRunHigh.inl. Each entry carries the mnemonic, operand signature and a
 * short description. The signature uses:
 *   I = read int, F = read float, Iw = write int, Fw = write float,
 *   i = raw int (not resolved), f = raw float, ? = unused/padding.
 */

export interface OpcodeInfo {
  name: string;
  sig: string[];
  desc: string;
  /**
   * True when the first operand word packs two i16 parameters. The interpreter
   * numbers `operandFlags` by parameter, not by word, so every bit from the
   * second parameter onwards sits one place higher than the word index. The shot
   * launchers (ops 96..104, type + colour) and the lasers (ops 114/115, type +
   * colour) are the two families in th08 that do this.
   */
  packedFirst?: boolean;
}

/**
 * Ops 96..104, the bullet launchers. One eight-word layout, nine readings of it.
 *
 * Word 0 is the packed type/colour pair, so its own indirectness is carried by two
 * flag bits and every later word's bit is one place above its index — which is
 * what `packedFirst` records. Word 7 is the transform bitfield, read directly.
 */
const SHOT_SIG = ['I', 'I', 'I', 'F', 'F', 'F', 'F', 'I'];
const SHOT_OPCODES: Record<number, OpcodeInfo> = Object.fromEntries(
  [
    'aim 0 (fan, aim at player)',
    'aim 1 (fan, fixed)',
    'aim 2 (ring + aim at player)',
    'aim 3 (even ring)',
    'aim 4 (rotated ring + aim at player)',
    'aim 5 (rotated ring)',
    'aim 6 (random angle band)',
    'aim 7 (ring, random speed)',
    'aim 8 (random angle and speed)',
  ].map((desc, i) => [
    96 + i,
    { name: 'spawnShot', sig: SHOT_SIG, desc: `Launch shots — ${desc}`, packedFirst: true },
  ]),
);

export const ECL_OPCODES: Record<number, OpcodeInfo> = {
  0: { name: 'nop', sig: [], desc: 'No operation (fall-through label)' },
  1: { name: 'return', sig: [], desc: 'Return from sub / delete enemy' },
  2: { name: 'setSecondaryTime', sig: ['I'], desc: 'Set secondary countdown timer' },
  3: { name: 'nop3', sig: [], desc: 'Ordinary advance (no-op label)' },
  4: { name: 'jmp', sig: ['i', 'i'], desc: 'Jump: time=arg0, offset=arg1' },
  5: { name: 'loop', sig: ['?', '?', 'Iw'], desc: 'Decrement arg2; if >0 jump like op4' },
  6: { name: 'setI', sig: ['Iw', 'I'], desc: 'dst = src (int)' },
  7: { name: 'setF', sig: ['Fw', 'F'], desc: 'dst = src (float)' },
  8: { name: 'randSignI', sig: ['Iw', 'I'], desc: 'dst = random_sign * src (int)' },
  9: { name: 'randSignF', sig: ['Fw', 'F'], desc: 'dst = random_sign * src (float)' },
  10: { name: 'addI', sig: ['Iw', 'I'], desc: 'dst += src' },
  11: { name: 'subI', sig: ['Iw', 'I'], desc: 'dst -= src' },
  12: { name: 'mulI', sig: ['Iw', 'I'], desc: 'dst *= src' },
  13: { name: 'divI', sig: ['Iw', 'I'], desc: 'dst /= src' },
  14: { name: 'modI', sig: ['Iw', 'I'], desc: 'dst %= src' },
  15: { name: 'addF', sig: ['Fw', 'F'], desc: 'dst += src' },
  16: { name: 'subF', sig: ['Fw', 'F'], desc: 'dst -= src' },
  17: { name: 'mulF', sig: ['Fw', 'F'], desc: 'dst *= src' },
  18: { name: 'divF', sig: ['Fw', 'F'], desc: 'dst /= src' },
  19: { name: 'modF', sig: ['Fw', 'F'], desc: 'dst %= fmod' },
  20: { name: 'addII', sig: ['Iw', 'I', 'I'], desc: 'dst = a + b' },
  21: { name: 'subII', sig: ['Iw', 'I', 'I'], desc: 'dst = a - b' },
  22: { name: 'mulII', sig: ['Iw', 'I', 'I'], desc: 'dst = a * b' },
  23: { name: 'divII', sig: ['Iw', 'I', 'I'], desc: 'dst = a / b' },
  24: { name: 'modII', sig: ['Iw', 'I', 'I'], desc: 'dst = a % b' },
  25: { name: 'addFF', sig: ['Fw', 'F', 'F'], desc: 'dst = a + b' },
  26: { name: 'subFF', sig: ['Fw', 'F', 'F'], desc: 'dst = a - b' },
  27: { name: 'mulFF', sig: ['Fw', 'F', 'F'], desc: 'dst = a * b' },
  28: { name: 'divFF', sig: ['Fw', 'F', 'F'], desc: 'dst = a / b' },
  29: { name: 'modFF', sig: ['Fw', 'F', 'F'], desc: 'dst = fmod(a, b)' },
  30: { name: 'incI', sig: ['Iw'], desc: '++dst' },
  31: { name: 'decI', sig: ['Iw'], desc: '--dst' },
  32: { name: 'sinF', sig: ['Fw', 'F'], desc: 'dst = sin(src)' },
  33: { name: 'cosF', sig: ['Fw', 'F'], desc: 'dst = cos(src)' },
  34: { name: 'atan2', sig: ['Fw', 'F', 'F', 'F', 'F'], desc: 'dst = atan2(y2-y1, x2-x1)' },
  35: { name: 'interpOp', sig: ['Fw', 'F', 'F', 'F'], desc: 'dst = (p1 - p2) * p3 + p2' },
  36: {
    name: 'interpSlot',
    sig: ['Fw', 'I', 'I', 'I', 'F', 'F', 'F', 'F'],
    desc: 'Install an interpolator over a register',
  },
  37: { name: 'normalizeAngle', sig: ['Fw'], desc: 'dst = normalizeAngle(dst)' },
  38: { name: 'polarToXY', sig: ['Fw', 'Fw', 'F', 'F'], desc: 'x,y = cos(angle)*mag, sin(angle)*mag' },
  39: { name: 'distance', sig: ['Fw', 'F', 'F', 'F', 'F'], desc: 'dst = |p1p2 - p3p4|' },
  40: { name: 'cmpEqI', sig: ['I', 'I', 'i', 'i'], desc: 'if a == b jump' },
  41: { name: 'cmpEqF', sig: ['F', 'F', 'i', 'i'], desc: 'if a == b jump (float)' },
  42: { name: 'cmpNeI', sig: ['I', 'I', 'i', 'i'], desc: 'if a != b jump' },
  43: { name: 'cmpNeF', sig: ['F', 'F', 'i', 'i'], desc: 'if a != b jump (float)' },
  44: { name: 'cmpLtI', sig: ['I', 'I', 'i', 'i'], desc: 'if a < b jump' },
  45: { name: 'cmpLtF', sig: ['F', 'F', 'i', 'i'], desc: 'if a < b jump (float)' },
  46: { name: 'cmpLeI', sig: ['I', 'I', 'i', 'i'], desc: 'if a <= b jump' },
  47: { name: 'cmpLeF', sig: ['F', 'F', 'i', 'i'], desc: 'if a <= b jump (float)' },
  48: { name: 'cmpGtI', sig: ['I', 'I', 'i', 'i'], desc: 'if a > b jump' },
  49: { name: 'cmpGtF', sig: ['F', 'F', 'i', 'i'], desc: 'if a > b jump (float)' },
  50: { name: 'cmpGeI', sig: ['I', 'I', 'i', 'i'], desc: 'if a >= b jump' },
  51: { name: 'cmpGeF', sig: ['F', 'F', 'i', 'i'], desc: 'if a >= b jump (float)' },
  52: { name: 'callSub', sig: ['i'], desc: 'Call ECL sub on this enemy' },
  53: { name: 'returnSub', sig: [], desc: 'Return from sub call / pop context' },
  54: { name: 'setAnmScript', sig: ['I'], desc: 'Set ANM script on primary sprite' },
  55: { name: 'setAnmScripts6', sig: ['I'], desc: 'Set 6 consecutive ANM scripts from base' },
  56: { name: 'setAnmScripts6x', sig: ['I', 'I', 'I', 'I', 'I', 'I'], desc: 'Set 6 individual ANM scripts' },
  57: { name: 'setExtraAnm', sig: [], desc: 'Set extra ANM script' },
  58: { name: 'setAnmScriptAlt', sig: ['I'], desc: 'Set ANM script (alternate sprite sheet)' },
  59: { name: 'setAnmScripts6Alt', sig: ['I'], desc: 'Set 6 ANM scripts (alternate sheet)' },
  60: {
    name: 'setAnmScripts6xAlt',
    sig: ['I', 'I', 'I', 'I', 'I', 'I'],
    desc: 'Set 6 individual ANM scripts (alt)',
  },
  61: { name: 'setExtraAnmAlt', sig: [], desc: 'Set extra ANM script (alt sheet)' },
  62: { name: 'autoAnmScript', sig: [], desc: 'Auto-select ANM based on current sheet flag' },
  // `EclRunLow.inl:737-743` writes operands 0/1 straight into `enemy+0x2D34/0x2D38`
  // and then clamps: absolute, despite the historical name.
  63: { name: 'setRelPos', sig: ['F', 'F'], desc: 'Set the absolute position, then clamp' },
  // `EclHelpers::ConfigureRelativeMotion` reads operands 0/1 as ints (duration,
  // motion mode) and 2/3 as floats holding an *absolute* target position, then
  // stores `target - current`. The operands are float-register references in
  // practice, so the signature has to say so or the translator passes the raw
  // `10016.0f` bit pattern through as a coordinate.
  64: { name: 'moveRelative', sig: ['I', 'I', 'F', 'F'], desc: 'Move to absolute target over N frames' },
  // Every call site passes multiples of PI/8 plus a small per-frame delta, so
  // this is the sprite rotation pair (heading, angular velocity), not a teleport.
  // `EclRunLow.inl:744-751`: heading + speed, mode 1, no duration. Not the sprite
  // rotation, which the ANM VM owns.
  65: { name: 'setHeadingSpeed', sig: ['F', 'F'], desc: 'Aim indefinitely at angle/speed' },
  66: { name: 'movePolar', sig: ['I', 'I', 'F', 'F'], desc: 'Polar motion: duration, easing, angle, speed' },
  // `BeginBoundaryAwareMove` (th08 0x422020): a random heading away from the
  // player, folded back inside op 75's clamp box.
  67: { name: 'moveBounce', sig: ['I', 'I', 'F'], desc: 'Boundary-aware bounce heading' },
  68: { name: 'moveToPlayer', sig: ['F', 'F'], desc: 'Move relative to player position' },
  69: {
    name: 'moveToPlayerPolar',
    sig: ['I', 'I', 'F', 'F'],
    desc: 'Polar motion: duration, easing, angle + player bearing',
  },
  70: { name: 'setHeadingVel', sig: ['F'], desc: 'Set the per-frame heading delta (0x2D98)' },
  71: { name: 'setSpeedAccel', sig: ['F'], desc: 'Set the per-frame speed delta (0x2DAC)' },
  72: {
    name: 'moveOrbit',
    sig: ['I', 'F', 'F', 'F', 'F', 'F', 'F'],
    desc: 'Orbit producer: duration, anchor, angle, angle rate, radius, radius rate',
  },
  73: {
    name: 'moveArc',
    sig: ['I', 'F', 'F', 'F'],
    desc: 'Orbit around self: duration, angle, angle rate, radius rate',
  },
  74: {
    name: 'setAccel',
    sig: ['I', 'F', 'F'],
    desc: 'Retune the live orbit: duration, angle rate, radius rate',
  },
  75: {
    name: 'setMotionClamp',
    sig: ['F', 'F', 'F', 'F'],
    desc: 'Arm the position clamp box (0x3340..0x334C)',
  },
  76: { name: 'clearMotionClamp', sig: [], desc: 'Disarm the position clamp box' },
  77: { name: 'setBounds', sig: ['F', 'F'], desc: 'Set bounding box for auto-removal' },
  78: { name: 'setBoundsAlt', sig: ['F', 'F'], desc: 'Set bounding box (alternate)' },
  // `EclRunLow.inl:923-961`. These three are a bit address bus over flag words 1
  // and 2, not three flavours of "assign the flag word": op 79 writes six bits at
  // once with three of them stored inverted, op 80 clears and op 81 sets the same
  // six. Bit 4 is `EMUF1_NO_SPRITE` (the draw-list gate at
  // `EnemyManagerUpdate.cpp:985-993`) and bit 28 is `allowOffscreen`, so a blanket
  // assignment both hides the wrong enemies and forgets to retire the right ones.
  79: { name: 'writeScriptFlags', sig: ['I'], desc: 'Write the six script flag bits (mixed polarity)' },
  80: { name: 'clearScriptFlags', sig: ['I'], desc: 'Clear script flag bits' },
  81: { name: 'setScriptFlags', sig: ['I'], desc: 'Set script flag bits' },
  // `EclRunLow.inl:964-971`: op 82 stores the square of its operand as the
  // distance inside which ops 96..104 refuse to fire, and op 83 sets bit 1 of
  // the second flag word, which selects the alternate hit flash.
  82: { name: 'setShotNoFireRadius', sig: ['F'], desc: 'Stop firing inside this radius' },
  83: { name: 'setHitFlash', sig: ['I'], desc: 'Alternate hit flash flag' },
  84: { name: 'nop84', sig: [], desc: 'No-op (advance)' },
  85: { name: 'nop85', sig: [], desc: 'No-op (advance)' },
  86: { name: 'readIntRemote', sig: ['Iw', 'i', 'I'], desc: 'Read int from remote enemy slot' },
  87: { name: 'readFloatRemote', sig: ['Fw', 'i', 'I'], desc: 'Read float from remote enemy slot' },
  88: { name: 'callSubRemote', sig: ['I', 'i'], desc: 'Call ECL sub on remote enemy' },
  89: { name: 'setCallParams', sig: ['I', 'I'], desc: 'Set ECL call parameters' },
  // Opcodes 90..92 are the linked-child cluster, not a kill family
  // (`EclRunLow.inl:1014-1203`). Operand 0 is the ECL sub the familiar runs, 1/2
  // its spawn position, 3 its HP, 4 its item-drop type (`enemy+0x3304`) and 5 its
  // score (`enemy+0x2E08`). The earlier "kill A/B/C" reading deleted every boss
  // that launches familiars, which is 589 call sites across the nine stages.
  90: {
    name: 'linkChildStandard',
    sig: ['I', 'F', 'F', 'I', 'I', 'I'],
    desc: 'Launch a linked familiar at an absolute offset',
  },
  91: {
    name: 'linkChildRelative',
    sig: ['I', 'F', 'F', 'I', 'I', 'I'],
    desc: 'Launch a linked familiar offset from the parent',
  },
  92: {
    name: 'linkChildAttached',
    sig: ['I', 'F', 'F', 'I', 'I', 'I'],
    desc: 'Launch a linked familiar that rides the parent',
  },
  93: { name: 'spawnEnemy', sig: ['?', '?', '?', '?', 'I', 'I', 'I'], desc: 'Spawn child enemy (type 2)' },
  94: {
    name: 'spawnEnemyAlt',
    sig: ['?', '?', '?', '?', 'I', 'I', 'I'],
    desc: 'Spawn child enemy (type 2, alt)',
  },
  95: { name: 'enemyFunc95', sig: [], desc: 'Enemy helper 0x42efb0' },
  // Opcodes 96..104 are the bullet launchers. `EclRunHigh.inl:394-412` sends all
  // nine to one handler and `DispatchShotInstruction` derives the aim mode as
  // `opcode - 0x60`, so the whole family shares one emitted call and the mode is
  // passed explicitly. Operands stay raw: the handler resolves them itself
  // through `ResolveInt`/`ResolveFloat` keyed by `operandFlags`.
  // The nine launchers share one operand layout and differ only in how the
  // interpreter reads `angle`. Word 0 packs bullet type and colour as two i16s, so
  // — like the lasers — every flag bit from the second parameter onwards sits one
  // place above its word index. The last word is the transform bitfield, which the
  // handler reads directly and never through `operandFlags`.
  ...SHOT_OPCODES,
  // Repeat support for the shot family: 105/106 arm an interval in frames,
  // 107/108 park or release the newest shot instruction, and 109 re-fires the
  // descriptor the last shot left behind (`EclRunHigh.inl:435-466`).
  105: { name: 'setShotRepeat', sig: ['I'], desc: 'Repeat the held shot every N frames' },
  106: { name: 'setShotRepeatRand', sig: ['I'], desc: 'Repeat every N frames, random phase' },
  107: { name: 'holdShots', sig: [], desc: 'Park shot instructions instead of firing' },
  108: { name: 'releaseShots', sig: [], desc: 'Stop parking shot instructions' },
  109: { name: 'spawnShotNow', sig: [], desc: 'Re-fire the stored shot descriptor' },
  110: { name: 'setShotOrigin', sig: ['F', 'F'], desc: 'Muzzle offset from the enemy' },
  111: {
    name: 'setShotRecord',
    sig: ['I', 'I', 'I', 'I', 'I', 'F', 'F'],
    desc: 'Install a bullet transform record in the shot descriptor',
  },
  112: { name: 'clearAllBullets', sig: [], desc: 'Bullet clear (full power mode)' },
  113: { name: 'setShotSound', sig: ['I', 'I'], desc: 'Shot spawn and transform sound ids' },
  114: {
    name: 'spawnLaser',
    sig: ['I', 'F', 'F', 'F', 'F', 'F', 'F', 'I', 'I', 'I', 'I', 'I', 'I'],
    desc: 'Spawn laser at a fixed angle',
    packedFirst: true,
  },
  115: {
    name: 'spawnLaserAimed',
    sig: ['I', 'F', 'F', 'F', 'F', 'F', 'F', 'I', 'I', 'I', 'I', 'I', 'I'],
    desc: 'Spawn laser aimed at the player',
    packedFirst: true,
  },
  116: { name: 'setMisc116', sig: ['I'], desc: 'Set misc field (int)' },
  117: { name: 'setFloatField', sig: ['I', 'F'], desc: 'Set float field by index' },
  118: { name: 'aimAtPlayer', sig: ['I', 'F'], desc: 'Set aim angle to player' },
  119: { name: 'setIntFields', sig: ['I', 'I', 'I', 'I'], desc: 'Set four int fields' },
  120: { name: 'setMisc120', sig: ['I'], desc: 'Set misc field' },
  121: { name: 'setInterpMode', sig: ['I'], desc: 'Set interpolation mode' },
  122: { name: 'startSpell', sig: [], desc: 'Declare spell card (blob: face|number, bonus, name, owner)' },
  123: { name: 'endSpell', sig: [], desc: 'End the spell card' },
  124: { name: 'playSfx', sig: ['I'], desc: 'Play sound effect' },
  125: { name: 'callSubCross', sig: ['I'], desc: 'Call sub on another enemy' },
  126: { name: 'setMisc126', sig: ['I', 'I'], desc: 'Set misc pair' },
  127: { name: 'setBossPresent', sig: ['I'], desc: 'Boss present + gauge init' },
  128: { name: 'spawnEffect', sig: [], desc: 'Spawn visual effect' },
  129: { name: 'setMisc129', sig: [], desc: 'Set misc' },
  130: {
    name: 'setDeathCallbackSub',
    sig: ['I'],
    desc: 'Boss: sub that takes over when this enemy dies (enemy+0x2CEE)',
  },
  131: { name: 'setLives', sig: ['I'], desc: 'Boss: set life bar count (SETLIVES)' },
  132: { name: 'setSpellTimerElapsed', sig: ['I'], desc: 'Boss: seek the spell timer clock (enemy+0x2E14)' },
  133: { name: 'setPhase', sig: ['I', 'I', 'I'], desc: 'Boss: arm life bar i at HP threshold -> sub' },
  134: {
    name: 'setSpellTimer',
    sig: ['I', 'I'],
    desc: 'Boss: card countdown in frames -> sub when it runs out',
  },
  135: { name: 'callSubAlloc', sig: ['I', 'I'], desc: 'Allocate + call sub' },
  136: { name: 'setMisc136', sig: ['I'], desc: 'Set misc (int)' },
  137: { name: 'setTimeout', sig: ['I'], desc: 'Set spellcard timeout' },
  138: {
    name: 'setDeathEffects',
    sig: ['I', 'I', 'I'],
    desc: 'Death effect template ids: 0x3310/0x3311/0x3312',
  },
  139: { name: 'spawnEffectAt', sig: ['I', 'I', 'Iw'], desc: 'Spawn effect at position' },
  140: { name: 'spawnEffectAngle', sig: ['I', 'I', 'Iw', 'F', 'F', 'F'], desc: 'Spawn effect with angle' },
  141: { name: 'spawnItem', sig: ['I'], desc: 'Spawn item' },
  142: { name: 'spawnItemRandom', sig: ['I'], desc: 'Spawn item (power-gated, random)' },
  143: { name: 'setMisc143', sig: ['I'], desc: 'Set misc' },
  144: { name: 'setMisc144', sig: ['I', 'I'], desc: 'Set misc pair' },
  145: { name: 'setMisc145', sig: [], desc: 'Set misc' },
  146: { name: 'setMisc146', sig: ['I'], desc: 'Set misc' },
  147: { name: 'setMisc147', sig: ['I'], desc: 'Set misc' },
  148: { name: 'eclSetLives', sig: ['I'], desc: 'Set gauge pip count (eclSetLives)' },
  149: { name: 'setMisc149', sig: ['I'], desc: 'Set misc' },
  150: { name: 'setMisc150', sig: ['I'], desc: 'Set misc' },
  151: { name: 'setMisc151', sig: [], desc: 'Set misc' },
  152: { name: 'setGaugeTimer', sig: ['F', 'I', 'I', 'I', 'I', 'I'], desc: 'Set boss gauge timer params' },
  153: {
    name: 'resetSpellTimerSub',
    sig: [],
    desc: 'Boss: point the countdown expiry at the death sub, rewind the clock (enemy+0x337C/0x2E14)',
  },
  154: { name: 'setMisc154', sig: [], desc: 'Set misc' },
  155: { name: 'setMisc155', sig: [], desc: 'Set misc' },
  156: { name: 'setMisc156', sig: [], desc: 'Set misc' },
  157: { name: 'setSpellHP', sig: ['?', 'I', 'I', 'I'], desc: 'Set spell HP and params' },
  158: { name: 'setLifeBarSlice', sig: ['I', 'I', 'I', 'I'], desc: 'SETLIVESLICE: index,start,stop,color' },
  159: { name: 'setMisc159', sig: ['I'], desc: 'Set misc' },
  160: { name: 'setMisc160', sig: ['I'], desc: 'Arm the damage-freeze timer (+0x5354)' },
  161: { name: 'removeBulletsRadius', sig: ['F'], desc: 'Remove bullets in radius' },
  162: { name: 'removeAllBullets', sig: [], desc: 'Remove all bullets' },
  163: { name: 'setMisc163', sig: ['I'], desc: 'Set misc' },
  164: { name: 'storedVector', sig: ['I', 'F', 'F', 'F'], desc: 'Set stored vector on spellcard' },
  165: { name: 'setMisc165', sig: ['F'], desc: 'Set misc (float)' },
  166: { name: 'setFloatInterp', sig: ['Fw', 'Fw', 'F', 'F'], desc: 'Set float interpolation pair' },
  167: { name: 'setMisc167', sig: ['I', 'F'], desc: 'Set misc pair' },
  168: { name: 'spawnItemBatch', sig: ['I'], desc: 'Spawn batch items (random)' },
  169: { name: 'setFwRand', sig: ['Fw'], desc: 'Set float write from random range' },
  170: { name: 'setMisc170', sig: ['I', 'I'], desc: 'Set misc pair' },
  171: { name: 'setMisc171', sig: ['I', 'F'], desc: 'Set misc pair' },
  172: { name: 'setMisc172', sig: ['I', 'F', 'F'], desc: 'Set misc triple' },
  173: { name: 'setMisc173', sig: ['I'], desc: 'Pause the slot timer' },
  174: { name: 'effectWithYoukai', sig: ['I'], desc: 'Spawn effect (youkai check)' },
  175: {
    name: 'pauseEnemySpawns',
    sig: ['I'],
    desc: 'Gate every timeline spawn through the shared table slot 91',
  },
  176: { name: 'complexSetup', sig: [], desc: 'Complex boss setup' },
  177: { name: 'setMisc177', sig: ['I'], desc: 'Set misc' },
  178: { name: 'setMisc178', sig: [], desc: 'Set misc (shared low/high)' },
  179: { name: 'startStageBg', sig: [], desc: 'Start stage background sequence' },
  180: { name: 'guiFunc180', sig: [], desc: 'Gui function 0x4390d6' },
  181: { name: 'clockControl', sig: [], desc: 'Advance the night clock one hour, if dawn has not come' },
  182: { name: 'setMisc182', sig: ['I'], desc: 'Set misc' },
  183: { name: 'setMisc183', sig: ['I'], desc: 'No damage while the clock is stopped' },
  184: { name: 'complexBossInit', sig: ['I'], desc: 'Complex boss initialization' },
};

/** Timeline-specific opcodes (EclTimelineInstruction). */
export const ECL_TIMELINE_OPCODES: Record<number, { name: string; desc: string }> = {
  0: { name: 'spawn', desc: 'Spawn enemy (sub, x, y, hp, anm, unk)' },
  1: { name: 'spawnVariant', desc: 'Spawn enemy variant' },
  2: { name: 'spawnRange', desc: 'Spawn enemy in position range' },
  4: { name: 'spawnRangeVariant', desc: 'Spawn enemy in range (variant)' },
  5: { name: 'setTimelineLabel', desc: 'Set timeline label (boss phase)' },
  6: { name: 'waitForBoss', desc: 'Wait until boss slot is empty' },
  7: { name: 'guiMsg', desc: 'Trigger GUI message' },
  8: { name: 'remoteField', desc: 'Set remote enemy field' },
  9: { name: 'setPower', desc: 'Set player power' },
  10: { name: 'waitForEnemy', desc: 'Wait until enemy alive flag' },
  11: { name: 'spawnContext', desc: 'Spawn enemy with context copy' },
  12: { name: 'spawnContextVariant', desc: 'Spawn enemy with context (variant)' },
  13: { name: 'waitCount', desc: 'Wait until match count' },
  14: { name: 'playBgm', desc: 'Play BGM track' },
  15: { name: 'spawnDirect', desc: 'Spawn enemy (always, ignoring boss check)' },
  16: { name: 'gameOver', desc: 'Show retry menu' },
};
