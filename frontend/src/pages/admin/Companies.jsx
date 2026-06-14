import { useState, useEffect } from "react";
import { useToast } from "../../components/ui/Toast";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import Avatar from "../../components/ui/Avatar";
import { Building2, CheckCircle, XCircle, Globe, Search } from "lucide-react";
import api from "../../utils/api";

export default function AdminCompanies() {
  const { addToast } = useToast();
  const [pendingCompanies, setPending] = useState([]);
  const [allCompanies, setAll] = useState([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(null);
  const [tab, setTab] = useState("pending");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [pendingRes, usersRes] = await Promise.all([
        api.get("/admin/pending-companies"),
        api.get("/admin/users"),
      ]);
      setPending(pendingRes.data.companies || []);
      const companyUsers = (usersRes.data.users || []).filter(
        (u) => u.role === "company",
      );
      setAll(companyUsers);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id, name) => {
    setActing(id);
    try {
      await api.patch(`/admin/companies/${id}/approve`);
      addToast(`${name} approved successfully`, "success");
      fetchData();
    } catch (err) {
      addToast("Failed to approve", "error");
    } finally {
      setActing(null);
    }
  };

  const handleReject = async (id, name) => {
    if (!window.confirm(`Reject ${name}?`)) return;
    setActing(id);
    try {
      await api.patch(`/admin/companies/${id}/reject`);
      addToast(`${name} rejected`, "info");
      fetchData();
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
          Company Management
        </h2>
        <p
          className="text-sm mt-1"
          style={{ color: "var(--color-text-muted)" }}
        >
          {pendingCompanies.length} pending approval
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-3">
        {[
          { key: "pending", label: `Pending (${pendingCompanies.length})` },
          { key: "all", label: `All Companies (${allCompanies.length})` },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className="px-4 py-2 rounded-xl text-sm font-medium transition-all"
            style={{
              background: tab === t.key ? "#3B82F6" : "var(--color-bg-card)",
              color: tab === t.key ? "white" : "var(--color-text-secondary)",
              border: `1px solid ${tab === t.key ? "#3B82F6" : "var(--color-border)"}`,
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Pending companies */}
      {tab === "pending" && (
        <div className="space-y-4">
          {pendingCompanies.length === 0 ? (
            <Card>
              <div className="text-center py-12">
                <CheckCircle
                  size={40}
                  className="mx-auto mb-3"
                  style={{ color: "#10B981", opacity: 0.5 }}
                />
                <p style={{ color: "var(--color-text-muted)" }}>
                  All companies approved
                </p>
              </div>
            </Card>
          ) : (
            pendingCompanies.map((company) => (
              <Card key={company.id}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <Avatar name={company.companyName} size="md" />
                    <div>
                      <h3
                        className="font-semibold"
                        style={{ color: "var(--color-text-primary)" }}
                      >
                        {company.companyName}
                      </h3>
                      <p
                        className="text-sm"
                        style={{ color: "var(--color-text-muted)" }}
                      >
                        {company.user?.email}
                      </p>
                      {company.industry && (
                        <Badge variant="blue" className="mt-1">
                          {company.industry}
                        </Badge>
                      )}
                      {company.website && (
                        <a
                          href={company.website}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1 text-xs mt-1 hover:underline"
                          style={{ color: "#60A5FA" }}
                        >
                          <Globe size={12} /> {company.website}
                        </a>
                      )}
                      <p
                        className="text-xs mt-1"
                        style={{ color: "var(--color-text-muted)" }}
                      >
                        Registered:{" "}
                        {new Date(company.user?.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <Button
                      variant="success"
                      size="sm"
                      icon={CheckCircle}
                      onClick={() =>
                        handleApprove(company.id, company.companyName)
                      }
                      disabled={acting === company.id}
                    >
                      Approve
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      icon={XCircle}
                      onClick={() =>
                        handleReject(company.id, company.companyName)
                      }
                      disabled={acting === company.id}
                    >
                      Reject
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {/* All companies */}
      {tab === "all" && (
        <Card>
          {allCompanies.length === 0 ? (
            <div className="text-center py-12">
              <Building2
                size={40}
                className="mx-auto mb-3 opacity-20"
                style={{ color: "var(--color-text-muted)" }}
              />
              <p style={{ color: "var(--color-text-muted)" }}>
                No companies registered
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {allCompanies.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-3 rounded-xl"
                  style={{ background: "var(--color-bg-hover)" }}
                >
                  <div className="flex items-center gap-3">
                    <Avatar name={user.name} size="sm" />
                    <div>
                      <p
                        className="text-sm font-medium"
                        style={{ color: "var(--color-text-primary)" }}
                      >
                        {user.name}
                      </p>
                      <p
                        className="text-xs"
                        style={{ color: "var(--color-text-muted)" }}
                      >
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <p
                    className="text-xs"
                    style={{ color: "var(--color-text-muted)" }}
                  >
                    {new Date(user.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
