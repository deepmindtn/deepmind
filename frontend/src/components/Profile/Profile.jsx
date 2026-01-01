import React, { useState, useEffect } from "react";
import axios from "axios";
import { User, Mail, Phone, MapPin, Calendar, Edit3, Save, X } from "lucide-react";
import "./Profile.css";

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [editData, setEditData] = useState({});
  const API_BASE = "http://localhost:8080";

  const token = localStorage.getItem("access");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await axios.get(`${API_BASE}/api/auth/me/`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const formattedData = {
          name: `${data.first_name} ${data.last_name}`,
          email: data.email,
          phone: data.phone || "",
          location: data.location || "",
          joinDate: new Date(data.join_date).toLocaleDateString("en-US", {
            month: "long",
            year: "numeric",
          }),
          role: data.role,
          department: data.department || "",
          bio: data.bio || "",
          gender: data.gender || "Not set",
          date_of_birth: data.date_of_birth || "",
          marital_status: data.marital_status || "Not set",
          nationality: data.nationality || "Not set",
        };

        setProfileData(formattedData);
        setEditData(formattedData);
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };

    fetchProfile();
  }, [token]);

  const handleEdit = () => {
    setIsEditing(true);
    setEditData({ ...profileData });
  };

  const handleCancel = () => {
    setEditData({ ...profileData });
    setIsEditing(false);
  };

  const handleInputChange = (field, value) => {
    setEditData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      const body = {
        first_name: editData.name.split(" ")[0] || "",
        last_name: editData.name.split(" ")[1] || "",
        email: editData.email,
        phone: editData.phone,
        location: editData.location,
        role: editData.role,
        department: editData.department,
        bio: editData.bio,
        gender: editData.gender,
        date_of_birth: editData.date_of_birth,
        marital_status: editData.marital_status,
        nationality: editData.nationality,
      };

      const { data } = await axios.patch(`${API_BASE}/api/auth/me/`, body, {
        headers: { Authorization: `Bearer ${token}` },

      });

      setProfileData({
        name: `${data.first_name} ${data.last_name}`,
        email: data.email,
        phone: data.phone || "",
        location: data.location || "",
        joinDate: new Date(data.join_date).toLocaleDateString("en-US", {
          month: "long",
          year: "numeric",
        }),
        role: data.role,
        department: data.department || "",
        bio: data.bio || "",
        gender: data.gender || "Not set",
        date_of_birth: data.date_of_birth || "",
        marital_status: data.marital_status || "Not set",
        nationality: data.nationality || "Not set",
      });

      setIsEditing(false);
    } catch (error) {
      console.error("Error saving profile:", error);
    }
  };

  if (!profileData) return <p>Loading profile...</p>;

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1 className="profile-title">User Profile</h1>
        {!isEditing ? (
          <button onClick={handleEdit} className="edit-btn">
            <Edit3 className="edit-icon" />
            Edit Profile
          </button>
        ) : (
          <div className="edit-actions">
            <button onClick={handleSave} className="save-btn">
              <Save className="action-icon" />
              Save
            </button>
            <button onClick={handleCancel} className="cancel-btn">
              <X className="action-icon" />
              Cancel
            </button>
          </div>
        )}
      </div>

      <div className="profile-content">
        {/* Avatar Section */}
        <div className="avatar-section">
          <div className="avatar-container">
            <div className="avatar-large">
              <User className="avatar-icon-large" />
            </div>
          </div>
          <div className="avatar-info">
            {!isEditing ? (
              <>
                <h2 className="profile-name">{profileData.name}</h2>
                <p className="profile-role-text">{profileData.role}</p>
                <p className="profile-department">{profileData.department}</p>
              </>
            ) : (
              <div className="edit-form-section">
                <input
                  type="text"
                  value={editData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className="edit-input name-input"
                />
                <input
                  type="text"
                  value={editData.role}
                  onChange={(e) => handleInputChange("role", e.target.value)}
                  className="edit-input role-input"
                  disabled={true}
                />
                <select
                  value={editData.department}
                  onChange={(e) => handleInputChange("department", e.target.value)}
                  className="edit-input department-input"
                >
                  <option value="sales">Sales</option>
                  <option value="marketing">Marketing</option>
                  <option value="hr">Human Resources</option>
                  <option value="engineering">Engineering</option>
                  <option value="finance">Finance</option>
                  <option value="design">Design</option>
                  <option value="product">Product</option>
                  <option value="operations">Operations</option>
                  <option value="other">Other</option>
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Contact Information Section */}
        <div className="info-section">
          <h3 className="section-title">Contact Information</h3>
          <div className="info-grid">
            <div className="info-item">
              <div className="info-icon-container">
                <Mail className="info-icon" />
              </div>
              <div className="info-content">
                <label className="info-label">Email Address</label>
                {!isEditing ? (
                  <p className="info-value">{profileData.email}</p>
                ) : (
                  <input
                    type="email"
                    value={editData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className="edit-input"
                  />
                )}
              </div>
            </div>

            <div className="info-item">
              <div className="info-icon-container">
                <Phone className="info-icon" />
              </div>
              <div className="info-content">
                <label className="info-label">Phone Number</label>
                {!isEditing ? (
                  <p className="info-value">{profileData.phone}</p>
                ) : (
                  <input
                    type="tel"
                    value={editData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    className="edit-input"
                  />
                )}
              </div>
            </div>

            <div className="info-item">
              <div className="info-icon-container">
                <MapPin className="info-icon" />
              </div>
              <div className="info-content">
                <label className="info-label">Location</label>
                {!isEditing ? (
                  <p className="info-value">{profileData.location}</p>
                ) : (
                  <input
                    type="text"
                    value={editData.location}
                    onChange={(e) => handleInputChange("location", e.target.value)}
                    className="edit-input"
                  />
                )}
              </div>
            </div>

            <div className="info-item">
              <div className="info-icon-container">
                <Calendar className="info-icon" />
              </div>
              <div className="info-content">
                <label className="info-label">Joined</label>
                <p className="info-value">{profileData.joinDate}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Personal Information Section */}
        <div className="info-section">
          <h3 className="section-title">Personal Information</h3>
          <div className="info-grid">
            <div className="info-item">
              <div className="info-icon-container">
                <User className="info-icon" />
              </div>
              <div className="info-content">
                <label className="info-label">Gender</label>
                {!isEditing ? (
                  <p className="info-value">{profileData.gender}</p>
                ) : (
                  <select
                    value={editData.gender}
                    onChange={(e) => handleInputChange("gender", e.target.value)}
                    className="edit-input"
                  >
                    <option value="">Not set</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                    <option value="prefer_not_to_say">Prefer not to say</option>
                  </select>
                )}
              </div>
            </div>

            <div className="info-item">
              <div className="info-icon-container">
                <Calendar className="info-icon" />
              </div>
              <div className="info-content">
                <label className="info-label">Date of Birth</label>
                {!isEditing ? (
                  <p className="info-value">{profileData.date_of_birth}</p>
                ) : (
                  <input
                    type="date"
                    value={editData.date_of_birth || ""}
                    onChange={(e) => handleInputChange("date_of_birth", e.target.value)}
                    className="edit-input"
                  />
                )}
              </div>
            </div>

            <div className="info-item">
              <div className="info-icon-container">
                <User className="info-icon" />
              </div>
              <div className="info-content">
                <label className="info-label">Marital Status</label>
                {!isEditing ? (
                  <p className="info-value">{profileData.marital_status}</p>
                ) : (
                  <select
                    value={editData.marital_status}
                    onChange={(e) => handleInputChange("marital_status", e.target.value)}
                    className="edit-input"
                  >
                    <option value="">Not set</option>
                    <option value="single">Single</option>
                    <option value="married">Married</option>
                    <option value="divorced">Divorced</option>
                    <option value="other">Other</option>
                  </select>
                )}
              </div>
            </div>

            <div className="info-item">
              <div className="info-icon-container">
                <MapPin className="info-icon" />
              </div>
              <div className="info-content">
                <label className="info-label">Nationality</label>
                {!isEditing ? (
                  <p className="info-value">{profileData.nationality}</p>
                ) : (
                  <input
                    type="text"
                    value={editData.nationality}
                    onChange={(e) => handleInputChange("nationality", e.target.value)}
                    className="edit-input"
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Bio Section */}
        <div className="info-section">
          <h3 className="section-title">About</h3>
          <div className="bio-container">
            {!isEditing ? (
              <p className="bio-text">{profileData.bio}</p>
            ) : (
              <textarea
                value={editData.bio}
                onChange={(e) => handleInputChange("bio", e.target.value)}
                className="bio-textarea"
                rows="4"
                placeholder="Tell us about yourself..."
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
