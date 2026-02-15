import { useRef } from 'react';
import type { CropPreviewProps } from '../types';

export function CropPreview({
  preview,
  croppedPreview,
  isCropping,
  isSplitting,
  loading,
  error,
  syncedSrcs,
  cropSyncKey,
  targetWidth,
  targetHeight,
  originalSize,
  progressLabel,
  onSplit,
}: CropPreviewProps) {
  const origRef = useRef<HTMLImageElement>(null);
  const cropRef = useRef<HTMLImageElement>(null);

  return (
    <>
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
        (center crop).{' '}
        <span className='hw-crop-desc-br'>
          <br />
        </span>{' '}
        Review the result before splitting.
      </p>

      <div className='hw-crop-compare'>
        <div className='hw-crop-card'>
          <span className='hw-crop-label'>ORIGINAL</span>
          <div className='hw-crop-viewport'>
            {syncedSrcs ? (
              <img
                ref={origRef}
                key={`orig-${cropSyncKey}`}
                src={syncedSrcs.orig}
                alt='Original'
              />
            ) : preview ? (
              <div className='hw-crop-loading hw-crop-active'>
                {isCropping
                  ? loading
                    ? 'Loading ffmpeg'
                    : 'Cropping'
                  : 'Syncing'}
                <span className='hw-bounce-dots'>
                  <span className='hw-dot'>.</span>
                  <span className='hw-dot'>.</span>
                  <span className='hw-dot'>.</span>
                </span>
              </div>
            ) : null}
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
            {syncedSrcs ? (
              <img
                ref={cropRef}
                key={`crop-${cropSyncKey}`}
                src={syncedSrcs.crop}
                alt='Cropped'
              />
            ) : isCropping ? (
              <div className='hw-crop-loading hw-crop-active'>
                {loading ? 'Loading ffmpeg' : 'Cropping'}
                <span className='hw-bounce-dots'>
                  <span className='hw-dot'>.</span>
                  <span className='hw-dot'>.</span>
                  <span className='hw-dot'>.</span>
                </span>
              </div>
            ) : error ? (
              <div className='hw-crop-loading hw-crop-error'>
                {error}
              </div>
            ) : croppedPreview ? (
              <div className='hw-crop-loading hw-crop-active'>
                Syncing
                <span className='hw-bounce-dots'>
                  <span className='hw-dot'>.</span>
                  <span className='hw-dot'>.</span>
                  <span className='hw-dot'>.</span>
                </span>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {croppedPreview && (
        <div className='hw-split-actions'>
          <button
            className='hw-split-button'
            onClick={onSplit}
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
              onClick={onSplit}
              disabled={isSplitting}
            >
              {error} — Click to retry
            </button>
          )}
        </div>
      )}
    </>
  );
}
