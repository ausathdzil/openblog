'use client';

import type * as React from 'react';
import { useSyncExternalStore } from 'react';

import { Header } from '@/components/header';
import { Large } from '@/components/typography';
import { cn } from '@/lib/utils';

export function HeaderTitle({ children }: { children: React.ReactNode }) {
  const isScrolled = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );

  return (
    <Header.Center
      className={cn(
        'hidden transition-opacity sm:block',
        isScrolled ? 'opacity-100' : 'opacity-0'
      )}
    >
      <Large className="line-clamp-1">{children}</Large>
    </Header.Center>
  );
}

function subscribe(callback: () => void) {
  if (typeof window === 'undefined') {
    return () => {
      // no-op
    };
  }
  window.addEventListener('scroll', callback, { passive: true });
  return () => {
    window.removeEventListener('scroll', callback);
  };
}

function getSnapshot() {
  if (typeof window === 'undefined') {
    return false;
  }
  const y =
    window.scrollY ||
    document.documentElement.scrollTop ||
    document.body.scrollTop ||
    0;
  return y > 80;
}

function getServerSnapshot() {
  return false;
}
