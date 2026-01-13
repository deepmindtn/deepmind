import React, { useState } from "react";
import { Clock, Send } from "lucide-react";
import "./ScheduleSender.css";

const ScheduleSender = ({ value, onChange }) => {
  const [mode, setMode] = useState(value ? "schedule" : "now");

  const handleModeChange = (newMode) => {
    setMode(newMode);
    if (newMode === "now") {
      onChange(null);
    }
  };

  return (
    <div className="schedule-sender">
      <div className="schedule-header">
        <h3>Schedule Sending</h3>
        <p>Choose when this assessment should be sent</p>
      </div>

      <div className="schedule-options">
        <div
          className={`schedule-card ${mode === "now" ? "active" : ""}`}
          onClick={() => handleModeChange("now")}
        >
          <Send />
          <span>Send Now</span>
        </div>

        <div
          className={`schedule-card ${mode === "schedule" ? "active" : ""}`}
          onClick={() => handleModeChange("schedule")}
        >
          <Clock />
          <span>Schedule</span>
        </div>
      </div>

      {mode === "schedule" && (
        <div className="datetime-wrapper">
          <label>Delivery date & time</label>
          <input
            type="datetime-local"
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
          />
        </div>
      )}
    </div>
  );
};

export default ScheduleSender;
