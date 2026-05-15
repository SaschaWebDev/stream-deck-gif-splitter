import type { RefObject } from 'react';

interface ScreensaverPanelProps {
  screensaverResult: { blob: Blob; url: string; filename: string } | null;
  isSplitting: boolean;
  resultsRef: RefObject<HTMLDivElement | null>;
}

export function ScreensaverPanel({
  screensaverResult,
  isSplitting,
  resultsRef,
}: ScreensaverPanelProps) {
  if (!isSplitting && !screensaverResult) return null;

  const handleDownload = () => {
    if (!screensaverResult) return;
    const a = document.createElement('a');
    a.href = screensaverResult.url;
    a.download = screensaverResult.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div ref={resultsRef}>
      <section className='hw-screen-panel hw-results-panel'>
        <div className='hw-panel-header'>
          <div className='hw-led hw-led-green' />
          <h2 className='hw-panel-title'>OUTPUT</h2>
        </div>

        {screensaverResult && (
          <div className='hw-results-bar'>
            <div className='hw-results-buttons'>
              <button
                className='hw-download-button'
                onClick={handleDownload}
              >
                Download Image Wallpaper
              </button>
            </div>
          </div>
        )}

        {isSplitting ? (
          <div className='hw-loading-block hw-screensaver-loading'>
            <div className='hw-spinner' />
            <p>Generating padded image wallpaper...</p>
          </div>
        ) : screensaverResult ? (
          <>
            <div className='hw-screensaver-preview'>
              <img
                className='hw-screensaver-preview-img'
                src={screensaverResult.url}
                alt='Padded Image Wallpaper Preview'
              />
            </div>
            <p className='hw-sub-text hw-screensaver-note'>
              Set this file as your Stream Deck screensaver in the official Elgato software. The black bars ensure no parts of your image are lost to the physical bezels!
            </p>
          </>
        ) : null}
      </section>
    </div>
  );
}
