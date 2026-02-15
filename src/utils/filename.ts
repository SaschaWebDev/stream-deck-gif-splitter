export function generateZipFolderName(fileName: string, cutoffMode: boolean, timestamp: number): string {
  const baseName = fileName.replace(/\.gif$/i, '');
  const suffix = cutoffMode ? '_tile-cutoff' : '';
  return `${baseName}${suffix}_${timestamp}`;
}

export function generateProfileFileName(fileName: string, presetLabel: string, timestamp: number): string {
  const baseName = fileName.replace(/\.gif$/i, '');
  const deviceName = presetLabel.replace(/\s+/g, '-');
  const suffix = `_${deviceName}_${timestamp}`;
  const extension = '.streamDeckProfile';
  const maxBase = 180 - suffix.length - extension.length;
  const safeName = baseName.substring(0, maxBase);
  return `${safeName}${suffix}${extension}`;
}
