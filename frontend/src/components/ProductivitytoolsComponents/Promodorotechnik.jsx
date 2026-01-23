import React, { useState, useEffect, useRef } from "react";
import {
  Clock,
  Play,
  Pause,
  RotateCcw,
  Coffee,
  Brain,
  Maximize,
  Minimize,
  ArrowLeft,
  Volume2,
  VolumeX,
  Trophy,
  Flame,
  Music,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

// -----------------------
// Theme Constants
// -----------------------
const COLORS = {
  work: "#ef4444",
  break: "#10b981",
  longBreak: "#3b82f6",
  primary: "var(--primary)",
  primaryLight: "var(--primary-light)",
  bgMain: "var(--bg-main)",
  cardBg: "var(--card-bg)",
  textPrimary: "var(--text-primary)",
  textSecondary: "var(--text-secondary)",
  textMuted: "var(--text-muted)",
  borderColor: "var(--border-color)",
  shadowHuge: "var(--shadow-huge)",
};

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
    height: isZen ? "100vh" : "calc(100vh - 40px)",
    position: "relative",
    transition: "all 0.5s ease",
  }),
  heroSection: (activeColor) => ({
    background: `linear-gradient(135deg, ${activeColor}15 0%, ${COLORS.cardBg} 100%)`,
    padding: "48px",
    borderBottom: `1px solid ${COLORS.borderColor}`,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  }),
  heroIconBox: (activeColor) => ({
    width: "72px",
    height: "72px",
    borderRadius: "20px",
    backgroundColor: activeColor,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    boxShadow: `0 10px 25px -5px ${activeColor}60`,
    color: "#fff",
    transition: "all 0.5s ease",
  }),
  contentBody: (isZen) => ({
    flex: 1,
    display: "flex",
    flexDirection: "column",
    padding: isZen ? "40px" : "32px",
    position: "relative",
    overflowY: "auto",
    backgroundColor: isZen ? "transparent" : COLORS.bgMain,
  }),
  timerCircle: (activeColor) => ({
    position: "relative",
    width: "380px",
    height: "380px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  }),
  sidebarCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: "20px",
    padding: "24px",
    border: `1px solid ${COLORS.borderColor}`,
    marginBottom: "20px",
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
    border-color: var(--primary);
    color: var(--primary);
    transform: translateX(-3px);
  }
  .sound-btn {
    width: 100%;
    text-align: left;
    padding: 12px 16px;
    border-radius: 12px;
    border: 1px solid var(--border-color);
    background: var(--bg-main);
    margin-bottom: 8px;
    cursor: pointer;
    font-size: 13px;
    font-weight: 600;
    color: var(--text-secondary);
    transition: all 0.2s ease;
  }
  .sound-btn:hover {
    border-color: var(--primary);
    background: var(--primary-light);
  }
  .control-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(0,0,0,0.1);
  }
`;

const Pomodoro = ({ onBack }) => {
  const navigate = useNavigate();
  const WORK_TIME = 25 * 60;
  const SHORT_BREAK = 5 * 60;
  const LONG_BREAK = 15 * 60;

  const [timeLeft, setTimeLeft] = useState(WORK_TIME);
  const [active, setActive] = useState(false);
  const [sessionType, setSessionType] = useState("Work");
  const [pomodoroCount, setPomodoroCount] = useState(0);
  const [isZen, setIsZen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const containerRef = useRef(null);
  
  const totalTime = sessionType === "Work" ? WORK_TIME : sessionType === "Short Break" ? SHORT_BREAK : LONG_BREAK;
  const progress = ((totalTime - timeLeft) / totalTime) * 100;
  const activeColor = sessionType === "Work" ? COLORS.work : sessionType === "Short Break" ? COLORS.break : COLORS.longBreak;

  useEffect(() => {
    let interval;
    if (active && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    } else if (active && timeLeft === 0) {
      handleSessionEnd();
    }
    return () => clearInterval(interval);
  }, [active, timeLeft]);

  const handleSessionEnd = () => {
    if (!isMuted) {
      new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3").play().catch(() => {});
    }
    setActive(false);
    if (sessionType === "Work") {
      const newCount = pomodoroCount + 1;
      setPomodoroCount(newCount);
      if (newCount % 4 === 0) {
        setSessionType("Long Break");
        setTimeLeft(LONG_BREAK);
      } else {
        setSessionType("Short Break");
        setTimeLeft(SHORT_BREAK);
      }
    } else {
      setSessionType("Work");
      setTimeLeft(WORK_TIME);
    }
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m < 10 ? "0" : ""}${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch((err) => console.error(err));
      setIsZen(true);
    } else {
      document.exitFullscreen();
      setIsZen(false);
    }
  };

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
          style={{ 
            background: isZen ? 'rgba(255,255,255,0.1)' : COLORS.cardBg, 
            border: `1px solid ${isZen ? 'rgba(255,255,255,0.2)' : COLORS.borderColor}`, 
            color: isZen ? '#fff' : COLORS.textPrimary, 
            padding: '10px', borderRadius: '12px', cursor: 'pointer', backdropFilter: 'blur(10px)'
          }}
        >
          {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
        </button>
        <button 
          onClick={toggleFullscreen}
          style={{ 
            background: isZen ? 'rgba(255,255,255,0.1)' : COLORS.cardBg, 
            border: `1px solid ${isZen ? 'rgba(255,255,255,0.2)' : COLORS.borderColor}`, 
            color: isZen ? '#fff' : COLORS.textPrimary, 
            padding: '10px', borderRadius: '12px', cursor: 'pointer', backdropFilter: 'blur(10px)'
          }}
        >
          {isZen ? <Minimize size={20} /> : <Maximize size={20} />}
        </button>
      </div>

      {/* Hero Header */}
      {!isZen && (
        <div style={styles.heroSection(activeColor)}>
          <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
            <button className="integrated-back-btn" onClick={handleBack}>
              <ArrowLeft size={16} />
              <span>Exit</span>
            </button>
            <div style={styles.heroIconBox(activeColor)}>
              <Clock size={36} strokeWidth={2.5} />
            </div>
            <div>
              <h1 style={{ fontSize: "32px", fontWeight: "800", color: COLORS.textPrimary, margin: "0 0 4px 0" }}>Focus Flow</h1>
              <p style={{ fontSize: "16px", color: COLORS.textSecondary, margin: "0" }}>Deep work sessions and strategic recovery.</p>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Body */}
      <div style={styles.contentBody(isZen)}>
        <div style={{ 
          display: "flex", 
          gap: "60px", 
          height: "100%", 
          maxWidth: "1200px", 
          margin: "0 auto", 
          width: "100%", 
          alignItems: "center" 
        }}>
          
          {/* Left: Timer Display */}
          <div style={{ flex: 1.5, display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div style={styles.timerCircle(activeColor)}>
              <svg style={{ position: "absolute", transform: "rotate(-90deg)", width: "100%", height: "100%" }}>
                <circle cx="190" cy="190" r="180" fill="none" stroke={isZen ? "rgba(255,255,255,0.05)" : "var(--border-color)"} strokeWidth="12" />
                <circle cx="190" cy="190" r="180" fill="none" stroke={activeColor} strokeWidth="12" strokeDasharray={1131} strokeDashoffset={1131 - (1131 * progress) / 100} strokeLinecap="round" style={{ transition: "stroke-dashoffset 1s linear, stroke 0.5s ease" }} />
              </svg>

              <div style={{ textAlign: "center", zIndex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", justifyContent: "center", color: activeColor, fontWeight: "800", textTransform: "uppercase", letterSpacing: "2px", fontSize: "14px", marginBottom: "8px" }}>
                  {sessionType === "Work" ? <Brain size={20} /> : <Coffee size={20} />}
                  {sessionType}
                </div>
                <h1 style={{ fontSize: "110px", fontWeight: "900", margin: 0, color: isZen ? "#fff" : "var(--text-primary)", fontVariantNumeric: "tabular-nums", letterSpacing: "-4px" }}>
                  {formatTime(timeLeft)}
                </h1>
              </div>
            </div>

            {/* Timer Controls */}
            <div style={{ marginTop: "48px", display: "flex", gap: "24px", alignItems: "center" }}>
              <button onClick={() => setTimeLeft(totalTime)} className="control-btn" style={{ width: "64px", height: "64px", borderRadius: "50%", border: `1px solid ${COLORS.borderColor}`, background: COLORS.cardBg, color: COLORS.textSecondary, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <RotateCcw size={28} />
              </button>
              <button onClick={() => setActive(!active)} className="control-btn" style={{ width: "96px", height: "96px", borderRadius: "50%", border: "none", background: activeColor, color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 15px 35px ${activeColor}40`, transition: "all 0.3s ease" }}>
                {active ? <Pause size={42} fill="white" /> : <Play size={42} fill="white" style={{ marginLeft: "6px" }} />}
              </button>
              <div style={{ width: "64px" }} />
            </div>
          </div>

          {/* Right: Focus Sidebar */}
          {!isZen && (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: "320px" }}>
              
              {/* Streak Card */}
              <div style={{ ...styles.sidebarCard, background: `${COLORS.work}10`, borderColor: `${COLORS.work}20` }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", color: COLORS.work, marginBottom: "16px" }}>
                  <Flame size={20} />
                  <span style={{ fontWeight: "800", fontSize: "12px", textTransform: "uppercase", letterSpacing: "1px" }}>Current Session</span>
                </div>
                <div style={{ display: "flex", alignItems: "baseline", gap: "12px" }}>
                  <span style={{ fontSize: "48px", fontWeight: "900", color: COLORS.work, lineHeight: "1" }}>{pomodoroCount}</span>
                  <span style={{ color: COLORS.textSecondary, fontWeight: "600", fontSize: "15px" }}>Pomodoros Today</span>
                </div>
              </div>

              {/* Ambience Card */}
              <div style={styles.sidebarCard}>
                <h3 style={{ fontSize: "14px", color: COLORS.textPrimary, fontWeight: "800", marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
                  <Music size={16} color={COLORS.primary} /> Focus Ambience
                </h3>
                {["White Noise", "Lofi Beats", "Rainy Window"].map((sound, i) => (
                  <button key={i} className="sound-btn">{sound}</button>
                ))}
              </div>

              {/* Goal Progress */}
              <div style={{ ...styles.sidebarCard, textAlign: "center", background: "var(--primary-light)", borderColor: "transparent" }}>
                <Trophy size={28} color={COLORS.primary} style={{ marginBottom: "12px" }} />
                <div style={{ fontSize: "24px", fontWeight: "900", color: COLORS.primary }}>{pomodoroCount}/8</div>
                <div style={{ fontSize: "11px", color: COLORS.primary, fontWeight: "800", textTransform: "uppercase", marginTop: "4px" }}>Daily Goal Progress</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {!isZen && (
        <div style={{ padding: "20px", textAlign: "center", fontSize: "13px", color: COLORS.textMuted, background: "var(--bg-main)", borderTop: `1px solid ${COLORS.borderColor}` }}>
          The <b>Pomodoro Technique</b> optimizes cognitive load by balancing high-intensity focus with intentional recovery.
        </div>
      )}
    </div>
  );
};

export default Pomodoro;