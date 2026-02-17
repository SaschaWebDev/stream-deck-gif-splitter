import JSZip from 'jszip';
import type { SplitResult } from './ffmpeg';

const BASE32HEX = '0123456789ABCDEFGHIJKLMNOPQRSTUV';

/**
 * Converts a UUID to the 27-char encoded folder name used by Stream Deck profiles.
 * Uses base32hex encoding of the raw UUID bytes, then V→W / U→V substitution, then appends Z.
 */
export function encodePageFolder(uuid: string): string {
  const hex = uuid.replace(/-/g, '');
  const bytes: number[] = [];
  for (let i = 0; i < hex.length; i += 2) {
    bytes.push(parseInt(hex.substring(i, i + 2), 16));
  }
  let bits = '';
  for (const b of bytes) bits += b.toString(2).padStart(8, '0');
  let encoded = '';
  for (let i = 0; i < bits.length; i += 5) {
    encoded += BASE32HEX[parseInt(bits.substring(i, i + 5).padEnd(5, '0'), 2)];
  }
  encoded = encoded.substring(0, 26).replace(/V/g, 'W').replace(/U/g, 'V');
  return encoded + 'Z';
}

function buildRootManifest(
  profileName: string,
  parentPageUUID: string,
  deviceModel: string,
): Record<string, unknown> {
  return {
    AppIdentifier: '',
    Device: {
      Model: deviceModel,
      UUID: '',
    },
    Name: profileName,
    Pages: {
      Current: parentPageUUID,
      Default: parentPageUUID,
      Pages: [parentPageUUID],
    },
    Version: '2.0',
  };
}

function buildParentPageManifest(
  childProfileUUID: string,
): Record<string, unknown> {
  return {
    Controllers: [
      {
        Actions: {
          '0,0': {
            ActionID: crypto.randomUUID(),
            LinkedTitle: false,
            Name: 'Create Folder',
            Settings: {
              ProfileUUID: childProfileUUID,
            },
            State: 0,
            States: [
              {
                FontFamily: '',
                FontSize: 9,
                FontStyle: '',
                FontUnderline: false,
                Image: '',
                OutlineThickness: 2,
                ShowTitle: true,
                TitleAlignment: 'middle',
                TitleColor: '#ffffff',
                Title: 'GIF',
              },
            ],
            UUID: 'com.elgato.streamdeck.profile.openchild',
          },
        },
        Type: 'Keypad',
      },
    ],
    Icon: '',
    Name: '',
  };
}

function buildChildPageManifest(
  tiles: SplitResult[],
  profileName: string,
): Record<string, unknown> {
  const actions: Record<string, unknown> = {};

  for (const tile of tiles) {
    const key = `${tile.col},${tile.row}`;
    actions[key] = {
      ActionID: crypto.randomUUID(),
      LinkedTitle: false,
      Name: 'Back',
      Settings: {},
      State: 0,
      States: [
        {
          FontFamily: '',
          FontSize: 9,
          FontStyle: '',
          FontUnderline: false,
          Image: `Images/tile_${tile.col}_${tile.row}.gif`,
          OutlineThickness: 2,
          ShowTitle: false,
          TitleAlignment: 'bottom',
          TitleColor: '#ffffff',
        },
      ],
      UUID: 'com.elgato.streamdeck.profile.backtoparent',
    };
  }

  // Ensure position 0,0 always has a backtoparent action — the Stream Deck
  // software requires it for child profiles to render correctly.
  if (!actions['0,0']) {
    actions['0,0'] = {
      ActionID: crypto.randomUUID(),
      LinkedTitle: false,
      Name: 'Back',
      Settings: {},
      State: 0,
      States: [
        {
          FontFamily: '',
          FontSize: 9,
          FontStyle: '',
          FontUnderline: false,
          Image: '',
          OutlineThickness: 2,
          ShowTitle: false,
          TitleAlignment: 'bottom',
          TitleColor: '#ffffff',
        },
      ],
      UUID: 'com.elgato.streamdeck.profile.backtoparent',
    };
  }

  return {
    Controllers: [
      {
        Actions: actions,
        Type: 'Keypad',
      },
    ],
    Icon: '',
    Name: profileName,
  };
}

export async function generateStreamDeckProfile(
  results: SplitResult[],
  profileName: string,
  deviceModel: string,
): Promise<Blob> {
  const rootUUID = crypto.randomUUID().toUpperCase();
  const parentPageUUID = crypto.randomUUID();
  const childPageUUID = crypto.randomUUID();

  const encodedParentFolder = encodePageFolder(parentPageUUID);
  const encodedChildFolder = encodePageFolder(childPageUUID);

  const rootManifest = buildRootManifest(profileName, parentPageUUID, deviceModel);
  const parentPageManifest = buildParentPageManifest(childPageUUID);
  const childPageManifest = buildChildPageManifest(results, profileName);

  const rootManifestJson = JSON.stringify(rootManifest);
  const parentManifestJson = JSON.stringify(parentPageManifest);
  const childManifestJson = JSON.stringify(childPageManifest);

  const zip = new JSZip();
  const rootFolder = zip.folder(`${rootUUID}.sdProfile`)!;

  rootFolder.file('manifest.json', rootManifestJson);
  rootFolder.file('manifest.json.bak', rootManifestJson);
  rootFolder.folder('Images');

  const profilesFolder = rootFolder.folder('Profiles')!;

  // Parent page — has a single "GIF" button that opens the child
  const parentFolder = profilesFolder.folder(encodedParentFolder)!;
  parentFolder.file('manifest.json', parentManifestJson);
  parentFolder.file('manifest.json.bak', parentManifestJson);
  parentFolder.folder('Images');

  // Child page — the wallpaper grid with tile GIFs
  const childFolder = profilesFolder.folder(encodedChildFolder)!;
  childFolder.file('manifest.json', childManifestJson);
  childFolder.file('manifest.json.bak', childManifestJson);

  const imagesFolder = childFolder.folder('Images')!;
  for (const tile of results) {
    imagesFolder.file(`tile_${tile.col}_${tile.row}.gif`, tile.blob);
  }

  return zip.generateAsync({ type: 'blob' });
}
