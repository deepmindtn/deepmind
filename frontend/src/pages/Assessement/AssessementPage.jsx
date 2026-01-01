import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react'; // 👈 import icon
import './AssessementPage.css';
import AssessmentChoice from '../../components/AssessementTypeSelector/AssessementChoice';
import GenerateWithAIForm from '../../components/AssessementTypeSelector/GenerateWithAIForm';
import CreateSurveyForm from '../../components/AssessementTypeSelector/CreateSurveyForm';

const AssessementPage = () => {
  const [mode, setMode] = useState('');

  const handleBack = () => setMode('');

  return (
    <div className="assessment-page">
      {!mode && <AssessmentChoice onSelect={setMode} />}

      {mode && (
        <>
          <button className="back-btn" onClick={handleBack}>
            <ArrowLeft className="back-icon" />
            Back
          </button>
          {mode === 'ai' && <GenerateWithAIForm />}
          {mode === 'custom' && <CreateSurveyForm />}
        </>
      )}
    </div>
  );
};

export default AssessementPage;
