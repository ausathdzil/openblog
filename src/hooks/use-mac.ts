import { useEffect, useState } from 'react';

export function useMac() {
  const [isMac, setIsMac] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsMac(/Mac/.test(window.navigator.userAgent));
    }
  }, []);

  return !!isMac;
}
