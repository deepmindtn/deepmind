import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Heart,
  Shield,
  Users,
  Activity,
  BarChart3,
  ShieldCheck,
  Brain,
  Layers,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Zap,
  TrendingUp,
  MessageCircle,
  Mail,
  Settings,
  Lock,
  Star,
  Calendar,
  CreditCard,
  Award,
  Twitter,
  Linkedin,
  Github,
} from "lucide-react";
import "./LandingPage.css";

const LandingPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Scroll reveal animation
    const observerOptions = {
      threshold: 0.1,
      rootMargin: "0px 0px -100px 0px",
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("reveal-active");
        }
      });
    }, observerOptions);

    document.querySelectorAll(".reveal").forEach((el) => {
      observer.observe(el);
    });

    // Animated grid background on scroll & Dynamic Island navbar
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrolled = window.scrollY;
          const grid = document.querySelector(".bg-grid");
          const navbar = document.querySelector(".navbar");
          
          if (grid) {
            grid.style.transform = `translateY(${scrolled * 0.3}px)`;
          }
          
          // Show navbar after scrolling 100px
          if (navbar) {
            if (scrolled > 100) {
              navbar.classList.add("navbar-visible");
            } else {
              navbar.classList.remove("navbar-visible");
            }
          }
          
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      observer.disconnect();
    };
  }, []);

  const features = [
    {
      icon: Shield,
      title: "Spot burnout before it spreads",
      description: "Predict stress trends early with validated assessments and proactive nudges.",
    },
    {
      icon: Users,
      title: "Boost team empathy",
      description: "Normalize check-ins with pulse surveys and colleague-to-colleague support.",
    },
    {
      icon: Brain,
      title: "Defend your program with science",
      description: "Big Five, Maslach Burnout, Karasek—science-backed insights you can present with confidence.",
    },
    {
      icon: Sparkles,
      title: "Prove ROI to leadership",
      description: "Real-time KPIs and alerts—engagement, risk, training completion—all decision-ready.",
    },
    {
      icon: Layers,
      title: "Develop managers into coaches",
      description: "Micro-exercises and learning paths tailored to each profile for real change.",
    },
    {
      icon: Heart,
      title: "Build a culture that retains talent",
      description: "Create a safe, supportive workplace where people feel valued—at scale.",
    },
  ];

  const stats = [
    {
      icon: Activity,
      value: "62%",
      label: "employees feel unwell at work",
      headline: "Your people are struggling",
    },
    {
      icon: BarChart3,
      value: "8%",
      label: "of payroll lost to stress & turnover",
      headline: "Your budget is leaking",
    },
    {
      icon: ShieldCheck,
      value: "1 in 2",
      label: "companies track no mental-health KPIs",
      headline: "Your execs are blind",
    },
  ];

  const integrations = [
    {
      icon: MessageCircle,
      name: "Slack",
      description: "Native bot for instant wellbeing check-ins",
      className: "slack-icon",
    },
    {
      icon: Users,
      name: "Microsoft Teams",
      description: "Seamless integration with your workflow",
      className: "teams-icon",
    },
    {
      icon: Mail,
      name: "Email",
      description: "Automated surveys and notifications",
      className: "email-icon",
    },
  ];

  const steps = [
    {
      number: "1",
      title: "Assess",
      text: "Psychometric tests + pulse checks establish a clear baseline.",
    },
    {
      number: "2",
      title: "Analyze",
      text: "AI spots risks, segments profiles, and prioritizes actions.",
    },
    {
      number: "3",
      title: "Act",
      text: "Personalized coaching, peer support, and manager dashboards.",
    },
  ];

  return (
    <div className="landing-wrapper">
      <div className="bg-grid"></div>
      <div className="orb orb-1"></div>
      <div className="orb orb-2"></div>

      {/* Navigation */}
      <nav className="navbar">
        <div className="container nav-container">
          <div className="logo" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
            <div className="logo-icon">
              <Heart size={20} color="white" />
            </div>
            <span className="logo-text">DeepMind</span>
          </div>
          <div className="nav-buttons">
            <button className="btn btn-ghost" onClick={() => navigate("/login")}>
              Sign In
            </button>
            <button className="btn btn-primary" onClick={() => navigate("/signup")}>
              Try for Free
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="badge animate-fade-in-up">
            <Zap size={16} />
            <span>AI-Powered Mental Wellness</span>
          </div>

          <h1 className="animate-fade-in-up">
            Cut Stress &<br />
            <span className="gradient-text">Turnover by 30%</span>
          </h1>

          <p className="hero-subtitle animate-fade-in-up">
            Detect burnout risks early, activate peer support, and prove ROI with real-time KPIs.
            Trusted by HR leaders to create cultures people love.
          </p>

          <div className="hero-buttons animate-fade-in-up">
            <button className="btn btn-primary btn-large" onClick={() => navigate("/signup")}>
              Book a Demo
              <ArrowRight size={20} />
            </button>
            <button
              className="btn btn-secondary btn-large"
              onClick={() => (window.location.hash = "#how-it-works")}
            >
              See How It Works
            </button>
          </div>

          <div className="dashboard-preview animate-fade-in-up">
            <div className="dashboard-glow"></div>
            <div className="dashboard">
              <div className="dashboard-header">
                <div className="window-controls">
                  <div className="dot red"></div>
                  <div className="dot yellow"></div>
                  <div className="dot green"></div>
                </div>
                <span style={{ color: "#64748b", fontSize: "0.875rem" }}>DeepMind Dashboard</span>
              </div>
              <div className="dashboard-body">
                <div className="chart-area">
                  <div className="chart-header">
                    <h3 className="chart-title">Wellbeing Trends</h3>
                    <TrendingUp size={20} color="#10b981" />
                  </div>
                  {[80, 65, 90, 75, 95].map((value, i) => (
                    <div key={i} className="progress-bar">
                      <div className="progress-track">
                        <div
                          className="progress-fill"
                          style={{
                            "--width": `${value}%`,
                            animationDelay: `${i * 0.2}s`,
                          }}
                        ></div>
                      </div>
                      <span className="stat-label">{value}%</span>
                    </div>
                  ))}
                </div>
                <div className="stat-cards">
                  <div className="stat-card">
                    <Activity size={32} color="#10b981" />
                    <div className="stat-value color-primary">92%</div>
                    <div className="stat-label">Engagement</div>
                  </div>
                  <div className="stat-card">
                    <Shield size={32} color="#14b8a6" />
                    <div className="stat-value color-secondary">-30%</div>
                    <div className="stat-label">Turnover</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="section">
        <div className="container">
          <h2 className="reveal">
            The cost of <span className="gradient-text">doing nothing</span>
          </h2>
          <div className="stats-grid">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="stat-item reveal">
                  <Icon className="stat-icon" />
                  <div className="stat-headline">{stat.headline}</div>
                  <div className="stat-big">{stat.value}</div>
                  <div className="stat-label">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section">
        <div className="container">
          <h2 className="reveal">
            What you <span className="gradient-text">get</span>
          </h2>
          <div className="features-grid">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="feature-card reveal">
                  <div className="feature-icon">
                    <Icon size={32} color="white" />
                  </div>
                  <h3 className="feature-title">{feature.title}</h3>
                  <p className="feature-description">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="section" id="how-it-works">
        <div className="container">
          <h2 className="reveal">
            How it <span className="gradient-text">works</span>
          </h2>
          <div className="steps-grid">
            {steps.map((step, index) => (
              <div key={index} className="step-card reveal">
                <div className="step-number">{step.number}</div>
                <div className="step-badge">{step.number}</div>
                <h3 className="step-title">{step.title}</h3>
                <p className="step-text">{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Integrations Section */}
      <section className="section" style={{ paddingTop: "60px" }}>
        <div className="container">
          <h2 className="reveal">
            Works where <span className="gradient-text">you work</span>
          </h2>

          <div className="integrations-showcase">
            {integrations.map((integration, index) => {
              const Icon = integration.icon;
              return (
                <div key={index} className="integration-card reveal">
                  <div className="integration-icon-wrapper">
                    <div className={`integration-icon ${integration.className}`}>
                      <Icon size={32} />
                    </div>
                  </div>
                  <h3 className="integration-name">{integration.name}</h3>
                  <p className="integration-desc">{integration.description}</p>
                  <div className="integration-badge">✓ Connected</div>
                </div>
              );
            })}
          </div>

          <div className="integration-features reveal">
            <div className="integration-feature">
              <Zap size={20} color="#10b981" />
              <span>Fast 5-minute setup</span>
            </div>
            <div className="integration-feature">
              <ShieldCheck size={20} color="#10b981" />
              <span>GDPR-ready</span>
            </div>
            <div className="integration-feature">
              <Settings size={20} color="#10b981" />
              <span>Full admin controls</span>
            </div>
            <div className="integration-feature">
              <Lock size={20} color="#10b981" />
              <span>Enterprise-grade security</span>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section reveal">
        <div className="container">
          <div className="cta-box">
            <div className="cta-glow"></div>
            <div className="cta-content">
              <div className="cta-badge">
                <Star size={16} />
                <span>Join 500+ organizations</span>
              </div>
              <h2 className="cta-title">Ready to transform your workplace?</h2>
              <p className="cta-subtitle">
                Join organizations prioritizing mental wellness with measurable impact.
              </p>
              <div className="cta-buttons">
                <button className="btn btn-primary btn-large" onClick={() => navigate("/signup")}>
                  Get Started Today
                  <ArrowRight size={20} />
                </button>
                <button className="btn btn-secondary btn-large" onClick={() => navigate("/contact")}>
                  <Calendar size={20} />
                  Book a Demo
                </button>
              </div>
              <div className="trust-badges">
                <div className="trust-badge">
                  <CheckCircle2 size={16} />
                  <span>Free to start</span>
                </div>
                <div className="trust-badge">
                  <CreditCard size={16} />
                  <span>No credit card required</span>
                </div>
                <div className="trust-badge">
                  <ShieldCheck size={16} />
                  <span>GDPR-compliant</span>
                </div>
              </div>

              {/* Social Proof */}
              <div className="social-proof">
                <div className="testimonial-mini">
                  <div className="stars">★★★★★</div>
                  <p>"Reduced turnover by 35% in 6 months"</p>
                  <span className="author">— Sarah K., HR Director</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-column footer-main">
              <div className="footer-logo">
                <div className="logo-icon">
                  <Heart size={24} color="white" />
                </div>
                <span className="logo-text">DeepMind</span>
              </div>
              <p className="footer-description">
                AI-driven mental wellness for HR management. Building healthier workplaces through
                science and technology.
              </p>
              <div className="footer-badges">
                <div className="footer-badge">
                  <ShieldCheck size={16} />
                  <span>GDPR-Ready</span>
                </div>
                <div className="footer-badge">
                  <Award size={16} />
                  <span>ISO-27001</span>
                </div>
                <div className="footer-badge">
                  <Brain size={16} />
                  <span>Science-Backed</span>
                </div>
              </div>
            </div>

            <div className="footer-column">
              <h4>Product</h4>
              <ul className="footer-links">
                <li>
                  <a href="#features">Features</a>
                </li>
                <li>
                  <a href="#how-it-works">How It Works</a>
                </li>
                <li>
                  <a href="#integrations">Integrations</a>
                </li>
                <li>
                  <a href="#pricing">Pricing</a>
                </li>
                <li>
                  <a href="#case-studies">Case Studies</a>
                </li>
              </ul>
            </div>

            <div className="footer-column">
              <h4>Company</h4>
              <ul className="footer-links">
                <li>
                  <a href="#about">About Us</a>
                </li>
                <li>
                  <a href="#blog">Blog</a>
                </li>
                <li>
                  <a href="#careers">Careers</a>
                </li>
                <li>
                  <a href="#press">Press Kit</a>
                </li>
                <li>
                  <a href="#contact">Contact</a>
                </li>
              </ul>
            </div>

            <div className="footer-column">
              <h4>Resources</h4>
              <ul className="footer-links">
                <li>
                  <a href="#docs">Documentation</a>
                </li>
                <li>
                  <a href="#api">API Reference</a>
                </li>
                <li>
                  <a href="#support">Support</a>
                </li>
                <li>
                  <a href="#security">Security</a>
                </li>
                <li>
                  <a href="#status">System Status</a>
                </li>
              </ul>
            </div>

            <div className="footer-column">
              <h4>Legal</h4>
              <ul className="footer-links">
                <li>
                  <a href="#privacy">Privacy Policy</a>
                </li>
                <li>
                  <a href="#terms">Terms of Service</a>
                </li>
                <li>
                  <a href="#gdpr">GDPR</a>
                </li>
                <li>
                  <a href="#cookies">Cookie Policy</a>
                </li>
                <li>
                  <a href="#compliance">Compliance</a>
                </li>
              </ul>
            </div>
          </div>

          <div className="footer-bottom">
            <p>© {new Date().getFullYear()} DeepMind AI. All rights reserved.</p>
            <div className="footer-social">
              <a href="#twitter" aria-label="Twitter">
                <Twitter size={20} />
              </a>
              <a href="#linkedin" aria-label="LinkedIn">
                <Linkedin size={20} />
              </a>
              <a href="#github" aria-label="GitHub">
                <Github size={20} />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;