import { useState } from 'react';
import { PRESETS } from '../constants/presets';

export function useDeviceConfig() {
  const [presetIndex, setPresetIndex] = useState(0);
  const [cutoffMode, setCutoffMode] = useState(true);

  const preset = PRESETS[presetIndex];
  const gap = cutoffMode ? preset.gap : 0;
  const targetWidth = preset.cols * preset.tileWidth + (cutoffMode ? (preset.cols - 1) * preset.gap : 0);
  const targetHeight = preset.rows * preset.tileHeight + (cutoffMode ? (preset.rows - 1) * preset.gap : 0);
  const previewTileSize = Math.min(preset.tileWidth, 72);
  const scaledGap = cutoffMode ? Math.round(preset.gap * (previewTileSize / preset.tileWidth)) : 16;

  return {
    presetIndex,
    setPresetIndex,
    cutoffMode,
    setCutoffMode,
    preset,
    gap,
    targetWidth,
    targetHeight,
    previewTileSize,
    scaledGap,
  };
}
