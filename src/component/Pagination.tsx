import type { PaginationState } from '../types/telemetry';

interface PaginationProps {
  pagination: PaginationState;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (itemsPerPage: number) => void;
}

/**
 * Pagination component with keyboard navigation support
 */
export function Pagination({
  pagination,
  onPageChange,
  onItemsPerPageChange,
}: PaginationProps) {
  const { currentPage, totalPages, itemsPerPage } = pagination;

//   const handleKeyDown = (e: React.KeyboardEvent, action: () => void) => {
//     if (e.key === 'Enter' || e.key === ' ') {
//       e.preventDefault();
//       action();
//     }
//   };

  return (
    <div className="pagination" role="navigation" aria-label="Pagination">
      <div className="pagination-controls">
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className="btn-pagination"
          aria-label="Go to first page"
          title="First page"
        >
          ««
        </button>
        
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="btn-pagination"
          aria-label="Go to previous page"
          title="Previous page"
        >
          «
        </button>

        <span className="pagination-info" aria-live="polite">
          Page {currentPage} of {totalPages}
        </span>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="btn-pagination"
          aria-label="Go to next page"
          title="Next page"
        >
          »
        </button>
        
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="btn-pagination"
          aria-label="Go to last page"
          title="Last page"
        >
          »»
        </button>
      </div>

      <div className="items-per-page">
        <label htmlFor="items-per-page-select">
          Rows per page:
          <select
            id="items-per-page-select"
            value={itemsPerPage}
            onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
            className="select-small"
            aria-label="Select number of rows per page"
          >
            <option value="25">25</option>
            <option value="50">50</option>
            <option value="100">100</option>
            <option value="250">250</option>
          </select>
        </label>
      </div>
    </div>
  );
}