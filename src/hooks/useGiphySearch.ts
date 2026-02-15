import { useState, useEffect, useRef, useCallback } from 'react';
import type { GiphyGif } from '../types';
import { searchGifs, getTrending, fetchGifAsFile } from '../services/giphy';

const LIMIT = 25;
const DEBOUNCE_MS = 500;

export function useGiphySearch() {
  const [gifs, setGifs] = useState<GiphyGif[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);

  const abortRef = useRef<AbortController | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const fetchGifs = useCallback(async (q: string, off: number, append: boolean) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError(null);

    try {
      const res = q.trim()
        ? await searchGifs(q, off, controller.signal)
        : await getTrending(off, controller.signal);

      const newGifs = res.data;
      setGifs(prev => append ? [...prev, ...newGifs] : newGifs);
      setHasMore(newGifs.length >= LIMIT);
      setOffset(off + newGifs.length);
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === 'AbortError') return;
      setError(err instanceof Error ? err.message : 'Failed to load GIFs');
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }, []);

  // Load trending on mount
  useEffect(() => {
    fetchGifs('', 0, false);
    return () => { abortRef.current?.abort(); };
  }, [fetchGifs]);

  const updateQuery = useCallback((q: string) => {
    setQuery(q);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setOffset(0);
      fetchGifs(q, 0, false);
    }, DEBOUNCE_MS);
  }, [fetchGifs]);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      fetchGifs(query, offset, true);
    }
  }, [loading, hasMore, query, offset, fetchGifs]);

  const selectGif = useCallback(async (gif: GiphyGif): Promise<File> => {
    return fetchGifAsFile(gif.images.original.url, gif.title);
  }, []);

  return { gifs, loading, error, query, hasMore, updateQuery, loadMore, selectGif };
}
