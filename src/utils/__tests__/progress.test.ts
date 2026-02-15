import { getProgressLabel } from '../progress';

describe('getProgressLabel', () => {
  it('returns empty string for null', () => {
    expect(getProgressLabel(null)).toBe('');
  });

  it('returns loading label', () => {
    expect(getProgressLabel({ phase: 'loading', current: 0, total: 0 })).toBe('Loading ffmpeg...');
  });

  it('returns palette label', () => {
    expect(getProgressLabel({ phase: 'palette', current: 0, total: 0 })).toBe('Generating palette...');
  });

  it('returns splitting label with current and total', () => {
    expect(getProgressLabel({ phase: 'splitting', current: 3, total: 15 })).toBe('Splitting tile 3 of 15...');
  });

  it('returns done label', () => {
    expect(getProgressLabel({ phase: 'done', current: 15, total: 15 })).toBe('Done!');
  });
});
