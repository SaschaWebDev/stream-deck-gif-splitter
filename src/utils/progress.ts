import type { SplitProgress } from '../services/ffmpeg';

export function getProgressLabel(progress: SplitProgress | null): string {
  if (!progress) return '';
  switch (progress.phase) {
    case 'loading': return 'Loading ffmpeg...';
    case 'palette': return 'Generating palette...';
    case 'splitting': return `Splitting tile ${progress.current} of ${progress.total}...`;
    case 'done': return 'Done!';
  }
}
