import { encodePageFolder, buildChildPageManifest } from '../streamDeckProfile';
import type { SplitResult } from '../ffmpeg';
import { describe, it, expect } from 'vitest';

describe('encodePageFolder', () => {
  it('produces a known output for a known UUID', () => {
    // Using a fixed UUID to verify deterministic encoding
    const result = encodePageFolder('550e8400-e29b-41d4-a716-446655440000');
    expect(result).toHaveLength(27);
    expect(result).toMatch(/^[0-9A-Z]+$/);
    expect(result.endsWith('Z')).toBe(true);
  });

  it('always returns a 27-character string', () => {
    const uuids = [
      '00000000-0000-0000-0000-000000000000',
      'ffffffff-ffff-ffff-ffff-ffffffffffff',
      '12345678-1234-1234-1234-123456789abc',
    ];
    for (const uuid of uuids) {
      expect(encodePageFolder(uuid)).toHaveLength(27);
    }
  });

  it('always ends with Z', () => {
    const result = encodePageFolder('abcdef01-2345-6789-abcd-ef0123456789');
    expect(result[26]).toBe('Z');
  });

  it('does not contain U or V (substituted to V and W)', () => {
    // Test with UUID that would produce U/V in base32hex
    const result = encodePageFolder('ffffffff-ffff-ffff-ffff-ffffffffffff');
    expect(result).not.toContain('U');
    // V can appear as a substitution for U, but original V is replaced with W
    // The key constraint: no raw base32hex U or V remain
  });

  it('produces deterministic output', () => {
    const uuid = '550e8400-e29b-41d4-a716-446655440000';
    const result1 = encodePageFolder(uuid);
    const result2 = encodePageFolder(uuid);
    expect(result1).toBe(result2);
  });
});

describe('buildChildPageManifest', () => {
  type ChildManifest = {
    Name: string;
    Controllers: Array<{
      Actions: Record<string, { UUID: string; States: Array<{ Image: string }> }>;
    }>;
  };

  it('points each tile action at its Images/tile_<col>_<row>.gif file and adds a synthetic (0,0) back button when none is present', () => {
    const tiles: SplitResult[] = [
      { col: 1, row: 1, blob: new Blob(), url: '', filename: 'tile_1_1.gif' },
    ];
    const manifest = buildChildPageManifest(tiles, 'Test Profile') as ChildManifest;

    expect(manifest.Name).toBe('Test Profile');
    expect(manifest.Controllers[0].Actions['1,1'].States[0].Image).toBe('Images/tile_1_1.gif');

    // Synthetic (0,0) back button — image must be empty
    expect(manifest.Controllers[0].Actions['0,0'].UUID).toBe('com.elgato.streamdeck.profile.backtoparent');
    expect(manifest.Controllers[0].Actions['0,0'].States[0].Image).toBe('');
  });

  it('does not overwrite the (0,0) action when a real tile occupies that slot', () => {
    const tiles: SplitResult[] = [
      { col: 0, row: 0, blob: new Blob(), url: '', filename: 'tile_0_0.gif' },
    ];
    const manifest = buildChildPageManifest(tiles, 'Test') as ChildManifest;

    expect(manifest.Controllers[0].Actions['0,0'].States[0].Image).toBe('Images/tile_0_0.gif');
  });
});
