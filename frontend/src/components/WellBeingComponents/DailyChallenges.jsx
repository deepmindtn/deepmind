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
  CalendarCheck,
  Circle
} from "lucide-react";
import { useNavigate } from "react-router-dom";

// -----------------------
// Theme Constants
// -----------------------
const COLORS = {
  primary: "#6366f1", // Indigo
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
  "🥗 Eat a healthy meal",
  "📖 Read 10 pages",
  "🧘‍♀️ 5 minutes of breathing"
];

const styles = {
  mainWrapperCard: (isZen) => ({
    backgroundColor: isZen ? "#0f172a" : COLORS.cardBg,
    borderRadius: isZen ? "0" : "24px",
    border: isZen ? "none" : `1px solid ${COLORS.borderColor}`,
    boxShadow: isZen ? "none" : COLORS.shadowHuge,
    width: "100%",
    margin: "0 auto",
    overflow: "hidden",
    fontFamily: "'Inter', system-ui, sans-serif",
    display: "flex",
    flexDirection: "column",
    height: isZen ? "100vh" : "calc(100vh - 40px)",
    position: "relative",
    transition: "all 0.5s ease",
  }),
  heroSection: {
    background: `linear-gradient(135deg, ${COLORS.primary}1A 0%, ${COLORS.cardBg} 100%)`,
    padding: "48px",
    borderBottom: `1px solid ${COLORS.borderColor}`,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
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
    boxShadow: `0 10px 25px -5px ${COLORS.primary}60`,
    color: "#fff",
  },
  contentBody: (isZen) => ({
    flex: 1,
    display: "flex",
    flexDirection: "column",
    padding: isZen ? "60px 0" : "32px",
    position: "relative",
    backgroundColor: isZen ? "transparent" : COLORS.bgMain,
    overflowY: "auto",
  }),
  layoutContainer: (isZen) => ({
    display: "flex",
    gap: "32px",
    height: "100%",
    maxWidth: isZen ? "800px" : "1200px",
    margin: "0 auto",
    width: "100%",
    flexDirection: "row",
    transition: "max-width 0.5s ease",
  }),
  mainListCard: (isZen) => ({
    flex: 2,
    backgroundColor: isZen ? "rgba(255,255,255,0.05)" : COLORS.cardBg,
    borderRadius: "24px",
    padding: isZen ? "48px" : "32px",
    display: "flex",
    flexDirection: "column",
    border: isZen ? "1px solid rgba(255,255,255,0.1)" : `1px solid ${COLORS.borderColor}`,
    boxShadow: isZen ? "none" : "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
    backdropFilter: isZen ? "blur(15px)" : "none",
    height: "100%",
    transition: "all 0.5s ease",
  }),
  sidebarCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: "20px",
    padding: "24px",
    border: `1px solid ${COLORS.borderColor}`,
    marginBottom: "24px",
  }
};

const animationStyles = `
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
  }
  .integrated-back-btn:hover {
    border-color: ${COLORS.primary};
    color: ${COLORS.primary};
    transform: translateX(-3px);
  }
  .suggestion-btn {
    width: 100%;
    text-align: left;
    padding: 14px 16px;
    border-radius: 12px;
    border: 1px solid var(--border-color);
    background: var(--bg-main);
    margin-bottom: 10px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 600;
    color: var(--text-secondary);
    display: flex;
    justify-content: space-between;
    align-items: center;
    transition: all 0.2s;
  }
  .suggestion-btn:hover {
    border-color: ${COLORS.primary};
    background: ${COLORS.primary}10;
  }
  .task-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 18px 20px;
    margin-bottom: 12px;
    border-radius: 16px;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
  .task-item:hover {
    transform: scale(1.01);
  }
`;

const DailyChallenges = ({ onBack }) => {
  const navigate = useNavigate();
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
    setTasks([{ text: text, done: false }, ...tasks]);
    setInput("");
  };

  const toggleTask = (index) => {
    setTasks(tasks.map((t, i) => (i === index ? { ...t, done: !t.done } : t)));
  };

  const removeTask = (index) => {
    setTasks(tasks.filter((_, i) => i !== index));
  };

  const progress = tasks.length > 0 ? (tasks.filter(t => t.done).length / tasks.length) * 100 : 0;

  const handleBack = () => {
    if (onBack) onBack();
    else navigate(-1);
  };

  return (
    <div ref={containerRef} style={styles.mainWrapperCard(isZen)}>
      <style>{animationStyles}</style>

      {/* Zen Controls */}
      <div style={{ position: 'absolute', top: '24px', right: '24px', zIndex: 101 }}>
        <button 
          onClick={toggleFullscreen}
          style={{ background: isZen ? 'rgba(255,255,255,0.1)' : COLORS.cardBg, border: `1px solid ${isZen ? 'rgba(255,255,255,0.2)' : COLORS.borderColor}`, color: isZen ? '#fff' : COLORS.textPrimary, padding: '10px', borderRadius: '12px', cursor: 'pointer', backdropFilter: 'blur(10px)' }}
        >
          {isZen ? <Minimize size={20} /> : <Maximize size={20} />}
        </button>
      </div>

      {!isZen && (
        <div style={styles.heroSection}>
          <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
            <button className="integrated-back-btn" onClick={handleBack}>
              <ArrowLeft size={16} />
              <span>Exit</span>
            </button>
            <div style={styles.heroIconBox}>
              <Target size={36} strokeWidth={2.5} />
            </div>
            <div>
              <h1 style={{ fontSize: "32px", fontWeight: "800", color: COLORS.textPrimary, margin: "0 0 4px 0" }}>Daily Challenges</h1>
              <p style={{ fontSize: "16px", color: COLORS.textSecondary, margin: "0" }}>Build habits and track your small wins.</p>
            </div>
          </div>
        </div>
      )}

      <div style={styles.contentBody(isZen)}>
        <div style={styles.layoutContainer(isZen)}>
          
          <div style={styles.mainListCard(isZen)}>
            {/* Progress Header */}
            <div style={{ marginBottom: '32px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', color: isZen ? '#fff' : COLORS.textPrimary, fontSize: '14px', fontWeight: '800' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Sparkles size={16} color={COLORS.primary} /> Productivity Score
                </span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div style={{ height: "10px", width: "100%", backgroundColor: isZen ? "rgba(255,255,255,0.1)" : "var(--border-color)", borderRadius: "10px", overflow: "hidden" }}>
                <div style={{ height: '100%', width: `${progress}%`, background: COLORS.primary, transition: 'width 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)', boxShadow: `0 0 15px ${COLORS.primary}60` }} />
              </div>
            </div>

            {/* Input Group */}
            <div style={{ display: "flex", gap: "12px", marginBottom: "32px", background: isZen ? "rgba(255,255,255,0.05)" : "var(--bg-main)", padding: "10px", borderRadius: "18px", border: `1px solid ${isZen ? "rgba(255,255,255,0.1)" : COLORS.borderColor}` }}>
              <input 
                type="text" 
                placeholder="What's your next challenge?" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addTask()}
                style={{ flex: 1, border: "none", background: "transparent", padding: "10px 15px", fontSize: "16px", outline: "none", color: isZen ? "#fff" : COLORS.textPrimary, fontWeight: "600" }}
              />
              <button onClick={() => addTask()} style={{ background: COLORS.primary, color: "white", border: "none", borderRadius: "12px", width: "48px", height: "48px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                <Plus size={24} />
              </button>
            </div>

            {/* List */}
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {tasks.length === 0 && (
                 <div style={{ textAlign: 'center', padding: '60px 0', color: COLORS.textMuted }}>
                    <CalendarCheck size={56} style={{ opacity: 0.2, marginBottom: '20px' }} />
                    <p style={{ fontWeight: '600' }}>No active challenges. Add one to start your streak!</p>
                 </div>
              )}
              {tasks.map((task, i) => (
                <div key={i} className="task-item" style={{ 
                  background: task.done ? (isZen ? 'rgba(99, 102, 241, 0.15)' : `${COLORS.primary}08`) : (isZen ? 'rgba(255,255,255,0.03)' : 'transparent'),
                  border: `1px solid ${task.done ? `${COLORS.primary}30` : (isZen ? 'rgba(255,255,255,0.1)' : COLORS.borderColor)}`
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1, cursor: 'pointer' }} onClick={() => toggleTask(i)}>
                    <div style={{ transition: 'all 0.2s' }}>
                      {task.done ? <CheckCircle2 size={24} color={COLORS.primary} fill={`${COLORS.primary}20`} /> : <Circle size={24} color={isZen ? 'rgba(255,255,255,0.3)' : '#cbd5e1'} />}
                    </div>
                    <span style={{ 
                      fontSize: '17px', 
                      fontWeight: '600',
                      color: isZen ? (task.done ? '#64748b' : '#fff') : (task.done ? COLORS.textMuted : COLORS.textPrimary),
                      textDecoration: task.done ? 'line-through' : 'none',
                    }}>
                      {task.text}
                    </span>
                  </div>
                  <button onClick={() => removeTask(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px', color: '#ef4444', opacity: 0.7 }}>
                    <Trash2 size={20} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {!isZen && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: '340px' }}>
              <div style={{ ...styles.sidebarCard, background: '#fffbeb', borderColor: '#fef3c7' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#92400e', marginBottom: '12px' }}>
                  <Trophy size={22} />
                  <span style={{ fontWeight: '800', fontSize: '12px', textTransform: 'uppercase' }}>Daily Achievement</span>
                </div>
                <p style={{ fontSize: '14px', color: '#b45309', margin: 0, lineHeight: '1.6', fontWeight: '500' }}>
                  Small wins lead to big changes. Complete 3 tasks today to earn a focus badge!
                </p>
              </div>

              <div style={styles.sidebarCard}>
                <h3 style={{ fontSize: "12px", color: COLORS.textMuted, fontWeight: "800", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "20px" }}>Quick Start Ideas</h3>
                {SUGGESTIONS.map((sug, idx) => (
                  <button key={idx} className="suggestion-btn" onClick={() => addTask(sug)}>
                    {sug}
                    <Plus size={16} />
                  </button>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default DailyChallenges;