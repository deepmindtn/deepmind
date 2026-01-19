import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { ShieldCheck, AlertCircle } from "lucide-react";

// -----------------------
// Theme Constants (Emerald System)
// -----------------------
const COLORS = {
  primary: "var(--primary)",
  primaryLight: "var(--primary-light)",
  primaryDark: "var(--primary-dark)",
  bgMain: "var(--bg-main)",
  cardBg: "var(--card-bg)",
  textPrimary: "var(--text-primary)",
  textSecondary: "var(--text-secondary)",
  textMuted: "var(--text-muted)",
  borderColor: "var(--border-color)",
  red: "var(--red)",
  shadowHuge: "var(--shadow-huge)",
};

const styles = {
  container: {
    minHeight: "100vh",
    backgroundColor: COLORS.bgMain,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
    fontFamily: "'Inter', sans-serif",
  },
  card: {
    width: "100%",
    maxWidth: "480px",
    backgroundColor: COLORS.cardBg,
    borderRadius: "24px",
    padding: "40px",
    boxShadow: COLORS.shadowHuge,
    border: `1px solid ${COLORS.borderColor}`,
    transition: "all 0.3s ease",
  },
  input: {
    width: "100%",
    height: "48px",
    padding: "0 16px",
    borderRadius: "12px",
    border: `1px solid ${COLORS.borderColor}`,
    backgroundColor: "transparent",
    color: COLORS.textPrimary,
    fontSize: "14px",
    outline: "none",
    transition: "border-color 0.2s",
    boxSizing: "border-box",
  },
  label: {
    display: "block",
    fontSize: "13px",
    fontWeight: "600",
    color: COLORS.textSecondary,
    marginBottom: "8px",
  },
  button: {
    width: "100%",
    height: "50px",
    backgroundColor: COLORS.primary,
    color: "white",
    border: "none",
    borderRadius: "14px",
    fontSize: "16px",
    fontWeight: "700",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    marginTop: "10px",
    transition: "transform 0.2s, background-color 0.2s",
  },
};

// -----------------------
// Helper: UUID Validation
// -----------------------
function isValidUUID(uuid) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(uuid);
}

export default function AcceptInvite() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [token, setToken] = useState("");
  const [form, setForm] = useState({ password: "", confirm: "", first_name: "", last_name: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const API_BASE = "http://localhost:8080";

  // -----------------------
  // Extract token once and trim it
  // -----------------------
  useEffect(() => {
    const t = params.get("token") || params.get("id");
    if (t) setToken(t.trim());
    else setError("Missing invite token. Please check your email link.");
  }, [params]);

  // -----------------------
  // Submit Invite
  // -----------------------
  async function acceptInvite(e) {
    e.preventDefault();
    setError("");

    if (!token || !isValidUUID(token)) {
      return setError("Invalid or missing invite token. Please check your email link.");
    }

    if (form.password !== form.confirm) return setError("Passwords do not match.");
    if (form.password.length < 8) return setError("Password must be at least 8 characters.");

    setSubmitting(true);
    try {
      console.log("Posting token:", token); // Debugging line
      const res = await fetch(`${API_BASE}/api/invites/accept/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          password: form.password,
          first_name: form.first_name || undefined,
          last_name: form.last_name || undefined,
        }),
      });

      if (!res.ok) {
        const err = await res.text();
        console.error("Invite accept error:", err);
        throw new Error(err);
      }

      navigate("/login?msg=activated");
    } catch (e) {
      setError(e.message || "Failed to accept invite.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {/* Logo Section */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div
            style={{
              width: "56px",
              height: "56px",
              background: `linear-gradient(135deg, ${COLORS.primary}, #14b8a6)`,
              borderRadius: "16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
              boxShadow: "0 10px 20px -5px rgba(16, 185, 129, 0.3)",
            }}
          >
            <img
              src="/icon_sidebar.png"
              alt="DeepMind logo"
              width={28}
              height={28}
              style={{ objectFit: "contain" }}
            />
          </div>
          <h1
            style={{
              fontSize: "28px",
              fontWeight: "800",
              color: COLORS.textPrimary,
              margin: "0 0 8px 0",
            }}
          >
            Join DeepMind
          </h1>
          <p style={{ color: COLORS.textSecondary, margin: 0, fontSize: "15px" }}>
            Create your account to start your journey.
          </p>
        </div>

        <form onSubmit={acceptInvite} style={{ display: "grid", gap: "20px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div>
              <label style={styles.label}>First Name</label>
              <input
                placeholder="John"
                value={form.first_name}
                onChange={(e) => setForm((f) => ({ ...f, first_name: e.target.value }))}
                style={styles.input}
              />
            </div>
            <div>
              <label style={styles.label}>Last Name</label>
              <input
                placeholder="Doe"
                value={form.last_name}
                onChange={(e) => setForm((f) => ({ ...f, last_name: e.target.value }))}
                style={styles.input}
              />
            </div>
          </div>

          <div>
            <label style={styles.label}>Choose Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              required
              style={styles.input}
            />
          </div>

          <div>
            <label style={styles.label}>Confirm Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={form.confirm}
              onChange={(e) => setForm((f) => ({ ...f, confirm: e.target.value }))}
              required
              style={styles.input}
            />
          </div>

          {error && (
            <div
              style={{
                color: COLORS.red,
                background: "rgba(239, 68, 68, 0.1)",
                border: `1px solid ${COLORS.red}`,
                padding: "12px",
                borderRadius: "12px",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                fontSize: "14px",
              }}
            >
              <AlertCircle size={18} /> {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            style={{
              ...styles.button,
              opacity: submitting ? 0.7 : 1,
              transform: submitting ? "scale(0.98)" : "scale(1)",
            }}
          >
            {submitting ? "Activating..." : <><ShieldCheck size={20} /> Activate Account</>}
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: "24px", fontSize: "14px", color: COLORS.textPrimary }}>
          Already have an account?{" "}
          <span
            onClick={() => navigate("/login")}
            style={{ color: COLORS.primary, fontWeight: "700", cursor: "pointer" }}
          >
            Sign in here
          </span>
        </p>
      </div>
    </div>
  );
}
