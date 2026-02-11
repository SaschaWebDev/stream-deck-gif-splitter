import { useRef, useState, useCallback } from 'react'
import { FFmpeg } from '@ffmpeg/ffmpeg'
import { toBlobURL, fetchFile } from '@ffmpeg/util'

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

export function useFFmpeg() {
  const ffmpegRef = useRef<FFmpeg | null>(null)
  const [loaded, setLoaded] = useState(false)
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState<SplitProgress | null>(null)

  const ensureLoaded = useCallback(async () => {
    if (ffmpegRef.current && loaded) return
    setLoading(true)

    const ffmpeg = new FFmpeg()
    ffmpegRef.current = ffmpeg

    await ffmpeg.load({
      coreURL: await toBlobURL(`${BASE_URL}/ffmpeg-core.js`, 'text/javascript'),
      wasmURL: await toBlobURL(`${BASE_URL}/ffmpeg-core.wasm`, 'application/wasm'),
    })

    setLoaded(true)
    setLoading(false)
  }, [loaded])

  /** Scale & center-crop the GIF to the given dimensions with high-quality two-pass palette. Returns a blob URL for preview. */
  const cropGif = useCallback(async (file: File, targetWidth: number, targetHeight: number): Promise<string> => {
    await ensureLoaded()
    const ffmpeg = ffmpegRef.current!

    const scaleCrop = `scale=${targetWidth}:${targetHeight}:force_original_aspect_ratio=increase:flags=lanczos,crop=${targetWidth}:${targetHeight}`

    const inputData = await fetchFile(file)
    await ffmpeg.writeFile('input.gif', inputData)

    // Pass 1: Generate optimal palette from the scaled+cropped frames
    await ffmpeg.exec([
      '-i', 'input.gif',
      '-vf', `${scaleCrop},palettegen=stats_mode=full`,
      '-y', 'crop_palette.png',
    ])

    // Pass 2: Re-encode with the optimal palette using best dithering
    await ffmpeg.exec([
      '-i', 'input.gif',
      '-i', 'crop_palette.png',
      '-lavfi', `${scaleCrop} [x]; [x][1:v] paletteuse=dither=floyd_steinberg`,
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
    filename: string,
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
    const baseName = filename.replace(/\.gif$/i, '')

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        count++
        setProgress({ phase: 'splitting', current: count, total })

        const x = col * (cellWidth + gap)
        const y = row * (cellHeight + gap)
        const outName = `out_${row}_${col}.gif`

        await ffmpeg.exec([
          '-i', 'cropped.gif',
          '-i', 'palette.png',
          '-lavfi',
          `crop=${cellWidth}:${cellHeight}:${x}:${y} [x]; [x][1:v] paletteuse=dither=floyd_steinberg`,
          '-y', outName,
        ])

        const data = await ffmpeg.readFile(outName)
        const part: BlobPart = typeof data === 'string' ? data : new Uint8Array(data)
        const blob = new Blob([part], { type: 'image/gif' })
        const url = URL.createObjectURL(blob)

        results.push({
          row,
          col,
          blob,
          url,
          filename: `${baseName}_${count}.gif`,
        })

        await ffmpeg.deleteFile(outName)
      }
    }

    await ffmpeg.deleteFile('palette.png')

    setProgress({ phase: 'done', current: total, total })
    return results
  }, [])

  /** Remove the cropped.gif from the virtual FS. */
  const cleanup = useCallback(async () => {
    if (!ffmpegRef.current) return
    try { await ffmpegRef.current.deleteFile('cropped.gif') } catch { /* already gone */ }
  }, [])

  const resetProgress = useCallback(() => {
    setProgress(null)
  }, [])

  return { loaded, loading, ensureLoaded, cropGif, splitGif, cleanup, progress, resetProgress }
}
