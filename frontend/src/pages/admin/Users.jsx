import { useState, useEffect } from "react";
import { useToast } from "../../components/ui/Toast";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import Avatar from "../../components/ui/Avatar";
import { Users, Search, Shield, Trash2, ShieldOff, Filter } from "lucide-react";
import api from "../../utils/api";

export default function AdminUsers() {
  const { addToast } = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [acting, setActing] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await api.get("/admin/users");
      setUsers(res.data.users || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleBan = async (userId, userName) => {
    if (!window.confirm(`Ban ${userName}? They will not be able to log in.`))
      return;
    setActing(userId);
    try {
      await api.patch(`/admin/users/${userId}/ban`);
      addToast(`${userName} has been banned`, "success");
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, isBanned: true } : u)),
      );
    } catch (err) {
      addToast("Failed to ban user", "error");
    } finally {
      setActing(null);
    }
  };

  const handleDelete = async (userId, userName) => {
    if (!window.confirm(`Delete ${userName}? This cannot be undone.`)) return;
    setActing(userId);
    try {
      await api.delete(`/admin/users/${userId}`);
      addToast(`${userName} deleted successfully`, "success");
      setUsers((prev) => prev.filter((u) => u.id !== userId));
    } catch (err) {
      addToast("Failed to delete user", "error");
    } finally {
      setActing(null);
    }
  };

  const roleConfig = {
    student: { variant: "blue", label: "Student" },
    company: { variant: "purple", label: "Company" },
    admin: { variant: "red", label: "Admin" },
  };

  const filtered = users.filter((u) => {
    const matchSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === "all" || u.role === roleFilter;
    return matchSearch && matchRole;
  });

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
          User Management
        </h2>
        <p
          className="text-sm mt-1"
          style={{ color: "var(--color-text-muted)" }}
        >
          {users.length} total users registered
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          {
            label: "Students",
            count: users.filter((u) => u.role === "student").length,
            color: "#3B82F6",
          },
          {
            label: "Companies",
            count: users.filter((u) => u.role === "company").length,
            color: "#8B5CF6",
          },
          {
            label: "Admins",
            count: users.filter((u) => u.role === "admin").length,
            color: "#EF4444",
          },
        ].map((s) => (
          <Card key={s.label}>
            <p
              className="text-xs font-medium mb-1"
              style={{ color: "var(--color-text-muted)" }}
            >
              {s.label}
            </p>
            <p className="text-3xl font-bold" style={{ color: s.color }}>
              {s.count}
            </p>
          </Card>
        ))}
      </div>

      {/* Search and filter */}
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
            placeholder="Search by name or email..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            style={{
              background: "var(--color-bg-card)",
              color: "var(--color-text-primary)",
              borderColor: "var(--color-border)",
            }}
          />
        </div>
        <div className="flex gap-2">
          {["all", "student", "company", "admin"].map((role) => (
            <button
              key={role}
              onClick={() => setRoleFilter(role)}
              className="px-3 py-2 rounded-xl text-sm font-medium transition-all capitalize"
              style={{
                background:
                  roleFilter === role ? "#3B82F6" : "var(--color-bg-card)",
                color:
                  roleFilter === role ? "white" : "var(--color-text-secondary)",
                border: `1px solid ${roleFilter === role ? "#3B82F6" : "var(--color-border)"}`,
              }}
            >
              {role}
            </button>
          ))}
        </div>
      </div>

      {/* Users table */}
      <Card>
        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <Users
              size={40}
              className="mx-auto mb-3 opacity-20"
              style={{ color: "var(--color-text-muted)" }}
            />
            <p style={{ color: "var(--color-text-muted)" }}>No users found</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((user) => {
              const config = roleConfig[user.role] || {
                variant: "gray",
                label: user.role,
              };
              return (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-3 rounded-xl transition-colors"
                  style={{
                    background: user.isBanned
                      ? "rgba(239,68,68,0.05)"
                      : "var(--color-bg-hover)",
                  }}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar name={user.name} size="sm" />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p
                          className="text-sm font-medium truncate"
                          style={{ color: "var(--color-text-primary)" }}
                        >
                          {user.name}
                        </p>
                        {user.isBanned && (
                          <span
                            className="text-xs px-1.5 py-0.5 rounded"
                            style={{
                              background: "rgba(239,68,68,0.15)",
                              color: "#EF4444",
                            }}
                          >
                            Banned
                          </span>
                        )}
                      </div>
                      <p
                        className="text-xs truncate"
                        style={{ color: "var(--color-text-muted)" }}
                      >
                        {user.email}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 ml-3 flex-shrink-0">
                    <Badge variant={config.variant}>{config.label}</Badge>
                    <span
                      className="text-xs hidden sm:block"
                      style={{ color: "var(--color-text-muted)" }}
                    >
                      {new Date(user.createdAt).toLocaleDateString()}
                    </span>
                    {user.role !== "admin" && (
                      <div className="flex gap-2">
                        {!user.isBanned && (
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={ShieldOff}
                            onClick={() => handleBan(user.id, user.name)}
                            disabled={acting === user.id}
                          >
                            Ban
                          </Button>
                        )}
                        <Button
                          variant="danger"
                          size="sm"
                          icon={Trash2}
                          onClick={() => handleDelete(user.id, user.name)}
                          disabled={acting === user.id}
                        >
                          Delete
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
