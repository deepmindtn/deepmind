import React from "react";
import "../../../pages/hr/WellbeingPage.css";
const WellBeingChoice = ({ onSelect }) => {
  return (
    <div className="assessment-choice">
      <h2>Choose a Well-Being Technique</h2>
      <div className="option-grid">
        <button onClick={() => onSelect("mindfulness")} className="option-card">
          <h3>Matrice d'Eisenhower</h3>
          <p>
            Task prioritization, time management, and decision-making tool to organize what matters
            most.
          </p>
        </button>

        <button onClick={() => onSelect("physical")} className="option-card">
          <h3>Pomodoro Technik</h3>
          <p>
            Structured work intervals with short breaks to boost focus, productivity, and mental
            clarity.
          </p>
        </button>
      </div>
    </div>
  );
};

export default WellBeingChoice;
