'use client';

import { TableOfContents, type TocAnchor } from './table-of-contents';

interface ReadingTocProps {
  anchors: TocAnchor[];
}

export function ReadingToc({ anchors }: ReadingTocProps) {
  if (anchors.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-1/2 right-4 z-10 hidden -translate-y-1/2 md:right-8 md:block">
      <TableOfContents.ReadingProvider anchors={anchors}>
        <TableOfContents.Shell>
          <TableOfContents.Root>
            <TableOfContents.List />
          </TableOfContents.Root>
        </TableOfContents.Shell>
      </TableOfContents.ReadingProvider>
    </div>
  );
}
