import type { JSONContent } from '@tiptap/react';

const WORDS_PER_MINUTE = 200;
const WHITESPACE_REGEX = /\s+/;

export function getWordCount(
  contentJson: JSONContent | null | undefined
): number {
  if (!contentJson) {
    return 0;
  }
  return countWordsInNode(contentJson);
}

function countWordsInNode(node: JSONContent): number {
  let count = 0;

  if (node.text) {
    count += node.text.split(WHITESPACE_REGEX).filter(Boolean).length;
  }

  if (node.content) {
    for (const child of node.content) {
      count += countWordsInNode(child);
    }
  }

  return count;
}

export function getReadingTime(
  contentJson: JSONContent | null | undefined
): string {
  const words = getWordCount(contentJson);
  const minutes = Math.max(1, Math.ceil(words / WORDS_PER_MINUTE));
  return `${minutes} min read`;
}

// ---------------------------------------------------------------------------
// TOC helpers — shared between editor and reading page (JSON-based, no DOM)
// ---------------------------------------------------------------------------

export interface TocAnchorJson {
  id: string;
  level: number;
  originalLevel: number;
  textContent: string;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 64);
}

export function getHeadingsFromJson(
  contentJson: JSONContent | null | undefined
): TocAnchorJson[] {
  if (!contentJson?.content) {
    return [];
  }

  const anchors: TocAnchorJson[] = [];
  const slugCounts = new Map<string, number>();

  function pushHeading(node: JSONContent) {
    const level = node.attrs?.level as number | undefined;
    if (level === undefined || level < 1 || level > 3) {
      return;
    }
    const textContent = extractText(node);
    if (textContent.trim().length === 0) {
      return;
    }
    const base = slugify(textContent) || 'heading';
    const count = slugCounts.get(base) ?? 0;
    slugCounts.set(base, count + 1);
    const id = count === 0 ? base : `${base}-${count + 1}`;
    anchors.push({
      id,
      textContent,
      level,
      originalLevel: level,
    });
  }

  function traverse(node: JSONContent) {
    if (node.type === 'heading' && node.content) {
      pushHeading(node);
    }

    if (node.content) {
      for (const child of node.content) {
        traverse(child);
      }
    }
  }

  traverse(contentJson);

  return anchors;
}

function extractText(node: JSONContent): string {
  if (node.text) {
    return node.text;
  }
  if (!node.content) {
    return '';
  }
  return node.content.map(extractText).join('');
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
    const base = slugify(textContent) || 'heading';
    const count = counts.get(base) ?? 0;
    counts.set(base, count + 1);
    return count === 0 ? base : `${base}-${count + 1}`;
  };
}
