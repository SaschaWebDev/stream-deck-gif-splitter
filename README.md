<div align="center">

# Stream Deck GIF Splitter

**✨ Turn any animated GIF into a seamless Stream Deck background — entirely in your browser. ✨**

[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE) [![Website](https://img.shields.io/website?url=https%3A%2F%2Fgif.saschaweb.dev&label=gif.saschaweb.dev)](https://gif.saschaweb.dev) [![Vitest](https://img.shields.io/badge/tested_with-Vitest-6e9f18.svg?logo=vitest&logoColor=white)](https://vitest.dev) [![React 19](https://img.shields.io/badge/React-19-61dafb.svg?logo=react&logoColor=white)](https://react.dev) [![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178c6.svg?logo=typescript&logoColor=white)](https://www.typescriptlang.org) [![Vite](https://img.shields.io/badge/Vite-7-646cff.svg?logo=vite&logoColor=white)](https://vite.dev) [![FFmpeg.wasm](https://img.shields.io/badge/FFmpeg.wasm-0.12-007808.svg?logo=ffmpeg&logoColor=white)](https://ffmpegwasm.netlify.app)

<img src="https://github.com/SaschaWebDev/animated-stream-deck-background-gif-converter/raw/develop/docs/stream-deck-gif-splitter-showcase.gif" width="600" alt="Stream Deck GIF Splitter" />

[🚀 - Try it live -](https://gif.saschaweb.dev) · [🐛 Report Bug](https://github.com/SaschaWebDev/animated-stream-deck-background-gif-converter/issues) · [💡 Request Feature](https://github.com/SaschaWebDev/animated-stream-deck-background-gif-converter/issues)

</div>

---

## ℹ️ About

Stream Deck GIF Splitter takes any animated GIF and slices it into a perfectly sized tile grid that maps 1:1 to your Elgato Stream Deck buttons — giving you a full-screen animated background across your entire device.

All processing runs **100% client-side** using [FFmpeg.wasm](https://ffmpegwasm.netlify.app). No uploads, no servers, no account needed.

### 🔥 Key Features

- 🖱️ **Drag & drop** — Upload any GIF and see an instant cropped preview
- 🔍 **GIPHY search** — Browse trending GIFs or search GIPHY directly from the app — no need to leave the page
- 🎚️ **5 device presets** — Stream Deck MK.2, XL, Mini, +, and Neo
- ✂️ **Cutoff mode** — Accounts for the physical gap between buttons so animations appear seamless
- 🎨 **High-quality encoding** — Two-pass palette generation with Floyd-Steinberg dithering
- 📦 **ZIP download** — Get all tiles in a numbered, ready-to-assign archive
- 🗂️ **`.streamDeckProfile` export** — One-click installable profile with all tiles pre-assigned
- 📡 **Fully offline** — FFmpeg is cached after first load; works without internet on repeat visits
- 🔒 **Privacy-first** — Your files never leave your browser

## 🎮 Supported Devices

| Device           | Grid  | Tile Size    | Button Gap |
| ---------------- | ----- | ------------ | ---------- |
| Stream Deck MK.2 | 5 × 3 | 72 × 72 px   | 16 px      |
| Stream Deck XL   | 8 × 4 | 144 × 144 px | 40 px      |
| Stream Deck Mini | 3 × 2 | 72 × 72 px   | 16 px      |
| Stream Deck +    | 4 × 2 | 72 × 72 px   | 16 px      |
| Stream Deck Neo  | 4 × 2 | 72 × 72 px   | 16 px      |

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org) 18+ (LTS recommended)
- npm, yarn, or pnpm

### 📥 Installation

```bash
git clone https://github.com/SaschaWebDev/animated-stream-deck-background-gif-converter.git
cd animated-stream-deck-background-gif-converter
npm install
```

### 💻 Development

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### 🧪 Testing

```bash
npm test              # run all tests once
npm run test:watch    # run tests in watch mode
npm run test:coverage # run tests with coverage report
```

### 📦 Build

```bash
npm run build
npm run preview   # preview the production build locally
```

## 🛠️ Tech Stack

| Layer                 | Technology                                                                                  |
| --------------------- | ------------------------------------------------------------------------------------------- |
| ⚛️ Framework          | [React 19](https://react.dev) with [React Compiler](https://react.dev/learn/react-compiler) |
| 🟦 Language           | [TypeScript 5.9](https://www.typescriptlang.org)                                            |
| ⚡ Bundler            | [Vite 7](https://vite.dev)                                                                  |
| 🎬 Video Processing   | [FFmpeg.wasm 0.12](https://ffmpegwasm.netlify.app)                                          |
| 🗜️ Archive Generation | [JSZip](https://stuk.github.io/jszip/)                                                      |
| 🔍 GIF Search         | [GIPHY API](https://developers.giphy.com)                                                   |
| 🧹 Linting            | [ESLint 9](https://eslint.org) with TypeScript & React plugins                              |

## ⚙️ How It Works

1. 📤 **Upload** — Drop a GIF, click to browse, or search GIPHY for the perfect animation
2. ✂️ **Crop** — The GIF is automatically cropped and scaled to match your selected device's total button area (including optional gap compensation)
3. 🔪 **Split** — FFmpeg slices the cropped GIF into individual tile animations using two-pass encoding for optimal quality
4. 💾 **Export** — Download as a ZIP of numbered tiles or as a ready-to-install `.streamDeckProfile`

## 📁 Project Structure

```
src/
├── main.tsx                          # Entry point
├── App.tsx                           # Root application component
├── index.css                         # Global styles & CSS variables
├── App.css                           # App-level styles
├── components/
│   ├── CropPreview.tsx               # Cropped GIF preview with split controls
│   ├── DeviceConfig.tsx              # Device preset & cutoff mode selector
│   ├── FileDropZone.tsx              # Drag-and-drop file upload area
│   ├── GifSourceTabs.tsx             # Upload / GIPHY toggle switcher
│   ├── GiphyPicker.tsx              # GIPHY search, grid & GIF selection
│   ├── HeroSection.tsx               # Landing hero banner
│   ├── ResultsPanel.tsx              # Tile grid results & download buttons
│   └── UserManual.tsx                # Inline usage instructions
├── constants/
│   └── presets.ts                    # Device preset configurations
├── hooks/
│   ├── useAutoScroll.ts              # Auto-scroll to results
│   ├── useDeviceConfig.ts            # Device preset state management
│   ├── useDownload.ts                # ZIP & profile download logic
│   ├── useFileUpload.ts              # File input & drag-and-drop handling
│   ├── useGifProcessor.ts            # Crop & split orchestration
│   ├── useGifSync.ts                 # Synchronized GIF playback
│   └── useGiphySearch.ts             # GIPHY search state & debouncing
├── services/
│   ├── ffmpeg.ts                     # FFmpeg.wasm hook (crop, split, progress)
│   ├── giphy.ts                      # GIPHY API service & GIF-to-File fetcher
│   └── streamDeckProfile.ts          # .streamDeckProfile ZIP generator
├── types/
│   └── index.ts                      # Shared TypeScript interfaces
└── utils/
    ├── device.ts                     # Device dimension calculations
    ├── filename.ts                   # Download filename generation
    ├── format.ts                     # File size formatting
    └── progress.ts                   # Progress label formatting
```

## 🤝 Contributing

Contributions are welcome! Feel free to open an issue or submit a pull request.

1. 🍴 Fork the repository
2. 🌿 Create your feature branch (`git checkout -b feature/amazing-feature`)
3. 💾 Commit your changes (`git commit -m 'Add amazing feature'`)
4. 📤 Push to the branch (`git push origin feature/amazing-feature`)
5. 🎉 Open a Pull Request

## 📄 License

Distributed under the MIT License. See [`LICENSE`](LICENSE) for details.

---

<div align="center">

Made with ❤️ by [Sascha Majewsky](https://github.com/SaschaWebDev)

</div>
