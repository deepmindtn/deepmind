import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ClipboardCheck,
  ArrowRight,
  User,
  ShieldCheck,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Clock,
} from "lucide-react";
import "./TakeAssessment.css";

// -----------------------
// Design System (Synced with Big Five)
// -----------------------
const VARS = {
  bgMain: "var(--bg-main, #f8fafc)",
  cardBg: "var(--card-bg, #ffffff)",
  primary: "var(--primary, #6366f1)",
  primaryLight: "var(--primary-light, #e0e7ff)",
  textPrimary: "var(--text-primary, #1e293b)",
  textSecondary: "var(--text-secondary, #64748b)",
  borderColor: "var(--border-color, #e2e8f0)",
  shadowHuge: "var(--shadow-huge, 0 20px 25px -5px rgba(0, 0, 0, 0.1))",
};


const TakeAssessment = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [assignment, setAssignment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if token is missing OR literally the string "undefined"
    if (!token || token === "undefined") {
      setError("Invalid link. Please check your invitation email.");
      setLoading(false);
      return;
    }

    const fetchAssignment = async (token) => {
      try {
        const response = await fetch(
          `http://localhost:8080/api/assessments/candidate/${token}/`,
          {
            headers: {
              "Content-Type": "application/json",
              "X-Candidate-Token": token,
            },
          }
        );

        if (!response.ok) {
          throw new Error(`Server returned ${response.status}`);
        }

        const data = await response.json();
        setAssignment(data);
        setLoading(false);
      } catch (err) {
        console.error("❌ Assessment fetch error:", err);
        setError("Failed to load assessment. Please try again.");
        setLoading(false);
      }
    };

    fetchAssignment(token);
  }, [token]);

  if (loading)
    return (
      <div className="take-assessment-container">
        <div className="take-assessment-loading-container">
          <Loader2
            size={48}
            className="spin take-assessment-loading-spinner"
          />
          <p className="take-assessment-loading-text">
            Preparing assessment portal...
          </p>
        </div>
      </div>
    );

  if (error || !assignment)
    return (
      <div className="take-assessment-container">
        <div className="take-assessment-wrapper take-assessment-error-card">
          <AlertCircle
            size={64}
            color="#ef4444"
            className="take-assessment-error-icon"
          />
          <h2 className="take-assessment-error-title">
            Access Denied
          </h2>
          <p className="take-assessment-error-text">
            {error}
          </p>
          <button
            className="take-assessment-btn take-assessment-btn-outline"
            onClick={() => window.location.reload()}
          >
            Try Refreshing
          </button>
        </div>
      </div>
    );

  if (assignment.status === "COMPLETED")
    return (
      <div className="take-assessment-container">
        <div className="take-assessment-wrapper take-assessment-completed-card">
          <div className="take-assessment-icon-box take-assessment-icon-box-success">
            <CheckCircle2 size={40} />
          </div>
          <h2 className="take-assessment-completed-title">
            Assessment Completed
          </h2>
          <p className="take-assessment-completed-text">
            This assessment was submitted on{" "}
            <b>{new Date(assignment.completed_at).toLocaleDateString()}</b>.
          </p>
          <div className="take-assessment-completed-info">
            The results have been sent to the hiring team.
          </div>
        </div>
      </div>
    );

  const startAssessment = () => {
    // 1. Save critical session data
    sessionStorage.setItem("candidateToken", token);
    sessionStorage.setItem("candidateAssignmentId", assignment.id);
    sessionStorage.setItem("isCandidate", "true");

    const testType = assignment.template?.code || assignment.assessment_type;

    // 2. Updated Routing Map with ALL new tests
    const routeMap = {
      // Standard Tests
      BIG_FIVE: "/candidate/big-five",
      BIG5: "/candidate/big-five",
      KARASEK: "/candidate/karasek",
      MASLACH: "/candidate/maslach",
      MBI: "/candidate/maslach",
      DISC: "/candidate/disc",
      
      // Additional Tests
      JSS: "/candidate/jss",
      BRS: "/candidate/brs",
      
      // New Assessments
      ISE: "/candidate/ise",
      CDRISC: "/candidate/cdrisc",
      "CD-RISC": "/candidate/cdrisc", // Handle variation
      WSES: "/candidate/wses",
      GCOS: "/candidate/gcos",
      RIBS: "/candidate/ribs",
      CAQ: "/candidate/caq",
    };

    const targetRoute = routeMap[testType];

    if (targetRoute) {
      navigate(targetRoute);
    } else {
      console.error("Unknown Test Type:", testType);
      alert(
        `Error: Unknown assessment type (${testType}). Please contact support.`
      );
    }
  };

  return (
    <div className="take-assessment-container">
      <div className="take-assessment-wrapper">
        {/* Hero Banner */}
        <div className="take-assessment-hero">
          <div className="take-assessment-hero-left">
            <div className="take-assessment-icon-box">
              <ClipboardCheck size={36} strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="take-assessment-hero-title">
                {assignment.template.name}
              </h1>
              <p className="take-assessment-hero-subtitle">
                Invitation from the Recruitment Team
              </p>
            </div>
          </div>
          <div className="take-assessment-hero-right">
            <span className="take-assessment-ref-badge">
              Ref: {assignment.template.code}
            </span>
          </div>
        </div>

        <div className="take-assessment-content-body">
          {/* Left Column: Instructions */}
          <div className="take-assessment-main-content">
            <h2 className="take-assessment-welcome-title">
              Welcome, {assignment.recruitee.first_name || "Candidate"}
            </h2>
            <p className="take-assessment-welcome-text">
              You have been invited to participate in a psychometric evaluation.
              This tool helps us understand your unique working style and
              strengths to ensure a great fit for the team. The process is
              intuitive and typically takes 5-10 minutes.
            </p>

            <div className="take-assessment-info-card take-assessment-info-card-highlight">
              <h4 className="take-assessment-info-card-title">
                <Clock size={18} color={VARS.primary} /> Before you begin:
              </h4>
              <ul className="take-assessment-info-list">
                <li>
                  Ensure you are in a quiet environment without distractions.
                </li>
                <li>
                  There are no right or wrong answers; please be as authentic as
                  possible.
                </li>
                <li>Your progress will be saved automatically as you go.</li>
              </ul>
            </div>

            <button className="take-assessment-btn take-assessment-btn-primary" onClick={startAssessment}>
              Get Started <ArrowRight size={20} />
            </button>
          </div>

          {/* Right Column: Sidebar Meta */}
          <div className="take-assessment-sidebar">
            <div className="take-assessment-info-card">
              <h4 className="take-assessment-section-title">
                <User size={16} /> Candidate Profile
              </h4>
              <div className="take-assessment-field-group">
                <div>
                  <label className="take-assessment-field-label">
                    Full Name
                  </label>
                  <p className="take-assessment-field-value">
                    {assignment.recruitee.first_name}{" "}
                    {assignment.recruitee.last_name}
                  </p>
                </div>
                <div>
                  <label className="take-assessment-field-label">
                    Invitation Date
                  </label>
                  <p className="take-assessment-field-value">
                    {new Date(assignment.assigned_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="take-assessment-info-card">
              <h4 className="take-assessment-section-title take-assessment-section-title-small">
                <ShieldCheck size={16} /> Privacy & Trust
              </h4>
              <p className="take-assessment-privacy-text">
                This link is unique to your application. Results are
                confidential and only shared with authorized recruitment
                personnel.
              </p>
            </div>

            <div className="take-assessment-footer">
              <p className="take-assessment-footer-text">
                Powered by Psychometric Assessment Suite
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TakeAssessment;