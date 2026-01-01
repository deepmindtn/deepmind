import React, { useState } from "react";
import { Sparkles, PenTool, BookOpen, ArrowRight, Zap } from "lucide-react";

const AssessmentChoice = ({ onSelect }) => {
  const [hoveredCard, setHoveredCard] = useState(null);

  const options = [
    {
      id: "ai",
      icon: Sparkles,
      title: "Generate with AI",
      description:
        "Let AI create a personalized health assessment survey tailored to your needs",
      badge: "Smart",
      badgeColor: "primary",
      gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    },
    {
      id: "custom",
      icon: PenTool,
      title: "Create it Yourself",
      description:
        "Upload or manually build your own custom questions and assessments",
      badge: "Flexible",
      badgeColor: "success",
      gradient: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
    },
    {
      id: "template",
      icon: BookOpen,
      title: "Choose a Test",
      description:
        "Select from our library of pre-built assessments based on your pricing plan",
      badge: "Quick Start",
      badgeColor: "warning",
      gradient: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
    },
  ];

  return (
    <>
      <link
        href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.2/css/bootstrap.min.css"
        rel="stylesheet"
      />
      <style>{`
      .assessment-page{
      max-width: 1200px;
      }
        body {
          background-color: #f8f9fa;
          min-height: 100vh;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        }
        .choice-card {
          transition: all 0.3s ease;
          cursor: pointer;
          border: 2px solid transparent;
          position: relative;
          overflow: hidden;
        }
        .choice-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 12px 28px rgba(0,0,0,0.12);
          border-color: #10b981;
        }
        .choice-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, #10b981 0%, #059669 100%);
          transform: scaleX(0);
          transition: transform 0.3s ease;
        }
        .choice-card:hover::before {
          transform: scaleX(1);
        }
        .icon-wrapper {
          width: 64px;
          height: 64px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: #d1fae5;
          margin-bottom: 1.5rem;
          transition: all 0.3s ease;
        }
        .choice-card:hover .icon-wrapper {
          background-color: #10b981;
          transform: scale(1.1) rotate(5deg);
        }
        .choice-card:hover .icon-wrapper svg {
          color: white !important;
        }
        .arrow-icon {
          opacity: 0;
          transform: translateX(-10px);
          transition: all 0.3s ease;
        }
        .choice-card:hover .arrow-icon {
          opacity: 1;
          transform: translateX(0);
        }
        .hero-section {
          background: white;
          padding: 3rem 0 2rem;
          margin-bottom: 3rem;
          border-bottom: 1px solid #e5e7eb;
        }
        .feature-pill {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background-color: #d1fae5;
          border-radius: 999px;
          font-size: 0.875rem;
          font-weight: 500;
          color: #047857;
          margin: 0.25rem;
        }
      `}</style>

      <div className="hero-section">
        <div className="container">
          <div className="text-center">
            <div className="d-inline-flex align-items-center gap-2 mb-3 px-4 py-2 bg-light rounded-pill">
              <Zap size={16} className="text-success" />
              <span className="small fw-semibold text-muted">
                Get Started in Minutes
              </span>
            </div>
            <h1 className="display-5 fw-bold mb-3">
              Choose Your Assessment Method
            </h1>
            <p className="lead text-muted mb-0">
              Select the option that best fits your needs and workflow
            </p>
          </div>
        </div>
      </div>

      <div className="container pb-5">
        <div className="row g-4 justify-content-center">
          {options.map((option) => {
            const Icon = option.icon;
            return (
              <div key={option.id} className="col-md-6 col-lg-4">
                <div
                  className="card choice-card h-100 border-0 shadow-sm"
                  onClick={() => onSelect(option.id)}
                  onMouseEnter={() => setHoveredCard(option.id)}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  <div className="card-body p-4">
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <div className="icon-wrapper">
                        <Icon size={32} className="text-success" />
                      </div>
                      <span
                        className={`badge bg-${option.badgeColor} bg-opacity-10 text-${option.badgeColor} border border-${option.badgeColor}`}
                      >
                        {option.badge}
                      </span>
                    </div>

                    <h3 className="h5 fw-bold mb-3">{option.title}</h3>
                    <p className="text-muted mb-4" style={{ lineHeight: 1.6 }}>
                      {option.description}
                    </p>

                    <div className="d-flex align-items-center justify-content-between mt-auto">
                      <span className="text-success fw-semibold small">
                        Learn more
                      </span>
                      <ArrowRight
                        size={20}
                        className={`text-success arrow-icon ${
                          hoveredCard === option.id ? "visible" : ""
                        }`}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Features Section */}
        <div className="row mt-5 pt-5 border-top">
          <div className="col-12 text-center mb-4">
            <h4 className="fw-bold mb-3">Why Choose Our Platform?</h4>
            <p className="text-muted">
              Powerful features to help you create better assessments
            </p>
          </div>
          <div className="col-md-3 col-sm-6 mb-3 text-center">
            <div className="p-3">
              <div
                className="rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                style={{
                  width: "56px",
                  height: "56px",
                  backgroundColor: "#d1fae5",
                }}
              >
                <Sparkles size={24} className="text-success" />
              </div>
              <h6 className="fw-semibold mb-2">AI-Powered</h6>
              <p className="text-muted small mb-0">Smart question generation</p>
            </div>
          </div>
          <div className="col-md-3 col-sm-6 mb-3 text-center">
            <div className="p-3">
              <div
                className="rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                style={{
                  width: "56px",
                  height: "56px",
                  backgroundColor: "#d1fae5",
                }}
              >
                <Zap size={24} className="text-success" />
              </div>
              <h6 className="fw-semibold mb-2">Lightning Fast</h6>
              <p className="text-muted small mb-0">Deploy in minutes</p>
            </div>
          </div>
          <div className="col-md-3 col-sm-6 mb-3 text-center">
            <div className="p-3">
              <div
                className="rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                style={{
                  width: "56px",
                  height: "56px",
                  backgroundColor: "#d1fae5",
                }}
              >
                <BookOpen size={24} className="text-success" />
              </div>
              <h6 className="fw-semibold mb-2">Rich Library</h6>
              <p className="text-muted small mb-0">100+ templates</p>
            </div>
          </div>
          <div className="col-md-3 col-sm-6 mb-3 text-center">
            <div className="p-3">
              <div
                className="rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                style={{
                  width: "56px",
                  height: "56px",
                  backgroundColor: "#d1fae5",
                }}
              >
                <PenTool size={24} className="text-success" />
              </div>
              <h6 className="fw-semibold mb-2">Fully Customizable</h6>
              <p className="text-muted small mb-0">Your way, your brand</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AssessmentChoice;
