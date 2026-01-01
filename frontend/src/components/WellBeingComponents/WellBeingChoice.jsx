import React from "react";
import "../../pages/WellbeingPage.css";
const WellBeingChoice = ({ onSelect }) => {
  return (
    <div className="assessment-choice">
      <h2>Choose a Well-Being Technique</h2>
      <div className="option-grid">
        <button onClick={() => onSelect("mindfulness")} className="option-card">
          <h3>🧘 Mindfulness Exercises</h3>
          <p>Short meditation, breathing exercises, and focus routines to relax your mind.</p>
        </button>

        <button onClick={() => onSelect("physical")} className="option-card">
          <h3>💪 Physical Well-Being</h3>
          <p>Desk stretches, posture tips, and hydration reminders for a healthier workspace.</p>
        </button>

        <button onClick={() => onSelect("emotional")} className="option-card">
          <h3>💛 Emotional Health</h3>
          <p>Journaling, gratitude exercises, and stress tracking to maintain emotional balance.</p>
        </button>

        <button onClick={() => onSelect("daily")} className="option-card">
          <h3>📆 Daily Challenges</h3>
          <p>Small wellness tasks like short walks, deep breathing, or positive habit reminders.</p>
        </button>
      </div>
    </div>
  );
};

export default WellBeingChoice;
