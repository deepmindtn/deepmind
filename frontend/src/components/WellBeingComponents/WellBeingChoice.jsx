import React from "react";
import {
  Wind,
  Dumbbell,
  Heart,
  CalendarCheck,
  Smile,
  ArrowRight,
  Zap,
  Clock,
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
  blueLight: "var(--blue-light)",
  purpleLight: "var(--purple-light)",
  orangeLight: "var(--orange-light)",
  blue: "var(--blue)",
  purple: "var(--purple)",
  orange: "var(--orange)",
};

/* -----------------------
   CSS & Responsive Styles
----------------------- */
const responsiveStyles = `
  /* --- Desktop / Default Styles --- */
  .wb-container {
    padding: 5px 14px;
    background-color: ${COLORS.bgMain};
    min-height: 100vh;
    font-family: 'Inter', system-ui, sans-serif;
  }

  .wb-main-wrapper {
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
    min-height: calc(100vh - 40px);
    position: relative;
  }

  .wb-hero {
    background: linear-gradient(135deg, ${COLORS.primaryLight} 0%, ${COLORS.cardBg} 100%);
    padding: 48px;
    border-bottom: 1px solid ${COLORS.borderColor};
    display: flex;
    align-items: center;
    gap: 24px;
    text-align: left;
  }

  .wb-hero-icon-box {
    width: 72px;
    height: 72px;
    border-radius: 20px;
    background-color: ${COLORS.primary};
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    box-shadow: 0 10px 25px -5px rgba(16, 185, 129, 0.4);
  }

  .wb-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    gap: 24px;
    padding: 40px;
  }

  .wb-card {
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

  /* Hover Effects */
  .wb-card:hover {
    transform: translateY(-8px);
    border-color: ${COLORS.primary};
    box-shadow: 0 15px 30px -10px rgba(0,0,0,0.1);
  }
  
  .wb-card:hover .action-arrow {
    transform: translateX(4px);
    color: ${COLORS.primary};
  }

  .action-arrow {
    transition: transform 0.2s, color 0.2s;
  }

  /* --- Mobile / Responsive Overrides --- */
  @media (max-width: 768px) {
    .wb-container {
      padding: 10px; /* Slight padding to ensure border radius is visible */
    }

    .wb-main-wrapper {
      border-radius: 24px;
      min-height: calc(100vh - 20px);
      height: auto;
    }

    .wb-hero {
      flex-direction: column;
      text-align: center;
      padding: 32px 20px;
      gap: 16px;
    }

    .wb-hero-icon-box {
      margin-bottom: 8px;
    }

    .wb-grid {
      grid-template-columns: 1fr; /* Force single column */
      gap: 16px;
      padding: 24px 16px;
    }

    .wb-card {
      padding: 24px;
    }
  }
`;

const styles = {
  // Helper for dynamic icon backgrounds
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

const WellBeingChoice = ({ onSelect }) => {
  const choices = [
    {
      id: "mindfulness",
      title: "Mindfulness & Breath",
      desc: "Centering exercises to reduce anxiety and improve focus through guided breathing.",
      icon: Wind,
      color: COLORS.blue,
      bg: COLORS.blueLight,
      time: "5-10 MIN",
      type: "Relaxation",
    },
    {
      id: "physical",
      title: "Physical Vitality",
      desc: "Desk-friendly stretches and posture corrections to keep your body energized.",
      icon: Dumbbell,
      color: COLORS.orange,
      bg: COLORS.orangeLight,
      time: "2-5 MIN",
      type: "Activity",
    },
    {
      id: "emotional",
      title: "Emotional Balance",
      desc: "Journaling and gratitude practices to process feelings and boost positivity.",
      icon: Heart,
      color: COLORS.purple,
      bg: COLORS.purpleLight,
      time: "10-15 MIN",
      type: "Journaling",
    },
    {
      id: "daily",
      title: "Daily Challenges",
      desc: "Small, actionable wellness tasks to build better long-term habits.",
      icon: CalendarCheck,
      color: COLORS.primary,
      bg: COLORS.primaryLight,
      time: "DAILY",
      type: "Habit",
    },
  ];

  return (
    <div className="wb-container">
      <style>{responsiveStyles}</style>

      <div className="wb-main-wrapper">
        {/* Header Section */}
        <div className="wb-hero">
          <div className="wb-hero-icon-box">
            <Smile size={36} color="white" strokeWidth={2.5} />
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
              Well-Being Center
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
              Select a technique below to start your journey towards a healthier,
              more balanced work life.
            </p>
          </div>
        </div>

        {/* Grid of Choices */}
        <div className="wb-grid">
          {choices.map((item) => (
            <button
              key={item.id}
              onClick={() => onSelect(item.id)}
              className="wb-card"
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  width: "100%",
                }}
              >
                <div style={styles.iconWrapper(item.bg, item.color)}>
                  <item.icon size={24} strokeWidth={2.5} />
                </div>
                <ArrowRight
                  className="action-arrow"
                  size={20}
                  color={COLORS.textMuted}
                />
              </div>

              <h3 style={styles.cardTitle}>{item.title}</h3>
              <p style={styles.cardDesc}>{item.desc}</p>

              <div style={styles.cardFooter}>
                <div
                  style={{ display: "flex", alignItems: "center", gap: "6px" }}
                >
                  <Clock size={14} /> {item.time}
                </div>
                <div
                  style={{ display: "flex", alignItems: "center", gap: "6px" }}
                >
                  <Zap size={14} /> {item.type}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WellBeingChoice;