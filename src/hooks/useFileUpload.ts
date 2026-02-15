import { useState, useRef, useCallback } from 'react';

export function useFileUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [originalSize, setOriginalSize] = useState<{ w: number; h: number } | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const setFileWithPreview = useCallback(async (f: File) => {
    const objectUrl = URL.createObjectURL(f);
    const img = new Image();
    img.src = objectUrl;
    await new Promise<void>((resolve) => { img.onload = () => resolve(); });
    setOriginalSize({ w: img.naturalWidth, h: img.naturalHeight });
    setFile(f);
    setPreview(objectUrl);
  }, []);

  const clearFile = useCallback(() => {
    if (preview) URL.revokeObjectURL(preview);
    setFile(null);
    setPreview(null);
    setOriginalSize(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, [preview]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, onFile: (f: File) => void) => {
    e.preventDefault();
    setIsDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) onFile(dropped);
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>, onFile: (f: File) => void) => {
    const selected = e.target.files?.[0];
    if (selected) onFile(selected);
  }, []);

  return {
    file,
    preview,
    originalSize,
    isDragOver,
    fileInputRef,
    setFileWithPreview,
    clearFile,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleInputChange,
  };
}
