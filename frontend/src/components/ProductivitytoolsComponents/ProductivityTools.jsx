import React, { useState, useRef, useEffect } from "react";
import {
  Zap,
  Clock,
  Layers,
  Maximize,
  Minimize,
  ArrowRight,
  Target,
  BarChart, // Visual replacement for 'Type' icon
} from "lucide-react";
import { useNavigate } from "react-router-dom";

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
  // Tool specific colors mapped to variables
  purple: "var(--purple)",
  purpleLight: "var(--purple-light)",
  orange: "var(--orange)",
  orangeLight: "var(--orange-light)",
};

const styles = {
  // ROOT ELEMENT - Dynamic to handle Zen Mode vs Standard Mode
  container: {
    padding: "5px 14px",
    backgroundColor: COLORS.bgMain,
    minHeight: "100vh",
    fontFamily: "'Inter', system-ui, sans-serif",
  },
  mainWrapperCard: (isZen) => ({
    backgroundColor: isZen ? "#0f172a" : COLORS.cardBg, // Dark navy if Zen, else variable
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
  // HERO SECTION - Matches Reference
  heroSection: {
    background: `linear-gradient(135deg, ${COLORS.primaryLight} 0%, ${COLORS.cardBg} 100%)`,
    padding: "48px",
    borderBottom: `1px solid ${COLORS.borderColor}`,
    display: "flex",
    alignItems: "center",
    gap: "24px",
    textAlign: "left",
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
    boxShadow: "0 10px 25px -5px rgba(6, 182, 212, 0.4)", // Adjusted shadow color for productivity theme
  },
  // GRID LAYOUT
  contentBody: {
    flex: 1,
    overflowY: "auto",
    padding: "40px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
    gap: "24px",
    maxWidth: "1200px",
    margin: "0 auto",
    width: "100%",
  },
  // CARD STYLING - Matches Reference
  toolCard: {
    backgroundColor: COLORS.bgMain,
    border: `1px solid ${COLORS.borderColor}`,
    borderRadius: "20px",
    padding: "32px",
    cursor: "pointer",
    transition: "all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)",
    position: "relative",
    overflow: "hidden",
    textAlign: "left",
    display: "flex",
    flexDirection: "column",
    height: "100%",
  },
  iconWrapper: (bg, color) => ({
    width: "48px",
    height: "48px",
    borderRadius: "14px",
    backgroundColor: bg,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: color,
    marginBottom: "20px",
  }),
  cardTitle: {
    fontSize: "20px",
    fontWeight: "800",
    color: COLORS.textPrimary,
    marginBottom: "8px",
  },
  cardDesc: {
    fontSize: "14px",
    color: COLORS.textSecondary,
    lineHeight: "1.6",
    marginBottom: "24px",
    flex: 1,
  },
  cardFooter: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    fontSize: "12px",
    fontWeight: "700",
    color: COLORS.textMuted,
    marginTop: "auto",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
};

const animationStyles = `
  .tool-card-hover:hover {
    transform: translateY(-8px);
    border-color: ${COLORS.primary};
    box-shadow: 0 15px 30px -10px rgba(0,0,0,0.1);
  }
  .tool-card-hover:hover .action-arrow {
    transform: translateX(4px);
    color: ${COLORS.primary};
  }
  .action-arrow {
    transition: transform 0.2s, color 0.2s;
  }
  
  /* Scrollbar refinement for the content body */
  .content-scroll::-webkit-scrollbar {
    width: 6px;
  }
  .content-scroll::-webkit-scrollbar-track {
    background: transparent;
  }
  .content-scroll::-webkit-scrollbar-thumb {
    background-color: var(--border-color);
    border-radius: 10px;
  }
`;

const ProductivityTools = () => {
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
      title: "Eisenhower Matrix",
      desc: "Distinguish between urgent and important tasks to master your daily priorities.",
      icon: <Layers size={24} strokeWidth={2.5} />,
      color: COLORS.purple,
      bg: COLORS.purpleLight,
      time: "Strategy",
      type: "Prioritize",
      path: "/productivity/eisenhower",
    },
    {
      id: "pomodoro",
      title: "Pomodoro Technique",
      desc: "Deep work sessions paired with tactical breaks to maintain high mental clarity.",
      icon: <Clock size={24} strokeWidth={2.5} />,
      color: COLORS.orange,
      bg: COLORS.orangeLight,
      time: "25 Min",
      type: "Focus",
      path: "/productivity/pomodoro",
    },
  ];

  return (
    <div className="assessment-library-container" style={styles.container}>
      <div
        ref={containerRef}
        className="wb-main-wrapper"
        style={styles.mainWrapperCard(isZen)}
      >
        <style>{animationStyles}</style>

        {/* Zen Mode Toggle - Floating (Kept separate from layout flow) */}
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
              background: isZen ? "rgba(255,255,255,0.1)" : COLORS.bgMain,
              border: isZen
                ? "1px solid rgba(255,255,255,0.2)"
                : `1px solid ${COLORS.borderColor}`,
              color: isZen ? "#fff" : COLORS.textSecondary,
              padding: "10px",
              borderRadius: "12px",
              cursor: "pointer",
              backdropFilter: "blur(10px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: isZen ? "none" : "0 2px 5px rgba(0,0,0,0.05)",
            }}
          >
            {isZen ? <Minimize size={20} /> : <Maximize size={20} />}
          </button>
        </div>

        {/* Header - Styled like Reference */}
        {!isZen && (
          <div className="wb-hero" style={styles.heroSection}>
            <div style={styles.heroIconBox}>
              <Zap size={36} color="white" strokeWidth={2.5} />
            </div>
            <div>
              <h1
                style={{
                  fontSize: "32px",
                  fontWeight: "800",
                  color: COLORS.textPrimary,
                  margin: "0 0 8px 0",
                }}
              >
                Productivity Lab
              </h1>
              <p
                style={{
                  fontSize: "16px",
                  color: COLORS.textSecondary,
                  margin: "0",
                  maxWidth: "600px",
                  lineHeight: "1.6",
                }}
              >
                Science-backed frameworks to optimize your workflow and maximize
                output.
              </p>
            </div>
          </div>
        )}

        {/* Main Grid Content */}
        <div className="content-scroll" style={styles.contentBody}>
          <div style={styles.grid}>
            {tools.map((tool) => (
              <button
                key={tool.id}
                className="tool-card-hover"
                style={styles.toolCard}
                onClick={() => navigate(tool.path)}
              >
                {/* Card Header: Icon + Arrow */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    width: "100%",
                  }}
                >
                  <div style={styles.iconWrapper(tool.bg, tool.color)}>
                    {tool.icon}
                  </div>
                  <ArrowRight
                    className="action-arrow"
                    size={20}
                    color={COLORS.textMuted}
                  />
                </div>

                {/* Card Body: Title + Desc */}
                <h3 style={styles.cardTitle}>{tool.title}</h3>
                <p style={styles.cardDesc}>{tool.desc}</p>

                {/* Card Footer: Metadata */}
                <div style={styles.cardFooter}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    <Target size={14} /> {tool.type}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    <Clock size={14} /> {tool.time}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductivityTools;
