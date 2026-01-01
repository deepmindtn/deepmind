import React, { useState } from 'react';
import AudienceSelector from './AudienceSelector';
import ScheduleSender from './ScheduleSender';
import ResponseOptions from './ResponseOptions';

const GenerateWithAIForm = () => {
  const [responseType, setResponseType] = useState('');
  const [schedule, setSchedule] = useState(null);
  const [audience, setAudience] = useState({ type: '', selected: [] });

  const handleSubmit = () => {
    console.log({ responseType, schedule, audience });
  };

  return (
    <div className="form-container">
      <h3>Generate Survey with AI</h3>
      <ResponseOptions value={responseType} onChange={setResponseType} />
      <AudienceSelector value={audience} onChange={setAudience} />
      <ScheduleSender value={schedule} onChange={setSchedule} />
      <button className="send-assessment-btn" onClick={handleSubmit}>
        Send AI Assessment
      </button>
    </div>
  );
};

export default GenerateWithAIForm;
