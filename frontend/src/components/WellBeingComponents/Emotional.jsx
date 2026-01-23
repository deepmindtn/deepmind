import React, { useState, useEffect, useRef } from "react";
import { 
  Heart, 
  PenTool, 
  Save, 
  Trash2, 
  Maximize, 
  Minimize, 
  Volume2, 
  VolumeX, 
  ArrowLeft,
  RefreshCw,
  Quote
} from "lucide-react";
import { useNavigate } from "react-router-dom";

// -----------------------
// Theme Constants
// -----------------------
const COLORS = {
  primary: "#ec4899", // Rose
  bgMain: "var(--bg-main)",
  cardBg: "var(--card-bg)",
  textPrimary: "var(--text-primary)",
  textSecondary: "var(--text-secondary)",
  textMuted: "var(--text-muted)",
  borderColor: "var(--border-color)",
  shadowHuge: "var(--shadow-huge)",
};

const PROMPTS = [
  "What are three things you are grateful for today?",
  "What is a challenge you faced recently, and how did you handle it?",
  "Describe a moment this week that made you smile.",
  "What does 'success' look like to you right now?",
  "Write a note of encouragement to your future self.",
  "What is weighing on your mind today? Let it out."
];

const MOODS = [
  { label: "Happy", icon: "😊" },
  { label: "Calm", icon: "😌" },
  { label: "Neutral", icon: "😐" },
  { label: "Sad", icon: "😔" },
  { label: "Stressed", icon: "😫" },
];

const styles = {
  mainWrapperCard: (isZen) => ({
    backgroundColor: isZen ? "#1a1a1a" : COLORS.cardBg,
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
  // FIX: Using alpha transparency (10%) instead of a light color to avoid the "white wash"
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
  editorCard: (isZen) => ({
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
  textArea: (isZen) => ({
    width: "100%",
    flex: 1,
    border: "none",
    resize: "none",
    outline: "none",
    fontSize: isZen ? "20px" : "17px",
    lineHeight: "1.8",
    color: isZen ? "#eee" : COLORS.textPrimary,
    background: "transparent",
    fontFamily: "'Georgia', 'Times New Roman', serif",
    marginTop: "24px",
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
  .mood-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 12px;
    border-radius: 12px;
    border: 1px solid var(--border-color);
    background: var(--bg-main);
    cursor: pointer;
    transition: all 0.2s;
    flex: 1;
    min-width: 65px;
  }
  .mood-btn:hover {
    border-color: ${COLORS.primary};
    background: ${COLORS.primary}10;
  }
  .mood-btn.selected {
    border-color: ${COLORS.primary};
    background: ${COLORS.primary}15;
    box-shadow: 0 0 0 2px ${COLORS.primary}20;
  }
  .action-btn {
    padding: 10px 20px;
    border-radius: 12px;
    font-weight: 700;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
    transition: all 0.2s;
  }
`;

const Emotional = ({ onBack }) => {
  const navigate = useNavigate();
  const [note, setNote] = useState("");
  const [selectedMood, setSelectedMood] = useState(null);
  const [promptIdx, setPromptIdx] = useState(0);
  const [isZen, setIsZen] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  
  const containerRef = useRef(null);
  const audioRef = useRef(new Audio("https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3"));

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

  useEffect(() => {
    audioRef.current.loop = true;
    audioRef.current.volume = 0.2;
    if (isZen && !isMuted) audioRef.current.play().catch(() => {});
    else audioRef.current.pause();
  }, [isZen, isMuted]);

  const handleSave = () => {
    if (!note.trim()) return;
    alert("Entry saved!");
    setNote("");
    setSelectedMood(null);
  };

  const nextPrompt = () => setPromptIdx((prev) => (prev + 1) % PROMPTS.length);

  const handleBack = () => {
    if (onBack) onBack();
    else navigate(-1);
  };

  return (
    <div ref={containerRef} style={styles.mainWrapperCard(isZen)}>
      <style>{animationStyles}</style>

      {/* Floating Zen Controls */}
      <div style={{ position: 'absolute', top: '24px', right: '24px', display: 'flex', gap: '12px', zIndex: 101 }}>
        <button 
          onClick={() => setIsMuted(!isMuted)}
          style={{ background: isZen ? 'rgba(255,255,255,0.1)' : COLORS.cardBg, border: `1px solid ${isZen ? 'rgba(255,255,255,0.2)' : COLORS.borderColor}`, color: isZen ? '#fff' : COLORS.textPrimary, padding: '10px', borderRadius: '12px', cursor: 'pointer', backdropFilter: 'blur(10px)' }}
        >
          {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
        </button>
        <button 
          onClick={toggleFullscreen}
          style={{ background: isZen ? 'rgba(255,255,255,0.1)' : COLORS.cardBg, border: `1px solid ${isZen ? 'rgba(255,255,255,0.2)' : COLORS.borderColor}`, color: isZen ? '#fff' : COLORS.textPrimary, padding: '10px', borderRadius: '12px', cursor: 'pointer', backdropFilter: 'blur(10px)' }}
        >
          {isZen ? <Minimize size={20} /> : <Maximize size={20} />}
        </button>
      </div>

      {/* Hero Header */}
      {!isZen && (
        <div style={styles.heroSection}>
          <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
            <button className="integrated-back-btn" onClick={handleBack}>
              <ArrowLeft size={16} />
              <span>Exit</span>
            </button>
            <div style={styles.heroIconBox}>
              <Heart size={36} strokeWidth={2.5} />
            </div>
            <div>
              <h1 style={{ fontSize: "32px", fontWeight: "800", color: COLORS.textPrimary, margin: "0 0 4px 0" }}>Emotional Journal</h1>
              <p style={{ fontSize: "16px", color: COLORS.textSecondary, margin: "0" }}>Reflect on your day and track your feelings.</p>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Body */}
      <div style={styles.contentBody(isZen)}>
        <div style={styles.layoutContainer(isZen)}>
          
          <div style={styles.editorCard(isZen)}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', marginBottom: '20px' }}>
              <div style={{ color: COLORS.primary, background: `${COLORS.primary}15`, padding: '10px', borderRadius: '12px' }}>
                <PenTool size={22} />
              </div>
              <div style={{ flex: 1 }}>
                 <p style={{ fontSize: '11px', fontWeight: '800', color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Daily Prompt</p>
                 <h3 style={{ fontSize: '19px', fontWeight: '700', color: isZen ? '#fff' : COLORS.textPrimary, margin: 0, lineHeight: '1.4' }}>
                   {PROMPTS[promptIdx]}
                 </h3>
              </div>
              {!isZen && (
                <button onClick={nextPrompt} style={{ background: 'none', border: 'none', cursor: 'pointer', color: COLORS.textMuted }}>
                  <RefreshCw size={18} />
                </button>
              )}
            </div>

            <div style={{ height: '1px', background: isZen ? 'rgba(255,255,255,0.1)' : COLORS.borderColor }} />

            <textarea
              placeholder="How are you feeling today?"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              style={styles.textArea(isZen)}
            />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '24px', paddingTop: '24px', borderTop: `1px solid ${isZen ? 'rgba(255,255,255,0.1)' : COLORS.borderColor}` }}>
               <div style={{ fontSize: '13px', color: COLORS.textMuted, fontWeight: '600' }}>
                 {note.split(/\s+/).filter(w => w).length} words
               </div>
               <div style={{ display: 'flex', gap: '12px' }}>
                  <button className="action-btn" style={{ background: 'none', border: `1px solid ${COLORS.borderColor}`, color: COLORS.textSecondary }} onClick={() => setNote("")}>
                    <Trash2 size={16} /> Clear
                  </button>
                  <button className="action-btn" style={{ background: COLORS.primary, border: 'none', color: 'white', boxShadow: `0 4px 12px ${COLORS.primary}40` }} onClick={handleSave}>
                    <Save size={16} /> Save Entry
                  </button>
               </div>
            </div>
          </div>

          {!isZen && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: '320px' }}>
              <div style={styles.sidebarCard}>
                <h4 style={{ margin: '0 0 20px 0', fontSize: '14px', fontWeight: '800', color: COLORS.textPrimary, display: 'flex', alignItems: 'center', gap: '8px', textTransform: 'uppercase' }}>
                  <Heart size={18} fill={COLORS.primary} color={COLORS.primary} />
                  Current Mood
                </h4>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                   {MOODS.map((m) => (
                     <button 
                        key={m.label}
                        className={`mood-btn ${selectedMood === m.label ? 'selected' : ''}`}
                        onClick={() => setSelectedMood(m.label)}
                     >
                       <span style={{ fontSize: '26px' }}>{m.icon}</span>
                       <span style={{ fontSize: '11px', marginTop: '6px', fontWeight: '700', color: COLORS.textSecondary }}>{m.label}</span>
                     </button>
                   ))}
                </div>
              </div>

              <div style={{ ...styles.sidebarCard, background: `${COLORS.primary}10`, borderColor: `${COLORS.primary}20` }}>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', color: COLORS.primary }}>
                   <Quote size={20} fill={COLORS.primary} />
                   <span style={{ fontWeight: '800', fontSize: '12px', textTransform: 'uppercase' }}>Inspiration</span>
                 </div>
                 <p style={{ fontStyle: 'italic', color: COLORS.textPrimary, fontSize: '15px', lineHeight: '1.6', margin: 0 }}>
                   "Your emotions are the slaves to your thoughts, and you are the slave to your emotions."
                 </p>
                 <p style={{ fontSize: '12px', color: COLORS.textMuted, marginTop: '12px', textAlign: 'right', fontWeight: '700' }}>— Elizabeth Gilbert</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Emotional;