import React from 'react';
import './UploadSurveyFile.css';
const ScheduleSender = ({ value, onChange }) => {
  return (
    <div className="schedule-sender">
      <h3>Schedule Sending</h3>
      <label>
        <input
          type="datetime-local"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
        />
      </label>
    </div>
  );
};

export default ScheduleSender;
