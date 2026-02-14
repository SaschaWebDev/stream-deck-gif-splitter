import { useGifSplitter } from '../shared/useGifSplitter';
import { PRESETS } from '../shared/presets';
import './Design5Hardware.css';

function Design5Hardware() {
  const {
    file,
    preview,
    croppedPreview,
    isCropping,
    isDragOver,
    presetIndex,
    preset,
    results,
    tilesReady,
    error,
    zipping,
    zippingProfile,
    originalSize,
    cutoffMode,
    cropSyncKey,
    tileSyncKey,
    fileInputRef,
    loading,
    progress: _progress,
    isSplitting,
    progressLabel,
    targetWidth,
    targetHeight,
    previewTileSize,
    scaledGap,
    gap: _gap,
    handleFile: _handleFile,
    handlePresetChange,
    handleCutoffToggle,
    clearFile,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleInputChange,
    handleSplit,
    handleTileLoad,
    downloadZip,
    downloadProfile,
    formatSize,
  } = useGifSplitter();

  return (
    <div className='hw-page'>
      {/* Device bezel / outer frame */}
      <div className='hw-device-bezel'>
        {/* Top bezel bar with branding */}
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

        {/* Main LCD screen area */}
        <main className='hw-lcd-screen'>
          {/* Hero section */}
          <section className='hw-screen-panel hw-hero-panel'>
            <img
              className='hw-hero-logo'
              src='/steam-deck-gif-splitter-logo-big.png'
              alt='Stream Deck GIF Splitter'
            />
            <h1 className='hw-title'>
              Split animated GIFs for
              <br /> your <span className='hw-title-accent'>Stream Deck</span>
            </h1>
            <p className='hw-subtitle'>
              Drop a GIF file below to split it into a grid of animated tiles,
              perfectly sized for your Stream Deck background.
            </p>
          </section>

          {/* Drop zone as a large pressable button */}
          <section className='hw-drop-section'>
            <div
              className={`hw-drop-button${isDragOver ? ' hw-drop-hover' : ''}${file ? ' hw-drop-has-file' : ''}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => !file && fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type='file'
                accept='image/gif'
                className='hw-file-input'
                onChange={handleInputChange}
              />

              {file && preview ? (
                <div className='hw-file-preview'>
                  <img
                    key={cropSyncKey}
                    src={preview}
                    alt={file.name}
                    className='hw-file-thumb'
                  />
                  <div className='hw-file-meta'>
                    <span className='hw-file-name'>{file.name}</span>
                    <span className='hw-file-size'>
                      {formatSize(file.size)}
                    </span>
                  </div>
                  <button
                    className='hw-file-remove'
                    onClick={(e) => {
                      e.stopPropagation();
                      clearFile();
                    }}
                  >
                    EJECT
                  </button>
                </div>
              ) : (
                <div className='hw-drop-content'>
                  <div className='hw-drop-icon'>
                    <svg
                      xmlns='http://www.w3.org/2000/svg'
                      fill='none'
                      viewBox='0 0 24 24'
                      strokeWidth={1.5}
                      stroke='currentColor'
                      width='48'
                      height='48'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        d='M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5'
                      />
                    </svg>
                  </div>
                  <p className='hw-drop-label'>
                    Drag & drop your GIF here, or{' '}
                    <span className='hw-drop-browse'>browse</span>
                  </p>
                  <span className='hw-drop-hint'>
                    Only .gif files are accepted
                  </span>
                </div>
              )}
            </div>
          </section>

          {/* Device & Crop Preview */}
          {file && (
            <section className='hw-screen-panel hw-config-panel'>
              <div className='hw-panel-header'>
                <div className='hw-led hw-led-green' />
                <h2 className='hw-panel-title'>DEVICE CONFIG</h2>
              </div>

              <div className='hw-config-row'>
                <div className='hw-config-field'>
                  <label className='hw-label'>Model</label>
                  <select
                    className='hw-select'
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
                </div>

                <div className='hw-config-specs'>
                  <span className='hw-spec'>
                    {targetWidth}px &times; {targetHeight}px canvas
                    {cutoffMode && ` (${preset.gap}px gap)`}
                  </span>
                  <span className='hw-spec'>
                    {preset.cols} &times; {preset.rows} grid &mdash;{' '}
                    {preset.cols * preset.rows} tiles at {preset.tileWidth}px
                    &times; {preset.tileHeight}px
                  </span>
                </div>

                <div className='hw-cutoff-toggle'>
                  <label className='hw-toggle-wrapper'>
                    <input
                      type='checkbox'
                      id='hw-cutoff-mode'
                      checked={cutoffMode}
                      onChange={(e) => handleCutoffToggle(e.target.checked)}
                      disabled={isCropping || isSplitting}
                    />
                    <span className='hw-toggle-track'>
                      <span className='hw-toggle-thumb' />
                    </span>
                    <span className='hw-toggle-label'>Cutoff Mode</span>
                  </label>
                  <span className='hw-toggle-desc'>
                    Space between buttons will be cutoff from image.
                  </span>
                </div>
              </div>

              <div className='hw-divider' />

              <div className='hw-panel-header'>
                <div className='hw-led hw-led-blue' />
                <h2 className='hw-panel-title'>CROP PREVIEW</h2>
              </div>
              <p className='hw-crop-desc'>
                Your GIF
                {originalSize
                  ? ` (${originalSize.w}px \u00d7 ${originalSize.h}px)`
                  : ''}{' '}
                will be auto-cropped to {targetWidth}px &times; {targetHeight}px
                (center crop). <span className='hw-crop-desc-br'><br /></span> Review the result before splitting.
              </p>

              <div className='hw-crop-compare'>
                <div className='hw-crop-card'>
                  <span className='hw-crop-label'>ORIGINAL</span>
                  <div className='hw-crop-viewport'>
                    {preview && (
                      <img
                        key={`orig-${cropSyncKey}`}
                        src={preview}
                        alt='Original'
                      />
                    )}
                  </div>
                </div>

                <div className='hw-crop-arrow'>
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    fill='none'
                    viewBox='0 0 24 24'
                    strokeWidth={2}
                    stroke='currentColor'
                    width='28'
                    height='28'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      d='M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3'
                    />
                  </svg>
                </div>

                <div className='hw-crop-card'>
                  <span className='hw-crop-label'>
                    {targetWidth} &times; {targetHeight}
                  </span>
                  <div className='hw-crop-viewport'>
                    {isCropping ? (
                      <div className='hw-crop-loading'>
                        {loading ? 'Loading ffmpeg...' : 'Cropping...'}
                      </div>
                    ) : croppedPreview ? (
                      <img
                        key={`crop-${cropSyncKey}`}
                        src={croppedPreview}
                        alt='Cropped'
                      />
                    ) : error ? (
                      <div className='hw-crop-loading hw-crop-error'>
                        {error}
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>

              {croppedPreview && (
                <div className='hw-split-actions'>
                  <button
                    className='hw-split-button'
                    onClick={handleSplit}
                    disabled={isSplitting}
                  >
                    <div
                      className='hw-led hw-led-inline'
                      style={{
                        background: isSplitting ? '#3b82f6' : '#22c55e',
                      }}
                    />
                    {isSplitting ? progressLabel : 'SPLIT GIF'}
                  </button>
                  {error && !isCropping && (
                    <button
                      className='hw-retry-button'
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
            <section className='hw-screen-panel hw-results-panel'>
              <div className='hw-panel-header'>
                <div className='hw-led hw-led-green' />
                <h2 className='hw-panel-title'>OUTPUT</h2>
              </div>

              <div className='hw-results-bar'>
                <span className='hw-device-badge'>{preset.label}</span>
                <div className='hw-results-buttons'>
                  <button
                    className='hw-download-button'
                    onClick={downloadZip}
                    disabled={zipping}
                  >
                    {zipping
                      ? 'Creating zip...'
                      : `Download .zip (${results.length} tiles)`}
                  </button>
                  <button
                    className='hw-download-button hw-download-profile'
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
                <p className='hw-loading-tiles'>Loading tile previews...</p>
              )}

              <div
                className={`hw-mockup-area${tilesReady ? ' hw-revealed' : ''}`}
              >
                <div className='hw-device-cable'>
                  <div className='hw-device-cable-plug' />
                </div>
                <div
                  className='hw-mockup-frame'
                  style={{
                    maxWidth:
                      preset.cols * previewTileSize +
                      (preset.cols - 1) * scaledGap +
                      48,
                  }}
                >
                  <div className='hw-mockup-logo-bar'>
                    <img
                      className='hw-mockup-logo'
                      src='/logo-stream-deck-gif-splitter.png'
                      alt='Stream Deck GIF Splitter'
                    />
                  </div>
                  <div
                    className='hw-mockup-grid'
                    style={{
                      gridTemplateColumns: `repeat(${preset.cols}, 1fr)`,
                      gap: `${scaledGap}px`,
                    }}
                  >
                    {results.map((r) => (
                      <div key={`${r.row}-${r.col}`} className='hw-tile-button'>
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

          {/* FAQ - styled as manual pages */}
          <section className='hw-screen-panel hw-faq-panel'>
            <div className='hw-panel-header'>
              <div className='hw-led hw-led-blue' />
              <h2 className='hw-panel-title'>USER MANUAL</h2>
            </div>

            <div className='hw-faq-list'>
              <details className='hw-faq-item'>
                <summary>What is this tool?</summary>
                <p>
                  This is a browser-based tool that splits animated GIF files
                  into a grid of smaller animated tiles, designed to be used as
                  animated backgrounds on Elgato Stream Deck devices. All
                  processing happens locally in your browser -- no files are
                  uploaded to any server.
                </p>
              </details>
              <details className='hw-faq-item'>
                <summary>Which Stream Deck models are supported?</summary>
                <p>
                  We currently support the Stream Deck MK.2 (5x3), Stream Deck
                  XL (8x4), Stream Deck Mini (3x2), Stream Deck + (4x2), and
                  Stream Deck Neo (4x2). Each preset automatically adjusts the
                  crop dimensions and tile sizes to match the device.
                </p>
              </details>
              <details className='hw-faq-item'>
                <summary>How do I set up the tiles on my Stream Deck?</summary>
                <p>
                  After downloading the zip, extract the folder and assign each
                  numbered tile to the corresponding button position in the
                  Elgato Stream Deck software. You can also drag and drop the
                  gif tiles onto the Stream Deck button below to insert them
                  quicker. The tiles are numbered left-to-right, top-to-bottom
                  to match the button layout. Check out{' '}
                  <a
                    href='https://youtu.be/uMJPHHkHC9k?si=nRqH2r-mB7Tkm97m&t=300'
                    target='_blank'
                    rel='noopener noreferrer'
                  >
                    this video
                  </a>{' '}
                  for a quick tutorial.
                </p>
              </details>
              <details className='hw-faq-item'>
                <summary>How do I set up a .streamDeckProfile?</summary>
                <p>
                  Simply download the .streamDeckProfile file and open it. The
                  Stream Deck software will automatically detect it and prompt
                  you to install it. This creates a separate profile alongside
                  your existing ones, so you can use it as a starting point for
                  a new setup or just preview how the animated background looks
                  on your device.
                </p>
              </details>
              <details className='hw-faq-item'>
                <summary>
                  Why is the animation on my Stream Deck out of sync?
                </summary>
                <p>
                  Animated buttons falling out of sync on the Stream Deck is a
                  common issue. To fix it, click the "Profile" dropdown in the
                  Stream Deck software, switch to the Default Profile, then
                  switch back to your profile. This forces all animations to
                  restart at the same time.
                </p>
              </details>
              <details className='hw-faq-item'>
                <summary>Why is the animation laggy or looks bad?</summary>
                <p>
                  The output quality depends heavily on your input GIF. Files
                  with long animation cycles or large file sizes may not display
                  well on the Stream Deck hardware. This tool uses high-quality
                  encoding to preserve as much detail as possible, but if the
                  result still looks off, try using a shorter or smaller GIF.
                </p>
              </details>
              <details className='hw-faq-item'>
                <summary>Can I use the LCD touchscreen area for GIFs?</summary>
                <p>
                  Unfortunately, the LCD touchscreen strip (found on devices
                  like the Stream Deck +) does not support animated GIFs. Only
                  the physical button positions can display animated
                  backgrounds.
                </p>
              </details>
              <details className='hw-faq-item'>
                <summary>Is my GIF uploaded to a server?</summary>
                <p>
                  No. All processing is done entirely in your browser using
                  ffmpeg.wasm. Your files never leave your device. The ffmpeg
                  library is loaded once from a CDN and cached by your browser.
                </p>
              </details>
              <details className='hw-faq-item'>
                <summary>
                  Why does the first GIF take longer to process?
                </summary>
                <p>
                  The first time you use the tool, it downloads the ffmpeg.wasm
                  library (~31 MB). This is cached by your browser, so
                  subsequent visits will be much faster.
                </p>
              </details>
              <details className='hw-faq-item'>
                <summary>What happens to my GIF quality?</summary>
                <p>
                  We use a high-quality two-pass encoding process with optimal
                  palette generation and Floyd-Steinberg dithering to preserve
                  as much quality as possible. The crop preview lets you review
                  the result before splitting.
                </p>
              </details>
            </div>
          </section>
        </main>

        {/* Bottom bezel with USB-C port */}
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

export default Design5Hardware;
