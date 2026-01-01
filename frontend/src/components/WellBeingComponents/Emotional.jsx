import React, { useState } from "react";
import "../../pages/WellbeingPage.css";
import "./Emotional.css";

const Emotional = () => {
  const [notes, setNotes] = useState("");

  return (
    <div className="menu-content emotional-page">
      <h3> Emotional Health</h3>
      <p className="subtitle">Write down your thoughts or gratitude notes.</p>

      <textarea
        placeholder="Start journaling..."
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        className="note-area"
      />

      <p className="notes-label">📝 Your Notes:</p>
      <div className="note-preview">{notes || "No notes yet."}</div>
    </div>
  );
};

export default Emotional;
