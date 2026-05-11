interface ScreensaverPanelProps {
  screensaverResult: { blob: Blob; url: string; filename: string } | null;
  isSplitting: boolean;
  resultsRef: React.RefObject<HTMLElement | null>;
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
    <section className='hw-screen-panel hw-results-panel' ref={resultsRef}>
      <h2 className='hw-panel-title'>Screensaver Ready</h2>

      {isSplitting ? (
        <div className='hw-loading-block' style={{ margin: '40px 0' }}>
          <div className='hw-spinner' />
          <p>Generating padded screensaver...</p>
        </div>
      ) : screensaverResult ? (
        <>
          <div className='hw-screensaver-preview'>
            <img 
              src={screensaverResult.url} 
              alt='Padded Screensaver Preview' 
              style={{
                display: 'block',
                maxWidth: '100%',
                maxHeight: '400px',
                margin: '0 auto',
                border: '1px solid var(--border-light)',
                backgroundColor: '#000',
              }}
            />
          </div>
          <div className='hw-actions-bar'>
            <button className='hw-download-button' onClick={handleDownload}>
              <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='currentColor' width='20' height='20'>
                <path fillRule='evenodd' d='M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm-.53 14.03a.75.75 0 0 0 1.06 0l3-3a.75.75 0 1 0-1.06-1.06l-1.72 1.72V8.25a.75.75 0 0 0-1.5 0v5.69l-1.72-1.72a.75.75 0 0 0-1.06 1.06l3 3Z' clipRule='evenodd' />
              </svg>
              Download Screensaver Image
            </button>
          </div>
          <p className='hw-sub-text' style={{ textAlign: 'center', marginTop: '16px' }}>
            Set this file as your Stream Deck screensaver in the official Elgato software. The black bars ensure no parts of your image are lost to the physical bezels!
          </p>
        </>
      ) : null}
    </section>
  );
}