import React, { useState, useEffect, useRef } from "react";
import { 
  CheckCircle2, 
  Plus, 
  Trash2, 
  Target, 
  Trophy, 
  Maximize, 
  Minimize, 
  ArrowLeft,
  Sparkles,
  CalendarCheck
} from "lucide-react";

// -----------------------
// Theme Constants
// -----------------------
const COLORS = {
  primary: "#6366f1", // Indigo/Violet for Focus
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

const SUGGESTIONS = [
  "💧 Drink 8 glasses of water",
  "🚶‍♂️ Take a 15-minute walk",
  "📵 No screen time for 1 hour",
  "🥗 Eat a healthy green meal",
  "📖 Read 10 pages of a book",
  "🛌 Sleep by 11:00 PM",
  "🧘‍♀️ 5 minutes of deep breathing"
];

const styles = {
  mainWrapperCard: (isZen) => ({
    backgroundColor: isZen ? "#111827" : COLORS.cardBg, // Dark blue-black for Zen
    borderRadius: isZen ? "0" : "24px",
    border: isZen ? "none" : `1px solid ${COLORS.borderColor}`,
    boxShadow: isZen ? "none" : COLORS.shadowHuge,
    width: "100%",
    maxWidth: isZen ? "none" : "",
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
  heroLeftContent: {
    display: "flex",
    alignItems: "center",
    gap: "20px",
  },
  heroIconBox: {
    width: "64px",
    height: "64px",
    borderRadius: "18px",
    backgroundColor: COLORS.primary,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    boxShadow: "0 10px 20px -5px rgba(99, 102, 241, 0.4)",
  },
  contentBody: (isZen) => ({
    flex: 1,
    display: "flex",
    flexDirection: "column",
    padding: "40px",
    position: "relative",
    backgroundImage: isZen 
      ? `linear-gradient(rgba(17, 24, 39, 0.8), rgba(17, 24, 39, 0.8)), url('https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?auto=format&fit=crop&q=80&w=2000')` 
      : "none",
    backgroundSize: "cover",
    backgroundPosition: "center",
    overflowY: "auto",
  }),
  splitLayout: {
    display: "flex",
    gap: "40px",
    height: "100%",
    width: "100%",
    maxWidth: "1100px",
    margin: "0 auto",
  },
  mainListCard: (isZen) => ({
    flex: 2,
    backgroundColor: isZen ? "rgba(255,255,255,0.05)" : "#fff",
    borderRadius: "24px",
    padding: "32px",
    display: "flex",
    flexDirection: "column",
    border: isZen ? "1px solid rgba(255,255,255,0.1)" : `1px solid ${COLORS.borderColor}`,
    boxShadow: isZen ? "none" : "0 4px 20px rgba(0,0,0,0.03)",
    backdropFilter: isZen ? "blur(10px)" : "none",
    transition: "all 0.5s ease",
    height: "100%",
    overflowY: "auto",
  }),
  sidebar: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "24px",
  },
  inputGroup: (isZen) => ({
    display: "flex",
    gap: "12px",
    marginBottom: "24px",
    background: isZen ? "rgba(255,255,255,0.1)" : "#f9fafb",
    padding: "8px",
    borderRadius: "16px",
    border: `1px solid ${isZen ? "transparent" : "#e5e7eb"}`,
  }),
  inputField: (isZen) => ({
    flex: 1,
    border: "none",
    background: "transparent",
    padding: "12px 16px",
    fontSize: "16px",
    outline: "none",
    color: isZen ? "#fff" : COLORS.textPrimary,
    fontWeight: "500",
  }),
  addBtn: {
    background: COLORS.primary,
    color: "white",
    border: "none",
    borderRadius: "12px",
    width: "48px",
    height: "48px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition: "transform 0.2s",
  },
  taskItem: (done, isZen) => ({
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "16px",
    marginBottom: "12px",
    borderRadius: "16px",
    background: isZen 
      ? (done ? "rgba(99, 102, 241, 0.2)" : "rgba(255,255,255,0.05)") 
      : (done ? "#f5f3ff" : "#fff"),
    border: isZen 
      ? "1px solid rgba(255,255,255,0.1)" 
      : (done ? `1px solid ${COLORS.primary}40` : "1px solid #f3f4f6"),
    transition: "all 0.3s ease",
    opacity: done ? 0.8 : 1,
    boxShadow: isZen ? "none" : "0 2px 5px rgba(0,0,0,0.02)",
  }),
  progressBarContainer: {
    height: "8px",
    width: "100%",
    backgroundColor: "#e0e7ff",
    borderRadius: "10px",
    marginBottom: "32px",
    overflow: "hidden",
  },
  suggestionBtn: {
    width: "100%",
    textAlign: "left",
    padding: "14px",
    borderRadius: "12px",
    background: "#fff",
    border: "1px solid #e5e7eb",
    marginBottom: "10px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
    color: COLORS.textPrimary,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    transition: "all 0.2s",
  }
};

const animationStyles = `
  .integrated-back-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 16px;
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    color: #374151;
    font-weight: 700;
    font-size: 13px;
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: 0 2px 5px rgba(0,0,0,0.05);
  }
  .integrated-back-btn:hover {
    border-color: ${COLORS.primary};
    color: ${COLORS.primary};
    transform: translateX(-3px);
  }
  .task-text-done {
    text-decoration: line-through;
    color: ${COLORS.textMuted};
  }
  @media (max-width: 900px) {
    .challenges-split { flex-direction: column !important; }
    .challenges-sidebar { width: 100% !important; order: 1; }
  }
`;

const DailyChallenges = ({ onBack }) => {
  const [tasks, setTasks] = useState([
    { text: "Drink a glass of water first thing", done: true },
    { text: "Write down 3 goals for today", done: false },
  ]);
  const [input, setInput] = useState("");
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
    const handleFsChange = () => { if (!document.fullscreenElement) setIsZen(false); };
    document.addEventListener("fullscreenchange", handleFsChange);
    return () => document.removeEventListener("fullscreenchange", handleFsChange);
  }, []);

  const addTask = (text = input) => {
    if (!text.trim()) return;
    setTasks([...tasks, { text: text, done: false }]);
    setInput("");
  };

  const toggleTask = (index) => {
    setTasks(tasks.map((t, i) => (i === index ? { ...t, done: !t.done } : t)));
  };

  const removeTask = (index) => {
    setTasks(tasks.filter((_, i) => i !== index));
  };

  const progress = tasks.length > 0 ? (tasks.filter(t => t.done).length / tasks.length) * 100 : 0;

  return (
    <div ref={containerRef} className="wb-main-wrapper" style={styles.mainWrapperCard(isZen)}>
      <style>{animationStyles}</style>

      {/* Floating Zen Controls */}
      <div style={{ position: 'absolute', top: '24px', right: '24px', display: 'flex', gap: '12px', zIndex: 101 }}>
        <button 
          onClick={toggleFullscreen}
          style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', padding: '12px', borderRadius: '14px', cursor: 'pointer', backdropFilter: 'blur(10px)' }}
        >
          {isZen ? <Minimize size={20} /> : <Maximize size={20} />}
        </button>
      </div>

      {/* Header */}
      {!isZen && (
        <div className="wb-hero" style={styles.heroSection}>
          <div style={styles.heroLeftContent}>
            <button className="integrated-back-btn" onClick={onBack}>
               <ArrowLeft size={16} />
               <span>Exit to Menu</span>
            </button>

            <div style={styles.heroIconBox}>
              <Target size={32} color="white" strokeWidth={2.5} />
            </div>
            
            <div>
              <h1 style={{ fontSize: "28px", fontWeight: "800", color: COLORS.textPrimary, margin: "0" }}>
                Daily Challenges
              </h1>
              <p style={{ fontSize: "14px", color: COLORS.textSecondary, margin: "2px 0 0 0" }}>
                Build habits and track your small wins.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Content Body */}
      <div style={styles.contentBody(isZen)}>
        
        <div className="challenges-split" style={styles.splitLayout}>
          
          {/* LEFT: Main List */}
          <div style={styles.mainListCard(isZen)}>
            
            {/* Progress Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', color: isZen ? '#ccc' : COLORS.textSecondary, fontSize: '13px', fontWeight: '600' }}>
              <span>Your Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div style={styles.progressBarContainer}>
              <div style={{ height: '100%', width: `${progress}%`, background: COLORS.primary, transition: 'width 0.5s cubic-bezier(0.4, 0, 0.2, 1)' }} />
            </div>

            {/* Input */}
            <div style={styles.inputGroup(isZen)}>
              <input 
                type="text" 
                placeholder="Add a new challenge..." 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addTask()}
                style={styles.inputField(isZen)}
              />
              <button style={styles.addBtn} onClick={() => addTask()}>
                <Plus size={24} />
              </button>
            </div>

            {/* List */}
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {tasks.length === 0 && (
                 <div style={{ textAlign: 'center', padding: '40px', color: COLORS.textMuted }}>
                    <CalendarCheck size={48} style={{ opacity: 0.2, marginBottom: '16px' }} />
                    <p>No challenges yet. Add one or pick from the list!</p>
                 </div>
              )}
              {tasks.map((task, i) => (
                <div key={i} style={styles.taskItem(task.done, isZen)}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1, cursor: 'pointer' }} onClick={() => toggleTask(i)}>
                    <div style={{ 
                      width: '24px', height: '24px', borderRadius: '50%', 
                      border: task.done ? `2px solid ${COLORS.primary}` : `2px solid #d1d5db`,
                      background: task.done ? COLORS.primary : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all 0.2s'
                    }}>
                      {task.done && <CheckCircle2 size={16} color="white" />}
                    </div>
                    <span style={{ 
                      fontSize: '16px', 
                      color: isZen ? (task.done ? '#6b7280' : '#fff') : (task.done ? '#9ca3af' : COLORS.textPrimary),
                      textDecoration: task.done ? 'line-through' : 'none',
                      transition: 'all 0.2s'
                    }}>
                      {task.text}
                    </span>
                  </div>
                  <button 
                    onClick={() => removeTask(i)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px', color: isZen ? '#6b7280' : '#9ca3af', opacity: 0.6 }}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>

          </div>

          {/* RIGHT: Suggestions (Hidden in Zen) */}
          {!isZen && (
            <div className="challenges-sidebar" style={styles.sidebar}>
              <div style={{ background: '#fef3c7', padding: '20px', borderRadius: '16px', border: '1px solid #fcd34d', marginBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#92400e', marginBottom: '8px' }}>
                  <Trophy size={20} />
                  <span style={{ fontWeight: '700' }}>Daily Goal</span>
                </div>
                <p style={{ fontSize: '13px', color: '#b45309', margin: 0, lineHeight: '1.5' }}>
                  Completing small tasks releases dopamine. Try to finish at least 3 tasks today!
                </p>
              </div>

              <h3 style={{ fontSize: "14px", color: COLORS.textMuted, textTransform: "uppercase", letterSpacing: "1px", marginTop: '10px' }}>
                Quick Add Suggestions
              </h3>
              
              {SUGGESTIONS.map((sug, idx) => (
                <button 
                  key={idx} 
                  style={styles.suggestionBtn}
                  onClick={() => addTask(sug)}
                >
                  {sug}
                  <Plus size={16} color={COLORS.primary} />
                </button>
              ))}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default DailyChallenges;