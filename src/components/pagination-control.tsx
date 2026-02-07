'use client';

import { useQueryStates } from 'nuqs';
import { useTransition } from 'react';

import { searchParamsParser } from '@/lib/search-params';
import { TopLoader } from './top-loader';
import {
  Pagination,
  PaginationButton,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationNextButton,
  PaginationPreviousButton,
} from './ui/pagination';

type PaginationControlProps = {
  pathname: string;
  currentPage: number;
  totalPages: number;
} & React.ComponentProps<typeof Pagination>;

export function PaginationControl({
  pathname,
  currentPage,
  totalPages,
  ...props
}: PaginationControlProps) {
  const [isPending, startTransition] = useTransition();
  const [{ page }, setSearchParams] = useQueryStates(searchParamsParser);

  const allPages = generatePagination(page, totalPages);

  const handlePageChange = (page: number) => {
    startTransition(async () => {
      await setSearchParams({ page }, { startTransition });
    });
  };

  return (
    <>
      <Pagination {...props}>
        <PaginationContent>
          <PaginationItem>
            <PaginationPreviousButton
              disabled={page === 1}
              onClick={() => handlePageChange(page - 1)}
            />
          </PaginationItem>
          {allPages.map((p) =>
            p === '…' ? (
              <PaginationItem key={p}>
                <PaginationEllipsis />
              </PaginationItem>
            ) : typeof p === 'number' ? (
              <PaginationItem key={p}>
                <PaginationButton
                  isActive={p === page}
                  onClick={() => handlePageChange(p)}
                >
                  {p}
                </PaginationButton>
              </PaginationItem>
            ) : null
          )}
          <PaginationItem>
            <PaginationNextButton
              disabled={page === totalPages}
              onClick={() => handlePageChange(page + 1)}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
      <TopLoader isPending={isPending} />
    </>
  );
}

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
