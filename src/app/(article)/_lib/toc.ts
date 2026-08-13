import type { JSONContent } from '@tiptap/react';

import { generateSlug } from '@/app/elysia/modules/utils';

export interface TocAnchorJson {
  id: string;
  level: number;
  originalLevel: number;
  textContent: string;
}

export function getHeadingsFromJson(
  contentJson: JSONContent | null | undefined
): TocAnchorJson[] {
  if (!contentJson?.content) {
    return [];
  }

  const anchors: TocAnchorJson[] = [];
  const slugCounts = new Map<string, number>();

  const pushHeading = (node: JSONContent) => {
    const level = node.attrs?.level as number | undefined;
    if (level === undefined || level < 1 || level > 3) {
      return;
    }
    const textContent = extractText(node);
    if (textContent.trim().length === 0) {
      return;
    }
    const base = (generateSlug(textContent) || 'heading').slice(0, 64);
    const count = slugCounts.get(base) ?? 0;
    slugCounts.set(base, count + 1);
    const id = count === 0 ? base : `${base}-${count + 1}`;
    anchors.push({
      id,
      textContent,
      level,
      originalLevel: level,
    });
  };

  const traverse = (node: JSONContent) => {
    if (node.type === 'heading' && node.content) {
      pushHeading(node);
    }

    if (node.content) {
      for (const child of node.content) {
        traverse(child);
      }
    }
  };

  const extractText = (node: JSONContent): string => {
    if (node.text) {
      return node.text;
    }
    if (!node.content) {
      return '';
    }
    return node.content.map(extractText).join('');
  };

  traverse(contentJson);

  return anchors;
}

/**
 * Deterministic getId for @tiptap/extension-table-of-contents.
 * Uses slugify + dedup counter matching getHeadingsFromJson so that
 * generateTocIds on the server produces identical ids.
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
