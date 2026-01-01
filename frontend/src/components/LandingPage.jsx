import React from "react";
import heroImage from "../assets/hero-wellness.png";
import { useNavigate } from "react-router-dom";
import {
  Heart,
  Shield,
  Users,
  ChevronRight,
  Activity,
  BarChart3,
  ShieldCheck,
  Brain,
  Layers,
  Sparkles,
  MessageCircle,
} from "lucide-react";
import "./LandingPage.css";

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="landing-container">
      {/* ===== Header / Nav ===== */}
      <header className="navbar" role="banner">
        <div className="nav-content">
          <div className="nav-left">
            <button
              className="logo-container"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              aria-label="DeepMind home"
            >
              <div className="logo-icon">
                <Heart className="heart-icon" />
              </div>
              <span className="logo-text">DeepMind</span>
            </button>
          </div>
          <nav className="nav-right" aria-label="Primary">
            <button onClick={() => navigate("/login")} className="nav-signin-btn">
              Sign In
            </button>
            <button onClick={() => navigate("/signup")} className="nav-signup-btn">
              Try for Free
            </button>
          </nav>
        </div>
      </header>

      <main>
        {/* ===== Hero ===== */}
        <section className="hero-section" aria-labelledby="hero-title">
          <div className="hero-content">
            <h1 id="hero-title" className="hero-title">
              Cut Stress & Turnover by <span className="hero-highlight">30%</span> with{" "}
              <span className="hero-highlight">AI-Powered Mental Wellness</span>
            </h1>
            <p className="hero-subtitle">
              Detect burnout risks early, activate peer support, and prove ROI with real-time KPIs.
              Trusted by HR leaders to create cultures people love.
            </p>

            <div className="hero-image">
              <img src={heroImage} alt="AI dashboard for employee wellbeing" className="hero-img" />
            </div>

            <div className="hero-actions">
              <button onClick={() => navigate("/signup")} className="hero-cta-btn">
                Book a Demo <ChevronRight className="chevron-icon" />
              </button>
              <button
                onClick={() => (window.location.hash = "#how-it-works")}
                className="hero-secondary-btn"
              >
                See How It Works
              </button>
            </div>
          </div>
        </section>

        {/* ===== Problem / Stats ===== */}
        <section className="stats-section" aria-labelledby="stats-title">
          <h2 id="stats-title" className="section-title">
            The cost of doing nothing
          </h2>
          <div className="stats-grid">
            <div className="stat-card">
              <Activity className="stat-icon" />
              <p className="stat-headline">Your people are struggling</p>
              <p className="stat-value">62%</p>
              <p className="stat-label">employees feel unwell at work</p>
            </div>
            <div className="stat-card">
              <BarChart3 className="stat-icon" />
              <p className="stat-headline">Your budget is leaking</p>
              <p className="stat-value">8%</p>
              <p className="stat-label">of payroll lost to stress & turnover</p>
            </div>
            <div className="stat-card">
              <ShieldCheck className="stat-icon" />
              <p className="stat-headline">Your execs are blind</p>
              <p className="stat-value">1 in 2</p>
              <p className="stat-label">companies track no mental-health KPIs</p>
            </div>
          </div>
        </section>

        {/* ===== Solution Snapshot (Benefits-first Features) ===== */}
        <section className="features-section" aria-labelledby="features-title">
          <h2 id="features-title" className="section-title">
            What you get
          </h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <Shield className="icon" />
              </div>
              <h3 className="feature-title">Spot burnout before it spreads</h3>
              <p className="feature-description">
                Predict stress trends early with validated assessments and proactive nudges.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <Users className="icon" />
              </div>
              <h3 className="feature-title">Boost team empathy</h3>
              <p className="feature-description">
                Normalize check-ins with pulse surveys and colleague-to-colleague support.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <Brain className="icon" />
              </div>
              <h3 className="feature-title">Defend your program with science</h3>
              <p className="feature-description">
                Big Five, Maslach Burnout, Karasek—science-backed insights you can present with
                confidence.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <Sparkles className="icon" />
              </div>
              <h3 className="feature-title">Prove ROI to leadership</h3>
              <p className="feature-description">
                Real-time KPIs and alerts—engagement, risk, training completion—all decision-ready.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <Layers className="icon" />
              </div>
              <h3 className="feature-title">Develop managers into coaches</h3>
              <p className="feature-description">
                Micro-exercises and learning paths tailored to each profile for real change.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <Heart className="icon" />
              </div>
              <h3 className="feature-title">Build a culture that retains talent</h3>
              <p className="feature-description">
                Create a safe, supportive workplace where people feel valued—at scale.
              </p>
            </div>
          </div>
        </section>

        {/* ===== How it works ===== */}
        <section id="how-it-works" className="how-section" aria-labelledby="how-title">
          <h2 id="how-title" className="section-title">
            How it works
          </h2>
          <ol className="how-grid">
            <li className="how-card">
              <div className="how-step">1</div>
              <h3 className="how-title">Assess</h3>
              <p className="how-text">
                Psychometric tests + pulse checks establish a clear baseline.
              </p>
            </li>
            <li className="how-card">
              <div className="how-step">2</div>
              <h3 className="how-title">Analyze</h3>
              <p className="how-text">
                AI spots risks, segments profiles, and prioritizes actions.
              </p>
            </li>
            <li className="how-card">
              <div className="how-step">3</div>
              <h3 className="how-title">Act</h3>
              <p className="how-text">
                Personalized coaching, peer support, and manager dashboards.
              </p>
            </li>
          </ol>
        </section>

        {/* ===== Integrations ===== */}
        <section className="integrations-section" aria-labelledby="integrations-title">
          <h2 id="integrations-title" className="section-title">
            Works where you work
          </h2>
          <ul className="integrations-list">
            <li className="integration-pill">
              <ShieldCheck className="pill-icon" alt="Slack" /> Slack
            </li>
            <li className="integration-pill">
              <ShieldCheck className="pill-icon" alt="Teams" /> Microsoft Teams
            </li>
            <li className="integration-pill">
              <ShieldCheck className="pill-icon" alt="Email" /> Email
            </li>
          </ul>
          <p className="integrations-note">Fast setup • GDPR-ready • Admin controls</p>
        </section>

        {/* ===== CTA ===== */}
        <section className="cta-section">
          <div className="cta-content">
            <h2 className="cta-title">Ready to transform your workplace?</h2>
            <p className="cta-subtitle">
              Join organizations prioritizing mental wellness with measurable impact.
            </p>
            <div className="cta-actions">
              <button onClick={() => navigate("/signup")} className="cta-btn">
                Get Started Today
              </button>
              <button onClick={() => navigate("/contact")} className="cta-outline-btn">
                Book a Demo
              </button>
            </div>
            <p className="cta-reassurance">
              Free to start • No credit card required • GDPR-compliant
            </p>
          </div>
        </section>
      </main>

      {/* ===== Footer ===== */}
      <footer className="site-footer" role="contentinfo">
        <div className="footer-grid">
          <div>
            <div className="logo-row">
              <Heart className="footer-heart" />
              <span className="footer-logo">DeepMind</span>
            </div>
            <p className="footer-blurb">AI-driven mental wellness for HR management.</p>
            <ul className="footer-trust">
              <li>✅ GDPR-Ready</li>
              <li>✅ ISO-27001 Practices</li>
              <li>✅ Science-Backed Assessments</li>
            </ul>
          </div>
          <nav aria-label="Footer">
            <ul className="footer-links">
              <li>
                <button onClick={() => navigate("/about")}>About</button>
              </li>
              <li>
                <button onClick={() => navigate("/security")}>Security</button>
              </li>
              <li>
                <button onClick={() => navigate("/privacy")}>Privacy</button>
              </li>
              <li>
                <button onClick={() => navigate("/contact")}>Contact</button>
              </li>
            </ul>
          </nav>
        </div>
        <p className="footer-copy">© {new Date().getFullYear()} DeepMind. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
