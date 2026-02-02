import React, { useState, useEffect, useRef } from "react";
import { 
  CheckCircle2, Plus, Trash2, Target, Trophy, Maximize, Minimize, 
  ArrowLeft, Sparkles, CalendarCheck, Circle, Loader2, AlertCircle, X, CheckCircle
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
    display: flex; align-items: center; gap: 8px; padding: 10px 16px;
    background: var(--bg-main); border: 1px solid var(--border-color);
    border-radius: 12px; color: var(--text-secondary); font-weight: 700;
    font-size: 13px; cursor: pointer; transition: all 0.2s ease;
  }
  .integrated-back-btn:hover { border-color: ${COLORS.primary}; color: ${COLORS.primary}; transform: translateX(-3px); }
  .suggestion-btn {
    width: 100%; text-align: left; padding: 14px 16px; border-radius: 12px;
    border: 1px solid var(--border-color); background: var(--bg-main); margin-bottom: 10px;
    cursor: pointer; font-size: 14px; font-weight: 600; color: var(--text-secondary);
    display: flex; justify-content: space-between; align-items: center; transition: all 0.2s;
  }
  .suggestion-btn:hover { border-color: ${COLORS.primary}; background: ${COLORS.primary}10; }
  .task-item {
    display: flex; align-items: center; justify-content: space-between; padding: 18px 20px;
    margin-bottom: 12px; border-radius: 16px; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
  .task-item:hover { transform: scale(1.01); }
`;

// --- TOAST NOTIFICATION COMPONENT ---
const Toast = ({ message, type, onClose }) => {
  const isError = type === "error";
  return (
    <div style={{
        position: "fixed", bottom: "24px", right: "24px",
        backgroundColor: isError ? "#FEF2F2" : "#ECFDF5",
        border: `1px solid ${isError ? "#FECACA" : "#A7F3D0"}`,
        color: isError ? "#991B1B" : "#065F46",
        padding: "16px 20px", borderRadius: "12px",
        boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
        display: "flex", alignItems: "center", gap: "12px",
        zIndex: 99999, animation: "slideIn 0.3s ease-out", maxWidth: "400px",
      }}>
      {isError ? <AlertCircle size={20} /> : <CheckCircle size={20} />}
      <span style={{ fontWeight: "500", fontSize: "14px" }}>{message}</span>
      <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", marginLeft: "auto", color: "inherit", opacity: 0.7 }}>
        <X size={16} />
      </button>
      <style>{`@keyframes slideIn { from { transform: translateY(100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }`}</style>
    </div>
  );
};

const DailyChallenges = ({ onBack }) => {
  const navigate = useNavigate();
  const API_BASE = "http://localhost:8080";
  const access = localStorage.getItem("access");
  const authHeader = access ? { Authorization: `Bearer ${access}` } : {};

  const [tasks, setTasks] = useState([]);
  const [input, setInput] = useState("");
  const [isZen, setIsZen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null); // ✅ Toast State

  const containerRef = useRef(null);

  // Auto-dismiss Toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // --- 1. Fetch Challenges ---
  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/employee/challenges/`, { headers: authHeader });
      if (res.ok) {
        const data = await res.json();
        const mapped = data.map(t => ({ ...t, done: t.is_completed }));
        setTasks(mapped);
      }
    } catch (error) {
      console.error("Failed to load challenges", error);
    } finally {
      setLoading(false);
    }
  };

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

  // --- 2. Add Challenge ---
  const addTask = async (text = input) => {
    if (!text.trim()) return;
    
    // Optimistic Update
    const tempId = Date.now();
    const newTask = { id: tempId, text: text, done: false, isTemp: true };
    setTasks([newTask, ...tasks]);
    setInput("");

    try {
      const res = await fetch(`${API_BASE}/api/employee/challenges/`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeader },
        body: JSON.stringify({ text: text })
      });

      if (res.ok) {
        const savedTask = await res.json();
        setTasks(prev => prev.map(t => t.id === tempId ? { ...savedTask, done: savedTask.is_completed } : t));
        setToast({ message: "Challenge Added Successfully!", type: "success" }); // ✅ Success Toast
      } else {
        setTasks(prev => prev.filter(t => t.id !== tempId));
        setToast({ message: "Failed to add challenge.", type: "error" });
      }
    } catch (error) {
      console.error("Failed to add", error);
      setTasks(prev => prev.filter(t => t.id !== tempId));
      setToast({ message: "Network error.", type: "error" });
    }
  };

  // --- 3. Toggle Completion ---
  const toggleTask = async (index, id) => {
    const taskToUpdate = tasks[index];
    const newStatus = !taskToUpdate.done;

    // Optimistic Update
    const newTasks = [...tasks];
    newTasks[index].done = newStatus;
    setTasks(newTasks);

    try {
      await fetch(`${API_BASE}/api/employee/challenges/${id}/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...authHeader },
        body: JSON.stringify({ is_completed: newStatus })
      });
    } catch (error) {
      console.error("Failed to toggle", error);
      newTasks[index].done = !newStatus;
      setTasks(newTasks);
      setToast({ message: "Failed to update status.", type: "error" });
    }
  };

  // --- 4. Delete Challenge ---
  const removeTask = async (index, id) => {
    // Optimistic Update
    const originalTasks = [...tasks];
    setTasks(tasks.filter((_, i) => i !== index));

    try {
      const res = await fetch(`${API_BASE}/api/employee/challenges/${id}/`, {
        method: "DELETE",
        headers: authHeader
      });
      if (res.ok) {
        setToast({ message: "Challenge Deleted Successfully!", type: "success" }); // ✅ Success Toast
      } else {
        setTasks(originalTasks);
        setToast({ message: "Failed to delete challenge.", type: "error" });
      }
    } catch (error) {
      console.error("Failed to delete", error);
      setTasks(originalTasks);
      setToast({ message: "Network error.", type: "error" });
    }
  };

  const progress = tasks.length > 0 ? (tasks.filter(t => t.done).length / tasks.length) * 100 : 0;

  const handleBack = () => {
    if (onBack) onBack();
    else navigate(-1);
  };

  return (
    // ✅ WRAPPED IN FRAGMENT FOR TOAST VISIBILITY
    <>
      <style>{animationStyles}</style>

      {/* ✅ TOAST RENDERED HERE */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div ref={containerRef} style={styles.mainWrapperCard(isZen)}>
        
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
                {loading ? (
                   <div style={{textAlign: "center", padding: "40px"}}><Loader2 className="animate-spin" /></div>
                ) : tasks.length === 0 ? (
                   <div style={{ textAlign: 'center', padding: '60px 0', color: COLORS.textMuted }}>
                      <CalendarCheck size={56} style={{ opacity: 0.2, marginBottom: '20px' }} />
                      <p style={{ fontWeight: '600' }}>No active challenges. Add one to start your streak!</p>
                   </div>
                ) : (
                   tasks.map((task, i) => (
                    <div key={task.id || i} className="task-item" style={{ 
                      background: task.done ? (isZen ? 'rgba(99, 102, 241, 0.15)' : `${COLORS.primary}08`) : (isZen ? 'rgba(255,255,255,0.03)' : 'transparent'),
                      border: `1px solid ${task.done ? `${COLORS.primary}30` : (isZen ? 'rgba(255,255,255,0.1)' : COLORS.borderColor)}`,
                      opacity: task.isTemp ? 0.5 : 1
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1, cursor: 'pointer' }} onClick={() => toggleTask(i, task.id)}>
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
                      <button onClick={() => removeTask(i, task.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px', color: '#ef4444', opacity: 0.7 }}>
                        <Trash2 size={20} />
                      </button>
                    </div>
                  ))
                )}
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
    </>
  );
};

export default DailyChallenges;