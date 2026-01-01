// src/pages/AcceptInvite.jsx
import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

export default function AcceptInvite() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const token = params.get("token") || "";
  const [form, setForm] = useState({ password: "", confirm: "", first_name: "", last_name: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const API_BASE ="http://localhost:8080";

  useEffect(() => {
    if (!token) setError("Missing invite token.");
  }, [token]);

  async function acceptInvite(e) {
    e.preventDefault();
    setError("");

    if (!token) return setError("Missing invite token.");
    if (!form.password || !form.confirm) return setError("Enter and confirm your password.");
    if (form.password !== form.confirm) return setError("Passwords do not match.");
    if (form.password.length < 8) return setError("Password must be at least 8 characters.");

    setSubmitting(true);
    try {
      // 1) Accept the invite -> create EMPLOYEE user
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
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.detail || "Invalid or already used invite token.");
      }

      // 2) Auto-login with the new account (email is the invite’s email; backend doesn’t return it,
      // so prompt user to log in OR fetch email by asking them. Easiest: redirect to login page.)
      // If you want full auto-login, change backend to return the created user's email here.
      alert("Account created! Please sign in.");
      navigate("/login");
    } catch (e) {
      setError(e.message || "Failed to accept invite.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={{ maxWidth: 520, margin: "40px auto", padding: 16 }}>
      <h1 style={{ marginBottom: 8 }}>Accept Invite</h1>
      <p style={{ color: "#64748b", marginTop: 0 }}>Set your password to activate your account.</p>

      <form onSubmit={acceptInvite} style={{ display: "grid", gap: 12 }}>
        <label>
          <div style={{ fontSize: 12, color: "#64748b", marginBottom: 6 }}>First name (optional)</div>
          <input
            value={form.first_name}
            onChange={(e) => setForm((f) => ({ ...f, first_name: e.target.value }))}
            style={{ height: 40, width: "100%", borderRadius: 8, border: "1px solid #e5e7eb", padding: "0 12px" }}
          />
        </label>

        <label>
          <div style={{ fontSize: 12, color: "#64748b", marginBottom: 6 }}>Last name (optional)</div>
          <input
            value={form.last_name}
            onChange={(e) => setForm((f) => ({ ...f, last_name: e.target.value }))}
            style={{ height: 40, width: "100%", borderRadius: 8, border: "1px solid #e5e7eb", padding: "0 12px" }}
          />
        </label>

        <label>
          <div style={{ fontSize: 12, color: "#64748b", marginBottom: 6 }}>Password</div>
          <input
            type="password"
            value={form.password}
            onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
            required
            minLength={8}
            style={{ height: 40, width: "100%", borderRadius: 8, border: "1px solid #e5e7eb", padding: "0 12px" }}
          />
        </label>

        <label>
          <div style={{ fontSize: 12, color: "#64748b", marginBottom: 6 }}>Confirm Password</div>
          <input
            type="password"
            value={form.confirm}
            onChange={(e) => setForm((f) => ({ ...f, confirm: e.target.value }))}
            required
            style={{ height: 40, width: "100%", borderRadius: 8, border: "1px solid #e5e7eb", padding: "0 12px" }}
          />
        </label>

        {error && (
          <div style={{ color: "#b91c1c", background: "#fef2f2", border: "1px solid #fecaca", padding: 10, borderRadius: 8 }}>
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          style={{
            height: 42,
            borderRadius: 10,
            border: "1px solid #4f46e5",
            background: "#4f46e5",
            color: "#fff",
            cursor: "pointer",
          }}
        >
          {submitting ? "Activating…" : "Activate Account"}
        </button>
      </form>
    </div>
  );
}
