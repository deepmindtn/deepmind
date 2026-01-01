import React, { useState } from "react";
import { Search, Filter, Clock, Users, TrendingUp, Award, Brain, Heart, Zap, Target, Activity, Compass,
    Rocket, Star,   Lightbulb, } from "lucide-react";

// Badge Component
const Badge = ({ children, tone, icon: Icon }) => {
  const toneClasses = {
    green: "bg-success bg-opacity-10 text-success border-success",
    yellow: "bg-warning bg-opacity-10 text-warning border-warning",
    blue: "bg-primary bg-opacity-10 text-primary border-primary",
    purple: "bg-purple bg-opacity-10 text-purple border-purple",
  };

  return (
    <span className={`badge border ${toneClasses[tone] || toneClasses.yellow} d-inline-flex align-items-center gap-1`}>
      {Icon && <Icon size={12} />}
      {children}
    </span>
  );
};

// Assessment Card Component
const AssessmentCard = ({ name, description, tags, duration, participants, category, icon: Icon }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className="card border-0 shadow-sm h-100"
      style={{ 
        transition: "all 0.3s ease",
        transform: isHovered ? "translateY(-4px)" : "translateY(0)",
        boxShadow: isHovered ? "0 8px 24px rgba(0,0,0,0.12)" : "0 2px 8px rgba(0,0,0,0.08)"
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="card-body p-4">
        <div className="d-flex align-items-start mb-3">
          <div 
            className="rounded-circle d-flex align-items-center justify-content-center me-3"
            style={{ 
              width: '48px', 
              height: '48px',
              backgroundColor: '#d1fae5',
              flexShrink: 0
            }}
          >
            {Icon ? <Icon size={24} className="text-success" /> : <Brain size={24} className="text-success" />}
          </div>
          <div className="flex-grow-1">
            <div className="d-flex justify-content-between align-items-start mb-2">
              <h5 className="card-title mb-0 fw-bold">{name}</h5>
              <div className="d-flex gap-1 flex-wrap">
                {tags?.map((tag, idx) => (
                  <Badge key={idx} tone={tag.tone} icon={tag.icon}>
                    {tag.label}
                  </Badge>
                ))}
              </div>
            </div>
            <span className="badge bg-light text-dark border small mb-2">{category}</span>
          </div>
        </div>

        <p className="card-text text-muted mb-3" style={{ lineHeight: 1.6 }}>
          {description}
        </p>

        <div className="d-flex justify-content-between align-items-center pt-3 border-top">
          <div className="d-flex gap-3">
            <div className="d-flex align-items-center text-muted small">
              <Clock size={16} className="me-1" />
              <span>{duration}</span>
            </div>
            <div className="d-flex align-items-center text-muted small">
              <Users size={16} className="me-1" />
              <span>{participants}</span>
            </div>
          </div>
          <button className="btn btn-primary btn-sm">
            Start Assessment
          </button>
        </div>
      </div>
    </div>
  );
};

// Main Page Component
const AssessmentPage = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All");
  
    const assessments = [
      {
        name: "Big Five Personality Test",
        description:
          "Comprehensive assessment of five key personality traits: Openness, Conscientiousness, Extraversion, Agreeableness, and Neuroticism. Gain deep insights into personality tendencies and workplace behaviors.",
        tags: [
          { label: "Popular", tone: "green", icon: TrendingUp },
          { label: "50 Questions", tone: "blue" },
        ],
        duration: "15-20 min",
        participants: "1.2k+ taken",
        category: "Personality & Behavior",
        icon: Brain,
      },
      {
        name: "DISC Personality Assessment",
        description:
          "Measures four main personality traits: Dominance, Influence, Steadiness, and Compliance. Perfect for team-building, understanding communication styles, and improving workplace dynamics.",
        tags: [
          { label: "Recommended", tone: "yellow", icon: Award },
          { label: "24 Questions", tone: "blue" },
        ],
        duration: "10-15 min",
        participants: "980+ taken",
        category: "Personality & Behavior",
        icon: Users,
      },
      {
        name: "Karasek Job Demand-Control",
        description:
          "Evaluates work stress through the balance of job demands and decision latitude. Identifies stress patterns and helps create healthier work environments with better work-life balance.",
        tags: [
          { label: "Work Stress", tone: "purple" },
          { label: "26 Questions", tone: "blue" },
        ],
        duration: "12-15 min",
        participants: "750+ taken",
        category: "Work Stress & Burnout",
        icon: Target,
      },
      {
        name: "Maslach Burnout Inventory",
        description:
          "The gold standard for measuring occupational burnout across three dimensions: Emotional Exhaustion, Depersonalization, and Personal Accomplishment. Essential for workplace wellness programs.",
        tags: [
          { label: "Clinical", tone: "purple" },
          { label: "22 Questions", tone: "blue" },
        ],
        duration: "8-12 min",
        participants: "890+ taken",
        category: "Work Stress & Burnout",
        icon: Heart,
      },
      {
        name: "Brief Resilience Scale (BRS)",
        description:
          "Quick yet powerful assessment measuring your ability to bounce back from stress. Understand your resilience capacity and discover strategies to strengthen your mental fortitude.",
        tags: [
          { label: "Quick", tone: "green", icon: Zap },
          { label: "6 Questions", tone: "blue" },
        ],
        duration: "3-5 min",
        participants: "1.5k+ taken",
        category: "Resilience & Self-Efficacy",
        icon: Award,
      },
      {
        name: "Job Satisfaction Survey (JSS)",
        description:
          "Evaluates satisfaction across multiple job facets such as pay, promotion, supervision, and work conditions. Helps identify improvement areas in employee satisfaction and engagement.",
        tags: [
          { label: "HR Insight", tone: "green" },
          { label: "36 Questions", tone: "blue" },
        ],
        duration: "10-15 min",
        participants: "1.1k+ taken",
        category: "Workplace & Motivation",
        icon: TrendingUp,
      },
      {
        name: "Connor-Davidson Resilience Scale (CD-RISC 10)",
        description:
          "Measures personal resilience through adaptability, confidence, and the ability to recover from adversity. Frequently used in psychology and corporate well-being programs.",
        tags: [
          { label: "Validated", tone: "green" },
          { label: "10 Questions", tone: "blue" },
        ],
        duration: "5-8 min",
        participants: "970+ taken",
        category: "Resilience & Self-Efficacy",
        icon: Activity,
      },
      {
        name: "Work Self-Efficacy Scale (WSES)",
        description:
          "Assesses confidence in handling job tasks and challenges. A key indicator of motivation and perceived ability to perform effectively in the workplace.",
        tags: [
          { label: "Motivation", tone: "green" },
          { label: "19 Questions", tone: "blue" },
        ],
        duration: "10-12 min",
        participants: "840+ taken",
        category: "Resilience & Self-Efficacy",
        icon: Compass,
      },
      {
        name: "General Causality Orientations Scale (GCOS-mini)",
        description:
          "Explores intrinsic motivation and decision-making styles. Based on self-determination theory, it identifies autonomy, control, and impersonal orientations.",
        tags: [
          { label: "Motivation Style", tone: "purple" },
          { label: "12 Questions", tone: "blue" },
        ],
        duration: "10 min",
        participants: "780+ taken",
        category: "Motivation & Behavior",
        icon: Lightbulb,
      },
      {
        name: "Runco Ideational Behavior Scale (RIBS)",
        description:
          "Assesses creative thinking behaviors, idea generation, and innovation potential. Ideal for identifying creativity in individuals and teams.",
        tags: [
          { label: "Creativity", tone: "blue" },
          { label: "23 Questions", tone: "blue" },
        ],
        duration: "10-15 min",
        participants: "560+ taken",
        category: "Creativity & Innovation",
        icon: Rocket,
      },
      {
        name: "Creative Achievement Questionnaire (CAQ)",
        description:
          "Evaluates real-world creative accomplishments across ten domains such as music, art, writing, and science. A strong indicator of applied creativity.",
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
        name: "Innovation Self-Efficacy Scale (ISE)",
        description:
          "Measures confidence in generating and implementing innovative ideas. Perfect for creative roles and innovation-focused teams looking to foster a culture of innovation.",
        tags: [
          { label: "Innovation", tone: "blue" },
          { label: "10 Questions", tone: "blue" },
        ],
        duration: "5-8 min",
        participants: "620+ taken",
        category: "Motivation & Creativity",
        icon: Zap,
      },
    ];
  

  const categories = ["All", "Personality & Behavior", "Work Stress & Burnout", "Resilience & Self-Efficacy", "Motivation & Creativity"];

  const filteredAssessments = assessments.filter(a => {
    const matchesSearch = a.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         a.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || a.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <>
      <link 
        href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.2/css/bootstrap.min.css" 
        rel="stylesheet"
      />
      <style>{`
        body { 
          background-color: #f8f9fa;
          min-height: 100vh;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        }
        .hero-section {
          background-color: white;
          color: #1f2937;
          padding: 4rem 0;
          margin-bottom: 2rem;
          border-bottom: 1px solid #e5e7eb;
        }
        .card {
          transition: all 0.3s ease;
        }
        .badge { font-weight: 500; }
        .bg-purple { background-color: #a855f7; }
        .text-purple { color: #a855f7; }
        .border-purple { border-color: #a855f7 !important; }
        .category-pill {
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .category-pill:hover {
          transform: translateY(-2px);
        }
        .category-pill.active {
          background-color: #10b981 !important;
          color: white !important;
          border-color: #10b981 !important;
        }
      `}</style>

      <div className="hero-section">
        <div className="container">
          <div className="text-center mb-4">
            <h1 className="display-4 fw-bold mb-3">Assessment Library</h1>
            <p className="lead mb-0">Discover insights about yourself and your team with our scientifically-validated assessments</p>
          </div>

          {/* Search Bar */}
          <div className="row justify-content-center">
            <div className="col-md-8 col-lg-6">
              <div className="input-group input-group-lg shadow">
                <span className="input-group-text bg-white border-end-0">
                  <Search size={20} className="text-muted" />
                </span>
                <input
                  type="text"
                  className="form-control border-start-0"
                  placeholder="Search assessments..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container pb-5">
        {/* Category Filter */}
        <div className="d-flex gap-2 mb-4 overflow-auto pb-2">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`btn btn-light category-pill ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              <Filter size={16} className="me-1" />
              {cat}
            </button>
          ))}
        </div>

        {/* Stats Bar */}
        <div className="row g-3 mb-4">
          <div className="col-md-4">
            <div className="card border-0 shadow-sm">
              <div className="card-body text-center">
                <h3 className="fw-bold text-primary mb-1">{filteredAssessments.length}</h3>
                <p className="text-muted mb-0 small">Available Assessments</p>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card border-0 shadow-sm">
              <div className="card-body text-center">
                <h3 className="fw-bold text-success mb-1">10k+</h3>
                <p className="text-muted mb-0 small">Assessments Completed</p>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card border-0 shadow-sm">
              <div className="card-body text-center">
                <h3 className="fw-bold text-warning mb-1">4.8★</h3>
                <p className="text-muted mb-0 small">Average Rating</p>
              </div>
            </div>
          </div>
        </div>

        {/* Assessment Grid */}
        {filteredAssessments.length > 0 ? (
          <div className="row g-4">
            {filteredAssessments.map((assessment, idx) => (
              <div key={idx} className="col-md-6 col-lg-4">
                <AssessmentCard {...assessment} />
              </div>
            ))}
          </div>
        ) : (
          <div className="card border-0 shadow-sm">
            <div className="card-body text-center py-5">
              <Search size={48} className="text-muted mb-3" />
              <h5 className="text-muted">No assessments found</h5>
              <p className="text-muted mb-0">Try adjusting your search or filter criteria</p>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default AssessmentPage;