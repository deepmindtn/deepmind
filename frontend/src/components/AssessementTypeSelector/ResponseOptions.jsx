import React from "react";
import { UserX, UserCheck } from "lucide-react";
import "./ResponseOptions.css";

const COLORS = {
  primary: "var(--primary)",
  primaryLight: "var(--primary-light)",
  primaryDark: "var(--primary-dark)",
  secondary: "var(--secondary)",
  blue: "var(--blue)",
  blueLight: "var(--blue-light)",
  purple: "var(--purple)",
  purpleLight: "var(--purple-light)",
  orange: "var(--orange)",
  orangeLight: "var(--orange-light)",
  red: "var(--red)",
  dark: "var(--dark)",
  bgMain: "var(--bg-main)",
  cardBg: "var(--card-bg)",
  textPrimary: "var(--text-primary)",
  textSecondary: "var(--text-secondary)",
  textMuted: "var(--text-muted)",
  borderColor: "var(--border-color)",
  shadowSm: "var(--shadow-sm)",
  shadowMd: "var(--shadow-md)",
  shadowLg: "var(--shadow-lg)",
  shadowHuge: "var(--shadow-huge)",
};

const ResponseOptions = ({ value, onChange }) => {
  return (
    <div
      className="response-options-wrapper"
      style={{ backgroundColor: COLORS.cardBg }}
    >
      <div className="response-options-header">
        <h3 style={{ color: COLORS.textPrimary }}>Response Type</h3>
        <p style={{ color: COLORS.textSecondary }}>
          Choose how participants will be identified
        </p>
      </div>

      <div className="response-options-grid">
        <div
          className={`response-card ${value === "anonymous" ? "active" : ""}`}
          onClick={() => onChange("anonymous")}
          style={{
            backgroundColor: COLORS.cardBg,
            border: `1px solid ${
              value === "anonymous" ? COLORS.primary : COLORS.borderColor
            }`,
            color: COLORS.textPrimary,
          }}
        >
          <div
            className="card-icon"
            style={{
              color:
                value === "anonymous" ? COLORS.primary : COLORS.textSecondary,
            }}
          >
            <UserX />
          </div>
          <div className="card-content">
            <h4 style={{ color: COLORS.textPrimary }}>Anonymous</h4>
            <p style={{ color: COLORS.textSecondary }}>
              Responses will not include participant identity
            </p>
          </div>
          {value === "anonymous" && (
            <span className="checkmark" style={{ color: COLORS.primary }}>
              ✓
            </span>
          )}
        </div>

        <div
          className={`response-card ${value === "named" ? "active" : ""}`}
          onClick={() => onChange("named")}
          style={{
            backgroundColor: COLORS.cardBg,
            border: `1px solid ${
              value === "named" ? COLORS.primary : COLORS.borderColor
            }`,
            color: COLORS.textPrimary,
          }}
        >
          <div
            className="card-icon"
            style={{
              color: value === "named" ? COLORS.primary : COLORS.textSecondary,
            }}
          >
            <UserCheck />
          </div>
          <div className="card-content">
            <h4 style={{ color: COLORS.textPrimary }}>With Name</h4>
            <p style={{ color: COLORS.textSecondary }}>
              Responses are linked to employees
            </p>
          </div>
          {value === "named" && (
            <span className="checkmark" style={{ color: COLORS.primary }}>
              ✓
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResponseOptions;
