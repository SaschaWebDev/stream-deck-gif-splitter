import { formatSize } from '../format';

describe('formatSize', () => {
  it('returns bytes for values under 1024', () => {
    expect(formatSize(0)).toBe('0 B');
    expect(formatSize(1)).toBe('1 B');
    expect(formatSize(512)).toBe('512 B');
    expect(formatSize(1023)).toBe('1023 B');
  });

  it('returns KB for values from 1024 to under 1 MB', () => {
    expect(formatSize(1024)).toBe('1.0 KB');
    expect(formatSize(1536)).toBe('1.5 KB');
    expect(formatSize(1048575)).toBe('1024.0 KB');
  });

  it('returns MB for values 1 MB and above', () => {
    expect(formatSize(1048576)).toBe('1.0 MB');
    expect(formatSize(1572864)).toBe('1.5 MB');
    expect(formatSize(10485760)).toBe('10.0 MB');
  });
});
