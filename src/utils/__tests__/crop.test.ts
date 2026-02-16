import {
  buildScaleCropFilter,
  buildTrimArgs,
  computeScaledDimensions,
  computeMaxCropOffset,
} from '../crop';

describe('buildScaleCropFilter', () => {
  it('uses center-crop expressions when no offset is provided', () => {
    const filter = buildScaleCropFilter(424, 248);
    expect(filter).toBe(
      'scale=424:248:force_original_aspect_ratio=increase:flags=lanczos,crop=424:248:(iw-ow)/2:(ih-oh)/2',
    );
  });

  it('uses explicit offset when cropX and cropY are provided', () => {
    const filter = buildScaleCropFilter(424, 248, 100, 50);
    expect(filter).toBe(
      'scale=424:248:force_original_aspect_ratio=increase:flags=lanczos,crop=424:248:100:50',
    );
  });

  it('rounds fractional offsets to integers', () => {
    const filter = buildScaleCropFilter(360, 216, 33.7, 99.2);
    expect(filter).toBe(
      'scale=360:216:force_original_aspect_ratio=increase:flags=lanczos,crop=360:216:34:99',
    );
  });

  it('uses zero offset when cropX and cropY are 0', () => {
    const filter = buildScaleCropFilter(424, 248, 0, 0);
    expect(filter).toBe(
      'scale=424:248:force_original_aspect_ratio=increase:flags=lanczos,crop=424:248:0:0',
    );
  });

  it('uses center-crop when only cropX is undefined', () => {
    const filter = buildScaleCropFilter(424, 248, undefined, 50);
    expect(filter).toBe(
      'scale=424:248:force_original_aspect_ratio=increase:flags=lanczos,crop=424:248:(iw-ow)/2:50',
    );
  });

  it('uses center-crop when only cropY is undefined', () => {
    const filter = buildScaleCropFilter(424, 248, 100, undefined);
    expect(filter).toBe(
      'scale=424:248:force_original_aspect_ratio=increase:flags=lanczos,crop=424:248:100:(ih-oh)/2',
    );
  });
});

describe('buildTrimArgs', () => {
  it('returns empty arrays when no trim values are provided', () => {
    const result = buildTrimArgs();
    expect(result).toEqual({ pre: [], out: [] });
  });

  it('returns empty arrays when only trimStart is provided', () => {
    const result = buildTrimArgs(1.5, undefined);
    expect(result).toEqual({ pre: [], out: [] });
  });

  it('returns empty arrays when only trimEnd is provided', () => {
    const result = buildTrimArgs(undefined, 3.0);
    expect(result).toEqual({ pre: [], out: [] });
  });

  it('returns correct -ss and -t flags with trim range', () => {
    const result = buildTrimArgs(1.5, 4.0);
    expect(result.pre).toEqual(['-ss', '1.500']);
    expect(result.out).toEqual(['-t', '2.500']);
  });

  it('returns empty arrays when duration is zero or negative', () => {
    expect(buildTrimArgs(3.0, 3.0)).toEqual({ pre: [], out: [] });
    expect(buildTrimArgs(5.0, 2.0)).toEqual({ pre: [], out: [] });
  });

  it('handles trim starting at 0', () => {
    const result = buildTrimArgs(0, 2.5);
    expect(result.pre).toEqual(['-ss', '0.000']);
    expect(result.out).toEqual(['-t', '2.500']);
  });

  it('formats timestamps with 3 decimal places', () => {
    const result = buildTrimArgs(0.1, 1);
    expect(result.pre).toEqual(['-ss', '0.100']);
    expect(result.out).toEqual(['-t', '0.900']);
  });

  it('handles very small trim range above zero', () => {
    const result = buildTrimArgs(1.0, 1.1);
    expect(result.pre).toEqual(['-ss', '1.000']);
    expect(result.out).toEqual(['-t', '0.100']);
  });

  it('places -ss in pre and -t in out for correct FFmpeg positioning', () => {
    const result = buildTrimArgs(2.0, 5.0);
    // pre goes before -i (input seeking)
    expect(result.pre[0]).toBe('-ss');
    // out goes before output file (output duration limit)
    expect(result.out[0]).toBe('-t');
  });
});

describe('computeScaledDimensions', () => {
  it('scales by height when original is wider than target ratio', () => {
    // 1920x1080 (16:9) → target 424x248 (≈1.71:1)
    // origW/origH=1.78 > targetW/targetH=1.71 → scale by height
    const { scaledW, scaledH } = computeScaledDimensions(1920, 1080, 424, 248);
    expect(scaledH).toBe(248);
    expect(scaledW).toBeCloseTo(1920 * (248 / 1080), 2);
  });

  it('scales by width when original is taller than target ratio', () => {
    // 520x800 (portrait) → target 424x248
    // origW/origH=0.65 < targetW/targetH=1.71 → scale by width
    const { scaledW, scaledH } = computeScaledDimensions(520, 800, 424, 248);
    expect(scaledW).toBe(424);
    expect(scaledH).toBeCloseTo(800 * (424 / 520), 2);
  });

  it('produces exact target dimensions when aspect ratios match', () => {
    // Same ratio as target
    const { scaledW, scaledH } = computeScaledDimensions(848, 496, 424, 248);
    expect(scaledW).toBeCloseTo(424, 2);
    expect(scaledH).toBeCloseTo(248, 2);
  });

  it('handles square original with non-square target', () => {
    // 500x500 → target 424x248
    // origW/origH=1 < targetW/targetH=1.71 → scale by width
    const { scaledW, scaledH } = computeScaledDimensions(500, 500, 424, 248);
    expect(scaledW).toBe(424);
    expect(scaledH).toBeCloseTo(500 * (424 / 500), 2);
  });
});

describe('computeMaxCropOffset', () => {
  it('returns positive maxY when original is taller than target ratio', () => {
    // 520x800 → target 424x248
    // scaledW=424, scaledH=800*(424/520)≈652.3
    const { maxX, maxY } = computeMaxCropOffset(520, 800, 424, 248);
    expect(maxX).toBe(0); // no horizontal room
    expect(maxY).toBeCloseTo(800 * (424 / 520) - 248, 2);
  });

  it('returns positive maxX when original is wider than target ratio', () => {
    // 1920x1080 → target 424x248
    // scaledW=1920*(248/1080)≈440.9, scaledH=248
    const { maxX, maxY } = computeMaxCropOffset(1920, 1080, 424, 248);
    expect(maxX).toBeCloseTo(1920 * (248 / 1080) - 424, 2);
    expect(maxY).toBe(0); // no vertical room
  });

  it('returns zero offsets when aspect ratios match exactly', () => {
    const { maxX, maxY } = computeMaxCropOffset(848, 496, 424, 248);
    expect(maxX).toBeCloseTo(0, 2);
    expect(maxY).toBeCloseTo(0, 2);
  });

  it('never returns negative values', () => {
    const { maxX, maxY } = computeMaxCropOffset(100, 100, 200, 200);
    expect(maxX).toBe(0);
    expect(maxY).toBe(0);
  });
});
