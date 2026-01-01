import React, { useState } from 'react';
import './UploadSurveyFile.css';

const ALLOWED_TYPES = ['application/json', 'text/csv'];

const UploadSurveyFile = () => {
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const file = e.target.files[0];

    if (file) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        setError('Unsupported file type. Please upload a CSV or JSON file.');
        setFileName('');
        return;
      }

      setError('');
      setFileName(file.name);
      console.log('Uploaded file:', file);
      // You can send it to backend or parse it here
    }
  };

  return (
    <div className="upload-section">
      <label htmlFor="file-upload">Upload Assessment File</label>
      <div className="format-badges">
        <span className="badge">CSV</span>
        <span className="badge">JSON</span>
      </div>

      <input type="file" id="file-upload" onChange={handleFileChange} />

      {fileName && (
        <div className="file-preview animate-in">
          ✅ File selected: <strong>{fileName}</strong>
        </div>
      )}

      {error && <div className="file-error">{error}</div>}
    </div>
  );
};

export default UploadSurveyFile;
