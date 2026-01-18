import React, { useState } from "react";
import {
  Sparkles,
  PenTool,
  BookOpen,
  ArrowRight,
  Zap,
  Shield,
  CheckCircle2,
  Layout,
  ChevronRight
} from "lucide-react";

// -----------------------
// Theme Constants (Synchronized)
// -----------------------
const COLORS = {
  primary: "#10b981",
  primaryLight: "#ecfdf5",
  primaryDark: "#059669",
  blue: "#3b82f6",
  blueLight: "#eff6ff",
  purple: "#8b5cf6",
  purpleLight: "#f5f3ff",
  orange: "#f59e0b",
  orangeLight: "#fffbeb",
  bgMain: "#f8fafc",
  cardBg: "#ffffff",
  textPrimary: "#1f2937",
  textSecondary: "#6b7280",
  textMuted: "#9ca3af",
  borderColor: "#e5e7eb",
  shadowHuge: "0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
  shadowMd: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
};

const styles = {
  container: { 
    padding: "5px 14px", 
    backgroundColor: COLORS.bgMain, 
    minHeight: "100vh", 
    fontFamily: "'Inter', system-ui, sans-serif",
  },
  mainWrapperCard: { 
    backgroundColor: COLORS.cardBg, 
    borderRadius: "24px", 
    border: `1px solid ${COLORS.borderColor}`, 
    boxShadow: COLORS.shadowHuge, 
    margin: "0 auto", 
    padding: "48px",
    minHeight: "calc(100vh - 40px)",
    display: "flex",
    flexDirection: "column"
  },
  headerSection: {
    marginBottom: "48px",
    textAlign: "center"
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "24px",
    marginBottom: "56px"
  },
  choiceCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: "20px",
    border: `1px solid ${COLORS.borderColor}`,
    padding: "32px",
    cursor: "pointer",
    transition: "all 0.3s ease",
    display: "flex",
    flexDirection: "column",
    height: "100%",
    position: "relative",
    overflow: "hidden"
  },
  iconBox: (bgColor) => ({
    padding: "16px",
    backgroundColor: bgColor,
    borderRadius: "16px",
    display: "inline-flex",
    marginBottom: "24px",
    transition: "transform 0.3s ease"
  }),
  badge: (bgColor, textColor) => ({
    padding: "4px 12px",
    borderRadius: "99px",
    fontSize: "12px",
    fontWeight: "700",
    backgroundColor: bgColor,
    color: textColor,
    textTransform: "uppercase",
    letterSpacing: "0.5px"
  }),
  footerDivider: {
    height: "1px",
    backgroundColor: COLORS.borderColor,
    margin: "40px 0",
    position: "relative"
  }
};

const responsiveStyles = `
  @media (max-width: 1024px) {
    .assessment-choice-main-wrapper {
      padding: 32px 24px !important;
    }
    .assessment-choice-grid {
      grid-template-columns: 1fr !important;
      gap: 20px !important;
    }
    .assessment-choice-features-grid {
      grid-template-columns: repeat(2, 1fr) !important;
      gap: 16px !important;
    }
  }

  @media (max-width: 768px) {
    .assessment-choice-container {
      padding: 5px 10px !important;
    }
    .assessment-choice-main-wrapper {
      padding: 24px 16px !important;
      border-radius: 20px !important;
      min-height: auto !important;
    }
    .assessment-choice-header {
      margin-bottom: 32px !important;
    }
    .assessment-choice-header h1 {
      font-size: 28px !important;
    }
    .assessment-choice-header p {
      font-size: 16px !important;
    }
    .assessment-choice-grid {
      margin-bottom: 40px !important;
    }
    .assessment-choice-card {
      padding: 24px !important;
    }
    .assessment-choice-divider {
      margin: 32px 0 !important;
    }
  }

  @media (max-width: 480px) {
    .assessment-choice-container {
      padding: 5px 8px !important;
    }
    .assessment-choice-main-wrapper {
      padding: 20px 12px !important;
      border-radius: 16px !important;
    }
    .assessment-choice-header {
      margin-bottom: 24px !important;
    }
    .assessment-choice-header h1 {
      font-size: 24px !important;
    }
    .assessment-choice-header p {
      font-size: 15px !important;
    }
    .assessment-choice-grid {
      gap: 16px !important;
      margin-bottom: 32px !important;
    }
    .assessment-choice-card {
      padding: 20px !important;
    }
    .assessment-choice-card h3 {
      font-size: 20px !important;
      margin-bottom: 10px !important;
    }
    .assessment-choice-card p {
      font-size: 14px !important;
      margin-bottom: 24px !important;
    }
    .assessment-choice-icon-box {
      padding: 12px !important;
      margin-bottom: 16px !important;
    }
    .assessment-choice-icon-box svg {
      width: 24px !important;
      height: 24px !important;
    }
    .assessment-choice-badge {
      font-size: 11px !important;
      padding: 3px 10px !important;
    }
    .assessment-choice-features-grid {
      grid-template-columns: 1fr !important;
      gap: 12px !important;
    }
    .assessment-choice-feature-item {
      padding: 12px !important;
    }
    .assessment-choice-feature-item svg {
      margin-bottom: 6px !important;
    }
    .assessment-choice-feature-title {
      font-size: 13px !important;
    }
    .assessment-choice-feature-desc {
      font-size: 11px !important;
    }
    .assessment-choice-divider-text {
      font-size: 11px !important;
      padding: 0 12px !important;
    }
  }

  .choice-card-hover:hover {
    transform: translateY(-8px);
    border-color: ${COLORS.primary} !important;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1) !important;
  }
  .choice-card-hover:hover .icon-bounce {
    transform: scale(1.1);
  }
  .btn-learn-more {
    display: flex;
    align-items: center;
    gap: 6px;
    font-weight: 700;
    font-size: 14px;
    margin-top: auto;
    color: ${COLORS.textMuted};
    transition: color 0.2s;
  }
  .choice-card-hover:hover .btn-learn-more {
    color: ${COLORS.primary};
  }

  @media (max-width: 480px) {
    .btn-learn-more {
      font-size: 13px !important;
    }
  }
`;

const AssessmentChoice = ({ onSelect }) => {
  const options = [
    {
      id: "ai",
      icon: Sparkles,
      title: "Generate with AI",
      description: "Let our AI architect build a high-conversion assessment tailored to your specific goals and target audience.",
      badge: "Most Popular",
      theme: COLORS.primary,
      bg: COLORS.primaryLight,
    },
    {
      id: "custom",
      icon: PenTool,
      title: "Create it Yourself",
      description: "Take full control. Build manual questions, upload existing files, and customize every logic jump yourself.",
      badge: "Pro Control",
      theme: COLORS.primary,
      bg: COLORS.primaryLight,
    },
    {
      id: "template",
      icon: BookOpen,
      title: "Library Templates",
      description: "Choose from our verified library of clinical and performance assessments optimized for your industry.",
      badge: "Quick Start",
      theme: COLORS.primary,
      bg: COLORS.primaryLight,
    },
  ];

  const features = [
    { icon: Zap, title: "Fast Deploy", desc: "Live in under 2 mins", color: COLORS.orange },
    { icon: Shield, title: "Compliant", desc: "Secure & Private", color: COLORS.primary },
    { icon: Layout, title: "Dynamic", desc: "Adaptive Logic", color: COLORS.blue },
    { icon: CheckCircle2, title: "Verified", desc: "Expert Templates", color: COLORS.purple },
  ];

  return (
    <div className="assessment-choice-container" style={styles.container}>
      <style>{responsiveStyles}</style>

      <div className="assessment-choice-main-wrapper" style={styles.mainWrapperCard}>
        {/* Header */}
        <div className="assessment-choice-header" style={styles.headerSection}>
          <h1 style={{ fontSize: "36px", fontWeight: "800", color: COLORS.textPrimary, marginBottom: "12px" }}>
            Create an Assessment
          </h1>
          <p style={{ color: COLORS.textSecondary, fontSize: "18px", margin: 0 }}>
            Choose your creation method to get started
          </p>
        </div>

        {/* Options Grid */}
        <div className="assessment-choice-grid" style={styles.grid}>
          {options.map((option) => {
            const Icon = option.icon;
            return (
              <div
                key={option.id}
                className="choice-card-hover assessment-choice-card"
                style={styles.choiceCard}
                onClick={() => onSelect(option.id)}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div className="icon-bounce assessment-choice-icon-box" style={styles.iconBox(option.bg)}>
                    <Icon size={32} color={option.theme} />
                  </div>
                  <span className="assessment-choice-badge" style={styles.badge(option.bg, option.theme)}>{option.badge}</span>
                </div>

                <h3 style={{ fontSize: "22px", fontWeight: "700", marginBottom: "12px", color: COLORS.textPrimary }}>
                  {option.title}
                </h3>
                <p style={{ color: COLORS.textSecondary, fontSize: "15px", lineHeight: "1.6", marginBottom: "32px" }}>
                  {option.description}
                </p>

                <div className="btn-learn-more">
                  Get Started <ChevronRight size={16} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Divider */}
        <div className="assessment-choice-divider" style={styles.footerDivider}>
          <span className="assessment-choice-divider-text" style={{ 
            position: "absolute", 
            top: "50%", 
            left: "50%", 
            transform: "translate(-50%, -50%)", 
            backgroundColor: "#fff", 
            padding: "0 20px", 
            color: COLORS.textMuted, 
            fontSize: "12px", 
            fontWeight: "700", 
            textTransform: "uppercase" 
          }}>
            Platform Features
          </span>
        </div>

        {/* Features Row */}
        <div className="assessment-choice-features-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "20px" }}>
          {features.map((f, i) => {
            const FIcon = f.icon;
            return (
              <div key={i} className="assessment-choice-feature-item" style={{ textAlign: "center", padding: "10px" }}>
                <FIcon size={24} color={f.color} style={{ marginBottom: "8px" }} />
                <div className="assessment-choice-feature-title" style={{ fontWeight: "700", fontSize: "14px", color: COLORS.textPrimary }}>{f.title}</div>
                <div className="assessment-choice-feature-desc" style={{ fontSize: "12px", color: COLORS.textSecondary }}>{f.desc}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AssessmentChoice;