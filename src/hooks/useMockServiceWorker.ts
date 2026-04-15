import { useEffect, useState } from 'react';
import { worker } from '../mocks/browser';

export function useMockServiceWorker() {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if we should use real API (production or when API_URL is set)
    const useRealApi = import.meta.env.VITE_USE_REAL_API === 'true' || 
                       import.meta.env.VITE_API_URL?.startsWith('http');

    if (useRealApi) {
      console.log('[MSW] Using real API, skipping mock worker');
      setIsReady(true);
      return;
    }

    // Start MSW in development
    worker.start({
      onUnhandledRequest: 'bypass',
    })
      .then(() => {
        console.log('[MSW] Mock worker started');
        setIsReady(true);
      })
      .catch((err) => {
        console.warn('[MSW] Failed to start mock worker:', err);
        setError(err.message);
        // Don't block rendering - continue without mocks
        setIsReady(true);
      });
  }, []);

  return { isReady, error };
}