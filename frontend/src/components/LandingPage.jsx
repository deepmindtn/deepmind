import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
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
import CalendlyModal from "../components/calendly/Calendlymodal";
import "./LandingPage.css";

const LandingPage = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [isCalendlyOpen, setIsCalendlyOpen] = useState(false);

  // Replace this with your actual Calendly URL
  // Example: "https://calendly.com/your-username/30min"
  const CALENDLY_URL = import.meta.env.VITE_CALENDLY_URL;

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("reveal-active");
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -100px 0px" }
    );

    document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));

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

  const openCalendly = () => {
    setIsCalendlyOpen(true);
  };

  const closeCalendly = () => {
    setIsCalendlyOpen(false);
  };

  /* ------------------ DATA ------------------ */

  const features = [
    {
      icon: Shield,
      title: t("features.burnout.title"),
      desc: t("features.burnout.desc"),
    },
    {
      icon: Users,
      title: t("features.empathy.title"),
      desc: t("features.empathy.desc"),
    },
    {
      icon: Brain,
      title: t("features.science.title"),
      desc: t("features.science.desc"),
    },
    {
      icon: Sparkles,
      title: t("features.roi.title"),
      desc: t("features.roi.desc"),
    },
    {
      icon: Layers,
      title: t("features.managers.title"),
      desc: t("features.managers.desc"),
    },
    {
      icon: Heart,
      title: t("features.culture.title"),
      desc: t("features.culture.desc"),
    },
  ];

  const stats = [
    {
      icon: Activity,
      value: "62%",
      label: t("stats.items.unwell"),
      headline: t("stats.headlines.struggling"),
    },
    {
      icon: BarChart3,
      value: "8%",
      label: t("stats.items.payroll"),
      headline: t("stats.headlines.leaking"),
    },
    {
      icon: ShieldCheck,
      value: "1 / 2",
      label: t("stats.items.kpis"),
      headline: t("stats.headlines.blind"),
    },
  ];

  /* ------------------ JSX ------------------ */

  return (
    <div className="landing-wrapper">
      <div className="bg-grid" />
      <div className="orb orb-1" />
      <div className="orb orb-2" />

      {/* NAVBAR */}
      <nav className="navbar">
        <div className="container nav-container">
          <div
            className="logo"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            <div className="logo-icon">
              <img
                src="/icon_sidebar.png"
                alt="DeepMind logo"
                width={22}
                height={22}
                style={{ objectFit: "contain" }}
              ></img>
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

      {/* HERO */}
      <section className="hero">
        <div className="container">
          <div className="badge animate-fade-in-up">
            <Zap size={16} />
            <span>{t("hero.badge")}</span>
          </div>

          <h1 className="animate-fade-in-up">
            {t("hero.titleLine1")} <br />
            <span className="gradient-text">{t("hero.titleHighlight")}</span>
          </h1>

          <p className="hero-subtitle animate-fade-in-up">
            {t("hero.subtitle")}
          </p>

          <div className="hero-buttons animate-fade-in-up">
            <button
              className="btn btn-primary btn-large"
              onClick={openCalendly}
            >
              {t("hero.bookDemo")}
              <ArrowRight size={20} />
            </button>
            <button
              className="btn btn-secondary btn-large"
              onClick={() => navigate("/how-it-works")}
            >
              {t("hero.seeHow")}
            </button>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="section">
        <div className="container">
          <h2 className="reveal">
            {t("stats.title")}{" "}
            <span className="gradient-text">{t("stats.highlight")}</span>
          </h2>

          <div className="stats-grid">
            {stats.map((s, i) => {
              const Icon = s.icon;
              return (
                <div key={i} className="stat-item reveal">
                  <Icon className="stat-icon" />
                  <div className="stat-headline">{s.headline}</div>
                  <div className="stat-big">{s.value}</div>
                  <div className="stat-label">{s.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="section">
        <div className="container">
          <h2 className="reveal">
            {t("features.title")}{" "}
            <span className="gradient-text">{t("features.highlight")}</span>
          </h2>

          <div className="features-grid">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <div key={i} className="feature-card reveal">
                  <div className="feature-icon">
                    <Icon size={32} color="white" />
                  </div>
                  <h3>{f.title}</h3>
                  <p>{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section reveal">
        <div className="container">
          <div className="cta-box">
            <div className="cta-content">
              <div className="cta-badge">
                <Star size={16} />
                <span>{t("cta.badge")}</span>
              </div>

              <h2>{t("cta.title")}</h2>
              <p>{t("cta.subtitle")}</p>

              <div className="cta-buttons">
                <button
                  className="btn btn-primary btn-large"
                  onClick={() => navigate("/signup")}
                >
                  {t("cta.getStarted")}
                  <ArrowRight size={20} />
                </button>
                <button
                  className="btn btn-secondary btn-large"
                  onClick={openCalendly}
                >
                  <Calendar size={20} />
                  {t("hero.bookDemo")}
                </button>
              </div>

              <div className="trust-badges">
                <div className="trust-badge">
                  <CheckCircle2 size={16} />
                  <span>{t("trust.free")}</span>
                </div>
                <div className="trust-badge">
                  <CreditCard size={16} />
                  <span>{t("trust.noCard")}</span>
                </div>
                <div className="trust-badge">
                  <ShieldCheck size={16} />
                  <span>{t("trust.gdpr")}</span>
                </div>
              </div>
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

      {/* Calendly Modal */}
      <CalendlyModal
        isOpen={isCalendlyOpen}
        onClose={closeCalendly}
        calendlyUrl={CALENDLY_URL}
      />
    </div>
  );
};

export default LandingPage;
