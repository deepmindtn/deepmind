import React, { useState, useRef, useEffect } from "react";
import {
  Layers,
  Plus,
  Trash2,
  ArrowLeft,
  Maximize,
  Minimize,
  AlertCircle,
  Clock,
  UserPlus,
  XCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const COLORS = {
  primary: "#6366f1", // Indigo
  bgMain: "var(--bg-main)",
  cardBg: "var(--card-bg)",
  textPrimary: "var(--text-primary)",
  textSecondary: "var(--text-secondary)",
  borderColor: "var(--border-color)",
  shadowHuge: "var(--shadow-huge)",
};

const QUADRANT_CONFIG = [
  {
    id: 0,
    title: "Do First",
    subtitle: "Urgent & Important",
    color: "#ef4444",
    icon: <AlertCircle size={18} />,
  },
  {
    id: 1,
    title: "Schedule",
    subtitle: "Important, Not Urgent",
    color: "#f59e0b",
    icon: <Clock size={18} />,
  },
  {
    id: 2,
    title: "Delegate",
    subtitle: "Urgent, Not Important",
    color: "#3b82f6",
    icon: <UserPlus size={18} />,
  },
  {
    id: 3,
    title: "Eliminate",
    subtitle: "Neither",
    color: "#94a3b8",
    icon: <XCircle size={18} />,
  },
];

const EisenhowerMatrix = () => {
  const [tasks, setTasks] = useState([[], [], [], []]);
  const [input, setInput] = useState("");
  const [selectedQuad, setSelectedQuad] = useState(0);
  const [isZen, setIsZen] = useState(false);
  const containerRef = useRef(null);
  const navigate = useNavigate();

  const addTask = () => {
    if (!input.trim()) return;
    const newTasks = [...tasks];
    newTasks[selectedQuad].push(input);
    setTasks(newTasks);
    setInput("");
  };

  const removeTask = (qIdx, tIdx) => {
    const newTasks = [...tasks];
    newTasks[qIdx].splice(tIdx, 1);
    setTasks(newTasks);
  };

  return (
    <div
      ref={containerRef}
      style={{
        backgroundColor: isZen ? "#0f172a" : COLORS.cardBg,
        borderRadius: isZen ? "0" : "24px",
        height: isZen ? "100vh" : "calc(100vh - 40px)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        transition: "all 0.5s ease",
        border: isZen ? "none" : `1px solid ${COLORS.borderColor}`,
      }}
    >
      {/* Header */}
      {!isZen && (
        <div
          style={{
            padding: "24px 40px",
            borderBottom: `1px solid ${COLORS.borderColor}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "linear-gradient(135deg, #e0e7ff 0%, #ffffff 100%)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
            <button
              className="integrated-back-btn"
              onClick={() => navigate("/productivity-tools")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 16px",
                background: "white",
                border: "1px solid #e5e7eb",
                borderRadius: "12px",
                cursor: "pointer",
                fontWeight: "700",
              }}
            >
              <ArrowLeft size={16} /> Back
            </button>
            <div
              style={{
                width: "48px",
                height: "48px",
                backgroundColor: COLORS.primary,
                borderRadius: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
              }}
            >
              <Layers size={24} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: "22px", fontWeight: "800" }}>
                Eisenhower Matrix
              </h2>
              <p
                style={{
                  margin: 0,
                  fontSize: "13px",
                  color: COLORS.textSecondary,
                }}
              >
                Prioritize tasks based on urgency and importance
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsZen(true)}
            style={{
              padding: "12px",
              borderRadius: "12px",
              border: "1px solid #e5e7eb",
              background: "white",
              cursor: "pointer",
            }}
          >
            <Maximize size={20} />
          </button>
        </div>
      )}

      {isZen && (
        <button
          onClick={() => setIsZen(false)}
          style={{
            position: "absolute",
            top: "20px",
            right: "20px",
            zIndex: 10,
            padding: "12px",
            borderRadius: "12px",
            background: "rgba(255,255,255,0.1)",
            color: "white",
            border: "none",
            cursor: "pointer",
          }}
        >
          <Minimize size={20} />
        </button>
      )}

      <div
        style={{
          flex: 1,
          padding: "30px",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: "24px",
        }}
      >
        {/* Input Bar */}
        <div
          style={{
            display: "flex",
            gap: "12px",
            maxWidth: "800px",
            margin: "0 auto",
            width: "100%",
            background: isZen ? "rgba(255,255,255,0.05)" : "#f8fafc",
            padding: "12px",
            borderRadius: "16px",
          }}
        >
          <select
            value={selectedQuad}
            onChange={(e) => setSelectedQuad(Number(e.target.value))}
            style={{
              padding: "10px",
              borderRadius: "10px",
              border: "1px solid #e2e8f0",
              fontWeight: "600",
              outline: "none",
            }}
          >
            {QUADRANT_CONFIG.map((q) => (
              <option key={q.id} value={q.id}>
                {q.title}
              </option>
            ))}
          </select>
          <input
            style={{
              flex: 1,
              padding: "10px",
              borderRadius: "10px",
              border: "1px solid #e2e8f0",
              outline: "none",
            }}
            placeholder="What needs to be done?"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addTask()}
          />
          <button
            onClick={addTask}
            style={{
              padding: "0 24px",
              background: COLORS.primary,
              color: "white",
              border: "none",
              borderRadius: "10px",
              fontWeight: "700",
              cursor: "pointer",
            }}
          >
            Add Task
          </button>
        </div>

        {/* Matrix Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gridTemplateRows: "1fr 1fr",
            gap: "20px",
            flex: 1,
            minHeight: "500px",
          }}
        >
          {QUADRANT_CONFIG.map((q) => (
            <div
              key={q.id}
              style={{
                backgroundColor: isZen ? "rgba(255,255,255,0.03)" : "white",
                borderRadius: "20px",
                border: `2px solid ${q.color}20`,
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  padding: "15px 20px",
                  backgroundColor: `${q.color}10`,
                  borderBottom: `1px solid ${q.color}20`,
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                <span style={{ color: q.color }}>{q.icon}</span>
                <div style={{ lineHeight: 1 }}>
                  <h4
                    style={{
                      margin: 0,
                      color: isZen ? "white" : "#1e293b",
                      fontSize: "16px",
                    }}
                  >
                    {q.title}
                  </h4>
                  <small style={{ color: COLORS.textMuted }}>
                    {q.subtitle}
                  </small>
                </div>
              </div>
              <div style={{ flex: 1, padding: "15px", overflowY: "auto" }}>
                {tasks[q.id].map((t, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "10px 14px",
                      background: isZen ? "rgba(255,255,255,0.05)" : "#f1f5f9",
                      borderRadius: "10px",
                      marginBottom: "8px",
                      color: isZen ? "#cbd5e1" : "#475569",
                      fontSize: "14px",
                    }}
                  >
                    {t}
                    <Trash2
                      size={14}
                      style={{ cursor: "pointer", opacity: 0.6 }}
                      onClick={() => removeTask(q.id, idx)}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EisenhowerMatrix;
