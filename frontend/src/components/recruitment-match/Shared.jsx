import React from "react";
import ReactDOM from "react-dom";
import { X } from "lucide-react";
import { COLORS, styles } from "./Constants";

export function StatusBadge({ status }) {
  const label = status === "pending_cv_match" ? "Pending CV Match" : status;
  return <span style={styles.badge(status)}>{label}</span>;
}

export function Modal({ open, title, onClose, children, actions, contentClassName }) {
  if (!open) return null;
  return ReactDOM.createPortal(
    <div style={styles.modalOverlay} onClick={onClose}>
      <div
        className={contentClassName}
        style={{
          ...styles.card,
          width: "100%",
          maxWidth: "600px",
          padding: "24px",
          boxShadow: COLORS.shadowLg,
          overflow: "visible",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "20px",
          }}
        >
          <h3 style={{ margin: 0, fontSize: "20px", fontWeight: "700" }}>
            {title}
          </h3>
          <button
            onClick={onClose}
            style={{ border: "none", background: "none", cursor: "pointer" }}
          >
            <X size={20} />
          </button>
        </div>
        {children}
        <div
          className="modal-actions"
          style={{
            marginTop: "24px",
            display: "flex",
            gap: "12px",
            justifyContent: "flex-end",
          }}
        >
          {actions}
        </div>
      </div>
    </div>,
    document.body
  );
}
