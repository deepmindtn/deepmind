import React, { useState, useMemo } from "react";
import { Users, Layers, User, Search, Loader2 } from "lucide-react";
import "./AudienceSelector.css";

const AudienceSelector = ({
  value,
  onChange,
  departments = [],
  employees = [],
  loading = false,
}) => {
  // Use props directly (Controlled Component)
  const type = value?.type || "all";
  const selected = value?.selected || [];

  // Local state only for searching within the list
  const [searchTerm, setSearchTerm] = useState("");

  const handleTypeChange = (newType) => {
    // Reset selection when changing type
    onChange({ type: newType, selected: [] });
    setSearchTerm(""); // Reset search
  };

  const toggleSelection = (id) => {
    const updated = selected.includes(id)
      ? selected.filter((i) => i !== id) // Remove if exists
      : [...selected, id]; // Add if not exists

    onChange({ type, selected: updated });
  };

  // Determine which data to display based on type
  const displayData = useMemo(() => {
    let data = [];
    if (type === "departments") data = departments;
    if (type === "employees") data = employees;

    // Filter by search term if exists
    if (searchTerm.trim()) {
      const lower = searchTerm.toLowerCase();
      return data.filter((item) => item.name.toLowerCase().includes(lower));
    }
    return data;
  }, [type, departments, employees, searchTerm]);

  return (
    <div className="audience-selector">
      {/* Header (Hidden visually via CSS usually, but kept for structure) */}
      <div className="audience-header">
        <h3>Select Audience</h3>
        <p>Choose who will receive this assessment</p>
      </div>

      {/* Audience Type Grid */}
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

      {/* Loading State */}
      {loading && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            padding: "20px",
            color: "var(--text-muted)",
          }}
        >
          <Loader2 className="animate-spin" size={24} />
        </div>
      )}

      {/* Selection Area */}
      {!loading && (type === "departments" || type === "employees") && (
        <div className="audience-selection-area" style={{ marginTop: "20px" }}>
          {/* Optional Search Bar for long lists */}
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
                color="var(--text-muted)"
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
                  border: "1px solid var(--border-color)",
                  outline: "none",
                  fontSize: "13px",
                }}
              />
            </div>
          )}

          {/* Chips Container */}
          <div className="audience-chips">
            {displayData.length > 0 ? (
              displayData.map((item) => (
                <button
                  key={item.id}
                  type="button" // Prevent form submission
                  className={`chip ${
                    selected.includes(item.id) ? "active" : ""
                  }`}
                  onClick={() => toggleSelection(item.id)}
                >
                  {/* Display Name */}
                  <span style={{ fontWeight: 500 }}>{item.name}</span>

                  {/* Optional: Add Department name in small text if viewing employees */}
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
                  color: "var(--text-muted)",
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
              color: "var(--text-secondary)",
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
      // Inline styles to match your previous CSS logic if class isn't fully defined
      cursor: "pointer",
      padding: "16px",
      borderRadius: "12px",
      border: active
        ? "2px solid var(--primary)"
        : "1px solid var(--border-color)",
      backgroundColor: active ? "var(--primary-light)" : "#fff",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: "8px",
      transition: "all 0.2s",
      color: active ? "var(--primary-dark)" : "var(--text-primary)",
      minHeight: "100px",
    }}
  >
    <div
      className="type-icon"
      style={{ color: active ? "var(--primary)" : "var(--text-muted)" }}
    >
      {icon}
    </div>
    <span style={{ fontWeight: "600", fontSize: "13px", textAlign: "center" }}>
      {title}
    </span>
  </div>
);

export default AudienceSelector;
