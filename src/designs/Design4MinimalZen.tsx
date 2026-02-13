import { useGifSplitter } from '../shared/useGifSplitter';
import { PRESETS } from '../shared/presets';
import './Design4MinimalZen.css';

function Design4MinimalZen() {
  const {
    file, preview, croppedPreview, isCropping, isDragOver,
    presetIndex, preset, results, tilesReady, error,
    zipping, zippingProfile, originalSize, cutoffMode,
    cropSyncKey, tileSyncKey, fileInputRef,
    loading, progress: _progress, isSplitting, progressLabel,
    targetWidth, targetHeight, previewTileSize, scaledGap, gap: _gap,
    handleFile: _handleFile, handlePresetChange, handleCutoffToggle,
    clearFile, handleDragOver, handleDragLeave, handleDrop,
    handleInputChange, handleSplit, handleTileLoad,
    downloadZip, downloadProfile, formatSize,
  } = useGifSplitter();

  return (
    <div className="zen">
      {/* Ink Wash Background */}
      <div className="zen-ink-wash" aria-hidden="true">
        <div className="zen-ink-wash-circle" />
        <div className="zen-ink-wash-circle" />
        <div className="zen-ink-wash-circle" />
      </div>

      <div className="zen-main">
        {/* Header */}
        <header className="zen-header">
          <span className="zen-header-brand">Stream Deck GIF Splitter</span>
          <span className="zen-header-tag">Stream Deck</span>
        </header>

        {/* Enso Circle */}
        <div className="zen-enso" aria-hidden="true">
          <div className="zen-enso-circle" />
        </div>

        {/* Hero */}
        <section className="zen-hero">
          <h1>
            Split animated GIFs for<br />
            your <em>Stream Deck</em>
          </h1>
          <p>
            Drop a GIF file below to split it into a grid of animated tiles,
            perfectly sized for your Stream Deck background.
          </p>
        </section>

        {/* Drop Zone */}
        <div className="zen-dropzone-wrapper">
          <div
            className={`zen-dropzone${isDragOver ? ' drag-over' : ''}${file ? ' has-file' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => !file && fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/gif"
              className="zen-file-input"
              onChange={handleInputChange}
            />

            {file && preview ? (
              <div className="zen-file-preview">
                <img key={cropSyncKey} src={preview} alt={file.name} />
                <div className="zen-file-info">
                  <p>{file.name}</p>
                  <span>{formatSize(file.size)}</span>
                </div>
                <button
                  className="zen-file-remove"
                  onClick={(e) => {
                    e.stopPropagation();
                    clearFile();
                  }}
                >
                  Remove
                </button>
              </div>
            ) : (
              <>
                <div className="zen-dropzone-icon zen-float">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5"
                    />
                  </svg>
                </div>
                <div className="zen-dropzone-text">
                  <p>
                    Drag & drop your GIF here, or{' '}
                    <span className="zen-dropzone-browse">browse</span>
                  </p>
                  <span className="zen-dropzone-hint">Only .gif files are accepted</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Device & Crop Preview */}
        {file && (
          <section className="zen-crop-section">
            {/* Device Bar */}
            <div className="zen-device-bar">
              <h2 className="zen-section-title">Device</h2>
              <div className="zen-device-controls">
                <div className="zen-select-wrapper">
                  <select
                    className="zen-select"
                    value={presetIndex}
                    onChange={(e) => handlePresetChange(parseInt(e.target.value))}
                    disabled={isCropping || isSplitting}
                  >
                    {PRESETS.map((p, i) => (
                      <option key={i} value={i}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="zen-device-details">
                  <span>
                    {targetWidth}px &times; {targetHeight}px canvas
                    {cutoffMode && ` (${preset.gap}px gap)`}
                  </span>
                  <span>
                    {preset.cols} &times; {preset.rows} grid &mdash;{' '}
                    {preset.cols * preset.rows} tiles at {preset.tileWidth}px
                    &times; {preset.tileHeight}px
                  </span>
                </div>
              </div>

              <div className="zen-cutoff">
                <input
                  type="checkbox"
                  id="zen-cutoff-mode"
                  checked={cutoffMode}
                  onChange={(e) => handleCutoffToggle(e.target.checked)}
                  disabled={isCropping || isSplitting}
                />
                <label htmlFor="zen-cutoff-mode">Cutoff Mode</label>
                <span className="zen-cutoff-desc">
                  Space between buttons will be cutoff from image.
                </span>
              </div>
            </div>

            <hr className="zen-divider" />

            {/* Crop Preview */}
            <h2 className="zen-section-title">Crop Preview</h2>
            <p className="zen-section-subtitle">
              Your GIF
              {originalSize
                ? ` (${originalSize.w}px \u00d7 ${originalSize.h}px)`
                : ''}{' '}
              will be auto-cropped to {targetWidth}px &times; {targetHeight}px
              (center crop). Review the result before splitting.
            </p>

            <div className="zen-crop-compare">
              <div className="zen-crop-card">
                <span className="zen-crop-label">Original</span>
                {preview && (
                  <img
                    key={`orig-${cropSyncKey}`}
                    src={preview}
                    alt="Original"
                  />
                )}
              </div>

              <div className="zen-crop-arrow" aria-hidden="true">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1}
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

              <div className="zen-crop-card">
                <span className="zen-crop-label">
                  {targetWidth} &times; {targetHeight}
                </span>
                {isCropping ? (
                  <div className="zen-crop-loading">
                    {loading ? 'Loading ffmpeg...' : 'Cropping...'}
                  </div>
                ) : croppedPreview ? (
                  <img
                    key={`crop-${cropSyncKey}`}
                    src={croppedPreview}
                    alt="Cropped"
                  />
                ) : error ? (
                  <div className="zen-crop-loading zen-crop-error">{error}</div>
                ) : null}
              </div>
            </div>

            {/* Split Button */}
            {croppedPreview && (
              <div className="zen-split-wrapper">
                <button
                  className="zen-btn-primary"
                  onClick={handleSplit}
                  disabled={isSplitting}
                >
                  {isSplitting ? progressLabel : 'Split GIF'}
                </button>
                {error && !isCropping && (
                  <button
                    className="zen-btn-retry"
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

        {/* Decorative vertical line */}
        {file && croppedPreview && results.length > 0 && (
          <div className="zen-vline" aria-hidden="true" />
        )}

        {/* Results */}
        {file && croppedPreview && results.length > 0 && (
          <section className="zen-results">
            <div className="zen-results-header">
              <h2 className="zen-section-title">Result</h2>
              <div className="zen-results-actions">
                <span className="zen-device-pill">{preset.label}</span>
                <button
                  className="zen-btn-ghost"
                  onClick={downloadZip}
                  disabled={zipping}
                >
                  {zipping
                    ? 'Creating zip...'
                    : `Download .zip (${results.length} tiles)`}
                </button>
                <button
                  className="zen-btn-ghost zen-btn-ghost--accent"
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
              <p className="zen-status">Loading tile previews...</p>
            )}

            <div className={`zen-mockup${tilesReady ? ' revealed' : ''}`}>
              <div className="zen-mockup-cable">
                <div>
                  <div className="zen-mockup-cable-plug" />
                  <div className="zen-mockup-cable-line" />
                </div>
              </div>
              <div
                className="zen-mockup-frame"
                style={{
                  maxWidth:
                    preset.cols * previewTileSize +
                    (preset.cols - 1) * scaledGap +
                    48,
                }}
              >
                <img
                  className="zen-mockup-logo"
                  src="/logo-stream-deck-gif-splitter.png"
                  alt="Stream Deck GIF Splitter"
                />
                <div
                  className="zen-mockup-screen"
                  style={{
                    gridTemplateColumns: `repeat(${preset.cols}, 1fr)`,
                    gap: `${scaledGap}px`,
                  }}
                >
                  {results.map((r) => (
                    <div key={`${r.row}-${r.col}`} className="zen-mockup-button">
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

        {/* Mon Decorative Pattern */}
        <div className="zen-mon" aria-hidden="true">
          <div className="zen-mon-pattern" />
        </div>

        {/* FAQ */}
        <section className="zen-faq">
          <h2 className="zen-section-title">Frequently Asked Questions</h2>
          <div className="zen-faq-list">
            <details className="zen-faq-item">
              <summary>What is this tool?</summary>
              <p>
                This is a browser-based tool that splits animated GIF files into
                a grid of smaller animated tiles, designed to be used as
                animated backgrounds on Elgato Stream Deck devices. All
                processing happens locally in your browser — no files are
                uploaded to any server.
              </p>
            </details>
            <details className="zen-faq-item">
              <summary>Which Stream Deck models are supported?</summary>
              <p>
                We currently support the Stream Deck MK.2 (5x3), Stream Deck XL
                (8x4), Stream Deck Mini (3x2), Stream Deck + (4x2), and Stream
                Deck Neo (4x2). Each preset automatically adjusts the crop
                dimensions and tile sizes to match the device.
              </p>
            </details>
            <details className="zen-faq-item">
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
            <details className="zen-faq-item">
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
            <details className="zen-faq-item">
              <summary>Why is the animation laggy or looks bad?</summary>
              <p>
                The output quality depends heavily on your input GIF. Files with
                long animation cycles or large file sizes may not display well
                on the Stream Deck hardware. This tool uses high-quality
                encoding to preserve as much detail as possible, but if the
                result still looks off, try using a shorter or smaller GIF.
              </p>
            </details>
            <details className="zen-faq-item">
              <summary>Can I use the LCD touchscreen area for GIFs?</summary>
              <p>
                Unfortunately, the LCD touchscreen strip (found on devices like
                the Stream Deck +) does not support animated GIFs. Only the
                physical button positions can display animated backgrounds.
              </p>
            </details>
            <details className="zen-faq-item">
              <summary>Is my GIF uploaded to a server?</summary>
              <p>
                No. All processing is done entirely in your browser using
                ffmpeg.wasm. Your files never leave your device. The ffmpeg
                library is loaded once from a CDN and cached by your browser.
              </p>
            </details>
            <details className="zen-faq-item">
              <summary>Why does the first GIF take longer to process?</summary>
              <p>
                The first time you use the tool, it downloads the ffmpeg.wasm
                library (~31 MB). This is cached by your browser, so subsequent
                visits will be much faster.
              </p>
            </details>
            <details className="zen-faq-item">
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
      </div>

      {/* Footer */}
      <footer className="zen-footer">
        <div className="zen-main">
          <p>
            Made by Sascha Majewsky &middot;{' '}
            <a
              href="https://github.com/SaschaWebDev/animated-stream-deck-background-gif-converter"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}

export default Design4MinimalZen;
