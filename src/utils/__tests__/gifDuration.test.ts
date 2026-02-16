import { parseGifDuration } from '../gifDuration';

/** Build a minimal GIF89a binary with the given frame delays (in centiseconds). */
function buildGifBytes(delays: number[]): Uint8Array {
  const parts: number[] = [];

  // GIF89a header
  parts.push(0x47, 0x49, 0x46, 0x38, 0x39, 0x61); // "GIF89a"
  // Logical screen descriptor (width=1, height=1, no GCT)
  parts.push(0x01, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00);

  for (const delay of delays) {
    // Graphics Control Extension
    parts.push(0x21, 0xf9, 0x04);
    parts.push(0x00); // packed byte (no disposal, no transparency)
    parts.push(delay & 0xff, (delay >> 8) & 0xff); // delay (little-endian)
    parts.push(0x00); // transparent color index
    parts.push(0x00); // block terminator

    // Minimal image descriptor
    parts.push(0x2c); // image separator
    parts.push(0x00, 0x00, 0x00, 0x00); // left, top
    parts.push(0x01, 0x00, 0x01, 0x00); // width=1, height=1
    parts.push(0x00); // no local color table
    // Minimal LZW image data
    parts.push(0x02); // LZW minimum code size
    parts.push(0x02); // sub-block size
    parts.push(0x4c, 0x01); // compressed data
    parts.push(0x00); // sub-block terminator
  }

  // Trailer
  parts.push(0x3b);

  return new Uint8Array(parts);
}

function bytesToFile(bytes: Uint8Array): File {
  // Cast needed because strict TS doesn't allow Uint8Array as BlobPart directly
  return new File([bytes as unknown as BlobPart], 'test.gif', { type: 'image/gif' });
}

describe('parseGifDuration', () => {
  it('returns 0 for a file with no GCE blocks', async () => {
    // Just a GIF header with no frames
    const bytes = new Uint8Array([
      0x47, 0x49, 0x46, 0x38, 0x39, 0x61, // GIF89a
      0x01, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00, // LSD
      0x3b, // trailer
    ]);
    const duration = await parseGifDuration(bytesToFile(bytes));
    expect(duration).toBe(0);
  });

  it('parses a single frame with 100cs (1 second) delay', async () => {
    const bytes = buildGifBytes([100]);
    const duration = await parseGifDuration(bytesToFile(bytes));
    expect(duration).toBe(1);
  });

  it('sums multiple frame delays correctly', async () => {
    // 3 frames: 10cs (0.1s), 20cs (0.2s), 30cs (0.3s) = 0.6s total
    const bytes = buildGifBytes([10, 20, 30]);
    const duration = await parseGifDuration(bytesToFile(bytes));
    expect(duration).toBeCloseTo(0.6, 2);
  });

  it('handles large delay values (> 255cs)', async () => {
    // 500cs = 5 seconds
    const bytes = buildGifBytes([500]);
    const duration = await parseGifDuration(bytesToFile(bytes));
    expect(duration).toBe(5);
  });

  it('replaces outlier frame delays with the median', async () => {
    // 64379cs is a bogus value seen in broken GIFs
    // Median of [6, 6, 6, 64379] = 6, threshold = max(60, 100) = 100
    // 64379 > 100, so replaced with median 6
    // Total: 4 * 6cs = 24cs = 0.24s
    const bytes = buildGifBytes([6, 6, 6, 64379]);
    const duration = await parseGifDuration(bytesToFile(bytes));
    expect(duration).toBeCloseTo(0.24, 2);
  });

  it('keeps legitimate varied delays that are within threshold', async () => {
    // Median of [5, 5, 10, 10] = 10 (sorted: [5,5,10,10], idx 2)
    // Threshold = max(100, 100) = 100, all under — no outliers
    const bytes = buildGifBytes([5, 10, 5, 10]);
    const duration = await parseGifDuration(bytesToFile(bytes));
    expect(duration).toBeCloseTo(0.3, 2);
  });

  it('returns 0 for an empty file', async () => {
    const bytes = new Uint8Array([]);
    const duration = await parseGifDuration(bytesToFile(bytes));
    expect(duration).toBe(0);
  });

  it('handles a single-frame GIF (no outlier possible)', async () => {
    const bytes = buildGifBytes([50]);
    const duration = await parseGifDuration(bytesToFile(bytes));
    expect(duration).toBe(0.5);
  });

  it('replaces multiple outliers with the median', async () => {
    // Median of [5, 5, 5, 5, 5000, 9999] = 5 (sorted idx 3)
    // Threshold = max(50, 100) = 100
    // 5000 and 9999 both replaced → 6 * 5cs = 30cs = 0.30s
    const bytes = buildGifBytes([5, 5000, 5, 9999, 5, 5]);
    const duration = await parseGifDuration(bytesToFile(bytes));
    expect(duration).toBeCloseTo(0.3, 2);
  });

  it('treats all identical delays as valid (no outliers)', async () => {
    // All same → median = 8, threshold = max(80, 100) = 100
    // All 8 < 100 → no outliers. 10 * 8cs = 80cs = 0.8s
    const bytes = buildGifBytes(Array(10).fill(8));
    const duration = await parseGifDuration(bytesToFile(bytes));
    expect(duration).toBeCloseTo(0.8, 2);
  });

  it('handles zero-delay frames (common in fast GIFs)', async () => {
    // Zero delay means "as fast as possible", some GIFs use 0cs
    // Median of [0,0,0,0] = 0, threshold = max(0,100) = 100
    // All 0 ≤ 100 → no outliers. Total = 0
    const bytes = buildGifBytes([0, 0, 0, 0]);
    const duration = await parseGifDuration(bytesToFile(bytes));
    expect(duration).toBe(0);
  });
});
