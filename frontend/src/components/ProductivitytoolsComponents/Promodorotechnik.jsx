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
  CheckCircle2
} from "lucide-react";
import { useNavigate } from "react-router-dom";

// -----------------------
// Theme Constants
// -----------------------
const COLORS = {
  work: "#ef4444",       // Tomato Red
  break: "#10b981",      // Emerald Green
  longBreak: "#3b82f6",  // Blue
  primary: "#ef4444",
  bgMain: "var(--bg-main)",
  cardBg: "var(--card-bg)",
  textPrimary: "var(--text-primary)",
  textSecondary: "var(--text-secondary)",
  borderColor: "var(--border-color)",
};

const Pomodoro = () => {
  const navigate = useNavigate();
  const WORK_TIME = 25 * 60;
  const SHORT_BREAK = 5 * 60;
  const LONG_BREAK = 15 * 60;

  const [timeLeft, setTimeLeft] = useState(WORK_TIME);
  const [active, setActive] = useState(false);
  const [sessionType, setSessionType] = useState("Work"); // Work, Short, Long
  const [pomodoroCount, setPomodoroCount] = useState(0);
  const [isZen, setIsZen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const containerRef = useRef(null);
  const totalTime = sessionType === "Work" ? WORK_TIME : sessionType === "Short Break" ? SHORT_BREAK : LONG_BREAK;
  const progress = ((totalTime - timeLeft) / totalTime) * 100;

  // Sound effects logic
  const playAlert = () => {
    if (!isMuted) {
      const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3");
      audio.play().catch(e => console.log("Audio play blocked"));
    }
  };

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
    playAlert();
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

  const resetTimer = () => {
    setActive(false);
    setPomodoroCount(0);
    setSessionType("Work");
    setTimeLeft(WORK_TIME);
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m < 10 ? "0" : ""}${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const getThemeColor = () => {
    if (sessionType === "Work") return COLORS.work;
    if (sessionType === "Short Break") return COLORS.break;
    return COLORS.longBreak;
  };

  return (
    <div ref={containerRef} style={{
      backgroundColor: isZen ? "#000" : COLORS.cardBg,
      borderRadius: isZen ? "0" : "24px",
      height: isZen ? "100vh" : "calc(100vh - 40px)",
      display: "flex", flexDirection: "column", overflow: "hidden",
      transition: "all 0.5s ease", border: isZen ? "none" : `1px solid ${COLORS.borderColor}`
    }}>
      {/* Header */}
      {!isZen && (
        <div style={{ padding: "24px 40px", borderBottom: `1px solid ${COLORS.borderColor}`, display: "flex", alignItems: "center", justifyContent: "space-between", background: `linear-gradient(135deg, ${getThemeColor()}15 0%, #ffffff 100%)` }}>
          <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
            <button 
              onClick={() => navigate("/wellbeing-techniques")}
              style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 16px", background: "white", border: "1px solid #e5e7eb", borderRadius: "12px", cursor: "pointer", fontWeight: "700" }}
            >
              <ArrowLeft size={16} /> Exit
            </button>
            <div style={{ width: "48px", height: "48px", backgroundColor: getThemeColor(), borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", color: "white", transition: "background 0.3s" }}>
              <Clock size={24} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: "22px", fontWeight: "800" }}>Focus Flow</h2>
              <p style={{ margin: 0, fontSize: "13px", color: COLORS.textSecondary }}>Pomodoro technique for deep concentration</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={() => setIsMuted(!isMuted)} style={{ padding: "12px", borderRadius: "12px", border: "1px solid #e5e7eb", background: "white", cursor: "pointer" }}>
              {isMuted ? <VolumeX size={20}/> : <Volume2 size={20}/>}
            </button>
            <button onClick={() => setIsZen(true)} style={{ padding: "12px", borderRadius: "12px", border: "1px solid #e5e7eb", background: "white", cursor: "pointer" }}><Maximize size={20}/></button>
          </div>
        </div>
      )}

      {isZen && (
        <button onClick={() => setIsZen(false)} style={{ position: "absolute", top: "20px", right: "20px", zIndex: 10, padding: "12px", borderRadius: "12px", background: "rgba(255,255,255,0.1)", color: "white", border: "none", cursor: "pointer" }}><Minimize size={20}/></button>
      )}

      {/* Main Content */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px", position: 'relative' }}>
        
        {/* Visual Progress Ring Container */}
        <div style={{ position: 'relative', width: '320px', height: '320px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg style={{ position: 'absolute', transform: 'rotate(-90deg)', width: '100%', height: '100%' }}>
            <circle cx="160" cy="160" r="150" fill="none" stroke={isZen ? "rgba(255,255,255,0.1)" : "#f1f5f9"} strokeWidth="8" />
            <circle 
              cx="160" cy="160" r="150" fill="none" stroke={getThemeColor()} strokeWidth="8" 
              strokeDasharray={942} strokeDashoffset={942 - (942 * progress) / 100}
              strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.3s' }}
            />
          </svg>

          <div style={{ textAlign: 'center', zIndex: 1 }}>
             <div style={{ 
               display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center',
               color: getThemeColor(), fontWeight: '700', textTransform: 'uppercase', letterSpacing: '2px', fontSize: '14px', marginBottom: '8px'
             }}>
               {sessionType === "Work" ? <Brain size={16}/> : <Coffee size={16}/>}
               {sessionType}
             </div>
             <h1 style={{ 
               fontSize: '80px', fontWeight: '900', margin: 0, 
               color: isZen ? '#fff' : '#1e293b', fontVariantNumeric: 'tabular-nums' 
             }}>
               {formatTime(timeLeft)}
             </h1>
          </div>
        </div>

        {/* Controls */}
        <div style={{ marginTop: '40px', display: 'flex', gap: '20px', alignItems: 'center' }}>
          <button 
            onClick={resetTimer}
            style={{ padding: '15px', borderRadius: '50%', border: `1px solid ${COLORS.borderColor}`, background: isZen ? 'transparent' : '#fff', color: isZen ? '#fff' : '#64748b', cursor: 'pointer' }}
          >
            <RotateCcw size={24} />
          </button>

          <button 
            onClick={() => setActive(!active)}
            style={{ 
              width: '80px', height: '80px', borderRadius: '50%', border: 'none', 
              background: getThemeColor(), color: '#fff', cursor: 'pointer', 
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: `0 10px 20px ${getThemeColor()}40`,
              transform: active ? 'scale(0.95)' : 'scale(1)', transition: 'all 0.2s'
            }}
          >
            {active ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" style={{ marginLeft: '4px' }} />}
          </button>

          <div style={{ width: '54px' }} /> {/* Spacer to balance reset button */}
        </div>

        {/* Stats */}
        {!isZen && (
          <div style={{ marginTop: '50px', display: 'flex', gap: '40px' }}>
            <div style={{ textAlign: 'center' }}>
              <p style={{ margin: 0, fontSize: '12px', color: COLORS.textMuted, fontWeight: '600' }}>COMPLETED</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '20px', fontWeight: '800', color: COLORS.textPrimary }}>
                <CheckCircle2 size={18} color={COLORS.break} /> {pomodoroCount}
              </div>
            </div>
            <div style={{ width: '1px', background: '#e5e7eb' }} />
            <div style={{ textAlign: 'center' }}>
              <p style={{ margin: 0, fontSize: '12px', color: COLORS.textMuted, fontWeight: '600' }}>DAILY GOAL</p>
              <div style={{ fontSize: '20px', fontWeight: '800', color: COLORS.textPrimary }}>
                {pomodoroCount}/8
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Instructional Tagline */}
      {!isZen && (
        <div style={{ padding: '20px', textAlign: 'center', fontSize: '13px', color: COLORS.textMuted, background: '#f8fafc' }}>
          Pro Tip: Use the 5-minute breaks to stretch your neck or hydrate.
        </div>
      )}
    </div>
  );
};

export default Pomodoro;