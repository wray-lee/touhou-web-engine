import { describe, it, expect } from 'vitest';
import { Rumia } from './Rumia';
import { Player } from '../../../touhou-common/player/Player';

describe('TH08 Stage 1 Rumia Boss AI', () => {
  it('creates Rumia with 3 phases (non-spell, Night Bird, Demarcation)', () => {
    const rumia = new Rumia();
    expect(rumia.name).toBe('Rumia');
    expect(rumia.phases.length).toBe(3);
    expect(rumia.currentPhaseIndex).toBe(0);
  });

  it('spawns bullets during non-spell phase on attack interval', () => {
    const rumia = new Rumia();
    const player = new Player({ x: 224, y: 400 });

    // Step through frames to trigger attack interval
    let fired = false;
    for (let f = 0; f < 120; f++) {
      const bullets = rumia.updateAI(1, player);
      if (bullets.length > 0) {
        fired = true;
        break;
      }
    }
    expect(fired).toBe(true);
  });

  it('transitions to Night Bird when non-spell HP is depleted', () => {
    const rumia = new Rumia();
    rumia.takeDamage(150);

    expect(rumia.currentPhaseIndex).toBe(1);
    expect(rumia.isSpellCardActive).toBe(true);
    expect(rumia.currentSpellCard?.name).toBe('夜符「Night Bird」');
  });
});
