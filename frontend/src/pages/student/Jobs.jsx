import { useState, useEffect } from "react";
import { useToast } from "../../components/ui/Toast";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import Avatar from "../../components/ui/Avatar";
import {
  Search,
  Filter,
  Briefcase,
  Clock,
  ChevronRight,
  Users,
  X,
  Building2,
  Globe,
  GitBranch,
  Link2,
  FileText,
  CheckCircle,
  Upload,
  Send,
} from "lucide-react";
import api from "../../utils/api";

const JOB_TYPES = ["internship", "part-time", "full-time"];
const LANGUAGES = [
  "JavaScript",
  "Python",
  "Java",
  "C#",
  "PHP",
  "TypeScript",
  "Dart",
  "Kotlin",
];
const POSITIONS = [
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "Mobile Developer",
  "DevOps Engineer",
  "Data Scientist",
  "UI/UX Designer",
  "Software Engineer",
  "QA Engineer",
  "ASE",
];

// ── Company modal ────────────────────────────────────────
function CompanyModal({ company, onClose }) {
  if (!company) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.7)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl p-6 fade-in"
        style={{
          background: "var(--color-bg-card)",
          border: "1px solid var(--color-border)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <Avatar name={company.companyName} size="lg" />
            <div>
              <h3
                className="font-bold text-lg"
                style={{ color: "var(--color-text-primary)" }}
              >
                {company.companyName}
              </h3>
              {company.industry && (
                <p
                  className="text-sm"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  {company.industry}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ color: "var(--color-text-muted)" }}
          >
            <X size={20} />
          </button>
        </div>
        <div className="space-y-3">
          {company.website && (
            <a
              href={company.website}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 text-sm hover:underline"
              style={{ color: "#60A5FA" }}
            >
              <Globe size={15} /> {company.website}
            </a>
          )}
          {company.description && (
            <p
              className="text-sm leading-relaxed"
              style={{ color: "var(--color-text-secondary)" }}
            >
              {company.description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Apply modal ──────────────────────────────────────────
function ApplyModal({ job, onClose, onSuccess }) {
  const { addToast } = useToast();
  const [coverLetter, setCoverLetter] = useState("");
  const [cvFile, setCvFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("coverLetter", coverLetter);
      if (cvFile) formData.append("cv", cvFile);
      await api.post(`/applications/apply/${job.id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      addToast("Application submitted successfully!", "success");
      onSuccess();
      onClose();
    } catch (err) {
      addToast(err.response?.data?.message || "Failed to apply", "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (!job) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.7)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl p-6 fade-in"
        style={{
          background: "var(--color-bg-card)",
          border: "1px solid var(--color-border)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3
              className="font-bold text-lg"
              style={{ color: "var(--color-text-primary)" }}
            >
              Apply for {job.title}
            </h3>
            <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
              {job.company?.companyName}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{ color: "var(--color-text-muted)" }}
          >
            <X size={20} />
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <label
              className="block text-sm font-medium mb-1.5"
              style={{ color: "var(--color-text-secondary)" }}
            >
              Cover Letter
            </label>
            <textarea
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              placeholder="Write a short cover letter..."
              rows={5}
              className="w-full rounded-lg border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none"
              style={{
                background: "var(--color-bg-secondary)",
                color: "var(--color-text-primary)",
                borderColor: "var(--color-border)",
              }}
            />
          </div>
          <div>
            <label
              className="block text-sm font-medium mb-1.5"
              style={{ color: "var(--color-text-secondary)" }}
            >
              Upload CV (PDF)
            </label>
            <div
              className="border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-colors"
              style={{
                borderColor: cvFile ? "#3B82F6" : "var(--color-border)",
                background: cvFile
                  ? "rgba(59,130,246,0.05)"
                  : "var(--color-bg-secondary)",
              }}
              onClick={() => document.getElementById("cv-upload").click()}
            >
              {cvFile ? (
                <div className="flex items-center justify-center gap-2">
                  <FileText size={18} style={{ color: "#3B82F6" }} />
                  <span
                    className="text-sm font-medium"
                    style={{ color: "#3B82F6" }}
                  >
                    {cvFile.name}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setCvFile(null);
                    }}
                    className="text-red-400"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <div>
                  <Upload
                    size={24}
                    className="mx-auto mb-2"
                    style={{ color: "var(--color-text-muted)" }}
                  />
                  <p
                    className="text-sm"
                    style={{ color: "var(--color-text-muted)" }}
                  >
                    Click to upload your CV
                  </p>
                  <p
                    className="text-xs mt-1"
                    style={{ color: "var(--color-text-muted)" }}
                  >
                    PDF only, max 5MB
                  </p>
                </div>
              )}
            </div>
            <input
              id="cv-upload"
              type="file"
              accept=".pdf"
              onChange={(e) => setCvFile(e.target.files[0])}
              className="hidden"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" fullWidth onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="primary"
              fullWidth
              icon={Send}
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? "Submitting..." : "Submit Application"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Job detail panel ─────────────────────────────────────
function JobDetail({ job, onApply, appliedIds, onCompanyClick }) {
  if (!job) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-64 text-center p-8">
        <Briefcase
          size={48}
          className="mb-4 opacity-20"
          style={{ color: "var(--color-text-muted)" }}
        />
        <p
          className="font-medium"
          style={{ color: "var(--color-text-secondary)" }}
        >
          Select a job to view details
        </p>
      </div>
    );
  }

  const isApplied = appliedIds.includes(job.id);
  const isExpired = new Date(job.deadline) < new Date();
  const daysLeft = Math.ceil(
    (new Date(job.deadline) - new Date()) / (1000 * 60 * 60 * 24),
  );
  const typeColors = {
    internship: "blue",
    "part-time": "cyan",
    "full-time": "green",
  };

  return (
    <div className="fade-in">
      <div className="mb-6">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div>
            <h2
              className="text-xl font-bold mb-1"
              style={{ color: "var(--color-text-primary)" }}
            >
              {job.title}
            </h2>
            <button
              onClick={() => onCompanyClick(job.company)}
              className="text-sm font-medium hover:underline flex items-center gap-1"
              style={{ color: "#60A5FA" }}
            >
              <Building2 size={14} /> {job.company?.companyName}
            </button>
          </div>
          <Badge variant={typeColors[job.jobType] || "blue"}>
            {job.jobType}
          </Badge>
        </div>
        <div
          className="flex flex-wrap gap-3 text-sm"
          style={{ color: "var(--color-text-muted)" }}
        >
          <span className="flex items-center gap-1">
            <Clock size={14} />
            {isExpired
              ? "Expired"
              : daysLeft === 0
                ? "Deadline today"
                : `${daysLeft} days left`}
          </span>
          <span className="flex items-center gap-1">
            <Users size={14} /> {job._count?.applications || 0} applicants
          </span>
          {job.stipend && (
            <span style={{ color: "#10B981" }}>💰 {job.stipend}</span>
          )}
        </div>
      </div>

      {job.skills && (
        <div className="mb-5">
          <h4
            className="text-sm font-semibold mb-2"
            style={{ color: "var(--color-text-secondary)" }}
          >
            Required Skills
          </h4>
          <div className="flex flex-wrap gap-2">
            {job.skills
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
              .map((skill) => (
                <span
                  key={skill}
                  className="px-2.5 py-1 rounded-full text-xs font-medium"
                  style={{
                    background: "rgba(59,130,246,0.1)",
                    color: "#60A5FA",
                    border: "1px solid rgba(59,130,246,0.2)",
                  }}
                >
                  {skill}
                </span>
              ))}
          </div>
        </div>
      )}

      <div className="mb-6">
        <h4
          className="text-sm font-semibold mb-2"
          style={{ color: "var(--color-text-secondary)" }}
        >
          Job Description
        </h4>
        <p
          className="text-sm leading-relaxed whitespace-pre-wrap"
          style={{ color: "var(--color-text-secondary)" }}
        >
          {job.description}
        </p>
      </div>

      <div
        className="p-3 rounded-xl mb-6"
        style={{
          background: isExpired
            ? "rgba(239,68,68,0.08)"
            : "rgba(59,130,246,0.08)",
          border: `1px solid ${isExpired ? "rgba(239,68,68,0.2)" : "rgba(59,130,246,0.2)"}`,
        }}
      >
        <p
          className="text-sm font-medium"
          style={{ color: isExpired ? "#EF4444" : "#60A5FA" }}
        >
          {isExpired
            ? "⚠️ This listing has expired"
            : `📅 Deadline: ${new Date(job.deadline).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}`}
        </p>
      </div>

      {!isExpired &&
        (isApplied ? (
          <div
            className="flex items-center gap-2 p-3 rounded-xl"
            style={{
              background: "rgba(16,185,129,0.1)",
              border: "1px solid rgba(16,185,129,0.2)",
            }}
          >
            <CheckCircle size={18} style={{ color: "#10B981" }} />
            <span className="text-sm font-medium" style={{ color: "#10B981" }}>
              Already applied
            </span>
          </div>
        ) : (
          <Button
            variant="primary"
            size="lg"
            fullWidth
            icon={Send}
            onClick={() => onApply(job)}
          >
            Apply for this Position
          </Button>
        ))}
    </div>
  );
}

// ── Main page ────────────────────────────────────────────
export default function StudentJobs() {
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [appliedIds, setAppliedIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [jobType, setJobType] = useState("");
  const [skillFilter, setSkillFilter] = useState("");
  const [posFilter, setPosFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [applyingJob, setApplyingJob] = useState(null);
  const [companyModal, setCompanyModal] = useState(null);

  useEffect(() => {
    fetchJobs();
    fetchApplied();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [jobs, search, jobType, skillFilter, posFilter]);

  const fetchJobs = async () => {
    try {
      const res = await api.get("/jobs");
      const list = res.data.jobs || [];
      setJobs(list);
      if (list.length > 0) setSelectedJob(list[0]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchApplied = async () => {
    try {
      const res = await api.get("/applications/my-applications");
      setAppliedIds((res.data.applications || []).map((a) => a.jobId));
    } catch (err) {
      console.error(err);
    }
  };

  const applyFilters = () => {
    let f = [...jobs];
    if (search) {
      const s = search.toLowerCase();
      f = f.filter(
        (j) =>
          j.title?.toLowerCase().includes(s) ||
          j.description?.toLowerCase().includes(s) ||
          j.skills?.toLowerCase().includes(s) ||
          j.company?.companyName?.toLowerCase().includes(s),
      );
    }
    if (jobType) f = f.filter((j) => j.jobType === jobType);
    if (skillFilter)
      f = f.filter(
        (j) =>
          j.skills?.toLowerCase().includes(skillFilter.toLowerCase()) ||
          j.title?.toLowerCase().includes(skillFilter.toLowerCase()),
      );
    if (posFilter)
      f = f.filter(
        (j) =>
          j.title?.toLowerCase().includes(posFilter.toLowerCase()) ||
          j.description?.toLowerCase().includes(posFilter.toLowerCase()),
      );
    setFilteredJobs(f);
    if (f.length > 0 && !f.find((j) => j.id === selectedJob?.id))
      setSelectedJob(f[0]);
  };

  const clearFilters = () => {
    setSearch("");
    setJobType("");
    setSkillFilter("");
    setPosFilter("");
  };
  const hasFilters = search || jobType || skillFilter || posFilter;

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );

  return (
    <div className="fade-in space-y-4">
      {/* Search */}
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2"
            style={{ color: "var(--color-text-muted)" }}
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search jobs, skills, companies..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            style={{
              background: "var(--color-bg-card)",
              color: "var(--color-text-primary)",
              borderColor: "var(--color-border)",
            }}
          />
        </div>
        <Button
          variant={showFilters ? "primary" : "secondary"}
          icon={Filter}
          onClick={() => setShowFilters(!showFilters)}
        >
          Filters {hasFilters && "•"}
        </Button>
        {hasFilters && (
          <Button variant="ghost" icon={X} onClick={clearFilters}>
            Clear
          </Button>
        )}
      </div>

      {/* Filter panel */}
      {showFilters && (
        <Card className="fade-in">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label
                className="block text-xs font-medium mb-2"
                style={{ color: "var(--color-text-muted)" }}
              >
                Job Type
              </label>
              <div className="flex flex-wrap gap-2">
                {JOB_TYPES.map((t) => (
                  <button
                    key={t}
                    onClick={() => setJobType(jobType === t ? "" : t)}
                    className="px-3 py-1 rounded-full text-xs font-medium transition-all capitalize"
                    style={{
                      background:
                        jobType === t ? "#3B82F6" : "var(--color-bg-hover)",
                      color:
                        jobType === t ? "white" : "var(--color-text-secondary)",
                      border: `1px solid ${jobType === t ? "#3B82F6" : "var(--color-border)"}`,
                    }}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label
                className="block text-xs font-medium mb-2"
                style={{ color: "var(--color-text-muted)" }}
              >
                Programming Language
              </label>
              <div className="flex flex-wrap gap-2">
                {LANGUAGES.slice(0, 6).map((lang) => (
                  <button
                    key={lang}
                    onClick={() =>
                      setSkillFilter(skillFilter === lang ? "" : lang)
                    }
                    className="px-3 py-1 rounded-full text-xs font-medium transition-all"
                    style={{
                      background:
                        skillFilter === lang
                          ? "#06B6D4"
                          : "var(--color-bg-hover)",
                      color:
                        skillFilter === lang
                          ? "white"
                          : "var(--color-text-secondary)",
                      border: `1px solid ${skillFilter === lang ? "#06B6D4" : "var(--color-border)"}`,
                    }}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label
                className="block text-xs font-medium mb-2"
                style={{ color: "var(--color-text-muted)" }}
              >
                Job Position
              </label>
              <select
                value={posFilter}
                onChange={(e) => setPosFilter(e.target.value)}
                className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none"
                style={{
                  background: "var(--color-bg-secondary)",
                  color: "var(--color-text-primary)",
                  borderColor: "var(--color-border)",
                }}
              >
                <option value="">All positions</option>
                {POSITIONS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </Card>
      )}

      <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
        {filteredJobs.length} job{filteredJobs.length !== 1 ? "s" : ""} found
        {hasFilters && " — filtered"}
      </p>

      {filteredJobs.length === 0 ? (
        <Card>
          <div className="text-center py-16">
            <Briefcase
              size={48}
              className="mx-auto mb-4 opacity-20"
              style={{ color: "var(--color-text-muted)" }}
            />
            <h3
              className="font-semibold mb-2"
              style={{ color: "var(--color-text-primary)" }}
            >
              No jobs found
            </h3>
            <p
              className="text-sm mb-4"
              style={{ color: "var(--color-text-muted)" }}
            >
              Try adjusting your filters
            </p>
            <Button variant="outline" onClick={clearFilters}>
              Clear Filters
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          {/* Job list */}
          <div className="lg:col-span-2 space-y-2 lg:max-h-screen lg:overflow-y-auto pr-1">
            {filteredJobs.map((job) => {
              const isSelected = selectedJob?.id === job.id;
              const isApplied = appliedIds.includes(job.id);
              const isExpired = new Date(job.deadline) < new Date();
              const tc = {
                internship: "#3B82F6",
                "part-time": "#06B6D4",
                "full-time": "#10B981",
              };

              return (
                <div
                  key={job.id}
                  onClick={() => setSelectedJob(job)}
                  className="rounded-xl p-4 cursor-pointer transition-all"
                  style={{
                    background: isSelected
                      ? "rgba(59,130,246,0.12)"
                      : "var(--color-bg-card)",
                    border: `1px solid ${isSelected ? "#3B82F6" : "var(--color-border)"}`,
                    borderLeft: `3px solid ${isSelected ? "#3B82F6" : "transparent"}`,
                  }}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="min-w-0">
                      <h3
                        className="font-semibold text-sm truncate"
                        style={{ color: "var(--color-text-primary)" }}
                      >
                        {job.title}
                      </h3>
                      <p
                        className="text-xs mt-0.5 truncate"
                        style={{ color: "var(--color-text-muted)" }}
                      >
                        {job.company?.companyName}
                      </p>
                    </div>
                    {isApplied && (
                      <CheckCircle
                        size={16}
                        style={{ color: "#10B981", flexShrink: 0 }}
                      />
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span
                      className="text-xs px-2 py-0.5 rounded-full font-medium capitalize"
                      style={{
                        background: `${tc[job.jobType] || "#3B82F6"}22`,
                        color: tc[job.jobType] || "#3B82F6",
                      }}
                    >
                      {job.jobType}
                    </span>
                    <span
                      className="text-xs"
                      style={{
                        color: isExpired
                          ? "#EF4444"
                          : "var(--color-text-muted)",
                      }}
                    >
                      {isExpired
                        ? "Expired"
                        : `${Math.ceil((new Date(job.deadline) - new Date()) / 86400000)}d left`}
                    </span>
                  </div>
                  {job.skills && (
                    <p
                      className="text-xs mt-2 truncate"
                      style={{ color: "var(--color-text-muted)" }}
                    >
                      {job.skills}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          {/* Job detail */}
          <div className="lg:col-span-3">
            <Card className="sticky top-4">
              <JobDetail
                job={selectedJob}
                appliedIds={appliedIds}
                onApply={setApplyingJob}
                onCompanyClick={setCompanyModal}
              />
            </Card>
          </div>
        </div>
      )}

      {applyingJob && (
        <ApplyModal
          job={applyingJob}
          onClose={() => setApplyingJob(null)}
          onSuccess={fetchApplied}
        />
      )}
      {companyModal && (
        <CompanyModal
          company={companyModal}
          onClose={() => setCompanyModal(null)}
        />
      )}
    </div>
  );
}
