import React, { useState, useRef, useEffect } from "react";
import {
  Zap,
  Clock,
  Layers,
  ArrowLeft,
  Maximize,
  Minimize,
  ChevronRight,
  Target,
  Rocket,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

// -----------------------
// Theme Constants
// -----------------------
const COLORS = {
  primary: "#06b6d4", // Cyan for Productivity/Tech
  primaryLight: "#ecfeff",
  primaryDark: "#0891b2",
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
    boxShadow: "0 10px 20px -5px rgba(6, 182, 212, 0.4)",
  },
  contentBody: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "40px",
    overflowY: "auto",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
    gap: "24px",
    width: "100%",
    maxWidth: "900px",
  },
  toolCard: {
    backgroundColor: "#fff",
    borderRadius: "24px",
    padding: "32px",
    border: `1px solid ${COLORS.borderColor}`,
    cursor: "pointer",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    display: "flex",
    flexDirection: "column",
    textAlign: "left",
    position: "relative",
    overflow: "hidden",
  },
  cardIconBox: (color) => ({
    width: "48px",
    height: "48px",
    borderRadius: "12px",
    backgroundColor: `${color}15`,
    color: color,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "20px",
  }),
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
  }
  .integrated-back-btn:hover {
    border-color: ${COLORS.primary};
    color: ${COLORS.primary};
    transform: translateX(-3px);
  }
  .tool-card-hover:hover {
    transform: translateY(-8px);
    border-color: ${COLORS.primary};
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  }
  .tool-card-hover:hover .arrow-icon {
    transform: translateX(5px);
    color: ${COLORS.primary};
  }
`;

const ProductivityTools = ({ onBack }) => {
    const navigate = useNavigate();
  const [isZen, setIsZen] = useState(false);
  const containerRef = useRef(null);

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

  useEffect(() => {
    const handleFsChange = () => {
      if (!document.fullscreenElement) setIsZen(false);
    };
    document.addEventListener("fullscreenchange", handleFsChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFsChange);
  }, []);

  const tools = [
    {
      id: "eisenhower",
      title: "Matrice d'Eisenhower",
      desc: "Distinguish between urgent and important tasks to master your daily priorities.",
      icon: <Layers size={24} />,
      color: "#6366f1",
      tag: "Prioritization",
      path: "/productivity/eisenhower",
    },
    {
      id: "pomodoro",
      title: "Pomodoro Technique",
      desc: "Deep work sessions paired with tactical breaks to maintain high mental clarity.",
      icon: <Clock size={24} />,
      color: "#ef4444",
      tag: "Focus Timer",
      path: "/productivity/pomodoro",
    },
  ];

  return (
    <div
      ref={containerRef}
      className="wb-main-wrapper"
      style={styles.mainWrapperCard(isZen)}
    >
      <style>{animationStyles}</style>

      {/* Floating Controls */}
      <div
        style={{
          position: "absolute",
          top: "24px",
          right: "24px",
          display: "flex",
          gap: "12px",
          zIndex: 101,
        }}
      >
        <button
          onClick={toggleFullscreen}
          style={{
            background: "rgba(0,0,0,0.5)",
            border: "1px solid rgba(255,255,255,0.2)",
            color: "#fff",
            padding: "12px",
            borderRadius: "14px",
            cursor: "pointer",
            backdropFilter: "blur(10px)",
          }}
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
              <Zap size={32} color="white" strokeWidth={2.5} />
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
                Productivity Lab
              </h1>
              <p
                style={{
                  fontSize: "14px",
                  color: COLORS.textSecondary,
                  margin: "2px 0 0 0",
                }}
              >
                Science-backed frameworks to optimize your workflow.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Grid */}
      <div style={styles.contentBody}>
        {!isZen && (
          <div style={{ textAlign: "center", marginBottom: "48px" }}>
            <span
              style={{
                backgroundColor: COLORS.primaryLight,
                color: COLORS.primaryDark,
                padding: "6px 16px",
                borderRadius: "20px",
                fontSize: "12px",
                fontWeight: "800",
                textTransform: "uppercase",
                letterSpacing: "1px",
              }}
            >
              Work Smarter, Not Harder
            </span>
            <h2
              style={{
                fontSize: "36px",
                fontWeight: "800",
                color: COLORS.textPrimary,
                marginTop: "16px",
                marginBottom: "12px",
              }}
            >
              Select Your Strategy
            </h2>
            <p
              style={{
                color: COLORS.textSecondary,
                maxWidth: "500px",
                margin: "0 auto",
              }}
            >
              Choose a tool to help you organize tasks or maintain focus
              throughout your session.
            </p>
          </div>
        )}

        <div style={styles.grid}>
          {tools.map((tool) => (
            <button
              key={tool.id}
              className="tool-card-hover"
              style={styles.toolCard}
              onClick={() => navigate(tool.path)}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                }}
              >
                <div style={styles.cardIconBox(tool.color)}>{tool.icon}</div>
                <span
                  style={{
                    fontSize: "10px",
                    fontWeight: "800",
                    color: COLORS.textMuted,
                    textTransform: "uppercase",
                    padding: "4px 8px",
                    border: "1px solid #eee",
                    borderRadius: "6px",
                  }}
                >
                  {tool.tag}
                </span>
              </div>

              <h3
                style={{
                  fontSize: "20px",
                  fontWeight: "700",
                  color: COLORS.textPrimary,
                  marginBottom: "12px",
                }}
              >
                {tool.title}
              </h3>

              <p
                style={{
                  fontSize: "15px",
                  color: COLORS.textSecondary,
                  lineHeight: "1.6",
                  marginBottom: "24px",
                  flex: 1,
                }}
              >
                {tool.desc}
              </p>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  fontWeight: "700",
                  color: COLORS.textMuted,
                  fontSize: "14px",
                }}
              >
                Open Tool{" "}
                <ChevronRight
                  size={18}
                  className="arrow-icon"
                  style={{ transition: "transform 0.2s" }}
                />
              </div>
            </button>
          ))}
        </div>

        {!isZen && (
          <div
            style={{
              marginTop: "60px",
              display: "flex",
              gap: "32px",
              color: COLORS.textMuted,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "14px",
              }}
            >
              <Target size={18} color={COLORS.primary} /> Prioritize Effectively
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "14px",
              }}
            >
              <Rocket size={18} color={COLORS.primary} /> Boost Daily Output
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductivityTools;
