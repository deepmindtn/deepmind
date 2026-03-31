import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import StructuredReport from "./assessments/StructuredReport";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
} from "recharts";
import "./ReportPage.css";

export default function ReportPage() {
  const { id, candidateId } = useParams();
  const API_BASE = import.meta.env.VITE_API_BASE_URL;
  const access = localStorage.getItem("access");
  const isCandidateReport = Boolean(candidateId);
  const reportId = candidateId || id;

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const detailUrl = isCandidateReport
          ? `${API_BASE}/api/assessments/candidate/${reportId}/`
          : `${API_BASE}/api/assessments/${reportId}/`;
        const r = await fetch(detailUrl, {
          headers: access ? { Authorization: `Bearer ${access}` } : {},
        });
        const data = await r.json();
        setReport(data);
      } finally {
        setLoading(false);
      }
    })();
  }, [API_BASE, access, isCandidateReport, reportId]);

  if (loading) return <div className="loading">Loading report...</div>;
  if (!report) return <div className="loading">No report found.</div>;

  // ----- Prepare chart data based on assessment type -----
  const prepareChartData = () => {
    const template_code = report.template_code || report.template?.code;
    const metrics = report.metrics;
    
    if (!metrics) return { chartData: [], extraInfo: null };

    let chartData = [];
    let extraInfo = null;

    switch (template_code) {
      case "BIG_FIVE": {
        // Big Five Personality: N, E, O, A, C
        // Support both new format (trait) and old format (traitScores)
        const bigFiveData = metrics.trait || metrics.traitScores;
        if (bigFiveData) {
          chartData = Object.entries(bigFiveData).map(([k, v]) => ({
            name: k,
            value: v,
            fill: getColorForTrait(k)
          }));
        }
        break;
      }

      case "KARASEK": {
        // Karasek: Demands, Control, Support + Quadrant
        // Support both new format (dim) and old format (dimScores)
        const karasekDim = metrics.dim || metrics.dimScores;
        if (karasekDim) {
          chartData = Object.entries(karasekDim).map(([k, v]) => ({
            name: k === 'D' ? 'Demands' : k === 'C' ? 'Control' : 'Support',
            value: v,
            fill: k === 'D' ? '#ef4444' : k === 'C' ? '#10b981' : '#3b82f6'
          }));
          extraInfo = metrics.quadrant ? `Quadrant: ${metrics.quadrant}` : null;
        }
        break;
      }

      case "MASLACH": {
        // Maslach Burnout Inventory
        // Support both burnout object and direct EE/DP/PA keys
        const maslachData = metrics.burnout || { EE: metrics.EE, DP: metrics.DP, PA: metrics.PA };
        if (maslachData && Object.keys(maslachData).length > 0) {
          chartData = Object.entries(maslachData)
            .filter(([_k, v]) => v !== undefined)
            .map(([k, v]) => ({
              name: k.charAt(0).toUpperCase() + k.slice(1),
              value: v,
              fill: '#f59e0b'
            }));
        }
        break;
      }

      case "DISC":
        // DISC: Dominance, Influence, Stability, Conformity
        // Support new format (percent/trait) and old format (direct C,D,I,S keys)
        if (metrics.percent) {
          chartData = Object.entries(metrics.percent).map(([k, v]) => ({
            name: k === 'D' ? 'Dominance' : k === 'I' ? 'Influence' : k === 'S' ? 'Stability' : 'Conformity',
            value: v,
            fill: k === 'D' ? '#ef4444' : k === 'I' ? '#eab308' : k === 'S' ? '#10b981' : '#3b82f6'
          }));
        } else if (metrics.trait) {
          chartData = Object.entries(metrics.trait).map(([k, v]) => ({
            name: k === 'D' ? 'Dominance' : k === 'I' ? 'Influence' : k === 'S' ? 'Stability' : 'Conformity',
            value: v,
            fill: k === 'D' ? '#ef4444' : k === 'I' ? '#eab308' : k === 'S' ? '#10b981' : '#3b82f6'
          }));
        } else if (metrics.D !== undefined) {
          // Old format: direct C, D, I, S keys
          const total = (metrics.D || 0) + (metrics.I || 0) + (metrics.S || 0) + (metrics.C || 0);
          chartData = [
            { name: 'Dominance', value: total > 0 ? Math.round((metrics.D / total) * 100) : 0, fill: '#ef4444' },
            { name: 'Influence', value: total > 0 ? Math.round((metrics.I / total) * 100) : 0, fill: '#eab308' },
            { name: 'Stability', value: total > 0 ? Math.round((metrics.S / total) * 100) : 0, fill: '#10b981' },
            { name: 'Conformity', value: total > 0 ? Math.round((metrics.C / total) * 100) : 0, fill: '#3b82f6' }
          ];
        }
        break;

      case "JSS": {
        // Job Satisfaction Survey: 9 subscales
        // Support both new format (subscores) and old format (dimScores)
        const jssScores = metrics.subscores || metrics.dimScores;
        if (jssScores) {
          chartData = Object.entries(jssScores).map(([k, v]) => ({
            name: k.charAt(0).toUpperCase() + k.slice(1),
            value: v,
            fill: '#8b5cf6'
          }));
          const totalScore = metrics.total || metrics.global;
          extraInfo = totalScore ? `Total Score: ${totalScore}` : null;
        }
        break;
      }

      case "BRS":
        // Brief Resilience Scale
        if (metrics.average !== undefined) {
          extraInfo = `Resilience Level: ${metrics.level} (Average: ${metrics.average})`;
          chartData = [{ name: 'Resilience', value: metrics.average * 20, fill: '#10b981' }]; // Scale to 100
        }
        break;

      case "CDRISC10":
        // Connor-Davidson Resilience Scale
        if (metrics.total !== undefined) {
          extraInfo = `Level: ${metrics.level || 'N/A'}`;
          chartData = [{ name: 'Resilience', value: (metrics.total / 40) * 100, fill: '#14b8a6' }]; // Scale to 100
        }
        break;

      case "WSES":
        // Work Self-Efficacy Scale
        if (metrics.total !== undefined) {
          extraInfo = metrics.level ? `Level: ${metrics.level}` : null;
          chartData = [{ name: 'Self-Efficacy', value: (metrics.total / 60) * 100, fill: '#06b6d4' }]; // Scale to 100
        }
        break;

      case "GCOS": {
        // General Causality Orientations Scale
        // Support both new format (subscales) and old format (averages)
        const gcosData = metrics.subscales || metrics.averages;
        if (gcosData) {
          chartData = Object.entries(gcosData).map(([k, v]) => ({
            name: k.charAt(0).toUpperCase() + k.slice(1),
            value: v,
            fill: '#ec4899'
          }));
        }
        break;
      }

      case "RIBS":
        // Reported and Intended Behavior Scale
        if (metrics.total !== undefined) {
          extraInfo = metrics.level ? `Level: ${metrics.level}` : null;
          chartData = [{ name: 'Behavior', value: (metrics.total / 32) * 100, fill: '#f59e0b' }]; // Scale to 100
        }
        break;

      case "CAQ": {
        // Career Adaptability Questionnaire
        // Support both new format (subscales) and old format (domainScores)
        const caqData = metrics.subscales || metrics.domainScores;
        if (caqData) {
          chartData = Object.entries(caqData).map(([k, v]) => ({
            name: k.charAt(0).toUpperCase() + k.slice(1),
            value: v,
            fill: '#6366f1'
          }));
          extraInfo = metrics.total ? `Total Score: ${metrics.total}` : null;
        }
        break;
      }

      case "ISE":
        // Inclusion of Self in the Environment
        if (metrics.total !== undefined) {
          extraInfo = metrics.level ? `Level: ${metrics.level}` : null;
          chartData = [{ name: 'Connection', value: (metrics.total / 28) * 100, fill: '#10b981' }]; // Scale to 100
        }
        break;

      default:
        // Generic handling for unknown types
        if (typeof metrics === 'object') {
          chartData = Object.entries(metrics)
            .filter(([_k, v]) => typeof v === 'number')
            .map(([k, v]) => ({
              name: k.charAt(0).toUpperCase() + k.slice(1),
              value: v,
              fill: '#8b5cf6'
            }));
        }
        break;
    }

    return { chartData, extraInfo };
  };

  // Helper function to get colors for different traits
  const getColorForTrait = (trait) => {
    const colors = {
      N: '#ef4444', E: '#3b82f6', O: '#8b5cf6', A: '#10b981', C: '#f59e0b',
      D: '#ef4444', I: '#eab308', S: '#10b981'
    };
    return colors[trait] || '#8b5cf6';
  };

  const { chartData, extraInfo } = prepareChartData();

  return (
    <div className="report-page">
      <h1>{(report.template_name || report.template?.name || "Assessment")} Report</h1>
      <p>Status: {report.status}</p>
      {report.completed_at && <p>Completed: {new Date(report.completed_at).toLocaleString()}</p>}

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
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Extra information (e.g., quadrant, level, total) */}
          {extraInfo && (
            <p className="quadrant-badge" style={{ marginTop: '16px', fontWeight: 'bold' }}>
              {extraInfo}
            </p>
          )}
        </div>
      )}

      {/* --- AI Report --- */}
      {report.ai_report && (
        <div className="report-section">
          <h3>AI Report</h3>
          <StructuredReport
            report={(() => {
              try { return JSON.parse(report.ai_report); }
              catch { return report.ai_report; }
            })()}
          />
        </div>
      )}
    </div>
  );
}
