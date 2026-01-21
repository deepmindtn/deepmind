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
  BookOpen
} from "lucide-react";

// -----------------------
// Theme Constants
// -----------------------
const COLORS = {
  primary: "#ec4899", // Pink/Rose for Emotion
  primaryLight: "#fce7f3", 
  primaryDark: "#be185d",
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
    boxShadow: "0 10px 20px -5px rgba(236, 72, 153, 0.4)",
  },
  contentBody: (isZen) => ({
    flex: 1,
    display: "flex",
    flexDirection: "column",
    padding: isZen ? "60px 20% 40px 20%" : "40px", // Centered writing column in Zen
    position: "relative",
    backgroundImage: isZen 
      ? `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url('https://images.unsplash.com/photo-1499750310159-577503763d23?auto=format&fit=crop&q=80&w=2000')` // Soft paper/desk background
      : "none",
    backgroundSize: "cover",
    backgroundPosition: "center",
    overflowY: "auto",
    transition: "all 0.5s ease",
  }),
  splitLayout: {
    display: "flex",
    gap: "40px",
    height: "100%",
    width: "100%",
    maxWidth: "1100px",
    margin: "0 auto",
  },
  editorCard: (isZen) => ({
    flex: 2,
    backgroundColor: isZen ? "rgba(255,255,255,0.05)" : "#fff",
    borderRadius: "24px",
    padding: "32px",
    display: "flex",
    flexDirection: "column",
    border: isZen ? "none" : `1px solid ${COLORS.borderColor}`,
    boxShadow: isZen ? "none" : "0 4px 20px rgba(0,0,0,0.03)",
    backdropFilter: isZen ? "blur(10px)" : "none",
    transition: "all 0.5s ease",
    height: "100%",
  }),
  sidebar: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "24px",
  },
  textArea: (isZen) => ({
    width: "100%",
    flex: 1,
    border: "none",
    resize: "none",
    outline: "none",
    fontSize: isZen ? "20px" : "16px",
    lineHeight: "1.8",
    color: isZen ? "#eee" : COLORS.textPrimary,
    background: "transparent",
    fontFamily: "'Georgia', serif", // Serif font for writing feels better
    marginTop: "20px",
  }),
  promptCard: {
    background: COLORS.primaryLight,
    padding: "20px",
    borderRadius: "16px",
    border: `1px solid ${COLORS.primary}40`,
  },
  moodBtn: (isSelected) => ({
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "12px",
    borderRadius: "12px",
    border: isSelected ? `2px solid ${COLORS.primary}` : "1px solid #e5e7eb",
    background: isSelected ? "#fff0f7" : "#fff",
    cursor: "pointer",
    transition: "all 0.2s",
    flex: 1,
  }),
  controlBtn: (isZen) => ({
    padding: "10px 20px",
    borderRadius: "12px",
    border: `1px solid ${isZen ? "rgba(255,255,255,0.3)" : COLORS.borderColor}`,
    backgroundColor: isZen ? "rgba(0,0,0,0.5)" : "#fff",
    color: isZen ? "#fff" : COLORS.textPrimary,
    fontWeight: "600",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "14px",
    transition: "all 0.2s",
  })
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
  @media (max-width: 900px) {
    .emotional-split { flex-direction: column !important; }
    .emotional-sidebar { width: 100% !important; order: -1; }
  }
`;

const Emotional = ({ onBack }) => {
  const [note, setNote] = useState("");
  const [selectedMood, setSelectedMood] = useState(null);
  const [promptIdx, setPromptIdx] = useState(0);
  const [isZen, setIsZen] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  
  const containerRef = useRef(null);
  // Soft piano/rain ambient sound
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
    audioRef.current.volume = 0.3;
    if (isZen && !isMuted) audioRef.current.play().catch(() => {});
    else audioRef.current.pause();
  }, [isZen, isMuted]); // Play audio primarily in Zen mode or if manually unmuted

  const handleSave = () => {
    if (!note.trim()) return;
    alert("Entry saved to your local storage! (Simulation)");
    setNote("");
    setSelectedMood(null);
  };

  const nextPrompt = () => {
    setPromptIdx((prev) => (prev + 1) % PROMPTS.length);
  };

  return (
    <div ref={containerRef} className="wb-main-wrapper" style={styles.mainWrapperCard(isZen)}>
      <style>{animationStyles}</style>

      {/* Floating Zen Controls */}
      <div style={{ position: 'absolute', top: '24px', right: '24px', display: 'flex', gap: '12px', zIndex: 101 }}>
        <button 
          onClick={() => setIsMuted(!isMuted)}
          style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', padding: '12px', borderRadius: '14px', cursor: 'pointer', backdropFilter: 'blur(10px)' }}
        >
          {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
        </button>
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
              <Heart size={32} color="white" strokeWidth={2.5} />
            </div>
            
            <div>
              <h1 style={{ fontSize: "28px", fontWeight: "800", color: COLORS.textPrimary, margin: "0" }}>
                Emotional Journal
              </h1>
              <p style={{ fontSize: "14px", color: COLORS.textSecondary, margin: "2px 0 0 0" }}>
                Reflect on your day and track your feelings.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Content Body */}
      <div style={styles.contentBody(isZen)}>
        
        <div className="emotional-split" style={styles.splitLayout}>
          
          {/* LEFT: Editor Area */}
          <div style={styles.editorCard(isZen)}>
            {/* Prompt Display in Editor */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '16px' }}>
              <PenTool size={20} color={isZen ? "#fff" : COLORS.primary} style={{ marginTop: '4px' }}/>
              <div>
                 <p style={{ 
                   fontSize: '12px', 
                   textTransform: 'uppercase', 
                   letterSpacing: '1px', 
                   color: isZen ? 'rgba(255,255,255,0.6)' : COLORS.textMuted,
                   marginBottom: '4px' 
                 }}>
                   Daily Prompt
                 </p>
                 <h3 style={{ 
                   fontSize: '18px', 
                   fontWeight: '600', 
                   color: isZen ? '#fff' : COLORS.textPrimary, 
                   margin: 0 
                 }}>
                   {PROMPTS[promptIdx]}
                 </h3>
              </div>
              {!isZen && (
                <button onClick={nextPrompt} style={{ background: 'none', border: 'none', cursor: 'pointer', marginLeft: 'auto' }}>
                  <RefreshCw size={18} color={COLORS.textMuted} />
                </button>
              )}
            </div>

            <hr style={{ border: '0', borderBottom: `1px solid ${isZen ? 'rgba(255,255,255,0.1)' : '#eee'}` }} />

            <textarea
              placeholder="Start writing your thoughts here..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              style={styles.textArea(isZen)}
            />

            {/* Footer Actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px', paddingTop: '20px', borderTop: `1px solid ${isZen ? 'rgba(255,255,255,0.1)' : '#eee'}` }}>
               <div style={{ fontSize: '12px', color: isZen ? 'rgba(255,255,255,0.5)' : COLORS.textMuted, display: 'flex', alignItems: 'center' }}>
                 {note.split(" ").filter(w => w).length} words
               </div>
               <div style={{ display: 'flex', gap: '10px' }}>
                  <button style={styles.controlBtn(isZen)} onClick={() => setNote("")}>
                    <Trash2 size={16} />
                    Clear
                  </button>
                  <button 
                    style={{ ...styles.controlBtn(isZen), backgroundColor: isZen ? COLORS.primary : COLORS.primary, color: 'white', border: 'none' }} 
                    onClick={handleSave}
                  >
                    <Save size={16} />
                    Save Entry
                  </button>
               </div>
            </div>
          </div>

          {/* RIGHT: Sidebar (Moods) - Hides in Zen Mode */}
          {!isZen && (
            <div className="emotional-sidebar" style={styles.sidebar}>
              
              {/* Mood Selector */}
              <div style={{ background: '#fff', borderRadius: '24px', padding: '24px', border: `1px solid ${COLORS.borderColor}` }}>
                <h4 style={{ margin: '0 0 16px 0', fontSize: '16px', color: COLORS.textPrimary, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Heart size={18} fill={COLORS.primary} color={COLORS.primary} />
                  How are you feeling?
                </h4>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                   {MOODS.map((m) => (
                     <button 
                        key={m.label}
                        style={styles.moodBtn(selectedMood === m.label)}
                        onClick={() => setSelectedMood(m.label)}
                     >
                       <span style={{ fontSize: '24px' }}>{m.icon}</span>
                       <span style={{ fontSize: '11px', marginTop: '4px', fontWeight: '600', color: COLORS.textSecondary }}>{m.label}</span>
                     </button>
                   ))}
                </div>
              </div>

              {/* Inspiration Card */}
              <div style={styles.promptCard}>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: COLORS.primaryDark }}>
                   <BookOpen size={18} />
                   <span style={{ fontWeight: '700', fontSize: '14px' }}>Quote of the day</span>
                 </div>
                 <p style={{ fontStyle: 'italic', color: COLORS.textPrimary, fontSize: '14px', lineHeight: '1.6' }}>
                   "Your emotions are the slaves to your thoughts, and you are the slave to your emotions."
                 </p>
                 <p style={{ fontSize: '12px', color: COLORS.textSecondary, marginTop: '8px', textAlign: 'right' }}>— Elizabeth Gilbert</p>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default Emotional;