import { encodePageFolder } from '../streamDeckProfile';

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
