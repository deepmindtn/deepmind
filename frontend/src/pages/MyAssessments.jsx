import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FileText, PlayCircle, Loader2 } from "lucide-react";
import "./MyAssessments.css";

export default function MyAssessments() {
  const navigate = useNavigate();
  const API_BASE = "http://localhost:8080";

  const access = localStorage.getItem("access");
  const authHeader = access ? { Authorization: `Bearer ${access}` } : {};

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const r = await fetch(`${API_BASE}/api/assessments/my/`, {
          headers: { ...authHeader },
        });
        const data = await r.json();
        setItems(Array.isArray(data) ? data : []);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  function start(a) {
    const code = a.template_code;
    // === Base assessments ===
    if (code === "BIG_FIVE") navigate(`/big-five?assignment=${a.id}`);
    else if (code === "KARASEK") navigate(`/karasek?assignment=${a.id}`);
    else if (code === "MASLACH") navigate(`/maslach?assignment=${a.id}`);
    else if (code === "DISC") navigate(`/disc?assignment=${a.id}`);
    else if (code === "JSS") navigate(`/jss?assignment=${a.id}`);
    else if (code === "BRS") navigate(`/brs?assignment=${a.id}`);

    // === New psychometric tools ===
    else if (code === "CDRISC") navigate(`/cdrisc?assignment=${a.id}`); // Connor-Davidson 10
    else if (code === "WSES") navigate(`/wses?assignment=${a.id}`);     // Work Self-Efficacy
    else if (code === "GCOS") navigate(`/gcos?assignment=${a.id}`);     // General Causality Orientation

    // === Innovation Pack ===
    else if (code === "RIBS") navigate(`/ribs?assignment=${a.id}`);     // Ideational behavior
    else if (code === "CAQ") navigate(`/caq?assignment=${a.id}`);       // Creative Achievement
    else if (code === "ISE") navigate(`/ise?assignment=${a.id}`);       // Innovation Self-Efficacy

    else alert(`Unknown assessment type: ${code}`);
  }

  return (
    <div className="assessments-page">
      <h1 className="page-title">My Assessments</h1>

      {loading ? (
        <div className="loading">
          <Loader2 className="spin" size={24} /> Loading…
        </div>
      ) : items.length === 0 ? (
        <div className="empty-state">No assignments yet.</div>
      ) : (
        <div className="assessments-list">
          {items.map((a) => (
            <div key={a.id} className="assessment-card">
              <div className="assessment-info">
                <h3>{a.template_name}</h3>
                <p className={`status ${a.status.toLowerCase()}`}>{a.status}</p>
                <p className="assigned">
                  Assigned: {new Date(a.assigned_at).toLocaleDateString()}
                </p>
              </div>
              <div className="assessment-action">
                {a.status === "PENDING" ? (
                  <button className="btn start" onClick={() => start(a)}>
                    <PlayCircle size={18} /> Start
                  </button>
                ) : (
                  <Link to={`/report/${a.id}`} className="btn report">
                    <FileText size={18} /> View Report
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
