import { Player } from '../player/Player';

export class HUD {
  public score = 0;
  public hiScore = 999999990;
  public lives = 3;
  public bombs = 3;
  public power = 128;
  public maxPower = 128;
  public graze = 0;

  public spellCardName: string | null = null;
  public spellCardTime = 0;
  public spellCardBonus = 0;
  /** Frames remaining for the pop-in banner animation (US#6). */
  public spellCardDisplayTimer = 0;
  public centerMessage: string | null = null;
  public centerMessageTimer = 0;

  get formattedScore(): string {
    return this.score.toString().padStart(10, '0');
  }

  get formattedHiScore(): string {
    return this.hiScore.toString().padStart(10, '0');
  }

  updateFromPlayer(player: Player): void {
    this.score = player.score;
    this.lives = player.lives;
    this.bombs = player.bombs;
    this.power = player.power;
    this.graze = player.graze;

    if (this.score > this.hiScore) {
      this.hiScore = this.score;
    }
  }

  showSpellCard(name: string, durationSeconds: number, bonus = 1000000, displayFrames = 90): void {
    this.spellCardName = name;
    this.spellCardTime = durationSeconds;
    this.spellCardBonus = bonus;
    this.spellCardDisplayTimer = displayFrames;
  }

  hideSpellCard(): void {
    this.spellCardName = null;
    this.spellCardTime = 0;
    this.spellCardBonus = 0;
    this.spellCardDisplayTimer = 0;
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
      }
    }
  }
}
