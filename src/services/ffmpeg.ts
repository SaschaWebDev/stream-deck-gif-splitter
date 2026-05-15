import { useRef, useCallback, useState } from 'react'
import { FFmpeg } from '@ffmpeg/ffmpeg'
import { toBlobURL, fetchFile } from '@ffmpeg/util'
import { buildScaleCropFilter, buildTrimArgs } from '../utils/crop'

export interface SplitResult {
  row: number
  col: number
  blob: Blob
  url: string
  filename: string
}

export interface SplitProgress {
  phase: 'loading' | 'palette' | 'splitting' | 'done'
  current: number
  total: number
}

const CORE_VERSION = '0.12.10'
const BASE_URL = `https://cdn.jsdelivr.net/npm/@ffmpeg/core@${CORE_VERSION}/dist/esm`

// Cache blob URLs at module level so multiple FFmpeg instances reuse them (no redundant network fetches)
let cachedBlobURLs: { coreURL: string; wasmURL: string } | null = null
let blobURLPromise: Promise<{ coreURL: string; wasmURL: string }> | null = null

async function getBlobURLs(): Promise<{ coreURL: string; wasmURL: string }> {
  if (cachedBlobURLs) return cachedBlobURLs
  if (blobURLPromise) return blobURLPromise

  blobURLPromise = (async () => {
    const urls = {
      coreURL: await toBlobURL(`${BASE_URL}/ffmpeg-core.js`, 'text/javascript'),
      wasmURL: await toBlobURL(`${BASE_URL}/ffmpeg-core.wasm`, 'application/wasm'),
    }
    cachedBlobURLs = urls
    return urls
  })()

  return blobURLPromise
}

export function useFFmpeg() {
  const ffmpegRef = useRef<FFmpeg | null>(null)
  const loadedRef = useRef(false)
  const loadingPromiseRef = useRef<Promise<void> | null>(null)
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState<SplitProgress | null>(null)

  const ensureLoaded = useCallback(async () => {
    if (loadedRef.current) return
    if (loadingPromiseRef.current) return loadingPromiseRef.current

    const promise = (async () => {
      setLoading(true)
      try {
        const ffmpeg = new FFmpeg()
        const urls = await getBlobURLs()
        await ffmpeg.load(urls)
        ffmpegRef.current = ffmpeg
        loadedRef.current = true
      } catch (e) {
        loadingPromiseRef.current = null
        throw e
      } finally {
        setLoading(false)
      }
    })()

    loadingPromiseRef.current = promise
    return promise
  }, [])

  /** Scale & crop the GIF to the given dimensions with high-quality two-pass palette. Optional cropX/cropY offset (default: center). Optional trimStart/trimEnd to trim temporal range. Returns a blob URL for preview. */
  const cropGif = useCallback(async (file: File, targetWidth: number, targetHeight: number, cropX?: number, cropY?: number, trimStart?: number, trimEnd?: number): Promise<string> => {
    await ensureLoaded()
    const ffmpeg = ffmpegRef.current!

    const scaleCrop = buildScaleCropFilter(targetWidth, targetHeight, cropX, cropY)
    const { pre: trimPre, out: trimOut } = buildTrimArgs(trimStart, trimEnd)

    const inputData = await fetchFile(file)
    await ffmpeg.writeFile('input.gif', inputData)

    // Pass 1: Generate optimal palette from the scaled+cropped frames
    await ffmpeg.exec([
      ...trimPre,
      '-i', 'input.gif',
      '-vf', `${scaleCrop},palettegen=stats_mode=full`,
      ...trimOut,
      '-y', 'crop_palette.png',
    ])

    // Pass 2: Re-encode with the optimal palette using best dithering
    await ffmpeg.exec([
      ...trimPre,
      '-i', 'input.gif',
      '-i', 'crop_palette.png',
      '-lavfi', `${scaleCrop} [x]; [x][1:v] paletteuse=dither=floyd_steinberg`,
      ...trimOut,
      '-y', 'cropped.gif',
    ])

    await ffmpeg.deleteFile('input.gif')
    await ffmpeg.deleteFile('crop_palette.png')

    const data = await ffmpeg.readFile('cropped.gif')
    const part: BlobPart = typeof data === 'string' ? data : new Uint8Array(data)
    const blob = new Blob([part], { type: 'image/gif' })
    return URL.createObjectURL(blob)
  }, [ensureLoaded])

  /** Split the already-cropped GIF (still in the virtual FS) into a grid. */
  const splitGif = useCallback(async (
    file: File,
    cols: number,
    rows: number,
    cellWidth: number,
    cellHeight: number,
    gap: number = 0,
  ): Promise<SplitResult[]> => {
    const ffmpeg = ffmpegRef.current!

    const total = rows * cols

    // Generate palette from the full cropped gif for consistent colors across all tiles
    setProgress({ phase: 'palette', current: 0, total })
    await ffmpeg.exec([
      '-i', 'cropped.gif',
      '-vf', 'palettegen=stats_mode=full',
      '-y', 'palette.png',
    ])

    // Crop each cell with palette-based encoding
    const results: SplitResult[] = []
    let count = 0
    const outExt = file.type === 'image/gif' ? 'gif' : 'png'
    const baseName = file.name.replace(/\.[^.]+$/i, '')

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        count++
        setProgress({ phase: 'splitting', current: count, total })

        const x = col * (cellWidth + gap)
        const y = row * (cellHeight + gap)
        const outName = `out_${row}_${col}.${outExt}`

        await ffmpeg.exec([
          '-i', 'cropped.gif',
          '-i', 'palette.png',
          '-lavfi',
          `crop=${cellWidth}:${cellHeight}:${x}:${y} [x]; [x][1:v] paletteuse=dither=floyd_steinberg`,
          '-y', outName,
        ])

        const data = await ffmpeg.readFile(outName)
        const part: BlobPart = typeof data === 'string' ? data : new Uint8Array(data)
        const blob = new Blob([part], { type: `image/${outExt}` })
        const url = URL.createObjectURL(blob)

        results.push({
          row,
          col,
          blob,
          url,
          filename: `${baseName}_${count}.${outExt}`,
        })

        await ffmpeg.deleteFile(outName)
      }
    }

    await ffmpeg.deleteFile('palette.png')

    setProgress({ phase: 'done', current: total, total })
    return results
  }, [])

  /** Build the xstack bezel filter chain: crop each tile from an input that has NO gaps,
   *  then re-stack them with `gap`-pixel black padding between cells. Terminal label is `outLabel`. */
  function buildBezelFilterChain(
    cols: number,
    rows: number,
    cellWidth: number,
    cellHeight: number,
    gap: number,
    outLabel: string,
  ): string {
    const total = rows * cols
    const parts: string[] = []
    let idx = 0
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const x = col * cellWidth
        const y = row * cellHeight
        parts.push(`[0:v]crop=${cellWidth}:${cellHeight}:${x}:${y}[c${idx}]`)
        idx++
      }
    }

    let inputsStr = ''
    for (let i = 0; i < total; i++) inputsStr += `[c${i}]`

    const layoutParams: string[] = []
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const x = col * (cellWidth + gap)
        const y = row * (cellHeight + gap)
        layoutParams.push(`${x}_${y}`)
      }
    }
    parts.push(`${inputsStr}xstack=inputs=${total}:layout=${layoutParams.join('|')}:fill=black[${outLabel}]`)

    return parts.join(';')
  }

  /** Generate a single padded static image wallpaper by extracting a frame (for GIF input)
   *  or using the cropped image directly (for static input), then xstacking the cells with
   *  black bezel padding. Output is always a truecolor PNG.
   *
   *  For GIF input, frameTime selects which frame becomes the static wallpaper. */
  const generateScreensaver = useCallback(async (
    file: File,
    cols: number,
    rows: number,
    cellWidth: number,
    cellHeight: number,
    gap: number,
    frameTime?: number,
  ): Promise<{ blob: Blob; url: string; filename: string }> => {
    const ffmpeg = ffmpegRef.current!

    const isGif = file.type === 'image/gif'
    const total = rows * cols

    setProgress({ phase: 'palette', current: 0, total })

    // GIF input: extract the user-selected frame to a static PNG.
    // Non-GIF input: cropped.gif is already a single static image, use it directly.
    const inputFile = isGif ? 'frame.png' : 'cropped.gif'
    if (isGif) {
      const t = Math.max(0, frameTime ?? 0)
      await ffmpeg.exec([
        '-ss', t.toFixed(3),
        '-i', 'cropped.gif',
        '-frames:v', '1',
        '-y', 'frame.png',
      ])
    }

    setProgress({ phase: 'splitting', current: 1, total })

    const filterChain = buildBezelFilterChain(cols, rows, cellWidth, cellHeight, gap, 'out')
    const outName = 'screensaver.png'

    await ffmpeg.exec([
      '-i', inputFile,
      '-filter_complex', filterChain,
      '-map', '[out]',
      '-y', outName,
    ])

    const data = await ffmpeg.readFile(outName)
    const part: BlobPart = typeof data === 'string' ? data : new Uint8Array(data)
    const blob = new Blob([part], { type: 'image/png' })
    const url = URL.createObjectURL(blob)

    if (isGif) await ffmpeg.deleteFile('frame.png')
    await ffmpeg.deleteFile(outName)

    setProgress({ phase: 'done', current: total, total })

    return {
      blob,
      url,
      filename: file.name.replace(/\.[^.]+$/i, '') + '_screensaver.png',
    }
  }, [])

  /** Generate an animated GIF wallpaper: applies the same bezel-gap xstack to every frame of
   *  cropped.gif, then quantizes with a two-pass palette so the output stays a reasonable size.
   *  Caller must ensure the input is animated (this is meaningless on a single-frame source). */
  const generateAnimatedScreensaver = useCallback(async (
    file: File,
    cols: number,
    rows: number,
    cellWidth: number,
    cellHeight: number,
    gap: number,
  ): Promise<{ blob: Blob; url: string; filename: string }> => {
    const ffmpeg = ffmpegRef.current!
    const total = rows * cols

    const bezelChain = buildBezelFilterChain(cols, rows, cellWidth, cellHeight, gap, 'stacked')

    setProgress({ phase: 'palette', current: 0, total })

    await ffmpeg.exec([
      '-i', 'cropped.gif',
      '-filter_complex', `${bezelChain};[stacked]palettegen=stats_mode=full[pal]`,
      '-map', '[pal]',
      '-y', 'wallpaper_palette.png',
    ])

    setProgress({ phase: 'splitting', current: 1, total })

    await ffmpeg.exec([
      '-i', 'cropped.gif',
      '-i', 'wallpaper_palette.png',
      '-filter_complex', `${bezelChain};[stacked][1:v]paletteuse=dither=floyd_steinberg[out]`,
      '-map', '[out]',
      '-y', 'wallpaper.gif',
    ])

    const data = await ffmpeg.readFile('wallpaper.gif')
    const part: BlobPart = typeof data === 'string' ? data : new Uint8Array(data)
    const blob = new Blob([part], { type: 'image/gif' })
    const url = URL.createObjectURL(blob)

    await ffmpeg.deleteFile('wallpaper_palette.png')
    await ffmpeg.deleteFile('wallpaper.gif')

    setProgress({ phase: 'done', current: total, total })

    return {
      blob,
      url,
      filename: file.name.replace(/\.[^.]+$/i, '') + '_screensaver_animated.gif',
    }
  }, [])

  /** Extract a single PNG frame from the already-cropped cropped.gif at the given timestamp.
   *  Used to show a static preview of the user-selected wallpaper frame. Reuses the shared
   *  FFmpeg instance — caller must ensure no other op is in flight. */
  const extractCroppedFrame = useCallback(async (time: number): Promise<string> => {
    const ffmpeg = ffmpegRef.current!
    const t = Math.max(0, time)
    await ffmpeg.exec([
      '-ss', t.toFixed(3),
      '-i', 'cropped.gif',
      '-frames:v', '1',
      '-y', 'preview_frame.png',
    ])
    const data = await ffmpeg.readFile('preview_frame.png')
    const part: BlobPart = typeof data === 'string' ? data : new Uint8Array(data)
    const blob = new Blob([part], { type: 'image/png' })
    const url = URL.createObjectURL(blob)
    await ffmpeg.deleteFile('preview_frame.png')
    return url
  }, [])

  /** Extract evenly-spaced snapshot frames from a GIF for filmstrip display.
   *  Uses a dedicated ephemeral FFmpeg instance to avoid corrupting the shared crop/split instance. */
  const extractFrames = useCallback(async (file: File, duration: number, count: number): Promise<string[]> => {
    // Create an isolated FFmpeg instance for filmstrip extraction
    const filmstripFFmpeg = new FFmpeg()
    const urls_blob = await getBlobURLs()
    await filmstripFFmpeg.load(urls_blob)

    try {
      const inputData = await fetchFile(file)
      await filmstripFFmpeg.writeFile('filmstrip_input.gif', inputData)

      const urls: string[] = []
      for (let i = 0; i < count; i++) {
        const timestamp = (duration * (i + 0.5)) / count
        const outName = `filmstrip_${i}.png`

        await filmstripFFmpeg.exec([
          '-ss', timestamp.toFixed(3),
          '-i', 'filmstrip_input.gif',
          '-frames:v', '1',
          '-vf', 'scale=-1:64:flags=lanczos',
          '-y', outName,
        ])

        try {
          const data = await filmstripFFmpeg.readFile(outName)
          const part: BlobPart = typeof data === 'string' ? data : new Uint8Array(data)
          const blob = new Blob([part], { type: 'image/png' })
          urls.push(URL.createObjectURL(blob))
          await filmstripFFmpeg.deleteFile(outName)
        } catch {
          // Frame extraction failed for this timestamp, skip
        }
      }

      await filmstripFFmpeg.deleteFile('filmstrip_input.gif')
      return urls
    } finally {
      filmstripFFmpeg.terminate()
    }
  }, [])

  /** Remove the cropped.gif from the virtual FS. */
  const cleanup = useCallback(async () => {
    if (!ffmpegRef.current) return
    try { await ffmpegRef.current.deleteFile('cropped.gif') } catch { /* already gone */ }
  }, [])

  const resetProgress = useCallback(() => {
    setProgress(null)
  }, [])

  return { loading, ensureLoaded, cropGif, splitGif, generateScreensaver, generateAnimatedScreensaver, extractCroppedFrame, extractFrames, cleanup, progress, resetProgress }
}
