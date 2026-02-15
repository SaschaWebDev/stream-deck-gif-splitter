import type { FileDropZoneProps } from '../types';

export function FileDropZone({
  file,
  preview,
  cropSyncKey,
  isDragOver,
  fileInputRef,
  formatSize,
  onDragOver,
  onDragLeave,
  onDrop,
  onInputChange,
  onClear,
}: FileDropZoneProps) {
  return (
    <section className='hw-drop-section'>
      <div
        className={`hw-drop-button${isDragOver ? ' hw-drop-hover' : ''}${file ? ' hw-drop-has-file' : ''}`}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => !file && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type='file'
          accept='image/gif'
          className='hw-file-input'
          onChange={onInputChange}
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
                onClear();
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
  );
}
