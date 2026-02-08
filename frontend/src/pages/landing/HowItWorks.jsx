import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Database,
  Shield,
  Brain,
  Lightbulb,
  ArrowRight,
  GitBranch,
  Lock,
  Zap,
  CheckCircle2,
  Server,
  Eye,
  Twitter,
  Linkedin,
  Github,
  Star
} from "lucide-react";
import "./HowItWorks.css";

const HowItWorks = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  useEffect(() => {
    // Scroll Animation Logic
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("reveal-active");
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    );

    document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));

    // Navbar scroll effect (matching landing page)
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrolled = window.scrollY;
          const grid = document.querySelector(".bg-grid");
          const navbar = document.querySelector(".navbar");

          if (grid) grid.style.transform = `translateY(${scrolled * 0.3}px)`;
          if (navbar) navbar.classList.toggle("navbar-visible", scrolled > 100);

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

  const steps = [
    {
      id: "01",
      title: t("howItWorks.steps.integration.title"),
      subtitle: t("howItWorks.steps.integration.subtitle"),
      description: t("howItWorks.steps.integration.description"),
      icon: Database,
      details: [
        t("howItWorks.steps.integration.details.readonly"),
        t("howItWorks.steps.integration.details.zeroConfig"),
        t("howItWorks.steps.integration.details.sso")
      ]
    },
    {
      id: "02",
      title: t("howItWorks.steps.privacy.title"),
      subtitle: t("howItWorks.steps.privacy.subtitle"),
      description: t("howItWorks.steps.privacy.description"),
      icon: Shield,
      details: [
        t("howItWorks.steps.privacy.details.redaction"),
        t("howItWorks.steps.privacy.details.encryption"),
        t("howItWorks.steps.privacy.details.local")
      ]
    },
    {
      id: "03",
      title: t("howItWorks.steps.analysis.title"),
      subtitle: t("howItWorks.steps.analysis.subtitle"),
      description: t("howItWorks.steps.analysis.description"),
      icon: Brain,
      details: [
        t("howItWorks.steps.analysis.details.sentiment"),
        t("howItWorks.steps.analysis.details.network"),
        t("howItWorks.steps.analysis.details.anomaly")
      ]
    },
    {
      id: "04",
      title: t("howItWorks.steps.intelligence.title"),
      subtitle: t("howItWorks.steps.intelligence.subtitle"),
      description: t("howItWorks.steps.intelligence.description"),
      icon: Lightbulb,
      details: [
        t("howItWorks.steps.intelligence.details.burnout"),
        t("howItWorks.steps.intelligence.details.pulse"),
        t("howItWorks.steps.intelligence.details.retention")
      ]
    }
  ];

  return (
    <div className="hiw-wrapper">
      <div className="bg-grid" />
      <div className="orb orb-1" />
      <div className="orb orb-2" />

      {/* NAVBAR - Matching Landing Page */}
      <nav className="navbar">
        <div className="container nav-container">
          <div className="logo" onClick={() => navigate("/")}>
            <div className="logo-icon">
              <img 
                src="/icon_sidebar.png" 
                alt="DeepMind logo" 
                width={22} 
                height={22}
                style={{ objectFit: "contain" }}
              />
            </div>
            <span className="logo-text">DeepMind</span>
          </div>
          
          <div className="nav-buttons">
            <div className="lang-switch">
              <button
                className="lang-btn"
                onClick={() => {
                  i18n.changeLanguage("en");
                  localStorage.setItem("lang", "en");
                }}
                title="English"
              >
                <span role="img" aria-label="English">
                  🇬🇧
                </span>
              </button>
              <button
                className="lang-btn"
                onClick={() => {
                  i18n.changeLanguage("fr");
                  localStorage.setItem("lang", "fr");
                }}
                title="Français"
              >
                <span role="img" aria-label="French">
                  🇫🇷
                </span>
              </button>
            </div>
            
            <button 
              className="btn btn-ghost" 
              onClick={() => navigate("/login")}
            >
              {t("nav.signIn")}
            </button>
            <button 
              className="btn btn-primary" 
              onClick={() => navigate("/signup")}
            >
              {t("nav.tryFree")}
            </button>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="hiw-hero">
        <div className="container">
          <div className="badge animate-fade-in-up">
            <GitBranch size={16} />
            <span>{t("howItWorks.hero.badge")}</span>
          </div>
          <h1 className="animate-fade-in-up">
            {t("howItWorks.hero.title1")} <span className="gradient-text">{t("howItWorks.hero.titleHighlight")}</span>
          </h1>
          <p className="hero-subtitle animate-fade-in-up">
            {t("howItWorks.hero.subtitle")}
          </p>
        </div>
      </section>

      {/* TIMELINE SECTION */}
      <section className="timeline-section">
        <div className="container">
          <div className="timeline-wrapper">
            {/* Central Line */}
            <div className="timeline-line"></div>

            {steps.map((step, index) => {
              const Icon = step.icon;
              const isEven = index % 2 === 0;
              return (
                <div key={index} className={`timeline-row ${isEven ? 'left' : 'right'} reveal`}>
                  
                  {/* The Dot on the line */}
                  <div className="timeline-dot">
                    <div className="dot-core"></div>
                    <div className="dot-ping"></div>
                  </div>

                  {/* Content Card */}
                  <div className="timeline-content">
                    <div className="step-number">{step.id}</div>
                    <div className="timeline-card">
                      <div className="card-header">
                        <div className="icon-box">
                          <Icon size={24} color="white" />
                        </div>
                        <div className="header-text">
                          <h3>{step.title}</h3>
                          <span className="subtitle">{step.subtitle}</span>
                        </div>
                      </div>
                      <p>{step.description}</p>
                      <div className="card-footer">
                        {step.details.map((detail, i) => (
                          <div key={i} className="detail-tag">
                            <CheckCircle2 size={14} />
                            <span>{detail}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  {/* Empty Spacer for the other side */}
                  <div className="timeline-spacer"></div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* TECH SPECS GRID */}
      <section className="tech-section">
        <div className="container">
          <h2 className="reveal">
            {t("howItWorks.tech.title")} <span className="gradient-text">{t("howItWorks.tech.highlight")}</span>
          </h2>
          <div className="tech-grid">
            <div className="tech-card reveal">
              <Lock className="tech-icon" />
              <h3>{t("howItWorks.tech.cards.zeroRetention.title")}</h3>
              <p>{t("howItWorks.tech.cards.zeroRetention.description")}</p>
            </div>
            <div className="tech-card reveal">
              <Server className="tech-icon" />
              <h3>{t("howItWorks.tech.cards.siloedData.title")}</h3>
              <p>{t("howItWorks.tech.cards.siloedData.description")}</p>
            </div>
            <div className="tech-card reveal">
              <Eye className="tech-icon" />
              <h3>{t("howItWorks.tech.cards.blindSpots.title")}</h3>
              <p>{t("howItWorks.tech.cards.blindSpots.description")}</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA FOOTER */}
      <section className="cta-section reveal">
        <div className="container">
          <div className="cta-box">
            <div className="cta-content">
              <div className="cta-badge">
                <Star size={16} />
                <span>{t("howItWorks.cta.badge")}</span>
              </div>
              <h2>{t("howItWorks.cta.title")}</h2>
              <p>{t("howItWorks.cta.subtitle")}</p>
              <button 
                className="btn btn-primary btn-large" 
                onClick={() => navigate("/signup")}
              >
                {t("howItWorks.cta.button")} <ArrowRight size={20} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="container">
          <div className="footer-bottom">
            <p>© {new Date().getFullYear()} DeepMind AI</p>
            <div className="footer-social">
              <Twitter size={20} />
              <Linkedin size={20} />
              <Github size={20} />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HowItWorks;