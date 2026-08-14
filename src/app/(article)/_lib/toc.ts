import { generateSlug } from '@/app/elysia/modules/utils';

/**
 * Deterministic getId for @tiptap/extension-table-of-contents.
 * Exported for reuse when configuring TableOfContents on both client and server.
 */
export function createDeterministicGetId() {
  const counts = new Map<string, number>();
  return (textContent: string): string => {
    const base = (generateSlug(textContent) || 'heading').slice(0, 64);
    const count = counts.get(base) ?? 0;
    counts.set(base, count + 1);
    return count === 0 ? base : `${base}-${count + 1}`;
  };
}
