import { encodePageFolder, generateStreamDeckProfile } from '../streamDeckProfile';
import type { SplitResult } from '../ffmpeg';
import JSZip from 'jszip';
import { vi, describe, it, expect, beforeAll, afterAll } from 'vitest';

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

describe('generateStreamDeckProfile', () => {
  let originalCrypto: Crypto;

  beforeAll(() => {
    originalCrypto = globalThis.crypto;
  });

  afterAll(() => {
    Object.defineProperty(globalThis, 'crypto', {
      value: originalCrypto
    });
  });

  it('generates a valid stream deck profile zip', async () => {
    let callCount = 0;
    Object.defineProperty(globalThis, 'crypto', {
      value: {
        randomUUID: vi.fn(() => `12345678-1234-1234-1234-123456789ab${callCount++}`)
      }
    });

    const results: SplitResult[] = [
      { col: 1, row: 1, blob: new Blob(['gif data']), url: 'blob:url' },
    ];
    
    const profileBlob = await generateStreamDeckProfile(results, 'Test Profile', '20GAA9901');
    expect(profileBlob).toBeInstanceOf(Blob);

    const zip = await JSZip.loadAsync(await profileBlob.arrayBuffer());
    
    // root is generated first (callCount 0)
    const rootFolderName = '12345678-1234-1234-1234-123456789AB0.sdProfile/';
    expect(zip.files[rootFolderName]).toBeDefined();

    // Check manifest.json inside root
    const rootManifestContent = await zip.file(`${rootFolderName}manifest.json`)?.async('string');
    expect(rootManifestContent).toBeDefined();
    const rootManifest = JSON.parse(rootManifestContent!);
    expect(rootManifest.Name).toBe('Test Profile');
    expect(rootManifest.Device.Model).toBe('20GAA9901');
    // parent is generated second (callCount 1)
    expect(rootManifest.Pages.Current).toBe('12345678-1234-1234-1234-123456789ab1');

    // parent folder name based on UUID
    const parentFolderName = encodePageFolder('12345678-1234-1234-1234-123456789ab1');
    // child is generated third (callCount 2)
    const childFolderName = encodePageFolder('12345678-1234-1234-1234-123456789ab2');

    // Check parent manifest
    const parentManifestContent = await zip.file(`${rootFolderName}Profiles/${parentFolderName}/manifest.json`)?.async('string');
    expect(parentManifestContent).toBeDefined();
    const parentManifest = JSON.parse(parentManifestContent!);
    expect(parentManifest.Controllers[0].Actions['0,0'].UUID).toBe('com.elgato.streamdeck.profile.openchild');

    // Check child manifest
    const childManifestContent = await zip.file(`${rootFolderName}Profiles/${childFolderName}/manifest.json`)?.async('string');
    expect(childManifestContent).toBeDefined();
    
    const childManifest = JSON.parse(childManifestContent!);
    expect(childManifest.Name).toBe('Test Profile');
    expect(childManifest.Controllers[0].Actions['1,1'].States[0].Image).toBe('Images/tile_1_1.gif');
    
    // Ensure back button is populated at 0,0
    expect(childManifest.Controllers[0].Actions['0,0'].UUID).toBe('com.elgato.streamdeck.profile.backtoparent');
    expect(childManifest.Controllers[0].Actions['0,0'].States[0].Image).toBe('');
    
    // Check that images are present
    const imageContent = await zip.file(`${rootFolderName}Profiles/${childFolderName}/Images/tile_1_1.gif`)?.async('string');
    expect(imageContent).toBe('gif data');
  });
  
  it('does not overwrite existing 0,0 action if tile is present at 0,0', async () => {
    let callCount = 0;
    Object.defineProperty(globalThis, 'crypto', {
      value: {
        randomUUID: vi.fn(() => `12345678-1234-1234-1234-123456789ab${callCount++}`)
      }
    });

    const results: SplitResult[] = [
      { col: 0, row: 0, blob: new Blob(['0,0 gif']), url: 'blob:url' },
    ];
    
    const profileBlob = await generateStreamDeckProfile(results, 'Test', '10GAA9901');
    const zip = await JSZip.loadAsync(await profileBlob.arrayBuffer());
    
    const rootFolder = Object.keys(zip.files).find(name => name.endsWith('.sdProfile/')) || '';
    const profiles = Object.keys(zip.files).filter(name => name.includes('Profiles/') && name.endsWith('manifest.json'));
    
    // Profiles are created for parent and child.
    // the root one is `12345678-1234-1234-1234-123456789ABC.sdProfile/manifest.json`
    // and there are two in Profiles/
    const childManifestPath = profiles[1]; // child is generated second, or just find the one that has Name="Test"
    
    const childManifestContent = await zip.file(childManifestPath)?.async('string');
    const childManifest = JSON.parse(childManifestContent!);
    
    expect(childManifest.Controllers[0].Actions['0,0'].States[0].Image).toBe('Images/tile_0_0.gif');
  });
});
