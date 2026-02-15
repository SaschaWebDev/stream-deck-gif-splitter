import { generateZipFolderName, generateProfileFileName } from '../filename';

describe('generateZipFolderName', () => {
  it('includes cutoff suffix when cutoff mode is on', () => {
    expect(generateZipFolderName('animation.gif', true, 1000)).toBe('animation_tile-cutoff_1000');
  });

  it('excludes cutoff suffix when cutoff mode is off', () => {
    expect(generateZipFolderName('animation.gif', false, 1000)).toBe('animation_1000');
  });

  it('strips .gif extension case-insensitively', () => {
    expect(generateZipFolderName('MyFile.GIF', true, 42)).toBe('MyFile_tile-cutoff_42');
    expect(generateZipFolderName('test.Gif', false, 42)).toBe('test_42');
  });

  it('handles filenames without .gif extension', () => {
    expect(generateZipFolderName('noext', false, 1)).toBe('noext_1');
  });
});

describe('generateProfileFileName', () => {
  it('generates correct profile filename', () => {
    const result = generateProfileFileName('animation.gif', 'Stream Deck MK.2', 1700000000);
    expect(result).toBe('animation_Stream-Deck-MK.2_1700000000.streamDeckProfile');
  });

  it('strips .gif extension case-insensitively', () => {
    const result = generateProfileFileName('Test.GIF', 'Stream Deck XL', 123);
    expect(result).toBe('Test_Stream-Deck-XL_123.streamDeckProfile');
  });

  it('truncates base name to keep total under 180 chars', () => {
    const longName = 'a'.repeat(200) + '.gif';
    const result = generateProfileFileName(longName, 'Stream Deck MK.2', 1700000000);
    expect(result.length).toBeLessThanOrEqual(180);
    expect(result).toMatch(/\.streamDeckProfile$/);
  });

  it('includes device name with hyphens replacing spaces', () => {
    const result = generateProfileFileName('file.gif', 'Stream Deck +', 100);
    expect(result).toContain('Stream-Deck-+');
  });
});
