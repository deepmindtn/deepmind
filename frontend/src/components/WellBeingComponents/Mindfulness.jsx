import React, { useState, useEffect, useRef } from "react";
import { 
  Wind, 
  Play, 
  Pause, 
  RotateCcw, 
  Info, 
  Maximize, 
  Minimize, 
  Volume2, 
  VolumeX,
  ArrowLeft 
} from "lucide-react";

// -----------------------
// Theme Constants
// -----------------------
const COLORS = {
  primary: "var(--primary)",
  primaryLight: "var(--primary-light)",
  primaryDark: "var(--primary-dark)",
  bgMain: "var(--bg-main)",
  cardBg: "var(--card-bg)",
  textPrimary: "var(--text-primary)",
  textSecondary: "var(--text-secondary)",
  textMuted: "var(--text-muted)",
  borderColor: "var(--border-color)",
  shadowHuge: "var(--shadow-huge)",
  emeraldGlow: "rgba(16, 185, 129, 0.5)",
};

const styles = {
  mainWrapperCard: (isZen) => ({
    backgroundColor: isZen ? "#000" : COLORS.cardBg,
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
    transition: "background 0.5s ease",
  }),
  heroSection: {
    background: `linear-gradient(135deg, ${COLORS.primaryLight} 0%, ${COLORS.cardBg} 100%)`,
    padding: "32px 48px",
    borderBottom: `1px solid ${COLORS.borderColor}`,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between", // Keeps back/title left and icons right
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
    boxShadow: "0 10px 20px -5px rgba(16, 185, 129, 0.3)",
  },
  contentBody: (isZen) => ({
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "40px 20px",
    position: "relative",
    backgroundImage: isZen 
      ? `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url('https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=2000')`
      : "none",
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundColor: isZen ? "#000" : COLORS.bgMain,
    transition: "all 0.8s ease",
  }),
  breathingCircle: (isActive, isZen) => ({
    width: isZen ? "320px" : "260px",
    height: isZen ? "320px" : "260px",
    borderRadius: "50%",
    border: "4px solid rgba(255,255,255,0.1)",
    background: `radial-gradient(circle at 30% 30%, ${COLORS.primary} 0%, ${COLORS.primaryDark} 100%)`,
    color: "#fff",
    fontSize: "3rem",
    fontWeight: "800",
    cursor: "pointer",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
    boxShadow: isActive 
      ? `0 0 100px ${COLORS.emeraldGlow}, inset 0 0 20px rgba(255,255,255,0.2)` 
      : `0 10px 30px rgba(16, 185, 129, 0.2)`,
    zIndex: 10,
  }),
  controls: {
    display: "flex",
    gap: "16px",
    marginTop: "48px",
    zIndex: 10,
  },
  controlBtn: (isZen) => ({
    padding: "12px 28px",
    borderRadius: "14px",
    border: `1px solid ${isZen ? "rgba(255,255,255,0.3)" : COLORS.borderColor}`,
    backgroundColor: isZen ? "rgba(0,0,0,0.5)" : COLORS.cardBg,
    color: isZen ? "#fff" : COLORS.textPrimary,
    fontWeight: "700",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    transition: "all 0.2s",
    backdropFilter: isZen ? "blur(10px)" : "none",
  })
};

const animationStyles = `
  @keyframes breatheOrb {
    0%, 100% { transform: scale(1); box-shadow: 0 0 40px ${COLORS.emeraldGlow}; }
    50% { transform: scale(1.18); box-shadow: 0 0 100px ${COLORS.emeraldGlow}; }
  }
  .orb-active { animation: breatheOrb 6s ease-in-out infinite !important; }

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
`;

const Mindfulness = ({ onBack }) => {
  const [timeLeft, setTimeLeft] = useState(180);
  const [active, setActive] = useState(false);
  const [phase, setPhase] = useState("Inhale");
  const [isZen, setIsZen] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  
  const containerRef = useRef(null);
  const audioRef = useRef(new Audio("https://www.soundhelix.com/examples/mp3/SoundHelix-Song-17.mp3"));

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
    if (active && !isMuted) audioRef.current.play().catch(() => {});
    else audioRef.current.pause();
  }, [active, isMuted]);

  useEffect(() => {
    let interval;
    if (active && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [active, timeLeft]);

  useEffect(() => {
    let phaseInterval;
    if (active) {
      phaseInterval = setInterval(() => {
        setPhase((prev) => (prev === "Inhale" ? "Exhale" : "Inhale"));
      }, 3000);
    } else {
      setPhase("Focus");
    }
    return () => clearInterval(phaseInterval);
  }, [active]);

  const resetSession = () => {
    setActive(false);
    setTimeLeft(180);
    setPhase("Focus");
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <div ref={containerRef} className="wb-main-wrapper" style={styles.mainWrapperCard(isZen)}>
      <style>{animationStyles}</style>

      {/* Persistent Floating Zen Controls (Always Top Right) */}
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

      {/* Integrated Header */}
      {!isZen && (
        <div className="wb-hero" style={styles.heroSection}>
          <div style={styles.heroLeftContent}>
            {/* Integrated Back Button */}
            <button className="integrated-back-btn" onClick={onBack}>
               <ArrowLeft size={16} />
               <span>Exit to Menu</span>
            </button>

            <div style={styles.heroIconBox}>
              <Wind size={32} color="white" strokeWidth={2.5} />
            </div>
            
            <div>
              <h1 style={{ fontSize: "28px", fontWeight: "800", color: COLORS.textPrimary, margin: "0" }}>
                Mindfulness Center
              </h1>
              <p style={{ fontSize: "14px", color: COLORS.textSecondary, margin: "2px 0 0 0" }}>
                Take a moment for yourself.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Experience Body */}
      <div style={styles.contentBody(isZen)}>
        <button
          className={active ? "orb-active" : ""}
          style={styles.breathingCircle(active, isZen)}
          onClick={() => setActive(!active)}
        >
          <span style={{ fontSize: "12px", opacity: 0.9, fontWeight: "700", letterSpacing: "1px", marginBottom: "4px" }}>
            {active ? "REMAINING" : "START"}
          </span>
          {formatTime(timeLeft)}
        </button>

        <p style={{ 
          fontSize: isZen ? "44px" : "32px", 
          fontWeight: "900", 
          color: isZen ? "#fff" : COLORS.primary, 
          marginTop: "48px",
          letterSpacing: "6px",
          textTransform: "uppercase",
          textShadow: isZen ? "0 4px 20px rgba(0,0,0,0.4)" : "none"
        }}>
          {active ? phase : "Ready?"}
        </p>

        <div style={styles.controls}>
          <button style={styles.controlBtn(isZen)} onClick={() => setActive(!active)}>
            {active ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
            {active ? "Pause" : "Start"}
          </button>
          
          <button style={styles.controlBtn(isZen)} onClick={resetSession}>
            <RotateCcw size={20} />
            Restart
          </button>
        </div>

        {!isZen && !active && (
          <div style={{ marginTop: '32px', color: COLORS.textMuted, display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
            <Info size={16} /> Use Fullscreen mode for the best experience.
          </div>
        )}
      </div>
    </div>
  );
};

export default Mindfulness;