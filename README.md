<div align="center">

# 🎛️ Stream Deck GIF Splitter

**✨ Turn any animated GIF into a seamless Stream Deck background — entirely in your browser. ✨**

[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE) [![React 19](https://img.shields.io/badge/React-19-61dafb.svg?logo=react&logoColor=white)](https://react.dev) [![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178c6.svg?logo=typescript&logoColor=white)](https://www.typescriptlang.org) [![Vite](https://img.shields.io/badge/Vite-7-646cff.svg?logo=vite&logoColor=white)](https://vite.dev) [![FFmpeg.wasm](https://img.shields.io/badge/FFmpeg.wasm-0.12-007808.svg?logo=ffmpeg&logoColor=white)](https://ffmpegwasm.netlify.app)

<img src="https://github.com/SaschaWebDev/animated-stream-deck-background-gif-converter/raw/develop/docs/stream-deck-gif-splitter-video.gif" width="600" alt="Stream Deck GIF Splitter" />

[🚀 - Try it live -](https://stream-deck-gif-splitter.vercel.app) · [🐛 Report Bug](https://github.com/SaschaWebDev/animated-stream-deck-background-gif-converter/issues) · [💡 Request Feature](https://github.com/SaschaWebDev/animated-stream-deck-background-gif-converter/issues)

</div>

---

## ℹ️ About

Stream Deck GIF Splitter takes any animated GIF and slices it into a perfectly sized tile grid that maps 1:1 to your Elgato Stream Deck buttons — giving you a full-screen animated background across your entire device.

All processing runs **100% client-side** using [FFmpeg.wasm](https://ffmpegwasm.netlify.app). No uploads, no servers, no account needed.

### 🔥 Key Features

- 🖱️ **Drag & drop** — Upload any GIF and see an instant cropped preview
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
| 🧹 Linting            | [ESLint 9](https://eslint.org) with TypeScript & React plugins                              |

## ⚙️ How It Works

```
┌────────────┐     ┌──────────────┐     ┌──────────────┐     ┌────────────┐
│  Drop GIF  │ ──▶ │  Crop & fit  │ ──▶ │  Split into  │ ──▶ │  Download  │
│             │     │  to device   │     │  tile grid   │     │  ZIP or    │
│             │     │  dimensions  │     │  (FFmpeg)    │     │  .sdProfile│
└────────────┘     └──────────────┘     └──────────────┘     └────────────┘
```

1. 📤 **Upload** — Drop a GIF or click to browse
2. ✂️ **Crop** — The GIF is automatically cropped and scaled to match your selected device's total button area (including optional gap compensation)
3. 🔪 **Split** — FFmpeg slices the cropped GIF into individual tile animations using two-pass encoding for optimal quality
4. 💾 **Export** — Download as a ZIP of numbered tiles or as a ready-to-install `.streamDeckProfile`

## 📁 Project Structure

```
src/
├── main.tsx                    # Entry point
├── index.css                   # Global styles & CSS variables
├── useFFmpeg.ts                # FFmpeg.wasm hook (crop, split, progress)
├── streamDeckProfile.ts        # .streamDeckProfile ZIP generator
├── shared/
│   ├── presets.ts              # Device preset configurations
│   └── useGifSplitter.ts       # Core business logic hook
└── designs/
    ├── Design5Hardware.tsx      # Main UI component
    └── Design5Hardware.css      # Industrial hardware-themed styles
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
