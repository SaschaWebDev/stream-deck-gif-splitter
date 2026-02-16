import type { ResultsPanelProps } from '../types';

export function ResultsPanel({
  file,
  croppedPreview,
  isSplitting,
  results,
  tilesReady,
  tileSyncKey,
  preset,
  basePreset,
  customGridEnabled,
  gridOffsetCol,
  gridOffsetRow,
  previewTileSize,
  scaledGap,
  zipping,
  zippingProfile,
  resultsRef,
  onTileLoad,
  onDownloadZip,
  onDownloadProfile,
}: ResultsPanelProps) {
  // When custom grid is active and smaller, show the full device grid
  const showFullDevice = customGridEnabled && (preset.cols < basePreset.cols || preset.rows < basePreset.rows);
  const mockupCols = showFullDevice ? basePreset.cols : preset.cols;
  const mockupRows = showFullDevice ? basePreset.rows : preset.rows;

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
              <span className='hw-device-badge'>{basePreset.label}</span>
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
                      mockupCols * previewTileSize +
                      (mockupCols - 1) * scaledGap +
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
                      gridTemplateColumns: `repeat(${mockupCols}, 1fr)`,
                      gap: `${scaledGap}px`,
                    }}
                  >
                    {Array.from({ length: mockupRows }, (_, r) =>
                      Array.from({ length: mockupCols }, (_, c) => {
                        if (showFullDevice) {
                          const inCustomArea =
                            c >= gridOffsetCol && c < gridOffsetCol + preset.cols &&
                            r >= gridOffsetRow && r < gridOffsetRow + preset.rows;

                          if (inCustomArea) {
                            const tileCol = c - gridOffsetCol;
                            const tileRow = r - gridOffsetRow;
                            const tile = results.find(
                              (t) => t.col === tileCol && t.row === tileRow,
                            );
                            if (tile) {
                              return (
                                <div key={`${r}-${c}`} className='hw-tile-button'>
                                  <img
                                    key={tileSyncKey}
                                    src={tile.url}
                                    alt={tile.filename}
                                    onLoad={onTileLoad}
                                  />
                                </div>
                              );
                            }
                          }

                          return (
                            <div
                              key={`${r}-${c}`}
                              className='hw-tile-button hw-tile-blank'
                            />
                          );
                        }

                        // Normal mode: render tiles sequentially
                        const tile = results[r * mockupCols + c];
                        if (!tile) return <div key={`${r}-${c}`} className='hw-tile-button hw-tile-blank' />;
                        return (
                          <div key={`${r}-${c}`} className='hw-tile-button'>
                            <img
                              key={tileSyncKey}
                              src={tile.url}
                              alt={tile.filename}
                              onLoad={onTileLoad}
                            />
                          </div>
                        );
                      }),
                    )}
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
