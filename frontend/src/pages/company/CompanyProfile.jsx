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

const styles = {
  container: {
    padding: "5px 14px",
    backgroundColor: COLORS.bgMain,
    minHeight: "100vh",
    fontFamily: "'Inter', system-ui, sans-serif",
  },
  mainWrapperCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: "24px",
    border: `1px solid ${COLORS.borderColor}`,
    boxShadow: COLORS.shadowHuge,
    margin: "0 auto",
    overflow: "hidden",
    minHeight: "calc(100vh - 40px)",
  },
  gradientHero: {
    background: `linear-gradient(135deg, ${COLORS.primaryLight} 0%, ${COLORS.cardBg} 100%)`,
    padding: "40px",
    borderBottom: `1px solid ${COLORS.borderColor}`,
  },
  sectionTitle: {
    fontSize: "18px",
    fontWeight: "700",
    color: COLORS.textPrimary,
    marginBottom: "20px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  input: {
    width: "100%",
    padding: "10px 14px",
    borderRadius: "8px",
    border: `1px solid ${COLORS.borderColor}`,
    backgroundColor: COLORS.bgMain,
    color: COLORS.textPrimary,
    fontSize: "14px",
    outline: "none",
  },
};

const responsiveStyles = `
  .profile-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 40px;
    padding: 40px;
  }

  @media (max-width: 900px) {
    .profile-grid {
      grid-template-columns: 1fr;
      padding: 24px;
    }
  }

  .btn-primary {
    background: ${COLORS.primary};
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 12px;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .btn-cancel {
    background: white;
    color: ${COLORS.red};
    border: 1px solid ${COLORS.borderColor};
    padding: 10px 20px;
    border-radius: 12px;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
  }
`;

/* -----------------------
   Helper Component
----------------------- */
const InfoField = ({ label, value, icon: Icon, isEditing, onChange }) => (
  <div style={{ display: "flex", marginBottom: "24px" }}>
    <div
      style={{
        width: 36,
        height: 36,
        borderRadius: 10,
        background: COLORS.bgMain,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        border: `1px solid ${COLORS.borderColor}`,
        marginRight: 12,
        color: COLORS.primary,
      }}
    >
      <Icon size={18} />
    </div>
    <div style={{ flex: 1 }}>
      <label
        style={{
          display: "block",
          fontSize: 12,
          fontWeight: 700,
          color: COLORS.textMuted,
          marginBottom: 6,
          textTransform: "uppercase",
        }}
      >
        {label}
      </label>
      {isEditing ? (
        <input
          style={styles.input}
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <div style={{ fontSize: 15 }}>{value || "Not set"}</div>
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

      // Append all fields except logo and read-only fields
      Object.entries(editData).forEach(([key, value]) => {
        // Skip logo field - we'll handle it separately
        if (key === "logo") return;

        // Skip id and created_at (read-only fields)
        if (key === "id" || key === "created_at") return;

        // Only append non-empty values
        if (value !== null && value !== undefined && value !== "") {
          formData.append(key, value);
        }
      });

      // Only append logo if it's a new File object (not the existing URL string)
      if (editData.logo && editData.logo instanceof File) {
        formData.append("logo", editData.logo);
      }

      const { data } = await axios.patch(
        `${API_BASE}/api/company/me/`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            // Don't set Content-Type - let axios handle it for FormData
          },
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
      setToast({
        message: errorMessage,
        type: "error",
      });
    }
  };

  if (!company) return <div style={{ padding: 40 }}>Loading...</div>;

  return (
    <div style={styles.container}>
      <style>{responsiveStyles}</style>

      <div style={styles.mainWrapperCard}>
        {/* Hero */}
        <div style={styles.gradientHero}>
          <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
            <div
              style={{
                width: 90,
                height: 90,
                borderRadius: 24,
                background: COLORS.primary,
                position: "relative",
                overflow: "hidden",
              }}
            >
              {logoPreview || company.logo ? (
                <img
                  src={logoPreview || company.logo}
                  alt="Company Logo"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                <Building2 size={42} color="white" style={{ margin: "24px" }} />
              )}

              {isEditing && (
                <label
                  style={{
                    position: "absolute",
                    bottom: -6,
                    right: -6,
                    background: "white",
                    padding: 8,
                    borderRadius: "50%",
                    cursor: "pointer",
                  }}
                >
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
                  <Edit3 size={14} />
                </label>
              )}
            </div>

            <div style={{ flex: 1 }}>
              {isEditing ? (
                <input
                  style={{ ...styles.input, fontSize: 22, fontWeight: 700 }}
                  value={editData.name || ""}
                  onChange={(e) =>
                    setEditData((p) => ({ ...p, name: e.target.value }))
                  }
                />
              ) : (
                <h1 style={{ margin: 0 }}>{company.name}</h1>
              )}
            </div>

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
                    setEditData(company); // Reset to original data
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

        {/* Content */}
        <div className="profile-grid">
          <div>
            <h3 style={styles.sectionTitle}>
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
            <h3 style={styles.sectionTitle}>
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
          style={{
            position: "fixed",
            bottom: "24px",
            right: "24px",
            backgroundColor: COLORS.cardBg,
            padding: "16px 20px",
            borderRadius: "12px",
            boxShadow: COLORS.shadowHuge,
            border: `2px solid ${
              toast.type === "error" ? COLORS.red : COLORS.primary
            }`,
            zIndex: 10001,
            display: "flex",
            alignItems: "center",
            gap: "12px",
            minWidth: "300px",
            maxWidth: "500px",
          }}
        >
          <div
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              backgroundColor:
                toast.type === "error" ? COLORS.red : COLORS.primary,
              flexShrink: 0,
            }}
          />
          <span
            style={{
              color: COLORS.textPrimary,
              fontSize: "14px",
              fontWeight: "500",
            }}
          >
            {toast.message}
          </span>
        </div>
      )}
    </div>
  );
};

export default CompanyProfile;
