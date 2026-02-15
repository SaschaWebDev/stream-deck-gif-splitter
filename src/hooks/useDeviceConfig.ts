import { useState } from 'react';
import { PRESETS } from '../constants/presets';
import {
  calculateTargetWidth,
  calculateTargetHeight,
  calculateGap,
  calculatePreviewTileSize,
  calculateScaledGap,
} from '../utils/device';

export function useDeviceConfig() {
  const [presetIndex, setPresetIndex] = useState(0);
  const [cutoffMode, setCutoffMode] = useState(true);

  const preset = PRESETS[presetIndex];
  const gap = calculateGap(preset, cutoffMode);
  const targetWidth = calculateTargetWidth(preset, cutoffMode);
  const targetHeight = calculateTargetHeight(preset, cutoffMode);
  const previewTileSize = calculatePreviewTileSize(preset);
  const scaledGap = calculateScaledGap(preset, cutoffMode);

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
