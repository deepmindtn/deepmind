import React, { useState } from "react";
import { Clock, Send } from "lucide-react";
import "./ScheduleSender.css";

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

const ScheduleSender = ({ value, onChange }) => {
  const [mode, setMode] = useState(value ? "schedule" : "now");

  const handleModeChange = (newMode) => {
    setMode(newMode);
    if (newMode === "now") {
      onChange(null);
    }
  };

  return (
    <div className="schedule-sender" style={{ backgroundColor: COLORS.cardBg }}>
      <div className="schedule-header">
        <h3 style={{ color: COLORS.textPrimary }}>Schedule Sending</h3>
        <p style={{ color: COLORS.textSecondary }}>
          Choose when this assessment should be sent
        </p>
      </div>

      <div className="schedule-options">
        <div
          className={`schedule-card ${mode === "now" ? "active" : ""}`}
          onClick={() => handleModeChange("now")}
          style={{
            backgroundColor: COLORS.cardBg,
            border: `1px solid ${
              mode === "now" ? COLORS.primary : COLORS.borderColor
            }`,
            color: COLORS.textPrimary, // Set text to primary
          }}
        >
          <Send
            size={20}
            color={mode === "now" ? COLORS.primary : COLORS.textSecondary}
          />
          <span>Send Now</span>
        </div>

        <div
          className={`schedule-card ${mode === "schedule" ? "active" : ""}`}
          onClick={() => handleModeChange("schedule")}
          style={{
            backgroundColor: COLORS.cardBg,
            border: `1px solid ${
              mode === "schedule" ? COLORS.primary : COLORS.borderColor
            }`,
            color: COLORS.textPrimary, // Set text to primary
          }}
        >
          <Clock
            size={20}
            color={mode === "schedule" ? COLORS.primary : COLORS.textSecondary}
          />
          <span>Schedule</span>
        </div>
      </div>

      {mode === "schedule" && (
        <div className="datetime-wrapper">
          <label style={{ color: COLORS.textSecondary }}>
            Delivery date & time
          </label>
          <input
            type="datetime-local"
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            style={{
              borderColor: COLORS.borderColor,
              color: COLORS.textPrimary,
              backgroundColor: COLORS.cardBg,
            }}
          />
        </div>
      )}
    </div>
  );
};

export default ScheduleSender;
