import { useState, useEffect } from "react";
import { useToast } from "../../components/ui/Toast";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import { Briefcase, CheckCircle, XCircle, Users, Clock } from "lucide-react";
import api from "../../utils/api";

export default function AdminJobs() {
  const { addToast } = useToast();
  const [pendingJobs, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(null);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const res = await api.get("/admin/pending-jobs");
      setPending(res.data.jobs || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id, title) => {
    setActing(id);
    try {
      await api.patch(`/admin/jobs/${id}/approve`);
      addToast(`"${title}" approved`, "success");
      setPending((prev) => prev.filter((j) => j.id !== id));
    } catch (err) {
      addToast("Failed to approve", "error");
    } finally {
      setActing(null);
    }
  };

  const handleReject = async (id, title) => {
    if (!window.confirm(`Reject "${title}"?`)) return;
    setActing(id);
    try {
      await api.patch(`/admin/jobs/${id}/reject`);
      addToast(`"${title}" rejected`, "info");
      setPending((prev) => prev.filter((j) => j.id !== id));
    } catch (err) {
      addToast("Failed to reject", "error");
    } finally {
      setActing(null);
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );

  return (
    <div className="space-y-6 fade-in">
      <div>
        <h2
          className="text-xl font-bold"
          style={{ color: "var(--color-text-primary)" }}
        >
          Job Listing Approvals
        </h2>
        <p
          className="text-sm mt-1"
          style={{ color: "var(--color-text-muted)" }}
        >
          {pendingJobs.length} listing{pendingJobs.length !== 1 ? "s" : ""}{" "}
          waiting for approval
        </p>
      </div>

      {pendingJobs.length === 0 ? (
        <Card>
          <div className="text-center py-16">
            <CheckCircle
              size={48}
              className="mx-auto mb-4"
              style={{ color: "#10B981", opacity: 0.5 }}
            />
            <h3
              className="font-semibold mb-2"
              style={{ color: "var(--color-text-primary)" }}
            >
              All caught up!
            </h3>
            <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
              No job listings pending approval
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {pendingJobs.map((job) => (
            <Card key={job.id}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <h3
                      className="font-semibold"
                      style={{ color: "var(--color-text-primary)" }}
                    >
                      {job.title}
                    </h3>
                    <Badge variant="blue">{job.jobType}</Badge>
                  </div>
                  <p className="text-sm mb-1" style={{ color: "#60A5FA" }}>
                    {job.company?.companyName}
                  </p>
                  <p
                    className="text-sm line-clamp-2 mb-3"
                    style={{ color: "var(--color-text-secondary)" }}
                  >
                    {job.description}
                  </p>
                  <div
                    className="flex flex-wrap gap-4 text-xs"
                    style={{ color: "var(--color-text-muted)" }}
                  >
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      Deadline: {new Date(job.deadline).toLocaleDateString()}
                    </span>
                    {job.stipend && <span>💰 {job.stipend}</span>}
                  </div>
                  {job.skills && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {job.skills
                        .split(",")
                        .map((s) => s.trim())
                        .filter(Boolean)
                        .map((skill) => (
                          <span
                            key={skill}
                            className="text-xs px-2 py-0.5 rounded-full"
                            style={{
                              background: "rgba(59,130,246,0.1)",
                              color: "#60A5FA",
                            }}
                          >
                            {skill}
                          </span>
                        ))}
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-2 flex-shrink-0">
                  <Button
                    variant="success"
                    size="sm"
                    icon={CheckCircle}
                    onClick={() => handleApprove(job.id, job.title)}
                    disabled={acting === job.id}
                  >
                    Approve
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    icon={XCircle}
                    onClick={() => handleReject(job.id, job.title)}
                    disabled={acting === job.id}
                  >
                    Reject
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
