import React, { useState, useEffect } from "react";
import { Heart, Mail, Lock, User, Eye, EyeOff, Building2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./AuthPages.css";

function SignUpPage() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  useEffect(() => {
    const savedLang = localStorage.getItem("lang");
    if (savedLang) i18n.changeLanguage(savedLang);
  }, [i18n]);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const API_BASE = import.meta.env.VITE_API_BASE_URL;

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    companyName: "",
  });

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    if (formData.password !== formData.confirmPassword) {
      toast.error(t("signup.passwordMismatch"), { position: "top-right", theme: "colored" });
      return false;
    }
    if (formData.password.length < 8) {
      toast.error(t("signup.passwordTooShort"), { position: "top-right", theme: "colored" });
      return false;
    }
    return true;
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/signup/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          first_name: formData.firstName,
          last_name: formData.lastName,
          company_name: formData.companyName,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(
          err?.detail || Object.values(err || {}).flat().join(" ") || t("signup.signupFailed")
        );
      }

      const loginRes = await fetch(`${API_BASE}/api/auth/login/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email, password: formData.password }),
      });

      if (!loginRes.ok) {
        const err = await loginRes.json().catch(() => ({}));
        throw new Error(err?.detail || t("signup.loginFailed"));
      }

      const tokens = await loginRes.json();
      localStorage.setItem("access", tokens.access);
      localStorage.setItem("refresh", tokens.refresh);

      try {
        const meRes = await fetch(`${API_BASE}/api/auth/me/`, {
          headers: { Authorization: `Bearer ${tokens.access}` },
        });
        if (meRes.ok) {
          const me = await meRes.json();
          localStorage.setItem("me", JSON.stringify(me));
        }
      } catch (_) {}
      
      navigate("/dashboard");
    } catch (err) {
      setErrorMsg(err.message || t("signup.genericError"));
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
          <h2 className="auth-title">{t("signup.title")}</h2>
          <p className="auth-subtitle">{t("signup.subtitle")}</p>
        </div>

        <form className="auth-form" onSubmit={handleSignup}>
          {/* Name Row */}
          <div className="name-row">
            <div className="form-group half-width">
              <div className="input-container">
                <User className="input-icon" />
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                  id="firstName"
                  autoComplete="off"
                />
                <label
                  className={`floating-label${formData.firstName ? " filled" : ""}`}
                  htmlFor="firstName"
                >
                  {t("signup.firstName")}
                </label>
              </div>
            </div>

            <div className="form-group half-width">
              <div className="input-container">
                <User className="input-icon" />
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="form-input"
                  id="lastName"
                  autoComplete="off"
                  required
                />
                <label
                  className={`floating-label${formData.lastName ? " filled" : ""}`}
                  htmlFor="lastName"
                >
                  {t("signup.lastName")}
                </label>
              </div>
            </div>
          </div>

          {/* Email */}
          <div className="form-group">
            <div className="input-container">
              <Mail className="input-icon" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="form-input"
                id="email"
                required
              />
              <label
                className={`floating-label${formData.email ? " filled" : ""}`}
                htmlFor="email"
              >
                {t("signup.email")}
              </label>
            </div>
          </div>

          {/* Company Name */}
          <div className="form-group">
            <div className="input-container">
              <Building2 className="input-icon" />
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleInputChange}
                className="form-input"
                id="companyName"
                required
              />
              <label
                className={`floating-label${formData.companyName ? " filled" : ""}`}
                htmlFor="companyName"
              >
                {t("signup.companyName")}
              </label>
            </div>
          </div>

          {/* Password */}
          <div className="form-group password-group">
            <div className="input-container">
              <Lock className="input-icon" />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="form-input password-input"
                required
                minLength={8}
              />
              <label
                className={`floating-label${formData.password ? " filled" : ""}`}
                htmlFor="Password"
              >
                {t("signup.password")}
              </label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="password-toggle"
              >
                {showPassword ? <Eye className="eye-icon" /> : <EyeOff className="eye-icon" />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="form-group">
            <div className="input-container">
              <Lock className="input-icon" />
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="form-input password-input"
                required
              />
              <label
                className={`floating-label${formData.confirmPassword ? " filled" : ""}`}
                htmlFor="ConfirmPassword"
              >
                {t("signup.confirmPassword")}
              </label>
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="password-toggle"
              >
                {showConfirmPassword ? <Eye className="eye-icon" /> : <EyeOff className="eye-icon" />}
              </button>
            </div>
          </div>

          {errorMsg && <p className="auth-error">{errorMsg}</p>}

          <button type="submit" className="auth-submit-btn" disabled={isSubmitting}>
            {isSubmitting ? t("signup.creating") : t("signup.createAccount")}
          </button>
        </form>

        <div className="auth-footer">
          <p className="auth-switch-text">
            {t("signup.alreadyHaveAccount")}{" "}
            <button
              onClick={() => navigate("/login")}
              className="auth-switch-link"
              type="button"
            >
              {t("signup.signInHere")}
            </button>
          </p>
        </div>

        <button
          onClick={() => navigate("/")}
          className="back-home-btn"
          type="button"
        >
          ← {t("signup.backHome")}
        </button>
      </div>
    </div>
  );
}

export default SignUpPage;