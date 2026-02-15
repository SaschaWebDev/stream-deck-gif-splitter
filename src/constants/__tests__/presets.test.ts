import { PRESETS } from '../presets';

describe('PRESETS', () => {
  it('has exactly 5 presets', () => {
    expect(PRESETS).toHaveLength(5);
  });

  it('all presets have required fields with positive values', () => {
    for (const preset of PRESETS) {
      expect(preset.label).toBeTruthy();
      expect(preset.model).toBeTruthy();
      expect(preset.cols).toBeGreaterThan(0);
      expect(preset.rows).toBeGreaterThan(0);
      expect(preset.tileWidth).toBeGreaterThan(0);
      expect(preset.tileHeight).toBeGreaterThan(0);
      expect(preset.gap).toBeGreaterThan(0);
    }
  });

  it('has no duplicate model IDs', () => {
    const models = PRESETS.map((p) => p.model);
    expect(new Set(models).size).toBe(models.length);
  });

  it('MK.2 is 5x3', () => {
    const mk2 = PRESETS.find((p) => p.label.includes('MK.2'));
    expect(mk2).toBeDefined();
    expect(mk2!.cols).toBe(5);
    expect(mk2!.rows).toBe(3);
  });

  it('XL is 8x4', () => {
    const xl = PRESETS.find((p) => p.label.includes('XL'));
    expect(xl).toBeDefined();
    expect(xl!.cols).toBe(8);
    expect(xl!.rows).toBe(4);
  });
});
