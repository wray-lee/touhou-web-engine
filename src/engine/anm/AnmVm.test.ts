/**
 * ANM interrupt dispatch, checked against original 永夜抄 animation data.
 *
 * The fixture is `face_rm00` script 1 out of `th08.dat` (the Reimu dialogue
 * portrait), which is the exact script `Gui::RunMsg` case 1 runs through
 * `SetAndExecuteScriptIdx`. Every number asserted below is therefore the
 * original's own choreography rather than something this test invented.
 */
import { describe, expect, it } from 'vitest';
import fs from 'fs';
import path from 'path';
import { AnmVm, anmScriptFromBase64, type AnmRng } from './AnmVm';
import type { AnmPack } from './AnmPack';

const quietRng: AnmRng = {
  randomU32InRange: () => 0,
  randomF32InRange: () => 0,
};

const MANIFEST = path.join(process.cwd(), 'public', 'assets', 'th08', 'manifest.json');

interface ManifestScript {
  base64: string;
}

interface Manifest {
  anm: Record<string, { scripts: ManifestScript[] }>;
}

const hasRetailAnm = fs.existsSync(MANIFEST);

/** Wrap one manifest pack so the engine sees it through the generic interface. */
function packOf(anmName: string): AnmPack {
  const manifest = JSON.parse(fs.readFileSync(MANIFEST, 'utf8')) as Manifest;
  const scripts = manifest.anm[anmName].scripts;
  return {
    words: (script: number): Int32Array | null =>
      script >= 0 && script < scripts.length ? anmScriptFromBase64(scripts[script].base64) : null,
  };
}

/** Run `frames` frames without touching the interrupt register. */
function run(vm: AnmVm, frames: number): void {
  for (let f = 0; f < frames; f++) vm.step();
}

describe('AnmVm interrupts', () => {
  /**
   * A script is `{size<<16 | op}` then `{time<<16 | varMask}` then the operand
   * words, so the size is derived here instead of typed by hand.
   */
  function assemble(...instructions: Array<[number, number, number[]]>): Int32Array {
    const words: number[] = [];
    for (const [op, time, args] of instructions) {
      words.push((((2 + args.length) * 4) << 16) | (op & 0xffff), time << 16, ...args);
    }
    return Int32Array.from(words);
  }

  const f32 = (value: number): number => {
    const view = new DataView(new ArrayBuffer(4));
    view.setFloat32(0, value, true);
    return view.getInt32(0, true);
  };

  it('stays parked on a Stop when the script has no matching label', () => {
    const vm = new AnmVm(quietRng);
    vm.attach(
      assemble(
        [3, 0, [0]], // Sprite 0
        [20, 0, []], // Stop
        [-1, 0, []], // EndOfScript
      ),
    );
    const parked = vm.timeInScript;
    vm.setInterrupt(3);
    vm.step();
    run(vm, 8);
    // `:402-405` with neither a label nor a `InterruptLabel(-1)` the VM has
    // nowhere to go, so it just keeps sitting on the Stop.
    expect(vm.stopped).toBe(true);
    expect(vm.timeInScript).toBe(parked);
    expect(vm.deleted).toBe(false);
  });

  it('jumps to the InterruptLabel(-1) return point when the wanted label is absent', () => {
    const vm = new AnmVm(quietRng);
    vm.attach(
      assemble(
        [21, 0, [-1]], // InterruptLabel -1
        [6, 0, [f32(100), 0, 0]], // Pos 100,0,0
        [20, 0, []], // Stop
        [-1, 0, []], // EndOfScript
      ),
    );
    vm.setInterrupt(7);
    vm.step();
    run(vm, 2);
    expect(vm.pos.x).toBe(100);
    expect(vm.deleted).toBe(false);
  });

  it('hands the clock back to the base timeline on ReturnFromInterrupt', () => {
    const vm = new AnmVm(quietRng);
    vm.attach(
      assemble(
        [20, 0, []], // Stop
        [21, 0, [1]], // InterruptLabel 1
        [8, 0, [128]], // Alpha 128
        [89, 0, []], // ReturnFromInterrupt
        [-1, 0, []], // EndOfScript
      ),
    );
    run(vm, 5);
    const base = vm.timeInScript;
    vm.setInterrupt(1);
    vm.step();
    expect(vm.color1.a).toBe(128);
    // The return rewinds to the parked `Stop`, so the base clock resumes from
    // where it was rather than from the interrupt body's times.
    expect(vm.timeInScript).toBeLessThanOrEqual(base + 1);
    expect(vm.stopped).toBe(true);
  });

  describe.skipIf(!hasRetailAnm)('on original face_rm00 script 1', () => {
    const words = (): Int32Array => {
      const pack = packOf('face_rm00');
      const script = pack.words(1);
      expect(script).not.toBeNull();
      return script!;
    };

    it('arms the portrait hidden and off stage, exactly as the script says', () => {
      const vm = new AnmVm(quietRng);
      vm.attach(words());
      expect(vm.sprite).toBe(2);
      expect(vm.visible).toBe(false);
      expect(vm.pos.x).toBe(-224);
      expect(vm.pos.y).toBe(128);
      expect(vm.stopped).toBe(true);
    });

    it('interrupt 1 slides it in and fades it up over thirty frames', () => {
      const vm = new AnmVm(quietRng);
      vm.attach(words());
      vm.setInterrupt(1);
      vm.step();
      expect(vm.visible).toBe(true);
      run(vm, 32);
      expect(vm.pos.x).toBeCloseTo(48, 3);
      expect(vm.pos.y).toBeCloseTo(128, 3);
      expect(vm.color1.a).toBe(255);
    });

    it('interrupt 4 dims and shoulders the portrait aside', () => {
      const vm = new AnmVm(quietRng);
      vm.attach(words());
      vm.setInterrupt(1);
      run(vm, 40);
      vm.setInterrupt(4);
      run(vm, 18);
      expect(vm.color1.r).toBe(128);
      expect(vm.color1.g).toBe(128);
      expect(vm.color1.b).toBe(128);
      expect(vm.color1.a).toBe(192);
      expect(vm.pos.x).toBeCloseTo(24, 3);
      expect(vm.pos.y).toBeCloseTo(136, 3);
    });

    it('interrupt 5 walks it back off stage and deletes the VM', () => {
      const vm = new AnmVm(quietRng);
      vm.attach(words());
      vm.setInterrupt(1);
      run(vm, 40);
      vm.setInterrupt(5);
      run(vm, 34);
      expect(vm.pos.x).toBeCloseTo(-224, 3);
      expect(vm.deleted).toBe(true);
      expect(vm.visible).toBe(false);
    });

    /**
     * The codes `Gui::RunMsg` actually writes. `Gui.cpp:417` arms the speaking
     * slot with 3 and `:408`/`:410`/`:413` arm the others with 6 or 4, so this is
     * the only interrupt path a real conversation ever uses - 1 and 5 above are
     * the labels the base timeline reaches on its own.
     */
    it('interrupt 3, the code op 15/17 sends, brings the portrait on stage', () => {
      const vm = new AnmVm(quietRng);
      vm.attach(words());
      vm.setInterrupt(3);
      vm.step();
      expect(vm.visible).toBe(true);
      run(vm, 32);
      expect(vm.pos.x).toBeCloseTo(48, 3);
      expect(vm.color1.a).toBe(255);
    });

    /**
     * Label 6 is not an exit. `face_rm00` gives it one instruction: a fifteen
     * frame `ColorTime` ramp to grey 128 that lands at script time 105 and then
     * stops. The portrait keeps its position and full alpha, so a speaker
     * replaced by a partner on the same side stays on stage, just drained of
     * colour. Only label 5 (`Gui.cpp` never sends it during a conversation)
     * actually walks a face off stage, which the test above covers.
     */
    it('interrupt 6, the cross-side dim, greys the portrait in place', () => {
      const vm = new AnmVm(quietRng);
      vm.attach(words());
      vm.setInterrupt(3);
      run(vm, 40);
      vm.setInterrupt(6);
      run(vm, 8);
      expect(vm.color1.r).toBeGreaterThan(128);
      expect(vm.color1.r).toBeLessThan(255);
      run(vm, 8);
      expect(vm.color1.r).toBe(128);
      expect(vm.color1.g).toBe(128);
      expect(vm.color1.b).toBe(128);
      expect(vm.color1.a).toBe(255);
      expect(vm.pos.x).toBeCloseTo(48, 3);
      expect(vm.pos.y).toBeCloseTo(128, 3);
      expect(vm.deleted).toBe(false);
      expect(vm.visible).toBe(true);
    });
  });
});

describe('AnmVm variable operands', () => {
  /** `{size<<16 | op}`, `{time<<16 | varMask}`, then the operand words. */
  const instr = (op: number, time: number, varMask: number, args: number[]): number[] => [
    (((2 + args.length) * 4) << 16) | (op & 0xffff),
    (varMask << 16) | (time & 0xffff),
    ...args,
  ];
  const bits = (value: number): number => {
    const view = new DataView(new ArrayBuffer(4));
    view.setFloat32(0, value, true);
    return view.getInt32(0, true);
  };
  const rng: AnmRng = {
    randomU32InRange: (bound: number) => bound >> 1,
    randomF32InRange: (bound: number) => bound / 2,
  };

  it('reads a float register id out of the f32 bits, not the raw operand word', () => {
    // `etama` script 32 hands `Scale` the f32 10004.0, which is `AnmVariable_F0`;
    // read as an int the same word is 1176260608, and the sprite grows off screen.
    const vm = new AnmVm(rng);
    vm.attach(
      Int32Array.from([
        ...instr(60 /* FSetRand */, 0, 0x1, [bits(10004), bits(2)]),
        ...instr(7 /* Scale */, 0, 0x3, [bits(10004), bits(10004)]),
        ...instr(-1 /* EndOfScript */, 0, 0, []),
      ]),
    );
    vm.step();
    expect(vm.scale.x).toBeCloseTo(1, 5);
    expect(vm.scale.y).toBeCloseTo(1, 5);
  });

  it('threads an int register through a random write and a later read', () => {
    // `etama` script 71 picks the alpha this way: `ISetRand I0, 64` then `Alpha I0`.
    const vm = new AnmVm(rng);
    vm.attach(
      Int32Array.from([
        ...instr(59 /* ISetRand */, 0, 0x1, [10000, 64]),
        ...instr(8 /* Alpha */, 0, 0x1, [10000]),
        ...instr(-1 /* EndOfScript */, 0, 0, []),
      ]),
    );
    vm.step();
    expect(vm.color1.a).toBe(32);
  });

  it('keeps a literal write in the VM instead of editing the shared script', () => {
    // Retail writes through to the loaded instruction, which leaks the change into
    // every other VM on the same script. The scratch map is the deliberate
    // deviation, so the word itself has to survive untouched.
    const script = Int32Array.from([
      ...instr(38 /* FSet */, 0, 0x1, [bits(7), bits(3)]),
      ...instr(-1 /* EndOfScript */, 0, 0, []),
    ]);
    const vm = new AnmVm(rng);
    vm.attach(script);
    vm.step();
    expect(script[2]).toBe(bits(7));
  });
});
