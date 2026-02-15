import type { GiphyGif } from '../types';

// Yes for the sake of keeping this project mostly client-side, I'm exposing the free GIPHY API key here. Please don't abuse it. All you can do is make the API key get banned, there is nothing to gain here. Be nice.
const API_KEY = '810aZcAg4yWXlSB8Z89WIQK5FjxrB8bA';
const BASE = 'https://api.giphy.com/v1/gifs';
const LIMIT = 20;

interface GiphyResponse {
  data: GiphyGif[];
  pagination: { total_count: number; count: number; offset: number };
}

export async function searchGifs(
  query: string,
  offset = 0,
  signal?: AbortSignal,
): Promise<GiphyResponse> {
  const url = `${BASE}/search?api_key=${API_KEY}&q=${encodeURIComponent(query)}&limit=${LIMIT}&offset=${offset}&rating=g`;
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(`GIPHY search failed: ${res.status}`);
  return res.json();
}

export async function getTrending(
  offset = 0,
  signal?: AbortSignal,
): Promise<GiphyResponse> {
  const url = `${BASE}/trending?api_key=${API_KEY}&limit=${LIMIT}&offset=${offset}&rating=g`;
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(`GIPHY trending failed: ${res.status}`);
  return res.json();
}

export async function fetchGifAsFile(
  url: string,
  title: string,
): Promise<File> {
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch GIF');
  const blob = await res.blob();
  const safeName =
    title.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 60) || 'giphy';
  return new File([blob], `${safeName}.gif`, { type: 'image/gif' });
}
