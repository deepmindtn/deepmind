import React, { useState, useEffect, useRef } from "react";
import { 
  Dumbbell, 
  Play, 
  Pause, 
  RotateCcw, 
  Maximize, 
  Minimize, 
  Volume2, 
  VolumeX, 
  ArrowLeft,
  ChevronRight,
  Timer
} from "lucide-react";

// Import your assets - ensure paths are correct
// For demo purposes, using placeholders if actual files aren't loaded
import neckStretch from "../../assets/neck-stretch.gif";
import wristRotation from "../../assets/wrist-rotation.gif";
import chairSquat from "../../assets/chair-squat.gif";

// -----------------------
// Theme Constants
// -----------------------
const COLORS = {
  primary: "var(--orange)", // Changed to Orange for Physical Activity
  primaryLight: "var(--orange-light)", 
  primaryDark: "var(--orange-dark)", // Ensure this exists or use a dark orange hex
  bgMain: "var(--bg-main)",
  cardBg: "var(--card-bg)",
  textPrimary: "var(--text-primary)",
  textSecondary: "var(--text-secondary)",
  textMuted: "var(--text-muted)",
  borderColor: "var(--border-color)",
  shadowHuge: "var(--shadow-huge)",
};

const exercises = [
  { name: "Neck Release", duration: 30, img: neckStretch, desc: "Gently tilt your head side to side." },
  { name: "Wrist Rotations", duration: 30, img: wristRotation, desc: "Roll your wrists in circles." },
  { name: "Chair Squats", duration: 30, img: chairSquat, desc: "Stand up and sit down without using hands." },
  { name: "Shoulder Shrugs", duration: 30, img: neckStretch, desc: "Lift shoulders to ears and drop them." }, // added for variety
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
    boxShadow: "0 10px 20px -5px rgba(249, 115, 22, 0.3)", // Orange shadow
  },
  contentBody: (isZen) => ({
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "flex-start", // Start from top to accommodate the split view
    padding: "40px",
    position: "relative",
    backgroundImage: isZen 
      ? `linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url('https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&q=80&w=2000')` // Gym/Active background
      : "none",
    backgroundSize: "cover",
    backgroundPosition: "center",
    overflowY: "auto",
  }),
  // Split Layout for Non-Zen Mode
  splitLayout: {
    display: "flex",
    gap: "40px",
    width: "100%",
    maxWidth: "1000px",
    height: "100%",
    alignItems: "center",
  },
  exerciseCard: (isZen) => ({
    flex: 1,
    backgroundColor: isZen ? "rgba(255,255,255,0.05)" : COLORS.bgMain,
    borderRadius: "24px",
    padding: "24px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    border: isZen ? "1px solid rgba(255,255,255,0.1)" : `1px solid ${COLORS.borderColor}`,
    boxShadow: isZen ? "none" : "0 4px 20px rgba(0,0,0,0.05)",
    backdropFilter: isZen ? "blur(10px)" : "none",
    height: isZen ? "80vh" : "auto",
    transition: "all 0.5s ease",
  }),
  imageContainer: {
    width: "100%",
    height: "300px",
    borderRadius: "16px",
    overflow: "hidden",
    marginBottom: "24px",
    backgroundColor: "#f3f4f6",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  gifImage: {
    maxWidth: "100%",
    maxHeight: "100%",
    objectFit: "contain",
  },
  sidebar: {
    width: "300px",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  stepItem: (isActive) => ({
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "16px",
    borderRadius: "12px",
    backgroundColor: isActive ? COLORS.primaryLight : "transparent",
    border: isActive ? `1px solid ${COLORS.primary}` : "1px solid transparent",
    cursor: "pointer",
    transition: "all 0.2s",
  }),
  controls: {
    display: "flex",
    gap: "16px",
    marginTop: "auto",
    paddingTop: "24px",
    width: "100%",
    justifyContent: "center",
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
  }),
  progressBar: {
    height: "6px",
    width: "100%",
    backgroundColor: "#e5e7eb",
    borderRadius: "10px",
    marginTop: "16px",
    overflow: "hidden",
  },
  progressFill: (progress) => ({
    height: "100%",
    width: `${progress}%`,
    backgroundColor: COLORS.primary,
    transition: "width 1s linear",
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
    .physical-split { flex-direction: column !important; }
    .physical-sidebar { width: 100% !important; flex-direction: row !important; overflow-x: auto; }
  }
`;

const Physical = ({ onBack }) => {
  const [active, setActive] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(120); // Total session time
  const [isZen, setIsZen] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  // Timer for specific exercise step
  const [stepTime, setStepTime] = useState(exercises[0].duration);

  const containerRef = useRef(null);
  const audioRef = useRef(new Audio("https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3")); // Upbeat workout track

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

  // Audio Logic
  useEffect(() => {
    audioRef.current.loop = true;
    audioRef.current.volume = 0.4;
    if (active && !isMuted) audioRef.current.play().catch(() => {});
    else audioRef.current.pause();
  }, [active, isMuted]);

  // Main Timer & Exercise Rotation Logic
  useEffect(() => {
    let interval;
    if (active && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
        setStepTime((prev) => {
          if (prev <= 1) {
            // Move to next exercise
            setCurrentIdx((c) => (c + 1) % exercises.length);
            return exercises[(currentIdx + 1) % exercises.length].duration;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (timeLeft === 0) {
      setActive(false);
    }
    return () => clearInterval(interval);
  }, [active, timeLeft, currentIdx]);

  const resetSession = () => {
    setActive(false);
    setTimeLeft(120);
    setCurrentIdx(0);
    setStepTime(exercises[0].duration);
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  // Calculate progress for current step
  const stepProgress = ((exercises[currentIdx].duration - stepTime) / exercises[currentIdx].duration) * 100;

  return (
    <div ref={containerRef} className="wb-main-wrapper" style={styles.mainWrapperCard(isZen)}>
      <style>{animationStyles}</style>

      {/* Floating Controls */}
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
              <Dumbbell size={32} color="white" strokeWidth={2.5} />
            </div>
            
            <div>
              <h1 style={{ fontSize: "28px", fontWeight: "800", color: COLORS.textPrimary, margin: "0" }}>
                Physical Vitality
              </h1>
              <p style={{ fontSize: "14px", color: COLORS.textSecondary, margin: "2px 0 0 0" }}>
                Energize your body with desk-friendly movement.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Content Body */}
      <div style={styles.contentBody(isZen)}>
        
        <div className="physical-split" style={styles.splitLayout}>
          
          {/* LEFT: Main Exercise Card */}
          <div style={styles.exerciseCard(isZen)}>
            {/* Header of card */}
            <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', marginBottom: '16px', color: isZen ? '#fff' : COLORS.textPrimary }}>
              <h2 style={{ fontSize: '24px', margin: 0 }}>{exercises[currentIdx].name}</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700', fontSize: '18px' }}>
                <Timer size={20} /> {formatTime(stepTime)}
              </div>
            </div>

            {/* Image/GIF */}
            <div style={styles.imageContainer}>
               {/* Replace with actual image in production */}
               <img 
                 src={exercises[currentIdx].img} 
                 alt={exercises[currentIdx].name}
                 style={styles.gifImage}
               />
               {!active && (
                 <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <p style={{ fontWeight: '700', color: COLORS.textMuted }}>PAUSED</p>
                 </div>
               )}
            </div>

            <p style={{ color: isZen ? '#ccc' : COLORS.textSecondary, fontSize: '16px', textAlign: 'center', marginBottom: '24px' }}>
              {exercises[currentIdx].desc}
            </p>

            {/* Progress Bar for current exercise */}
            <div style={{ width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: COLORS.textMuted, marginBottom: '4px' }}>
                <span>Progress</span>
                <span>{Math.round(stepProgress)}%</span>
              </div>
              <div style={styles.progressBar}>
                <div style={styles.progressFill(stepProgress)} />
              </div>
            </div>

            {/* Control Buttons */}
            <div style={styles.controls}>
              <button style={styles.controlBtn(isZen)} onClick={() => setActive(!active)}>
                {active ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
                {active ? "Pause" : "Start"}
              </button>
              
              <button style={styles.controlBtn(isZen)} onClick={resetSession}>
                <RotateCcw size={20} />
                Reset
              </button>
            </div>
          </div>

          {/* RIGHT: Upcoming List (Hidden in Zen Mobile maybe, but visible here) */}
          {!isZen && (
            <div className="physical-sidebar" style={styles.sidebar}>
              <h3 style={{ fontSize: "14px", color: COLORS.textMuted, textTransform: "uppercase", letterSpacing: "1px" }}>
                Session Plan
              </h3>
              {exercises.map((ex, idx) => (
                <div 
                  key={idx} 
                  style={styles.stepItem(idx === currentIdx)}
                  onClick={() => {
                    setCurrentIdx(idx);
                    setStepTime(ex.duration);
                    setActive(false);
                  }}
                >
                  <div style={{ 
                    width: '32px', height: '32px', borderRadius: '8px', 
                    background: idx === currentIdx ? COLORS.primary : "#e5e7eb",
                    color: idx === currentIdx ? "white" : COLORS.textMuted,
                    display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "700"
                  }}>
                    {idx + 1}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, fontWeight: "600", fontSize: "14px", color: COLORS.textPrimary }}>{ex.name}</p>
                    <p style={{ margin: 0, fontSize: "12px", color: COLORS.textSecondary }}>{ex.duration}s</p>
                  </div>
                  {idx === currentIdx && <ChevronRight size={16} color={COLORS.primary} />}
                </div>
              ))}
              
              <div style={{ marginTop: '20px', padding: '16px', background: '#f0fdf4', borderRadius: '12px', border: '1px solid #bbf7d0' }}>
                <p style={{ fontSize: '13px', color: '#166534', margin: 0, lineHeight: '1.5' }}>
                  <strong>Tip:</strong> Keep your movements smooth. If you feel pain, stop immediately.
                </p>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default Physical;