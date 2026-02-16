/**
 * Parse GIF frame delays from raw bytes to compute total animation duration.
 * Scans for Graphics Control Extension blocks (0x21 0xF9 0x04) and extracts
 * the 2-byte delay field at offset +4 (little-endian, in centiseconds).
 *
 * Uses median-based outlier detection: any frame delay exceeding 10x the
 * median is replaced with the median. This handles broken GIFs that have
 * bogus last-frame delays (common encoding error).
 */
export async function parseGifDuration(file: File): Promise<number> {
  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  const delays: number[] = [];

  for (let i = 0; i < bytes.length - 6; i++) {
    // Graphics Control Extension: 0x21 (extension introducer), 0xF9 (GCE label), 0x04 (block size)
    if (bytes[i] === 0x21 && bytes[i + 1] === 0xf9 && bytes[i + 2] === 0x04) {
      // Delay is at offset +4 and +5 (little-endian, centiseconds)
      const delay = bytes[i + 4] | (bytes[i + 5] << 8);
      delays.push(delay);
    }
  }

  if (delays.length === 0) return 0;

  // Find median delay for outlier detection
  const sorted = [...delays].sort((a, b) => a - b);
  const median = sorted[Math.floor(sorted.length / 2)];
  const outlierThreshold = Math.max(median * 10, 100); // at least 1s threshold

  let totalCentiseconds = 0;
  for (const delay of delays) {
    totalCentiseconds += delay > outlierThreshold ? median : delay;
  }

  return totalCentiseconds / 100;
}
