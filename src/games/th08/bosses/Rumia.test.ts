import { describe, it, expect, vi } from 'vitest';
import { Rumia } from './Rumia';
import { Player } from '../../../touhou-common/player/Player';
import { Bullet } from '../../../engine/core/Bullet';

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

  it('routes runtime bullets through the injected object-pool factory', () => {
    const rumia = new Rumia();
    const player = new Player({ x: 224, y: 400 });
    const factory = vi.fn((config: ConstructorParameters<typeof Bullet>[0]) => new Bullet(config));
    rumia.withBulletFactory(factory);

    // Step until the non-spell attack fires
    let spawned = 0;
    for (let f = 0; f < 120 && spawned === 0; f++) {
      const bullets = rumia.updateAI(1, player);
      spawned = bullets.length;
    }
    expect(spawned).toBeGreaterThan(0);
    // Every runtime pattern bullet went through the pool factory
    expect(factory).toHaveBeenCalled();
  });

  it('Demarcation fires a composite dual-ring salvo with ring sprites', () => {
    const rumia = new Rumia();
    const player = new Player({ x: 224, y: 400 });
    rumia.takeDamage(150); // -> Night Bird
    rumia.takeDamage(250); // -> Demarcation
    expect(rumia.currentPhaseIndex).toBe(2);

    // Collect the largest salvo over two full attack cycles (composite = 36 bullets)
    let salvo: Bullet[] = [];
    for (let f = 0; f < 170; f++) {
      const bullets = rumia.updateAI(1, player);
      if (bullets.length > salvo.length) salvo = bullets;
    }
    // CompositePattern = two 18-bullet counter-rotating rings in one frame
    expect(salvo.length).toBe(36);
    expect(salvo.every((b) => b.sprite === 'bullet_ring')).toBe(true);
    // Counter-rotation: half spin clockwise, half counter-clockwise
    const cw = salvo.filter((b) => b.angularVelocity > 0).length;
    const ccw = salvo.filter((b) => b.angularVelocity < 0).length;
    expect(cw).toBe(18);
    expect(ccw).toBe(18);
  });

  describe('Entrance & death fade (票据 11)', () => {
    it('starts above the screen top', () => {
      const rumia = new Rumia();
      expect(rumia.position.y).toBe(-50);
      expect(rumia.alpha).toBe(1);
    });

    it('slides from y=-50 to y=100 over the first 60 frames', () => {
      const rumia = new Rumia();
      rumia.update(30);
      expect(rumia.position.y).toBeCloseTo(25, 5); // 中点
      rumia.update(30);
      expect(rumia.position.y).toBeCloseTo(100, 5);
      rumia.update(30);
      expect(rumia.position.y).toBeCloseTo(100, 5); // 到位后不再移动
    });

    it('does not attack during the 60-frame entrance', () => {
      const rumia = new Rumia();
      const player = new Player({ x: 224, y: 400 });
      for (let f = 0; f < 60; f++) {
        expect(rumia.updateAI(1, player)).toHaveLength(0);
      }
      // 入场结束后恢复攻击节奏（aiFrame=100 时发射）
      let fired = false;
      for (let f = 60; f < 120; f++) {
        if (rumia.updateAI(1, player).length > 0) fired = true;
      }
      expect(fired).toBe(true);
    });

    it('fades alpha 1→0 over ~30 frames after death', () => {
      const rumia = new Rumia();
      rumia.takeDamage(150);
      rumia.takeDamage(250);
      rumia.takeDamage(320);
      expect(rumia.isDefeated).toBe(true);
      expect(rumia.isAlive).toBe(false);
      expect(rumia.alpha).toBe(1);

      rumia.update(15);
      expect(rumia.alpha).toBeCloseTo(0.5, 5);
      rumia.update(15);
      expect(rumia.alpha).toBe(0);
      rumia.update(60);
      expect(rumia.alpha).toBe(0); // 不会低于 0
    });
  });
});
