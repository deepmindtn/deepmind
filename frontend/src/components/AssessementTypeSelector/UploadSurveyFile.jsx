import React, { useState } from 'react';
import { Upload, FileText, AlertCircle, CheckCircle2, X } from 'lucide-react';

// Use inline styles to ensure it looks perfect immediately without external CSS files
const styles = {
  container: {
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', width: '100%'
  },
  dropZone: {
    border: '2px dashed #e2e8f0', borderRadius: '12px', padding: '32px',
    width: '100%', textAlign: 'center', cursor: 'pointer',
    backgroundColor: '#f8fafc', transition: 'all 0.2s',
  },
  fileInfo: {
    display: 'flex', alignItems: 'center', gap: '12px',
    padding: '12px 16px', backgroundColor: '#eff6ff', borderRadius: '8px',
    width: '100%', border: '1px solid #dbeafe'
  },
  fileName: { fontSize: '14px', fontWeight: '500', color: '#1e40af', flex: 1, textAlign: 'left' },
  errorBox: {
    display: 'flex', alignItems: 'center', gap: '8px',
    padding: '12px', backgroundColor: '#fef2f2', color: '#991b1b',
    borderRadius: '8px', fontSize: '13px', width: '100%'
  }
};

const UploadSurveyFile = ({ onQuestionsImported }) => {
  const [fileName, setFileName] = useState(null);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Reset UI
    setError(null);
    setFileName(file.name);

    const reader = new FileReader();
    
    // This function runs when the file is fully read
    reader.onload = (event) => {
      const content = event.target.result;
      console.log("📂 Raw File Content:", content); // Debugging

      try {
        let questions = [];

        if (file.name.toLowerCase().endsWith('.json')) {
          // --- JSON PARSER ---
          const parsed = JSON.parse(content);
          if (!Array.isArray(parsed)) throw new Error("JSON must be an array of questions.");
          
          questions = parsed.map((q, i) => ({ 
            id: Date.now() + i, 
            text: typeof q === 'string' ? q : (q.text || q.question || "") 
          }));
        } 
        else if (file.name.toLowerCase().endsWith('.csv')) {
          // --- ROBUST CSV PARSER ---
          
          // 1. Split lines (handling Windows \r\n, Unix \n, and Mac \r)
          const lines = content.split(/\r\n|\n|\r/).filter(line => line.trim() !== '');
          if (lines.length < 2) throw new Error("CSV file is empty or missing headers.");

          // 2. Auto-detect Delimiter (Comma or Semicolon)
          const firstLine = lines[0];
          const delimiter = firstLine.includes(';') ? ';' : ',';

          // 3. Parse Headers
          const headers = firstLine.toLowerCase().split(delimiter).map(h => h.trim());
          
          // 4. Find the 'question' or 'text' column
          let questionColIndex = headers.findIndex(h => h.includes('question') || h.includes('text'));
          
          // Fallback: If header not found, assume 2nd column (index 1) if exists, else 1st column (index 0)
          if (questionColIndex === -1) {
             questionColIndex = headers.length > 1 ? 1 : 0; 
          }

          // 5. Extract Data
          questions = lines.slice(1).map((line, i) => {
             const cols = line.split(delimiter);
             // Get the text from the correct column
             let text = cols[questionColIndex] || cols[0] || "";
             // Remove surrounding quotes if they exist
             text = text.replace(/^"|"$/g, '').trim(); 
             
             return { id: Date.now() + i, text: text };
          });
        } else {
          throw new Error("Unsupported file type. Please upload .csv or .json");
        }

        // 6. Validate & Send Back to Parent
        const validQuestions = questions.filter(q => q.text && q.text.length > 0);
        
        if (validQuestions.length === 0) {
            throw new Error("No valid questions found in file.");
        }
        
        console.log("✅ Parsed Questions:", validQuestions);
        
        // This is the CRITICAL line that sends data to CreateSurveyForm
        if (onQuestionsImported) {
            onQuestionsImported(validQuestions);
        }

      } catch (err) {
        console.error("❌ Parse Error:", err);
        setError(err.message || "Failed to parse file.");
        setFileName(null);
        if (onQuestionsImported) onQuestionsImported([]); 
      } finally {
        // Allow re-uploading the same file if needed
        e.target.value = null; 
      }
    };

    // Trigger the read
    reader.readAsText(file);
  };

  return (
    <div style={styles.container}>
      {!fileName ? (
        <label style={styles.dropZone}>
          <input type="file" accept=".csv,.json" onChange={handleFileChange} style={{ display: 'none' }} />
          <Upload size={32} color="#94a3b8" style={{ marginBottom: '12px' }} />
          <div style={{ color: '#475569', fontWeight: '600' }}>Click to Upload</div>
          <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>CSV or JSON (Column: "Questions" or "Text")</div>
        </label>
      ) : (
        <div style={styles.fileInfo}>
          <FileText size={20} color="#3b82f6" />
          <span style={styles.fileName}>{fileName}</span>
          <CheckCircle2 size={20} color="#10b981" />
          <button onClick={() => { setFileName(null); if(onQuestionsImported) onQuestionsImported([]); }} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <X size={18} color="#64748b" />
          </button>
        </div>
      )}
      
      {error && (
        <div style={styles.errorBox}>
          <AlertCircle size={16} /> {error}
        </div>
      )}
    </div>
  );
};

export default UploadSurveyFile;