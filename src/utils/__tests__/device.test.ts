import { PRESETS } from '../../constants/presets';
import {
  calculateTargetWidth,
  calculateTargetHeight,
  calculateGap,
  calculatePreviewTileSize,
  calculateScaledGap,
} from '../device';

const mk2 = PRESETS[0]; // 5x3, 72px tile, 16px gap
const xl = PRESETS[1];   // 8x4, 144px tile, 40px gap

describe('calculateTargetWidth', () => {
  it('includes gaps when cutoff is on', () => {
    // 5 * 72 + 4 * 16 = 360 + 64 = 424
    expect(calculateTargetWidth(mk2, true)).toBe(424);
  });

  it('excludes gaps when cutoff is off', () => {
    // 5 * 72 = 360
    expect(calculateTargetWidth(mk2, false)).toBe(360);
  });

  it('works for XL preset', () => {
    // 8 * 144 + 7 * 40 = 1152 + 280 = 1432
    expect(calculateTargetWidth(xl, true)).toBe(1432);
    // 8 * 144 = 1152
    expect(calculateTargetWidth(xl, false)).toBe(1152);
  });
});

describe('calculateTargetHeight', () => {
  it('includes gaps when cutoff is on', () => {
    // 3 * 72 + 2 * 16 = 216 + 32 = 248
    expect(calculateTargetHeight(mk2, true)).toBe(248);
  });

  it('excludes gaps when cutoff is off', () => {
    // 3 * 72 = 216
    expect(calculateTargetHeight(mk2, false)).toBe(216);
  });

  it('works for XL preset', () => {
    // 4 * 144 + 3 * 40 = 576 + 120 = 696
    expect(calculateTargetHeight(xl, true)).toBe(696);
    expect(calculateTargetHeight(xl, false)).toBe(576);
  });
});

describe('calculateGap', () => {
  it('returns preset gap when cutoff is on', () => {
    expect(calculateGap(mk2, true)).toBe(16);
    expect(calculateGap(xl, true)).toBe(40);
  });

  it('returns 0 when cutoff is off', () => {
    expect(calculateGap(mk2, false)).toBe(0);
    expect(calculateGap(xl, false)).toBe(0);
  });
});

describe('calculatePreviewTileSize', () => {
  it('returns tile width when 72 or less', () => {
    expect(calculatePreviewTileSize(mk2)).toBe(72);
  });

  it('caps at 72 for larger tiles', () => {
    expect(calculatePreviewTileSize(xl)).toBe(72);
  });
});

describe('calculateScaledGap', () => {
  it('scales gap proportionally when cutoff is on', () => {
    // MK.2: 72px tile, gap 16, preview 72 → 16 * (72/72) = 16
    expect(calculateScaledGap(mk2, true)).toBe(16);
    // XL: 144px tile, gap 40, preview 72 → 40 * (72/144) = 20
    expect(calculateScaledGap(xl, true)).toBe(20);
  });

  it('returns 16 when cutoff is off', () => {
    expect(calculateScaledGap(mk2, false)).toBe(16);
    expect(calculateScaledGap(xl, false)).toBe(16);
  });
});
