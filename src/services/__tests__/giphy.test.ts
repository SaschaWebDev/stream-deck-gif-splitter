import { searchGifs, getTrending, fetchGifAsFile } from '../giphy';

const mockGiphyResponse = {
  data: [
    {
      id: 'abc123',
      title: 'Test GIF',
      images: {
        original: { url: 'https://media.giphy.com/original.gif' },
        fixed_width: { url: 'https://media.giphy.com/fixed.gif', width: '200', height: '150' },
      },
    },
  ],
  pagination: { total_count: 100, count: 1, offset: 0 },
};

describe('GIPHY service', () => {
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  describe('searchGifs', () => {
    it('calls the search endpoint with query and returns data', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockGiphyResponse),
      });

      const result = await searchGifs('cats');

      expect(fetch).toHaveBeenCalledTimes(1);
      const url = (fetch as ReturnType<typeof vi.fn>).mock.calls[0][0] as string;
      expect(url).toContain('api.giphy.com/v1/gifs/search');
      expect(url).toContain('q=cats');
      expect(url).toContain('limit=20');
      expect(url).toContain('offset=0');
      expect(result.data).toHaveLength(1);
      expect(result.data[0].id).toBe('abc123');
    });

    it('passes offset parameter', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockGiphyResponse),
      });

      await searchGifs('dogs', 40);

      const url = (fetch as ReturnType<typeof vi.fn>).mock.calls[0][0] as string;
      expect(url).toContain('offset=40');
    });

    it('throws on non-ok response', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({ ok: false, status: 500 });

      await expect(searchGifs('fail')).rejects.toThrow('GIPHY search failed: 500');
    });

    it('passes abort signal to fetch', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockGiphyResponse),
      });

      const controller = new AbortController();
      await searchGifs('test', 0, controller.signal);

      expect((fetch as ReturnType<typeof vi.fn>).mock.calls[0][1]).toEqual({
        signal: controller.signal,
      });
    });

    it('encodes special characters in query', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockGiphyResponse),
      });

      await searchGifs('hello world & friends');

      const url = (fetch as ReturnType<typeof vi.fn>).mock.calls[0][0] as string;
      expect(url).toContain('q=hello%20world%20%26%20friends');
    });
  });

  describe('getTrending', () => {
    it('calls the trending endpoint and returns data', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockGiphyResponse),
      });

      const result = await getTrending();

      const url = (fetch as ReturnType<typeof vi.fn>).mock.calls[0][0] as string;
      expect(url).toContain('api.giphy.com/v1/gifs/trending');
      expect(url).toContain('limit=20');
      expect(url).toContain('offset=0');
      expect(result.data).toHaveLength(1);
    });

    it('passes offset parameter', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockGiphyResponse),
      });

      await getTrending(20);

      const url = (fetch as ReturnType<typeof vi.fn>).mock.calls[0][0] as string;
      expect(url).toContain('offset=20');
    });

    it('throws on non-ok response', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({ ok: false, status: 403 });

      await expect(getTrending()).rejects.toThrow('GIPHY trending failed: 403');
    });
  });

  describe('fetchGifAsFile', () => {
    it('fetches a URL and returns a File with .gif extension', async () => {
      const blobContent = new Uint8Array([0x47, 0x49, 0x46]);
      const mockBlob = new Blob([blobContent], { type: 'image/gif' });

      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        blob: () => Promise.resolve(mockBlob),
      });

      const file = await fetchGifAsFile('https://example.com/test.gif', 'Funny Cat');

      expect(file).toBeInstanceOf(File);
      expect(file.name).toBe('Funny_Cat.gif');
      expect(file.type).toBe('image/gif');
    });

    it('sanitizes special characters from title', async () => {
      const mockBlob = new Blob([], { type: 'image/gif' });
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        blob: () => Promise.resolve(mockBlob),
      });

      const file = await fetchGifAsFile('https://example.com/test.gif', 'Hello! @World #2024');

      expect(file.name).toBe('Hello___World__2024.gif');
    });

    it('uses fallback name for empty title', async () => {
      const mockBlob = new Blob([], { type: 'image/gif' });
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        blob: () => Promise.resolve(mockBlob),
      });

      const file = await fetchGifAsFile('https://example.com/test.gif', '');

      expect(file.name).toBe('giphy.gif');
    });

    it('truncates long titles to 60 characters', async () => {
      const mockBlob = new Blob([], { type: 'image/gif' });
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        blob: () => Promise.resolve(mockBlob),
      });

      const longTitle = 'a'.repeat(100);
      const file = await fetchGifAsFile('https://example.com/test.gif', longTitle);

      // 60 chars + '.gif'
      expect(file.name).toBe('a'.repeat(60) + '.gif');
    });

    it('throws on non-ok response', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({ ok: false, status: 404 });

      await expect(
        fetchGifAsFile('https://example.com/missing.gif', 'Missing'),
      ).rejects.toThrow('Failed to fetch GIF');
    });
  });
});
