import { useState, useRef, useCallback } from 'react';
import { useFFmpeg } from '../services/ffmpeg';
import { getProgressLabel } from '../utils/progress';
import type { SplitResult } from '../services/ffmpeg';

type ScreensaverResult = { blob: Blob; url: string; filename: string };

export function useGifProcessor() {
  const [croppedPreview, setCroppedPreview] = useState<string | null>(null);
  const [isCropping, setIsCropping] = useState(false);
  const [results, setResults] = useState<SplitResult[]>([]);
  const [tilesReady, setTilesReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [screensaverResult, setScreensaverResult] = useState<ScreensaverResult | null>(null);
  const screensaverResultRef = useRef<ScreensaverResult | null>(null);
  const [cropSyncKey, setCropSyncKey] = useState(0);
  const [tileSyncKey] = useState(0);
  const tileLoadCount = useRef(0);

  const { loading, cropGif, splitGif, generateScreensaver, extractFrames, cleanup, progress, resetProgress } = useFFmpeg();

  const isSplitting = progress !== null && progress.phase !== 'done';

  const progressLabel = getProgressLabel(progress);

  const updateScreensaverResult = useCallback((next: ScreensaverResult | null) => {
    if (screensaverResultRef.current) URL.revokeObjectURL(screensaverResultRef.current.url);
    screensaverResultRef.current = next;
    setScreensaverResult(next);
  }, []);

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
    updateScreensaverResult(null);
    setTilesReady(false);
    tileLoadCount.current = 0;

    try {
      const splitResults = await splitGif(file, cols, rows, tileWidth, tileHeight, gap);
      setResults(splitResults);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to split GIF');
      resetProgress();
    }
  }, [croppedPreview, splitGif, results, updateScreensaverResult, resetProgress]);

  const performGenerateScreensaver = useCallback(async (
    file: File,
    cols: number,
    rows: number,
    tileWidth: number,
    tileHeight: number,
    gap: number,
    frameTime?: number,
  ) => {
    if (!croppedPreview) return;
    setError(null);
    results.forEach((r) => URL.revokeObjectURL(r.url));
    setResults([]);
    updateScreensaverResult(null);
    setTilesReady(false);

    try {
      const result = await generateScreensaver(file, cols, rows, tileWidth, tileHeight, gap, frameTime);
      updateScreensaverResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate screensaver');
      resetProgress();
    }
  }, [croppedPreview, generateScreensaver, results, updateScreensaverResult, resetProgress]);

  const handleTileLoad = useCallback(() => {
    tileLoadCount.current++;
    if (tileLoadCount.current >= results.length && results.length > 0) {
      setTilesReady(true);
    }
  }, [results.length]);

  const resetProcessor = useCallback(async () => {
    if (croppedPreview) URL.revokeObjectURL(croppedPreview);
    results.forEach((r) => URL.revokeObjectURL(r.url));
    updateScreensaverResult(null);
    await cleanup();
    setCroppedPreview(null);
    setResults([]);
    setTilesReady(false);
    setError(null);
    resetProgress();
  }, [croppedPreview, results, updateScreensaverResult, cleanup, resetProgress]);

  const clearResults = useCallback(() => {
    results.forEach((r) => URL.revokeObjectURL(r.url));
    updateScreensaverResult(null);
    setResults([]);
    setTilesReady(false);
    resetProgress();
  }, [results, updateScreensaverResult, resetProgress]);

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
    screensaverResult,
    cropSyncKey,
    tileSyncKey,
    loading,
    progress,
    isSplitting,
    progressLabel,
    performCrop,
    performSplit,
    performGenerateScreensaver,
    extractFrames,
    handleTileLoad,
    resetProcessor,
    clearResults,
    clearCroppedPreview,
  };
}
