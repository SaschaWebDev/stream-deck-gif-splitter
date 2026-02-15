import type { RefObject } from 'react';

export type { SplitResult, SplitProgress } from '../services/ffmpeg';
export type { Preset } from '../constants/presets';

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
  targetWidth: number;
  targetHeight: number;
  preset: import('../constants/presets').Preset;
  isCropping: boolean;
  isSplitting: boolean;
  onPresetChange: (index: number) => void;
  onCutoffToggle: (checked: boolean) => void;
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
  onSplit: () => void;
}

export interface ResultsPanelProps {
  file: File | null;
  croppedPreview: string | null;
  isSplitting: boolean;
  results: import('../services/ffmpeg').SplitResult[];
  tilesReady: boolean;
  tileSyncKey: number;
  preset: import('../constants/presets').Preset;
  previewTileSize: number;
  scaledGap: number;
  zipping: boolean;
  zippingProfile: boolean;
  resultsRef: RefObject<HTMLDivElement | null>;
  onTileLoad: () => void;
  onDownloadZip: () => void;
  onDownloadProfile: () => void;
}
