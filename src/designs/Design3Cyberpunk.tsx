import { useState } from 'react';
import { useGifSplitter } from '../shared/useGifSplitter';
import { PRESETS } from '../shared/presets';
import './Design3Cyberpunk.css';

function Design3Cyberpunk() {
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

  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const progressPercent = (() => {
    if (!progress) return 0;
    switch (progress.phase) {
      case 'loading': return 10;
      case 'palette': return 30;
      case 'splitting': return 30 + (progress.current / progress.total) * 65;
      case 'done': return 100;
      default: return 0;
    }
  })();

  const faqItems = [
    {
      q: 'QUERY::TOOL_PURPOSE',
      a: 'This is a browser-based tool that splits animated GIF files into a grid of smaller animated tiles, designed to be used as animated backgrounds on Elgato Stream Deck devices. All processing happens locally in your browser -- no files are uploaded to any server.',
    },
    {
      q: 'QUERY::SUPPORTED_DEVICES',
      a: 'We currently support the Stream Deck MK.2 (5x3), Stream Deck XL (8x4), Stream Deck Mini (3x2), Stream Deck + (4x2), and Stream Deck Neo (4x2). Each preset automatically adjusts the crop dimensions and tile sizes to match the device.',
    },
    {
      q: 'QUERY::SETUP_PROCEDURE',
      a: 'After downloading the zip, extract the folder and assign each numbered tile to the corresponding button position in the Elgato Stream Deck software. The tiles are numbered left-to-right, top-to-bottom to match the button layout.',
    },
    {
      q: 'QUERY::SYNC_ISSUE',
      a: 'Animated buttons falling out of sync on the Stream Deck is a common issue. To fix it, click the "Profile" dropdown in the Stream Deck software, switch to the Default Profile, then switch back to your profile. This forces all animations to restart at the same time.',
    },
    {
      q: 'QUERY::ANIMATION_QUALITY',
      a: 'The output quality depends heavily on your input GIF. Files with long animation cycles or large file sizes may not display well on the Stream Deck hardware. Try using a shorter or smaller GIF if results look off.',
    },
    {
      q: 'QUERY::LCD_TOUCHSCREEN',
      a: 'Unfortunately, the LCD touchscreen strip (found on devices like the Stream Deck +) does not support animated GIFs. Only the physical button positions can display animated backgrounds.',
    },
    {
      q: 'QUERY::DATA_PRIVACY',
      a: 'Negative. All processing is done entirely in your browser using ffmpeg.wasm. Your files never leave your device. The ffmpeg library is loaded once from a CDN and cached by your browser.',
    },
    {
      q: 'QUERY::FIRST_LOAD_DELAY',
      a: 'The first time you use the tool, it downloads the ffmpeg.wasm library (~31 MB). This is cached by your browser, so subsequent sessions will initialize much faster.',
    },
    {
      q: 'QUERY::OUTPUT_QUALITY',
      a: 'We use a high-quality two-pass encoding process with optimal palette generation and Floyd-Steinberg dithering to preserve as much quality as possible. The crop preview lets you review the result before splitting.',
    },
  ];

  return (
    <div className="cyber-app">
      {/* Scan line overlay */}
      <div className="cyber-scanline" />

      {/* Status bar */}
      <header className="cyber-status-bar">
        <div className="cyber-status-bar-inner">
          <div className="cyber-status-left">
            <span className="cyber-status-dot cyber-status-dot--online" />
            <span className="cyber-status-label">SYSTEM ONLINE</span>
            <span className="cyber-status-divider">|</span>
            <span className="cyber-status-metric">CPU: 47%</span>
            <span className="cyber-status-metric">MEM: 2.4GB</span>
            <span className="cyber-status-metric">NET: STABLE</span>
          </div>
          <div className="cyber-status-right">
            <span className="cyber-status-metric">FFMPEG.WASM v0.12</span>
            <span className="cyber-status-divider">|</span>
            <span className="cyber-status-metric">LOCAL PROCESSING</span>
            <span className="cyber-status-dot cyber-status-dot--pulse" />
          </div>
        </div>
      </header>

      <main className="cyber-main">
        {/* Hero */}
        <section className="cyber-hero">
          <div className="cyber-corner cyber-corner--tl" />
          <div className="cyber-corner cyber-corner--tr" />
          <div className="cyber-corner cyber-corner--bl" />
          <div className="cyber-corner cyber-corner--br" />
          <h1 className="cyber-hero-title">
            <span className="cyber-hero-bracket">[</span>
            STREAM DECK
            <span className="cyber-hero-accent"> GIF SPLITTER</span>
            <span className="cyber-hero-bracket">]</span>
          </h1>
          <p className="cyber-hero-sub">
            <span className="cyber-cursor">_</span> Drop a GIF file to split it into a grid of animated tiles,
            perfectly sized for your Stream Deck background.
          </p>
          <div className="cyber-hero-readouts">
            <span className="cyber-readout">PROTOCOL: WASM</span>
            <span className="cyber-readout">MODE: BROWSER-LOCAL</span>
            <span className="cyber-readout">ENC: FFv4</span>
          </div>
        </section>

        {/* Drop Zone */}
        <section className="cyber-section">
          <div className="cyber-section-header">
            <span className="cyber-section-marker" />
            <h2 className="cyber-section-title">DATA UPLOAD TERMINAL</h2>
            <div className="cyber-section-line" />
          </div>
          <div className="cyber-dropzone-wrapper">
            <div
              className={`cyber-dropzone${isDragOver ? ' cyber-dropzone--active' : ''}${file ? ' cyber-dropzone--has-file' : ''}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => !file && fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/gif"
                className="cyber-file-input"
                onChange={handleInputChange}
              />

              {/* Hex border decorations */}
              <div className="cyber-hex-border cyber-hex-border--top" />
              <div className="cyber-hex-border cyber-hex-border--bottom" />

              {file && preview ? (
                <div className="cyber-file-preview">
                  <div className="cyber-file-thumb">
                    <img key={cropSyncKey} src={preview} alt={file.name} />
                    <div className="cyber-file-hud-overlay">
                      <span className="cyber-hud-corner cyber-hud-corner--tl" />
                      <span className="cyber-hud-corner cyber-hud-corner--tr" />
                      <span className="cyber-hud-corner cyber-hud-corner--bl" />
                      <span className="cyber-hud-corner cyber-hud-corner--br" />
                    </div>
                  </div>
                  <div className="cyber-file-info">
                    <span className="cyber-file-label">FILE LOADED</span>
                    <span className="cyber-file-name">{file.name}</span>
                    <span className="cyber-file-size">SIZE: {formatSize(file.size)}</span>
                    {originalSize && (
                      <span className="cyber-file-dims">
                        DIM: {originalSize.w}x{originalSize.h}px
                      </span>
                    )}
                  </div>
                  <button
                    className="cyber-btn cyber-btn--danger"
                    onClick={(e) => {
                      e.stopPropagation();
                      clearFile();
                    }}
                  >
                    [PURGE FILE]
                  </button>
                </div>
              ) : (
                <div className="cyber-dropzone-empty">
                  <div className="cyber-upload-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
                    </svg>
                  </div>
                  <p className="cyber-dropzone-text">
                    <span className="cyber-cursor">{'>'}</span> DRAG & DROP .GIF FILE HERE
                  </p>
                  <p className="cyber-dropzone-subtext">
                    or <span className="cyber-link">BROWSE LOCAL STORAGE</span>
                  </p>
                  <span className="cyber-dropzone-hint">ACCEPTED FORMAT: image/gif</span>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Device & Crop Preview */}
        {file && (
          <section className="cyber-section">
            <div className="cyber-section-header">
              <span className="cyber-section-marker" />
              <h2 className="cyber-section-title">DEVICE CONFIGURATION</h2>
              <div className="cyber-section-line" />
            </div>

            <div className="cyber-config-panel">
              <div className="cyber-config-row">
                <div className="cyber-config-field">
                  <label className="cyber-label">TARGET DEVICE</label>
                  <div className="cyber-select-wrapper">
                    <select
                      className="cyber-select"
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
                </div>

                <div className="cyber-config-readout">
                  <div className="cyber-readout-row">
                    <span className="cyber-readout-key">CANVAS:</span>
                    <span className="cyber-readout-val">{targetWidth}px x {targetHeight}px{cutoffMode && ` (${preset.gap}px gap)`}</span>
                  </div>
                  <div className="cyber-readout-row">
                    <span className="cyber-readout-key">GRID:</span>
                    <span className="cyber-readout-val">{preset.cols} x {preset.rows} = {preset.cols * preset.rows} tiles</span>
                  </div>
                  <div className="cyber-readout-row">
                    <span className="cyber-readout-key">TILE SIZE:</span>
                    <span className="cyber-readout-val">{preset.tileWidth}px x {preset.tileHeight}px</span>
                  </div>
                </div>
              </div>

              <div className="cyber-cutoff-toggle">
                <input
                  type="checkbox"
                  id="cyber-cutoff-mode"
                  checked={cutoffMode}
                  onChange={(e) => handleCutoffToggle(e.target.checked)}
                  disabled={isCropping || isSplitting}
                  className="cyber-checkbox"
                />
                <label htmlFor="cyber-cutoff-mode" className="cyber-cutoff-label">
                  <span className="cyber-checkbox-visual" />
                  CUTOFF MODE
                </label>
                <span className="cyber-cutoff-desc">
                  // Space between buttons will be cutoff from image
                </span>
              </div>
            </div>

            {/* Crop Preview */}
            <div className="cyber-section-header cyber-section-header--sub">
              <span className="cyber-section-marker" />
              <h2 className="cyber-section-title">CROP ANALYSIS</h2>
              <div className="cyber-section-line" />
            </div>

            <p className="cyber-description">
              {'>'} Source image{originalSize ? ` (${originalSize.w}px x ${originalSize.h}px)` : ''} will be center-cropped to {targetWidth}px x {targetHeight}px. Verify output before executing split.
            </p>

            <div className="cyber-crop-compare">
              <div className="cyber-crop-card">
                <div className="cyber-crop-card-header">
                  <span className="cyber-crop-label">ORIGINAL</span>
                  <span className="cyber-crop-tag">INPUT</span>
                </div>
                {preview && (
                  <div className="cyber-crop-img-wrap">
                    <img key={`orig-${cropSyncKey}`} src={preview} alt="Original" />
                    <div className="cyber-img-hud">
                      <span className="cyber-hud-corner cyber-hud-corner--tl" />
                      <span className="cyber-hud-corner cyber-hud-corner--tr" />
                      <span className="cyber-hud-corner cyber-hud-corner--bl" />
                      <span className="cyber-hud-corner cyber-hud-corner--br" />
                    </div>
                  </div>
                )}
              </div>

              <div className="cyber-crop-arrow">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" width="28" height="28">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                </svg>
              </div>

              <div className="cyber-crop-card">
                <div className="cyber-crop-card-header">
                  <span className="cyber-crop-label">{targetWidth} x {targetHeight}</span>
                  <span className="cyber-crop-tag">OUTPUT</span>
                </div>
                {isCropping ? (
                  <div className="cyber-crop-loading">
                    <span className="cyber-loading-text">
                      {loading ? '> LOADING FFMPEG...' : '> PROCESSING CROP...'}
                    </span>
                    <span className="cyber-cursor cyber-cursor--blink">_</span>
                  </div>
                ) : croppedPreview ? (
                  <div className="cyber-crop-img-wrap">
                    <img key={`crop-${cropSyncKey}`} src={croppedPreview} alt="Cropped" />
                    <div className="cyber-img-hud">
                      <span className="cyber-hud-corner cyber-hud-corner--tl" />
                      <span className="cyber-hud-corner cyber-hud-corner--tr" />
                      <span className="cyber-hud-corner cyber-hud-corner--bl" />
                      <span className="cyber-hud-corner cyber-hud-corner--br" />
                    </div>
                  </div>
                ) : error ? (
                  <div className="cyber-crop-loading cyber-crop-error">
                    <span className="cyber-error-text">ERROR: {error}</span>
                  </div>
                ) : null}
              </div>
            </div>

            {/* Split Button */}
            {croppedPreview && (
              <div className="cyber-split-area">
                <button
                  className="cyber-btn cyber-btn--primary cyber-btn--large"
                  onClick={handleSplit}
                  disabled={isSplitting}
                >
                  {isSplitting ? (
                    <span className="cyber-btn-splitting">
                      <span className="cyber-btn-label">{progressLabel}</span>
                    </span>
                  ) : (
                    '[EXECUTE SPLIT]'
                  )}
                </button>

                {isSplitting && (
                  <div className="cyber-progress-bar">
                    <div className="cyber-progress-track">
                      {Array.from({ length: 20 }).map((_, i) => (
                        <div
                          key={i}
                          className={`cyber-progress-segment${i < Math.round(progressPercent / 5) ? ' cyber-progress-segment--filled' : ''}`}
                        />
                      ))}
                    </div>
                    <span className="cyber-progress-percent">{Math.round(progressPercent)}%</span>
                  </div>
                )}

                {error && !isCropping && (
                  <button
                    className="cyber-btn cyber-btn--warning"
                    onClick={handleSplit}
                    disabled={isSplitting}
                  >
                    ERROR: {error} -- [RETRY]
                  </button>
                )}
              </div>
            )}
          </section>
        )}

        {/* Results */}
        {file && croppedPreview && results.length > 0 && (
          <section className="cyber-section">
            <div className="cyber-section-header">
              <span className="cyber-section-marker" />
              <h2 className="cyber-section-title">OUTPUT MATRIX</h2>
              <div className="cyber-section-line" />
            </div>

            <div className="cyber-results-info">
              <span className="cyber-device-badge">{preset.label}</span>
              <span className="cyber-tile-count">{results.length} TILES GENERATED</span>
            </div>

            <div className="cyber-results-actions">
              <button
                className="cyber-btn cyber-btn--cyan"
                onClick={downloadZip}
                disabled={zipping}
              >
                {zipping ? '> COMPRESSING...' : `[DOWNLOAD .ZIP] (${results.length} tiles)`}
              </button>
              <button
                className="cyber-btn cyber-btn--magenta"
                onClick={downloadProfile}
                disabled={zippingProfile}
              >
                {zippingProfile ? '> GENERATING...' : '[DOWNLOAD .streamDeckProfile]'}
              </button>
            </div>

            {!tilesReady && (
              <p className="cyber-status-text">
                <span className="cyber-cursor cyber-cursor--blink">_</span> Loading tile previews...
              </p>
            )}

            <div className={`cyber-device-mockup${tilesReady ? ' cyber-device-mockup--revealed' : ''}`}>
              {/* HUD overlay brackets */}
              <div className="cyber-mockup-hud">
                <span className="cyber-hud-corner cyber-hud-corner--tl" />
                <span className="cyber-hud-corner cyber-hud-corner--tr" />
                <span className="cyber-hud-corner cyber-hud-corner--bl" />
                <span className="cyber-hud-corner cyber-hud-corner--br" />
                <span className="cyber-hud-label cyber-hud-label--top">DEVICE PREVIEW</span>
                <span className="cyber-hud-label cyber-hud-label--bottom">{preset.label.toUpperCase()}</span>
              </div>

              <div
                className="cyber-device-frame"
                style={{
                  maxWidth:
                    preset.cols * previewTileSize +
                    (preset.cols - 1) * scaledGap +
                    48,
                }}
              >
                <div
                  className="cyber-device-screen"
                  style={{
                    gridTemplateColumns: `repeat(${preset.cols}, 1fr)`,
                    gap: `${scaledGap}px`,
                  }}
                >
                  {results.map((r) => (
                    <div key={`${r.row}-${r.col}`} className="cyber-device-button">
                      <img
                        key={tileSyncKey}
                        src={r.url}
                        alt={r.filename}
                        onLoad={handleTileLoad}
                      />
                      <span className="cyber-tile-label">
                        {r.row},{r.col}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* FAQ */}
        <section className="cyber-section">
          <div className="cyber-section-header">
            <span className="cyber-section-marker" />
            <h2 className="cyber-section-title">SYSTEM DATABASE</h2>
            <div className="cyber-section-line" />
          </div>

          <div className="cyber-faq-list">
            {faqItems.map((item, i) => (
              <div
                key={i}
                className={`cyber-faq-item${openFaq === i ? ' cyber-faq-item--open' : ''}`}
              >
                <button
                  className="cyber-faq-trigger"
                  onClick={() => toggleFaq(i)}
                >
                  <span className="cyber-faq-index">[{String(i).padStart(2, '0')}]</span>
                  <span className="cyber-faq-query">{item.q}</span>
                  <span className="cyber-faq-toggle">{openFaq === i ? '[-]' : '[+]'}</span>
                </button>
                {openFaq === i && (
                  <div className="cyber-faq-answer">
                    <span className="cyber-faq-prompt">{'>'} </span>
                    {item.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="cyber-footer">
        <div className="cyber-footer-inner">
          <div className="cyber-footer-line" />
          <p className="cyber-footer-text">
            <span className="cyber-footer-bracket">[</span>
            SYSTEM DESIGNED BY Sascha Majewsky
            <span className="cyber-footer-bracket">]</span>
            <span className="cyber-footer-sep">//</span>
            <a
              href="https://github.com/SaschaWebDev/animated-stream-deck-background-gif-converter"
              target="_blank"
              rel="noopener noreferrer"
              className="cyber-footer-link"
            >
              GITHUB REPOSITORY
            </a>
          </p>
          <div className="cyber-footer-readouts">
            <span className="cyber-readout">v2.0</span>
            <span className="cyber-readout">ALL PROCESSING LOCAL</span>
            <span className="cyber-readout">NO DATA TRANSMITTED</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Design3Cyberpunk;
