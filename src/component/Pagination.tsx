import { COLORS } from "../utils/dataGenerator";

interface PaginationProps {
  filteredEvents: any[];
  pageSize: number;
  setPageSize: (size: number) => void;
  setCurrentPage: (page: number) => void;
  currentPage: number;
  totalPages: number;
}

/**
 * Pagination component with keyboard navigation support
 */
export function Pagination({
  filteredEvents,
  pageSize,
  setPageSize,
  setCurrentPage,
  currentPage,
  totalPages,
}: PaginationProps) {
  const generatePageNumbers = () => {
    const pages = [];
    const maxVisible = 7;
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 4) {
        for (let i = 1; i <= 5; i++) pages.push(i);
        pages.push("...");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 3) {
        pages.push(1);
        pages.push("...");
        for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push("...");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push("...");
        pages.push(totalPages);
      }
    }
    return pages;
  };

  return (
    <div
      style={{
        padding: "20px 24px",
        borderTop: `1px solid ${COLORS.border}`,
        background: COLORS.surfaceAlt,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: 16,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          flexWrap: "wrap",
        }}
      >
        <div style={{ fontSize: 13, color: COLORS.textLight }}>
          Showing {(currentPage - 1) * pageSize + 1} to{" "}
          {Math.min(currentPage * pageSize, filteredEvents.length)} of{" "}
          {filteredEvents.length} events
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <label
            style={{
              fontSize: 13,
              color: COLORS.textLight,
              fontWeight: 500,
            }}
          >
            Items per page:
          </label>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            style={{
              padding: "8px 12px",
              border: `1.5px solid ${COLORS.border}`,
              borderRadius: "6px",
              background: COLORS.surface,
              color: COLORS.text,
              fontSize: 13,
              fontWeight: 500,
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = COLORS.primary;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = COLORS.border;
            }}
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
      </div>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <button
          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          style={{
            padding: "8px 12px",
            border: `1px solid ${COLORS.border}`,
            borderRadius: "6px",
            background: COLORS.surface,
            color: COLORS.text,
            cursor: currentPage === 1 ? "not-allowed" : "pointer",
            fontSize: 13,
            fontWeight: 500,
            transition: "all 0.2s ease",
            opacity: currentPage === 1 ? 0.5 : 1,
          }}
          onMouseEnter={(e) => {
            if (currentPage > 1) {
              e.currentTarget.style.borderColor = COLORS.primary;
              e.currentTarget.style.backgroundColor = `rgba(99, 102, 241, 0.05)`;
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = COLORS.border;
            e.currentTarget.style.backgroundColor = COLORS.surface;
          }}
        >
          ← Previous
        </button>

        <div style={{ display: "flex", gap: 4 }}>
          {generatePageNumbers().map((page, idx) =>
            page === "..." ? (
              <span
                key={`ellipsis-${idx}`}
                style={{
                  padding: "8px 12px",
                  color: COLORS.textLight,
                  fontSize: 13,
                }}
              >
                ...
              </span>
            ) : (
              <button
                key={page}
                onClick={() => setCurrentPage(page as number)}
                style={{
                  padding: "8px 12px",
                  border: `1px solid ${currentPage === page ? COLORS.primary : COLORS.border}`,
                  borderRadius: "6px",
                  background:
                    currentPage === page ? COLORS.primary : COLORS.surface,
                  color: currentPage === page ? "white" : COLORS.text,
                  cursor: "pointer",
                  fontSize: 13,
                  fontWeight: 500,
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  if (currentPage !== page) {
                    e.currentTarget.style.borderColor = COLORS.primary;
                    e.currentTarget.style.backgroundColor = `rgba(99, 102, 241, 0.05)`;
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor =
                    currentPage === page ? COLORS.primary : COLORS.border;
                  e.currentTarget.style.backgroundColor =
                    currentPage === page ? COLORS.primary : COLORS.surface;
                }}
              >
                {page}
              </button>
            ),
          )}
        </div>

        <button
          onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          style={{
            padding: "8px 12px",
            border: `1px solid ${COLORS.border}`,
            borderRadius: "6px",
            background: COLORS.surface,
            color: COLORS.text,
            cursor: currentPage === totalPages ? "not-allowed" : "pointer",
            fontSize: 13,
            fontWeight: 500,
            transition: "all 0.2s ease",
            opacity: currentPage === totalPages ? 0.5 : 1,
          }}
          onMouseEnter={(e) => {
            if (currentPage < totalPages) {
              e.currentTarget.style.borderColor = COLORS.primary;
              e.currentTarget.style.backgroundColor = `rgba(99, 102, 241, 0.05)`;
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = COLORS.border;
            e.currentTarget.style.backgroundColor = COLORS.surface;
          }}
        >
          Next →
        </button>
      </div>
    </div>
  );
}
