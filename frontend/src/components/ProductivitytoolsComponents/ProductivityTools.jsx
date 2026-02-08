import React, { useState, useRef, useEffect } from "react";
import {
  Zap,
  Clock,
  Layers,
  Maximize,
  Minimize,
  ArrowRight,
  Target,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

// -----------------------
// Theme Constants
// -----------------------
const COLORS = {
  primary: "var(--primary)",
  primaryLight: "var(--primary-light)",
  bgMain: "var(--bg-main)",
  cardBg: "var(--card-bg)",
  textPrimary: "var(--text-primary)",
  textSecondary: "var(--text-secondary)",
  textMuted: "var(--text-muted)",
  borderColor: "var(--border-color)",
  shadowHuge: "var(--shadow-huge)",
  purple: "var(--purple)",
  purpleLight: "var(--purple-light)",
  orange: "var(--orange)",
  orangeLight: "var(--orange-light)",
};

/* -----------------------
   CSS & Responsive Styles
----------------------- */
const responsiveStyles = `
  /* --- Desktop / Default Styles --- */
  .prod-container {
    padding: 5px 14px;
    background-color: ${COLORS.bgMain};
    min-height: 100vh;
    font-family: 'Inter', system-ui, sans-serif;
  }

  .main-wrapper {
    background-color: ${COLORS.cardBg};
    border-radius: 24px;
    border: 1px solid ${COLORS.borderColor};
    box-shadow: ${COLORS.shadowHuge};
    width: 100%;
    margin: 0 auto;
    overflow: hidden;
    font-family: 'Inter', system-ui, sans-serif;
    display: flex;
    flex-direction: column;
    height: calc(100vh - 40px);
    position: relative;
    transition: all 0.5s ease;
  }

  /* Zen Mode Overrides */
  .main-wrapper.zen-active {
    background-color: #0f172a; /* Dark Navy for focus */
    border-radius: 0;
    border: none;
    box-shadow: none;
    margin: 0;
    height: 100vh;
  }

  .hero-section {
    background: linear-gradient(135deg, ${COLORS.primaryLight} 0%, ${COLORS.cardBg} 100%);
    padding: 48px;
    border-bottom: 1px solid ${COLORS.borderColor};
    display: flex;
    align-items: center;
    gap: 24px;
    text-align: left;
  }

  .hero-icon-box {
    width: 72px;
    height: 72px;
    border-radius: 20px;
    background-color: ${COLORS.primary};
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    box-shadow: 0 10px 25px -5px rgba(6, 182, 212, 0.4);
    color: white;
  }

  .content-body {
    flex: 1;
    overflow-y: auto;
    padding: 40px;
  }

  .tools-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    gap: 24px;
    max-width: 1200px;
    margin: 0 auto;
    width: 100%;
  }

  .tool-card {
    background-color: ${COLORS.bgMain};
    border: 1px solid ${COLORS.borderColor};
    border-radius: 20px;
    padding: 32px;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
    position: relative;
    overflow: hidden;
    text-align: left;
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;
  }

  .tool-card:hover {
    transform: translateY(-8px);
    border-color: ${COLORS.primary};
    box-shadow: 0 15px 30px -10px rgba(0,0,0,0.1);
  }

  .tool-card:hover .action-arrow {
    transform: translateX(4px);
    color: ${COLORS.primary};
  }
  
  .action-arrow {
    transition: transform 0.2s, color 0.2s;
  }

  /* Scrollbar Polish */
  .content-body::-webkit-scrollbar {
    width: 6px;
  }
  .content-body::-webkit-scrollbar-track {
    background: transparent;
  }
  .content-body::-webkit-scrollbar-thumb {
    background-color: var(--border-color);
    border-radius: 10px;
  }

  /* --- Mobile / Responsive Overrides --- */
  @media (max-width: 768px) {
    .prod-container {
      padding: 10px; /* Slight padding to show border radius */
    }
    
    .main-wrapper {
      border-radius: 24px;
      min-height: calc(100vh - 20px);
      /* Ensure height isn't fixed on mobile to allow scrolling if needed */
      height: auto; 
    }
    
    .main-wrapper.zen-active {
      height: 100vh; /* Zen mode still needs fixed height */
    }

    .hero-section {
      flex-direction: column;
      text-align: center;
      padding: 32px 20px;
      gap: 16px;
    }

    .hero-icon-box {
      margin-bottom: 8px;
    }

    .content-body {
      padding: 24px 16px;
    }

    .tools-grid {
      grid-template-columns: 1fr; /* Stack cards */
      gap: 16px;
    }

    .tool-card {
      padding: 24px; /* Less padding inside cards */
    }
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
    <div className="prod-container">
      <style>{responsiveStyles}</style>
      
      <div
        ref={containerRef}
        className={`main-wrapper ${isZen ? "zen-active" : ""}`}
      >
        {/* Zen Mode Toggle */}
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

        {/* Hero Section */}
        {!isZen && (
          <div className="hero-section">
            <div className="hero-icon-box">
              <Zap size={36} color="white" strokeWidth={2.5} />
            </div>
            <div>
              <h1
                style={{
                  fontSize: "32px",
                  fontWeight: "800",
                  color: COLORS.textPrimary,
                  margin: "0 0 8px 0",
                  lineHeight: "1.2",
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

        {/* Content Body */}
        <div className="content-body">
          <div className="tools-grid">
            {tools.map((tool) => (
              <button
                key={tool.id}
                className="tool-card"
                onClick={() => navigate(tool.path)}
              >
                {/* Card Header */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    width: "100%",
                    marginBottom: "20px",
                  }}
                >
                  <div
                    style={{
                      width: "48px",
                      height: "48px",
                      borderRadius: "14px",
                      backgroundColor: tool.bg,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: tool.color,
                    }}
                  >
                    {tool.icon}
                  </div>
                  <ArrowRight
                    className="action-arrow"
                    size={20}
                    color={COLORS.textMuted}
                  />
                </div>

                {/* Card Body */}
                <h3
                  style={{
                    fontSize: "20px",
                    fontWeight: "800",
                    color: COLORS.textPrimary,
                    marginBottom: "8px",
                  }}
                >
                  {tool.title}
                </h3>
                <p
                  style={{
                    fontSize: "14px",
                    color: COLORS.textSecondary,
                    lineHeight: "1.6",
                    marginBottom: "24px",
                    flex: 1,
                  }}
                >
                  {tool.desc}
                </p>

                {/* Card Footer */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "16px",
                    fontSize: "12px",
                    fontWeight: "700",
                    color: COLORS.textMuted,
                    marginTop: "auto",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <Target size={14} /> {tool.type}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
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