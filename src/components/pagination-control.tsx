import type { Route } from 'next';

import { serializeSearchParams } from '@/lib/search-params';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from './ui/pagination';

function generatePagination(page: number, totalPages: number) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  if (page <= 3) {
    return [1, 2, 3, '…', totalPages - 1, totalPages];
  }

  if (page >= totalPages - 2) {
    return [1, 2, '…', totalPages - 2, totalPages - 1, totalPages];
  }

  return [1, '…', page - 1, page, page + 1, '…', totalPages];
}

type PaginationControlProps = {
  pathname: string;
  currentPage: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
} & React.ComponentProps<typeof Pagination>;

export async function PaginationControl({
  pathname,
  currentPage,
  totalPages,
  hasNext,
  hasPrev,
  ...props
}: PaginationControlProps) {
  const allPages = generatePagination(currentPage, totalPages);

  const createPageUrl = (page: number) => {
    return serializeSearchParams(pathname, { page }) as Route;
  };

  return (
    <Pagination {...props}>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            disabled={!hasPrev}
            href={createPageUrl(currentPage - 1)}
          />
        </PaginationItem>
        {allPages.map((p) =>
          p === '…' ? (
            <PaginationItem key={p}>
              <PaginationEllipsis />
            </PaginationItem>
          ) : typeof p === 'number' ? (
            <PaginationItem key={p}>
              <PaginationLink
                href={createPageUrl(p)}
                isActive={p === currentPage}
              >
                {p}
              </PaginationLink>
            </PaginationItem>
          ) : null,
        )}
        <PaginationItem>
          <PaginationNext
            disabled={!hasNext}
            href={createPageUrl(currentPage + 1)}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
