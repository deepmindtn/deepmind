import React, { useState, useRef, useEffect } from "react";
import { 
  Layers, 
  Plus, 
  Trash2, 
  ArrowLeft, 
  Maximize, 
  Minimize, 
  AlertCircle, 
  Clock, 
  UserPlus, 
  XCircle,
  Trophy,
  Info
} from "lucide-react";
import { useNavigate } from "react-router-dom";

// -----------------------
// Theme Constants
// -----------------------
const COLORS = {
  primary: "#6366f1", // Indigo
  primaryLight: "#e0e7ff",
  primaryDark: "#4338ca",
  bgMain: "var(--bg-main)",
  cardBg: "var(--card-bg)",
  textPrimary: "var(--text-primary)",
  textSecondary: "var(--text-secondary)",
  textMuted: "var(--text-muted)",
  borderColor: "var(--border-color)",
  shadowHuge: "var(--shadow-huge)",
};

const QUADRANT_CONFIG = [
  { id: 0, title: "Do First", subtitle: "Urgent & Important", color: "#ef4444", icon: <AlertCircle size={18} />, tip: "Handle these immediately." },
  { id: 1, title: "Schedule", subtitle: "Important, Not Urgent", color: "#f59e0b", icon: <Clock size={18} />, tip: "Set a time in your calendar." },
  { id: 2, title: "Delegate", subtitle: "Urgent, Not Important", color: "#3b82f6", icon: <UserPlus size={18} />, tip: "Who can help you with this?" },
  { id: 3, title: "Eliminate", subtitle: "Neither", color: "#94a3b8", icon: <XCircle size={18} />, tip: "Is this worth your time?" },
];

const styles = {
  mainWrapperCard: (isZen) => ({
    backgroundColor: isZen ? "#111827" : COLORS.cardBg,
    borderRadius: isZen ? "0" : "24px",
    border: isZen ? "none" : `1px solid ${COLORS.borderColor}`,
    boxShadow: isZen ? "none" : COLORS.shadowHuge,
    width: "100%",
    margin: isZen ? "0" : "0 auto",
    overflow: "hidden",
    fontFamily: "'Inter', system-ui, sans-serif",
    display: "flex",
    flexDirection: "column",
    height: isZen ? "100vh" : "calc(100vh - 40px)",
    position: "relative",
    transition: "all 0.5s ease",
  }),
  heroSection: {
    background: `linear-gradient(135deg, ${COLORS.primaryLight} 0%, ${COLORS.cardBg} 100%)`,
    padding: "32px 48px",
    borderBottom: `1px solid ${COLORS.borderColor}`,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  contentBody: (isZen) => ({
    flex: 1,
    display: "flex",
    flexDirection: "column",
    padding: "40px",
    position: "relative",
    backgroundImage: isZen 
      ? `linear-gradient(rgba(17, 24, 39, 0.8), rgba(17, 24, 39, 0.8)), url('https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&q=80&w=2000')` 
      : "none",
    backgroundSize: "cover",
    backgroundPosition: "center",
    overflowY: "auto",
  }),
  matrixGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gridTemplateRows: "1fr 1fr",
    gap: "20px",
    height: "100%",
    flex: 2,
  },
  quadrantCard: (color, isZen) => ({
    backgroundColor: isZen ? "rgba(255,255,255,0.05)" : "#fff",
    borderRadius: "20px",
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    border: isZen ? "1px solid rgba(255,255,255,0.1)" : `1px solid ${COLORS.borderColor}`,
    boxShadow: isZen ? "none" : "0 4px 15px rgba(0,0,0,0.02)",
    backdropFilter: isZen ? "blur(10px)" : "none",
    transition: "transform 0.2s ease",
  }),
  inputSection: (isZen) => ({
    display: "flex",
    gap: "12px",
    marginBottom: "32px",
    background: isZen ? "rgba(255,255,255,0.1)" : "#f9fafb",
    padding: "12px",
    borderRadius: "20px",
    border: `1px solid ${isZen ? "transparent" : "#e5e7eb"}`,
    maxWidth: "800px",
    margin: "0 auto 32px auto",
    width: "100%",
  }),
  badge: (color) => ({
    padding: "4px 12px",
    borderRadius: "20px",
    fontSize: "11px",
    fontWeight: "800",
    backgroundColor: `${color}15`,
    color: color,
    textTransform: "uppercase",
    letterSpacing: "0.5px"
  })
};

const animationStyles = `
  .quad-item:hover { transform: translateY(-2px); }
  .task-row:hover .trash-btn { opacity: 1; }
  .matrix-select {
    border: none;
    background: white;
    padding: 8px 16px;
    border-radius: 12px;
    font-weight: 700;
    color: #374151;
    cursor: pointer;
    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    outline: none;
  }
`;

const EisenhowerMatrix = ({ onBack }) => {
  const [tasks, setTasks] = useState([[], [], [], []]);
  const [input, setInput] = useState("");
  const [selectedQuad, setSelectedQuad] = useState(0);
  const [isZen, setIsZen] = useState(false);
  const containerRef = useRef(null);
  const navigate = useNavigate();

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(err => console.error(err));
      setIsZen(true);
    } else {
      document.exitFullscreen();
      setIsZen(false);
    }
  };

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

      {/* Floating Controls */}
      <div style={{ position: 'absolute', top: '24px', right: '24px', display: 'flex', gap: '12px', zIndex: 101 }}>
        <button 
          onClick={toggleFullscreen}
          style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', padding: '12px', borderRadius: '14px', cursor: 'pointer', backdropFilter: 'blur(10px)' }}
        >
          {isZen ? <Minimize size={20} /> : <Maximize size={20} />}
        </button>
      </div>

      {/* Hero Header */}
      {!isZen && (
        <div style={styles.heroSection}>
          <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
            <button className="integrated-back-btn" onClick={() => navigate("/productivity-tools")}>
               <ArrowLeft size={16} />
               <span>Back to Tools</span>
            </button>
            <div style={{ width: "64px", height: "64px", borderRadius: "18px", backgroundColor: COLORS.primary, display: "flex", alignItems: "center", justifyContent: "center", color: "white", boxShadow: "0 10px 20px -5px rgba(99, 102, 241, 0.4)" }}>
              <Layers size={32} />
            </div>
            <div>
              <h1 style={{ fontSize: "28px", fontWeight: "800", color: COLORS.textPrimary, margin: "0" }}>Eisenhower Matrix</h1>
              <p style={{ fontSize: "14px", color: COLORS.textSecondary, margin: "2px 0 0 0" }}>Master your priorities and eliminate distractions.</p>
            </div>
          </div>
        </div>
      )}

      {/* Main Body */}
      <div style={styles.contentBody(isZen)}>
        
        {/* Priority Input Bar */}
        <div style={styles.inputSection(isZen)}>
          <select 
            className="matrix-select"
            value={selectedQuad}
            onChange={(e) => setSelectedQuad(Number(e.target.value))}
          >
            {QUADRANT_CONFIG.map(q => <option key={q.id} value={q.id}>{q.title}</option>)}
          </select>
          <input 
            type="text" 
            placeholder="What's on your mind?" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addTask()}
            style={{ flex: 1, border: 'none', background: 'transparent', padding: '0 16px', fontSize: '16px', color: isZen ? '#fff' : COLORS.textPrimary, outline: 'none' }}
          />
          <button 
            onClick={addTask}
            style={{ background: COLORS.primary, color: 'white', border: 'none', borderRadius: '12px', padding: '0 24px', fontWeight: '700', cursor: 'pointer' }}
          >
            Add Task
          </button>
        </div>

        <div style={{ display: "flex", gap: "40px", height: "100%", maxWidth: "1200px", margin: "0 auto", width: "100%" }}>
          
          {/* Matrix Grid */}
          <div style={styles.matrixGrid}>
            {QUADRANT_CONFIG.map((q) => (
              <div key={q.id} className="quad-item" style={styles.quadrantCard(q.color, isZen)}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <div>
                    <span style={styles.badge(q.color)}>{q.subtitle}</span>
                    <h3 style={{ margin: '8px 0 0 0', color: isZen ? '#fff' : COLORS.textPrimary, fontSize: '18px', fontWeight: '800' }}>{q.title}</h3>
                  </div>
                  <div style={{ color: q.color, background: `${q.color}15`, padding: '8px', borderRadius: '10px' }}>
                    {q.icon}
                  </div>
                </div>

                <div style={{ flex: 1, overflowY: 'auto', paddingRight: '8px' }}>
                  {tasks[q.id].length === 0 && (
                    <p style={{ fontSize: '12px', color: COLORS.textMuted, fontStyle: 'italic', marginTop: '20px', textAlign: 'center' }}>No tasks assigned</p>
                  )}
                  {tasks[q.id].map((task) => (
                    <div key={task.id} className="task-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', background: isZen ? 'rgba(255,255,255,0.05)' : '#f8fafc', borderRadius: '12px', marginBottom: '8px', border: `1px solid ${isZen ? 'rgba(255,255,255,0.05)' : '#f1f5f9'}` }}>
                      <span style={{ fontSize: '14px', color: isZen ? '#cbd5e1' : COLORS.textPrimary }}>{task.text}</span>
                      <button 
                        onClick={() => removeTask(q.id, task.id)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: '#ef4444', opacity: 0.4, transition: 'opacity 0.2s' }}
                        className="trash-btn"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Productivity Sidebar */}
          {!isZen && (
            <div style={{ flex: 0.6, display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ background: '#ecfdf5', padding: '24px', borderRadius: '24px', border: '1px solid #10b98130' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#065f46', marginBottom: '12px' }}>
                  <Trophy size={20} />
                  <span style={{ fontWeight: '800', fontSize: '14px', textTransform: 'uppercase' }}>Focus Goal</span>
                </div>
                <p style={{ fontSize: '13px', color: '#047857', margin: 0, lineHeight: '1.6' }}>
                  The Eisenhower Matrix helps you distinguish between **busy work** and **impactful work**. Try to keep your "Eliminate" quadrant empty!
                </p>
              </div>

              <div style={{ padding: '24px', borderRadius: '24px', border: `1px solid ${COLORS.borderColor}`, background: '#fff' }}>
                 <h3 style={{ fontSize: '14px', color: COLORS.textPrimary, fontWeight: '800', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Info size={16} color={COLORS.primary} /> Quick Logic Tips
                 </h3>
                 {QUADRANT_CONFIG.map(q => (
                   <div key={q.id} style={{ marginBottom: '12px' }}>
                     <div style={{ fontSize: '12px', fontWeight: '700', color: q.color, marginBottom: '2px' }}>{q.title}</div>
                     <div style={{ fontSize: '12px', color: COLORS.textMuted }}>{q.tip}</div>
                   </div>
                 ))}
              </div>

              <div style={{ textAlign: 'center', padding: '20px' }}>
                 <div style={{ fontSize: '32px', fontWeight: '800', color: COLORS.primary }}>{totalTasks}</div>
                 <div style={{ fontSize: '12px', color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: '1px' }}>Active Priorities</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EisenhowerMatrix;