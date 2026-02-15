import { PRESETS } from '../constants/presets';
import type { DeviceConfigProps } from '../types';

export function DeviceConfig({
  presetIndex,
  cutoffMode,
  targetWidth,
  targetHeight,
  preset,
  isCropping,
  isSplitting,
  onPresetChange,
  onCutoffToggle,
}: DeviceConfigProps) {
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
          </span>
        </div>

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
      </div>
    </>
  );
}
