import React from 'react';
import './ResponseOptions.css';
const ResponseOptions = ({ value, onChange }) => {
  return (
    <div className="response-options">
      <h3>Response Type</h3>
      <label>
        <input
          type="radio"
          name="response"
          value="anonymous"
          checked={value === 'anonymous'}
          onChange={() => onChange('anonymous')}
        />
        Anonymous
      </label>
      <label>
        <input
          type="radio"
          name="response"
          value="named"
          checked={value === 'named'}
          onChange={() => onChange('named')}
        />
        With Name
      </label>
    </div>
  );
};

export default ResponseOptions;
