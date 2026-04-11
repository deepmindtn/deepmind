import React from "react";
import ReactDOM from "react-dom";
import {
  Loader2,
  Clock,
  Eye,
  CheckCircle,
  AlertTriangle,
  Send,
  ChevronDown,
  Check,
  X,
  FileText,
  Users,
} from "lucide-react";
import { Modal } from "./Shared";
import { ASSESSMENT_OPTIONS, COLORS, styles } from "./Constants";

export function HistoryModal({
  historyOpen,
  historyCandidate,
  setHistoryOpen,
  historyLoading,
  historyItems,
  archiveLoading,
  archiveItems,
  activeResult,
  historyDetailLoading,
  handleViewMatchDetail,
}) {
  const isArchiveView = !historyCandidate;

  return (
    <Modal
      open={historyOpen}
      title={
        historyCandidate
          ? `AI Match History - ${historyCandidate.name}`
          : "Archived Candidates Snapshot"
      }
      onClose={() => setHistoryOpen(false)}
      contentClassName="recruitment-match-modal-content"
      actions={
        <button style={styles.btnPrimary} onClick={() => setHistoryOpen(false)}>
          Close
        </button>
      }
    >
      {isArchiveView ? (
        archiveLoading ? (
          <div style={{ display: "flex", alignItems: "center", gap: 8, color: COLORS.textSecondary }}>
            <Loader2 className="spin" size={16} /> Loading archived candidates...
          </div>
        ) : archiveItems.length === 0 ? (
          <p style={{ margin: 0, color: COLORS.textSecondary, fontSize: 13 }}>
            No archived candidates (hired/rejected) found yet.
          </p>
        ) : (
          <div style={{ display: "grid", gap: 12, maxHeight: "60vh", overflowY: "auto", paddingRight: 2 }}>
            {archiveItems.map((item) => (
              <div
                key={item.candidate_id}
                style={{
                  border: `1px solid ${COLORS.borderColor}`,
                  borderRadius: 10,
                  padding: 12,
                  backgroundColor: "white",
                  display: "grid",
                  gap: 8,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.textPrimary }}>
                      {item.candidate_name}
                    </div>
                    <div style={{ fontSize: 12, color: COLORS.textSecondary }}>
                      {item.candidate_email}
                    </div>
                    <div style={{ fontSize: 12, color: COLORS.textSecondary }}>
                      Role: {item.position || "Not specified"}
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 12, fontWeight: 700, textTransform: "capitalize", color: item.status === "hired" ? "#047857" : "#b91c1c" }}>
                      {item.status}
                    </div>
                    <div style={{ fontSize: 11, color: COLORS.textSecondary }}>
                      Last score: {item.latest_overall_score == null ? "-" : `${Number(item.latest_overall_score).toFixed(1)}%`}
                    </div>
                  </div>
                </div>

                <div style={{ fontSize: 12, color: COLORS.textSecondary }}>
                  Applications: {item.applications?.length || 0} | Assessments: {item.assessments?.length || 0} | Matches: {item.matches?.length || 0}
                </div>

                <div style={{ display: "grid", gap: 6 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: COLORS.textPrimary }}>
                    Timeline
                  </div>
                  {(item.timeline || []).map((event, idx) => (
                    <div
                      key={`${item.candidate_id}-${idx}`}
                      style={{
                        border: `1px solid ${COLORS.borderColor}`,
                        borderRadius: 8,
                        padding: "8px 10px",
                        backgroundColor: "#f8fafc",
                        fontSize: 12,
                        color: COLORS.textSecondary,
                      }}
                    >
                      <div style={{ fontWeight: 700, color: COLORS.textPrimary, marginBottom: 2 }}>
                        {event.title}
                      </div>
                      <div>
                        {event.occurred_at ? new Date(event.occurred_at).toLocaleString() : "-"}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )
      ) : historyLoading ? (
        <div style={{ display: "flex", alignItems: "center", gap: 8, color: COLORS.textSecondary }}>
          <Loader2 className="spin" size={16} /> Loading history...
        </div>
      ) : historyItems.length === 0 ? (
        <p style={{ margin: 0, color: COLORS.textSecondary, fontSize: 13 }}>
          No previous AI match attempts for this candidate/job pair.
        </p>
      ) : (
        <div style={{ display: "grid", gap: 10, maxHeight: "60vh", overflowY: "auto", paddingRight: 2 }}>
          {historyItems.map((item, index) => {
            const isActive = activeResult?.matchId === item.id;
            return (
              <div
                key={item.id}
                style={{
                  border: `1px solid ${isActive ? `${COLORS.primary}55` : COLORS.borderColor}`,
                  borderRadius: 10,
                  padding: 12,
                  backgroundColor: isActive ? COLORS.primaryLight : "white",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: 10,
                    marginBottom: 8,
                    flexWrap: "wrap",
                  }}
                >
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.textPrimary }}>
                      Attempt #{historyItems.length - index}
                    </div>
                    <div style={{ fontSize: 12, color: COLORS.textSecondary }}>
                      {new Date(item.created_at).toLocaleString()} - CV #{item.cv_id || "-"}
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 18, fontWeight: 800, color: COLORS.primary }}>
                      {Number(item.score || 0).toFixed(1)}%
                    </div>
                    <div style={{ fontSize: 12, color: COLORS.textSecondary }}>
                      {item.fit_label || "Fit"}
                    </div>
                  </div>
                </div>

                <p style={{ margin: "0 0 10px 0", fontSize: 12, color: COLORS.textSecondary }}>
                  {item.summary || "No summary available."}
                </p>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <div style={{ fontSize: 11, color: COLORS.textSecondary }}>
                    Semantic: {item.scoring_components?.embedding_score ?? "-"} | Keyword: {item.scoring_components?.keyword_overlap_score ?? "-"} | Structured: {item.scoring_components?.llm_structured_score ?? "-"}
                  </div>
                  <button
                    style={{
                      border: `1px solid ${COLORS.primary}55`,
                      color: COLORS.primary,
                      backgroundColor: "white",
                      borderRadius: 8,
                      padding: "6px 10px",
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: historyDetailLoading ? "not-allowed" : "pointer",
                    }}
                    onClick={() =>
                      handleViewMatchDetail(item.id, historyCandidate, true)
                    }
                    disabled={historyDetailLoading}
                  >
                    {historyDetailLoading ? "Loading..." : "View Result"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Modal>
  );
}

export function ResultModal({
  resultModalOpen,
  activeResult,
  setResultModalOpen,
  setResultModalFromHistory,
  resultModalFromHistory,
  results,
  setActiveResultId,
  activeStrengths,
  activeGaps,
  activeRecommendations,
  activeDimensions,
  activeStructured,
}) {
  return (
    <Modal
      open={resultModalOpen && !!activeResult}
      title="Match Analysis Result"
      onClose={() => {
        setResultModalOpen(false);
        setResultModalFromHistory(false);
      }}
      contentClassName="recruitment-match-modal-content"
      actions={
        <>
          {resultModalFromHistory && (
            <button
              style={{
                padding: "8px 16px",
                border: `1px solid ${COLORS.borderColor}`,
                borderRadius: "8px",
                background: "white",
                cursor: "pointer",
              }}
              onClick={() => {
                setResultModalOpen(false);
                setResultModalFromHistory(false);
              }}
            >
              Back to History
            </button>
          )}
          <button
            style={styles.btnPrimary}
            onClick={() => {
              setResultModalOpen(false);
              setResultModalFromHistory(false);
            }}
          >
            Close
          </button>
        </>
      }
    >
      {activeResult ? (
        <div style={{ display: "grid", gap: 16, maxHeight: "72vh", overflowY: "auto", paddingRight: 2 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 12,
              flexWrap: "wrap",
            }}
          >
            <h3
              style={{
                fontSize: "18px",
                fontWeight: "700",
                margin: 0,
              }}
            >
              Analysis Results
            </h3>
            <span style={{ fontSize: 12, color: COLORS.textSecondary }}>
              Showing {results.length} loaded attempt{results.length === 1 ? "" : "s"}
            </span>
          </div>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 10,
            }}
          >
            {results.map((item) => {
              const isActive = String(item.id) === String(activeResult.id);
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveResultId(item.id)}
                  style={{
                    border: `1px solid ${isActive ? `${COLORS.primary}77` : COLORS.borderColor}`,
                    background: isActive ? COLORS.primaryLight : "white",
                    color: isActive ? COLORS.primary : COLORS.textPrimary,
                    borderRadius: 10,
                    padding: "8px 12px",
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <Clock size={13} />
                  {item.candidateName} · {Number(item.score).toFixed(1)}%
                </button>
              );
            })}
          </div>

          <div
            className="analysis-result-card"
            style={{
              ...styles.card,
              padding: "24px",
              border: `1px solid ${COLORS.primary}33`,
              display: "grid",
              gap: 18,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: 14,
                flexWrap: "wrap",
              }}
            >
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 6 }}>
                  {activeResult.candidateName}
                </div>
                <div style={{ fontSize: 13, color: COLORS.textSecondary, display: "flex", gap: 12, flexWrap: "wrap" }}>
                  <span>CV #{activeResult.cvId || "-"}</span>
                  <span>{activeResult.source}</span>
                  <span>{new Date(activeResult.createdAt).toLocaleString()}</span>
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ color: COLORS.primary, fontWeight: 800, fontSize: 30, lineHeight: 1 }}>
                  {Number(activeResult.score).toFixed(1)}%
                </div>
                <div
                  style={{
                    marginTop: 8,
                    padding: "4px 10px",
                    borderRadius: 999,
                    fontSize: 12,
                    fontWeight: 700,
                    backgroundColor: COLORS.primaryLight,
                    color: COLORS.primary,
                    display: "inline-block",
                  }}
                >
                  {activeResult.fit || "Fit"}
                </div>
              </div>
            </div>

            <div
              style={{
                width: "100%",
                height: "8px",
                backgroundColor: "#e2e8f0",
                borderRadius: 999,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${Math.min(Math.max(Number(activeResult.score), 0), 100)}%`,
                  height: "100%",
                  backgroundColor: COLORS.primary,
                }}
              />
            </div>

            <div
              style={{
                backgroundColor: "#f8fafc",
                border: `1px solid ${COLORS.borderColor}`,
                borderRadius: 12,
                padding: 14,
                fontSize: 14,
                color: COLORS.textSecondary,
                lineHeight: 1.45,
              }}
            >
              <strong style={{ color: COLORS.textPrimary }}>Summary:</strong>{" "}
              {activeResult.summary || "No summary available for this attempt."}
            </div>

            <div
              className="analysis-results-grid"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                gap: 14,
              }}
            >
              <div style={{ ...styles.card, padding: 16 }}>
                <div style={{ fontWeight: 700, marginBottom: 10 }}>Top Strengths</div>
                {activeStrengths.length === 0 ? (
                  <p style={{ margin: 0, fontSize: 13, color: COLORS.textSecondary }}>
                    No key strengths identified.
                  </p>
                ) : (
                  <ul style={{ margin: 0, paddingLeft: 18, display: "grid", gap: 8, fontSize: 13, color: COLORS.textSecondary }}>
                    {activeStrengths.slice(0, 6).map((item, idx) => (
                      <li key={`${item}-${idx}`}>{item}</li>
                    ))}
                  </ul>
                )}
              </div>

              <div style={{ ...styles.card, padding: 16 }}>
                <div style={{ fontWeight: 700, marginBottom: 10 }}>Potential Gaps</div>
                {activeGaps.length === 0 ? (
                  <p style={{ margin: 0, fontSize: 13, color: COLORS.textSecondary }}>
                    No major gaps highlighted.
                  </p>
                ) : (
                  <ul style={{ margin: 0, paddingLeft: 18, display: "grid", gap: 8, fontSize: 13, color: COLORS.textSecondary }}>
                    {activeGaps.slice(0, 6).map((item, idx) => (
                      <li key={`${item}-${idx}`}>{item}</li>
                    ))}
                  </ul>
                )}
              </div>

              <div style={{ ...styles.card, padding: 16 }}>
                <div style={{ fontWeight: 700, marginBottom: 10 }}>Recommendations</div>
                {activeRecommendations.length === 0 ? (
                  <p style={{ margin: 0, fontSize: 13, color: COLORS.textSecondary }}>
                    No recommendations were returned.
                  </p>
                ) : (
                  <ul style={{ margin: 0, paddingLeft: 18, display: "grid", gap: 8, fontSize: 13, color: COLORS.textSecondary }}>
                    {activeRecommendations.slice(0, 6).map((item, idx) => (
                      <li key={`${item}-${idx}`}>{item}</li>
                    ))}
                  </ul>
                )}
              </div>

              <div style={{ ...styles.card, padding: 16 }}>
                <div style={{ fontWeight: 700, marginBottom: 10 }}>Scoring Components</div>
                {[
                  { label: "Semantic Similarity", value: activeResult.componentScores.embeddingScore },
                  { label: "Keyword Overlap", value: activeResult.componentScores.keywordScore },
                  { label: "Structured AI", value: activeResult.componentScores.structuredScore },
                ].map((metric) => {
                  const safeValue = Number.isFinite(Number(metric.value)) ? Number(metric.value) : null;
                  return (
                    <div key={metric.label} style={{ marginBottom: 10 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                        <strong style={{ color: COLORS.textPrimary }}>{metric.label}</strong>
                        <strong style={{ color: COLORS.textPrimary }}>
                          {safeValue === null ? "-" : `${safeValue.toFixed(1)}%`}
                        </strong>
                      </div>
                      <div style={{ width: "100%", height: 6, backgroundColor: "#e2e8f0", borderRadius: 999 }}>
                        <div
                          style={{
                            width: `${safeValue === null ? 0 : Math.min(Math.max(safeValue, 0), 100)}%`,
                            height: "100%",
                            backgroundColor: COLORS.primary,
                            borderRadius: 999,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div style={{ ...styles.card, padding: 16 }}>
                <div style={{ fontWeight: 700, marginBottom: 10 }}>Dimension Breakdown</div>
                {activeDimensions.length === 0 ? (
                  <p style={{ margin: 0, fontSize: 13, color: COLORS.textSecondary }}>
                    No dimension breakdown available.
                  </p>
                ) : (
                  <div style={{ display: "grid", gap: 10 }}>
                    {activeDimensions.map((dimension, idx) => (
                      <div key={`${dimension.name}-${idx}`}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                          <strong style={{ fontSize: 12, color: COLORS.textPrimary }}>{dimension.name}</strong>
                          <strong style={{ fontSize: 12, color: COLORS.textPrimary }}>
                            {Number(dimension.score || 0).toFixed(1)}%
                          </strong>
                        </div>
                        <div style={{ width: "100%", height: 6, backgroundColor: "#e2e8f0", borderRadius: 999, marginBottom: 4 }}>
                          <div
                            style={{
                              width: `${Math.min(Math.max(Number(dimension.score || 0), 0), 100)}%`,
                              height: "100%",
                              backgroundColor: COLORS.blue,
                              borderRadius: 999,
                            }}
                          />
                        </div>
                        {dimension.rationale ? (
                          <div style={{ fontSize: 12, color: COLORS.textSecondary, lineHeight: 1.4 }}>
                            {dimension.rationale}
                          </div>
                        ) : null}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ ...styles.card, padding: 16 }}>
                <div style={{ fontWeight: 700, marginBottom: 10 }}>Coverage & Confidence</div>
                <div style={{ display: "grid", gap: 10, fontSize: 13, color: COLORS.textSecondary }}>
                  <div>
                    <strong style={{ color: COLORS.textPrimary }}>Must-Have Coverage:</strong>{" "}
                    {Number(activeStructured.must_have_coverage || 0).toFixed(1)}%
                  </div>
                  <div>
                    <strong style={{ color: COLORS.textPrimary }}>Nice-to-Have Coverage:</strong>{" "}
                    {Number(activeStructured.nice_to_have_coverage || 0).toFixed(1)}%
                  </div>
                  <div>
                    <strong style={{ color: COLORS.textPrimary }}>Confidence:</strong>{" "}
                    {activeStructured.confidence || "Not provided"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </Modal>
  );
}

export function JobFormModal({
  jobFormOpen,
  jobFormMode,
  setJobFormOpen,
  jobSubmitting,
  handleSaveJob,
  jobForm,
  setJobForm,
}) {
  return (
    <Modal
      open={jobFormOpen}
      title={jobFormMode === "edit" ? "Edit Job Offering" : "Create Job Offering"}
      onClose={() => setJobFormOpen(false)}
      contentClassName="recruitment-match-modal-content"
      actions={
        <button
          style={styles.btnPrimary}
          onClick={handleSaveJob}
          disabled={jobSubmitting}
        >
          {jobSubmitting
            ? jobFormMode === "edit"
              ? "Saving..."
              : "Creating..."
            : jobFormMode === "edit"
            ? "Save Job"
            : "Create Job"}
        </button>
      }
    >
      <div style={{ display: "grid", gap: 14 }}>
        <div>
          <label style={styles.label}>Job Title</label>
          <input
            style={styles.input}
            value={jobForm.title}
            onChange={(e) =>
              setJobForm((prev) => ({ ...prev, title: e.target.value }))
            }
          />
        </div>
        <div>
          <label style={styles.label}>Description</label>
          <textarea
            style={{ ...styles.input, minHeight: "140px", resize: "vertical" }}
            value={jobForm.description}
            onChange={(e) =>
              setJobForm((prev) => ({ ...prev, description: e.target.value }))
            }
          />
        </div>
        <div>
          <label style={styles.label}>Status</label>
          <select
            style={styles.input}
            value={jobForm.status}
            onChange={(e) =>
              setJobForm((prev) => ({ ...prev, status: e.target.value }))
            }
          >
            <option value="active">Active</option>
            <option value="draft">Draft</option>
          </select>
        </div>
      </div>
    </Modal>
  );
}

export function CVManagerModal({
  cvManagerOpen,
  setCvManagerOpen,
  cvManagerCandidate,
  cvUploadFile,
  setCvUploadFile,
  cvUploadLoading,
  handleUploadCandidateCv,
  candidateCvsLoading,
  candidateCvs,
  openCvPreview,
  selectedMatchCv,
  handleUseCvForMatch,
  cvActionLoading,
  handleSetActiveCv,
  handleDeleteCv,
}) {
  return (
    <Modal
      open={cvManagerOpen}
      title="Manage Candidate CVs"
      onClose={() => setCvManagerOpen(false)}
      contentClassName="recruitment-match-modal-content"
      actions={
        <button
          style={styles.btnPrimary}
          onClick={() => setCvManagerOpen(false)}
        >
          Done
        </button>
      }
    >
      <div style={{ display: "grid", gap: 12 }}>
        <div
          style={{
            marginBottom: 4,
            padding: 12,
            backgroundColor: "#f8fafc",
            borderRadius: 8,
            fontSize: 13,
            color: COLORS.textSecondary,
          }}
        >
          <strong style={{ color: COLORS.textPrimary }}>Candidate:</strong>{" "}
          {cvManagerCandidate?.name || "-"}
        </div>

        <div
          style={{
            border: `1px solid ${COLORS.borderColor}`,
            borderRadius: 10,
            padding: 12,
            display: "grid",
            gap: 10,
          }}
        >
          <label style={styles.label}>Upload New CV (PDF or TXT)</label>
          <input
            style={styles.input}
            type="file"
            accept=".pdf,.txt"
            onChange={(e) => setCvUploadFile(e.target.files?.[0] || null)}
          />
          <button
            style={{ ...styles.btnPrimary, backgroundColor: COLORS.dark }}
            onClick={handleUploadCandidateCv}
            disabled={cvUploadLoading || !cvUploadFile}
          >
            {cvUploadLoading ? "Uploading..." : "Upload CV"}
          </button>
        </div>

        {candidateCvsLoading ? (
          <div style={{ display: "flex", alignItems: "center", gap: 8, color: COLORS.textSecondary }}>
            <Loader2 className="spin" size={16} /> Loading CVs...
          </div>
        ) : candidateCvs.length === 0 ? (
          <p style={{ margin: 0, fontSize: 13, color: COLORS.textSecondary }}>
            No CVs uploaded for this candidate yet.
          </p>
        ) : (
          candidateCvs.map((cv) => (
            <div
              key={cv.id}
              style={{
                border: `1px solid ${COLORS.borderColor}`,
                borderRadius: 10,
                padding: 12,
                display: "flex",
                justifyContent: "space-between",
                gap: 8,
                alignItems: "center",
              }}
            >
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 13 }}>
                  CV #{cv.id} {cv.is_active ? "(Active)" : ""}
                </div>
                <div style={{ fontSize: 12, color: COLORS.textSecondary }}>
                  Uploaded: {new Date(cv.uploaded_at).toLocaleString()}
                </div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  style={{
                    padding: "6px 10px",
                    borderRadius: 8,
                    border: `1px solid ${COLORS.borderColor}`,
                    background: "white",
                    cursor: "pointer",
                  }}
                  onClick={() => openCvPreview(cv)}
                >
                  View
                </button>
                <button
                  style={{
                    padding: "6px 10px",
                    borderRadius: 8,
                    border: `1px solid ${COLORS.primary}55`,
                    background:
                      selectedMatchCv?.id === cv.id ? COLORS.primaryLight : "white",
                    color: COLORS.primary,
                    cursor: "pointer",
                  }}
                  onClick={() => handleUseCvForMatch(cv, cvManagerCandidate)}
                >
                  {selectedMatchCv?.id === cv.id ? "Selected" : "Use For Match"}
                </button>
                {!cv.is_active && (
                  <button
                    style={{
                      padding: "6px 10px",
                      borderRadius: 8,
                      border: `1px solid ${COLORS.borderColor}`,
                      background: "white",
                      cursor: cvActionLoading ? "not-allowed" : "pointer",
                    }}
                    onClick={() => handleSetActiveCv(cv.id)}
                    disabled={cvActionLoading}
                  >
                    Set Active
                  </button>
                )}
                <button
                  style={{
                    padding: "6px 10px",
                    borderRadius: 8,
                    border: `1px solid ${COLORS.red}66`,
                    background: "white",
                    color: COLORS.red,
                    cursor: cvActionLoading ? "not-allowed" : "pointer",
                  }}
                  onClick={() => handleDeleteCv(cv.id)}
                  disabled={cvActionLoading}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </Modal>
  );
}

export function CVPreviewModal({
  cvPreviewOpen,
  setCvPreviewOpen,
  cvPreviewItem,
  getCvFileUrl,
}) {
  return (
    <Modal
      open={cvPreviewOpen}
      title="Resume Preview"
      onClose={() => setCvPreviewOpen(false)}
      contentClassName="recruitment-match-modal-content"
      actions={
        <button style={styles.btnPrimary} onClick={() => setCvPreviewOpen(false)}>
          Close
        </button>
      }
    >
      {!cvPreviewItem ? (
        <p style={{ margin: 0, color: COLORS.textSecondary }}>No resume selected.</p>
      ) : getCvFileUrl(cvPreviewItem).toLowerCase().includes(".pdf") ? (
        <object
          data={getCvFileUrl(cvPreviewItem)}
          type="application/pdf"
          style={{ width: "100%", minHeight: "65vh", border: "none" }}
        >
          <div style={{ display: "grid", gap: 10 }}>
            <p style={{ margin: 0, color: COLORS.textSecondary }}>
              Preview could not be rendered in-app for this PDF.
            </p>
            <a
              href={getCvFileUrl(cvPreviewItem)}
              target="_blank"
              rel="noreferrer"
              style={{ color: COLORS.primary, fontWeight: 600 }}
            >
              Open resume in a new tab
            </a>
          </div>
        </object>
      ) : cvPreviewItem.extracted_text ? (
        <pre
          style={{
            whiteSpace: "pre-wrap",
            fontFamily: "inherit",
            fontSize: 13,
            margin: 0,
            maxHeight: "65vh",
            overflowY: "auto",
            color: COLORS.textSecondary,
          }}
        >
          {cvPreviewItem.extracted_text}
        </pre>
      ) : (
        <div style={{ display: "grid", gap: 10 }}>
          <p style={{ margin: 0, color: COLORS.textSecondary }}>
            Preview is not available for this resume file.
          </p>
          <a
            href={getCvFileUrl(cvPreviewItem)}
            target="_blank"
            rel="noreferrer"
            style={{ color: COLORS.primary, fontWeight: 600 }}
          >
            Open resume in a new tab
          </a>
        </div>
      )}
    </Modal>
  );
}

export function CandidateFormModal({
  formOpen,
  isEditing,
  setFormOpen,
  submitting,
  handleSaveCandidate,
  formData,
  setFormData,
  jobs = [],
}) {
  return (
    <Modal
      open={formOpen}
      title={isEditing ? "Edit Candidate" : "Add New Candidate"}
      onClose={() => setFormOpen(false)}
      contentClassName="recruitment-match-modal-content"
      actions={
        <button
          style={styles.btnPrimary}
          onClick={handleSaveCandidate}
          disabled={submitting}
        >
          {submitting ? "Saving..." : "Save Candidate"}
        </button>
      }
    >
      <div style={{ display: "grid", gap: 16 }}>
        <div>
          <label style={styles.label}>Email</label>
          <input
            style={styles.input}
            type="email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
          />
        </div>
        <div className="form-row-flex" style={{ display: "flex", gap: 12 }}>
          <div style={{ flex: 1 }}>
            <label style={styles.label}>First Name</label>
            <input
              style={styles.input}
              value={formData.first_name}
              onChange={(e) =>
                setFormData({ ...formData, first_name: e.target.value })
              }
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={styles.label}>Last Name</label>
            <input
              style={styles.input}
              value={formData.last_name}
              onChange={(e) =>
                setFormData({ ...formData, last_name: e.target.value })
              }
            />
          </div>
        </div>
        <div>
          <label style={styles.label}>Job</label>
          <select
            style={styles.input}
            value={formData.job_id || ""}
            onChange={(e) => {
              const selectedJob = jobs.find(
                (job) => String(job.id) === String(e.target.value)
              );
              setFormData({
                ...formData,
                job_id: e.target.value,
                position: selectedJob?.title || "",
              });
            }}
          >
            <option value="">Select a registered job</option>
            {jobs.map((job) => (
              <option key={job.id} value={job.id}>
                {job.title}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label style={styles.label}>Status</label>
          <select
            style={styles.input}
            value={formData.status}
            onChange={(e) =>
              setFormData({ ...formData, status: e.target.value })
            }
          >
            <option value="pending">Pending</option>
            <option value="invited">Invited</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="hired">Hired</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>
    </Modal>
  );
}

export function DeleteCandidateModal({
  deleteOpen,
  setDeleteOpen,
  handleDeleteCandidate,
  deleting,
}) {
  return (
    <Modal
      open={deleteOpen}
      title="Delete Candidate?"
      onClose={() => setDeleteOpen(false)}
      contentClassName="recruitment-match-modal-content"
      actions={
        <>
          <button
            onClick={() => setDeleteOpen(false)}
            style={{
              padding: "8px 16px",
              border: "1px solid #ccc",
              borderRadius: "8px",
              background: "white",
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleDeleteCandidate}
            style={{ ...styles.btnPrimary, backgroundColor: COLORS.red }}
          >
            {deleting ? "Deleting..." : "Delete Permanently"}
          </button>
        </>
      }
    >
      <div style={{ textAlign: "center" }}>
        <AlertTriangle
          size={40}
          color={COLORS.red}
          style={{ marginBottom: 16 }}
        />
        <p>
          Are you sure you want to remove this candidate? This action cannot
          be undone.
        </p>
      </div>
    </Modal>
  );
}

export function AssignAssessmentModal({
  assignOpen,
  assignRow,
  selectedIds,
  setAssignOpen,
  sendingAssessment,
  handleSendAssessment,
  selectedCodes,
  setIsDropdownOpen,
  isDropdownOpen,
  toggleAssessment,
}) {
  return (
    <Modal
      open={assignOpen}
      title={
        assignRow
          ? "Send Assessment"
          : `Bulk Send (${selectedIds.length} Candidates)`
      }
      onClose={() => setAssignOpen(false)}
      contentClassName="recruitment-match-modal-content"
      actions={
        <button
          style={styles.btnPrimary}
          onClick={handleSendAssessment}
          disabled={sendingAssessment}
        >
          {sendingAssessment ? (
            <Loader2 className="spin" size={16} />
          ) : (
            <Send size={16} />
          )}
          {sendingAssessment ? "Sending..." : "Send Now"}
        </button>
      }
    >
      {assignRow ? (
        <div
          style={{
            marginBottom: 20,
            padding: 12,
            backgroundColor: "#f8fafc",
            borderRadius: 8,
          }}
        >
          <strong>{assignRow.name}</strong>{" "}
          <span style={{ color: "#64748b" }}>({assignRow.email})</span>
        </div>
      ) : (
        <div
          style={{
            marginBottom: 20,
            padding: 12,
            backgroundColor: "#eff6ff",
            borderRadius: 8,
            color: COLORS.blue,
          }}
        >
          <strong>Bulk Action:</strong> Sending to {selectedIds.length}{" "}
          selected candidates.
        </div>
      )}

      <label style={styles.label}>Select Assessments</label>

      <div className="assign-dropdown-wrap" style={{ position: "relative", marginBottom: "120px" }}>
        <div
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          style={{
            ...styles.input,
            cursor: "pointer",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background: "#fff",
          }}
        >
          <span>
            {selectedCodes.length > 0
              ? `${selectedCodes.length} Selected`
              : "Select templates..."}
          </span>
          <ChevronDown size={16} />
        </div>

        {isDropdownOpen && (
          <>
            <div
              style={{ position: "fixed", inset: 0, zIndex: 10 }}
              onClick={() => setIsDropdownOpen(false)}
            />
            <div
              style={{
                position: "absolute",
                top: "100%",
                left: 0,
                width: "100%",
                zIndex: 20,
                backgroundColor: "white",
                border: "1px solid #e5e7eb",
                borderRadius: "10px",
                boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
                maxHeight: "250px",
                overflowY: "auto",
              }}
            >
              {ASSESSMENT_OPTIONS.map((group) => (
                <div key={group.group}>
                  <div
                    style={{
                      padding: "8px 12px",
                      background: "#f9fafb",
                      fontWeight: "bold",
                      fontSize: "12px",
                      color: "#6b7280",
                    }}
                  >
                    {group.group}
                  </div>
                  {group.items.map((item) => {
                    const isSelected = selectedCodes.includes(item.code);
                    return (
                      <div
                        key={item.code}
                        onClick={() => toggleAssessment(item.code)}
                        style={{
                          padding: "10px 12px",
                          cursor: "pointer",
                          display: "flex",
                          justifyContent: "space-between",
                          background: isSelected ? "#eff6ff" : "white",
                        }}
                      >
                        <span
                          style={{
                            color: isSelected
                              ? COLORS.blue
                              : COLORS.textPrimary,
                          }}
                        >
                          {item.label}
                        </span>
                        {isSelected && (
                          <Check size={16} color={COLORS.blue} />
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}

export function ViewAssignmentsModal({
  viewAssignmentsOpen,
  setViewAssignmentsOpen,
  viewAssignmentsCandidate,
  loadingAssignments,
  assignments,
  onOpenReport,
}) {
  if (!viewAssignmentsOpen) {
    return null;
  }

  return ReactDOM.createPortal(
    <div
      style={styles.modalOverlay}
      onClick={() => setViewAssignmentsOpen(false)}
    >
    <div
      className="view-assignments-modal-content"
      style={{
        ...styles.card,
        width: "90%",
        maxWidth: "1000px",
        height: "85vh",
        maxHeight: "700px",
        padding: 0,
        boxShadow: COLORS.shadowLg,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="view-assignments-header"
          style={{
            padding: "24px 32px",
            borderBottom: `1px solid ${COLORS.borderColor}`,
            backgroundColor: COLORS.tableRow,
            flexShrink: 0,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}
          >
            <div>
              <h3
                style={{
                  margin: "0 0 8px 0",
                  fontSize: "22px",
                  fontWeight: "700",
                  color: COLORS.textPrimary,
                }}
              >
                Assessment Overview
              </h3>
              {viewAssignmentsCandidate && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                  }}
                >
                  <div
                    style={{
                      padding: 8,
                      backgroundColor: COLORS.primaryLight,
                      borderRadius: 8,
                    }}
                  >
                    <Users size={16} color={COLORS.primary} />
                  </div>
                  <div>
                    <div
                      style={{
                        fontWeight: 600,
                        fontSize: 15,
                        color: COLORS.textPrimary,
                      }}
                    >
                      {viewAssignmentsCandidate.name}
                    </div>
                    <div
                      style={{
                        fontSize: 13,
                        color: COLORS.textSecondary,
                      }}
                    >
                      {viewAssignmentsCandidate.email}
                    </div>
                  </div>
                </div>
              )}
            </div>
            <button
              onClick={() => setViewAssignmentsOpen(false)}
              style={{
                border: "none",
                background: "none",
                cursor: "pointer",
                padding: 8,
                borderRadius: 8,
                transition: "background 0.2s",
              }}
              onMouseEnter={(e) =>
                (e.target.style.backgroundColor = "#f1f5f9")
              }
              onMouseLeave={(e) =>
                (e.target.style.backgroundColor = "transparent")
              }
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="view-assignments-body" style={{ flex: 1, overflow: "auto", padding: "32px" }}>
          {loadingAssignments ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                height: "100%",
                gap: 16,
              }}
            >
              <Loader2
                className="spin"
                size={40}
                color={COLORS.primary}
              />
              <p style={{ color: COLORS.textSecondary, margin: 0 }}>
                Loading assessments...
              </p>
            </div>
          ) : assignments.length === 0 ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                height: "100%",
                color: COLORS.textSecondary,
              }}
            >
              <div
                style={{
                  padding: 24,
                  backgroundColor: "#f8fafc",
                  borderRadius: "50%",
                  marginBottom: 20,
                }}
              >
                <FileText size={48} color={COLORS.textMuted} />
              </div>
              <h4
                style={{
                  margin: "0 0 8px 0",
                  fontSize: 18,
                  color: COLORS.textPrimary,
                }}
              >
                No Assessments Yet
              </h4>
              <p style={{ margin: 0, fontSize: 14 }}>
                This candidate hasn't been assigned any assessments.
              </p>
            </div>
          ) : (
            <>
              <div
                className="view-assignments-stats"
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(200px, 1fr))",
                  gap: 16,
                  marginBottom: 32,
                }}
              >
                <div
                  style={{
                    padding: 20,
                    backgroundColor: "#eff6ff",
                    borderRadius: 12,
                    border: `1px solid ${COLORS.blue}30`,
                  }}
                >
                  <div
                    style={{
                      fontSize: 12,
                      color: COLORS.blue,
                      fontWeight: 600,
                      marginBottom: 8,
                    }}
                  >
                    TOTAL ASSIGNED
                  </div>
                  <div
                    style={{
                      fontSize: 28,
                      fontWeight: 800,
                      color: COLORS.blue,
                    }}
                  >
                    {assignments.length}
                  </div>
                </div>
                <div
                  style={{
                    padding: 20,
                    backgroundColor: "#ecfdf5",
                    borderRadius: 12,
                    border: "1px solid #05966930",
                  }}
                >
                  <div
                    style={{
                      fontSize: 12,
                      color: "#059669",
                      fontWeight: 600,
                      marginBottom: 8,
                    }}
                  >
                    COMPLETED
                  </div>
                  <div
                    style={{
                      fontSize: 28,
                      fontWeight: 800,
                      color: "#059669",
                    }}
                  >
                    {
                      assignments.filter(
                        (a) => a.status.toLowerCase() === "completed"
                      ).length
                    }
                  </div>
                </div>
                <div
                  style={{
                    padding: 20,
                    backgroundColor: "#fffbeb",
                    borderRadius: 12,
                    border: "1px solid #d9770630",
                  }}
                >
                  <div
                    style={{
                      fontSize: 12,
                      color: "#d97706",
                      fontWeight: 600,
                      marginBottom: 8,
                    }}
                  >
                    PENDING
                  </div>
                  <div
                    style={{
                      fontSize: 28,
                      fontWeight: 800,
                      color: "#d97706",
                    }}
                  >
                    {
                      assignments.filter(
                        (a) => a.status.toLowerCase() === "pending"
                      ).length
                    }
                  </div>
                </div>
              </div>

              <div>
                <h4
                  style={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: COLORS.textMuted,
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    marginBottom: 16,
                  }}
                >
                  Assessment History
                </h4>
                <div
                  className="view-assignments-history"
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fill, minmax(280px, 1fr))",
                    gap: 16,
                  }}
                >
                  {assignments.map((assignment) => {
                    const isCompleted =
                      assignment.status.toLowerCase() === "completed";
                    const isPending =
                      assignment.status.toLowerCase() === "pending";

                    return (
                      <div
                        key={assignment.id}
                        onClick={() => {
                          if (!isCompleted || !onOpenReport) return;
                          onOpenReport(assignment);
                        }}
                        style={{
                          padding: 20,
                          backgroundColor: COLORS.cardBg,
                          border: `2px solid ${
                            isCompleted
                              ? "#05966920"
                              : isPending
                              ? "#d9770620"
                              : COLORS.borderColor
                          }`,
                          borderRadius: 16,
                          transition: "all 0.2s",
                          cursor: isCompleted ? "pointer" : "default",
                          position: "relative",
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            right: 0,
                            height: 4,
                            backgroundColor: isCompleted
                              ? "#059669"
                              : isPending
                              ? "#d97706"
                              : "#94a3b8",
                          }}
                        />

                        <div style={{ marginTop: 8 }}>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "flex-start",
                              marginBottom: 12,
                            }}
                          >
                            <div style={{ flex: 1, paddingRight: 8 }}>
                              <h5
                                style={{
                                  margin: "0 0 6px 0",
                                  fontSize: 15,
                                  fontWeight: 700,
                                  color: COLORS.textPrimary,
                                  lineHeight: 1.3,
                                }}
                              >
                                {assignment.template.name}
                              </h5>
                            </div>
                            <span
                              style={{
                                ...styles.badge(
                                  assignment.status.toLowerCase()
                                ),
                                fontSize: 10,
                                padding: "4px 10px",
                                flexShrink: 0,
                              }}
                            >
                              {assignment.status}
                            </span>
                          </div>

                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              gap: 8,
                              fontSize: 12,
                              color: COLORS.textSecondary,
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                              }}
                            >
                              <Clock
                                size={14}
                                style={{ flexShrink: 0 }}
                              />
                              <span>
                                Assigned{" "}
                                {new Date(
                                  assignment.assigned_at
                                ).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                })}
                              </span>
                            </div>

                            {assignment.completed_at && (
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 8,
                                }}
                              >
                                <CheckCircle
                                  size={14}
                                  style={{ flexShrink: 0 }}
                                  color="#059669"
                                />
                                <span style={{ color: "#059669" }}>
                                  Completed{" "}
                                  {new Date(
                                    assignment.completed_at
                                  ).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                  })}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>

        {!loadingAssignments && assignments.length > 0 && (
          <div
            className="view-assignments-footer"
            style={{
              padding: "20px 32px",
              borderTop: `1px solid ${COLORS.borderColor}`,
              backgroundColor: COLORS.tableRow,
              flexShrink: 0,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div style={{ fontSize: 13, color: COLORS.textSecondary }}>
              Showing {assignments.length} assessment
              {assignments.length !== 1 ? "s" : ""}
            </div>
            <button
              style={{
                ...styles.btnPrimary,
                backgroundColor: COLORS.primary,
              }}
              onClick={() => setViewAssignmentsOpen(false)}
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}

export function ToastNotification({ toast, setToast }) {
  if (!toast) {
    return null;
  }

  return (
    <div
      className="recruitment-match-toast"
      style={{
        position: "fixed",
        bottom: "32px",
        right: "32px",
        zIndex: 9999,
        backgroundColor: toast.type === "error" ? "#fef2f2" : "#ecfdf5",
        border: `1px solid ${
          toast.type === "error" ? "#ef4444" : "#10b981"
        }`,
        borderRadius: "12px",
        padding: "16px 20px",
        boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
        display: "flex",
        alignItems: "center",
        gap: "12px",
        minWidth: "300px",
        animation: "fadeIn 0.3s ease-out",
      }}
    >
      <div
        style={{
          backgroundColor: toast.type === "error" ? "#fee2e2" : "#d1fae5",
          padding: "8px",
          borderRadius: "50%",
          display: "flex",
        }}
      >
        {toast.type === "error" ? (
          <AlertTriangle size={20} color="#dc2626" />
        ) : (
          <CheckCircle size={20} color="#059669" />
        )}
      </div>
      <div style={{ flex: 1 }}>
        <h4
          style={{
            margin: "0 0 4px 0",
            fontSize: "14px",
            fontWeight: "700",
            color: toast.type === "error" ? "#991b1b" : "#065f46",
          }}
        >
          {toast.type === "error" ? "Error" : "Success"}
        </h4>
        <p
          style={{
            margin: 0,
            fontSize: "13px",
            color: toast.type === "error" ? "#b91c1c" : "#047857",
          }}
        >
          {toast.message}
        </p>
      </div>
      <button
        onClick={() => setToast(null)}
        style={{
          border: "none",
          background: "none",
          cursor: "pointer",
          padding: "4px",
          opacity: 0.6,
        }}
      >
        <X
          size={16}
          color={toast.type === "error" ? "#991b1b" : "#065f46"}
        />
      </button>
    </div>
  );
}
