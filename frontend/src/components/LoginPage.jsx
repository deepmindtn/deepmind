import React, { useState } from "react";
import { Heart, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./AuthPages.css";

function LoginPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });

  // Use env var if provided, else default to localhost:8000
  const API_BASE = "http://localhost:8080";

  const handleInputChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Email format validation
  const isValidEmail = (email) => {
    const regex = /^[\w-.]+@([\w-]+\.)+[\w-]{2,}$/i;
    return regex.test(email);
  };

const handleLogin = async (e) => {
  e.preventDefault();
  const { email, password } = formData;

  if (!email || !password) {
    toast.error("Email and password are required.", {
      position: "top-right",
      theme: "colored",
    });
    return;
  }

  setIsSubmitting(true);
  try {
    // 1) Login
    const res = await fetch(`${API_BASE}/api/auth/login/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.detail || "Login failed");
    }

    const tokens = await res.json(); // { access, refresh }
    localStorage.setItem("access", tokens.access);
    localStorage.setItem("refresh", tokens.refresh);
    localStorage.setItem("authenticated", "true");

    // 2) Fetch user profile
    let role = "EMPLOYEE"; // fallback
    try {
      const meRes = await fetch(`${API_BASE}/api/auth/me/`, {
        headers: { Authorization: `Bearer ${tokens.access}` },
      });
      if (meRes.ok) {
        const me = await meRes.json();
        localStorage.setItem("me", JSON.stringify(me));
        role = me.role || "EMPLOYEE"; // ⚡ pick role from backend
      }
    } catch {
      // ignore
    }

    toast.success("Signed in successfully!", { position: "top-right", theme: "colored" });

    // 3) Redirect based on role
    if (role === "HR") {
      navigate("/dashboard");
    } else {
      navigate("/my-assessments");
    }
  } catch (error) {
    toast.error(error.message || "Something went wrong.", {
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
          <h2 className="auth-title">Welcome Back</h2>
          <p className="auth-subtitle">Sign in to continue your wellness journey</p>
        </div>

        {/* ✅ Form that submits on Enter key */}
        <form className="auth-form" onSubmit={handleLogin}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
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
              <label className={`floating-label${formData.email ? " filled" : ""}`} htmlFor="email">
                Email Address
              </label>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
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
                className={`floating-label${formData.password ? " filled" : ""}`}
                htmlFor="password"
              >
                Password
              </label>
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="password-toggle"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <Eye className="eye-icon" /> : <EyeOff className="eye-icon" />}
              </button>
            </div>
          </div>

          <button type="submit" className="auth-submit-btn" disabled={isSubmitting}>
            {isSubmitting ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="auth-footer">
          <p className="auth-switch-text">
            Don't have an account?{" "}
            <button onClick={() => navigate("/signup")} className="auth-switch-link" type="button">
              Sign up here
            </button>
          </p>
        </div>

        <button onClick={() => navigate("/")} className="back-home-btn" type="button">
          ← Back to Home
        </button>
      </div>
    </div>
  );
}

export default LoginPage;
