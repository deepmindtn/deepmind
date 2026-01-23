import React, { useState, useRef, useEffect } from "react";
import { 
  Layers, 
  Trash2, 
  ArrowLeft, 
  Maximize, 
  Minimize, 
  AlertCircle, 
  Clock, 
  UserPlus, 
  XCircle,
  Trophy,
  Info,
  Plus,
  CheckCircle2
} from "lucide-react";
import { useNavigate } from "react-router-dom";

// -----------------------
// Theme Constants
// -----------------------
const COLORS = {
  primary: "var(--primary)",
  primaryLight: "var(--primary-light)",
  bgMain: "var(--bg-main)",
  cardBg: "var(--card-bg)",
  textPrimary: "var(--text-primary)",
  textSecondary: "var(--text-secondary)",
  textMuted: "var(--text-muted)",
  borderColor: "var(--border-color)",
  shadowHuge: "var(--shadow-huge)",
  // Matrix Specific Colors
  red: "var(--red, #ef4444)",
  orange: "var(--orange, #f59e0b)",
  blue: "var(--blue, #3b82f6)",
  gray: "var(--gray, #94a3b8)",
};

const QUADRANT_CONFIG = [
  { id: 0, title: "Do First", subtitle: "Urgent & Important", color: COLORS.red, icon: <AlertCircle size={18} />, tip: "Handle these immediately." },
  { id: 1, title: "Schedule", subtitle: "Important, Not Urgent", color: COLORS.orange, icon: <Clock size={18} />, tip: "Set a time in your calendar." },
  { id: 2, title: "Delegate", subtitle: "Urgent, Not Important", color: COLORS.blue, icon: <UserPlus size={18} />, tip: "Who can help you with this?" },
  { id: 3, title: "Eliminate", subtitle: "Neither", color: COLORS.gray, icon: <XCircle size={18} />, tip: "Is this worth your time?" },
];

const styles = {
  mainWrapperCard: (isZen) => ({
    backgroundColor: isZen ? "#0f172a" : COLORS.cardBg,
    borderRadius: isZen ? "0" : "24px",
    border: isZen ? "none" : `1px solid ${COLORS.borderColor}`,
    boxShadow: isZen ? "none" : COLORS.shadowHuge,
    width: "100%",
    margin: isZen ? "0" : "0 auto",
    overflow: "hidden",
    fontFamily: "'Inter', system-ui, sans-serif",
    display: "flex",
    flexDirection: "column",
    minheight: isZen ? "100vh" : "calc(100vh - 40px)",
    position: "relative",
    transition: "all 0.5s ease",
  }),
  heroSection: {
    background: `linear-gradient(135deg, ${COLORS.primaryLight} 0%, ${COLORS.cardBg} 100%)`,
    padding: "48px",
    borderBottom: `1px solid ${COLORS.borderColor}`,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between", // Keeps elements spaced nicely
  },
  heroLeftContent: {
    display: "flex",
    alignItems: "center",
    gap: "24px",
  },
  heroIconBox: {
    width: "72px",
    height: "72px",
    borderRadius: "20px",
    backgroundColor: COLORS.primary,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    boxShadow: "0 10px 25px -5px rgba(99, 102, 241, 0.4)",
    color: "#fff",
  },
  contentBody: (isZen) => ({
    flex: 1,
    display: "flex",
    flexDirection: "column",
    padding: isZen ? "40px" : "32px",
    position: "relative",
    overflowY: "auto",
    backgroundColor: isZen ? "transparent" : COLORS.bgMain,
  }),
  // THE GRID
  layoutContainer: {
    display: "flex",
    gap: "32px",
    height: "100%",
    maxWidth: "1400px",
    margin: "0 auto",
    width: "100%",
    flexDirection: "row",
  },
  matrixGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gridTemplateRows: "1fr 1fr",
    gap: "24px",
    flex: 3,
    minHeight: "0",
  },
  quadrantCard: (color, isZen) => ({
    backgroundColor: isZen ? "rgba(30, 41, 59, 0.7)" : COLORS.cardBg,
    borderRadius: "20px",
    padding: "24px",
    display: "flex",
    flexDirection: "column",
    border: isZen ? "1px solid rgba(255,255,255,0.1)" : `1px solid ${COLORS.borderColor}`,
    boxShadow: isZen ? "none" : "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
    backdropFilter: isZen ? "blur(10px)" : "none",
    transition: "transform 0.2s ease",
    height: "100%",
    position: "relative",
    overflow: "hidden",
  }),
  // INPUT SECTION
  inputWrapper: (isZen) => ({
    marginBottom: "32px",
    background: isZen ? "rgba(255,255,255,0.1)" : COLORS.cardBg,
    padding: "8px",
    borderRadius: "16px",
    border: `1px solid ${isZen ? "rgba(255,255,255,0.1)" : COLORS.borderColor}`,
    display: "flex",
    alignItems: "center",
    maxWidth: "800px",
    margin: "0 auto 32px auto",
    width: "100%",
    boxShadow: isZen ? "none" : "0 4px 12px rgba(0,0,0,0.03)",
  }),
  badge: (color) => ({
    padding: "6px 12px",
    borderRadius: "8px",
    fontSize: "11px",
    fontWeight: "800",
    backgroundColor: `${color}15`,
    color: color,
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    display: "inline-block"
  }),
  // SIDEBAR
  sidebarCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: "20px",
    padding: "24px",
    border: `1px solid ${COLORS.borderColor}`,
    marginBottom: "24px",
  }
};

const animationStyles = `
  /* Restored and Themed Exit Button */
  .integrated-back-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 16px;
    background: var(--bg-main);
    border: 1px solid var(--border-color);
    border-radius: 12px;
    color: var(--text-secondary);
    font-weight: 700;
    font-size: 13px;
    cursor: pointer;
    transition: all 0.2s ease;
    height: fit-content;
  }
  .integrated-back-btn:hover {
    border-color: var(--primary);
    color: var(--primary);
    transform: translateX(-3px);
  }

  .task-list-scroll::-webkit-scrollbar {
    width: 6px;
  }
  .task-list-scroll::-webkit-scrollbar-track {
    background: transparent;
  }
  .task-list-scroll::-webkit-scrollbar-thumb {
    background-color: var(--border-color);
    border-radius: 10px;
  }
  
  .task-row {
    transition: all 0.2s ease;
  }
  .task-row:hover {
    transform: translateX(4px);
    background-color: var(--primary-light); 
  }
  .task-row:hover .trash-btn { 
    opacity: 1; 
    color: #ef4444;
  }

  .matrix-select {
    border: none;
    background: transparent;
    padding: 12px 16px;
    font-weight: 700;
    color: var(--text-primary);
    cursor: pointer;
    outline: none;
    font-size: 14px;
    border-right: 1px solid var(--border-color);
    margin-right: 8px;
  }
  
  .add-btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
  }
  
  @media (max-width: 1024px) {
    .layout-container { flex-direction: column !important; }
    .matrix-grid { min-height: 800px; }
    .hero-left-content { flex-direction: column; text-align: center; gap: 16px; }
  }
`;

const EisenhowerMatrix = ({ onBack }) => {
  const navigate = useNavigate();
  // Standard handling for back: use prop if exists, else history
  const handleBack = () => {
    if (onBack) onBack();
    else navigate(-1);
  };

  const [tasks, setTasks] = useState([
    [{ id: 1, text: "Finish Q3 Report" }], 
    [{ id: 2, text: "Email Marketing Team" }], 
    [], 
    []
  ]);
  const [input, setInput] = useState("");
  const [selectedQuad, setSelectedQuad] = useState(0);
  const [isZen, setIsZen] = useState(false);
  const containerRef = useRef(null);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(err => console.error(err));
      setIsZen(true);
    } else {
      document.exitFullscreen();
      setIsZen(false);
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      if (!document.fullscreenElement) setIsZen(false);
    };
    document.addEventListener("fullscreenchange", handleFsChange);
    return () => document.removeEventListener("fullscreenchange", handleFsChange);
  }, []);

  const addTask = () => {
    if (!input.trim()) return;
    const newTasks = [...tasks];
    newTasks[selectedQuad].push({ text: input, id: Date.now() });
    setTasks(newTasks);
    setInput("");
  };

  const removeTask = (qIdx, taskID) => {
    const newTasks = [...tasks];
    newTasks[qIdx] = newTasks[qIdx].filter(t => t.id !== taskID);
    setTasks(newTasks);
  };

  const totalTasks = tasks.flat().length;

  return (
    <div ref={containerRef} style={styles.mainWrapperCard(isZen)}>
      <style>{animationStyles}</style>

      {/* Floating Zen Controls */}
      <div style={{ position: 'absolute', top: '24px', right: '24px', display: 'flex', gap: '12px', zIndex: 101 }}>
        <button 
          onClick={toggleFullscreen}
          style={{ 
            background: isZen ? 'rgba(255,255,255,0.1)' : COLORS.cardBg, 
            border: `1px solid ${isZen ? 'rgba(255,255,255,0.2)' : COLORS.borderColor}`, 
            color: isZen ? '#fff' : COLORS.textPrimary, 
            padding: '10px', 
            borderRadius: '12px', 
            cursor: 'pointer', 
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {isZen ? <Minimize size={20} /> : <Maximize size={20} />}
        </button>
      </div>

      {/* Header Section */}
      {!isZen && (
        <div style={styles.heroSection}>
          <div style={styles.heroLeftContent} className="hero-left-content">
            
            {/* RESTORED: Exit/Return Button */}
            <button className="integrated-back-btn" onClick={handleBack}>
              <ArrowLeft size={16} />
              <span>Exit</span>
            </button>

            <div style={styles.heroIconBox}>
              <Layers size={36} strokeWidth={2.5} />
            </div>
            
            <div>
              <h1 style={{ fontSize: "32px", fontWeight: "800", color: COLORS.textPrimary, margin: "0 0 4px 0" }}>Eisenhower Matrix</h1>
              <p style={{ fontSize: "16px", color: COLORS.textSecondary, margin: "0" }}>Categorize tasks by urgency and importance.</p>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div style={styles.contentBody(isZen)}>
        
        {/* Input Bar */}
        <div style={styles.inputWrapper(isZen)}>
          <select 
            className="matrix-select"
            value={selectedQuad}
            onChange={(e) => setSelectedQuad(Number(e.target.value))}
            style={{ color: isZen ? '#fff' : COLORS.textPrimary }}
          >
            {QUADRANT_CONFIG.map(q => <option key={q.id} value={q.id}>{q.title}</option>)}
          </select>
          <input 
            type="text" 
            placeholder="Add a new task..." 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addTask()}
            style={{ 
              flex: 1, 
              border: 'none', 
              background: 'transparent', 
              padding: '0 16px', 
              fontSize: '15px', 
              color: isZen ? '#fff' : COLORS.textPrimary, 
              outline: 'none' 
            }}
          />
          <button 
            onClick={addTask}
            className="add-btn"
            style={{ 
              background: COLORS.primary, 
              color: 'white', 
              border: 'none', 
              borderRadius: '10px', 
              width: "36px",
              height: "36px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: 'pointer',
              transition: "all 0.2s"
            }}
          >
            <Plus size={20} />
          </button>
        </div>

        {/* Layout: Grid + Sidebar */}
        <div className="layout-container" style={styles.layoutContainer}>
          
          {/* The 4 Quadrants */}
          <div className="matrix-grid" style={styles.matrixGrid}>
            {QUADRANT_CONFIG.map((q) => (
              <div key={q.id} style={styles.quadrantCard(q.color, isZen)}>
                
                {/* Quadrant Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                  <div>
                    <span style={styles.badge(q.color)}>{q.subtitle}</span>
                    <h3 style={{ margin: '8px 0 0 0', color: isZen ? '#fff' : COLORS.textPrimary, fontSize: '20px', fontWeight: '800' }}>{q.title}</h3>
                  </div>
                  <div style={{ color: q.color, background: isZen ? 'rgba(255,255,255,0.05)' : `${q.color}10`, padding: '10px', borderRadius: '12px' }}>
                    {q.icon}
                  </div>
                </div>

                {/* Task List */}
                <div className="task-list-scroll" style={{ flex: 1, overflowY: 'auto', paddingRight: '4px' }}>
                  {tasks[q.id].length === 0 && (
                    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0.4 }}>
                       <CheckCircle2 size={32} color={q.color} />
                       <p style={{ fontSize: '13px', color: isZen ? '#fff' : COLORS.textSecondary, marginTop: '8px' }}>Empty</p>
                    </div>
                  )}
                  {tasks[q.id].map((task) => (
                    <div 
                      key={task.id} 
                      className="task-row" 
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between', 
                        padding: '12px 16px', 
                        background: isZen ? 'rgba(255,255,255,0.05)' : COLORS.bgMain, 
                        borderRadius: '12px', 
                        marginBottom: '8px', 
                        border: `1px solid ${isZen ? 'transparent' : COLORS.borderColor}` 
                      }}
                    >
                      <span style={{ fontSize: '14px', color: isZen ? '#e2e8f0' : COLORS.textPrimary, fontWeight: '500' }}>{task.text}</span>
                      <button 
                        onClick={() => removeTask(q.id, task.id)}
                        className="trash-btn"
                        style={{ 
                          background: 'none', 
                          border: 'none', 
                          cursor: 'pointer', 
                          padding: '4px', 
                          color: COLORS.textMuted, 
                          opacity: 0, 
                          transition: 'all 0.2s' 
                        }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Sidebar Info (Hidden in Zen) */}
          {!isZen && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: '300px' }}>
              
              {/* Focus Goal Card */}
              <div style={styles.sidebarCard}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: COLORS.primary, marginBottom: '16px' }}>
                  <Trophy size={20} />
                  <span style={{ fontWeight: '800', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>Strategy</span>
                </div>
                <h4 style={{ fontSize: '18px', fontWeight: '700', color: COLORS.textPrimary, margin: '0 0 8px 0' }}>
                   Minimize the noise.
                </h4>
                <p style={{ fontSize: '14px', color: COLORS.textSecondary, margin: 0, lineHeight: '1.6' }}>
                  The goal isn't just to clear the "Do First" box. It's to spend more time in <b>Schedule</b> (deep work) and less time in <b>Eliminate</b>.
                </p>
                
                <div style={{ marginTop: "24px", paddingTop: "24px", borderTop: `1px solid ${COLORS.borderColor}`, textAlign: "center" }}>
                   <div style={{ fontSize: "42px", fontWeight: "800", color: COLORS.primary, lineHeight: "1" }}>{totalTasks}</div>
                   <div style={{ fontSize: "11px", fontWeight: "700", color: COLORS.textMuted, textTransform: "uppercase", marginTop: "8px" }}>Active Tasks</div>
                </div>
              </div>

              {/* Tips Card */}
              <div style={styles.sidebarCard}>
                 <h3 style={{ fontSize: '14px', color: COLORS.textPrimary, fontWeight: '800', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Info size={16} color={COLORS.primary} /> Quick Guide
                 </h3>
                 <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                   {QUADRANT_CONFIG.map(q => (
                     <div key={q.id}>
                       <div style={{ fontSize: '12px', fontWeight: '800', color: q.color, marginBottom: '2px', textTransform: "uppercase" }}>{q.title}</div>
                       <div style={{ fontSize: '13px', color: COLORS.textSecondary }}>{q.tip}</div>
                     </div>
                   ))}
                 </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EisenhowerMatrix;