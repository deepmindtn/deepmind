import React, { useState, useEffect } from "react";
import { Heart, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import "react-toastify/dist/ReactToastify.css";
import "./AuthPages.css";

// ✅ correct import path (relative to src/)
import { apiFetch } from "../utils/apiFetch";

function LoginPage() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  // Apply language from localStorage on mount
  useEffect(() => {
    const savedLang = localStorage.getItem("lang");
    if (savedLang) i18n.changeLanguage(savedLang);
  }, [i18n]);

  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });

  const API_BASE = "http://localhost:8080";

  const handleInputChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const isValidEmail = (email) =>
    /^[\w-.]+@([\w-]+\.)+[\w-]{2,}$/i.test(email);

  const handleLogin = async (e) => {
    e.preventDefault();
    const { email, password } = formData;

    if (!email || !password) {
      toast.error(t("login.emailPasswordRequired"), {
        position: "top-right",
        theme: "colored",
      });
      return;
    }

    if (!isValidEmail(email)) {
      toast.error(t("login.invalidEmail"), {
        position: "top-right",
        theme: "colored",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // 1️⃣ LOGIN
      const res = await fetch(`${API_BASE}/api/auth/login/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.detail || t("login.loginFailed"));
      }

      const tokens = await res.json(); // { access, refresh }

      // ✅ store ONLY real auth data
      localStorage.setItem("access", tokens.access);
      localStorage.setItem("refresh", tokens.refresh);

      // 2️⃣ FETCH USER PROFILE (protected)
      let role = "EMPLOYEE";

      try {
        const meRes = await apiFetch(`${API_BASE}/api/auth/me/`);
        if (meRes.ok) {
          const me = await meRes.json();
          localStorage.setItem("me", JSON.stringify(me));
          role = me.role || "EMPLOYEE";
        }
      } catch {
        // apiFetch already logs out if token is invalid
      }

      toast.success(t("login.success"), {
        position: "top-right",
        theme: "colored",
      });

      // 3️⃣ REDIRECT
      if (role === "HR") navigate("/dashboard");
      else navigate("/my-assessments");

    } catch (error) {
      toast.error(error.message || t("login.genericError"), {
        position: "top-right",
        theme: "colored",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-container">
      <ToastContainer />

      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">
            <Heart className="auth-heart-icon" />
          </div>
          <h2 className="auth-title">{t("login.title")}</h2>
          <p className="auth-subtitle">{t("login.subtitle")}</p>
        </div>

        <form className="auth-form" onSubmit={handleLogin}>
          {/* Email */}
          <div className="form-group">
            <label className="form-label">{t("login.email")}</label>
            <div className="input-container">
              <Mail className="input-icon" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="form-input"
                required
                id="email"
                autoComplete="email"
              />
              <label
                className={`floating-label${
                  formData.email ? " filled" : ""
                }`}
                htmlFor="email"
              >
                {t("login.email")}
              </label>
            </div>
          </div>

          {/* Password */}
          <div className="form-group">
            <label className="form-label">{t("login.password")}</label>
            <div className="input-container">
              <Lock className="input-icon" />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="form-input password-input"
                required
                id="password"
                autoComplete="current-password"
                minLength={8}
              />
              <label
                className={`floating-label${
                  formData.password ? " filled" : ""
                }`}
                htmlFor="password"
              >
                {t("login.password")}
              </label>
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="password-toggle"
                aria-label={
                  showPassword
                    ? t("login.hidePassword")
                    : t("login.showPassword")
                }
              >
                {showPassword ? (
                  <Eye className="eye-icon" />
                ) : (
                  <EyeOff className="eye-icon" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="auth-submit-btn"
            disabled={isSubmitting}
          >
            {isSubmitting ? t("login.signingIn") : t("login.signIn")}
          </button>
        </form>

        <div className="auth-footer">
          <p className="auth-switch-text">
            {t("login.noAccount")}{" "}
            <button
              onClick={() => navigate("/signup")}
              className="auth-switch-link"
              type="button"
            >
              {t("login.signUpHere")}
            </button>
          </p>
        </div>

        <button
          onClick={() => navigate("/")}
          className="back-home-btn"
          type="button"
        >
          ← {t("login.backHome")}
        </button>
      </div>
    </div>
  );
}

export default LoginPage;
