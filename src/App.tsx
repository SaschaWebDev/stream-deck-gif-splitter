import { useCallback } from 'react';
import { useFileUpload } from './hooks/useFileUpload';
import { useDeviceConfig } from './hooks/useDeviceConfig';
import { useGifProcessor } from './hooks/useGifProcessor';
import { useGifSync } from './hooks/useGifSync';
import { useAutoScroll } from './hooks/useAutoScroll';
import { useDownload } from './hooks/useDownload';
import { PRESETS } from './constants/presets';
import { formatSize } from './utils/format';
import { HeroSection } from './components/HeroSection';
import { FileDropZone } from './components/FileDropZone';
import { DeviceConfig } from './components/DeviceConfig';
import { CropPreview } from './components/CropPreview';
import { ResultsPanel } from './components/ResultsPanel';
import { UserManual } from './components/UserManual';
import './App.css';

function App() {
  const {
    file,
    preview,
    originalSize,
    isDragOver,
    fileInputRef,
    setFileWithPreview,
    clearFile: clearUpload,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleInputChange,
  } = useFileUpload();

  const {
    presetIndex,
    setPresetIndex,
    cutoffMode,
    setCutoffMode,
    preset,
    gap,
    targetWidth,
    targetHeight,
    previewTileSize,
    scaledGap,
  } = useDeviceConfig();

  const {
    croppedPreview,
    isCropping,
    results,
    tilesReady,
    error,
    cropSyncKey,
    tileSyncKey,
    loading,
    isSplitting,
    progressLabel,
    performCrop,
    performSplit,
    handleTileLoad,
    resetProcessor,
    clearResults,
    clearCroppedPreview,
  } = useGifProcessor();

  const syncedSrcs = useGifSync(preview, croppedPreview, isCropping, cropSyncKey);
  const resultsRef = useAutoScroll(isSplitting);
  const { zipping, zippingProfile, downloadZip, downloadProfile } = useDownload();

  // --- Coordination handlers ---

  const handleFileUpload = useCallback(async (f: File) => {
    if (f.type !== 'image/gif') return;
    await resetProcessor();
    await setFileWithPreview(f);
    await performCrop(f, targetWidth, targetHeight);
  }, [resetProcessor, setFileWithPreview, performCrop, targetWidth, targetHeight]);

  const handlePresetChange = useCallback(async (newIndex: number) => {
    setPresetIndex(newIndex);
    setCutoffMode(true);
    const p = PRESETS[newIndex];
    const tw = p.cols * p.tileWidth + (p.cols - 1) * p.gap;
    const th = p.rows * p.tileHeight + (p.rows - 1) * p.gap;

    clearResults();

    if (file) {
      await clearCroppedPreview();
      await performCrop(file, tw, th);
    }
  }, [file, setPresetIndex, setCutoffMode, clearResults, clearCroppedPreview, performCrop]);

  const handleCutoffToggle = useCallback(async (checked: boolean) => {
    setCutoffMode(checked);
    const tw = preset.cols * preset.tileWidth + (checked ? (preset.cols - 1) * preset.gap : 0);
    const th = preset.rows * preset.tileHeight + (checked ? (preset.rows - 1) * preset.gap : 0);

    clearResults();

    if (file) {
      await clearCroppedPreview();
      await performCrop(file, tw, th);
    }
  }, [file, setCutoffMode, preset, clearResults, clearCroppedPreview, performCrop]);

  const handleClearFile = useCallback(async () => {
    await resetProcessor();
    clearUpload();
  }, [resetProcessor, clearUpload]);

  const handleSplit = useCallback(async () => {
    if (!file) return;
    await performSplit(file, preset.cols, preset.rows, preset.tileWidth, preset.tileHeight, gap);
  }, [file, preset, gap, performSplit]);

  const handleDownloadZip = useCallback(() => {
    if (file) downloadZip(results, file, cutoffMode);
  }, [file, results, cutoffMode, downloadZip]);

  const handleDownloadProfile = useCallback(() => {
    if (file) downloadProfile(results, file, preset);
  }, [file, results, preset, downloadProfile]);

  return (
    <div className='hw-page'>
      <div className='hw-device-bezel'>
        <header className='hw-top-bezel'>
          <div className='hw-bezel-logo'>
            <div className='hw-led hw-led-green' />
            <span className='hw-brand'>Stream Deck</span>
            <span className='hw-brand-sub'>GIF Splitter</span>
          </div>
          <div className='hw-bezel-right'>
            <div className='hw-led hw-led-blue' />
            <span className='hw-status-text'>
              {isSplitting ? 'PROCESSING' : file ? 'READY' : 'STANDBY'}
            </span>
          </div>
        </header>

        <main className='hw-lcd-screen'>
          <HeroSection />

          <FileDropZone
            file={file}
            preview={preview}
            cropSyncKey={cropSyncKey}
            isDragOver={isDragOver}
            fileInputRef={fileInputRef}
            formatSize={formatSize}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, handleFileUpload)}
            onInputChange={(e) => handleInputChange(e, handleFileUpload)}
            onClear={handleClearFile}
          />

          {file && (
            <section className='hw-screen-panel hw-config-panel'>
              <DeviceConfig
                presetIndex={presetIndex}
                cutoffMode={cutoffMode}
                targetWidth={targetWidth}
                targetHeight={targetHeight}
                preset={preset}
                isCropping={isCropping}
                isSplitting={isSplitting}
                onPresetChange={handlePresetChange}
                onCutoffToggle={handleCutoffToggle}
              />

              <CropPreview
                preview={preview}
                croppedPreview={croppedPreview}
                isCropping={isCropping}
                isSplitting={isSplitting}
                loading={loading}
                error={error}
                syncedSrcs={syncedSrcs}
                cropSyncKey={cropSyncKey}
                targetWidth={targetWidth}
                targetHeight={targetHeight}
                originalSize={originalSize}
                progressLabel={progressLabel}
                onSplit={handleSplit}
              />
            </section>
          )}

          <ResultsPanel
            file={file}
            croppedPreview={croppedPreview}
            isSplitting={isSplitting}
            results={results}
            tilesReady={tilesReady}
            tileSyncKey={tileSyncKey}
            preset={preset}
            previewTileSize={previewTileSize}
            scaledGap={scaledGap}
            zipping={zipping}
            zippingProfile={zippingProfile}
            resultsRef={resultsRef}
            onTileLoad={handleTileLoad}
            onDownloadZip={handleDownloadZip}
            onDownloadProfile={handleDownloadProfile}
          />

          <UserManual />
        </main>

        <footer className='hw-bottom-bezel'>
          <div className='hw-usb-area'>
            <div className='hw-usb-port'>
              <div className='hw-usb-inner' />
            </div>
            <span className='hw-usb-label'>USB-C</span>
          </div>
          <div className='hw-footer-credits'>
            <p>
              Made with ❤️ by Sascha Majewsky &middot;{' '}
              <a
                href='https://github.com/SaschaWebDev/animated-stream-deck-background-gif-converter'
                target='_blank'
                rel='noopener noreferrer'
              >
                GitHub
              </a>
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default App;
