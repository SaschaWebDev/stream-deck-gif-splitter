import type { Preset } from '../constants/presets';

export function calculateTargetWidth(preset: Preset, cutoffMode: boolean): number {
  return preset.cols * preset.tileWidth + (cutoffMode ? (preset.cols - 1) * preset.gap : 0);
}

export function calculateTargetHeight(preset: Preset, cutoffMode: boolean): number {
  return preset.rows * preset.tileHeight + (cutoffMode ? (preset.rows - 1) * preset.gap : 0);
}

export function calculateGap(preset: Preset, cutoffMode: boolean): number {
  return cutoffMode ? preset.gap : 0;
}

export function calculatePreviewTileSize(preset: Preset): number {
  return Math.min(preset.tileWidth, 72);
}

export function calculateScaledGap(preset: Preset, cutoffMode: boolean): number {
  const previewTileSize = calculatePreviewTileSize(preset);
  return cutoffMode ? Math.round(preset.gap * (previewTileSize / preset.tileWidth)) : 16;
}
