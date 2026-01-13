import React, { useState } from "react";
import { Users, Layers, User } from "lucide-react";
import "./AudienceSelector.css";

const departments = ["HR", "Marketing", "Engineering", "Sales"];
const employees = [
  { id: 1, name: "Alice Johnson" },
  { id: 2, name: "Bob Smith" },
  { id: 3, name: "Charlie Lee" },
];

const AudienceSelector = ({ value, onChange }) => {
  const [type, setType] = useState(value?.type || "all");
  const [selected, setSelected] = useState(value?.selected || []);

  const handleTypeChange = (newType) => {
    setType(newType);
    setSelected([]);
    onChange({ type: newType, selected: [] });
  };

  const toggleSelection = (item) => {
    const updated =
      selected.includes(item)
        ? selected.filter((i) => i !== item)
        : [...selected, item];

    setSelected(updated);
    onChange({ type, selected: updated });
  };

  const data =
    type === "departments"
      ? departments
      : employees.map((e) => e.name);

  return (
    <div className="audience-selector">
      <div className="audience-header">
        <h3>Select Audience</h3>
        <p>Choose who will receive this assessment</p>
      </div>

      {/* Audience Type */}
      <div className="audience-type-grid">
        <AudienceTypeCard
          icon={<Users />}
          title="All Employees"
          active={type === "all"}
          onClick={() => handleTypeChange("all")}
        />

        <AudienceTypeCard
          icon={<Layers />}
          title="Departments"
          active={type === "departments"}
          onClick={() => handleTypeChange("departments")}
        />

        <AudienceTypeCard
          icon={<User />}
          title="Specific Employees"
          active={type === "employees"}
          onClick={() => handleTypeChange("employees")}
        />
      </div>

      {/* Select Items */}
      {(type === "departments" || type === "employees") && (
        <div className="audience-chips">
          {data.map((item) => (
            <button
              key={item}
              className={`chip ${selected.includes(item) ? "active" : ""}`}
              onClick={() => toggleSelection(item)}
            >
              {item}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const AudienceTypeCard = ({ icon, title, active, onClick }) => (
  <div className={`audience-type-card ${active ? "active" : ""}`} onClick={onClick}>
    <div className="type-icon">{icon}</div>
    <span>{title}</span>
  </div>
);

export default AudienceSelector;
