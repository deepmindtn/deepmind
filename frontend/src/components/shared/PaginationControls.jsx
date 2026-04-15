import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function PaginationControls({
  page,
  totalPages,
  onPageChange,
  styles,
  colors,
}) {
  const safeTotalPages = Math.max(Number(totalPages) || 1, 1);
  const safePage = Math.min(Math.max(Number(page) || 1, 1), safeTotalPages);
  const isSinglePage = safeTotalPages <= 1;
  const disablePrev = isSinglePage || safePage <= 1;
  const disableNext = isSinglePage || safePage >= safeTotalPages;

  const navButtonStyle = (disabled) => ({
    ...styles.btnPrimary,
    padding: "6px 10px",
    backgroundColor: disabled ? "#f1f5f9" : "white",
    color: disabled ? colors.textMuted : colors.textPrimary,
    border: `1px solid ${colors.borderColor}`,
    cursor: disabled ? "not-allowed" : "pointer",
  });

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <button
        style={navButtonStyle(disablePrev)}
        onClick={() => onPageChange(Math.max(1, safePage - 1))}
        disabled={disablePrev}
        aria-label="Previous page"
      >
        <ChevronLeft size={16} />
      </button>

      <span style={{ fontSize: 12, color: colors.textSecondary }}>
        Page {safePage} / {safeTotalPages}
      </span>

      <button
        style={navButtonStyle(disableNext)}
        onClick={() => onPageChange(Math.min(safeTotalPages, safePage + 1))}
        disabled={disableNext}
        aria-label="Next page"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
}
