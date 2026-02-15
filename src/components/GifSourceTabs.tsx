import { useState } from 'react';
import type { ReactNode } from 'react';
import { GiphyPicker } from './GiphyPicker';

interface GifSourceTabsProps {
  hasFile: boolean;
  children: ReactNode;
  onGifSelected: (file: File) => void;
}

export function GifSourceTabs({ hasFile, children, onGifSelected }: GifSourceTabsProps) {
  const [activeTab, setActiveTab] = useState<'upload' | 'giphy'>('upload');

  return (
    <div className='hw-source-tabs-wrapper'>
      {!hasFile && (
        <div className='hw-source-toggle-track'>
          <div
            className={`hw-source-toggle-thumb${activeTab === 'giphy' ? ' hw-source-toggle-right' : ''}`}
          />
          <button
            className={`hw-source-toggle-label${activeTab === 'upload' ? ' active' : ''}`}
            onClick={() => setActiveTab('upload')}
          >
            <svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' strokeWidth={2} stroke='currentColor' width='14' height='14'>
              <path strokeLinecap='round' strokeLinejoin='round' d='M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5' />
            </svg>
            Upload
          </button>
          <button
            className={`hw-source-toggle-label${activeTab === 'giphy' ? ' active' : ''}`}
            onClick={() => setActiveTab('giphy')}
          >
            <svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' strokeWidth={2} stroke='currentColor' width='14' height='14'>
              <path strokeLinecap='round' strokeLinejoin='round' d='m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z' />
            </svg>
            Search GIPHY
          </button>
        </div>
      )}

      {hasFile || activeTab === 'upload' ? (
        children
      ) : (
        <section className='hw-drop-section'>
          <GiphyPicker onGifSelected={onGifSelected} />
        </section>
      )}
    </div>
  );
}
