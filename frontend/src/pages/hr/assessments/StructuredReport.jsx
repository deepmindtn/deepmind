/**
 * StructuredReport.jsx
 * Shared component that renders a structured JSON AI report.
 * Accepts:
 *   report  – object (structured) | string (legacy plain-text) | null
 */
import React from "react";

// ─────────────────────────────────────────────────
// Design tokens matching the app's CSS custom vars
// ─────────────────────────────────────────────────
const V = {
  primary:       "var(--primary, #6366f1)",
  primaryLight:  "var(--primary-light, #e0e7ff)",
  textPrimary:   "var(--text-primary, #1e293b)",
  textSecondary: "var(--text-secondary, #64748b)",
  textMuted:     "var(--text-muted, #94a3b8)",
  borderColor:   "var(--border-color, #e2e8f0)",
  cardBg:        "var(--card-bg, #ffffff)",
  success:       "#10b981",
  successLight:  "#d1fae5",
  danger:        "#ef4444",
  dangerLight:   "#fee2e2",
  warning:       "#f59e0b",
  warningLight:  "#fef3c7",
};

// ─────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────

/** Section header */
function SectionTitle({ children }) {
  return (
    <h4
      style={{
        fontSize: "13px",
        fontWeight: "700",
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        color: V.textMuted,
        margin: "0 0 12px 0",
      }}
    >
      {children}
    </h4>
  );
}

/** Profile archetype badge */
function ArchetypeBadge({ text }) {
  if (!text) return null;
  return (
    <span
      style={{
        display: "inline-block",
        backgroundColor: V.primaryLight,
        color: V.primary,
        fontSize: "13px",
        fontWeight: "700",
        padding: "4px 14px",
        borderRadius: "999px",
        border: `1.5px solid ${V.primary}`,
        marginBottom: "16px",
      }}
    >
      {text}
    </span>
  );
}

/** Highlighted key stat (e.g. burnout level, resilience level) */
function StatHighlight({ label, value, color }) {
  const bg    = color === "danger"  ? V.dangerLight
              : color === "success" ? V.successLight
              : color === "warning" ? V.warningLight
              : V.primaryLight;
  const fg    = color === "danger"  ? V.danger
              : color === "success" ? V.success
              : color === "warning" ? V.warning
              : V.primary;
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "10px",
        backgroundColor: bg,
        border: `1px solid ${fg}`,
        borderRadius: "10px",
        padding: "10px 16px",
        marginBottom: "16px",
      }}
    >
      <span style={{ fontSize: "13px", fontWeight: "600", color: V.textSecondary }}>{label}:</span>
      <span style={{ fontSize: "15px", fontWeight: "700", color: fg }}>{value}</span>
    </div>
  );
}

/** Generic dimensions table (traits / disc_dimensions / dimensions / subscales / etc.) */
function DimensionRow({ item }) {
  // Support multiple schema shapes
  const name  = item.name  || item.trait_name || item.dimension || "—";
  const level = item.level || item.satisfaction_level || item.orientation_level || "";
  const score = item.score != null ? item.score : (item.value != null ? item.value : null);
  const desc  = item.insight || item.interpretation || item.description || item.meaning || "";

  const levelColors = {
    high:   { bg: V.successLight, fg: V.success },
    "very high": { bg: V.successLight, fg: V.success },
    moderate: { bg: V.warningLight, fg: V.warning },
    low:    { bg: V.dangerLight,  fg: V.danger  },
    "very low": { bg: V.dangerLight, fg: V.danger },
  };
  const lc = levelColors[(level || "").toLowerCase()] || { bg: V.primaryLight, fg: V.primary };

  return (
    <div
      style={{
        padding: "12px 16px",
        borderRadius: "10px",
        border: `1px solid ${V.borderColor}`,
        backgroundColor: V.cardBg,
        marginBottom: "8px",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: desc ? "6px" : 0 }}>
        <span style={{ fontWeight: "600", color: V.textPrimary, fontSize: "14px" }}>{name}</span>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          {score != null && (
            <span style={{ fontSize: "13px", color: V.textSecondary, fontWeight: "600" }}>{score}</span>
          )}
          {level && (
            <span
              style={{
                backgroundColor: lc.bg,
                color: lc.fg,
                fontSize: "11px",
                fontWeight: "700",
                padding: "2px 10px",
                borderRadius: "999px",
              }}
            >
              {level}
            </span>
          )}
        </div>
      </div>
      {desc && (
        <p style={{ fontSize: "13px", color: V.textSecondary, margin: 0, lineHeight: "1.5" }}>{desc}</p>
      )}
    </div>
  );
}

/** Bullet list for strengths / risks */
function BulletList({ items, color }) {
  const dot = color === "success" ? V.success : V.danger;
  return (
    <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
      {(items || []).map((item, i) => (
        <li
          key={i}
          style={{
            display: "flex",
            gap: "10px",
            padding: "8px 0",
            borderBottom: i < items.length - 1 ? `1px solid ${V.borderColor}` : "none",
            alignItems: "flex-start",
          }}
        >
          <span style={{ color: dot, fontSize: "16px", lineHeight: 1.4, flexShrink: 0 }}>●</span>
          <span style={{ fontSize: "14px", color: V.textPrimary, lineHeight: "1.5" }}>{item}</span>
        </li>
      ))}
    </ul>
  );
}

/** Action point card */
function ActionPointCard({ point, index }) {
  const title = typeof point === "object" ? point.title       : null;
  const desc  = typeof point === "object" ? point.description : point;
  return (
    <div
      style={{
        padding: "14px 16px",
        borderRadius: "10px",
        border: `1px solid ${V.borderColor}`,
        backgroundColor: V.cardBg,
        display: "flex",
        gap: "12px",
        marginBottom: "8px",
        alignItems: "flex-start",
      }}
    >
      <span
        style={{
          minWidth: "24px",
          height: "24px",
          borderRadius: "50%",
          backgroundColor: V.primary,
          color: "#fff",
          fontSize: "12px",
          fontWeight: "700",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {index + 1}
      </span>
      <div>
        {title && (
          <p style={{ fontWeight: "700", color: V.textPrimary, fontSize: "14px", margin: "0 0 4px 0" }}>
            {title}
          </p>
        )}
        {desc && (
          <p style={{ fontSize: "13px", color: V.textSecondary, margin: 0, lineHeight: "1.5" }}>{desc}</p>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────
// Helpers to auto-detect special fields
// ─────────────────────────────────────────────────

function detectColor(label, value) {
  const v = (value || "").toLowerCase();
  if (v.includes("high") || v.includes("strong") || v.includes("positive")) return "success";
  if (v.includes("low") || v.includes("elevated burnout") || v.includes("risk")) return "danger";
  if (v.includes("moderate") || v.includes("medium")) return "warning";
  return "primary";
}

const SPECIAL_LABELS = {
  burnout_level:      "Burnout Level",
  resilience_level:   "Resilience Level",
  creativity_level:   "Creativity Level",
  overall_level:      "Overall Level",
  efficacy_level:     "Efficacy Level",
  quadrant:           "Demand-Control Quadrant",
  quadrant_meaning:   "Quadrant Meaning",
  dominant_orientation: "Dominant Orientation",
  creative_style:     "Creative Style",
  global_score:       "Global Score",
  total_score:        "Total Score",
  score:              "Score",
};

// Arrays of sub-items to render as dimension rows
const DIMENSION_KEYS = [
  "traits",
  "disc_dimensions",
  "dimensions",
  "subscales",
  "orientations",
  "domains",
];

// ─────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────

export default function StructuredReport({ report }) {
  // ── Legacy plain-text fallback ──────────────────
  if (!report || typeof report === "string") {
    return (
      <p style={{ lineHeight: "1.7", color: V.textPrimary, whiteSpace: "pre-wrap" }}>
        {report || ""}
      </p>
    );
  }

  const {
    summary,
    strengths,
    risks,
    action_points,
    profile_archetype,
    ...rest
  } = report;

  // Collect special highlight stats
  const highlights = [];
  Object.entries(SPECIAL_LABELS).forEach(([key, label]) => {
    if (rest[key] != null) {
      highlights.push({ label, value: String(rest[key]), key });
    }
  });

  // Collect dimension arrays
  const dimensionSections = [];
  DIMENSION_KEYS.forEach((key) => {
    if (Array.isArray(rest[key]) && rest[key].length > 0) {
      const titles = {
        traits:             "Personality Traits",
        disc_dimensions:    "DISC Dimensions",
        dimensions:         "Dimensions",
        subscales:          "Burnout Subscales",
        orientations:       "Motivation Orientations",
        domains:            "Creative Activity Domains",
      };
      dimensionSections.push({ title: titles[key] || key, items: rest[key] });
    }
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Profile archetype */}
      {profile_archetype && <ArchetypeBadge text={profile_archetype} />}

      {/* Summary */}
      {summary && (
        <div>
          <SectionTitle>Summary</SectionTitle>
          <p style={{ fontSize: "15px", color: V.textPrimary, lineHeight: "1.7", margin: 0 }}>
            {summary}
          </p>
        </div>
      )}

      {/* Score highlights */}
      {highlights.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
          {highlights.map(({ label, value, key }) => (
            <StatHighlight
              key={key}
              label={label}
              value={value}
              color={detectColor(label, value)}
            />
          ))}
        </div>
      )}

      {/* Dimension sections */}
      {dimensionSections.map(({ title, items }) => (
        <div key={title}>
          <SectionTitle>{title}</SectionTitle>
          {items.map((item, i) => (
            <DimensionRow key={i} item={item} />
          ))}
        </div>
      ))}

      {/* Strengths & Risks */}
      {(strengths?.length > 0 || risks?.length > 0) && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "16px",
          }}
        >
          {strengths?.length > 0 && (
            <div
              style={{
                backgroundColor: V.successLight,
                borderRadius: "12px",
                padding: "16px",
                border: `1px solid ${V.success}30`,
              }}
            >
              <SectionTitle>Strengths</SectionTitle>
              <BulletList items={strengths} color="success" />
            </div>
          )}
          {risks?.length > 0 && (
            <div
              style={{
                backgroundColor: V.dangerLight,
                borderRadius: "12px",
                padding: "16px",
                border: `1px solid ${V.danger}30`,
              }}
            >
              <SectionTitle>Risks & Watch Points</SectionTitle>
              <BulletList items={risks} color="danger" />
            </div>
          )}
        </div>
      )}

      {/* Action Points */}
      {action_points?.length > 0 && (
        <div>
          <SectionTitle>Action Points</SectionTitle>
          {action_points.map((point, i) => (
            <ActionPointCard key={i} point={point} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
