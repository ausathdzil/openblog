import { useSyncExternalStore } from 'react';

const MAC_REGEX = /Mac/;

export function useMac() {
  const subscribe = () => {
    return () => {
      // no-op
    };
  };

  const getSnapshot = () =>
    typeof window === 'undefined'
      ? false
      : MAC_REGEX.test(window.navigator.userAgent);

  const getServerSnapshot = () => false;

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
