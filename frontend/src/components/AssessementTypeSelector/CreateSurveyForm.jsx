import React, { useState } from 'react';
import AudienceSelector from './AudienceSelector';
import ScheduleSender from './ScheduleSender';
import ResponseOptions from './ResponseOptions';
import './CreateSurveyForm.css';

const CreateSurveyForm = () => {
  const [option, setOption] = useState('');
  const [questions, setQuestions] = useState(['']);
  const [file, setFile] = useState(null);
  const [responseType, setResponseType] = useState('');
  const [schedule, setSchedule] = useState(null);
  const [audience, setAudience] = useState({ type: '', selected: [] });

  const handleAddQuestion = () => setQuestions([...questions, '']);
  const handleQuestionChange = (i, value) => {
    const updated = [...questions];
    updated[i] = value;
    setQuestions(updated);
  };

  const handleSubmit = () => {
    console.log({ responseType, audience, schedule, questions, file });
  };

  return (
    <div className="form-container">
      <h3>Create Survey Yourself</h3>
      <div className="survey-choice">
        <button className={option === 'upload' ? 'active' : ''} onClick={() => setOption('upload')}>📂 Upload File</button>
        <button className={option === 'manual' ? 'active' : ''} onClick={() => setOption('manual')}>✏️ Build Manually</button>
      </div>

      {option === 'upload' && (
        <input type="file" accept=".json,.txt" onChange={e => setFile(e.target.files[0])} />
      )}

      {option === 'manual' && (
        <div className="manual-questions">
          {questions.map((q, i) => (
            <input
              key={i}
              type="text"
              value={q}
              placeholder={`Question ${i + 1}`}
              onChange={(e) => handleQuestionChange(i, e.target.value)}
            />
          ))}
          <button className="add-btn" onClick={handleAddQuestion}>➕ Add Question</button>
        </div>
      )}

      <ResponseOptions value={responseType} onChange={setResponseType} />
      <AudienceSelector value={audience} onChange={setAudience} />
      <ScheduleSender value={schedule} onChange={setSchedule} />

      <button className="send-assessment-btn" onClick={handleSubmit}>
        Send Custom Survey
      </button>
    </div>
  );
};

export default CreateSurveyForm;
