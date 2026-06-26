import { useSyncExternalStore } from 'react';

function subscribe() {
  return () => {
    // no-op
  };
}

function getSnapshot() {
  return typeof window === 'undefined'
    ? false
    : /Mac/.test(window.navigator.userAgent);
}

function getServerSnapshot() {
  return false;
}

export function useMac() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
