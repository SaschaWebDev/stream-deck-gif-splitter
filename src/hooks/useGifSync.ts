import { useState, useEffect } from 'react';
import type { SyncedSrcs } from '../types';

export function useGifSync(
  preview: string | null,
  croppedPreview: string | null,
  isCropping: boolean,
  cropSyncKey: number,
): SyncedSrcs | null {
  const [syncedSrcs, setSyncedSrcs] = useState<SyncedSrcs | null>(null);

  useEffect(() => {
    setSyncedSrcs(null);

    if (!preview || !croppedPreview || isCropping) return;

    let cancelled = false;

    const imgA = new Image();
    const imgB = new Image();
    let loadedCount = 0;

    const onBothReady = () => {
      loadedCount++;
      if (loadedCount < 2 || cancelled) return;

      const freshOrig = preview + '#t=' + Date.now();
      const freshCrop = croppedPreview + '#t=' + Date.now();

      requestAnimationFrame(() => {
        if (cancelled) return;
        setSyncedSrcs({ orig: freshOrig, crop: freshCrop });
      });
    };

    imgA.onload = onBothReady;
    imgB.onload = onBothReady;
    imgA.src = preview;
    imgB.src = croppedPreview;

    return () => {
      cancelled = true;
    };
  }, [preview, croppedPreview, isCropping, cropSyncKey]);

  return syncedSrcs;
}
