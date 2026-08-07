import { useSyncExternalStore } from 'react';

function subscribe() {
  return () => {
    // no-op
  };
}

const MAC_REGEX = /Mac/;

function getSnapshot() {
  return typeof window === 'undefined'
    ? false
    : MAC_REGEX.test(window.navigator.userAgent);
}

function getServerSnapshot() {
  return false;
}

export function useMac() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
