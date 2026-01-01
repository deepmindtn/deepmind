import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import "./ReportPage.css";

export default function ReportPage() {
  const { id } = useParams();
  const API_BASE = "http://localhost:8080";
  const access = localStorage.getItem("access");
  const authHeader = access ? { Authorization: `Bearer ${access}` } : {};

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch(`${API_BASE}/api/assessments/${id}/`, {
          headers: { ...authHeader },
        });
        const data = await r.json();
        setReport(data);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) return <div className="loading">Loading report...</div>;
  if (!report) return <div className="loading">No report found.</div>;

  // ----- Prepare chart data -----
  let chartData = [];
  if (report.template_code === "BIG_FIVE" && report.metrics?.trait) {
    chartData = Object.entries(report.metrics.trait).map(([k, v]) => ({
      name: k,
      value: v,
    }));
  }
  if (report.template_code === "KARASEK" && report.metrics?.dimScores) {
    chartData = Object.entries(report.metrics.dimScores).map(([k, v]) => ({
      name: k,
      value: v,
    }));
  }
  if (report.template_code === "MASLACH" && report.metrics?.burnout) {
    chartData = Object.entries(report.metrics.burnout).map(([k, v]) => ({
      name: k,
      value: v,
    }));
  }

  return (
    <div className="report-page">
      <h1>{report.template_name} Report</h1>
      <p>Status: {report.status}</p>
      {report.completed_at && <p>Completed: {report.completed_at}</p>}

      {/* --- Metrics Section --- */}
      {chartData.length > 0 && (
        <div className="report-section">
          <h3>Metrics</h3>
          <div className="b5-chart" style={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Special for Karasek quadrant */}
          {report.template_code === "KARASEK" && (
            <p className="quadrant-badge">
              Quadrant: <strong>{report.metrics?.quadrant}</strong>
            </p>
          )}
        </div>
      )}

      {/* --- AI Report --- */}
      {report.ai_report && (
        <div className="report-section">
          <h3>AI Report</h3>
          <p style={{ whiteSpace: "pre-wrap" }}>{report.ai_report}</p>
        </div>
      )}
    </div>
  );
}
