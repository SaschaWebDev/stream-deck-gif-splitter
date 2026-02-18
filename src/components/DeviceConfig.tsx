import { useState, useEffect } from 'react';
import { PRESETS } from '../constants/presets';
import type { DeviceConfigProps } from '../types';

export function DeviceConfig({
  presetIndex,
  cutoffMode,
  customCropEnabled,
  customLoopEnabled,
  customGridEnabled,
  customCols,
  customRows,
  gridOffsetCol,
  gridOffsetRow,
  targetWidth,
  targetHeight,
  preset,
  basePreset,
  isCropping,
  isSplitting,
  onPresetChange,
  onCutoffToggle,
  onCustomCropToggle,
  onCustomLoopToggle,
  onCustomGridToggle,
  onCustomColsChange,
  onCustomRowsChange,
  onGridOffsetChange,
}: DeviceConfigProps) {
  const isCustomSmaller = customGridEnabled && (customCols < basePreset.cols || customRows < basePreset.rows);
  const maxOffsetCol = basePreset.cols - customCols;
  const maxOffsetRow = basePreset.rows - customRows;

  // Local string state so mobile users can clear the field before typing a new value
  const [colsInput, setColsInput] = useState(String(customCols));
  const [rowsInput, setRowsInput] = useState(String(customRows));

  // Sync local state when parent value changes (e.g. preset switch resets cols/rows)
  useEffect(() => setColsInput(String(customCols)), [customCols]);
  useEffect(() => setRowsInput(String(customRows)), [customRows]);

  const commitCols = (raw: string) => {
    const v = Math.max(1, Math.min(basePreset.cols, parseInt(raw) || 1));
    setColsInput(String(v));
    if (v !== customCols) onCustomColsChange(v);
  };

  const commitRows = (raw: string) => {
    const v = Math.max(1, Math.min(basePreset.rows, parseInt(raw) || 1));
    setRowsInput(String(v));
    if (v !== customRows) onCustomRowsChange(v);
  };

  return (
    <>
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
              onPresetChange(parseInt(e.target.value))
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
            {customGridEnabled && (
              <span className='hw-crop-label-tag'>(custom)</span>
            )}
          </span>
        </div>

        <div className='hw-toggles-grid'>
        <div className='hw-cutoff-toggle'>
          <label className='hw-toggle-wrapper'>
            <input
              type='checkbox'
              id='hw-cutoff-mode'
              checked={cutoffMode}
              onChange={(e) => onCutoffToggle(e.target.checked)}
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

        <div className='hw-cutoff-toggle'>
          <label className='hw-toggle-wrapper'>
            <input
              type='checkbox'
              id='hw-custom-grid'
              checked={customGridEnabled}
              onChange={(e) => onCustomGridToggle(e.target.checked)}
              disabled={isCropping || isSplitting}
            />
            <span className='hw-toggle-track'>
              <span className='hw-toggle-thumb' />
            </span>
            <span className='hw-toggle-label'>Custom Grid</span>
          </label>
          <span className='hw-toggle-desc'>
            Use a smaller grid area on your device.
          </span>
          {customGridEnabled && (
            <div className='hw-grid-inputs'>
              <label className='hw-grid-input'>
                <span className='hw-label'>Cols</span>
                <input
                  type='number'
                  inputMode='numeric'
                  min={1}
                  max={basePreset.cols}
                  value={colsInput}
                  onChange={(e) => setColsInput(e.target.value)}
                  onBlur={(e) => commitCols(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') commitCols(colsInput); }}
                  disabled={isCropping || isSplitting}
                />
              </label>
              <span className='hw-grid-x'>&times;</span>
              <label className='hw-grid-input'>
                <span className='hw-label'>Rows</span>
                <input
                  type='number'
                  inputMode='numeric'
                  min={1}
                  max={basePreset.rows}
                  value={rowsInput}
                  onChange={(e) => setRowsInput(e.target.value)}
                  onBlur={(e) => commitRows(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') commitRows(rowsInput); }}
                  disabled={isCropping || isSplitting}
                />
              </label>
            </div>
          )}
          {isCustomSmaller && (
            <div className='hw-grid-position'>
              <span className='hw-label'>Position</span>
              <div className='hw-grid-pos-control'>
                <button
                  className='hw-grid-arrow hw-grid-arrow-up'
                  disabled={gridOffsetRow <= 0 || isCropping || isSplitting}
                  onClick={() => onGridOffsetChange(gridOffsetCol, gridOffsetRow - 1)}
                  aria-label='Move up'
                >
                  <svg width='12' height='12' viewBox='0 0 12 12' fill='currentColor'><path d='M6 2L1 8h10z'/></svg>
                </button>
                <button
                  className='hw-grid-arrow hw-grid-arrow-left'
                  disabled={gridOffsetCol <= 0 || isCropping || isSplitting}
                  onClick={() => onGridOffsetChange(gridOffsetCol - 1, gridOffsetRow)}
                  aria-label='Move left'
                >
                  <svg width='12' height='12' viewBox='0 0 12 12' fill='currentColor'><path d='M2 6l6-5v10z'/></svg>
                </button>
                <div className='hw-grid-pos-mini'>
                  {Array.from({ length: basePreset.rows }, (_, r) => (
                    <div key={r} className='hw-grid-pos-row'>
                      {Array.from({ length: basePreset.cols }, (_, c) => {
                        const active =
                          c >= gridOffsetCol && c < gridOffsetCol + customCols &&
                          r >= gridOffsetRow && r < gridOffsetRow + customRows;
                        return (
                          <div
                            key={c}
                            className={`hw-grid-pos-cell${active ? ' hw-grid-pos-active' : ''}`}
                          />
                        );
                      })}
                    </div>
                  ))}
                </div>
                <button
                  className='hw-grid-arrow hw-grid-arrow-right'
                  disabled={gridOffsetCol >= maxOffsetCol || isCropping || isSplitting}
                  onClick={() => onGridOffsetChange(gridOffsetCol + 1, gridOffsetRow)}
                  aria-label='Move right'
                >
                  <svg width='12' height='12' viewBox='0 0 12 12' fill='currentColor'><path d='M10 6L4 1v10z'/></svg>
                </button>
                <button
                  className='hw-grid-arrow hw-grid-arrow-down'
                  disabled={gridOffsetRow >= maxOffsetRow || isCropping || isSplitting}
                  onClick={() => onGridOffsetChange(gridOffsetCol, gridOffsetRow + 1)}
                  aria-label='Move down'
                >
                  <svg width='12' height='12' viewBox='0 0 12 12' fill='currentColor'><path d='M6 10l5-6H1z'/></svg>
                </button>
              </div>
            </div>
          )}
        </div>

        <div className='hw-cutoff-toggle'>
          <label className='hw-toggle-wrapper'>
            <input
              type='checkbox'
              id='hw-custom-crop'
              checked={customCropEnabled}
              onChange={(e) => onCustomCropToggle(e.target.checked)}
              disabled={isCropping || isSplitting}
            />
            <span className='hw-toggle-track'>
              <span className='hw-toggle-thumb' />
            </span>
            <span className='hw-toggle-label'>Custom Crop</span>
          </label>
          <span className='hw-toggle-desc'>
            Drag crop region instead of center crop.
          </span>
        </div>

        <div className='hw-cutoff-toggle'>
          <label className='hw-toggle-wrapper'>
            <input
              type='checkbox'
              id='hw-custom-loop'
              checked={customLoopEnabled}
              onChange={(e) => onCustomLoopToggle(e.target.checked)}
              disabled={isCropping || isSplitting}
            />
            <span className='hw-toggle-track'>
              <span className='hw-toggle-thumb' />
            </span>
            <span className='hw-toggle-label'>Custom Loop</span>
          </label>
          <span className='hw-toggle-desc'>
            Trim the animation loop length.
          </span>
        </div>
        </div>
      </div>
    </>
  );
}
