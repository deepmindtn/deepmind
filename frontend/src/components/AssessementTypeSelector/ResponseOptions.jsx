import React from "react";
import { UserX, UserCheck } from "lucide-react";
import "./ResponseOptions.css";

const ResponseOptions = ({ value, onChange }) => {
  return (
    <div className="response-options-wrapper">
      <div className="response-options-header">
        <h3>Response Type</h3>
        <p>Choose how participants will be identified</p>
      </div>

      <div className="response-options-grid">
        <div
          className={`response-card ${value === "anonymous" ? "active" : ""}`}
          onClick={() => onChange("anonymous")}
        >
          <div className="card-icon">
            <UserX />
          </div>
          <div className="card-content">
            <h4>Anonymous</h4>
            <p>Responses will not include participant identity</p>
          </div>
          {value === "anonymous" && <span className="checkmark">✓</span>}
        </div>

        <div
          className={`response-card ${value === "named" ? "active" : ""}`}
          onClick={() => onChange("named")}
        >
          <div className="card-icon">
            <UserCheck />
          </div>
          <div className="card-content">
            <h4>With Name</h4>
            <p>Responses are linked to employees</p>
          </div>
          {value === "named" && <span className="checkmark">✓</span>}
        </div>
      </div>
    </div>
  );
};

export default ResponseOptions;
