import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  ClipboardCheck, 
  ArrowRight, 
  User, 
  Calendar, 
  ShieldCheck, 
  AlertCircle, 
  Loader2, 
  CheckCircle2,
  ExternalLink,
  HelpCircle,
  Clock
} from 'lucide-react';

// -----------------------
// Design System (Synced with Big Five)
// -----------------------
const VARS = {
  bgMain: "var(--bg-main, #f8fafc)",
  cardBg: "var(--card-bg, #ffffff)",
  primary: "var(--primary, #6366f1)",
  primaryLight: "var(--primary-light, #e0e7ff)",
  textPrimary: "var(--text-primary, #1e293b)",
  textSecondary: "var(--text-secondary, #64748b)",
  borderColor: "var(--border-color, #e2e8f0)",
  shadowHuge: "var(--shadow-huge, 0 20px 25px -5px rgba(0, 0, 0, 0.1))",
};

const styles = {
  container: {
    padding: "40px 20px",
    backgroundColor: VARS.bgMain,
    minHeight: "100vh",
    fontFamily: "'Inter', system-ui, sans-serif",
    display: "flex",
    justifyContent: "center",
    color: VARS.textPrimary,
  },
  mainWrapperCard: {
    backgroundColor: VARS.cardBg,
    borderRadius: "24px",
    border: `1px solid ${VARS.borderColor}`,
    boxShadow: VARS.shadowHuge,
    width: "100%",
    maxWidth: "1100px",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  },
  heroSection: {
    background: `linear-gradient(135deg, ${VARS.primaryLight} 0%, ${VARS.cardBg} 100%)`,
    padding: "48px",
    borderBottom: `1px solid ${VARS.borderColor}`,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  heroIconBox: {
    width: "72px",
    height: "72px",
    borderRadius: "20px",
    backgroundColor: VARS.primary,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 10px 25px -5px rgba(99, 102, 241, 0.4)",
    color: "#fff",
  },
  contentBody: {
    padding: "48px",
    display: "flex",
    gap: "48px",
  },
  sidebar: {
    flex: "0 0 320px",
    display: "flex",
    flexDirection: "column",
    gap: "24px",
  },
  mainContent: {
    flex: 1,
  },
  infoCard: {
    padding: "24px",
    borderRadius: "16px",
    border: `1px solid ${VARS.borderColor}`,
    backgroundColor: VARS.cardBg,
  },
  btn: (variant) => ({
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    padding: "16px 32px",
    borderRadius: "12px",
    border: variant === "outline" ? `1px solid ${VARS.borderColor}` : "none",
    backgroundColor: variant === "primary" ? VARS.primary : "transparent",
    color: variant === "primary" ? "#fff" : VARS.textSecondary,
    fontWeight: "700",
    fontSize: "16px",
    cursor: "pointer",
    transition: "all 0.2s",
    width: "100%",
  })
};

const TakeAssessment = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [assignment, setAssignment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!token) {
      setError('Invalid link. Please check your invitation email.');
      setLoading(false);
      return;
    }

    const fetchAssignment = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/api/assessments/candidate/${token}/`);
        setAssignment(response.data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.status === 404 ? 'Assessment not found or link expired.' : 'Technical error. Please try again later.');
        setLoading(false);
      }
    };
    fetchAssignment();
  }, [token]);

  if (loading) return (
    <div style={styles.container}>
      <div style={{ textAlign: 'center', marginTop: '100px' }}>
        <Loader2 size={48} className="spin" style={{ color: VARS.primary, margin: '0 auto' }} />
        <p style={{ marginTop: '16px', color: VARS.textSecondary, fontWeight: '600' }}>Preparing assessment portal...</p>
      </div>
    </div>
  );

  if (error || !assignment) return (
    <div style={styles.container}>
      <div style={{ ...styles.mainWrapperCard, maxWidth: '500px', padding: '48px', textAlign: 'center' }}>
        <AlertCircle size={64} color="#ef4444" style={{ margin: '0 auto 24px' }} />
        <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '12px' }}>Access Denied</h2>
        <p style={{ color: VARS.textSecondary, marginBottom: '32px', lineHeight: '1.6' }}>{error}</p>
        <button style={styles.btn('outline')} onClick={() => window.location.reload()}>Try Refreshing</button>
      </div>
    </div>
  );

  if (assignment.status === 'COMPLETED') return (
    <div style={styles.container}>
      <div style={{ ...styles.mainWrapperCard, maxWidth: '500px', padding: '48px', textAlign: 'center' }}>
        <div style={{ ...styles.heroIconBox, backgroundColor: '#10b981', margin: '0 auto 24px' }}>
          <CheckCircle2 size={40} />
        </div>
        <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '12px' }}>Assessment Completed</h2>
        <p style={{ color: VARS.textSecondary, marginBottom: '32px' }}>
          This assessment was submitted on <b>{new Date(assignment.completed_at).toLocaleDateString()}</b>.
        </p>
        <div style={{ padding: '16px', borderRadius: '12px', background: VARS.bgMain, fontSize: '14px', color: VARS.textSecondary }}>
          The results have been sent to the hiring team.
        </div>
      </div>
    </div>
  );

  const startAssessment = () => {
    sessionStorage.setItem('candidateToken', token);
    sessionStorage.setItem('candidateAssignmentId', assignment.id);
    sessionStorage.setItem('isCandidate', 'true');
    
    const routeMap = { 'BIG_FIVE': '/big-five', 'KARASEK': '/karasek', 'MASLACH': '/maslach', 'DISC': '/disc' };
    const targetRoute = routeMap[assignment.template.code] || '/big-five';
    navigate(targetRoute);
  };

  return (
    <div style={styles.container}>
      <style>{`.spin { animation: spin 1s linear infinite; } @keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
      
      <div style={styles.mainWrapperCard}>
        {/* Hero Banner */}
        <div style={styles.heroSection}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <div style={styles.heroIconBox}>
              <ClipboardCheck size={36} strokeWidth={2.5} />
            </div>
            <div>
              <h1 style={{ fontSize: "32px", fontWeight: "800", color: VARS.textPrimary, margin: "0 0 4px 0" }}>
                {assignment.template.name}
              </h1>
              <p style={{ fontSize: "16px", color: VARS.textSecondary, margin: "0" }}>
                Invitation from the Recruitment Team
              </p>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '12px', fontWeight: '800', color: VARS.primary, background: `${VARS.primary}15`, padding: '6px 12px', borderRadius: '8px', textTransform: 'uppercase' }}>
              Reference: {assignment.template.code}
            </span>
          </div>
        </div>

        <div style={styles.contentBody}>
          {/* Left Column: Instructions */}
          <div style={styles.mainContent}>
            <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '20px' }}>
              Welcome, {assignment.recruitee.first_name || 'Candidate'}
            </h2>
            <p style={{ fontSize: '16px', color: VARS.textSecondary, lineHeight: '1.8', marginBottom: '32px' }}>
              You have been invited to participate in a psychometric evaluation. This tool helps us understand your unique working style and strengths to ensure a great fit for the team. 
              The process is intuitive and typically takes 5-10 minutes.
            </p>

            <div style={{ ...styles.infoCard, borderLeft: `4px solid ${VARS.primary}`, background: `${VARS.primary}05`, marginBottom: '40px' }}>
              <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700', marginBottom: '12px' }}>
                <Clock size={18} color={VARS.primary} /> Before you begin:
              </h4>
              <ul style={{ margin: 0, paddingLeft: '20px', color: VARS.textSecondary, fontSize: '14px', lineHeight: '2' }}>
                <li>Ensure you are in a quiet environment without distractions.</li>
                <li>There are no right or wrong answers; please be as authentic as possible.</li>
                <li>Your progress will be saved automatically as you go.</li>
              </ul>
            </div>

            <button style={styles.btn('primary')} onClick={startAssessment}>
              Get Started <ArrowRight size={20} />
            </button>
          </div>

          {/* Right Column: Sidebar Meta */}
          <div style={styles.sidebar}>
            <div style={styles.infoCard}>
              <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: '800', textTransform: 'uppercase', color: VARS.textSecondary, marginBottom: '20px' }}>
                <User size={16} /> Candidate Profile
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase' }}>Full Name</label>
                  <p style={{ margin: 0, fontWeight: '600' }}>{assignment.recruitee.first_name} {assignment.recruitee.last_name}</p>
                </div>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase' }}>Invitation Date</label>
                  <p style={{ margin: 0, fontWeight: '600' }}>{new Date(assignment.assigned_at).toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            <div style={styles.infoCard}>
               <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: '800', textTransform: 'uppercase', color: VARS.textSecondary, marginBottom: '16px' }}>
                <ShieldCheck size={16} /> Privacy & Trust
              </h4>
              <p style={{ fontSize: '12px', color: VARS.textSecondary, lineHeight: '1.6', margin: 0 }}>
                This link is unique to your application. Results are confidential and only shared with authorized recruitment personnel.
              </p>
            </div>

            <div style={{ textAlign: 'center', opacity: 0.5 }}>
              <p style={{ fontSize: '11px' }}>Powered by Psychometric Assessment Suite</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TakeAssessment;