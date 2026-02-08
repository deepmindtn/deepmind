import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  User, Mail, Phone, MapPin, Calendar, Edit3, Save, X, 
  Globe, Heart, Briefcase, Camera, ShieldCheck
} from "lucide-react";

// -----------------------
// Theme Constants
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
    overflow: "hidden", // Ensures the gradient doesn't bleed out
    minHeight: "calc(100vh - 40px)",
    display: "flex",
    flexDirection: "column",
  },
  gradientHero: {
    background: `linear-gradient(135deg, ${COLORS.primaryLight} 0%, ${COLORS.cardBg} 100%)`,
    padding: "40px",
    borderBottom: `1px solid ${COLORS.borderColor}`,
    position: "relative",
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
    transition: "border 0.2s",
  },
  select: {
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
  
  .hero-flex {
    display: flex;
    align-items: center;
    gap: 32px;
  }

  .hero-actions {
    margin-left: auto;
    display: flex;
    gap: 10px;
  }

  /* Mobile & Tablet Adaptation */
  @media (max-width: 900px) {
    .profile-grid {
      grid-template-columns: 1fr;
      gap: 32px;
      padding: 24px;
    }
  }

  @media (max-width: 640px) {
    .main-wrapper-card {
      border-radius: 16px !important;
    }
    .gradient-hero {
      padding: 24px !important;
      text-align: center;
    }
    .hero-flex {
      flex-direction: column;
      gap: 20px;
    }
    .hero-actions {
      margin-left: 0;
      width: 100%;
      justify-content: center;
      margin-top: 10px;
    }
    .btn-action {
      flex: 1;
      justify-content: center;
    }
    .profile-input-hero {
      text-align: center;
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
    transition: all 0.2s;
  }
  .btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2);
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
    transition: all 0.2s;
  }
  .btn-cancel:hover {
    background: #fef2f2;
    border-color: ${COLORS.red};
  }

  .field-group {
    margin-bottom: 20px;
  }
  .field-label {
    display: block;
    font-size: 12px;
    font-weight: 700;
    text-transform: uppercase;
    color: ${COLORS.textMuted};
    margin-bottom: 6px;
  }
  .field-value {
    font-size: 15px;
    color: ${COLORS.textPrimary};
    font-weight: 500;
  }
  .field-icon-box {
    width: 36px;
    height: 36px;
    border-radius: 10px;
    background: ${COLORS.bgMain};
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${COLORS.primary};
    border: 1px solid ${COLORS.borderColor};
    margin-right: 12px;
  }
`;

// -----------------------
// Helper Components
// -----------------------
const InfoField = ({ label, value, icon: Icon, isEditing, onChange, type = "text", options }) => (
  <div style={{ display: "flex", alignItems: "flex-start", marginBottom: "24px" }}>
    <div className="field-icon-box">
      <Icon size={18} />
    </div>
    <div style={{ flex: 1 }}>
      <label className="field-label">{label}</label>
      {isEditing ? (
        options ? (
          <select
            style={styles.select}
            value={value}
            onChange={(e) => onChange(e.target.value)}
          >
            {options.map(opt => <option key={opt.val} value={opt.val}>{opt.label}</option>)}
          </select>
        ) : (
          <input
            type={type}
            style={styles.input}
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
          />
        )
      ) : (
        <div className="field-value">{value || "Not set"}</div>
      )}
    </div>
  </div>
);

// -----------------------
// Main Component
// -----------------------
const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [editData, setEditData] = useState({});
  const API_BASE = import.meta.env.VITE_API_BASE_URL;
  const token = localStorage.getItem("access");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await axios.get(`${API_BASE}/api/auth/me/`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const formatted = {
          first_name: data.first_name || "",
          last_name: data.last_name || "",
          email: data.email,
          phone: data.phone || "",
          location: data.location || "",
          role: data.role,
          department: data.department || "General",
          bio: data.bio || "",
          gender: data.gender || "",
          nationality: data.nationality || "",
          marital_status: data.marital_status || "",
          joinDate: new Date(data.join_date).toLocaleDateString("en-US", { month: "long", year: "numeric" }),
        };
        setProfileData(formatted);
        setEditData(formatted);
      } catch (error) {
        console.error("Error fetching profile", error);
      }
    };
    fetchProfile();
  }, [token]);

  const handleSave = async () => {
    try {
      // API call logic here...
      const { data } = await axios.patch(`${API_BASE}/api/auth/me/`, editData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProfileData(editData); // In real app, use response data
      setIsEditing(false);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCancel = () => {
    setEditData({ ...profileData });
    setIsEditing(false);
  };

  const handleChange = (field, val) => {
    setEditData(prev => ({ ...prev, [field]: val }));
  };

  if (!profileData) return <div style={{ padding: 40, color: COLORS.primary }}>Loading...</div>;

  return (
    <div style={styles.container}>
      <style>{responsiveStyles}</style>

      {/* Main Wrapper Card */}
      <div className="main-wrapper-card" style={styles.mainWrapperCard}>
        
        {/* 1. Gradient Hero Section */}
        <div className="gradient-hero" style={styles.gradientHero}>
          <div className="hero-flex">
            {/* Avatar */}
            <div style={{ position: "relative" }}>
              <div style={{
                width: "100px", height: "100px", borderRadius: "30px", 
                backgroundColor: COLORS.primary, display: "flex", alignItems: "center", 
                justifyContent: "center", boxShadow: "0 10px 20px -5px rgba(0,0,0,0.1)",
                border: "4px solid white"
              }}>
                <User size={48} color="white" />
              </div>
              {isEditing && (
                <div style={{
                  position: "absolute", bottom: -5, right: -5, background: "white",
                  padding: 6, borderRadius: "50%", border: `1px solid ${COLORS.borderColor}`,
                  cursor: "pointer"
                }}>
                  <Camera size={16} color={COLORS.primary} />
                </div>
              )}
            </div>

            {/* Name & Role */}
            <div style={{ flex: 1 }}>
              {isEditing ? (
                <div style={{ display: 'flex', gap: 10, marginBottom: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
                  <input 
                    style={{ ...styles.input, fontSize: '20px', fontWeight: 'bold', width: 'auto' }} 
                    value={editData.first_name} 
                    onChange={e => handleChange('first_name', e.target.value)} 
                    placeholder="First Name"
                  />
                  <input 
                    style={{ ...styles.input, fontSize: '20px', fontWeight: 'bold', width: 'auto' }} 
                    value={editData.last_name} 
                    onChange={e => handleChange('last_name', e.target.value)} 
                    placeholder="Last Name"
                  />
                </div>
              ) : (
                <h1 style={{ margin: "0 0 8px 0", fontSize: "32px", color: COLORS.textPrimary }}>
                  {profileData.first_name} {profileData.last_name}
                </h1>
              )}
              
              <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap", justifyContent: 'inherit' }}>
                <span style={{ 
                  background: COLORS.primary, color: "white", padding: "4px 12px", 
                  borderRadius: "20px", fontSize: "12px", fontWeight: "700" 
                }}>
                  {profileData.role}
                </span>
                <span style={{ 
                  color: COLORS.textSecondary, fontSize: "14px", display: "flex", alignItems: "center", gap: "4px" 
                }}>
                  <Briefcase size={14} /> {profileData.department}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="hero-actions">
              {!isEditing ? (
                <button className="btn-primary btn-action" onClick={() => setIsEditing(true)}>
                  <Edit3 size={16} /> Edit Profile
                </button>
              ) : (
                <>
                  <button className="btn-cancel btn-action" onClick={handleCancel}>
                    <X size={16} /> Cancel
                  </button>
                  <button className="btn-primary btn-action" onClick={handleSave}>
                    <Save size={16} /> Save Changes
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* 2. Content Grid */}
        <div className="profile-grid">
          
          {/* Left Column: Contact & Personal */}
          <div>
            <h3 style={styles.sectionTitle}><ShieldCheck size={20} color={COLORS.primary} /> Contact Information</h3>
            <InfoField 
              icon={Mail} label="Email Address" value={editData.email} isEditing={isEditing} 
              onChange={v => handleChange('email', v)} type="email"
            />
            <InfoField 
              icon={Phone} label="Phone Number" value={editData.phone} isEditing={isEditing} 
              onChange={v => handleChange('phone', v)} type="tel"
            />
            <InfoField 
              icon={MapPin} label="Location" value={editData.location} isEditing={isEditing} 
              onChange={v => handleChange('location', v)} 
            />

            <div style={{ height: "30px" }} /> {/* Spacer */}

            <h3 style={styles.sectionTitle}><User size={20} color={COLORS.primary} /> Personal Details</h3>
            <InfoField 
              icon={Globe} label="Nationality" value={editData.nationality} isEditing={isEditing} 
              onChange={v => handleChange('nationality', v)} 
            />
            <InfoField 
              icon={Heart} label="Marital Status" value={editData.marital_status} isEditing={isEditing} 
              onChange={v => handleChange('marital_status', v)}
              options={[
                { val: 'single', label: 'Single' },
                { val: 'married', label: 'Married' },
                { val: 'divorced', label: 'Divorced' },
                { val: 'other', label: 'Other' }
              ]}
            />
          </div>

          {/* Right Column: Bio & Meta */}
          <div>
            <h3 style={styles.sectionTitle}><Briefcase size={20} color={COLORS.primary} /> Work & Bio</h3>
            
            <div style={{ marginBottom: "24px" }}>
              <label className="field-label">About Me</label>
              {isEditing ? (
                <textarea
                  style={{ ...styles.input, height: "120px", resize: "none", lineHeight: "1.6" }}
                  value={editData.bio}
                  onChange={(e) => handleChange('bio', e.target.value)}
                  placeholder="Tell us a bit about yourself..."
                />
              ) : (
                <p style={{ 
                  lineHeight: "1.6", color: COLORS.textSecondary, background: COLORS.bgMain, 
                  padding: "16px", borderRadius: "12px", border: `1px solid ${COLORS.borderColor}` 
                }}>
                  {profileData.bio || "No bio description added yet."}
                </p>
              )}
            </div>

            <InfoField 
              icon={Briefcase} label="Department" value={editData.department} isEditing={isEditing} 
              onChange={v => handleChange('department', v)} 
              options={[
                { val: 'Sales', label: 'Sales' },
                { val: 'Engineering', label: 'Engineering' },
                { val: 'HR', label: 'HR' },
                { val: 'Marketing', label: 'Marketing' }
              ]}
            />

             <InfoField 
              icon={Calendar} label="Date Joined" value={profileData.joinDate} isEditing={false} 
            />
          </div>

        </div>
      </div>
    </div>
  );
};

export default Profile;