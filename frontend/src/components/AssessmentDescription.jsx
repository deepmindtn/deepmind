import React, { useState } from "react";
import {
  Search,
  Filter,
  Clock,
  Users,
  TrendingUp,
  Award,
  Brain,
  Heart,
  Zap,
  Target,
  Activity,
  Compass,
  Rocket,
  Star,
  Lightbulb,
  ChevronRight,
  Info,
} from "lucide-react";

// -----------------------
// Theme Constants
// -----------------------
const COLORS = {
  primary: "#10b981",
  primaryLight: "#ecfdf5",
  primaryDark: "#059669",
  secondary: "#14b8a6",
  blue: "#3b82f6",
  blueLight: "#eff6ff",
  purple: "#8b5cf6",
  purpleLight: "#f5f3ff",
  orange: "#f59e0b",
  red: "#ef4444",
  bgMain: "#f8fafc",
  cardBg: "#ffffff",
  textPrimary: "#1f2937",
  textSecondary: "#6b7280",
  textMuted: "#9ca3af",
  borderColor: "#e5e7eb",
  shadowHuge:
    "0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
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
  header: { marginBottom: "40px" },
  searchWrapper: { position: "relative", maxWidth: "500px", width: "100%" },
  iconBox: (bg) => ({
    width: "52px",
    height: "52px",
    borderRadius: "14px",
    backgroundColor: bg,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "20px",
  }),
  assessmentCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: "20px",
    border: `1px solid ${COLORS.borderColor}`,
    padding: "28px",
    display: "flex",
    flexDirection: "column",
    height: "100%",
    transition: "all 0.3s ease",
  },
  pill: (active) => ({
    padding: "10px 20px",
    borderRadius: "12px",
    border: active
      ? `1px solid ${COLORS.primary}`
      : `1px solid ${COLORS.borderColor}`,
    backgroundColor: active ? COLORS.primaryLight : COLORS.cardBg,
    color: active ? COLORS.primaryDark : COLORS.textSecondary,
    fontWeight: "600",
    fontSize: "14px",
    cursor: "pointer",
    transition: "all 0.2s",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    whiteSpace: "nowrap",
  }),
  tag: (tone) => {
    const tones = {
      green: { bg: COLORS.primaryLight, text: COLORS.primaryDark },
      blue: { bg: COLORS.blueLight, text: COLORS.blue },
      purple: { bg: COLORS.purpleLight, text: COLORS.purple },
      yellow: { bg: "#fffbeb", text: COLORS.orange },
    };
    const t = tones[tone] || tones.blue;
    return {
      padding: "4px 10px",
      borderRadius: "6px",
      backgroundColor: t.bg,
      color: t.text,
      fontSize: "11px",
      fontWeight: "700",
      textTransform: "uppercase",
      letterSpacing: "0.02em",
    };
  },
};

const responsiveStyles = `
  @media (max-width: 1280px) {
    .assessment-library-grid {
      grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)) !important;
    }
  }

  @media (max-width: 1024px) {
    .assessment-library-main-wrapper {
      padding: 32px 24px !important;
    }
    .assessment-library-header-wrapper {
      flex-direction: column !important;
      align-items: flex-start !important;
      gap: 24px !important;
    }
    .assessment-library-search-wrapper {
      max-width: 100% !important;
    }
    .assessment-library-filters-stats {
      flex-direction: column !important;
      gap: 16px !important;
    }
    .assessment-library-stats-bar {
      min-width: 100% !important;
    }
    .assessment-library-grid {
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)) !important;
    }
  }

  @media (max-width: 768px) {
    .assessment-library-container {
      padding: 5px 10px !important;
    }
    .assessment-library-main-wrapper {
      padding: 24px 16px !important;
      border-radius: 20px !important;
    }
    .assessment-library-header-wrapper {
      padding-bottom: 32px !important;
      margin-bottom: 32px !important;
    }
    .assessment-library-header-title-wrapper {
      flex-direction: column !important;
      align-items: flex-start !important;
      gap: 8px !important;
    }
    .assessment-library-header h1 {
      font-size: 28px !important;
    }
    .assessment-library-header p {
      font-size: 15px !important;
    }
    .assessment-library-filters-wrapper {
      overflow-x: auto !important;
      -webkit-overflow-scrolling: touch !important;
      padding-bottom: 8px !important;
          flex-direction: row;
    flex-wrap: wrap;
    justify-content: center;
    }
    .assessment-library-filters-wrapper::-webkit-scrollbar {
      height: 4px !important;
    }
    .assessment-library-filters-wrapper::-webkit-scrollbar-track {
      background: #f1f5f9 !important;
      border-radius: 4px !important;
    }
    .assessment-library-filters-wrapper::-webkit-scrollbar-thumb {
      background: #cbd5e1 !important;
      border-radius: 4px !important;
    }
    .assessment-library-pill {
      padding: 8px 16px !important;
      font-size: 13px !important;
      flex-shrink: 0 !important;
    }
    .assessment-library-grid {
      grid-template-columns: 1fr !important;
      gap: 20px !important;
    }
    .assessment-library-card {
      padding: 24px !important;
    }
  }

  @media (max-width: 480px) {
    .assessment-library-container {
      padding: 5px 8px !important;
    }
    .assessment-library-main-wrapper {
      padding: 20px 12px !important;
      border-radius: 16px !important;
    }
    .assessment-library-header-wrapper {
      padding-bottom: 24px !important;
      margin-bottom: 24px !important;
    }
    .assessment-library-header-icon {
      padding: 6px !important;
    }
    .assessment-library-header-icon svg {
      width: 20px !important;
      height: 20px !important;
    }
    .assessment-library-header h1 {
      font-size: 24px !important;
    }
    .assessment-library-header p {
      font-size: 14px !important;
    }
    .assessment-library-search-input {
      padding: 12px 16px 12px 44px !important;
      font-size: 14px !important;
    }
    .assessment-library-search-icon {
      left: 14px !important;
    }
    .assessment-library-filters-stats {
      margin-bottom: 32px !important;
    }
    .assessment-library-filters-wrapper {
      padding-bottom: 8px !important;
    }
    .assessment-library-filters-wrapper::-webkit-scrollbar {
      height: 3px !important;
    }
    .assessment-library-pill {
      padding: 7px 14px !important;
      font-size: 12px !important;
      flex-shrink: 0 !important;
    }
    .assessment-library-stats-bar {
      padding: 3px !important;
      border-radius: 12px !important;
    }
    .assessment-library-stat-badge {
      padding: 10px !important;
    }
    .assessment-library-stat-value {
      font-size: 18px !important;
    }
    .assessment-library-stat-label {
      font-size: 10px !important;
    }
    .assessment-library-grid {
      gap: 16px !important;
    }
    .assessment-library-card {
      padding: 20px !important;
    }
    .assessment-library-icon-box {
      width: 44px !important;
      height: 44px !important;
      margin-bottom: 16px !important;
    }
    .assessment-library-icon-box svg {
      width: 22px !important;
      height: 22px !important;
    }
    .assessment-library-card-category {
      font-size: 12px !important;
    }
    .assessment-library-card-title {
      font-size: 18px !important;
      margin-bottom: 10px !important;
    }
    .assessment-library-card-description {
      font-size: 13px !important;
      margin-bottom: 16px !important;
    }
    .assessment-library-card-footer {
      padding-top: 16px !important;
      margin-top: 8px !important;
      flex-direction: column !important;
      gap: 12px !important;
      align-items: flex-start !important;
    }
    .assessment-library-card-meta {
      gap: 12px !important;
      font-size: 12px !important;
    }
    .assessment-library-card-meta svg {
      width: 12px !important;
      height: 12px !important;
    }
    .assessment-library-btn-take-test {
      width: 100% !important;
      justify-content: center !important;
      padding: 10px 20px !important;
      font-size: 14px !important;
    }
    .assessment-library-tag {
      font-size: 10px !important;
      padding: 3px 8px !important;
    }
    .assessment-library-empty-state {
      padding: 60px 20px !important;
    }
    .assessment-library-empty-state svg {
      width: 40px !important;
      height: 40px !important;
      margin-bottom: 12px !important;
    }
    .assessment-library-empty-state h3 {
      font-size: 18px !important;
    }
    .assessment-library-empty-state p {
      font-size: 14px !important;
    }
  }

  .assessment-hover-card:hover { 
    transform: translateY(-8px); 
    border-color: ${COLORS.primary} !important; 
    box-shadow: ${COLORS.shadowHuge} !important; 
  }
  .primary-btn-emerald { 
    background: ${COLORS.primary}; 
    color: white; 
    border: none; 
    padding: 8px 16px; 
    border-radius: 8px; 
    font-weight: 700; 
    font-size: 13px; 
    display: flex; 
    align-items: center; 
    gap: 6px; 
    cursor: pointer; 
    transition: 0.2s; 
  }
  .primary-btn-emerald:hover { 
    background: ${COLORS.primaryDark}; 
  }
  .search-input:focus { 
    border-color: ${COLORS.primary} !important; 
    box-shadow: 0 0 0 4px ${COLORS.primaryLight} !important; 
    outline: none; 
  }
`;

// -----------------------
// Sub-Components
// -----------------------

const StatBadge = ({ value, label, color }) => (
  <div
    className="assessment-library-stat-badge"
    style={{
      textAlign: "center",
      flex: 1,
      padding: "12px",
      borderRight: `1px solid ${COLORS.borderColor}`,
    }}
  >
    <div className="assessment-library-stat-value" style={{ fontSize: "20px", fontWeight: "800", color: color }}>
      {value}
    </div>
    <div
      className="assessment-library-stat-label"
      style={{
        fontSize: "11px",
        fontWeight: "700",
        color: COLORS.textMuted,
        textTransform: "uppercase",
      }}
    >
      {label}
    </div>
  </div>
);

const AssessmentCard = ({
  name,
  description,
  tags,
  duration,
  participants,
  category,
  icon: Icon,
}) => (
  <div className="assessment-hover-card assessment-library-card" style={styles.assessmentCard}>
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
      }}
    >
      <div className="assessment-library-icon-box" style={styles.iconBox(COLORS.primaryLight)}>
        <Icon size={26} color={COLORS.primary} />
      </div>
      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
        {tags?.map((tag, idx) => (
          <span key={idx} className="assessment-library-tag" style={styles.tag(tag.tone)}>
            {tag.label}
          </span>
        ))}
      </div>
    </div>

    <div style={{ flex: 1 }}>
      <div
        className="assessment-library-card-category"
        style={{
          fontSize: "13px",
          fontWeight: "700",
          color: COLORS.secondary,
          marginBottom: "4px",
        }}
      >
        {category}
      </div>
      <h3
        className="assessment-library-card-title"
        style={{
          fontSize: "20px",
          fontWeight: "800",
          color: COLORS.textPrimary,
          marginBottom: "12px",
          lineHeight: "1.3",
        }}
      >
        {name}
      </h3>
      <p
        className="assessment-library-card-description"
        style={{
          fontSize: "14px",
          color: COLORS.textSecondary,
          lineHeight: "1.6",
          marginBottom: "20px",
        }}
      >
        {description}
      </p>
    </div>

    <div
      className="assessment-library-card-footer"
      style={{
        borderTop: `1px solid ${COLORS.borderColor}`,
        paddingTop: "20px",
        marginTop: "10px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <div className="assessment-library-card-meta" style={{ display: "flex", gap: "16px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            fontSize: "13px",
            color: COLORS.textMuted,
            fontWeight: "500",
          }}
        >
          <Clock size={14} /> {duration}
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            fontSize: "13px",
            color: COLORS.textMuted,
            fontWeight: "500",
          }}
        >
          <Users size={14} /> {participants.split(" ")[0]}
        </div>
      </div>
      <button className="primary-btn-emerald assessment-library-btn-take-test">
        Take Test <ChevronRight size={14} />
      </button>
    </div>
  </div>
);

// -----------------------
// Main Page
// -----------------------
const AssessmentPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const assessments = [
    {
      name: "Big Five Personality Test",
      description:
        "Comprehensive assessment of five key personality traits: Openness, Conscientiousness, Extraversion, Agreeableness, and Neuroticism.",
      tags: [
        { label: "Popular", tone: "green" },
        { label: "50 Qs", tone: "blue" },
      ],
      duration: "15-20 min",
      participants: "1.2k+ taken",
      category: "Personality & Behavior",
      icon: Brain,
    },
    {
      name: "DISC Personality Assessment",
      description:
        "Measures four main personality traits: Dominance, Influence, Steadiness, and Compliance. Perfect for team-building.",
      tags: [
        { label: "Recommended", tone: "yellow" },
        { label: "24 Qs", tone: "blue" },
      ],
      duration: "10-15 min",
      participants: "980+ taken",
      category: "Personality & Behavior",
      icon: Users,
    },
    {
      name: "Karasek Job Demand-Control",
      description:
        "Evaluates work stress through the balance of job demands and decision latitude. Identifies stress patterns.",
      tags: [
        { label: "Work Stress", tone: "purple" },
        { label: "26 Qs", tone: "blue" },
      ],
      duration: "12-15 min",
      participants: "750+ taken",
      category: "Work Stress & Burnout",
      icon: Target,
    },
    {
      name: "Maslach Burnout Inventory",
      description:
        "The gold standard for measuring occupational burnout across Emotional Exhaustion and Depersonalization.",
      tags: [
        { label: "Clinical", tone: "purple" },
        { label: "22 Qs", tone: "blue" },
      ],
      duration: "8-12 min",
      participants: "890+ taken",
      category: "Work Stress & Burnout",
      icon: Heart,
    },
    {
      name: "Brief Resilience Scale (BRS)",
      description:
        "Quick yet powerful assessment measuring your ability to bounce back from stress and recover quickly.",
      tags: [
        { label: "Quick", tone: "green" },
        { label: "6 Qs", tone: "blue" },
      ],
      duration: "3-5 min",
      participants: "1.5k+ taken",
      category: "Resilience & Self-Efficacy",
      icon: Zap,
    },
    {
      name: "Job Satisfaction Survey (JSS)",
      description:
        "Evaluates satisfaction across multiple job facets such as pay, promotion, supervision, and conditions.",
      tags: [
        { label: "HR Insight", tone: "green" },
        { label: "36 Qs", tone: "blue" },
      ],
      duration: "10-15 min",
      participants: "1.1k+ taken",
      category: "Workplace & Motivation",
      icon: TrendingUp,
    },
    {
      name: "Connor-Davidson Resilience (CD-RISC)",
      description:
        "Measures personal resilience through adaptability, confidence, and the ability to recover from adversity.",
      tags: [
        { label: "Validated", tone: "green" },
        { label: "10 Qs", tone: "blue" },
      ],
      duration: "5-8 min",
      participants: "970+ taken",
      category: "Resilience & Self-Efficacy",
      icon: Activity,
    },
    {
      name: "Work Self-Efficacy Scale (WSES)",
      description:
        "Assesses confidence in handling job tasks and challenges. Key indicator of motivation.",
      tags: [
        { label: "Motivation", tone: "green" },
        { label: "19 Qs", tone: "blue" },
      ],
      duration: "10-12 min",
      participants: "840+ taken",
      category: "Resilience & Self-Efficacy",
      icon: Compass,
    },
    {
      name: "General Causality (GCOS-mini)",
      description:
        "Explores intrinsic motivation and decision-making styles based on self-determination theory.",
      tags: [
        { label: "Psychology", tone: "purple" },
        { label: "12 Qs", tone: "blue" },
      ],
      duration: "10 min",
      participants: "780+ taken",
      category: "Motivation & Behavior",
      icon: Lightbulb,
    },
    {
      name: "Runco Ideational Behavior (RIBS)",
      description:
        "Assesses creative thinking behaviors, idea generation, and innovation potential in teams.",
      tags: [
        { label: "Creativity", tone: "blue" },
        { label: "23 Qs", tone: "blue" },
      ],
      duration: "10-15 min",
      participants: "560+ taken",
      category: "Creativity & Innovation",
      icon: Rocket,
    },
    {
      name: "Creative Achievement (CAQ)",
      description:
        "Evaluates real-world creative accomplishments across music, art, writing, and science.",
      tags: [
        { label: "Creativity", tone: "purple" },
        { label: "20 Items", tone: "blue" },
      ],
      duration: "12-15 min",
      participants: "610+ taken",
      category: "Creativity & Innovation",
      icon: Star,
    },
    {
      name: "Innovation Self-Efficacy (ISE)",
      description:
        "Measures confidence in generating and implementing innovative ideas in creative roles.",
      tags: [
        { label: "Innovation", tone: "blue" },
        { label: "10 Qs", tone: "blue" },
      ],
      duration: "5-8 min",
      participants: "620+ taken",
      category: "Motivation & Creativity",
      icon: Zap,
    },
  ];

  const categories = [
    "All",
    "Personality & Behavior",
    "Work Stress & Burnout",
    "Resilience & Self-Efficacy",
    "Motivation & Creativity",
  ];

  const filtered = assessments.filter((a) => {
    const matchesSearch = a.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCat =
      selectedCategory === "All" || a.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="assessment-library-container" style={styles.container}>
      <style>{responsiveStyles}</style>

      <div className="assessment-library-main-wrapper" style={styles.mainWrapperCard}>
        {/* Header Area */}
        <div
          className="assessment-library-header-wrapper"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            marginBottom: "48px",
            borderBottom: `1px solid ${COLORS.borderColor}`,
            paddingBottom: "40px",
          }}
        >
          <div className="assessment-library-header" style={{ flex: 1 }}>
            <div
              className="assessment-library-header-title-wrapper"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                marginBottom: "8px",
              }}
            >
              <div
                className="assessment-library-header-icon"
                style={{
                  padding: "8px",
                  backgroundColor: COLORS.primaryLight,
                  borderRadius: "10px",
                }}
              >
                <Compass size={24} color={COLORS.primary} />
              </div>
              <h1
                style={{
                  fontSize: "32px",
                  fontWeight: "800",
                  margin: 0,
                  color: COLORS.textPrimary,
                }}
              >
                Assessment Library
              </h1>
            </div>
            <p
              style={{
                color: COLORS.textSecondary,
                fontSize: "16px",
                margin: 0,
                maxWidth: "600px",
              }}
            >
              Scientifically-validated tools to measure personality, resilience,
              and workplace performance.
            </p>
          </div>

          <div className="assessment-library-search-wrapper" style={styles.searchWrapper}>
            <Search
              size={18}
              color={COLORS.textMuted}
              className="assessment-library-search-icon"
              style={{
                position: "absolute",
                left: "16px",
                top: "50%",
                transform: "translateY(-50%)",
              }}
            />
            <input
              className="search-input assessment-library-search-input"
              style={{
                width: "100%",
                padding: "14px 16px 14px 48px",
                borderRadius: "14px",
                border: `1px solid ${COLORS.borderColor}`,
                fontSize: "15px",
                transition: "0.2s",
              }}
              placeholder="Search by test name or trait..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Stats & Filters */}
        <div
          className="assessment-library-filters-stats"
          style={{
            display: "flex",
            gap: "24px",
            marginBottom: "40px",
            alignItems: "center",
          }}
        >
          <div
            className="assessment-library-filters-wrapper"
            style={{ display: "flex", gap: "8px", flex: 1, overflowX: "auto" }}
          >
            {categories.map((cat) => (
              <button
                key={cat}
                className="assessment-library-pill"
                style={styles.pill(selectedCategory === cat)}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat === "All" && <Filter size={14} />}
                {cat}
              </button>
            ))}
          </div>

          <div
            className="assessment-library-stats-bar"
            style={{
              display: "flex",
              backgroundColor: "#f1f5f9",
              borderRadius: "16px",
              padding: "4px",
              minWidth: "320px",
            }}
          >
            <StatBadge
              value={filtered.length}
              label="Available"
              color={COLORS.primary}
            />
            <StatBadge value="10k+" label="Taken" color={COLORS.blue} />
            <StatBadge value="4.8" label="Rating" color={COLORS.orange} />
          </div>
        </div>

        {/* Grid */}
        {filtered.length > 0 ? (
          <div
            className="assessment-library-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))",
              gap: "24px",
            }}
          >
            {filtered.map((item, idx) => (
              <AssessmentCard key={idx} {...item} />
            ))}
          </div>
        ) : (
          <div
            className="assessment-library-empty-state"
            style={{
              textAlign: "center",
              padding: "80px 0",
              border: `2px dashed ${COLORS.borderColor}`,
              borderRadius: "24px",
            }}
          >
            <Search
              size={48}
              color={COLORS.textMuted}
              style={{ marginBottom: "16px" }}
            />
            <h3 style={{ color: COLORS.textPrimary }}>No assessments found</h3>
            <p style={{ color: COLORS.textSecondary }}>
              Try adjusting your search terms or category filters.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssessmentPage;