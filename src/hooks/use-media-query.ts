'use client';

import { useSyncExternalStore } from 'react';

export function useMediaQuery(query: string): boolean {
  const subscribe = (callback: () => void) => {
    if (typeof window === 'undefined') {
      return () => {
        // no-op
      };
    }

    const mql = window.matchMedia(query);

    const handler = () => {
      callback();
    };

    if (typeof mql.addEventListener === 'function') {
      mql.addEventListener('change', handler);
      return () => {
        mql.removeEventListener('change', handler);
      };
    }

    // Safari < 14 fallback
    const legacyMql = mql as unknown as {
      addListener: (cb: () => void) => void;
      removeListener: (cb: () => void) => void;
    };
    legacyMql.addListener(handler);
    return () => {
      legacyMql.removeListener(handler);
    };
  };

  const getSnapshot = () => {
    if (typeof window === 'undefined') {
      return false;
    }
    return window.matchMedia(query).matches;
  };

  const getServerSnapshot = () => false;

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
