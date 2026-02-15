import { useEffect, useRef } from 'react';

export function useAutoScroll(isSplitting: boolean) {
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isSplitting && resultsRef.current) {
      resultsRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [isSplitting]);

  return resultsRef;
}
