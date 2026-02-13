import { useGifSplitter } from '../shared/useGifSplitter';
import { PRESETS } from '../shared/presets';
import './Design1NeonArcade.css';

function Design1NeonArcade() {
  const {
    file, preview, croppedPreview, isCropping, isDragOver,
    presetIndex, preset, results, tilesReady, error,
    zipping, zippingProfile, originalSize, cutoffMode,
    cropSyncKey, tileSyncKey, fileInputRef,
    loading, progress, isSplitting, progressLabel,
    targetWidth, targetHeight, previewTileSize, scaledGap, gap: _gap,
    handleFile: _handleFile, handlePresetChange, handleCutoffToggle,
    clearFile, handleDragOver, handleDragLeave, handleDrop,
    handleInputChange, handleSplit, handleTileLoad,
    downloadZip, downloadProfile, formatSize,
  } = useGifSplitter();

  const progressPercent = (() => {
    if (!progress) return 0;
    switch (progress.phase) {
      case 'loading': return 5;
      case 'palette': return 15;
      case 'splitting': return 15 + ((progress.current ?? 0) / (progress.total ?? 1)) * 80;
      case 'done': return 100;
      default: return 0;
    }
  })();

  return (
    <div className="na-app">
      {/* Header */}
      <header className="na-header">
        <div className="na-header-content">
          <span className="na-logo">Stream Deck GIF Splitter</span>
          <span className="na-header-tag">Stream Deck</span>
        </div>
      </header>

      {/* High Score Banner */}
      <div className="na-highscore">
        <div className="na-highscore-banner">HIGH SCORE</div>
      </div>

      <main className="na-main">
        {/* Hero */}
        <section className="na-hero">
          <h1>
            Split animated GIFs for<br />
            your <span className="na-hero-gradient">Stream Deck</span>
          </h1>
          <p>
            Drop a GIF file below to split it into a grid of animated tiles,
            perfectly sized for your Stream Deck background.
          </p>
        </section>

        {/* Drop Zone */}
        <div className="na-dropzone-wrapper">
          <div
            className={`na-dropzone${isDragOver ? ' drag-over' : ''}${file ? ' has-file' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => !file && fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/gif"
              className="na-file-input"
              onChange={handleInputChange}
            />

            {file && preview ? (
              <div className="na-file-preview">
                <img key={cropSyncKey} src={preview} alt={file.name} />
                <div className="na-file-info">
                  <p>{file.name}</p>
                  <span>{formatSize(file.size)}</span>
                </div>
                <button
                  className="na-file-remove"
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
                <div className="na-dropzone-icon">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5"
                    />
                  </svg>
                </div>
                <div className="na-insert-coin">INSERT COIN</div>
                <div className="na-dropzone-text">
                  <p>
                    Drag & drop your GIF here, or{' '}
                    <span className="na-dropzone-browse">browse</span>
                  </p>
                  <span>Only .gif files are accepted</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Device & Crop Preview */}
        {file && (
          <section className="na-crop-section">
            <div className="na-device-bar">
              <h2>Device</h2>
              <div className="na-device-bar-content">
                <label className="na-config-field">
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
                <div className="na-config-details">
                  <span>
                    {targetWidth}px &times; {targetHeight}px canvas
                    {cutoffMode && ` (${preset.gap}px gap)`}
                  </span>
                  <span>
                    {preset.cols} &times; {preset.rows} grid &mdash;{' '}
                    {preset.cols * preset.rows} tiles at {preset.tileWidth}px
                    &times;{preset.tileHeight}px
                  </span>
                </div>
                <div className="na-cutoff-toggle">
                  <input
                    type="checkbox"
                    id="na-cutoff-mode"
                    checked={cutoffMode}
                    onChange={(e) => handleCutoffToggle(e.target.checked)}
                    disabled={isCropping || isSplitting}
                  />
                  <label htmlFor="na-cutoff-mode">Cutoff Mode</label>
                  <span className="na-cutoff-description">
                    Space between buttons will be cutoff from image.
                  </span>
                </div>
              </div>
            </div>

            <div className="na-crop-divider" />

            <h2>Crop Preview</h2>
            <p className="na-crop-description">
              Your GIF
              {originalSize
                ? ` (${originalSize.w}px \u00d7 ${originalSize.h}px)`
                : ''}{' '}
              will be auto-cropped to {targetWidth}px &times; {targetHeight}px
              (center crop). Review the result before splitting.
            </p>
            <div className="na-crop-compare">
              <div className="na-crop-card">
                <span className="na-crop-label">Original</span>
                {preview && (
                  <img
                    key={`orig-${cropSyncKey}`}
                    src={preview}
                    alt="Original"
                  />
                )}
              </div>
              <div className="na-crop-arrow">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  width="24"
                  height="24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
                  />
                </svg>
              </div>
              <div className="na-crop-card">
                <span className="na-crop-label">
                  {targetWidth} &times; {targetHeight}
                </span>
                {isCropping ? (
                  <div className="na-crop-loading">
                    {loading ? 'Loading ffmpeg...' : 'Cropping...'}
                  </div>
                ) : croppedPreview ? (
                  <img
                    key={`crop-${cropSyncKey}`}
                    src={croppedPreview}
                    alt="Cropped"
                  />
                ) : error ? (
                  <div className="na-crop-loading na-crop-error">{error}</div>
                ) : null}
              </div>
            </div>

            {croppedPreview && (
              <div className="na-split-button-wrapper">
                <button
                  className="na-split-button"
                  onClick={handleSplit}
                  disabled={isSplitting}
                >
                  {isSplitting ? progressLabel : 'Split GIF'}
                </button>
                {isSplitting && (
                  <div className="na-progress-bar-wrapper">
                    <div className="na-progress-bar">
                      <div
                        className="na-progress-bar-fill"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                    <div className="na-progress-label">{progressLabel}</div>
                  </div>
                )}
                {error && !isCropping && (
                  <button
                    className="na-retry-button"
                    onClick={handleSplit}
                    disabled={isSplitting}
                  >
                    {error} — Click to retry
                  </button>
                )}
              </div>
            )}
          </section>
        )}

        {/* Results */}
        {file && croppedPreview && results.length > 0 && (
          <section className="na-results-section">
            <div className="na-results-header">
              <h2>Result</h2>
              <div className="na-results-actions">
                <span className="na-device-pill">{preset.label}</span>
                <button
                  className="na-download-button"
                  onClick={downloadZip}
                  disabled={zipping}
                >
                  {zipping
                    ? 'Creating zip...'
                    : `Download .zip (${results.length} tiles)`}
                </button>
                <button
                  className="na-download-button na-download-profile-button"
                  onClick={downloadProfile}
                  disabled={zippingProfile}
                >
                  {zippingProfile
                    ? 'Creating profile...'
                    : 'Download .streamDeckProfile'}
                </button>
              </div>
            </div>
            {!tilesReady && (
              <p className="na-status-text">Loading tile previews...</p>
            )}
            <div className={`na-device-mockup${tilesReady ? ' revealed' : ''}`}>
              <div className="na-device-cable">
                <div className="na-device-cable-plug" />
              </div>
              <div
                className="na-device-frame"
                style={{
                  maxWidth:
                    preset.cols * previewTileSize +
                    (preset.cols - 1) * scaledGap +
                    48,
                }}
              >
                <img
                  className="na-device-logo"
                  src="/logo-stream-deck-gif-splitter.png"
                  alt="Stream Deck GIF Splitter"
                />
                <div
                  className="na-device-screen"
                  style={{
                    gridTemplateColumns: `repeat(${preset.cols}, 1fr)`,
                    gap: `${scaledGap}px`,
                  }}
                >
                  {results.map((r) => (
                    <div key={`${r.row}-${r.col}`} className="na-device-button">
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
          </section>
        )}

        {/* FAQ / Game Manual */}
        <section className="na-faq-section">
          <h2 className="na-faq-title">GAME MANUAL</h2>
          <p className="na-faq-subtitle">FREQUENTLY ASKED QUESTIONS</p>
          <div className="na-faq-list">
            <details className="na-faq-item">
              <summary>What is this tool?</summary>
              <p>
                This is a browser-based tool that splits animated GIF files into
                a grid of smaller animated tiles, designed to be used as
                animated backgrounds on Elgato Stream Deck devices. All
                processing happens locally in your browser — no files are
                uploaded to any server.
              </p>
            </details>
            <details className="na-faq-item">
              <summary>Which Stream Deck models are supported?</summary>
              <p>
                We currently support the Stream Deck MK.2 (5x3), Stream Deck XL
                (8x4), Stream Deck Mini (3x2), Stream Deck + (4x2), and Stream
                Deck Neo (4x2). Each preset automatically adjusts the crop
                dimensions and tile sizes to match the device.
              </p>
            </details>
            <details className="na-faq-item">
              <summary>How do I set up the tiles on my Stream Deck?</summary>
              <p>
                After downloading the zip, extract the folder and assign each
                numbered tile to the corresponding button position in the Elgato
                Stream Deck software. You can also drag and drop the gif tiles
                onto the Stream Deck button below to insert them quicker. The
                tiles are numbered left-to-right, top-to-bottom to match the
                button layout. Check out{' '}
                <a
                  href="https://youtu.be/uMJPHHkHC9k?si=nRqH2r-mB7Tkm97m&t=300"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  this video
                </a>{' '}
                for a quick tutorial.
              </p>
            </details>
            <details className="na-faq-item">
              <summary>
                Why is the animation on my Stream Deck out of sync?
              </summary>
              <p>
                Animated buttons falling out of sync on the Stream Deck is a
                common issue. To fix it, click the &quot;Profile&quot; dropdown in the
                Stream Deck software, switch to the Default Profile, then switch
                back to your profile. This forces all animations to restart at
                the same time.
              </p>
            </details>
            <details className="na-faq-item">
              <summary>Why is the animation laggy or looks bad?</summary>
              <p>
                The output quality depends heavily on your input GIF. Files with
                long animation cycles or large file sizes may not display well
                on the Stream Deck hardware. This tool uses high-quality
                encoding to preserve as much detail as possible, but if the
                result still looks off, try using a shorter or smaller GIF.
              </p>
            </details>
            <details className="na-faq-item">
              <summary>Can I use the LCD touchscreen area for GIFs?</summary>
              <p>
                Unfortunately, the LCD touchscreen strip (found on devices like
                the Stream Deck +) does not support animated GIFs. Only the
                physical button positions can display animated backgrounds.
              </p>
            </details>
            <details className="na-faq-item">
              <summary>Is my GIF uploaded to a server?</summary>
              <p>
                No. All processing is done entirely in your browser using
                ffmpeg.wasm. Your files never leave your device. The ffmpeg
                library is loaded once from a CDN and cached by your browser.
              </p>
            </details>
            <details className="na-faq-item">
              <summary>Why does the first GIF take longer to process?</summary>
              <p>
                The first time you use the tool, it downloads the ffmpeg.wasm
                library (~31 MB). This is cached by your browser, so subsequent
                visits will be much faster.
              </p>
            </details>
            <details className="na-faq-item">
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

      {/* Footer */}
      <footer className="na-footer">
        <p>
          Made with love by Sascha Majewsky &middot;{' '}
          <a
            href="https://github.com/SaschaWebDev/animated-stream-deck-background-gif-converter"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>
        </p>
      </footer>
    </div>
  );
}

export default Design1NeonArcade;
