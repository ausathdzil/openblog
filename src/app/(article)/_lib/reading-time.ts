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
