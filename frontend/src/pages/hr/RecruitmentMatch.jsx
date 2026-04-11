import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./RecruitmentMatch.css";
import { styles } from "../../components/recruitment-match/Constants";
import {
  AIMatcherSection,
  JobOfferingsSection,
  PipelineSection,
  RecruitmentMatchHeader,
} from "../../components/recruitment-match/Sections";
import {
  AssignAssessmentModal,
  CandidateFormModal,
  CVManagerModal,
  CVPreviewModal,
  DeleteCandidateModal,
  HistoryModal,
  JobFormModal,
  ResultModal,
  ScoreExplainModal,
  ToastNotification,
  ViewAssignmentsModal,
} from "../../components/recruitment-match/Modals";

const PAGE_SIZE = 5;

// -----------------------
// Main Component
// -----------------------
export default function RecruitmentMatch() {
  const navigate = useNavigate();
  const API_BASE = import.meta.env.VITE_API_BASE_URL;
  const access = localStorage.getItem("access");
  const authHeader = useMemo(
    () => (access ? { Authorization: `Bearer ${access}` } : {}),
    [access]
  );

  // --- States ---
  const [toast, setToast] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [q, setQ] = useState("");
  const [pipelineStatusFilter, setPipelineStatusFilter] = useState("all");

  // Selection States
  const [selectedIds, setSelectedIds] = useState([]);

  // CRUD States
  const [formOpen, setFormOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    id: null,
    email: "",
    first_name: "",
    last_name: "",
    position: "",
    job_id: "",
    status: "pending",
  });
  const [submitting, setSubmitting] = useState(false);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Assign Assessment States
  const [assignOpen, setAssignOpen] = useState(false);
  const [assignRow, setAssignRow] = useState(null);
  const [selectedCodes, setSelectedCodes] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [sendingAssessment, setSendingAssessment] = useState(false);

  // View Assignments States
  const [viewAssignmentsOpen, setViewAssignmentsOpen] = useState(false);
  const [viewAssignmentsCandidate, setViewAssignmentsCandidate] =
    useState(null);
  const [assignments, setAssignments] = useState([]);
  const [loadingAssignments, setLoadingAssignments] = useState(false);

  // AI Matcher States
  const [jobDescription, setJobDescription] = useState("");
  const [results, setResults] = useState([]);
  const [activeResultId, setActiveResultId] = useState(null);
  const [matchLoading, setMatchLoading] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyCandidate, setHistoryCandidate] = useState(null);
  const [historyItems, setHistoryItems] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [archiveItems, setArchiveItems] = useState([]);
  const [archiveLoading, setArchiveLoading] = useState(false);
  const [archiveQuery, setArchiveQuery] = useState("");
  const [archiveStatusFilter, setArchiveStatusFilter] = useState("hired,rejected");
  const [archivePage, setArchivePage] = useState(1);
  const [archiveTotalPages, setArchiveTotalPages] = useState(1);
  const [archiveTotalCount, setArchiveTotalCount] = useState(0);
  const [historyDetailLoading, setHistoryDetailLoading] = useState(false);
  const [resultModalOpen, setResultModalOpen] = useState(false);
  const [resultModalFromHistory, setResultModalFromHistory] = useState(false);
  const [scoreExplainOpen, setScoreExplainOpen] = useState(false);
  const [scoreExplainCandidate, setScoreExplainCandidate] = useState(null);
  const [scoreExplainLoading, setScoreExplainLoading] = useState(false);
  const [scoreExplainDetailLoading, setScoreExplainDetailLoading] = useState(false);
  const [scoreExplainHistory, setScoreExplainHistory] = useState([]);
  const [activeScoreExplain, setActiveScoreExplain] = useState(null);
  const [explainingCandidateId, setExplainingCandidateId] = useState(null);

  // Talent Matching Job States
  const [jobs, setJobs] = useState([]);
  const [allJobs, setAllJobs] = useState([]);
  const [jobsLoading, setJobsLoading] = useState(false);
  const [jobsQuery, setJobsQuery] = useState("");
  const [jobsStatusFilter, setJobsStatusFilter] = useState("all");
  const [jobsPage, setJobsPage] = useState(1);
  const [jobsTotalPages, setJobsTotalPages] = useState(1);
  const [jobsTotalCount, setJobsTotalCount] = useState(0);
  const [selectedJobId, setSelectedJobId] = useState("");
  const [jobFormOpen, setJobFormOpen] = useState(false);
  const [jobFormMode, setJobFormMode] = useState("create");
  const [editingJobId, setEditingJobId] = useState(null);
  const [jobSubmitting, setJobSubmitting] = useState(false);
  const [jobForm, setJobForm] = useState({
    title: "",
    description: "",
    status: "active",
  });
  const [pipelineRankings, setPipelineRankings] = useState([]);
  const [pipelineLoading, setPipelineLoading] = useState(false);
  const [pipelinePage, setPipelinePage] = useState(1);
  const [pipelineTotalPages, setPipelineTotalPages] = useState(1);
  const [pipelineTotalCount, setPipelineTotalCount] = useState(0);
  const [cvManagerOpen, setCvManagerOpen] = useState(false);
  const [cvManagerCandidate, setCvManagerCandidate] = useState(null);
  const [candidateCvs, setCandidateCvs] = useState([]);
  const [candidateCvsLoading, setCandidateCvsLoading] = useState(false);
  const [cvActionLoading, setCvActionLoading] = useState(false);
  const [cvUploadFile, setCvUploadFile] = useState(null);
  const [cvUploadLoading, setCvUploadLoading] = useState(false);
  const [selectedMatchCandidate, setSelectedMatchCandidate] = useState(null);
  const [selectedMatchCv, setSelectedMatchCv] = useState(null);
  const [selectedCandidateCvs, setSelectedCandidateCvs] = useState([]);
  const [cvPreviewOpen, setCvPreviewOpen] = useState(false);
  const [cvPreviewItem, setCvPreviewItem] = useState(null);

  // --- Toast Timer ---
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const fetchCandidates = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/recruitment/candidates/`, {
        headers: authHeader,
      });
      const data = await res.json();
      setCandidates(
        data.map((c) => ({
          id: c.id,
          first_name: c.first_name,
          last_name: c.last_name,
          name: `${c.first_name || ""} ${c.last_name || ""}`.trim() || c.email,
          email: c.email,
          position: c.position || "Not Specified",
          status: c.status || "Pending",
        }))
      );
    } catch (e) {
      console.error(e);
      setToast({ message: "Failed to load candidates", type: "error" });
    }
  }, [API_BASE, authHeader]);

  const fetchJobs = useCallback(
    async ({ page = 1, query = "", status = "all" } = {}) => {
      setJobsLoading(true);
      try {
        const params = new URLSearchParams({
          page: String(page),
          page_size: String(PAGE_SIZE),
        });
        if (query.trim()) {
          params.set("q", query.trim());
        }
        if (status && status !== "all") {
          params.set("status", status);
        }

        const res = await fetch(`${API_BASE}/api/talent-matching/jobs/?${params.toString()}`, {
          headers: authHeader,
        });
        if (!res.ok) throw new Error("Failed to fetch jobs");
        const data = await res.json();
        const results = Array.isArray(data)
          ? data
          : Array.isArray(data?.results)
            ? data.results
            : [];

        setJobs(results);
        setJobsTotalCount(Number(data?.count) || results.length || 0);
        setJobsTotalPages(Math.max(Number(data?.total_pages) || 1, 1));
      } catch (e) {
        console.error(e);
        setJobs([]);
        setJobsTotalCount(0);
        setJobsTotalPages(1);
        setToast({ message: "Failed to load job offerings", type: "error" });
      } finally {
        setJobsLoading(false);
      }
    },
    [API_BASE, authHeader]
  );

  const fetchAllJobs = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/talent-matching/jobs/?all=true`, {
        headers: authHeader,
      });
      if (!res.ok) {
        throw new Error("Failed to fetch full jobs list");
      }
      const data = await res.json();
      setAllJobs(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setAllJobs([]);
    }
  }, [API_BASE, authHeader]);

  const fetchRankedPipeline = useCallback(
    async ({ page = 1, query = "", status = "all", jobId = "" } = {}) => {
      setPipelineLoading(true);
      try {
        const params = new URLSearchParams({
          page: String(page),
          page_size: String(PAGE_SIZE),
        });
        if (query.trim()) {
          params.set("q", query.trim());
        }
        if (status && status !== "all") {
          params.set("status", status);
        }
        if (jobId) {
          params.set("job_id", String(jobId));
        }

        const url = `${API_BASE}/api/talent-matching/pipeline/?${params.toString()}`;
        const res = await fetch(url, { headers: authHeader });
        if (!res.ok) throw new Error("Failed to load ranked pipeline");
        const data = await res.json();
        const results = Array.isArray(data)
          ? data
          : Array.isArray(data?.results)
            ? data.results
            : [];

        setPipelineRankings(results);
        setPipelineTotalCount(Number(data?.count) || results.length || 0);
        setPipelineTotalPages(Math.max(Number(data?.total_pages) || 1, 1));
      } catch (e) {
        console.error(e);
        setPipelineRankings([]);
        setPipelineTotalCount(0);
        setPipelineTotalPages(1);
        setToast({ message: "Failed to load rankings", type: "error" });
      } finally {
        setPipelineLoading(false);
      }
    },
    [API_BASE, authHeader]
  );

  const fetchArchiveSnapshots = useCallback(
    async ({ page = 1, query = "", status = "hired,rejected" } = {}) => {
      setArchiveLoading(true);
      try {
        const params = new URLSearchParams({
          page: String(page),
          page_size: String(PAGE_SIZE),
        });
        if (query.trim()) {
          params.set("q", query.trim());
        }
        if (status.trim()) {
          params.set("status", status.trim());
        }

        const res = await fetch(`${API_BASE}/api/talent-matching/archive/?${params.toString()}`, {
          headers: authHeader,
        });
        if (!res.ok) throw new Error("Failed to load archive snapshots");
        const data = await res.json();

        const results = Array.isArray(data?.results)
          ? data.results
          : Array.isArray(data?.items)
            ? data.items
            : [];

        setArchiveItems(results);
        setArchiveTotalCount(Number(data?.count) || results.length || 0);
        setArchiveTotalPages(Math.max(Number(data?.total_pages) || 1, 1));
      } catch (e) {
        console.error(e);
        setArchiveItems([]);
        setArchiveTotalCount(0);
        setArchiveTotalPages(1);
        setToast({ message: "Failed to load archive snapshots.", type: "error" });
      } finally {
        setArchiveLoading(false);
      }
    },
    [API_BASE, authHeader]
  );

  useEffect(() => {
    fetchCandidates();
    fetchAllJobs();
  }, [fetchCandidates, fetchAllJobs]);

  useEffect(() => {
    fetchJobs({ page: jobsPage, query: jobsQuery, status: jobsStatusFilter });
  }, [fetchJobs, jobsPage, jobsQuery, jobsStatusFilter]);

  useEffect(() => {
    fetchRankedPipeline({
      page: pipelinePage,
      query: q,
      status: pipelineStatusFilter,
      jobId: selectedJobId,
    });
  }, [fetchRankedPipeline, pipelinePage, q, pipelineStatusFilter, selectedJobId]);

  useEffect(() => {
    if (historyOpen && !historyCandidate) {
      fetchArchiveSnapshots({
        page: archivePage,
        query: archiveQuery,
        status: archiveStatusFilter,
      });
    }
  }, [
    historyOpen,
    historyCandidate,
    archivePage,
    archiveQuery,
    archiveStatusFilter,
    fetchArchiveSnapshots,
  ]);

  useEffect(() => {
    if (!selectedJobId) {
      setJobDescription("");
      return;
    }

    const selected = allJobs.find(
      (job) => String(job.id) === String(selectedJobId)
    );
    setJobDescription(selected?.description || "");
  }, [selectedJobId, allJobs]);

  useEffect(() => {
    setPipelinePage(1);
  }, [selectedJobId]);

  const normalizeMatchResult = ({
    payload,
    fallbackCandidate,
    fallbackCv,
    source,
  }) => {
    const scoring = payload?.scoring_components || payload?.component_scores || {};
    const structured = payload?.structured_analysis || {};
    const matchMeta = payload?.match || {};
    const matchId = matchMeta?.id || payload?.id || null;

    return {
      id: matchId || `adhoc-${Date.now()}`,
      matchId,
      source: source || "AI Analysis",
      createdAt: matchMeta?.created_at || payload?.created_at || new Date().toISOString(),
      candidateId: matchMeta?.candidate_id || fallbackCandidate?.id || null,
      candidateName:
        fallbackCandidate?.name ||
        matchMeta?.candidate_name ||
        "Candidate",
      cvId: fallbackCv?.id || matchMeta?.cv || null,
      score: Number(payload?.score || 0),
      fit: payload?.fit || payload?.fit_label || matchMeta?.fit_label || "",
      summary: payload?.summary || structured?.summary || "",
      comparisonMetrics: payload?.comparison_metrics || {},
      structuredAnalysis: structured,
      componentScores: {
        embeddingScore:
          scoring?.embedding_score ?? scoring?.semantic ?? null,
        keywordScore:
          scoring?.keyword_overlap_score ?? scoring?.keyword ?? null,
        structuredScore:
          scoring?.llm_structured_score ?? scoring?.structured ?? null,
      },
    };
  };

  const upsertResult = (nextResult) => {
    setResults((prev) => {
      const deduped = prev.filter((item) => {
        if (nextResult.matchId && item.matchId) {
          return item.matchId !== nextResult.matchId;
        }
        return item.id !== nextResult.id;
      });
      return [nextResult, ...deduped];
    });
    setActiveResultId(nextResult.id);
  };

  const handleViewMatchDetail = async (
    matchId,
    candidate = null,
    openedFromHistory = false
  ) => {
    if (!matchId) return;
    setHistoryDetailLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/talent-matching/matches/${matchId}/`, {
        headers: authHeader,
      });
      if (!res.ok) throw new Error("Failed to load match detail");
      const payload = await res.json();
      const next = normalizeMatchResult({
        payload,
        fallbackCandidate: candidate,
        source: "History",
      });
      upsertResult(next);
      setResultModalFromHistory(openedFromHistory);
      setResultModalOpen(true);
    } catch (e) {
      console.error(e);
      setToast({ message: "Failed to load match details.", type: "error" });
    } finally {
      setHistoryDetailLoading(false);
    }
  };

  const handleOpenMatchHistory = async (candidate) => {
    setHistoryCandidate(candidate);
    setHistoryItems([]);
    setArchiveItems([]);
    setHistoryLoading(true);
    setHistoryOpen(true);

    try {
      const res = await fetch(
        `${API_BASE}/api/talent-matching/candidates/${candidate.id}/match-history/`,
        { headers: authHeader }
      );
      if (!res.ok) throw new Error("Failed to load match history");
      const data = await res.json();
      setHistoryItems(Array.isArray(data?.history) ? data.history : []);
    } catch (e) {
      console.error(e);
      setHistoryItems([]);
      setToast({ message: "Failed to load match history.", type: "error" });
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleOpenArchiveHistory = async () => {
    setHistoryCandidate(null);
    setHistoryItems([]);
    setArchiveItems([]);
    setArchivePage(1);
    setHistoryOpen(true);
  };

  const handleExplainScore = async (candidateRow) => {
    if (!candidateRow?.candidate_id) {
      return;
    }

    const candidatePayload = {
      id: candidateRow.candidate_id,
      name: candidateRow.candidate_name,
      candidate_name: candidateRow.candidate_name,
      candidate_email: candidateRow.candidate_email,
      position: candidateRow.position,
    };

    setScoreExplainCandidate(candidatePayload);
    setScoreExplainOpen(true);
    setScoreExplainLoading(true);
    setScoreExplainDetailLoading(false);
    setScoreExplainHistory([]);
    setActiveScoreExplain(null);
    setExplainingCandidateId(candidateRow.candidate_id);

    try {
      const res = await fetch(
        `${API_BASE}/api/talent-matching/candidates/${candidateRow.candidate_id}/score-explanation/`,
        {
          method: "POST",
          headers: authHeader,
        }
      );

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.detail || "Failed to generate ranking explanation.");
      }

      const history = Array.isArray(data?.history) ? data.history : [];
      setScoreExplainHistory(history);
      setActiveScoreExplain(data?.report || null);

      if (!data?.cached) {
        setToast({ message: "Ranking explanation generated.", type: "success" });
      }
    } catch (e) {
      console.error(e);
      setScoreExplainOpen(false);
      setToast({ message: e.message || "Failed to generate ranking explanation.", type: "error" });
    } finally {
      setScoreExplainLoading(false);
      setExplainingCandidateId(null);
    }
  };

  const handleOpenScoreExplainHistoryItem = async (reportId) => {
    if (!reportId) {
      return;
    }
    setScoreExplainDetailLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/talent-matching/score-explanations/${reportId}/`, {
        headers: authHeader,
      });
      if (!res.ok) {
        throw new Error("Failed to load explanation history item.");
      }
      const data = await res.json();
      setActiveScoreExplain(data);
    } catch (e) {
      console.error(e);
      setToast({ message: "Failed to load explanation history item.", type: "error" });
    } finally {
      setScoreExplainDetailLoading(false);
    }
  };

  const openCreateJobModal = () => {
    setJobFormMode("create");
    setEditingJobId(null);
    setJobForm({ title: "", description: "", status: "active" });
    setJobFormOpen(true);
  };

  const openEditJobModal = (job) => {
    setJobFormMode("edit");
    setEditingJobId(job.id);
    setJobForm({
      title: job.title || "",
      description: job.description || "",
      status: job.status || "active",
    });
    setJobFormOpen(true);
  };

  const handleSaveJob = async () => {
    if (!jobForm.title.trim() || !jobForm.description.trim()) {
      setToast({
        message: "Job title and description are required.",
        type: "error",
      });
      return;
    }

    setJobSubmitting(true);
    try {
      const isEdit = jobFormMode === "edit" && editingJobId;
      const res = await fetch(
        isEdit
          ? `${API_BASE}/api/talent-matching/jobs/${editingJobId}/`
          : `${API_BASE}/api/talent-matching/jobs/`,
        {
          method: isEdit ? "PUT" : "POST",
          headers: { "Content-Type": "application/json", ...authHeader },
          body: JSON.stringify(jobForm),
        }
      );

      if (!res.ok) throw new Error("Failed to save job");

      const saved = await res.json();
      setJobFormOpen(false);
      setJobForm({ title: "", description: "", status: "active" });
      setEditingJobId(null);
      setToast({
        message: isEdit ? "Job offering updated." : "Job offering created.",
        type: "success",
      });
      await fetchJobs({ page: 1, query: jobsQuery, status: jobsStatusFilter });
      await fetchAllJobs();
      setJobsPage(1);
      setSelectedJobId(String(saved.id));
      setJobDescription(saved.description || "");
    } catch (e) {
      console.error(e);
      setToast({ message: "Failed to save job offering", type: "error" });
    } finally {
      setJobSubmitting(false);
    }
  };

  const handleDeleteJob = async (jobId) => {
    try {
      const res = await fetch(`${API_BASE}/api/talent-matching/jobs/${jobId}/`, {
        method: "DELETE",
        headers: authHeader,
      });

      if (!res.ok) throw new Error("Failed to delete job");

      if (String(selectedJobId) === String(jobId)) {
        setSelectedJobId("");
        setJobDescription("");
      }
      await Promise.all([
        fetchJobs({ page: jobsPage, query: jobsQuery, status: jobsStatusFilter }),
        fetchAllJobs(),
        fetchRankedPipeline({
          page: pipelinePage,
          query: q,
          status: pipelineStatusFilter,
          jobId: selectedJobId,
        }),
      ]);
      setToast({ message: "Job offering deleted.", type: "success" });
    } catch (e) {
      console.error(e);
      setToast({ message: "Failed to delete job offering", type: "error" });
    }
  };

  const getCvFileUrl = (cv) => {
    const rawPath = String(cv?.file || "").trim();
    if (!rawPath) return "";

    const normalizedPath = rawPath.replace(/\\/g, "/");
    if (
      normalizedPath.startsWith("http://") ||
      normalizedPath.startsWith("https://")
    ) {
      return normalizedPath;
    }

    const withLeadingSlash = normalizedPath.startsWith("/")
      ? normalizedPath
      : `/${normalizedPath}`;

    try {
      return new URL(withLeadingSlash, API_BASE).toString();
    } catch {
      return `${API_BASE}${withLeadingSlash}`;
    }
  };

  const openCvPreview = (cv) => {
    setCvPreviewItem(cv);
    setCvPreviewOpen(true);
  };

  const handleSelectCandidateForMatch = async (candidate) => {
    setSelectedMatchCandidate(candidate);
    setSelectedMatchCv(null);
    setSelectedCandidateCvs([]);
    await fetchCandidateCvs(candidate.id, true, false, true);
  };

  const handleToggleMatchCandidate = async (candidate) => {
    if (selectedMatchCandidate?.id === candidate.id) {
      setSelectedMatchCandidate(null);
      setSelectedMatchCv(null);
      setSelectedCandidateCvs([]);
      return;
    }
    await handleSelectCandidateForMatch(candidate);
  };

  const handleUploadCandidateCv = async () => {
    if (!cvManagerCandidate) return;
    if (!cvUploadFile) {
      setToast({ message: "Please select a CV file first.", type: "error" });
      return;
    }

    setCvUploadLoading(true);
    try {
      const uploadForm = new FormData();
      uploadForm.append("recruitee_id", cvManagerCandidate.id);
      uploadForm.append("file", cvUploadFile);
      uploadForm.append("is_active", "true");

      const uploadRes = await fetch(`${API_BASE}/api/talent-matching/cvs/upload/`, {
        method: "POST",
        headers: authHeader,
        body: uploadForm,
      });

      if (!uploadRes.ok) throw new Error("Failed to upload CV");

      const uploadedCv = await uploadRes.json();
      setCvUploadFile(null);
      await fetchCandidateCvs(cvManagerCandidate.id, true);

      if (
        selectedMatchCandidate &&
        selectedMatchCandidate.id === cvManagerCandidate.id
      ) {
        setSelectedMatchCv(uploadedCv);
      }

      setToast({ message: "Candidate CV uploaded.", type: "success" });
    } catch (e) {
      console.error(e);
      setToast({ message: "Failed to upload CV.", type: "error" });
    } finally {
      setCvUploadLoading(false);
    }
  };

  const openCvManager = async (candidate) => {
    setCvManagerCandidate(candidate);
    setCvUploadFile(null);
    setCvManagerOpen(true);
    await fetchCandidateCvs(
      candidate.id,
      selectedMatchCandidate?.id === candidate.id,
      true,
      selectedMatchCandidate?.id === candidate.id
    );
  };

  const fetchCandidateCvs = async (
    candidateId,
    syncSelectedCv = false,
    updateManagerList = false,
    updateSelectedList = false
  ) => {
    setCandidateCvsLoading(true);
    try {
      const res = await fetch(
        `${API_BASE}/api/talent-matching/candidates/${candidateId}/cvs/`,
        { headers: authHeader }
      );
      if (!res.ok) throw new Error("Failed to load CVs");
      const data = await res.json();
      const list = Array.isArray(data) ? data : [];

      if (updateManagerList || cvManagerCandidate?.id === candidateId) {
        setCandidateCvs(list);
      }

      if (updateSelectedList || selectedMatchCandidate?.id === candidateId) {
        setSelectedCandidateCvs(list);
      }

      if (syncSelectedCv) {
        const activeCv = list.find((item) => item.is_active) || list[0] || null;
        setSelectedMatchCv(activeCv);
      }
    } catch (e) {
      console.error(e);
      setCandidateCvs([]);
      setToast({ message: "Failed to load candidate CVs.", type: "error" });
    } finally {
      setCandidateCvsLoading(false);
    }
  };

  const handleSetActiveCv = async (cvId) => {
    setCvActionLoading(true);
    try {
      const res = await fetch(
        `${API_BASE}/api/talent-matching/cvs/${cvId}/set-active/`,
        {
          method: "POST",
          headers: authHeader,
        }
      );
      if (!res.ok) throw new Error("Failed to activate CV");
      await fetchCandidateCvs(
        cvManagerCandidate.id,
        selectedMatchCandidate?.id === cvManagerCandidate.id
      );
      setToast({ message: "Candidate active CV updated.", type: "success" });
    } catch (e) {
      console.error(e);
      setToast({ message: "Failed to set active CV.", type: "error" });
    } finally {
      setCvActionLoading(false);
    }
  };

  const handleDeleteCv = async (cvId) => {
    setCvActionLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/talent-matching/cvs/${cvId}/`, {
        method: "DELETE",
        headers: authHeader,
      });
      if (!res.ok) throw new Error("Failed to delete CV");
      await fetchCandidateCvs(
        cvManagerCandidate.id,
        selectedMatchCandidate?.id === cvManagerCandidate.id
      );
      await fetchRankedPipeline({
        page: pipelinePage,
        query: q,
        status: pipelineStatusFilter,
        jobId: selectedJobId,
      });
      setToast({ message: "CV deleted.", type: "success" });
    } catch (e) {
      console.error(e);
      setToast({ message: "Failed to delete CV.", type: "error" });
    } finally {
      setCvActionLoading(false);
    }
  };

  const handleUseCvForMatch = (cv, candidate = null) => {
    if (candidate) {
      setSelectedMatchCandidate(candidate);
      if (cvManagerCandidate?.id === candidate.id) {
        setSelectedCandidateCvs(candidateCvs);
      }
    }
    setSelectedMatchCv(cv);
    setToast({ message: `CV #${cv.id} selected for match.`, type: "success" });
  };

  const filtered = pipelineRankings;

  const handleChangeStatus = async (newStatus) => {
    if (!selectedIds.length) return;
    try {
      const res = await fetch(`${API_BASE}/api/talent-matching/applications/bulk-status/`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeader },
        body: JSON.stringify({
          candidate_ids: selectedIds.filter((id) => id),
          status: newStatus,
        }),
      });
      if (!res.ok) throw new Error("Failed to change status");
      setToast({ message: "Status updated successfully.", type: "success" });
      await Promise.all([
        fetchCandidates(),
        fetchRankedPipeline({
          page: pipelinePage,
          query: q,
          status: pipelineStatusFilter,
          jobId: selectedJobId,
        }),
      ]);
    } catch (e) {
      console.error(e);
      setToast({ message: "Failed to update status", type: "error" });
    }
  };

  const selectedJob = allJobs.find(
    (job) => String(job.id) === String(selectedJobId)
  );

  const activeResult =
    results.find((item) => String(item.id) === String(activeResultId)) ||
    results[0] ||
    null;
  const activeStructured = activeResult?.structuredAnalysis || {};
  const activeStrengths = activeStructured?.strengths || [];
  const activeGaps = activeStructured?.gaps || [];
  const activeRecommendations = activeStructured?.recommendations || [];
  const activeDimensions = activeStructured?.dimensions || [];

  const parseCSV = (str) => {
    const arr = [];
    let quote = false;
    for (let row = 0, col = 0, c = 0; c < str.length; c++) {
        let cc = str[c], nc = str[c+1];
        arr[row] = arr[row] || [];
        arr[row][col] = arr[row][col] || '';

        if (cc == '"' && quote && nc == '"') { arr[row][col] += cc; ++c; continue; }
        if (cc == '"') { quote = !quote; continue; }
        if (cc == ',' && !quote) { ++col; continue; }
        if (cc == '\r' && nc == '\n' && !quote) { ++row; col = 0; ++c; continue; }
        if (cc == '\n' && !quote) { ++row; col = 0; continue; }
        if (cc == '\r' && !quote) { ++row; col = 0; continue; }
        arr[row][col] += cc;
    }
    return arr;
  };

  const handleCandidateCsvUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setToast({ message: "Importing candidates...", type: "info" });
    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target.result;
      const rows = parseCSV(text);
      if (rows.length < 2) {
        setToast({ message: "CSV file is empty or invalid.", type: "error" });
        return;
      }
      
      const headers = rows[0].map(h => h.trim().toLowerCase());
      const emailIdx = headers.findIndex(h => h.includes("email"));
      const firstIdx = headers.findIndex(h => h.includes("first"));
      const lastIdx = headers.findIndex(h => h.includes("last") || h.includes("name"));
      const posIdx = headers.findIndex(h => h.includes("pos") || h.includes("role") || h.includes("title"));

      if (emailIdx === -1) {
        setToast({ message: "CSV must contain an 'email' column.", type: "error" });
        return;
      }

      let count = 0;
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (!row || !row[emailIdx]) continue;
        
        try {
          await fetch(`${API_BASE}/api/recruitment/candidates/`, {
            method: "POST",
            headers: { "Content-Type": "application/json", ...authHeader },
            body: JSON.stringify({
              email: row[emailIdx].trim(),
              first_name: firstIdx >= 0 && row[firstIdx] ? row[firstIdx].trim() : "",
              last_name: lastIdx >= 0 && row[lastIdx] ? row[lastIdx].trim() : "",
              position: posIdx >= 0 && row[posIdx] ? row[posIdx].trim() : "Not Specified",
              status: "pending"
            }),
          });
          count++;
        } catch(err) {
          console.error(err);
        }
      }
      setToast({ message: `Successfully imported ${count} candidates.`, type: "success" });
      await Promise.all([
        fetchCandidates(),
        fetchRankedPipeline({
          page: pipelinePage,
          query: q,
          status: pipelineStatusFilter,
          jobId: selectedJobId,
        }),
      ]);
    };
    reader.readAsText(file);
    e.target.value = null;
  };

  const handleJobCsvUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setToast({ message: "Importing jobs...", type: "info" });
    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target.result;
      const rows = parseCSV(text);
      if (rows.length < 2) {
        setToast({ message: "CSV file is empty or invalid.", type: "error" });
        return;
      }

      const headers = rows[0].map(h => h.trim().toLowerCase());
      const titleIdx = headers.findIndex(h => h.includes("title"));
      const descIdx = headers.findIndex(h => h.includes("desc"));

      if (titleIdx === -1) {
        setToast({ message: "CSV must contain a 'title' column.", type: "error" });
        return;
      }

      let count = 0;
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (!row || !row[titleIdx]) continue;
        try {
          await fetch(`${API_BASE}/api/talent-matching/jobs/`, {
            method: "POST",
            headers: { "Content-Type": "application/json", ...authHeader },
            body: JSON.stringify({
              title: row[titleIdx].trim(),
              description: descIdx >= 0 && row[descIdx] ? row[descIdx].trim() : "",
              status: "active"
            }),
          });
          count++;
        } catch(err) { console.error(err); }
      }
      setToast({ message: `Successfully imported ${count} jobs.`, type: "success" });
      await fetchJobs({ page: 1, query: jobsQuery, status: jobsStatusFilter });
      await fetchAllJobs();
      setJobsPage(1);
    };
    reader.readAsText(file);
    e.target.value = null;
  };

  // --- CRUD Handlers ---
  const handleSaveCandidate = async () => {
    if (!formData.email || !formData.first_name) {
      setToast({ message: "Email and Name are required.", type: "error" });
      return;
    }
    if (!isEditing && !formData.job_id) {
      setToast({ message: "Please select a job for this candidate.", type: "error" });
      return;
    }

    setSubmitting(true);
    try {
      const method = isEditing ? "PUT" : "POST";
      const url = isEditing
        ? `${API_BASE}/api/recruitment/candidates/${formData.id}/`
        : `${API_BASE}/api/recruitment/candidates/`;

      const selectedJobForCandidate = allJobs.find(
        (job) => String(job.id) === String(formData.job_id)
      );
      const payload = {
        email: formData.email,
        first_name: formData.first_name,
        last_name: formData.last_name,
        position: selectedJobForCandidate?.title || formData.position || "",
        status: formData.status,
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", ...authHeader },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to save candidate");

      const savedCandidate = await res.json();

      let attachFailed = false;
      if (formData.job_id) {
        const attachRes = await fetch(`${API_BASE}/api/talent-matching/applications/attach/`, {
          method: "POST",
          headers: { "Content-Type": "application/json", ...authHeader },
          body: JSON.stringify({
            candidate_id: savedCandidate.id || formData.id,
            job_id: Number(formData.job_id),
            source: "candidate_form",
          }),
        });

        attachFailed = !attachRes.ok;
      }

      await Promise.all([
        fetchCandidates(),
        fetchRankedPipeline({
          page: pipelinePage,
          query: q,
          status: pipelineStatusFilter,
          jobId: selectedJobId,
        }),
      ]);
      setFormOpen(false);
      setToast({
        message: attachFailed
          ? "Candidate saved, but linking to the selected job failed."
          : isEditing
            ? "Candidate updated!"
            : "Candidate added!",
        type: attachFailed ? "error" : "success",
      });
    } catch {
      setToast({ message: "Error saving candidate.", type: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCandidate = async () => {
    setDeleting(true);
    try {
      const res = await fetch(
        `${API_BASE}/api/recruitment/candidates/${deleteId}/`,
        {
          method: "DELETE",
          headers: authHeader,
        }
      );

      if (!res.ok) throw new Error("Delete failed");

      setCandidates(candidates.filter((c) => c.id !== deleteId));
      setSelectedIds(selectedIds.filter((id) => id !== deleteId));
      if (selectedMatchCandidate?.id === deleteId) {
        setSelectedMatchCandidate(null);
        setSelectedMatchCv(null);
        setSelectedCandidateCvs([]);
      }
        await Promise.all([
          fetchCandidates(),
          fetchRankedPipeline({
            page: pipelinePage,
            query: q,
            status: pipelineStatusFilter,
            jobId: selectedJobId,
          }),
        ]);
      setDeleteOpen(false);
      setToast({ message: "Candidate removed.", type: "success" });
    } catch {
      setToast({ message: "Failed to delete candidate.", type: "error" });
    } finally {
      setDeleting(false);
    }
  };

  const openEditModal = (c) => {
    setIsEditing(true);
    setFormData({
      id: c.id,
      email: c.email,
      first_name: c.first_name,
      last_name: c.last_name,
      position: c.position,
      job_id: allJobs.find((job) => (job.title || "") === (c.position || ""))?.id || "",
      status: c.status,
    });
    setFormOpen(true);
  };

  const openAddModal = () => {
    setIsEditing(false);
    setFormData({
      id: null,
      email: "",
      first_name: "",
      last_name: "",
      position: "",
      job_id: "",
      status: "pending",
    });
    setFormOpen(true);
  };

  // --- Assign Assessment Logic ---
  const toggleAssessment = (code) => {
    setSelectedCodes((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  };

  const handleSendAssessment = async () => {
    if (selectedCodes.length === 0)
      return setToast({
        message: "Select at least one assessment.",
        type: "error",
      });

    setSendingAssessment(true);
    try {
      let targetEmails = [];
      if (assignRow) {
        targetEmails = [assignRow.email];
      } else {
        targetEmails = candidates
          .filter((c) => selectedIds.includes(c.id))
          .map((c) => c.email);
      }

      const res = await fetch(`${API_BASE}/api/assessments/assign-candidate/`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeader },
        body: JSON.stringify({
          candidate_emails: targetEmails,
          template_codes: selectedCodes,
        }),
      });

      if (!res.ok) throw new Error("Failed to send.");

      const data = await res.json();
      setToast({
        message: `Sent to ${
          data.sent_count || targetEmails.length
        } candidates!`,
        type: "success",
      });
      setAssignOpen(false);
      setSelectedCodes([]);

      if (!assignRow) {
        setSelectedIds([]);
      }
    } catch {
      setToast({ message: "Error sending assessments.", type: "error" });
    } finally {
      setSendingAssessment(false);
    }
  };

  // --- View Assignments Logic ---
  const handleViewAssignments = async (candidate) => {
    setViewAssignmentsCandidate(candidate);
    setViewAssignmentsOpen(true);
    setLoadingAssignments(true);

    try {
      const res = await fetch(
        `${API_BASE}/api/candidates/${candidate.id}/assignments/`,
        { headers: authHeader }
      );

      if (!res.ok) throw new Error("Failed to fetch assignments");

      const data = await res.json();
      setAssignments(data);
    } catch (e) {
      console.error(e);
      setToast({ message: "Failed to load assignments", type: "error" });
      setAssignments([]);
    } finally {
      setLoadingAssignments(false);
    }
  };

  // --- AI Matcher ---
  async function analyzeMatches() {
    if (!selectedJobId || !selectedMatchCandidate || !selectedMatchCv) {
      setToast({
        message:
          "Select one job offering, one candidate, and one CV before calculating fit.",
        type: "error",
      });
      return;
    }

    setMatchLoading(true);
    try {
      // Ensure candidate is linked to selected job before scoring.
      const attachRes = await fetch(
        `${API_BASE}/api/talent-matching/applications/attach/`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json", ...authHeader },
          body: JSON.stringify({
            candidate_id: selectedMatchCandidate.id,
            job_id: Number(selectedJobId),
            source: "hr_manual",
          }),
        }
      );
      if (!attachRes.ok) throw new Error("Failed to attach candidate to selected job");

      const res = await fetch(`${API_BASE}/api/talent-matching/match/`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeader },
        body: JSON.stringify({
          job_id: Number(selectedJobId),
          candidate_id: selectedMatchCandidate.id,
          cv_id: selectedMatchCv.id,
          job_description: jobDescription.trim() || selectedJob?.description || "",
        }),
      });

      if (!res.ok) throw new Error("Failed to analyze");
      const data = await res.json();
      const next = normalizeMatchResult({
        payload: data,
        fallbackCandidate: selectedMatchCandidate,
        fallbackCv: selectedMatchCv,
        source: "Live Analysis",
      });
      upsertResult(next);
      setResultModalFromHistory(false);
      setResultModalOpen(true);

      await fetchRankedPipeline({
        page: pipelinePage,
        query: q,
        status: pipelineStatusFilter,
        jobId: selectedJobId,
      });
      setToast({ message: "Match analysis complete.", type: "success" });
    } catch (err) {
      console.error(err);
      setToast({ message: "Failed to calculate match fit.", type: "error" });
    } finally {
      setMatchLoading(false);
    }
  }

  return (
    <div className="recruitment-match" style={styles.container}>
      <style>{`.spin { animation: spin 1s linear infinite; } @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>

      <div className="main-wrapper-card" style={styles.mainWrapperCard}>
        <RecruitmentMatchHeader />

        <JobOfferingsSection
          jobsLoading={jobsLoading}
          jobs={jobs}
          jobsTotalCount={jobsTotalCount}
          jobsQuery={jobsQuery}
          setJobsQuery={(next) => {
            setJobsQuery(next);
            setJobsPage(1);
          }}
          jobsStatusFilter={jobsStatusFilter}
          setJobsStatusFilter={(next) => {
            setJobsStatusFilter(next);
            setJobsPage(1);
          }}
          jobsPage={jobsPage}
          jobsTotalPages={jobsTotalPages}
          onJobsPageChange={setJobsPage}
          selectedJob={selectedJob}
          selectedJobId={selectedJobId}
          setSelectedJobId={setSelectedJobId}
          openEditJobModal={openEditJobModal}
          handleDeleteJob={handleDeleteJob}
          openCreateJobModal={openCreateJobModal}
          handleJobCsvUpload={handleJobCsvUpload}
        />

        {/* Search + status controls moved into PipelineSection header (see Sections.jsx) */}

        <PipelineSection
          selectedMatchCandidate={selectedMatchCandidate}
          pipelineLoading={pipelineLoading}
          pipelineTotalCount={pipelineTotalCount}
          pipelinePage={pipelinePage}
          pipelineTotalPages={pipelineTotalPages}
          onPipelinePageChange={setPipelinePage}
          q={q}
          setQ={(next) => {
            setQ(next);
            setPipelinePage(1);
          }}
          pipelineStatusFilter={pipelineStatusFilter}
          setPipelineStatusFilter={(next) => {
            setPipelineStatusFilter(next);
            setPipelinePage(1);
          }}
          openHistory={handleOpenArchiveHistory}
          filtered={filtered}
          handleToggleMatchCandidate={handleToggleMatchCandidate}
          selectedIds={selectedIds}
          setSelectedIds={setSelectedIds}
          historyDetailLoading={historyDetailLoading}
          handleViewMatchDetail={handleViewMatchDetail}
          handleOpenMatchHistory={handleOpenMatchHistory}
          handleViewAssignments={handleViewAssignments}
          setAssignRow={setAssignRow}
          setSelectedCodes={setSelectedCodes}
          setAssignOpen={setAssignOpen}
          openCvManager={openCvManager}
          openEditModal={openEditModal}
          setDeleteId={setDeleteId}
          setDeleteOpen={setDeleteOpen}
          handleExplainScore={handleExplainScore}
          explainingCandidateId={explainingCandidateId}
          handleCandidateCsvUpload={handleCandidateCsvUpload}
          openAddModal={openAddModal}
          handleChangeStatus={handleChangeStatus}
        />

        <AIMatcherSection
          selectedMatchCandidate={selectedMatchCandidate}
          selectedCandidateCvs={selectedCandidateCvs}
          selectedMatchCv={selectedMatchCv}
          setSelectedMatchCv={setSelectedMatchCv}
          openCvManager={openCvManager}
          openCvPreview={openCvPreview}
          selectedJob={selectedJob}
          jobDescription={jobDescription}
          analyzeMatches={analyzeMatches}
          matchLoading={matchLoading}
          selectedJobId={selectedJobId}
          results={results}
          setResultModalFromHistory={setResultModalFromHistory}
          setResultModalOpen={setResultModalOpen}
        />
      </div>

      <HistoryModal
        historyOpen={historyOpen}
        historyCandidate={historyCandidate}
        setHistoryOpen={setHistoryOpen}
        historyLoading={historyLoading}
        historyItems={historyItems}
        archiveLoading={archiveLoading}
        archiveItems={archiveItems}
        archiveQuery={archiveQuery}
        setArchiveQuery={(next) => {
          setArchiveQuery(next);
          setArchivePage(1);
        }}
        archiveStatusFilter={archiveStatusFilter}
        setArchiveStatusFilter={(next) => {
          setArchiveStatusFilter(next);
          setArchivePage(1);
        }}
        archivePage={archivePage}
        archiveTotalPages={archiveTotalPages}
        archiveTotalCount={archiveTotalCount}
        onArchivePageChange={setArchivePage}
        activeResult={activeResult}
        historyDetailLoading={historyDetailLoading}
        handleViewMatchDetail={handleViewMatchDetail}
      />

      <ResultModal
        resultModalOpen={resultModalOpen}
        activeResult={activeResult}
        setResultModalOpen={setResultModalOpen}
        setResultModalFromHistory={setResultModalFromHistory}
        resultModalFromHistory={resultModalFromHistory}
        results={results}
        setActiveResultId={setActiveResultId}
        activeStrengths={activeStrengths}
        activeGaps={activeGaps}
        activeRecommendations={activeRecommendations}
        activeDimensions={activeDimensions}
        activeStructured={activeStructured}
      />

      <ScoreExplainModal
        scoreExplainOpen={scoreExplainOpen}
        setScoreExplainOpen={setScoreExplainOpen}
        scoreExplainCandidate={scoreExplainCandidate}
        scoreExplainLoading={scoreExplainLoading}
        scoreExplainDetailLoading={scoreExplainDetailLoading}
        scoreExplainHistory={scoreExplainHistory}
        activeScoreExplain={activeScoreExplain}
        onOpenScoreExplainHistoryItem={handleOpenScoreExplainHistoryItem}
      />

      <JobFormModal
        jobFormOpen={jobFormOpen}
        jobFormMode={jobFormMode}
        setJobFormOpen={setJobFormOpen}
        jobSubmitting={jobSubmitting}
        handleSaveJob={handleSaveJob}
        jobForm={jobForm}
        setJobForm={setJobForm}
      />

      <CVManagerModal
        cvManagerOpen={cvManagerOpen}
        setCvManagerOpen={setCvManagerOpen}
        cvManagerCandidate={cvManagerCandidate}
        cvUploadFile={cvUploadFile}
        setCvUploadFile={setCvUploadFile}
        cvUploadLoading={cvUploadLoading}
        handleUploadCandidateCv={handleUploadCandidateCv}
        candidateCvsLoading={candidateCvsLoading}
        candidateCvs={candidateCvs}
        openCvPreview={openCvPreview}
        selectedMatchCv={selectedMatchCv}
        handleUseCvForMatch={handleUseCvForMatch}
        cvActionLoading={cvActionLoading}
        handleSetActiveCv={handleSetActiveCv}
        handleDeleteCv={handleDeleteCv}
      />

      <CVPreviewModal
        cvPreviewOpen={cvPreviewOpen}
        setCvPreviewOpen={setCvPreviewOpen}
        cvPreviewItem={cvPreviewItem}
        getCvFileUrl={getCvFileUrl}
      />

      <CandidateFormModal
        formOpen={formOpen}
        isEditing={isEditing}
        setFormOpen={setFormOpen}
        submitting={submitting}
        handleSaveCandidate={handleSaveCandidate}
        formData={formData}
        setFormData={setFormData}
        jobs={allJobs}
      />

      <DeleteCandidateModal
        deleteOpen={deleteOpen}
        setDeleteOpen={setDeleteOpen}
        handleDeleteCandidate={handleDeleteCandidate}
        deleting={deleting}
      />

      <AssignAssessmentModal
        assignOpen={assignOpen}
        assignRow={assignRow}
        selectedIds={selectedIds}
        setAssignOpen={setAssignOpen}
        sendingAssessment={sendingAssessment}
        handleSendAssessment={handleSendAssessment}
        selectedCodes={selectedCodes}
        setIsDropdownOpen={setIsDropdownOpen}
        isDropdownOpen={isDropdownOpen}
        toggleAssessment={toggleAssessment}
      />

      <ViewAssignmentsModal
        viewAssignmentsOpen={viewAssignmentsOpen}
        setViewAssignmentsOpen={setViewAssignmentsOpen}
        viewAssignmentsCandidate={viewAssignmentsCandidate}
        loadingAssignments={loadingAssignments}
        assignments={assignments}
        onOpenReport={(assignment) => {
          setViewAssignmentsOpen(false);
          navigate(`/report/candidate/${assignment.id}`);
        }}
      />

      <ToastNotification toast={toast} setToast={setToast} />
    </div>
  );
}
