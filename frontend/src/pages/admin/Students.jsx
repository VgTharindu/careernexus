import { useState, useEffect } from "react";
import Card from "../../components/ui/Card";
import Avatar from "../../components/ui/Avatar";
import { GraduationCap, Search } from "lucide-react";
import api from "../../utils/api";

export default function AdminStudents() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const res = await api.get("/admin/users");
      const students = (res.data.users || []).filter(
        (u) => u.role === "student",
      );
      setStudents(students);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = students.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase()),
  );

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
          Registered Students
        </h2>
        <p
          className="text-sm mt-1"
          style={{ color: "var(--color-text-muted)" }}
        >
          {students.length} students registered
        </p>
      </div>

      <div className="relative">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2"
          style={{ color: "var(--color-text-muted)" }}
        />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search students..."
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          style={{
            background: "var(--color-bg-card)",
            color: "var(--color-text-primary)",
            borderColor: "var(--color-border)",
          }}
        />
      </div>

      <Card>
        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <GraduationCap
              size={40}
              className="mx-auto mb-3 opacity-20"
              style={{ color: "var(--color-text-muted)" }}
            />
            <p style={{ color: "var(--color-text-muted)" }}>
              No students found
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((student) => (
              <div
                key={student.id}
                className="flex items-center justify-between p-3 rounded-xl"
                style={{ background: "var(--color-bg-hover)" }}
              >
                <div className="flex items-center gap-3">
                  <Avatar name={student.name} size="sm" />
                  <div>
                    <p
                      className="text-sm font-medium"
                      style={{ color: "var(--color-text-primary)" }}
                    >
                      {student.name}
                    </p>
                    <p
                      className="text-xs"
                      style={{ color: "var(--color-text-muted)" }}
                    >
                      {student.email}
                    </p>
                  </div>
                </div>
                <p
                  className="text-xs"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  Joined {new Date(student.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
