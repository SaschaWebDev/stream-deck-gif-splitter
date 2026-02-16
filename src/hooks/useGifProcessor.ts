import { useState, useRef, useCallback } from 'react';
import { useFFmpeg } from '../services/ffmpeg';
import { getProgressLabel } from '../utils/progress';
import type { SplitResult } from '../services/ffmpeg';

export function useGifProcessor() {
  const [croppedPreview, setCroppedPreview] = useState<string | null>(null);
  const [isCropping, setIsCropping] = useState(false);
  const [results, setResults] = useState<SplitResult[]>([]);
  const [tilesReady, setTilesReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cropSyncKey, setCropSyncKey] = useState(0);
  const [tileSyncKey] = useState(0);
  const tileLoadCount = useRef(0);

  const { loading, cropGif, splitGif, extractFrames, cleanup, progress, resetProgress } = useFFmpeg();

  const isSplitting = progress !== null && progress.phase !== 'done';

  const progressLabel = getProgressLabel(progress);

  const performCrop = useCallback(async (f: File, tw: number, th: number, cropX?: number, cropY?: number, trimStart?: number, trimEnd?: number) => {
    setIsCropping(true);
    setError(null);
    try {
      const url = await cropGif(f, tw, th, cropX, cropY, trimStart, trimEnd);
      setCroppedPreview(url);
      setCropSyncKey((k) => k + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to crop GIF');
    } finally {
      setIsCropping(false);
    }
  }, [cropGif]);

  const performSplit = useCallback(async (
    file: File,
    cols: number,
    rows: number,
    tileWidth: number,
    tileHeight: number,
    gap: number,
  ) => {
    if (!croppedPreview) return;
    setError(null);
    results.forEach((r) => URL.revokeObjectURL(r.url));
    setResults([]);
    setTilesReady(false);
    tileLoadCount.current = 0;

    try {
      const splitResults = await splitGif(file.name, cols, rows, tileWidth, tileHeight, gap);
      setResults(splitResults);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to split GIF');
      resetProgress();
    }
  }, [croppedPreview, splitGif, results, resetProgress]);

  const handleTileLoad = useCallback(() => {
    tileLoadCount.current++;
    if (tileLoadCount.current >= results.length && results.length > 0) {
      setTilesReady(true);
    }
  }, [results.length]);

  const resetProcessor = useCallback(async () => {
    if (croppedPreview) URL.revokeObjectURL(croppedPreview);
    results.forEach((r) => URL.revokeObjectURL(r.url));
    await cleanup();
    setCroppedPreview(null);
    setResults([]);
    setTilesReady(false);
    setError(null);
    resetProgress();
  }, [croppedPreview, results, cleanup, resetProgress]);

  const clearResults = useCallback(() => {
    results.forEach((r) => URL.revokeObjectURL(r.url));
    setResults([]);
    setTilesReady(false);
    resetProgress();
  }, [results, resetProgress]);

  const clearCroppedPreview = useCallback(async () => {
    if (croppedPreview) URL.revokeObjectURL(croppedPreview);
    setCroppedPreview(null);
    await cleanup();
  }, [croppedPreview, cleanup]);

  return {
    croppedPreview,
    isCropping,
    results,
    tilesReady,
    error,
    cropSyncKey,
    tileSyncKey,
    loading,
    progress,
    isSplitting,
    progressLabel,
    performCrop,
    performSplit,
    extractFrames,
    handleTileLoad,
    resetProcessor,
    clearResults,
    clearCroppedPreview,
  };
}
