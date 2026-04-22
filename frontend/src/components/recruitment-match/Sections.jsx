import React from "react";
import ReactDOM from "react-dom";
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
import PaginationControls from "../shared/PaginationControls";

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
  jobsTotalCount = 0,
  jobsQuery,
  setJobsQuery,
  jobsStatusFilter,
  setJobsStatusFilter,
  jobsPage,
  jobsTotalPages,
  onJobsPageChange,
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
      <div
        style={{
          padding: "14px 20px",
          borderBottom: `1px solid ${COLORS.borderColor}`,
          display: "flex",
          justifyContent: "space-between",
          gap: 12,
          flexWrap: "nowrap",
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "nowrap", flex: 1 }}>
          <input
            style={{ ...styles.input, width: 360, margin: 0 }}
            placeholder="Filter jobs by title/description"
            value={jobsQuery}
            onChange={(e) => setJobsQuery(e.target.value)}
          />
          <select
            style={{ ...styles.input, width: 190, margin: 0 }}
            value={jobsStatusFilter}
            onChange={(e) => setJobsStatusFilter(e.target.value)}
          >
            <option value="all">All statuses</option>
            <option value="active">Active</option>
            <option value="draft">Draft</option>
            <option value="closed">Closed</option>
          </select>
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center", flexShrink: 0 }}>
          <span style={{ fontSize: 12, color: COLORS.textSecondary }}>
            {jobsTotalCount} job{jobsTotalCount === 1 ? "" : "s"}
          </span>
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
                  <td style={{ padding: "14px 20px", fontSize: 13 }}>
                    <StatusBadge status={job.status} />
                  </td>
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
      <div
        style={{
          padding: "12px 20px",
          borderTop: `1px solid ${COLORS.borderColor}`,
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
        }}
      >
        <PaginationControls
          page={jobsPage}
          totalPages={jobsTotalPages}
          onPageChange={onJobsPageChange}
          styles={styles}
          colors={COLORS}
        />
      </div>
    </div>
  );
}

export function SearchBar({ q, setQ, pipelineStatusFilter, setPipelineStatusFilter, openHistory }) {
  return (
    <div className="search-wrap" style={{ position: "relative", marginBottom: "32px", display: "flex", gap: "12px", alignItems: "center", flexWrap: "nowrap" }}>
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
      <select
        style={{ ...styles.input, width: 190, margin: 0, flexShrink: 0 }}
        value={pipelineStatusFilter}
        onChange={(e) => setPipelineStatusFilter(e.target.value)}
      >
        <option value="all">All statuses</option>
        <option value="pending">Pending</option>
        <option value="invited">Invited</option>
        <option value="in_progress">In Progress</option>
        <option value="completed">Completed</option>
        <option value="hired">Hired</option>
        <option value="rejected">Rejected</option>
      </select>
      <button
        style={{ ...styles.btnPrimary, backgroundColor: COLORS.dark, height: "46px", flexShrink: 0 }}
        onClick={openHistory}
      >
        <History size={18} /> Archived Candidates
      </button>
    </div>
  );
}

export function PipelineSection({
  selectedMatchCandidate,
  pipelineLoading,
  pipelineTotalCount = 0,
  pipelinePage,
  pipelineTotalPages,
  onPipelinePageChange,
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
  handleExplainScore,
  explainingCandidateId,
  handleCandidateCsvUpload,
  openAddModal,
  handleChangeStatus,
  q,
  setQ,
  pipelineStatusFilter,
  setPipelineStatusFilter,
  openHistory,
}) {
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = React.useState(false);
  const [statusDropdownPosition, setStatusDropdownPosition] = React.useState({
    top: 0,
    left: 0,
    width: 180,
    openUp: false,
  });
  const statusButtonRef = React.useRef(null);

  const pageCandidateIds = React.useMemo(
    () => filtered.map((candidate) => candidate.candidate_id),
    [filtered]
  );

  const allPageSelected =
    pageCandidateIds.length > 0 &&
    pageCandidateIds.every((candidateId) => selectedIds.includes(candidateId));

  const updateStatusMenuPosition = React.useCallback(() => {
    const button = statusButtonRef.current;
    if (!button) {
      return;
    }
    const rect = button.getBoundingClientRect();
    const estimatedMenuHeight = 260;
    const openUp = window.innerHeight - rect.bottom < estimatedMenuHeight;
    setStatusDropdownPosition({
      top: openUp ? rect.top - 8 : rect.bottom + 8,
      left: Math.max(8, rect.right - 180),
      width: Math.max(rect.width, 180),
      openUp,
    });
  }, []);

  React.useEffect(() => {
    if (!isStatusDropdownOpen) {
      return;
    }

    updateStatusMenuPosition();
    const handleViewportChange = () => updateStatusMenuPosition();

    window.addEventListener("resize", handleViewportChange);
    window.addEventListener("scroll", handleViewportChange, true);
    return () => {
      window.removeEventListener("resize", handleViewportChange);
      window.removeEventListener("scroll", handleViewportChange, true);
    };
  }, [isStatusDropdownOpen, updateStatusMenuPosition]);

  return (
    <div className="pipeline-card" style={{ ...styles.card, marginBottom: "56px", overflow: "visible" }}>
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
        <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap", justifyContent: "flex-end" }}>
          <span style={{ fontSize: 12, color: COLORS.textSecondary }}>
            {pipelineTotalCount} candidate{pipelineTotalCount === 1 ? "" : "s"}
          </span>
          {selectedIds.length > 0 ? (
            <>
              <div>
                <button
                  ref={statusButtonRef}
                  style={{
                    ...styles.btnPrimary,
                    backgroundColor: "white",
                    color: COLORS.primary,
                    border: `1px solid ${COLORS.primary}`,
                  }}
                  onClick={() => {
                    if (isStatusDropdownOpen) {
                      setIsStatusDropdownOpen(false);
                      return;
                    }
                    updateStatusMenuPosition();
                    setIsStatusDropdownOpen(true);
                  }}
                >
                  <ChevronDown size={16} /> Change Status
                </button>
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
      <div
        style={{
          padding: "14px 20px",
          borderBottom: `1px solid ${COLORS.borderColor}`,
          display: "flex",
          justifyContent: "space-between",
          gap: 12,
          flexWrap: "nowrap",
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "nowrap", flex: 1 }}>
          <input
            style={{ ...styles.input, width: 360, margin: 0 }}
            placeholder="Search candidates by name, email, or role..."
            value={q}
            onChange={(e) => setQ && setQ(e.target.value)}
          />
          <select
            style={{ ...styles.input, width: 190, margin: 0 }}
            value={pipelineStatusFilter}
            onChange={(e) => setPipelineStatusFilter && setPipelineStatusFilter(e.target.value)}
          >
            <option value="all">All statuses</option>
            <option value="pending">Pending</option>
            <option value="invited">Invited</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="hired">Hired</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center", flexShrink: 0 }}>
          <button
            style={{ ...styles.btnPrimary, backgroundColor: COLORS.dark }}
            onClick={() => openHistory && openHistory()}
          >
            <History size={16} /> Archived Candidates
          </button>
        </div>
      </div>
      {isStatusDropdownOpen
        ? ReactDOM.createPortal(
            <>
              <div
                style={{ position: "fixed", inset: 0, zIndex: 9998 }}
                onClick={() => setIsStatusDropdownOpen(false)}
              />
              <div
                style={{
                  position: "fixed",
                  top: statusDropdownPosition.top,
                  left: statusDropdownPosition.left,
                  width: statusDropdownPosition.width,
                  backgroundColor: "white",
                  border: `1px solid ${COLORS.borderColor}`,
                  borderRadius: "8px",
                  boxShadow: "0 10px 24px rgba(15, 23, 42, 0.18)",
                  zIndex: 9999,
                  display: "flex",
                  flexDirection: "column",
                  padding: "8px",
                  gap: "4px",
                  transform: statusDropdownPosition.openUp ? "translateY(-100%)" : "none",
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
                      alignItems: "center",
                    }}
                  >
                    <StatusBadge status={status} />
                  </div>
                ))}
              </div>
            </>,
            document.body
          )
        : null}
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
                  checked={allPageSelected}
                  onChange={(e) => {
                    if (setSelectedIds) {
                      if (e.target.checked) {
                        const nextIds = new Set(selectedIds);
                        pageCandidateIds.forEach((candidateId) => nextIds.add(candidateId));
                        setSelectedIds(Array.from(nextIds));
                      } else {
                        setSelectedIds(
                          selectedIds.filter(
                            (candidateId) => !pageCandidateIds.includes(candidateId)
                          )
                        );
                      }
                    }
                  }}
                  title="Select all"
                />
              </th>
              {["Candidate", "Role", "Status", "Score", "CV Match", "Actions"].map((h) => (
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
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: "18px 20px", color: COLORS.textSecondary }}>
                  No candidates found for the current filters.
                </td>
              </tr>
            ) : (
            filtered.map((c) => {
              const rowId = c.candidate_id;
              const explainDisabled = !c.latest_match_id || explainingCandidateId === c.candidate_id;
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
                        if (e.target.checked) {
                          if (!selectedIds.includes(rowId)) {
                            setSelectedIds([...selectedIds, rowId]);
                          }
                        } else {
                          setSelectedIds(selectedIds.filter((id) => id !== rowId));
                        }
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
                <td style={{ padding: "16px 20px", minWidth: 120 }}>
                  <div style={{ display: "flex", justifyContent: "flex-start", alignItems: "center", gap: 8 }}>
                    <div
                      style={{ fontWeight: "700", color: COLORS.primary, marginRight: 8 }}
                      title={`Overall Rank: ${Number(c.overall_score || 0).toFixed(1)}%\nCV Fit: ${Number(c.cv_score || 0).toFixed(1)}%\nAssessment Composite: ${Number(c.assessment_score || 0).toFixed(1)}%\nCompletion: ${Number(c.completion_score || 0).toFixed(1)}%`}
                    >
                      {c.overall_score !== undefined ? `${Number(c.overall_score || 0).toFixed(1)}%` : "-"}
                    </div>
                    <button
                      style={{
                        border: `1px solid ${explainDisabled ? "#d1d5db" : "#86efac"}`,
                        backgroundColor: explainDisabled ? "#f8fafc" : "#f0fdf4",
                        color: explainDisabled ? COLORS.textMuted : "#15803d",
                        borderRadius: 8,
                        padding: "5px 9px",
                        fontSize: 11,
                        fontWeight: 700,
                        cursor: explainDisabled ? "not-allowed" : "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4,
                        flexShrink: 0,
                      }}
                      onClick={() => handleExplainScore && handleExplainScore(c)}
                      disabled={explainDisabled}
                      title={
                        c.latest_match_id
                          ? "Generate or open cached ranking explanation"
                          : "Run CV match before generating explanation"
                      }
                    >
                      {explainingCandidateId === c.candidate_id ? (
                        <Loader2 className="spin" size={12} />
                      ) : (
                        <FileText size={12} />
                      )}
                      {explainingCandidateId === c.candidate_id ? "Preparing..." : "Explain"}
                    </button>
                  </div>
                </td>
                <td style={{ padding: "16px 20px", minWidth: 220 }}>
                  {!c.has_history ? (
                    <span style={{ fontSize: 12, color: COLORS.textSecondary }}>
                      No CV match history yet.
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
                          {c.history_count} match{c.history_count === 1 ? "" : "es"}
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
            }))}
          </tbody>
        </table>
      </div>
      <div
        style={{
          padding: "12px 20px",
          borderTop: `1px solid ${COLORS.borderColor}`,
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
        }}
      >
        <PaginationControls
          page={pipelinePage}
          totalPages={pipelineTotalPages}
          onPageChange={onPipelinePageChange}
          styles={styles}
          colors={COLORS}
        />
      </div>
    </div>
  );
}

export function AIMatcherSection({
  selectedMatchCandidate,
  selectedIds,
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
  matchProgress,
  onDropResumeFiles,
  dropUploadLoading,
  dropUploadItems,
  onDeleteDroppedUploadedCv,
  dropUploadDeletingIds,
}) {
  const selectedCandidateCount = Array.isArray(selectedIds) ? selectedIds.length : 0;
  const isBatchMode = selectedCandidateCount > 0;
  const dropReadyCount = Array.isArray(dropUploadItems)
    ? dropUploadItems.filter((item) => item?.status === "uploaded" && item?.candidateId && item?.cvId).length
    : 0;
  const isDropQueueMode = !isBatchMode && !selectedMatchCandidate && dropReadyCount > 0;
  const canAnalyze = Boolean(
    selectedJobId &&
      (isBatchMode
        ? selectedCandidateCount > 0
        : (selectedMatchCandidate && selectedMatchCv) || isDropQueueMode)
  );
  const [isResumeDropActive, setIsResumeDropActive] = React.useState(false);

  const handleResumeFiles = React.useCallback(
    (fileList) => {
      if (!onDropResumeFiles) {
        return;
      }
      onDropResumeFiles(fileList);
    },
    [onDropResumeFiles]
  );

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
            1. Candidate CV Source
          </h3>

          <div
            onDragOver={(event) => {
              event.preventDefault();
              setIsResumeDropActive(true);
            }}
            onDragLeave={(event) => {
              event.preventDefault();
              setIsResumeDropActive(false);
            }}
            onDrop={(event) => {
              event.preventDefault();
              setIsResumeDropActive(false);
              handleResumeFiles(event.dataTransfer?.files);
            }}
            style={{
              border: `2px dashed ${isResumeDropActive ? COLORS.primary : COLORS.borderColor}`,
              borderRadius: 12,
              padding: "14px 12px",
              backgroundColor: isResumeDropActive ? "#eff6ff" : "#f8fafc",
              display: "grid",
              gap: 8,
            }}
          >
            <div style={{ fontSize: 13, color: COLORS.textSecondary, lineHeight: 1.4, display: "grid", gap: 2 }}>
              <span>
                {selectedMatchCandidate
                  ? `Drop one or more resumes for ${selectedMatchCandidate.name} named firstname_lastname.pdf.`
                  : "Drop one or more resumes named firstname_lastname.pdf."}
              </span>
              <span>Or browse files from your device.</span>
            </div>
            <input
              type="file"
              multiple
              accept=".pdf,.txt"
              style={styles.input}
              onChange={(event) => {
                handleResumeFiles(event.target.files);
                event.target.value = "";
              }}
            />
          </div>

          {(dropUploadLoading || (Array.isArray(dropUploadItems) && dropUploadItems.length > 0)) ? (
            <div
              style={{
                border: `1px solid ${COLORS.borderColor}`,
                borderRadius: 10,
                backgroundColor: "white",
                padding: 10,
                display: "grid",
                gap: 8,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                <strong style={{ fontSize: 12, color: COLORS.textPrimary }}>
                  Resume Upload Queue
                </strong>
                {dropUploadLoading ? (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, color: COLORS.textSecondary }}>
                    <Loader2 className="spin" size={12} /> Uploading...
                  </span>
                ) : null}
              </div>

              {dropReadyCount > 0 ? (
                <div
                  style={{
                    fontSize: 12,
                    color: COLORS.primary,
                    backgroundColor: "#eff6ff",
                    border: `1px solid ${COLORS.primary}33`,
                    borderRadius: 8,
                    padding: "7px 9px",
                  }}
                >
                  {dropReadyCount} uploaded resume{dropReadyCount === 1 ? "" : "s"} ready for matching.
                </div>
              ) : null}

              <div style={{ display: "grid", gap: 6, maxHeight: 280, overflowY: "auto", paddingRight: 2 }}>
                {(dropUploadItems || []).slice(0, 14).map((item) => {
                  const isUploading = item.status === "uploading";
                  const isUploaded = item.status === "uploaded";
                  const isProblem = item.status === "failed" || item.status === "skipped";
                  const isDeleting = (dropUploadDeletingIds || []).includes(item.id);

                  return (
                    <div
                      key={item.id}
                      style={{
                        border: `1px solid ${COLORS.borderColor}`,
                        borderRadius: 8,
                        padding: "7px 9px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 10,
                      }}
                    >
                      <div style={{ minWidth: 0 }}>
                        <div
                          title={item.fileName}
                          style={{
                            fontSize: 12,
                            fontWeight: 600,
                            color: COLORS.textPrimary,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {item.fileName}
                        </div>
                        <div style={{ fontSize: 11, color: COLORS.textSecondary }}>
                          {item.candidateName ? `${item.candidateName} - ` : ""}
                          {item.message || item.status}
                        </div>
                      </div>
                      <div style={{ display: "inline-flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                        {isUploading ? (
                          <Loader2 className="spin" size={12} color={COLORS.primary} />
                        ) : (
                          <span
                            style={{
                              width: 10,
                              height: 10,
                              borderRadius: "50%",
                              backgroundColor: isUploaded ? "#16a34a" : isProblem ? "#dc2626" : "#64748b",
                              display: "inline-block",
                            }}
                          />
                        )}
                        <span style={{ fontSize: 11, color: COLORS.textSecondary, textTransform: "capitalize" }}>
                          {item.status}
                        </span>
                        {isUploaded && item.cvId ? (
                          <button
                            type="button"
                            onClick={() => onDeleteDroppedUploadedCv && onDeleteDroppedUploadedCv(item)}
                            disabled={isDeleting}
                            style={{
                              border: "none",
                              background: "none",
                              color: COLORS.red,
                              cursor: isDeleting ? "not-allowed" : "pointer",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 4,
                              padding: 0,
                              fontSize: 11,
                              fontWeight: 700,
                            }}
                            title={`Delete uploaded CV #${item.cvId}`}
                          >
                            {isDeleting ? <Loader2 className="spin" size={12} /> : <Trash2 size={12} />}
                            {isDeleting ? "Deleting" : "Delete"}
                          </button>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null}

          {isBatchMode ? (
            <>
              <div
                style={{
                  backgroundColor: "#eff6ff",
                  border: `1px solid ${COLORS.primary}33`,
                  borderRadius: 10,
                  padding: 12,
                  fontSize: 13,
                  color: COLORS.textSecondary,
                  lineHeight: 1.45,
                }}
              >
                <strong style={{ color: COLORS.primary }}>
                  Batch mode enabled for {selectedCandidateCount} selected candidate{selectedCandidateCount === 1 ? "" : "s"}.
                </strong>
                <div style={{ marginTop: 6 }}>
                  We will use each candidate's active CV (or latest uploaded CV). Candidates without a CV are skipped.
                </div>
              </div>

              <p style={{ margin: 0, fontSize: 13, color: COLORS.textSecondary }}>
                Use the candidate row <FileText size={13} color={COLORS.dark} /> action to open CV manager and upload resumes before running.
              </p>

              {selectedMatchCandidate ? (
                <button
                  style={{ ...styles.btnPrimary, backgroundColor: COLORS.dark, width: "fit-content" }}
                  onClick={() => openCvManager(selectedMatchCandidate)}
                >
                  <Upload size={16} /> Manage CVs For Highlighted Candidate
                </button>
              ) : null}
            </>
          ) : !selectedMatchCandidate ? (
            <p style={{ margin: 0, fontSize: 13, color: COLORS.textSecondary, display: "flex", alignItems: "center", gap: 4 }}>
              {dropReadyCount > 0
                ? "Dropped resumes are ready. Select a job and click Calculate Match Fit."
                : "Pick a candidate from the list using the "}
              {dropReadyCount > 0 ? null : <Brain size={14} color={COLORS.primary} />} {dropReadyCount > 0 ? null : "button under the 'Actions' column."}
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
          !canAnalyze
        }
        style={{
          ...styles.btnPrimary,
          width: "100%",
          marginTop: "20px",
          justifyContent: "center",
          backgroundColor: COLORS.dark,
          padding: "14px",
          opacity: canAnalyze ? 1 : 0.6,
          cursor: canAnalyze ? "pointer" : "not-allowed",
        }}
      >
        {matchLoading ? (
          <Loader2 className="spin" size={18} />
        ) : (
          <BarChart3 size={18} />
        )}
        {matchLoading
          ? isBatchMode
            ? `Processing ${matchProgress?.completed || 0}/${matchProgress?.total || selectedCandidateCount}`
            : "Analyzing..."
          : isBatchMode
            ? `Calculate Match Fit For ${selectedCandidateCount} CV${selectedCandidateCount === 1 ? "" : "s"}`
            : isDropQueueMode
              ? `Calculate Match Fit For ${dropReadyCount} Uploaded CV${dropReadyCount === 1 ? "" : "s"}`
            : "Calculate Match Fit"}
      </button>

      {matchProgress?.visible ? (
        <div
          style={{
            ...styles.card,
            marginTop: 14,
            padding: 14,
            display: "grid",
            gap: 8,
            border: `1px solid ${COLORS.primary}44`,
            backgroundColor: "#f8fbff",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
            <strong style={{ fontSize: 13, color: COLORS.textPrimary }}>
              {matchProgress.stage || "Processing..."}
            </strong>
            <span style={{ fontSize: 12, color: COLORS.textSecondary }}>
              {matchProgress.completed}/{matchProgress.total} completed
            </span>
          </div>
          {matchProgress.currentLabel ? (
            <div style={{ fontSize: 12, color: COLORS.textSecondary }}>
              Current: {matchProgress.currentLabel}
            </div>
          ) : null}
          <div style={{ width: "100%", height: 8, borderRadius: 999, backgroundColor: "#dbeafe", overflow: "hidden" }}>
            <div
              style={{
                width: `${Math.min(Math.max(Number(matchProgress.percent || 0), 0), 100)}%`,
                height: "100%",
                backgroundColor: COLORS.primary,
                transition: "width 0.25s ease",
              }}
            />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: COLORS.textSecondary }}>
            <span>{Number(matchProgress.percent || 0).toFixed(0)}%</span>
            <span>
              Success: {matchProgress.successCount || 0} | Failed/Skipped: {matchProgress.failureCount || 0}
            </span>
          </div>
        </div>
      ) : null}

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
