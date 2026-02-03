import React, { useState, useMemo } from "react";
import { Users, Layers, User, Search, Loader2 } from "lucide-react";
import "./AudienceSelector.css";

const COLORS = {
  primary: "var(--primary)",
  primaryLight: "var(--primary-light)",
  primaryDark: "var(--primary-dark)",
  secondary: "var(--secondary)",
  blue: "var(--blue)",
  blueLight: "var(--blue-light)",
  purple: "var(--purple)",
  purpleLight: "var(--purple-light)",
  orange: "var(--orange)",
  orangeLight: "var(--orange-light)",
  red: "var(--red)",
  dark: "var(--dark)",
  bgMain: "var(--bg-main)",
  cardBg: "var(--card-bg)",
  textPrimary: "var(--text-primary)",
  textSecondary: "var(--text-secondary)",
  textMuted: "var(--text-muted)",
  borderColor: "var(--border-color)",
  shadowSm: "var(--shadow-sm)",
  shadowMd: "var(--shadow-md)",
  shadowLg: "var(--shadow-lg)",
  shadowHuge: "var(--shadow-huge)",
};

const AudienceSelector = ({
  value,
  onChange,
  departments = [],
  employees = [],
  loading = false,
}) => {
  const type = value?.type || "all";
  const selected = value?.selected || [];
  const [searchTerm, setSearchTerm] = useState("");

  const handleTypeChange = (newType) => {
    onChange({ type: newType, selected: [] });
    setSearchTerm("");
  };

  const toggleSelection = (id) => {
    const updated = selected.includes(id)
      ? selected.filter((i) => i !== id)
      : [...selected, id];
    onChange({ type, selected: updated });
  };

  const displayData = useMemo(() => {
    let data = [];
    if (type === "departments") data = departments;
    if (type === "employees") data = employees;
    if (searchTerm.trim()) {
      const lower = searchTerm.toLowerCase();
      return data.filter((item) => item.name.toLowerCase().includes(lower));
    }
    return data;
  }, [type, departments, employees, searchTerm]);

  return (
    <div
      className="audience-selector"
      style={{ backgroundColor: COLORS.cardBg, color: COLORS.textPrimary }}
    >
      <div className="audience-header">
        <h3 style={{ color: COLORS.textPrimary }}>Select Audience</h3>
        <p style={{ color: COLORS.textSecondary }}>
          Choose who will receive this assessment
        </p>
      </div>

      <div className="audience-type-grid">
        <AudienceTypeCard
          icon={<Users size={20} />}
          title="All Employees"
          active={type === "all"}
          onClick={() => handleTypeChange("all")}
        />
        <AudienceTypeCard
          icon={<Layers size={20} />}
          title="Departments"
          active={type === "departments"}
          onClick={() => handleTypeChange("departments")}
        />
        <AudienceTypeCard
          icon={<User size={20} />}
          title="Specific Employees"
          active={type === "employees"}
          onClick={() => handleTypeChange("employees")}
        />
      </div>

      {loading && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            padding: "20px",
            color: COLORS.textMuted,
          }}
        >
          <Loader2 className="animate-spin" size={24} />
        </div>
      )}

      {!loading && (type === "departments" || type === "employees") && (
        <div className="audience-selection-area" style={{ marginTop: "20px" }}>
          {type === "employees" && (
            <div
              className="audience-search"
              style={{
                marginBottom: "12px",
                position: "relative",
                display: "flex",
                alignItems: "center",
              }}
            >
              <Search
                size={16}
                color={COLORS.textMuted}
                style={{ position: "absolute", left: "12px" }}
              />
              <input
                type="text"
                placeholder="Search employees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 10px 10px 36px",
                  borderRadius: "8px",
                  border: `1px solid ${COLORS.borderColor}`,
                  outline: "none",
                  fontSize: "13px",
                  backgroundColor: COLORS.cardBg,
                  color: COLORS.textPrimary,
                }}
              />
            </div>
          )}

          <div className="audience-chips">
            {displayData.length > 0 ? (
              displayData.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={`chip ${
                    selected.includes(item.id) ? "active" : ""
                  }`}
                  onClick={() => toggleSelection(item.id)}
                  style={{
                    backgroundColor: selected.includes(item.id)
                      ? COLORS.primaryLight
                      : COLORS.cardBg,
                    border: `1px solid ${
                      selected.includes(item.id)
                        ? COLORS.primary
                        : COLORS.borderColor
                    }`,
                    color: selected.includes(item.id)
                      ? COLORS.primaryDark
                      : COLORS.textPrimary,
                  }}
                >
                  <span style={{ fontWeight: 500 }}>{item.name}</span>
                  {type === "employees" && item.department && (
                    <span
                      style={{
                        fontSize: "10px",
                        opacity: 0.7,
                        marginLeft: "6px",
                      }}
                    >
                      ({item.department})
                    </span>
                  )}
                </button>
              ))
            ) : (
              <div
                style={{
                  color: COLORS.textMuted,
                  fontSize: "13px",
                  fontStyle: "italic",
                }}
              >
                {searchTerm ? "No matches found." : "No options available."}
              </div>
            )}
          </div>

          <div
            style={{
              marginTop: "10px",
              fontSize: "12px",
              color: COLORS.textSecondary,
              textAlign: "right",
            }}
          >
            {selected.length} selected
          </div>
        </div>
      )}
    </div>
  );
};

const AudienceTypeCard = ({ icon, title, active, onClick }) => (
  <div
    className={`audience-type-card ${active ? "active" : ""}`}
    onClick={onClick}
    style={{
      cursor: "pointer",
      padding: "16px",
      borderRadius: "12px",
      border: `1px solid ${active ? COLORS.primary : COLORS.borderColor}`,
      backgroundColor: COLORS.cardBg, // Use cardBg here as requested
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: "8px",
      transition: "all 0.2s",
      color: COLORS.textPrimary, // Force primary text
      minHeight: "100px",
    }}
  >
    <div
      className="type-icon"
      style={{ color: active ? COLORS.primary : COLORS.textMuted }}
    >
      {icon}
    </div>
    <span
      style={{
        fontWeight: "600",
        fontSize: "13px",
        textAlign: "center",
        color: active ? COLORS.primary : COLORS.textPrimary,
      }}
    >
      {title}
    </span>
  </div>
);

export default AudienceSelector;
