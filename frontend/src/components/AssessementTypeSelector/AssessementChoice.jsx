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
    <div style={styles.container}>
      <style>{`
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
      `}</style>

      <div style={styles.mainWrapperCard}>
        {/* Header */}
        <div style={styles.headerSection}>
          <h1 style={{ fontSize: "36px", fontWeight: "800", color: COLORS.textPrimary, marginBottom: "12px" }}>
            Create an Assessment
          </h1>
          <p style={{ color: COLORS.textSecondary, fontSize: "18px", margin: 0 }}>
            Choose your creation method to get started
          </p>
        </div>

        {/* Options Grid */}
        <div style={styles.grid}>
          {options.map((option) => {
            const Icon = option.icon;
            return (
              <div
                key={option.id}
                className="choice-card-hover"
                style={styles.choiceCard}
                onClick={() => onSelect(option.id)}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div className="icon-bounce" style={styles.iconBox(option.bg)}>
                    <Icon size={32} color={option.theme} />
                  </div>
                  <span style={styles.badge(option.bg, option.theme)}>{option.badge}</span>
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
        <div style={styles.footerDivider}>
          <span style={{ 
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
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "20px" }}>
          {features.map((f, i) => {
            const FIcon = f.icon;
            return (
              <div key={i} style={{ textAlign: "center", padding: "10px" }}>
                <FIcon size={24} color={f.color} style={{ marginBottom: "8px" }} />
                <div style={{ fontWeight: "700", fontSize: "14px", color: COLORS.textPrimary }}>{f.title}</div>
                <div style={{ fontSize: "12px", color: COLORS.textSecondary }}>{f.desc}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AssessmentChoice;