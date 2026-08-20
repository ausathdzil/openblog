'use client';

import { useEffect, useRef, useState } from 'react';

import { TableOfContents, type TocAnchor } from './table-of-contents';

interface ReadingTocProps {
  anchors: TocAnchor[];
}

export function ReadingToc({ anchors }: ReadingTocProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [scrolledOverIds, setScrolledOverIds] = useState<string[]>([]);
  const isClickScrollingRef = useRef(false);
  const clickTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (anchors.length === 0) {
      return;
    }

    const update = () => {
      // biome-ignore lint/suspicious/noUnnecessaryConditions: ref is mutated on click to pause scroll sync
      if (isClickScrollingRef.current) {
        return;
      }

      const { scrollY } = window;
      let active: string | null = null;
      const scrolled: string[] = [];

      for (const anchor of anchors) {
        const escapedId =
          typeof CSS !== 'undefined' && typeof CSS.escape === 'function'
            ? CSS.escape(anchor.id)
            : anchor.id;
        const el =
          (document.querySelector(
            `[data-toc-id="${escapedId}"]`
          ) as HTMLElement | null) ??
          (document.getElementById(anchor.id) as HTMLElement | null);

        if (!el) {
          continue;
        }

        const offset = el.offsetTop;

        if (scrollY >= offset) {
          active = anchor.id;
          scrolled.push(anchor.id);
        }
      }

      setActiveId(active);
      setScrolledOverIds(scrolled);
    };

    window.addEventListener('scroll', update, { passive: true });
    const frame = window.requestAnimationFrame(update);

    return () => {
      window.removeEventListener('scroll', update);
      window.cancelAnimationFrame(frame);
    };
  }, [anchors]);

  useEffect(
    () => () => {
      if (clickTimeoutRef.current !== null) {
        window.clearTimeout(clickTimeoutRef.current);
      }
    },
    []
  );

  const handleTocClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement;
    const anchorEl = target.closest('a[href^="#"]') as HTMLAnchorElement | null;
    let id: string | null = null;

    if (anchorEl) {
      id = anchorEl.getAttribute('href')?.slice(1) ?? null;
    } else {
      const buttonEl = target.closest(
        'button[aria-label]'
      ) as HTMLButtonElement | null;
      if (buttonEl) {
        const label = buttonEl.getAttribute('aria-label');
        const found = anchors.find((a) => a.textContent === label);
        id = found?.id ?? null;
      }
    }

    if (!id) {
      return;
    }

    const idx = anchors.findIndex((a) => a.id === id);
    if (idx === -1) {
      return;
    }

    isClickScrollingRef.current = true;
    setActiveId(id);
    setScrolledOverIds(anchors.slice(0, idx + 1).map((a) => a.id));

    if (clickTimeoutRef.current !== null) {
      window.clearTimeout(clickTimeoutRef.current);
    }
    clickTimeoutRef.current = window.setTimeout(() => {
      isClickScrollingRef.current = false;
      window.dispatchEvent(new Event('scroll'));
    }, 800);
  };

  const scrolledOverSet = new Set(scrolledOverIds);

  const activeAnchors = anchors.map((anchor) => ({
    ...anchor,
    isActive: anchor.id === activeId,
    isScrolledOver: scrolledOverSet.has(anchor.id),
  }));

  if (activeAnchors.length === 0) {
    return null;
  }

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: container delegates clicks to inner TOC links/buttons for immediate highlight
    // biome-ignore lint/a11y/noNoninteractiveElementInteractions: same reason
    // biome-ignore lint/a11y/useKeyWithClickEvents: keyboard activation handled by inner links/buttons
    <div
      className="fixed top-1/2 right-4 z-10 hidden -translate-y-1/2 md:right-8 md:block"
      onClick={handleTocClick}
    >
      <TableOfContents.ReadingProvider anchors={activeAnchors}>
        <TableOfContents.Shell>
          <TableOfContents.Root>
            <TableOfContents.List />
          </TableOfContents.Root>
        </TableOfContents.Shell>
      </TableOfContents.ReadingProvider>
    </div>
  );
}
