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
  CheckCircle2,
  Trophy,
  Flame,
  Music,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

// -----------------------
// Theme Constants
// -----------------------
const COLORS = {
  work: "#ef4444", // Tomato Red
  break: "#10b981", // Emerald Green
  longBreak: "#3b82f6", // Blue
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
    background: `linear-gradient(135deg, ${activeColor}15 0%, #ffffff 100%)`,
    padding: "32px 48px",
    borderBottom: `1px solid ${COLORS.borderColor}`,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  }),
  contentBody: (isZen) => ({
    flex: 1,
    display: "flex",
    flexDirection: "column",
    padding: "40px",
    position: "relative",
    backgroundImage: isZen
      ? `linear-gradient(rgba(15, 23, 42, 0.9), rgba(15, 23, 42, 0.9)), url('https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&q=80&w=2000')`
      : "none",
    backgroundSize: "cover",
    backgroundPosition: "center",
  }),
  timerCircle: (activeColor, progress) => ({
    position: "relative",
    width: "340px",
    height: "340px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  }),
};

const Pomodoro = () => {
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
  const totalTime =
    sessionType === "Work"
      ? WORK_TIME
      : sessionType === "Short Break"
      ? SHORT_BREAK
      : LONG_BREAK;
  const progress = ((totalTime - timeLeft) / totalTime) * 100;
  const activeColor =
    sessionType === "Work"
      ? COLORS.work
      : sessionType === "Short Break"
      ? COLORS.break
      : COLORS.longBreak;

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
    if (!isMuted)
      new Audio(
        "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3"
      )
        .play()
        .catch(() => {});
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
      containerRef.current
        .requestFullscreen()
        .catch((err) => console.error(err));
      setIsZen(true);
    } else {
      document.exitFullscreen();
      setIsZen(false);
    }
  };

  return (
    <div ref={containerRef} style={styles.mainWrapperCard(isZen)}>
      {/* Header */}
      {!isZen && (
        <div style={styles.heroSection(activeColor)}>
          <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
            <button
              className="integrated-back-btn"
              onClick={() => navigate("/productivity-tools")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 16px",
                background: "white",
                border: "1px solid #e5e7eb",
                borderRadius: "12px",
                cursor: "pointer",
                fontWeight: "700",
              }}
            >
              <ArrowLeft size={16} /> Back
            </button>
            <div
              style={{
                width: "64px",
                height: "64px",
                borderRadius: "18px",
                backgroundColor: activeColor,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                boxShadow: `0 10px 20px -5px ${activeColor}40`,
                transition: "all 0.4s ease",
              }}
            >
              <Clock size={32} />
            </div>
            <div>
              <h1
                style={{
                  fontSize: "28px",
                  fontWeight: "800",
                  color: COLORS.textPrimary,
                  margin: "0",
                }}
              >
                Focus Flow
              </h1>
              <p
                style={{
                  fontSize: "14px",
                  color: COLORS.textSecondary,
                  margin: "2px 0 0 0",
                }}
              >
                Deep work sessions and strategic recovery.
              </p>
            </div>
          </div>
          <div style={{ display: "flex", gap: "12px" }}>
            <button
              onClick={() => setIsMuted(!isMuted)}
              style={{
                padding: "12px",
                borderRadius: "12px",
                background: "white",
                border: "1px solid #e5e7eb",
                cursor: "pointer",
              }}
            >
              {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </button>
            <button
              onClick={toggleFullscreen}
              style={{
                padding: "12px",
                borderRadius: "12px",
                background: "white",
                border: "1px solid #e5e7eb",
                cursor: "pointer",
              }}
            >
              <Maximize size={20} />
            </button>
          </div>
        </div>
      )}

      {/* Main Content Body */}
      <div style={styles.contentBody(isZen)}>
        {isZen && (
          <button
            onClick={() => setIsZen(false)}
            style={{
              position: "absolute",
              top: "24px",
              right: "24px",
              zIndex: 10,
              padding: "12px",
              borderRadius: "14px",
              background: "rgba(255,255,255,0.1)",
              color: "white",
              border: "none",
              cursor: "pointer",
              backdropFilter: "blur(10px)",
            }}
          >
            <Minimize size={20} />
          </button>
        )}

        <div
          style={{
            display: "flex",
            gap: "60px",
            height: "100%",
            maxWidth: "1100px",
            margin: "0 auto",
            width: "100%",
            alignItems: "center",
          }}
        >
          {/* Left: Timer Display */}
          <div
            style={{
              flex: 1.5,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <div style={styles.timerCircle(activeColor)}>
              <svg
                style={{
                  position: "absolute",
                  transform: "rotate(-90deg)",
                  width: "100%",
                  height: "100%",
                }}
              >
                <circle
                  cx="170"
                  cy="170"
                  r="160"
                  fill="none"
                  stroke={isZen ? "rgba(255,255,255,0.05)" : "#f1f5f9"}
                  strokeWidth="10"
                />
                <circle
                  cx="170"
                  cy="170"
                  r="160"
                  fill="none"
                  stroke={activeColor}
                  strokeWidth="10"
                  strokeDasharray={1005}
                  strokeDashoffset={1005 - (1005 * progress) / 100}
                  strokeLinecap="round"
                  style={{
                    transition: "stroke-dashoffset 1s linear, stroke 0.4s",
                  }}
                />
              </svg>

              <div style={{ textAlign: "center", zIndex: 1 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    justifyContent: "center",
                    color: activeColor,
                    fontWeight: "800",
                    textTransform: "uppercase",
                    letterSpacing: "2px",
                    fontSize: "14px",
                    marginBottom: "4px",
                  }}
                >
                  {sessionType === "Work" ? (
                    <Brain size={18} />
                  ) : (
                    <Coffee size={18} />
                  )}
                  {sessionType}
                </div>
                <h1
                  style={{
                    fontSize: "96px",
                    fontWeight: "900",
                    margin: 0,
                    color: isZen ? "#fff" : "#1e293b",
                    fontVariantNumeric: "tabular-nums",
                    letterSpacing: "-2px",
                  }}
                >
                  {formatTime(timeLeft)}
                </h1>
              </div>
            </div>

            {/* Timer Controls */}
            <div
              style={{
                marginTop: "48px",
                display: "flex",
                gap: "24px",
                alignItems: "center",
              }}
            >
              <button
                onClick={() => setTimeLeft(totalTime)}
                style={{
                  width: "56px",
                  height: "56px",
                  borderRadius: "50%",
                  border: "1px solid #e5e7eb",
                  background: isZen ? "rgba(255,255,255,0.05)" : "#fff",
                  color: isZen ? "#fff" : "#64748b",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
              >
                <RotateCcw size={24} />
              </button>
              <button
                onClick={() => setActive(!active)}
                style={{
                  width: "84px",
                  height: "84px",
                  borderRadius: "50%",
                  border: "none",
                  background: activeColor,
                  color: "#fff",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: `0 15px 30px ${activeColor}50`,
                  transform: active ? "scale(0.95)" : "scale(1)",
                  transition: "all 0.2s",
                }}
              >
                {active ? (
                  <Pause size={36} fill="white" />
                ) : (
                  <Play size={36} fill="white" style={{ marginLeft: "6px" }} />
                )}
              </button>
              <div style={{ width: "56px" }} />
            </div>
          </div>

          {/* Right: Focus Sidebar (Hidden in Zen) */}
          {!isZen && (
            <div
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                gap: "24px",
              }}
            >
              <div
                style={{
                  background: "#fef2f2",
                  padding: "24px",
                  borderRadius: "24px",
                  border: "1px solid #ef444420",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    color: "#991b1b",
                    marginBottom: "12px",
                  }}
                >
                  <Flame size={20} />
                  <span
                    style={{
                      fontWeight: "800",
                      fontSize: "14px",
                      textTransform: "uppercase",
                    }}
                  >
                    Current Streak
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "baseline",
                    gap: "8px",
                  }}
                >
                  <span
                    style={{
                      fontSize: "32px",
                      fontWeight: "900",
                      color: COLORS.work,
                    }}
                  >
                    {pomodoroCount}
                  </span>
                  <span style={{ color: "#991b1b", fontWeight: "600" }}>
                    Pomodoros Today
                  </span>
                </div>
              </div>

              <div
                style={{
                  padding: "24px",
                  borderRadius: "24px",
                  border: `1px solid ${COLORS.borderColor}`,
                  background: "#fff",
                }}
              >
                <h3
                  style={{
                    fontSize: "14px",
                    color: COLORS.textPrimary,
                    fontWeight: "800",
                    marginBottom: "16px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <Music size={16} color={COLORS.primary} /> Focus Ambience
                </h3>
                {["White Noise", "Lofi Beats", "Rainy Window"].map(
                  (sound, i) => (
                    <button
                      key={i}
                      style={{
                        width: "100%",
                        textAlign: "left",
                        padding: "12px 16px",
                        borderRadius: "12px",
                        border: "1px solid #f1f5f9",
                        background: "#f8fafc",
                        marginBottom: "8px",
                        cursor: "pointer",
                        fontSize: "13px",
                        fontWeight: "600",
                        color: COLORS.textSecondary,
                      }}
                    >
                      {sound}
                    </button>
                  )
                )}
              </div>

              <div
                style={{
                  textAlign: "center",
                  padding: "20px",
                  background: "#f0f9ff",
                  borderRadius: "24px",
                  border: "1px solid #bae6fd",
                }}
              >
                <Trophy
                  size={24}
                  color="#0369a1"
                  style={{ marginBottom: "8px" }}
                />
                <div
                  style={{
                    fontSize: "18px",
                    fontWeight: "800",
                    color: "#0369a1",
                  }}
                >
                  {pomodoroCount}/8
                </div>
                <div
                  style={{
                    fontSize: "11px",
                    color: "#0369a1",
                    fontWeight: "700",
                    textTransform: "uppercase",
                  }}
                >
                  Daily Goal Progress
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {!isZen && (
        <div
          style={{
            padding: "20px",
            textAlign: "center",
            fontSize: "13px",
            color: COLORS.textMuted,
            background: "#f8fafc",
            borderTop: `1px solid ${COLORS.borderColor}`,
          }}
        >
          The Pomodoro Technique improves your focus by limiting the time you
          spend on tasks.
        </div>
      )}
    </div>
  );
};

export default Pomodoro;
