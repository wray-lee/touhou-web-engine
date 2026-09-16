import { Player } from '../player/Player';

export class HUD {
  public stageNumber = 1;
  public stageName = 'Stage 1';
  public difficulty = 'Normal';
  public timePhase = 'night';
  public score = 0;
  /** Stored best for this shot type and difficulty, with its own continue count. */
  public hiScore = 0;
  public hiScoreContinues = 0;
  /** Continues used on the live run, which rides the score row's last column. */
  public retries = 0;
  public lives = 3;
  public bombs = 3;
  public power = 0;
  public maxPower = 128;
  /** Active team member (永夜抄 swaps A/B with focus). */
  public memberName = '灵梦';
  public memberLabel = 'Reimu A';
  public focusActive = false;
  public graze = 0;

  public spellCardName: string | null = null;
  public spellCardTime = 0;
  public spellCardBonus = 0;
  /**
   * Set when the bar broke before the clock did. 永夜抄 keeps a green CAPTURED
   * on the plate for the rest of the card, and never shows one for a time-out.
   */
  public spellCaptured = false;
  /**
   * Point items: how many the run has collected, and the count at which the next
   * extend drops (`Gui.cpp:1453-1461` reads the same pair for the Point row).
   */
  public pointItems = 0;
  public nextPointExtend = 100;
  /** Time orbs, plus the threshold of the spell last fought. */
  public timeOrbs = 0;
  /** Second Time column: run-lifetime orbs, `g_GameManager + 0x3054`. */
  public timeOrbTotal = 0;
  /**
   * The 时符 count this stage's last spell asks for, `globals->lastSpellTimeOrbThreshold`
   * (`GameManager.cpp:226-229`). Retail prints it as the Time row's right column and warms
   * the whole row once the orbs on hand reach it (`Gui.cpp:1462-1471`).
   *
   * `null` means the host does not model a last-spell threshold at all, in which case the
   * renderer keeps the second column on the run-lifetime count and leaves the row untinted.
   */
  public timeOrbThreshold: number | null = null;
  /**
   * The night clock, in the units `GetClockTime()` returns: 0 is midnight and
   * 12 is dawn. The panel draws it as a dial, so the renderer needs the raw
   * count rather than a formatted string.
   */
  public clockTime = 0;
  /** Frames remaining for the pop-in banner animation (US#6). */
  public spellCardDisplayTimer = 0;
  /**
   * Asset key of the card owner's portrait for the cut-in that rides along with
   * the banner. 永夜抄 slides the boss's face in when it declares a card and the
   * player's face when a spell is spent, so the game owns the choice of art.
   */
  public spellCutIn: string | null = null;
  /** Which seat the cut-in belongs to: 'boss' enters left, 'player' enters right. */
  public spellCutInSide: 'boss' | 'player' = 'boss';
  public centerMessage: string | null = null;
  public centerMessageTimer = 0;
  /**
   * True while the upstream 'Enemy' approach banner owns the centre message, so
   * the renderer can show the real Taisei art instead of plain text.
   */
  public bossWarning = false;

  setStageInfo(stageNumber: number, stageName: string, difficulty: string): void {
    this.stageNumber = stageNumber;
    this.stageName = stageName;
    this.difficulty = difficulty;
  }

  setTimePhase(phase: string): void {
    this.timePhase = phase;
  }

  /** Record which member is flying; focus (Shift) is what swaps them in TH08. */
  setMember(name: string, label: string, focused: boolean): void {
    this.memberName = name;
    this.memberLabel = label;
    this.focusActive = focused;
  }

  /**
   * `Gui.cpp:1428-1443`: the score and HiScore rows are nine digits plus a
   * separate tenth column holding the continues used, clamped at 9.
   */
  get formattedScore(): string {
    return HUD.scoreRow(this.score, this.retries);
  }

  get formattedHiScore(): string {
    return HUD.scoreRow(this.hiScore, this.hiScoreContinues);
  }

  private static scoreRow(value: number, continues: number): string {
    const digits = Math.max(0, Math.floor(value)).toString().padStart(9, '0');
    return digits + ' ' + Math.min(9, Math.max(0, Math.floor(continues)));
  }

  updateFromPlayer(player: Player): void {
    this.score = player.score;
    this.lives = player.lives;
    this.bombs = player.bombs;
    this.power = player.power;
    this.graze = player.graze;
  }

  showSpellCard(
    name: string,
    durationSeconds: number,
    bonus = 1000000,
    displayFrames = 90,
    cutIn?: string,
    cutInSide: 'boss' | 'player' = 'boss',
  ): void {
    this.spellCardName = name;
    this.spellCardTime = durationSeconds;
    this.spellCardBonus = bonus;
    this.spellCardDisplayTimer = displayFrames;
    this.spellCutIn = cutIn ?? null;
    this.spellCutInSide = cutInSide;
    this.spellCaptured = false;
  }

  /** The card was taken by damage rather than by its clock. */
  markSpellCaptured(): void {
    this.spellCaptured = true;
  }

  /**
   * Slide a portrait in without a card name, which is what the player's own
   * spell needs: the banner stays out of the way but the cut-in still flashes.
   */
  showCutIn(cutIn: string, side: 'boss' | 'player', displayFrames = 60): void {
    this.spellCutIn = cutIn;
    this.spellCutInSide = side;
    this.spellCardDisplayTimer = Math.max(this.spellCardDisplayTimer, displayFrames);
  }

  hideSpellCard(): void {
    this.spellCardName = null;
    this.spellCardTime = 0;
    this.spellCardBonus = 0;
    this.spellCardDisplayTimer = 0;
    this.spellCutIn = null;
    this.spellCaptured = false;
  }

  /** Raise the boss-approach warning for `frames` game frames. */
  showBossWarning(frames = 150): void {
    this.bossWarning = true;
    this.showMessage('ENEMY APPROACHING', frames);
  }

  showMessage(msg: string, frames = 180): void {
    this.centerMessage = msg;
    this.centerMessageTimer = frames;
  }

  update(dtFrames: number): void {
    if (this.spellCardDisplayTimer > 0) {
      this.spellCardDisplayTimer = Math.max(0, this.spellCardDisplayTimer - dtFrames);
    }
    if (this.centerMessageTimer > 0) {
      this.centerMessageTimer -= dtFrames;
      if (this.centerMessageTimer <= 0) {
        this.centerMessage = null;
        this.bossWarning = false;
      }
    }
  }
}
