import { useState, useCallback } from 'react';
import JSZip from 'jszip';
import { generateStreamDeckProfile } from '../services/streamDeckProfile';
import { generateZipFolderName, generateProfileFileName } from '../utils/filename';
import type { SplitResult } from '../services/ffmpeg';
import type { Preset } from '../constants/presets';

export function useDownload() {
  const [zipping, setZipping] = useState(false);
  const [zippingProfile, setZippingProfile] = useState(false);

  const downloadZip = useCallback(async (
    results: SplitResult[],
    file: File,
    cutoffMode: boolean,
  ) => {
    if (results.length === 0) return;
    setZipping(true);
    try {
      const zip = new JSZip();
      const folderName = generateZipFolderName(file.name, cutoffMode, Date.now());
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
  }, []);

  const downloadProfile = useCallback(async (
    results: SplitResult[],
    file: File,
    preset: Preset,
  ) => {
    if (results.length === 0) return;
    setZippingProfile(true);
    try {
      const baseName = file.name.replace(/\.gif$/i, '');
      const timestamp = Math.floor(Date.now() / 1000);
      const profileFileName = generateProfileFileName(file.name, preset.label, timestamp);
      const blob = await generateStreamDeckProfile(results, baseName, preset.model);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = profileFileName;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setZippingProfile(false);
    }
  }, []);

  return { zipping, zippingProfile, downloadZip, downloadProfile };
}
