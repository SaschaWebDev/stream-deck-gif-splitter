import { useState } from 'react';
import { useGiphySearch } from '../hooks/useGiphySearch';
import type { GiphyGif } from '../types';

interface GiphyPickerProps {
  onGifSelected: (file: File) => void;
}

export function GiphyPicker({ onGifSelected }: GiphyPickerProps) {
  const { gifs, loading, error, query, hasMore, updateQuery, loadMore, selectGif } =
    useGiphySearch();
  const [selecting, setSelecting] = useState<string | null>(null);
  const [corsError, setCorsError] = useState<GiphyGif | null>(null);

  const handleSelect = async (gif: GiphyGif) => {
    setSelecting(gif.id);
    setCorsError(null);
    try {
      const file = await selectGif(gif);
      onGifSelected(file);
    } catch {
      setCorsError(gif);
    } finally {
      setSelecting(null);
    }
  };

  return (
    <div className='hw-giphy-picker'>
      <div className='hw-giphy-search-row'>
        <svg
          className='hw-giphy-search-icon'
          xmlns='http://www.w3.org/2000/svg'
          fill='none'
          viewBox='0 0 24 24'
          strokeWidth={1.5}
          stroke='currentColor'
          width='18'
          height='18'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            d='m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z'
          />
        </svg>
        <input
          type='text'
          className='hw-giphy-search'
          placeholder='Search GIPHY...'
          value={query}
          onChange={(e) => updateQuery(e.target.value)}
        />
      </div>

      <div className='hw-giphy-attribution'>Powered by GIPHY</div>

      {error && (
        <div className='hw-giphy-error'>
          <span>{error}</span>
          <button
            className='hw-giphy-retry'
            onClick={() => updateQuery(query)}
          >
            Retry
          </button>
        </div>
      )}

      {gifs.length === 0 && !loading && !error && (
        <div className='hw-giphy-empty'>No results found</div>
      )}

      <div className='hw-giphy-grid'>
        {gifs.map((gif) => (
          <button
            key={gif.id}
            className={`hw-giphy-card${selecting === gif.id ? ' hw-giphy-card-loading' : ''}`}
            onClick={() => handleSelect(gif)}
            disabled={selecting !== null}
          >
            <img
              src={gif.images.fixed_width.url}
              alt={gif.title}
              width={gif.images.fixed_width.width}
              height={gif.images.fixed_width.height}
              loading='lazy'
            />
            {selecting === gif.id && (
              <div className='hw-giphy-card-overlay'>
                <span className='hw-giphy-card-spinner' />
              </div>
            )}
          </button>
        ))}
      </div>

      {loading && (
        <div className='hw-giphy-loading'>
          <span className='hw-giphy-spinner' />
          Loading...
        </div>
      )}

      {hasMore && gifs.length > 0 && !loading && (
        <button className='hw-giphy-load-more' onClick={loadMore}>
          Load More
        </button>
      )}

      {corsError && (
        <div className='hw-cors-overlay' onClick={() => setCorsError(null)}>
          <div className='hw-cors-modal' onClick={(e) => e.stopPropagation()}>
            <h3 className='hw-cors-title'>Cannot fetch GIF directly</h3>
            <p className='hw-cors-text'>
              The GIF could not be downloaded due to browser security restrictions (CORS).
            </p>
            <div className='hw-cors-actions'>
              <a
                href={corsError.images.original.url}
                target='_blank'
                rel='noopener noreferrer'
                className='hw-cors-link'
              >
                Open GIF in new tab
              </a>
              <p className='hw-cors-hint'>
                Save the GIF, then upload it via the Upload tab.
              </p>
              <button
                className='hw-cors-close'
                onClick={() => setCorsError(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
