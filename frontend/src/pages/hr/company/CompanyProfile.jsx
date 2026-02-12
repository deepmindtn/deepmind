import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Building2,
  Mail,
  Phone,
  MapPin,
  Globe,
  Briefcase,
  Edit3,
  Save,
  X,
  ShieldCheck,
} from "lucide-react";
import "./CompanyProfile.css";

/* -----------------------
   Theme Constants
----------------------- */
const COLORS = {
  primary: "var(--primary)",
  primaryLight: "var(--primary-light)",
  bgMain: "var(--bg-main)",
  cardBg: "var(--card-bg)",
  textPrimary: "var(--text-primary)",
  textSecondary: "var(--text-secondary)",
  textMuted: "var(--text-muted)",
  borderColor: "var(--border-color)",
  red: "var(--red)",
  shadowHuge: "var(--shadow-huge)",
};


/* -----------------------
   Helper Component
----------------------- */
const InfoField = ({ label, value, icon: Icon, isEditing, onChange }) => (
  <div className="info-field-row">
    <div className="info-field-icon">
      <Icon size={18} />
    </div>
    <div className="info-field-content">
      <label className="info-field-label">
        {label}
      </label>
      {isEditing ? (
        <input
          className="profile-input"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <div className="info-field-value">
          {value || "Not set"}
        </div>
      )}
    </div>
  </div>
);

/* -----------------------
   Main Component
----------------------- */
const CompanyProfile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [company, setCompany] = useState(null);
  const [editData, setEditData] = useState({});
  const [logoPreview, setLogoPreview] = useState(null);
  const [toast, setToast] = useState(null);

  const API_BASE = import.meta.env.VITE_API_BASE_URL;
  const token = localStorage.getItem("access");

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        const { data } = await axios.get(`${API_BASE}/api/company/me/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCompany(data);
        setEditData(data);
      } catch (error) {
        console.error("Failed to fetch company:", error);
        setToast({
          message: "Failed to load company profile",
          type: "error",
        });
      }
    };
    fetchCompany();
  }, [token]);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const handleSave = async () => {
    try {
      const formData = new FormData();

      Object.entries(editData).forEach(([key, value]) => {
        if (key === "logo") return;
        if (key === "id" || key === "created_at") return;
        if (value !== null && value !== undefined && value !== "") {
          formData.append(key, value);
        }
      });

      if (editData.logo && editData.logo instanceof File) {
        formData.append("logo", editData.logo);
      }

      const { data } = await axios.patch(
        `${API_BASE}/api/company/me/`,
        formData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setCompany(data);
      setEditData(data);
      setIsEditing(false);
      setLogoPreview(null);
      setToast({
        message: "Company profile updated successfully!",
        type: "success",
      });
    } catch (error) {
      console.error("Save failed:", error.response?.data || error.message);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.detail ||
        "Failed to save changes. Please try again.";
      setToast({ message: errorMessage, type: "error" });
    }
  };

  if (!company) return <div className="loading-container">Loading...</div>;

  return (
    <div className="profile-container">
      <div className="main-card">
        {/* Hero */}
        <div className="hero-section">
          <div className="hero-content">
            <div className="company-logo-container">
              {logoPreview || company.logo ? (
                <img
                  src={logoPreview || company.logo}
                  alt="Company Logo"
                  className="company-logo-img"
                />
              ) : (
                <Building2 size={42} color="white" className="company-logo-placeholder" />
              )}

              {isEditing && (
                <label className="logo-edit-label">
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        setEditData((p) => ({ ...p, logo: file }));
                        setLogoPreview(URL.createObjectURL(file));
                      }
                    }}
                  />
                  <Edit3 size={14} color="black" />
                </label>
              )}
            </div>

            <div className="hero-info">
              {isEditing ? (
                <input
                  className="profile-input profile-input-large"
                  value={editData.name || ""}
                  onChange={(e) =>
                    setEditData((p) => ({ ...p, name: e.target.value }))
                  }
                />
              ) : (
                <h1 className="company-name-title">
                  {company.name}
                </h1>
              )}
            </div>

            <div className="hero-actions">
              {!isEditing ? (
                <button
                  className="btn-primary"
                  onClick={() => setIsEditing(true)}
                >
                  <Edit3 size={16} /> Edit
                </button>
              ) : (
                <>
                  <button
                    className="btn-cancel"
                    onClick={() => {
                      setIsEditing(false);
                      setEditData(company);
                      setLogoPreview(null);
                    }}
                  >
                    <X size={16} /> Cancel
                  </button>
                  <button className="btn-primary" onClick={handleSave}>
                    <Save size={16} /> Save
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="profile-grid">
          <div>
            <h3 className="section-title">
              <ShieldCheck size={20} /> Company Info
            </h3>
            <InfoField
              icon={Mail}
              label="Email"
              value={editData.email}
              isEditing={isEditing}
              onChange={(v) => setEditData((p) => ({ ...p, email: v }))}
            />
            <InfoField
              icon={Phone}
              label="Phone"
              value={editData.phone}
              isEditing={isEditing}
              onChange={(v) => setEditData((p) => ({ ...p, phone: v }))}
            />
            <InfoField
              icon={MapPin}
              label="Address"
              value={editData.address}
              isEditing={isEditing}
              onChange={(v) => setEditData((p) => ({ ...p, address: v }))}
            />
          </div>

          <div>
            <h3 className="section-title">
              <Briefcase size={20} /> Business
            </h3>
            <InfoField
              icon={Globe}
              label="Website"
              value={editData.website}
              isEditing={isEditing}
              onChange={(v) => setEditData((p) => ({ ...p, website: v }))}
            />
            <InfoField
              icon={Briefcase}
              label="Industry"
              value={editData.industry}
              isEditing={isEditing}
              onChange={(v) => setEditData((p) => ({ ...p, industry: v }))}
            />
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div
          className={`toast-notification ${
            toast.type === "error" ? "toast-notification-error" : "toast-notification-success"
          }`}
        >
          <div
            className={`toast-dot ${
              toast.type === "error" ? "toast-dot-error" : "toast-dot-success"
            }`}
          />
          <span className="toast-message">
            {toast.message}
          </span>
        </div>
      )}
    </div>
  );
};

export default CompanyProfile;