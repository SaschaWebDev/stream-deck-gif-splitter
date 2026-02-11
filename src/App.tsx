import { useState, useRef, useCallback } from 'react';
import JSZip from 'jszip';
import { useFFmpeg, type SplitResult } from './useFFmpeg';
import './App.css';

interface Preset {
  label: string;
  cols: number;
  rows: number;
  tileWidth: number;
  tileHeight: number;
}

const PRESETS: Preset[] = [
  {
    label: 'Stream Deck MK.2',
    cols: 5,
    rows: 3,
    tileWidth: 72,
    tileHeight: 72,
  },
  {
    label: 'Stream Deck XL',
    cols: 8,
    rows: 4,
    tileWidth: 144,
    tileHeight: 144,
  },
  {
    label: 'Stream Deck Mini',
    cols: 3,
    rows: 2,
    tileWidth: 72,
    tileHeight: 72,
  },
  { label: 'Stream Deck +', cols: 4, rows: 2, tileWidth: 72, tileHeight: 72 },
  { label: 'Stream Deck Neo', cols: 4, rows: 2, tileWidth: 72, tileHeight: 72 },
];

function App() {
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
  const [originalSize, setOriginalSize] = useState<{
    w: number;
    h: number;
  } | null>(null);
  const [cropSyncKey, setCropSyncKey] = useState(0);
  const [tileSyncKey, setTileSyncKey] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const tileLoadCount = useRef(0);

  const { loading, cropGif, splitGif, cleanup, progress, resetProgress } =
    useFFmpeg();

  const preset = PRESETS[presetIndex];
  const targetWidth = preset.cols * preset.tileWidth;
  const targetHeight = preset.rows * preset.tileHeight;
  const previewTileSize = Math.min(preset.tileWidth, 72);

  const performCrop = useCallback(
    async (f: File, tw: number, th: number) => {
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
    },
    [cropGif],
  );

  const handleFile = useCallback(
    async (f: File) => {
      if (f.type !== 'image/gif') return;

      if (croppedPreview) URL.revokeObjectURL(croppedPreview);
      results.forEach((r) => URL.revokeObjectURL(r.url));
      await cleanup();

      const objectUrl = URL.createObjectURL(f);
      const img = new Image();
      img.src = objectUrl;
      await new Promise<void>((resolve) => {
        img.onload = () => resolve();
      });
      setOriginalSize({ w: img.naturalWidth, h: img.naturalHeight });

      setFile(f);
      setPreview(objectUrl);
      setCroppedPreview(null);
      setResults([]);
      setTilesReady(false);
      setError(null);
      resetProgress();

      await performCrop(f, targetWidth, targetHeight);
    },
    [
      croppedPreview,
      results,
      cleanup,
      resetProgress,
      performCrop,
      targetWidth,
      targetHeight,
    ],
  );

  const handlePresetChange = useCallback(
    async (newIndex: number) => {
      setPresetIndex(newIndex);
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
    },
    [file, croppedPreview, results, cleanup, resetProgress, performCrop],
  );

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

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      const dropped = e.dataTransfer.files[0];
      if (dropped) handleFile(dropped);
    },
    [handleFile],
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selected = e.target.files?.[0];
      if (selected) handleFile(selected);
    },
    [handleFile],
  );

  const handleSplit = useCallback(async () => {
    if (!file || !croppedPreview) return;
    setError(null);
    results.forEach((r) => URL.revokeObjectURL(r.url));
    setResults([]);
    setTilesReady(false);
    tileLoadCount.current = 0;

    try {
      const splitResults = await splitGif(
        file.name,
        preset.cols,
        preset.rows,
        targetWidth,
        targetHeight,
      );
      setResults(splitResults);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to split GIF');
    }
  }, [
    file,
    croppedPreview,
    preset,
    splitGif,
    results,
    targetWidth,
    targetHeight,
  ]);

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
      const folderName = `${baseName}_${Date.now()}`;
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
  }, [results, file]);

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const isSplitting = progress !== null && progress.phase !== 'done';

  const progressLabel = (() => {
    if (!progress) return '';
    switch (progress.phase) {
      case 'loading':
        return 'Loading ffmpeg...';
      case 'palette':
        return 'Generating palette...';
      case 'splitting':
        return `Splitting tile ${progress.current} of ${progress.total}...`;
      case 'done':
        return 'Done!';
    }
  })();

  return (
    <div className='app'>
      <header className='header'>
        <div className='header-content'>
          <span className='logo'> Stream Deck GIF Splitter</span>
          <span className='header-tag'>Stream Deck</span>
        </div>
      </header>

      <main className='main'>
        <section className='hero'>
          <h1>
            Split animated GIFs for <br />
            your <span className='hero-gradient'>Stream Deck</span>
          </h1>
          <p>
            Drop a GIF file below to split it into a grid of animated tiles,
            perfectly sized for your Stream Deck background.
          </p>
        </section>

        {/* Drop Zone */}
        <div className='dropzone-wrapper'>
          <div
            className={`dropzone${isDragOver ? ' drag-over' : ''}${file ? ' has-file' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => !file && fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type='file'
              accept='image/gif'
              className='file-input'
              onChange={handleInputChange}
            />

            {file && preview ? (
              <div className='file-preview'>
                <img key={cropSyncKey} src={preview} alt={file.name} />
                <div className='file-info'>
                  <p>{file.name}</p>
                  <span>{formatSize(file.size)}</span>
                </div>
                <button
                  className='file-remove'
                  onClick={(e) => {
                    e.stopPropagation();
                    clearFile();
                  }}
                >
                  Remove file
                </button>
              </div>
            ) : (
              <>
                <div className='dropzone-icon'>
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    fill='none'
                    viewBox='0 0 24 24'
                    strokeWidth={1.5}
                    stroke='currentColor'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      d='M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5'
                    />
                  </svg>
                </div>
                <div className='dropzone-text'>
                  <p>
                    Drag & drop your GIF here, or{' '}
                    <span className='dropzone-browse'>browse</span>
                  </p>
                  <span>Only .gif files are accepted</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Device & Crop Preview */}
        {file && (
          <section className='crop-section'>
            <div className='device-bar'>
              <h2>Device</h2>
              <div className='device-bar-content'>
                <label className='config-field'>
                  <select
                    value={presetIndex}
                    onChange={(e) =>
                      handlePresetChange(parseInt(e.target.value))
                    }
                    disabled={isCropping || isSplitting}
                  >
                    {PRESETS.map((p, i) => (
                      <option key={i} value={i}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                </label>
                <div className='config-details'>
                  <span>
                    {targetWidth}px &times; {targetHeight}px canvas
                  </span>
                  <span>
                    {preset.cols} &times; {preset.rows} grid &mdash;{' '}
                    {preset.cols * preset.rows} tiles at {preset.tileWidth}px
                    &times;{preset.tileHeight}px
                  </span>
                </div>
              </div>
            </div>

            <div className='crop-divider' />

            <h2>Crop Preview</h2>
            <p className='crop-description'>
              Your GIF
              {originalSize
                ? ` (${originalSize.w}px \u00d7 ${originalSize.h}px)`
                : ''}{' '}
              will be auto-cropped to {targetWidth} &times; {targetHeight}px
              (center crop). Review the result before splitting.
            </p>
            <div className='crop-compare'>
              <div className='crop-card'>
                <span className='crop-label'>Original</span>
                {preview && (
                  <img
                    key={`orig-${cropSyncKey}`}
                    src={preview}
                    alt='Original'
                  />
                )}
              </div>
              <div className='crop-arrow'>
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  fill='none'
                  viewBox='0 0 24 24'
                  strokeWidth={1.5}
                  stroke='currentColor'
                  width='24'
                  height='24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    d='M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3'
                  />
                </svg>
              </div>
              <div className='crop-card'>
                <span className='crop-label'>
                  {targetWidth} &times; {targetHeight}
                </span>
                {isCropping ? (
                  <div className='crop-loading'>
                    {loading ? 'Loading ffmpeg...' : 'Cropping...'}
                  </div>
                ) : croppedPreview ? (
                  <img
                    key={`crop-${cropSyncKey}`}
                    src={croppedPreview}
                    alt='Cropped'
                  />
                ) : error ? (
                  <div className='crop-loading crop-error'>{error}</div>
                ) : null}
              </div>
            </div>
          </section>
        )}

        {/* Split & Results */}
        {file && croppedPreview && (
          <section className='results-section'>
            <button
              className='split-button'
              onClick={handleSplit}
              disabled={isSplitting}
            >
              {isSplitting ? progressLabel : 'Split GIF'}
            </button>

            {error && !isCropping && <p className='error-text'>{error}</p>}

            {results.length > 0 && (
              <>
                <div className='results-header'>
                  <h2>Result</h2>
                  <div className='results-actions'>
                    <span className='device-pill'>{preset.label}</span>
                    <button
                      className='download-all-button'
                      onClick={downloadZip}
                      disabled={zipping}
                    >
                      {zipping
                        ? 'Creating zip...'
                        : `Download .zip (${results.length} tiles)`}
                    </button>
                  </div>
                </div>
                {!tilesReady && (
                  <p className='status-text'>Loading tile previews...</p>
                )}
                <div
                  className={`device-mockup${tilesReady ? ' revealed' : ''}`}
                >
                  <div className='device-cable'>
                    <div className='device-cable-plug' />
                  </div>
                  <div
                    className='device-frame'
                    style={{
                      width:
                        preset.cols * previewTileSize +
                        (preset.cols - 1) * 16 +
                        48,
                    }}
                  >
                    <img
                      className='device-logo'
                      src='/logo-stream-deck-gif-splitter.png'
                      alt='Stream Deck GIF Splitter'
                    />
                    <div
                      className='device-screen'
                      style={{
                        gridTemplateColumns: `repeat(${preset.cols}, ${previewTileSize}px)`,
                      }}
                    >
                      {results.map((r) => (
                        <div
                          key={`${r.row}-${r.col}`}
                          className='device-button'
                        >
                          <img
                            key={tileSyncKey}
                            src={r.url}
                            alt={r.filename}
                            onLoad={handleTileLoad}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}
          </section>
        )}
        {/* FAQ */}
        <section className='faq-section'>
          <h2>Frequently Asked Questions</h2>
          <div className='faq-list'>
            <details className='faq-item'>
              <summary>What is this tool?</summary>
              <p>
                This is a browser-based tool that splits animated GIF files into
                a grid of smaller animated tiles, designed to be used as
                animated backgrounds on Elgato Stream Deck devices. All
                processing happens locally in your browser — no files are
                uploaded to any server.
              </p>
            </details>
            <details className='faq-item'>
              <summary>Which Stream Deck models are supported?</summary>
              <p>
                We currently support the Stream Deck MK.2 (5x3), Stream Deck XL
                (8x4), Stream Deck Mini (3x2), Stream Deck + (4x2), and Stream
                Deck Neo (4x2). Each preset automatically adjusts the crop
                dimensions and tile sizes to match the device.
              </p>
            </details>
            <details className='faq-item'>
              <summary>How do I set up the tiles on my Stream Deck?</summary>
              <p>
                After downloading the zip, extract the folder and assign each
                numbered tile to the corresponding button position in the Elgato
                Stream Deck software. You can also drag and drop the gif tiles
                onto the Stream Deck button below to insert them quicker. The
                tiles are numbered left-to-right, top-to-bottom to match the
                button layout. Check out {''}
                <a
                  href='https://youtu.be/uMJPHHkHC9k?si=nRqH2r-mB7Tkm97m&t=300'
                  target='_blank'
                  rel='noopener noreferrer'
                >
                  this video
                </a>
                {''} for a quick tutorial.
              </p>
            </details>
            <details className='faq-item'>
              <summary>
                Why is the animation on my Stream Deck out of sync?
              </summary>
              <p>
                Animated buttons falling out of sync on the Stream Deck is a
                common issue. To fix it, click the "Profile" dropdown in the
                Stream Deck software, switch to the Default Profile, then switch
                back to your profile. This forces all animations to restart at
                the same time.
              </p>
            </details>
            <details className='faq-item'>
              <summary>Why is the animation laggy or looks bad?</summary>
              <p>
                The output quality depends heavily on your input GIF. Files with
                long animation cycles or large file sizes may not display well
                on the Stream Deck hardware. This tool uses high-quality
                encoding to preserve as much detail as possible, but if the
                result still looks off, try using a shorter or smaller GIF.
              </p>
            </details>
            <details className='faq-item'>
              <summary>Can I use the LCD touchscreen area for GIFs?</summary>
              <p>
                Unfortunately, the LCD touchscreen strip (found on devices like
                the Stream Deck +) does not support animated GIFs. Only the
                physical button positions can display animated backgrounds.
              </p>
            </details>
            <details className='faq-item'>
              <summary>Is my GIF uploaded to a server?</summary>
              <p>
                No. All processing is done entirely in your browser using
                ffmpeg.wasm. Your files never leave your device. The ffmpeg
                library is loaded once from a CDN and cached by your browser.
              </p>
            </details>
            <details className='faq-item'>
              <summary>Why does the first GIF take longer to process?</summary>
              <p>
                The first time you use the tool, it downloads the ffmpeg.wasm
                library (~31 MB). This is cached by your browser, so subsequent
                visits will be much faster.
              </p>
            </details>
            <details className='faq-item'>
              <summary>What happens to my GIF quality?</summary>
              <p>
                We use a high-quality two-pass encoding process with optimal
                palette generation and Floyd-Steinberg dithering to preserve as
                much quality as possible. The crop preview lets you review the
                result before splitting.
              </p>
            </details>
          </div>
        </section>
      </main>

      <footer className='footer'>
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
      </footer>
    </div>
  );
}

export default App;
