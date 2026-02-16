/**
 * Build the FFmpeg scale+crop filter string.
 * Scales so the smallest dimension fills the target, then crops with an optional offset.
 * When cropX/cropY are omitted, FFmpeg's default center-crop expression is used.
 */
export function buildScaleCropFilter(
  targetWidth: number,
  targetHeight: number,
  cropX?: number,
  cropY?: number,
): string {
  const cropXExpr = cropX != null ? String(Math.round(cropX)) : '(iw-ow)/2';
  const cropYExpr = cropY != null ? String(Math.round(cropY)) : '(ih-oh)/2';
  return `scale=${targetWidth}:${targetHeight}:force_original_aspect_ratio=increase:flags=lanczos,crop=${targetWidth}:${targetHeight}:${cropXExpr}:${cropYExpr}`;
}

/**
 * Compute the intermediate scaled dimensions that FFmpeg produces
 * after scaling so the smallest side fills the target.
 */
export function computeScaledDimensions(
  origW: number,
  origH: number,
  targetW: number,
  targetH: number,
): { scaledW: number; scaledH: number } {
  if (origW / origH > targetW / targetH) {
    return {
      scaledW: origW * (targetH / origH),
      scaledH: targetH,
    };
  }
  return {
    scaledW: targetW,
    scaledH: origH * (targetW / origW),
  };
}

/**
 * Build FFmpeg args to trim a time range from the input.
 * `pre` args go before `-i` (input seeking with -ss).
 * `out` args go before the output filename (-t as output option to limit duration).
 * Using -t as an output option ensures it works correctly with GIF demuxing.
 */
export function buildTrimArgs(
  trimStart?: number,
  trimEnd?: number,
): { pre: string[]; out: string[] } {
  if (trimStart == null || trimEnd == null) return { pre: [], out: [] };
  const duration = trimEnd - trimStart;
  if (duration <= 0) return { pre: [], out: [] };
  return {
    pre: ['-ss', trimStart.toFixed(3)],
    out: ['-t', duration.toFixed(3)],
  };
}

/**
 * Compute the maximum allowed crop offset in each axis.
 * Returns { maxX, maxY } — the crop offset where the crop window
 * reaches the far edge of the scaled image.
 */
export function computeMaxCropOffset(
  origW: number,
  origH: number,
  targetW: number,
  targetH: number,
): { maxX: number; maxY: number } {
  const { scaledW, scaledH } = computeScaledDimensions(origW, origH, targetW, targetH);
  return {
    maxX: Math.max(0, scaledW - targetW),
    maxY: Math.max(0, scaledH - targetH),
  };
}
