import { useState, useEffect, useRef } from 'react';

interface UseDelayedLoadingOptions {
  delay?: number;
  minDisplayTime?: number;
}

export function useDelayedLoading<T>(
  data: T,
  options: UseDelayedLoadingOptions = {}
): { data: T | null; isLoading: boolean } {
  const { delay = 1500, minDisplayTime = 800 } = options;
  const [isLoading, setIsLoading] = useState(true);
  const [delayedData, setDelayedData] = useState<T | null>(null);
  const startTimeRef = useRef<number>(Date.now());
  const hasLoadedRef = useRef(false);

  useEffect(() => {
    if (hasLoadedRef.current) return;

    const timer = setTimeout(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const remaining = Math.max(0, minDisplayTime - elapsed);

      setTimeout(() => {
        setDelayedData(data);
        setIsLoading(false);
        hasLoadedRef.current = true;
      }, remaining);
    }, delay);

    return () => clearTimeout(timer);
  }, [data, delay, minDisplayTime]);

  return { data: delayedData, isLoading };
}
