'use client';

import { useEffect } from 'react';

export function BeforeUnloadGuard({ isDirty }: { isDirty: boolean }) {
  useEffect(() => {
    if (!isDirty) {
      return;
    }

    const handle = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };

    window.addEventListener('beforeunload', handle);
    return () => {
      window.removeEventListener('beforeunload', handle);
    };
  }, [isDirty]);

  return null;
}
