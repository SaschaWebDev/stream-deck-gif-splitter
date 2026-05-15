import { useRef, useState, useCallback } from 'react';
import type { CropPreviewProps } from '../types';
import { computeScaledDimensions } from '../utils/crop';

export function CropPreview({
  appMode,
  preset,
  file,
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
  customCropEnabled,
  customLoopEnabled,
  gifDuration,
  trimRange,
  filmstripFrames,
  screensaverFrameTime,
  screensaverFramePreview,
  onSplit,
  onCropOffsetChange,
  onTrimChange,
  onScreensaverFrameChange,
}: CropPreviewProps) {
  const origRef = useRef<HTMLImageElement>(null);
  const cropRef = useRef<HTMLImageElement>(null);

  // Crop editor state
  const editorContainerRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  const [rectPos, setRectPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [editorDims, setEditorDims] = useState<{
    displayW: number;
    displayH: number;
    rectW: number;
    rectH: number;
    scaledW: number;
    scaledH: number;
  } | null>(null);
  const dragStartRef = useRef<{ startX: number; startY: number; startRectX: number; startRectY: number } | null>(null);

  // Compute editor dimensions when original image loads or when props change
  const handleEditorImgLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    const origW = img.naturalWidth;
    const origH = img.naturalHeight;

    const { scaledW, scaledH } = computeScaledDimensions(origW, origH, targetWidth, targetHeight);

    // Measure actual available width from the viewport container
    const viewport = editorContainerRef.current?.parentElement;
    const maxDisplayW = viewport
      ? viewport.clientWidth - parseFloat(getComputedStyle(viewport).paddingLeft) - parseFloat(getComputedStyle(viewport).paddingRight)
      : 300;
    const displayScale = Math.min(1, maxDisplayW / scaledW);
    const displayW = scaledW * displayScale;
    const displayH = scaledH * displayScale;
    const rectW = targetWidth * displayScale;
    const rectH = targetHeight * displayScale;

    setEditorDims({ displayW, displayH, rectW, rectH, scaledW, scaledH });
    // Center the rect initially
    setRectPos({ x: (displayW - rectW) / 2, y: (displayH - rectH) / 2 });
  }, [targetWidth, targetHeight]);

  // Clamp rect position within bounds
  const clampPos = useCallback((x: number, y: number) => {
    if (!editorDims) return { x: 0, y: 0 };
    return {
      x: Math.max(0, Math.min(x, editorDims.displayW - editorDims.rectW)),
      y: Math.max(0, Math.min(y, editorDims.displayH - editorDims.rectH)),
    };
  }, [editorDims]);

  // Mouse/touch handlers
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    setDragging(true);
    dragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startRectX: rectPos.x,
      startRectY: rectPos.y,
    };
  }, [rectPos]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragging || !dragStartRef.current) return;
    const dx = e.clientX - dragStartRef.current.startX;
    const dy = e.clientY - dragStartRef.current.startY;
    setRectPos(clampPos(dragStartRef.current.startRectX + dx, dragStartRef.current.startRectY + dy));
  }, [dragging, clampPos]);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    if (!dragging || !editorDims) return;
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    setDragging(false);
    dragStartRef.current = null;

    // Convert display coordinates to FFmpeg source coordinates
    const displayScale = editorDims.displayW / editorDims.scaledW;
    const sourceX = rectPos.x / displayScale;
    const sourceY = rectPos.y / displayScale;
    onCropOffsetChange(sourceX, sourceY);
  }, [dragging, editorDims, rectPos, onCropOffsetChange]);

  // Timeline scrubber state
  const trackRef = useRef<HTMLDivElement>(null);
  const [trimDragging, setTrimDragging] = useState<'left' | 'right' | null>(null);
  const [localTrim, setLocalTrim] = useState<{ start: number; end: number } | null>(null);
  const trimDragRef = useRef<{ handle: 'left' | 'right'; startClientX: number; startValue: number } | null>(null);
  const filmstripContainerRef = useRef<HTMLDivElement>(null);

  const showTimeline = customLoopEnabled && gifDuration != null && gifDuration > 0;
  const activeTrim = localTrim ?? trimRange;
  const trimStart = activeTrim?.start ?? 0;
  const trimEnd = activeTrim?.end ?? (gifDuration ?? 0);
  const MIN_GAP = 0.1;

  const formatTime = (seconds: number) => `${seconds.toFixed(1)}s`;

  const handleTrimPointerDown = useCallback((e: React.PointerEvent, handle: 'left' | 'right') => {
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    setTrimDragging(handle);
    trimDragRef.current = {
      handle,
      startClientX: e.clientX,
      startValue: handle === 'left' ? trimStart : trimEnd,
    };
  }, [trimStart, trimEnd]);

  const handleTrimPointerMove = useCallback((e: React.PointerEvent) => {
    if (!trimDragging || !trimDragRef.current || !trackRef.current || !gifDuration) return;
    const trackRect = trackRef.current.getBoundingClientRect();
    const trackWidth = trackRect.width;
    const dx = e.clientX - trimDragRef.current.startClientX;
    const dSeconds = (dx / trackWidth) * gifDuration;
    const newValue = trimDragRef.current.startValue + dSeconds;

    if (trimDragRef.current.handle === 'left') {
      const clamped = Math.max(0, Math.min(newValue, trimEnd - MIN_GAP));
      setLocalTrim({ start: clamped, end: trimEnd });
    } else {
      const clamped = Math.min(gifDuration, Math.max(newValue, trimStart + MIN_GAP));
      setLocalTrim({ start: trimStart, end: clamped });
    }
  }, [trimDragging, gifDuration, trimStart, trimEnd]);

  const handleTrimPointerUp = useCallback((e: React.PointerEvent) => {
    if (!trimDragging || !localTrim) return;
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    setTrimDragging(null);
    trimDragRef.current = null;
    onTrimChange(localTrim.start, localTrim.end);
    setLocalTrim(null);
  }, [trimDragging, localTrim, onTrimChange]);

  // Single-handle frame picker for Image Wallpaper mode (GIF input)
  const frameTrackRef = useRef<HTMLDivElement>(null);
  const [frameDragging, setFrameDragging] = useState(false);
  const [localFrameTime, setLocalFrameTime] = useState<number | null>(null);
  const frameDragRef = useRef<{ startClientX: number; startValue: number } | null>(null);

  const showFramePicker = appMode === 'screensaver' && file?.type === 'image/gif' && gifDuration != null && gifDuration > 0;
  const activeFrameTime = localFrameTime ?? screensaverFrameTime;

  const handleFramePointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    setFrameDragging(true);
    frameDragRef.current = {
      startClientX: e.clientX,
      startValue: activeFrameTime,
    };
  }, [activeFrameTime]);

  const handleFramePointerMove = useCallback((e: React.PointerEvent) => {
    if (!frameDragging || !frameDragRef.current || !frameTrackRef.current || !gifDuration) return;
    const trackRect = frameTrackRef.current.getBoundingClientRect();
    const trackWidth = trackRect.width;
    const dx = e.clientX - frameDragRef.current.startClientX;
    const dSeconds = (dx / trackWidth) * gifDuration;
    const newValue = frameDragRef.current.startValue + dSeconds;
    const clamped = Math.max(0, Math.min(gifDuration, newValue));
    setLocalFrameTime(clamped);
  }, [frameDragging, gifDuration]);

  const handleFramePointerUp = useCallback((e: React.PointerEvent) => {
    if (!frameDragging || localFrameTime == null) return;
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    setFrameDragging(false);
    frameDragRef.current = null;
    onScreensaverFrameChange(localFrameTime);
    setLocalFrameTime(null);
  }, [frameDragging, localFrameTime, onScreensaverFrameChange]);

  const showCropEditor = customCropEnabled && preview;

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
        will be {customCropEnabled ? 'custom' : 'auto'}-cropped to {targetWidth}px &times; {targetHeight}px
        {customCropEnabled ? ' (drag to position).' : ' (center crop).'}{' '}
        <span className='hw-crop-desc-br'>
          <br />
        </span>{' '}
        Review the result before splitting.
      </p>

      <div className='hw-crop-compare'>
        <div className='hw-crop-card'>
          <span className='hw-crop-label'>ORIGINAL</span>
          <div className='hw-crop-viewport'>
            {showCropEditor ? (
              <div
                ref={editorContainerRef}
                className='hw-crop-editor'
                style={editorDims ? { width: editorDims.displayW, height: editorDims.displayH } : undefined}
              >
                <img
                  className='hw-crop-editor-img'
                  src={preview}
                  alt='Original'
                  draggable={false}
                  onLoad={handleEditorImgLoad}
                  style={editorDims ? { width: editorDims.displayW, height: editorDims.displayH } : undefined}
                />
                {editorDims && (
                  <>
                    <div
                      className='hw-crop-editor-mask'
                      style={{
                        inset: 0,
                        boxShadow: `
                          inset ${rectPos.x}px 0 0 0 rgba(0,0,0,0.6),
                          inset -${editorDims.displayW - rectPos.x - editorDims.rectW}px 0 0 0 rgba(0,0,0,0.6),
                          inset 0 ${rectPos.y}px 0 0 rgba(0,0,0,0.6),
                          inset 0 -${editorDims.displayH - rectPos.y - editorDims.rectH}px 0 0 rgba(0,0,0,0.6)
                        `,
                      }}
                    />
                    <div
                      className='hw-crop-editor-rect'
                      style={{
                        left: rectPos.x,
                        top: rectPos.y,
                        width: editorDims.rectW,
                        height: editorDims.rectH,
                        cursor: dragging ? 'grabbing' : 'grab',
                      }}
                      onPointerDown={handlePointerDown}
                      onPointerMove={handlePointerMove}
                      onPointerUp={handlePointerUp}
                    >
                      {appMode === 'screensaver' && (
                        <div className='hw-bezel-overlay'>
                          {Array.from({ length: preset.cols - 1 }).map((_, i) => (
                            <div
                              key={`col-${i}`}
                              className='hw-bezel-grid-line hw-bezel-grid-line--vertical hw-bezel-grid-line--white'
                              style={{ left: `${((i + 1) / preset.cols) * 100}%` }}
                            />
                          ))}
                          {Array.from({ length: preset.rows - 1 }).map((_, i) => (
                            <div
                              key={`row-${i}`}
                              className='hw-bezel-grid-line hw-bezel-grid-line--horizontal hw-bezel-grid-line--white'
                              style={{ top: `${((i + 1) / preset.rows) * 100}%` }}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            ) : syncedSrcs ? (
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
          {showTimeline && (
            <div className={`hw-timeline${isCropping ? ' hw-timeline-disabled' : ''}`}>
              <div className='hw-timeline-filmstrip' ref={filmstripContainerRef}>
                {filmstripFrames.map((src, i) => (
                  <img
                    key={i}
                    className='hw-timeline-filmstrip-tile'
                    src={src}
                    alt=''
                    draggable={false}
                  />
                ))}
                {trimStart > 0.01 && gifDuration && (
                  <div
                    className='hw-timeline-filmstrip-trim'
                    style={{ left: 0, width: `${(trimStart / gifDuration) * 100}%` }}
                  />
                )}
                {gifDuration && trimEnd < gifDuration - 0.01 && (
                  <div
                    className='hw-timeline-filmstrip-trim'
                    style={{ right: 0, width: `${((gifDuration - trimEnd) / gifDuration) * 100}%` }}
                  />
                )}
              </div>
              <div
                className='hw-timeline-track'
                ref={trackRef}
                onPointerMove={!isCropping ? handleTrimPointerMove : undefined}
                onPointerUp={!isCropping ? handleTrimPointerUp : undefined}
              >
                <div
                  className='hw-timeline-selected'
                  style={{
                    left: `${(trimStart / gifDuration) * 100}%`,
                    width: `${((trimEnd - trimStart) / gifDuration) * 100}%`,
                  }}
                />
                <div
                  className={`hw-timeline-handle hw-timeline-handle-left${trimDragging === 'left' ? ' hw-timeline-handle-active' : ''}`}
                  style={{ left: `${(trimStart / gifDuration) * 100}%` }}
                  onPointerDown={!isCropping ? (e) => handleTrimPointerDown(e, 'left') : undefined}
                />
                <div
                  className={`hw-timeline-handle hw-timeline-handle-right${trimDragging === 'right' ? ' hw-timeline-handle-active' : ''}`}
                  style={{ left: `${(trimEnd / gifDuration) * 100}%` }}
                  onPointerDown={!isCropping ? (e) => handleTrimPointerDown(e, 'right') : undefined}
                />
              </div>
              <div className='hw-timeline-labels'>
                <span className='hw-timeline-label-group'>
                  {trimStart > 0.05 && (
                    <span className='hw-timeline-label-original'>{formatTime(0)}</span>
                  )}
                  <span className={trimStart > 0.05 ? 'hw-timeline-label-active' : ''}>
                    {formatTime(trimStart)}
                  </span>
                </span>
                <span className='hw-timeline-label-group'>
                  <span className={trimEnd < gifDuration - 0.05 ? 'hw-timeline-label-active' : ''}>
                    {formatTime(trimEnd)}
                  </span>
                  {trimEnd < gifDuration - 0.05 && (
                    <span className='hw-timeline-label-original'>{formatTime(gifDuration)}</span>
                  )}
                </span>
              </div>
            </div>
          )}
          {showFramePicker && (
            <div className={`hw-timeline${isCropping ? ' hw-timeline-disabled' : ''}`}>
              <div className='hw-timeline-filmstrip'>
                {filmstripFrames.map((src, i) => (
                  <img
                    key={i}
                    className='hw-timeline-filmstrip-tile'
                    src={src}
                    alt=''
                    draggable={false}
                  />
                ))}
              </div>
              <div
                className='hw-timeline-track'
                ref={frameTrackRef}
                onPointerMove={!isCropping ? handleFramePointerMove : undefined}
                onPointerUp={!isCropping ? handleFramePointerUp : undefined}
              >
                <div
                  className={`hw-timeline-handle hw-timeline-handle-left${frameDragging ? ' hw-timeline-handle-active' : ''}`}
                  style={{ left: `${(activeFrameTime / gifDuration!) * 100}%` }}
                  onPointerDown={!isCropping ? handleFramePointerDown : undefined}
                />
              </div>
              <div className='hw-timeline-labels'>
                <span className='hw-timeline-label-group'>
                  <span className='hw-timeline-label-active'>
                    Frame at {formatTime(activeFrameTime)} / {formatTime(gifDuration!)}
                  </span>
                </span>
              </div>
            </div>
          )}
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
            <span className='hw-crop-label-dims'>{targetWidth}px &times; {targetHeight}px</span>
            {customCropEnabled && <span className='hw-crop-label-tag'>(custom crop)</span>}
            {customLoopEnabled && gifDuration != null && gifDuration > 0 && (
              <span className='hw-crop-label-tag'>({(trimEnd - trimStart).toFixed(1)}s loop)</span>
            )}
          </span>
          <div className='hw-crop-viewport'>
            {syncedSrcs ? (
              <div className='hw-cropped-wrapper'>
                {(() => {
                  const showStaticFrame = appMode === 'screensaver' && file?.type === 'image/gif' && screensaverFramePreview;
                  return (
                    <img
                      ref={cropRef}
                      key={showStaticFrame ? `frame-${screensaverFramePreview}` : `crop-${cropSyncKey}`}
                      src={showStaticFrame ? screensaverFramePreview : syncedSrcs.crop}
                      alt={showStaticFrame ? 'Selected static frame' : 'Cropped'}
                    />
                  );
                })()}
                {appMode === 'screensaver' && (
                  <div className='hw-bezel-overlay'>
                    {Array.from({ length: preset.cols - 1 }).map((_, i) => (
                      <div
                        key={`col-${i}`}
                        className='hw-bezel-grid-line hw-bezel-grid-line--vertical hw-bezel-grid-line--black'
                        style={{ left: `${((i + 1) / preset.cols) * 100}%` }}
                      />
                    ))}
                    {Array.from({ length: preset.rows - 1 }).map((_, i) => (
                      <div
                        key={`row-${i}`}
                        className='hw-bezel-grid-line hw-bezel-grid-line--horizontal hw-bezel-grid-line--black'
                        style={{ top: `${((i + 1) / preset.rows) * 100}%` }}
                      />
                    ))}
                  </div>
                )}
              </div>
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
            {isSplitting ? progressLabel : (appMode === 'screensaver' ? 'GENERATE SCREENSAVER' : (file?.type === 'image/gif' ? 'SPLIT GIF' : 'SPLIT IMAGE'))}
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
