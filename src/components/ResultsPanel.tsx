import type { ResultsPanelProps } from '../types';

export function ResultsPanel({
  file,
  croppedPreview,
  isSplitting,
  results,
  tilesReady,
  tileSyncKey,
  preset,
  previewTileSize,
  scaledGap,
  zipping,
  zippingProfile,
  resultsRef,
  onTileLoad,
  onDownloadZip,
  onDownloadProfile,
}: ResultsPanelProps) {
  return (
    <div ref={resultsRef}>
      {file && croppedPreview && (isSplitting || results.length > 0) && (
        <section className='hw-screen-panel hw-results-panel'>
          <div className='hw-panel-header'>
            <div className='hw-led hw-led-green' />
            <h2 className='hw-panel-title'>OUTPUT</h2>
          </div>

          {results.length > 0 && (
            <div className='hw-results-bar'>
              <span className='hw-device-badge'>{preset.label}</span>
              <div className='hw-results-buttons'>
                <button
                  className='hw-download-button'
                  onClick={onDownloadZip}
                  disabled={zipping}
                >
                  {zipping
                    ? 'Creating zip...'
                    : `Download .zip (${results.length} tiles)`}
                </button>
                <button
                  className='hw-download-button hw-download-profile'
                  onClick={onDownloadProfile}
                  disabled={zippingProfile}
                >
                  {zippingProfile
                    ? 'Creating profile...'
                    : 'Download .streamDeckProfile'}
                </button>
              </div>
            </div>
          )}

          {!isSplitting && results.length > 0 && !tilesReady && (
            <p className='hw-loading-tiles'>Loading tile previews...</p>
          )}

          <div
            className={`hw-mockup-area${tilesReady ? ' hw-revealed' : ''}`}
          >
            {results.length > 0 && (
              <>
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
                      src='/stream-deck-gif-splitter-logo.png'
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
                      <div
                        key={`${r.row}-${r.col}`}
                        className='hw-tile-button'
                      >
                        <img
                          key={tileSyncKey}
                          src={r.url}
                          alt={r.filename}
                          onLoad={onTileLoad}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
