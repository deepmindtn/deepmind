import React from "react";
import {
  Plus,
  Search,
  Users,
  FileText,
  Loader2,
  Eye,
  Send,
  Edit2,
  Trash2,
  Clock,
  History,
  Brain,
  Upload,
  BarChart3,
  ChevronDown,
} from "lucide-react";
import { StatusBadge } from "./Shared";
import { COLORS, styles } from "./Constants";

export function RecruitmentMatchHeader() {
  return (
    <div
      className="page-header"
      style={{
        ...styles.sectionHeader,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <div className="header-title-block" style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <div
          style={{
            padding: "10px",
            backgroundColor: COLORS.primaryLight,
            borderRadius: "12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Users size={28} color={COLORS.primary} />
        </div>

        <div>
          <h1 style={{ fontSize: "32px", fontWeight: "800", margin: 0 }}>
            Talent Matching
          </h1>
          <p
            style={{
              color: COLORS.textSecondary,
              fontSize: "16px",
              margin: 0,
            }}
          >
            Centralized candidate management and AI assessment hub.
          </p>
        </div>
      </div>
    </div>
  );
}

export function JobOfferingsSection({
  jobsLoading,
  jobs,
  selectedJob,
  selectedJobId,
  setSelectedJobId,
  openEditJobModal,
  handleDeleteJob,
  openCreateJobModal,
  handleJobCsvUpload,
}) {
  return (
    <div className="pipeline-card" style={{ ...styles.card, marginBottom: "24px" }}>
      <div
        style={{
          padding: "20px",
          borderBottom: `1px solid ${COLORS.borderColor}`,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <FileText size={20} color={COLORS.primary} />
          <span style={{ fontWeight: 700 }}>Job Offerings</span>
          {selectedJob && (
            <span style={{ fontSize: 12, color: COLORS.textSecondary }}>
              Selected: {selectedJob.title}
            </span>
          )}
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <div>
            <input
              type="file"
              accept=".csv"
              id="job-csv-upload"
              style={{ display: "none" }}
              onChange={handleJobCsvUpload}
            />
            <label
              htmlFor="job-csv-upload"
              style={{
                ...styles.btnPrimary,
                backgroundColor: "white",
                color: COLORS.primary,
                border: `1px solid ${COLORS.primary}`,
                cursor: "pointer",
                margin: 0,
              }}
            >
              <Upload size={16} /> Import CSV
            </label>
          </div>
          <button
            style={{ ...styles.btnPrimary, backgroundColor: COLORS.dark }}
            onClick={openCreateJobModal}
          >
            <Plus size={16} /> New Job
          </button>
        </div>
      </div>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
          <thead style={{ backgroundColor: COLORS.tableRow }}>
            <tr>
              {[
                "Select",
                "Title",
                "Status",
                "Description",
                "Actions",
              ].map((h) => (
                <th
                  key={h}
                  style={{
                    padding: "14px 20px",
                    color: COLORS.textSecondary,
                    fontSize: "12px",
                    fontWeight: "600",
                    textTransform: "uppercase",
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {jobsLoading ? (
              <tr>
                <td colSpan={5} style={{ padding: "18px 20px", color: COLORS.textSecondary }}>
                  Loading job offerings...
                </td>
              </tr>
            ) : jobs.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: "18px 20px", color: COLORS.textSecondary }}>
                  No job offerings created yet.
                </td>
              </tr>
            ) : (
              jobs.map((job) => (
                <tr key={job.id} style={{ borderBottom: `1px solid ${COLORS.borderColor}` }}>
                  <td style={{ padding: "14px 20px" }}>
                    <input
                      type="checkbox"
                      checked={String(selectedJobId) === String(job.id)}
                      onChange={() =>
                        setSelectedJobId((prev) =>
                          String(prev) === String(job.id)
                            ? ""
                            : String(job.id)
                        )
                      }
                    />
                  </td>
                  <td style={{ padding: "14px 20px", fontWeight: 600 }}>{job.title}</td>
                  <td style={{ padding: "14px 20px", fontSize: 13 }}>{job.status}</td>
                  <td style={{ padding: "14px 20px", fontSize: 13, color: COLORS.textSecondary }}>
                    {(job.description || "").slice(0, 160)}
                    {(job.description || "").length > 160 ? "..." : ""}
                  </td>
                  <td style={{ padding: "14px 20px" }}>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button
                        onClick={() => openEditJobModal(job)}
                        style={{
                          border: "none",
                          background: "none",
                          cursor: "pointer",
                          color: COLORS.textMuted,
                        }}
                        title="Edit Job"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteJob(job.id)}
                        style={{
                          border: "none",
                          background: "none",
                          cursor: "pointer",
                          color: COLORS.red,
                        }}
                        title="Delete Job"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function SearchBar({ q, setQ, openHistory }) {
  return (
    <div className="search-wrap" style={{ position: "relative", marginBottom: "32px", display: "flex", gap: "12px", alignItems: "center" }}>
      <div style={{ position: "relative", flex: 1 }}>
        <Search
          size={18}
          style={{
            position: "absolute",
            left: "14px",
            top: "14px",
            color: COLORS.textMuted,
          }}
        />
        <input
          style={{
            ...styles.input,
            paddingLeft: "44px",
            backgroundColor: COLORS.cardBg,
            color: COLORS.textPrimary,
            margin: 0,
            width: "100%",
            boxSizing: "border-box"
          }}
          placeholder="Search candidates by name, email, or role..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>
      <button
        style={{ ...styles.btnPrimary, backgroundColor: COLORS.dark, height: "46px" }}
        onClick={openHistory}
      >
        <History size={18} /> History
      </button>
    </div>
  );
}

export function PipelineSection({
  selectedMatchCandidate,
  pipelineLoading,
  filtered,
  handleToggleMatchCandidate,
  selectedIds = [],
  setSelectedIds,
  historyDetailLoading,
  handleViewMatchDetail,
  handleOpenMatchHistory,
  handleViewAssignments,
  setAssignRow,
  setSelectedCodes,
  setAssignOpen,
  openCvManager,
  openEditModal,
  setDeleteId,
  setDeleteOpen,
  handleCandidateCsvUpload,
  openAddModal,
  handleChangeStatus,
}) {
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = React.useState(false);

  return (
    <div className="pipeline-card" style={{ ...styles.card, marginBottom: "56px" }}>
      <div
        className="pipeline-card-header"
        style={{
          padding: "20px",
          borderBottom: `1px solid ${COLORS.borderColor}`,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "10px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <Users size={20} color={COLORS.primary} />
          <span style={{ fontWeight: "700" }}>
            Candidates
          </span>
          {selectedMatchCandidate && (
            <span style={{ fontSize: "12px", color: COLORS.textSecondary }}>
              (Selected for matching: {selectedMatchCandidate.name})
            </span>
          )}
          {pipelineLoading && (
            <Loader2 className="spin" size={14} color={COLORS.textSecondary} />
          )}
        </div>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          {selectedIds.length > 0 ? (
            <>
              <div style={{ position: "relative" }}>
                <button
                  style={{
                    ...styles.btnPrimary,
                    backgroundColor: "white",
                    color: COLORS.primary,
                    border: `1px solid ${COLORS.primary}`,
                  }}
                  onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                >
                  <ChevronDown size={16} /> Change Status
                </button>
                {isStatusDropdownOpen && (
                  <div
                    style={{
                      position: "absolute",
                      top: "100%",
                      right: 0,
                      marginTop: "8px",
                      backgroundColor: "white",
                      border: `1px solid ${COLORS.borderColor}`,
                      borderRadius: "8px",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                      zIndex: 10,
                      minWidth: "160px",
                      display: "flex",
                      flexDirection: "column",
                      padding: "8px",
                      gap: "4px",
                    }}
                  >
                    {["pending", "invited", "in_progress", "completed", "hired", "rejected"].map((status) => (
                      <div
                        key={status}
                        onClick={() => {
                          handleChangeStatus(status);
                          setIsStatusDropdownOpen(false);
                        }}
                        style={{
                          padding: "6px",
                          cursor: "pointer",
                          borderRadius: "4px",
                          display: "flex",
                          alignItems: "center"
                        }}
                      >
                        <StatusBadge status={status} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <button
                style={styles.btnBulk}
                onClick={() => {
                  setAssignRow(null);
                  setSelectedCodes([]);
                  setAssignOpen(true);
                }}
              >
                <Send size={16} /> Send Assessment to {selectedIds.length} Selected
              </button>
            </>
          ) : (
            <>
              <div>
                <input
                  type="file"
                  accept=".csv"
                  id="candidate-csv-upload"
                  style={{ display: "none" }}
                  onChange={handleCandidateCsvUpload}
                />
                <label
                  htmlFor="candidate-csv-upload"
                  style={{
                    ...styles.btnPrimary,
                    backgroundColor: "white",
                    color: COLORS.primary,
                    border: `1px solid ${COLORS.primary}`,
                    cursor: "pointer",
                    margin: 0,
                  }}
                >
                  <Upload size={16} /> Import CSV
                </label>
              </div>
              <button style={styles.btnPrimary} onClick={openAddModal}>
                <Plus size={16} /> Add Candidate
              </button>
            </>
          )}
        </div>
      </div>
      <div className="pipeline-table-wrap" style={{ overflowX: "auto" }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            textAlign: "left",
          }}
        >
          <thead style={{ backgroundColor: COLORS.tableRow }}>
            <tr>
              <th style={{ padding: "16px 20px", width: "40px" }}>
                <input
                  type="checkbox"
                  style={styles.checkbox}
                  checked={filtered.length > 0 && selectedIds.length === filtered.length}
                  onChange={(e) => {
                    if (setSelectedIds) {
                      setSelectedIds(e.target.checked ? filtered.map((c) => c.candidate_id) : []);
                    }
                  }}
                  title="Select all"
                />
              </th>
              {["Candidate", "Role", "Status", "Score", "AI History", "Actions"].map((h) => (
                <th
                  key={h}
                  style={{
                    padding: "16px 20px",
                    color: COLORS.textSecondary,
                    fontSize: "12px",
                    fontWeight: "600",
                    textTransform: "uppercase",
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => {
              const rowId = c.candidate_id;
              return (
              <tr
                key={rowId}
                style={{
                  borderBottom: `1px solid ${COLORS.borderColor}`,
                  backgroundColor: selectedMatchCandidate?.id === c.candidate_id
                    ? "#eff6ff"
                    : "transparent",
                }}
              >
                <td style={{ padding: "16px 20px" }}>
                  <input
                    type="checkbox"
                    style={styles.checkbox}
                    checked={selectedIds?.includes(rowId) || false}
                    onChange={(e) => {
                      if (setSelectedIds) {
                        setSelectedIds(
                          e.target.checked
                            ? [...selectedIds, rowId]
                            : selectedIds.filter((id) => id !== rowId)
                        );
                      }
                    }}
                    title="Select candidate for bulk actions"
                  />
                </td>
                <td style={{ padding: "16px 20px" }}>
                  <div style={{ fontWeight: "600" }}>{c.candidate_name}</div>
                  <div
                    style={{
                      fontSize: "13px",
                      color: COLORS.textSecondary,
                    }}
                  >
                    {c.candidate_email}
                  </div>
                </td>
                <td style={{ padding: "16px 20px", fontSize: "14px" }}>
                  {c.position || "Not Specified"}
                </td>
                <td style={{ padding: "16px 20px" }}>
                  <StatusBadge status={c.stage || c.status} />
                </td>
                <td style={{ padding: "16px 20px" }}>
                  <div style={{ fontWeight: "700", color: COLORS.primary }} title={`Overall Rank: ${Number(c.overall_score || 0).toFixed(1)}%\nCV Fit: ${Number(c.cv_score || 0).toFixed(1)}%\nAssessments: ${Number(c.completion_score || 0).toFixed(1)}%`}>
                    {c.overall_score !== undefined ? `${Number(c.overall_score || 0).toFixed(1)}%` : "-"}
                  </div>
                </td>
                <td style={{ padding: "16px 20px", minWidth: 220 }}>
                  {!c.has_history ? (
                    <span style={{ fontSize: 12, color: COLORS.textSecondary }}>
                      No previous AI matches.
                    </span>
                  ) : (
                    <div style={{ display: "grid", gap: 8 }}>
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 4,
                            padding: "4px 8px",
                            borderRadius: 999,
                            fontSize: 11,
                            fontWeight: 600,
                            backgroundColor: "#eff6ff",
                            color: COLORS.primary,
                          }}
                        >
                          <Clock size={12} />
                          {c.latest_matched_at
                            ? new Date(c.latest_matched_at).toLocaleDateString()
                            : "Latest"}
                        </span>
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            padding: "4px 8px",
                            borderRadius: 999,
                            fontSize: 11,
                            fontWeight: 600,
                            backgroundColor: "#f8fafc",
                            color: COLORS.textSecondary,
                          }}
                        >
                          {c.history_count} attempt{c.history_count === 1 ? "" : "s"}
                        </span>
                      </div>
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        {c.latest_match_id && (
                          <button
                            style={{
                              border: `1px solid ${COLORS.primary}55`,
                              background: "white",
                              color: COLORS.primary,
                              borderRadius: 8,
                              padding: "5px 8px",
                              fontSize: 11,
                              fontWeight: 600,
                              cursor: "pointer",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 4,
                            }}
                            onClick={() => handleViewMatchDetail(c.latest_match_id, { id: c.candidate_id, name: c.candidate_name, email: c.candidate_email })}
                            disabled={historyDetailLoading}
                          >
                            <Eye size={12} />
                            View Latest
                          </button>
                        )}
                        {c.history_count > 0 && (
                          <button
                            style={{
                              border: `1px solid ${COLORS.borderColor}`,
                              background: "white",
                              color: COLORS.textPrimary,
                              borderRadius: 8,
                              padding: "5px 8px",
                              fontSize: 11,
                              fontWeight: 600,
                              cursor: "pointer",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 4,
                            }}
                            onClick={() => handleOpenMatchHistory({ id: c.candidate_id, name: c.candidate_name, email: c.candidate_email })}
                          >
                            <History size={12} />
                            History
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </td>
                <td style={{ padding: "16px 20px" }}>
                  <div className="pipeline-actions" style={{ display: "flex", gap: "8px" }}>
                    <button
                      onClick={() => handleToggleMatchCandidate({ id: c.candidate_id, name: c.candidate_name, email: c.candidate_email, position: c.position })}
                      style={{
                        border: "none",
                        background: "none",
                        cursor: "pointer",
                        color: selectedMatchCandidate?.id === c.candidate_id ? COLORS.primary : COLORS.textMuted,
                      }}
                      title="Analyze with AI Matcher"
                    >
                      <Brain size={16} />
                    </button>
                    <button
                      onClick={() => handleViewAssignments({ id: c.candidate_id, name: c.candidate_name, email: c.candidate_email })}
                      style={{
                        border: "none",
                        background: "none",
                        cursor: "pointer",
                        color: COLORS.purple,
                      }}
                      title="View Assignments"
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      onClick={() => {
                        setAssignRow({ id: c.candidate_id, name: c.candidate_name, email: c.candidate_email });
                        setSelectedCodes([]);
                        setAssignOpen(true);
                      }}
                      style={{
                        border: "none",
                        background: "none",
                        cursor: "pointer",
                        color: COLORS.blue,
                      }}
                      title="Send Assessment"
                    >
                      <Send size={16} />
                    </button>
                    <button
                      onClick={() => openCvManager({ id: c.candidate_id, name: c.candidate_name, email: c.candidate_email })}
                      style={{
                        border: "none",
                        background: "none",
                        cursor: "pointer",
                        color: COLORS.dark,
                      }}
                      title="Manage Candidate CVs"
                    >
                      <FileText size={16} />
                    </button>
                    <button
                      onClick={() => openEditModal({ id: c.candidate_id, email: c.candidate_email, first_name: c.candidate_name?.split(' ')[0], last_name: c.candidate_name?.split(' ').slice(1).join(' '), position: c.position, status: c.stage })}
                      style={{
                        border: "none",
                        background: "none",
                        cursor: "pointer",
                        color: COLORS.textMuted,
                      }}
                      title="Edit Candidate"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => {
                        setDeleteId(c.candidate_id);
                        setDeleteOpen(true);
                      }}
                      style={{
                        border: "none",
                        background: "none",
                        cursor: "pointer",
                        color: COLORS.red,
                      }}
                      title="Delete Candidate"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function AIMatcherSection({
  selectedMatchCandidate,
  selectedCandidateCvs,
  selectedMatchCv,
  setSelectedMatchCv,
  openCvManager,
  openCvPreview,
  selectedJob,
  jobDescription,
  analyzeMatches,
  matchLoading,
  selectedJobId,
  results,
  setResultModalFromHistory,
  setResultModalOpen,
}) {
  return (
    <div>
      <div
        className="ai-matcher-section-header"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          marginBottom: "24px",
        }}
      >
        <div
          style={{
            padding: "10px",
            backgroundColor: COLORS.primaryLight,
            borderRadius: "12px",
          }}
        >
          <Brain size={28} color={COLORS.primary} />
        </div>
        <h2
          style={{
            fontSize: "24px",
            fontWeight: "700",
            marginBottom: "0px",
          }}
        >
          AI CV Matcher
        </h2>
      </div>

      <div
        className="ai-matcher-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "24px",
        }}
      >
        <div
          className="ai-matcher-upload-card"
          style={{
            ...styles.card,
            padding: "24px",
            display: "flex",
            flexDirection: "column",
            gap: "14px",
          }}
        >
          <h3 style={{ fontSize: "16px", fontWeight: "600", margin: 0 }}>
            1. Selected Candidate Resume
          </h3>

          {!selectedMatchCandidate ? (
            <p style={{ margin: 0, fontSize: 13, color: COLORS.textSecondary, display: "flex", alignItems: "center", gap: 4 }}>
              Pick a candidate from the pipeline using the <Brain size={14} color={COLORS.primary} /> button.
            </p>
          ) : (
            <>
              <div
                style={{
                  backgroundColor: "#f8fafc",
                  borderRadius: 10,
                  padding: 12,
                  fontSize: 13,
                  color: COLORS.textSecondary,
                }}
              >
                <strong style={{ color: COLORS.textPrimary }}>
                  {selectedMatchCandidate.name}
                </strong>
                <div>{selectedMatchCandidate.email}</div>
                <div style={{ marginTop: 2 }}>
                  Role: {selectedMatchCandidate.position || "Not specified"}
                </div>
              </div>

              <div>
                <label style={styles.label}>Selected CV</label>
                <select
                  style={styles.input}
                  value={selectedMatchCv?.id || ""}
                  onChange={(e) => {
                    const cv = selectedCandidateCvs.find(
                      (item) => String(item.id) === String(e.target.value)
                    );
                    if (cv) {
                      setSelectedMatchCv(cv);
                    }
                  }}
                  disabled={selectedCandidateCvs.length === 0}
                >
                  <option value="">
                    {selectedCandidateCvs.length === 0
                      ? "No CVs uploaded for this candidate"
                      : "Select a candidate CV"}
                  </option>
                  {selectedCandidateCvs.map((cv) => (
                    <option key={cv.id} value={cv.id}>
                      CV #{cv.id} {cv.is_active ? "(Active)" : ""} - {new Date(
                        cv.uploaded_at
                      ).toLocaleDateString()}
                    </option>
                  ))}
                </select>
              </div>

              {selectedMatchCv && (
                <div
                  style={{
                    border: `1px solid ${COLORS.borderColor}`,
                    borderRadius: 10,
                    padding: 12,
                    fontSize: 13,
                  }}
                >
                  <div style={{ fontWeight: 600 }}>CV #{selectedMatchCv.id}</div>
                  <div style={{ color: COLORS.textSecondary }}>
                    Uploaded: {new Date(selectedMatchCv.uploaded_at).toLocaleString()}
                  </div>
                </div>
              )}

              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <button
                  style={{ ...styles.btnPrimary, backgroundColor: COLORS.dark }}
                  onClick={() => openCvManager(selectedMatchCandidate)}
                >
                  <Upload size={16} /> Manage Candidate CVs
                </button>
                <button
                  style={{
                    ...styles.btnPrimary,
                    backgroundColor: "white",
                    color: COLORS.primary,
                    border: `1px solid ${COLORS.primary}`,
                  }}
                  onClick={() => openCvPreview(selectedMatchCv)}
                  disabled={!selectedMatchCv}
                >
                  <Eye size={16} /> View Resume
                </button>
              </div>
            </>
          )}
        </div>

        <div
          className="ai-matcher-job-card"
          style={{
            ...styles.card,
            padding: "24px",
            display: "flex",
            flexDirection: "column",
            minHeight: 0,
          }}
        >
          <h3
            style={{
              fontSize: "16px",
              fontWeight: "600",
              marginBottom: "16px",
            }}
          >
            2. Selected Job Description {selectedJob ? `(${selectedJob.title})` : ""}
          </h3>
          {!selectedJob ? (
            <p style={{ marginTop: 0, color: COLORS.textSecondary, fontSize: 13 }}>
              Select one job offering from the Job Offerings table above.
            </p>
          ) : null}
          <textarea
            style={{
              ...styles.input,
              flex: 1,
              minHeight: "240px",
              height: "100%",
              resize: "none",
              backgroundColor: COLORS.cardBg,
              color: COLORS.textPrimary,
              overflowY: "auto",
            }}
            placeholder="Select a job offering to view its requirements..."
            value={jobDescription}
            readOnly
          />
        </div>
      </div>

      <button
        className="analyze-btn"
        onClick={analyzeMatches}
        disabled={
          matchLoading ||
          !selectedJobId ||
          !selectedMatchCandidate ||
          !selectedMatchCv
        }
        style={{
          ...styles.btnPrimary,
          width: "100%",
          marginTop: "20px",
          justifyContent: "center",
          backgroundColor: COLORS.dark,
          padding: "14px",
          opacity:
            !selectedJobId || !selectedMatchCandidate || !selectedMatchCv
              ? 0.6
              : 1,
          cursor:
            !selectedJobId || !selectedMatchCandidate || !selectedMatchCv
              ? "not-allowed"
              : "pointer",
        }}
      >
        {matchLoading ? (
          <Loader2 className="spin" size={18} />
        ) : (
          <BarChart3 size={18} />
        )}
        {matchLoading
          ? "Analyzing..."
          : "Calculate Match Fit"}
      </button>

      {results.length > 0 && (
        <div style={{ marginTop: "16px", display: "flex", justifyContent: "center" }}>
          <button
            style={{
              ...styles.btnPrimary,
              backgroundColor: "white",
              color: COLORS.primary,
              border: `1px solid ${COLORS.primary}`,
            }}
            onClick={() => {
              setResultModalFromHistory(false);
              setResultModalOpen(true);
            }}
          >
            <Eye size={16} /> Open Latest Match Result
          </button>
        </div>
      )}
    </div>
  );
}
