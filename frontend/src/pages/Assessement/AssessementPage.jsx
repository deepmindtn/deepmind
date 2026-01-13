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
    <>
  {!mode && <AssessmentChoice onSelect={setMode} />}

  {mode && (
    <div className="assessment-form-wrapper">
      <button className="back-btn" onClick={handleBack}>
        <ArrowLeft className="back-icon" />
        Back
      </button>

      {mode === "ai" && <GenerateWithAIForm />}
      {mode === "custom" && <CreateSurveyForm />}
    </div>
  )}
</>
  );
};

export default AssessementPage;
