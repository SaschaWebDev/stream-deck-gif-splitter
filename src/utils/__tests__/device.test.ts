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

// Custom grid preset: XL device with 6x3 grid (instead of native 8x4)
const xlCustomGrid = { ...xl, cols: 6, rows: 3 };

describe('custom grid preset calculations', () => {
  it('calculates target width for custom grid XL (6 cols)', () => {
    // 6 * 144 + 5 * 40 = 864 + 200 = 1064
    expect(calculateTargetWidth(xlCustomGrid, true)).toBe(1064);
    // 6 * 144 = 864
    expect(calculateTargetWidth(xlCustomGrid, false)).toBe(864);
  });

  it('calculates target height for custom grid XL (3 rows)', () => {
    // 3 * 144 + 2 * 40 = 432 + 80 = 512
    expect(calculateTargetHeight(xlCustomGrid, true)).toBe(512);
    // 3 * 144 = 432
    expect(calculateTargetHeight(xlCustomGrid, false)).toBe(432);
  });

  it('preserves tile size and gap from base device', () => {
    expect(calculateGap(xlCustomGrid, true)).toBe(40);
    expect(calculateGap(xlCustomGrid, false)).toBe(0);
    expect(calculatePreviewTileSize(xlCustomGrid)).toBe(72);
  });

  it('scales gap the same as the base device', () => {
    // 40 * (72/144) = 20
    expect(calculateScaledGap(xlCustomGrid, true)).toBe(20);
    expect(calculateScaledGap(xlCustomGrid, false)).toBe(16);
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
