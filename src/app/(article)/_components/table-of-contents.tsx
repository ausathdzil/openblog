'use client';

import type { Editor } from '@tiptap/react';
import { createContext, use } from 'react';

import { cn } from '@/lib/utils';

export interface TocAnchor {
  id: string;
  isActive: boolean;
  isScrolledOver: boolean;
  itemIndex: number;
  level: number;
  originalLevel: number;
  pos: number;
  textContent: string;
}

interface TocState {
  anchors: TocAnchor[];
}

interface TocActions {
  scrollToId: (id: string) => void;
}

interface TocMeta {
  editor?: Editor | null;
}

interface TocContextValue {
  actions: TocActions;
  meta: TocMeta;
  state: TocState;
}

const TocContext = createContext<TocContextValue | null>(null);

interface TocProviderProps {
  anchors: TocAnchor[];
  children: React.ReactNode;
  editor?: Editor | null;
}

function TocProvider({ children, anchors, editor }: TocProviderProps) {
  const scrollToId = (id: string) => {
    const anchor = anchors.find((a) => a.id === id);
    if (editor && anchor) {
      try {
        editor
          .chain()
          .focus()
          .setTextSelection(anchor.pos)
          .scrollIntoView()
          .run();
        return;
        // biome-ignore lint/suspicious/noEmptyBlockStatements: intentional fallthrough to DOM fallback
      } catch {}
    }
    const el =
      document.querySelector(`[data-toc-id="${CSS.escape(id)}"]`) ??
      document.getElementById(id);
    el?.scrollIntoView({ block: 'start' });
    if (el) {
      history.replaceState(null, '', `#${id}`);
    }
  };

  return (
    <TocContext
      value={{
        state: { anchors },
        actions: { scrollToId },
        meta: { editor },
      }}
    >
      {children}
    </TocContext>
  );
}

function EditorTocProvider({
  children,
  anchors,
  editor,
}: {
  children: React.ReactNode;
  anchors: TocAnchor[];
  editor?: Editor | null;
}) {
  return (
    <TocProvider anchors={anchors} editor={editor}>
      {children}
    </TocProvider>
  );
}

function ReadingTocProvider({
  children,
  anchors,
}: {
  children: React.ReactNode;
  anchors: TocAnchor[];
}) {
  return <TocProvider anchors={anchors}>{children}</TocProvider>;
}

function TocRoot({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ctx = use(TocContext);
  const hasAnchors =
    ctx?.state.anchors.filter(
      (a) => a.originalLevel >= 1 && a.originalLevel <= 3
    ).length ?? 0;

  if (ctx && hasAnchors === 0) {
    return null;
  }

  return (
    <nav
      aria-label="Table of contents"
      className={cn(
        'rounded-lg border bg-popover p-3 shadow-md',
        'max-h-[60vh] w-64 overflow-auto',
        className
      )}
    >
      {children}
    </nav>
  );
}

function TocHeader({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-3 font-medium text-[11px] text-muted-foreground/60 uppercase tracking-widest">
      {children}
    </div>
  );
}

function TocList() {
  const ctx = use(TocContext);
  if (!ctx) {
    throw new Error('TocList must be used within TocProvider');
  }
  const filtered = ctx.state.anchors.filter(
    (a) => a.originalLevel >= 1 && a.originalLevel <= 3
  );
  if (filtered.length === 0) {
    return null;
  }
  return (
    <ul className="flex flex-col gap-0.5">
      {filtered.map((anchor) => (
        <TocItem anchor={anchor} key={anchor.id} />
      ))}
    </ul>
  );
}

function TocItem({ anchor }: { anchor: TocAnchor }) {
  const ctx = use(TocContext);
  if (!ctx) {
    throw new Error('TocItem must be used within TocProvider');
  }
  const indentMap: Record<number, string> = {
    1: 'pl-2',
    2: 'pl-4',
    3: 'pl-6',
  };
  const indent = indentMap[anchor.originalLevel] ?? 'pl-2';
  return (
    <li className="min-w-0">
      <a
        className={cn(
          'block truncate rounded-md px-2 py-1.5 text-muted-foreground text-sm hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          indent,
          anchor.isActive && 'bg-muted font-medium text-foreground'
        )}
        href={`#${anchor.id}`}
        onClick={(e) => {
          e.preventDefault();
          ctx.actions.scrollToId(anchor.id);
        }}
      >
        {anchor.textContent}
      </a>
    </li>
  );
}

function TocLines() {
  const ctx = use(TocContext);
  if (!ctx) {
    throw new Error('TocLines must be used within TocProvider');
  }
  const filtered = ctx.state.anchors.filter(
    (a) => a.originalLevel >= 1 && a.originalLevel <= 3
  );
  if (filtered.length === 0) {
    return null;
  }
  return (
    <div
      aria-hidden="true"
      className={cn(
        'peer -mr-6 flex flex-col items-end gap-2 py-2 pr-6',
        'opacity-60'
      )}
    >
      {filtered.map((anchor) => (
        <button
          aria-label={anchor.textContent}
          className={cn(
            'h-0.5 w-4 rounded-full bg-muted-foreground/40 hover:bg-muted-foreground',
            anchor.isActive && 'bg-foreground'
          )}
          key={anchor.id}
          onClick={() => ctx.actions.scrollToId(anchor.id)}
          tabIndex={-1}
          type="button"
        />
      ))}
    </div>
  );
}

function TocShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative">
      <TocLines />
      <div className="pointer-events-none absolute top-1/2 right-0 -translate-y-1/2 opacity-0 hover:pointer-events-auto hover:opacity-100 peer-hover:pointer-events-auto peer-hover:opacity-100">
        {children}
      </div>
    </div>
  );
}

export const TableOfContents = {
  Provider: TocProvider,
  EditorProvider: EditorTocProvider,
  ReadingProvider: ReadingTocProvider,
  Context: TocContext,
  Root: TocRoot,
  Header: TocHeader,
  List: TocList,
  Item: TocItem,
  Lines: TocLines,
  Shell: TocShell,
};
