'use client';

import { useSyncExternalStore } from 'react';

export function useKeyboardInset(): number {
  const subscribe = (callback: () => void) => {
    const viewport = window.visualViewport;

    if (!viewport) {
      return () => {
        // no-op
      };
    }

    viewport.addEventListener('resize', callback);
    viewport.addEventListener('scroll', callback);
    window.addEventListener('resize', callback);
    window.addEventListener('scroll', callback, { passive: true });

    return () => {
      viewport.removeEventListener('resize', callback);
      viewport.removeEventListener('scroll', callback);
      window.removeEventListener('resize', callback);
      window.removeEventListener('scroll', callback);
    };
  };

  const getSnapshot = () => {
    if (typeof window === 'undefined') {
      return 0;
    }

    const viewport = window.visualViewport;

    if (!viewport) {
      return 0;
    }

    return Math.max(
      0,
      window.innerHeight - viewport.height - viewport.offsetTop
    );
  };

  const getServerSnapshot = () => 0;

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
