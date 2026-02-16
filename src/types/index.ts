import type { RefObject } from 'react';

export type { SplitResult, SplitProgress } from '../services/ffmpeg';
export type { Preset } from '../constants/presets';

export interface GiphyGif {
  id: string;
  title: string;
  images: {
    original: { url: string };
    fixed_width: { url: string; width: string; height: string };
  };
}

export interface SyncedSrcs {
  orig: string;
  crop: string;
}

export interface FileDropZoneProps {
  file: File | null;
  preview: string | null;
  cropSyncKey: number;
  isDragOver: boolean;
  fileInputRef: RefObject<HTMLInputElement | null>;
  formatSize: (bytes: number) => string;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClear: () => void;
}

export interface DeviceConfigProps {
  presetIndex: number;
  cutoffMode: boolean;
  customCropEnabled: boolean;
  customLoopEnabled: boolean;
  customGridEnabled: boolean;
  customCols: number;
  customRows: number;
  gridOffsetCol: number;
  gridOffsetRow: number;
  targetWidth: number;
  targetHeight: number;
  preset: import('../constants/presets').Preset;
  basePreset: import('../constants/presets').Preset;
  isCropping: boolean;
  isSplitting: boolean;
  onPresetChange: (index: number) => void;
  onCutoffToggle: (checked: boolean) => void;
  onCustomCropToggle: (checked: boolean) => void;
  onCustomLoopToggle: (checked: boolean) => void;
  onCustomGridToggle: (checked: boolean) => void;
  onCustomColsChange: (cols: number) => void;
  onCustomRowsChange: (rows: number) => void;
  onGridOffsetChange: (col: number, row: number) => void;
}

export interface CropPreviewProps {
  preview: string | null;
  croppedPreview: string | null;
  isCropping: boolean;
  isSplitting: boolean;
  loading: boolean;
  error: string | null;
  syncedSrcs: SyncedSrcs | null;
  cropSyncKey: number;
  targetWidth: number;
  targetHeight: number;
  originalSize: { w: number; h: number } | null;
  progressLabel: string;
  customCropEnabled: boolean;
  customLoopEnabled: boolean;
  gifDuration: number | null;
  trimRange: { start: number; end: number } | null;
  filmstripFrames: string[];
  onSplit: () => void;
  onCropOffsetChange: (x: number, y: number) => void;
  onTrimChange: (start: number, end: number) => void;
}

export interface ResultsPanelProps {
  file: File | null;
  croppedPreview: string | null;
  isSplitting: boolean;
  results: import('../services/ffmpeg').SplitResult[];
  tilesReady: boolean;
  tileSyncKey: number;
  preset: import('../constants/presets').Preset;
  basePreset: import('../constants/presets').Preset;
  customGridEnabled: boolean;
  gridOffsetCol: number;
  gridOffsetRow: number;
  previewTileSize: number;
  scaledGap: number;
  zipping: boolean;
  zippingProfile: boolean;
  resultsRef: RefObject<HTMLDivElement | null>;
  onTileLoad: () => void;
  onDownloadZip: () => void;
  onDownloadProfile: () => void;
}
