import { useState, useRef, useCallback } from 'react';
import JSZip from 'jszip';
import { useFFmpeg, type SplitResult } from '../useFFmpeg';
import { generateStreamDeckProfile } from '../streamDeckProfile';
import { PRESETS } from './presets';

export function useGifSplitter() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [croppedPreview, setCroppedPreview] = useState<string | null>(null);
  const [isCropping, setIsCropping] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [presetIndex, setPresetIndex] = useState(0);
  const [results, setResults] = useState<SplitResult[]>([]);
  const [tilesReady, setTilesReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [zipping, setZipping] = useState(false);
  const [zippingProfile, setZippingProfile] = useState(false);
  const [originalSize, setOriginalSize] = useState<{ w: number; h: number } | null>(null);
  const [cutoffMode, setCutoffMode] = useState(false);
  const [cropSyncKey, setCropSyncKey] = useState(0);
  const [tileSyncKey] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const tileLoadCount = useRef(0);

  const { loading, cropGif, splitGif, cleanup, progress, resetProgress } = useFFmpeg();

  const preset = PRESETS[presetIndex];
  const gap = cutoffMode ? preset.gap : 0;
  const targetWidth = preset.cols * preset.tileWidth + (cutoffMode ? (preset.cols - 1) * preset.gap : 0);
  const targetHeight = preset.rows * preset.tileHeight + (cutoffMode ? (preset.rows - 1) * preset.gap : 0);
  const previewTileSize = Math.min(preset.tileWidth, 72);
  const scaledGap = cutoffMode ? Math.round(preset.gap * (previewTileSize / preset.tileWidth)) : 16;

  const performCrop = useCallback(async (f: File, tw: number, th: number) => {
    setIsCropping(true);
    setError(null);
    try {
      const url = await cropGif(f, tw, th);
      setCroppedPreview(url);
      setCropSyncKey((k) => k + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to crop GIF');
    } finally {
      setIsCropping(false);
    }
  }, [cropGif]);

  const handleFile = useCallback(async (f: File) => {
    if (f.type !== 'image/gif') return;

    if (croppedPreview) URL.revokeObjectURL(croppedPreview);
    results.forEach((r) => URL.revokeObjectURL(r.url));
    await cleanup();

    const objectUrl = URL.createObjectURL(f);
    const img = new Image();
    img.src = objectUrl;
    await new Promise<void>((resolve) => { img.onload = () => resolve(); });
    setOriginalSize({ w: img.naturalWidth, h: img.naturalHeight });

    setFile(f);
    setPreview(objectUrl);
    setCroppedPreview(null);
    setResults([]);
    setTilesReady(false);
    setError(null);
    resetProgress();

    await performCrop(f, targetWidth, targetHeight);
  }, [croppedPreview, results, cleanup, resetProgress, performCrop, targetWidth, targetHeight]);

  const handlePresetChange = useCallback(async (newIndex: number) => {
    setPresetIndex(newIndex);
    setCutoffMode(false);
    const p = PRESETS[newIndex];
    const tw = p.cols * p.tileWidth;
    const th = p.rows * p.tileHeight;

    results.forEach((r) => URL.revokeObjectURL(r.url));
    setResults([]);
    setTilesReady(false);
    resetProgress();

    if (file) {
      if (croppedPreview) URL.revokeObjectURL(croppedPreview);
      setCroppedPreview(null);
      await cleanup();
      await performCrop(file, tw, th);
    }
  }, [file, croppedPreview, results, cleanup, resetProgress, performCrop]);

  const handleCutoffToggle = useCallback(async (checked: boolean) => {
    setCutoffMode(checked);
    const tw = preset.cols * preset.tileWidth + (checked ? (preset.cols - 1) * preset.gap : 0);
    const th = preset.rows * preset.tileHeight + (checked ? (preset.rows - 1) * preset.gap : 0);

    results.forEach((r) => URL.revokeObjectURL(r.url));
    setResults([]);
    setTilesReady(false);
    resetProgress();

    if (file) {
      if (croppedPreview) URL.revokeObjectURL(croppedPreview);
      setCroppedPreview(null);
      await cleanup();
      await performCrop(file, tw, th);
    }
  }, [file, croppedPreview, results, cleanup, resetProgress, performCrop, preset]);

  const clearFile = useCallback(async () => {
    if (preview) URL.revokeObjectURL(preview);
    if (croppedPreview) URL.revokeObjectURL(croppedPreview);
    results.forEach((r) => URL.revokeObjectURL(r.url));
    await cleanup();
    setFile(null);
    setPreview(null);
    setCroppedPreview(null);
    setOriginalSize(null);
    setResults([]);
    setTilesReady(false);
    setError(null);
    resetProgress();
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, [preview, croppedPreview, results, cleanup, resetProgress]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) handleFile(dropped);
  }, [handleFile]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) handleFile(selected);
  }, [handleFile]);

  const handleSplit = useCallback(async () => {
    if (!file || !croppedPreview) return;
    setError(null);
    results.forEach((r) => URL.revokeObjectURL(r.url));
    setResults([]);
    setTilesReady(false);
    tileLoadCount.current = 0;

    try {
      const splitResults = await splitGif(file.name, preset.cols, preset.rows, preset.tileWidth, preset.tileHeight, gap);
      setResults(splitResults);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to split GIF');
      resetProgress();
    }
  }, [file, croppedPreview, preset, splitGif, results, gap, resetProgress]);

  const handleTileLoad = useCallback(() => {
    tileLoadCount.current++;
    if (tileLoadCount.current >= results.length && results.length > 0) {
      setTilesReady(true);
    }
  }, [results.length]);

  const downloadZip = useCallback(async () => {
    if (results.length === 0 || !file) return;
    setZipping(true);
    try {
      const zip = new JSZip();
      const baseName = file.name.replace(/\.gif$/i, '');
      const suffix = cutoffMode ? '_tile-cutoff' : '';
      const folderName = `${baseName}${suffix}_${Date.now()}`;
      for (const r of results) {
        zip.file(`${folderName}/${r.filename}`, r.blob);
      }
      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${folderName}.zip`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setZipping(false);
    }
  }, [results, file, cutoffMode]);

  const downloadProfile = useCallback(async () => {
    if (results.length === 0 || !file) return;
    setZippingProfile(true);
    try {
      const baseName = file.name.replace(/\.gif$/i, '');
      const deviceName = preset.label.replace(/\s+/g, '-');
      const timestamp = Math.floor(Date.now() / 1000);
      const suffix = `_${deviceName}_${timestamp}`;
      const extension = '.streamDeckProfile';
      const maxBase = 180 - suffix.length - extension.length;
      const safeName = baseName.substring(0, maxBase);
      const blob = await generateStreamDeckProfile(results, baseName, preset.model);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${safeName}${suffix}${extension}`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setZippingProfile(false);
    }
  }, [results, file, preset.model, preset.label]);

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const isSplitting = progress !== null && progress.phase !== 'done';

  const progressLabel = (() => {
    if (!progress) return '';
    switch (progress.phase) {
      case 'loading': return 'Loading ffmpeg...';
      case 'palette': return 'Generating palette...';
      case 'splitting': return `Splitting tile ${progress.current} of ${progress.total}...`;
      case 'done': return 'Done!';
    }
  })();

  return {
    file, preview, croppedPreview, isCropping, isDragOver,
    presetIndex, preset, results, tilesReady, error,
    zipping, zippingProfile, originalSize, cutoffMode,
    cropSyncKey, tileSyncKey, fileInputRef,
    loading, progress, isSplitting, progressLabel,
    targetWidth, targetHeight, previewTileSize, scaledGap, gap,
    handleFile, handlePresetChange, handleCutoffToggle,
    clearFile, handleDragOver, handleDragLeave, handleDrop,
    handleInputChange, handleSplit, handleTileLoad,
    downloadZip, downloadProfile, formatSize,
  };
}
