import { useState, useMemo } from 'react';
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
  const [customGridEnabled, setCustomGridEnabled] = useState(false);
  const [customCols, setCustomCols] = useState(1);
  const [customRows, setCustomRows] = useState(1);
  const [gridOffsetCol, setGridOffsetCol] = useState(0);
  const [gridOffsetRow, setGridOffsetRow] = useState(0);

  const basePreset = PRESETS[presetIndex];

  const preset = useMemo(() => {
    if (!customGridEnabled) return basePreset;
    return { ...basePreset, cols: customCols, rows: customRows };
  }, [customGridEnabled, basePreset, customCols, customRows]);

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
    basePreset,
    gap,
    targetWidth,
    targetHeight,
    previewTileSize,
    scaledGap,
    customGridEnabled,
    setCustomGridEnabled,
    customCols,
    setCustomCols,
    customRows,
    setCustomRows,
    gridOffsetCol,
    setGridOffsetCol,
    gridOffsetRow,
    setGridOffsetRow,
  };
}
