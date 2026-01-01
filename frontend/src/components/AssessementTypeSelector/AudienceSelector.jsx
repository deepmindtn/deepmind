import React, { useState } from "react";

const departments = ["HR", "Marketing", "Engineering", "Sales"];
const employees = [
  { id: 1, name: "Alice Johnson" },
  { id: 2, name: "Bob Smith" },
  { id: 3, name: "Charlie Lee" },
];

const AudienceSelector = ({ value, onChange }) => {
  const [type, setType] = useState("all");

  const handleSelectionChange = (e) => {
    const selected = Array.from(e.target.selectedOptions, (option) => option.value);
    onChange({ type, selected });
  };

  return (
    <div className="audience-selector">
      <h3>Select Audience</h3>
      <select
        onChange={(e) => {
          setType(e.target.value);
          onChange({ type: e.target.value, selected: [] });
        }}
      >
        <option value="all">All Employees</option>
        <option value="departments">Departments</option>
        <option value="employees">Specific Employees</option>
      </select>

      {(type === "departments" || type === "employees") && (
        <select multiple onChange={handleSelectionChange}>
          {(type === "departments" ? departments : employees).map((item) => (
            <option key={item.id || item} value={item.id || item}>
              {item.name || item}
            </option>
          ))}
        </select>
      )}
    </div>
  );
};

export default AudienceSelector;
