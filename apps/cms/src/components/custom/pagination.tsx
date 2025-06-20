import { useState, useMemo, useEffect } from 'react';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from '@/components/ui/pagination';
import { cn } from '@/lib/utils';

interface PaginationComponentProps {
  /**
   * Current page (1-indexed)
   */
  page: number;
  /**
   * Number of items per page
   */
  pageSize: number;
  /**
   * Total number of items
   */
  total: number;
  /**
   * Called when the page changes
   */
  onChangePage: (page: number) => void;
  /**
   * Maximum number of page buttons to show
   * @default 5
   */
  maxPageButtons?: number;
  /**
   * Optional class name to apply to the pagination component
   */
  className?: string;
  /**
   * Whether to disable the pagination
   */
  disabled?: boolean;
}

/**
 * A pagination component that shows page numbers and navigation controls.
 * It automatically handles showing ellipsis when there are many pages.
 */
export function PaginationComponent({
  page,
  pageSize,
  total,
  onChangePage,
  maxPageButtons = 5,
  className,
  disabled = false,
}: PaginationComponentProps) {
  // Ensure page is within valid bounds (1 to totalPages)
  const [currentPage, setCurrentPage] = useState(page);

  // Calculate total number of pages
  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(total / pageSize));
  }, [total, pageSize]);

  // Update internal state when prop changes
  useEffect(() => {
    setCurrentPage(page);
  }, [page]);

  // Generate the array of page numbers to display
  const pageNumbers = useMemo(() => {
    // Always show first and last page
    const result: (number | 'ellipsis')[] = [];

    // Determine the range of pages to show around the current page
    const halfButtons = Math.floor(maxPageButtons / 2);
    let startPage = Math.max(1, currentPage - halfButtons);
    const endPage = Math.min(totalPages, startPage + maxPageButtons - 1);

    // Adjust the start page if we're near the end
    if (endPage - startPage + 1 < maxPageButtons) {
      startPage = Math.max(1, endPage - maxPageButtons + 1);
    }

    // Add first page if not included in range
    if (startPage > 1) {
      result.push(1);
      if (startPage > 2) {
        result.push('ellipsis');
      }
    }

    // Add page numbers in range
    for (let i = startPage; i <= endPage; i++) {
      result.push(i);
    }

    // Add last page if not included in range
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        result.push('ellipsis');
      }
      result.push(totalPages);
    }

    return result;
  }, [currentPage, totalPages, maxPageButtons]);

  // Handle page change
  const handleChangePage = (newPage: number) => {
    if (newPage === currentPage || newPage < 1 || newPage > totalPages || disabled) return;

    setCurrentPage(newPage);
    onChangePage(newPage);
  };

  return (
    <Pagination className={cn('py-4', className)}>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            onClick={() => handleChangePage(currentPage - 1)}
            className={cn(
              'cursor-pointer',
              (currentPage <= 1 || disabled) && 'pointer-events-none opacity-50',
            )}
          />
        </PaginationItem>

        {pageNumbers.map((pageNumber, index) => {
          if (pageNumber === 'ellipsis') {
            return (
              <PaginationItem key={`ellipsis-${index}`}>
                <PaginationEllipsis />
              </PaginationItem>
            );
          }

          return (
            <PaginationItem key={pageNumber}>
              <PaginationLink
                isActive={pageNumber === currentPage}
                onClick={() => {
                  if (pageNumber === currentPage || disabled) return;
                  handleChangePage(pageNumber);
                }}
                className={cn(
                  'cursor-pointer',
                  disabled && 'pointer-events-none opacity-50',
                  pageNumber === currentPage && 'font-bold cursor-default',
                )}
              >
                {pageNumber}
              </PaginationLink>
            </PaginationItem>
          );
        })}

        <PaginationItem>
          <PaginationNext
            onClick={() => handleChangePage(currentPage + 1)}
            className={cn(
              'cursor-pointer',
              (currentPage >= totalPages || disabled) && 'pointer-events-none opacity-50',
            )}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}

export default PaginationComponent;
