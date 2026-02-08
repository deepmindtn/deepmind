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

const styles = {
  container: {
    padding: "5px 14px",
    backgroundColor: COLORS.bgMain,
    minHeight: "100vh",
    fontFamily: "'Inter', system-ui, sans-serif",
  },
  // ROOT ELEMENT
  mainWrapperCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: "24px",
    border: `1px solid ${COLORS.borderColor}`,
    boxShadow: COLORS.shadowHuge,
    width: "100%",
    margin: "0 auto",
    overflow: "hidden",
    fontFamily: "'Inter', system-ui, sans-serif",
    display: "flex",
    flexDirection: "column",
    minHeight: "calc(100vh - 40px)", // Adjusted for page padding
  },
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
    boxShadow: "0 10px 25px -5px rgba(16, 185, 129, 0.4)",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
    gap: "24px",
    padding: "40px",
  },
  card: {
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

const responsiveStyles = `
  .wb-option-card:hover {
    transform: translateY(-8px);
    border-color: ${COLORS.primary};
    box-shadow: 0 15px 30px -10px rgba(0,0,0,0.1);
  }
  
  .wb-option-card:hover .action-arrow {
    transform: translateX(4px);
    color: ${COLORS.primary};
  }

  .action-arrow {
    transition: transform 0.2s, color 0.2s;
  }

  @media (max-width: 768px) {
    .wb-main-wrapper {
      margin: 0 !important;
      border-radius: 0 !important;
      border: none !important;
      min-height: 100vh !important;
    }
    .wb-hero {
      flex-direction: column !important;
      text-align: center !important;
      padding: 40px 24px !important;
    }
    .wb-grid {
      grid-template-columns: 1fr !important;
      padding: 24px !important;
    }
  }
`;

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
    <div className="assessment-library-container" style={styles.container}>
      <div className="wb-main-wrapper" style={styles.mainWrapperCard}>
        <style>{responsiveStyles}</style>

        {/* Header Section */}
        <div className="wb-hero" style={styles.heroSection}>
          <div style={styles.heroIconBox}>
            <Smile size={36} color="white" strokeWidth={2.5} />
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
              Select a technique below to start your journey towards a
              healthier, more balanced work life.
            </p>
          </div>
        </div>

        {/* Grid of Choices */}
        <div className="wb-grid" style={styles.grid}>
          {choices.map((item) => (
            <button
              key={item.id}
              onClick={() => onSelect(item.id)}
              className="wb-option-card"
              style={styles.card}
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
