import { useState, useEffect } from "react";
import Card from "../../components/ui/Card";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp, FileText, CheckCircle, Briefcase } from "lucide-react";
import api from "../../utils/api";

const COLORS = ['#007BFF', '#00CCCC', '#00C853', '#FFD600'];

export default function AdminAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const res = await api.get("/admin/analytics");
      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );

  if (!data)
    return (
      <Card>
        <p
          className="text-center py-8"
          style={{ color: "var(--color-text-muted)" }}
        >
          Failed to load analytics
        </p>
      </Card>
    );

  const tooltipStyle = {
    backgroundColor: 'var(--color-bg-card)',
    border:          '1px solid rgba(0,123,255,0.3)',
    borderRadius:    '12px',
    color:           'var(--color-text-primary)',
    boxShadow:       '0 8px 30px rgba(0,0,0,0.3)',
  };

  return (
    <div className="space-y-6 fade-in">
      <div>
        <h2
          className="text-xl font-bold"
          style={{ color: "var(--color-text-primary)" }}
        >
          Platform Analytics
        </h2>
        <p
          className="text-sm mt-1"
          style={{ color: "var(--color-text-muted)" }}
        >
          Last 30 days performance overview
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            label: "Applications (30d)",
            value: data.summary.totalApplications,
            icon: FileText,
            color: "#3B82F6",
            bg: "rgba(59,130,246,0.1)",
          },
          {
            label: "Jobs Posted (30d)",
            value: data.summary.totalJobs,
            icon: Briefcase,
            color: "#06B6D4",
            bg: "rgba(6,182,212,0.1)",
          },
          {
            label: "Successful Hires",
            value: data.summary.hiredCount,
            icon: CheckCircle,
            color: "#10B981",
            bg: "rgba(16,185,129,0.1)",
          },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <Card key={label}>
            <div className="flex items-center justify-between">
              <div>
                <p
                  className="text-xs font-medium mb-1"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  {label}
                </p>
                <p className="text-3xl font-bold" style={{ color }}>
                  {value}
                </p>
              </div>
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: bg }}
              >
                <Icon size={20} style={{ color }} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Applications line chart */}
      <Card>
        <h3
          className="font-semibold mb-5"
          style={{ color: "var(--color-text-primary)" }}
        >
          Daily Applications (Last 14 Days)
        </h3>
        {data.appChartData.length === 0 ? (
          <p
            className="text-center py-8 text-sm"
            style={{ color: "var(--color-text-muted)" }}
          >
            No application data yet
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={data.appChartData}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--color-border)"
              />
              <XAxis
                dataKey="date"
                tick={{ fill: "var(--color-text-muted)", fontSize: 12 }}
              />
              <YAxis tick={{ fill: "var(--color-text-muted)", fontSize: 12 }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Line
                type="monotone" dataKey="count" name="Applications"
                stroke="#007BFF" strokeWidth={2.5}
                dot={{ fill: '#007BFF', r: 4, strokeWidth: 0 }}
                activeDot={{ r: 6, fill: '#00FFFF' }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Jobs bar chart */}
        <Card>
          <h3
            className="font-semibold mb-5"
            style={{ color: "var(--color-text-primary)" }}
          >
            Jobs Posted by Week
          </h3>
          {data.jobChartData.length === 0 ? (
            <p
              className="text-center py-8 text-sm"
              style={{ color: "var(--color-text-muted)" }}
            >
              No job data yet
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={data.jobChartData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--color-border)"
                />
                <XAxis
                  dataKey="week"
                  tick={{ fill: "var(--color-text-muted)", fontSize: 11 }}
                />
                <YAxis
                  tick={{ fill: "var(--color-text-muted)", fontSize: 11 }}
                />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="count" name="Jobs" fill="url(#barGradient)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
          <defs>
            <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor="#007BFF" stopOpacity={1}   />
              <stop offset="100%" stopColor="#00CCCC" stopOpacity={0.8} />
            </linearGradient>
          </defs>
        </Card>

        {/* Job type pie chart */}
        <Card>
          <h3
            className="font-semibold mb-5"
            style={{ color: "var(--color-text-primary)" }}
          >
            Job Type Distribution
          </h3>
          {data.typeChartData.every((d) => d.value === 0) ? (
            <p
              className="text-center py-8 text-sm"
              style={{ color: "var(--color-text-muted)" }}
            >
              No job data yet
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={data.typeChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {data.typeChartData.map((entry, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
                <Legend
                  formatter={(value) => (
                    <span
                      style={{
                        color: "var(--color-text-secondary)",
                        fontSize: "12px",
                      }}
                    >
                      {value}
                    </span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </Card>

        {/* Application status pie chart */}
        <Card>
          <h3
            className="font-semibold mb-5"
            style={{ color: "var(--color-text-primary)" }}
          >
            Application Status Breakdown
          </h3>
          {data.statusChartData.every((d) => d.value === 0) ? (
            <p
              className="text-center py-8 text-sm"
              style={{ color: "var(--color-text-muted)" }}
            >
              No application data yet
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={data.statusChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {data.statusChartData.map((entry, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
                <Legend
                  formatter={(value) => (
                    <span
                      style={{
                        color: "var(--color-text-secondary)",
                        fontSize: "12px",
                      }}
                    >
                      {value}
                    </span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </Card>

        {/* Recent registrations */}
        <Card>
          <h3
            className="font-semibold mb-4"
            style={{ color: "var(--color-text-primary)" }}
          >
            Recent Registrations
          </h3>
          <div className="space-y-3">
            {data.recentUsers.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-3 rounded-xl"
                style={{ background: "var(--color-bg-hover)" }}
              >
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
                <div className="text-right">
                  <span
                    className={`text-xs px-2 py-1 rounded-full capitalize font-medium ${
                      user.role === "student"
                        ? "bg-blue-500/15 text-blue-400"
                        : user.role === "company"
                          ? "bg-purple-500/15 text-purple-400"
                          : "bg-red-500/15 text-red-400"
                    }`}
                  >
                    {user.role}
                  </span>
                  <p
                    className="text-xs mt-1"
                    style={{ color: "var(--color-text-muted)" }}
                  >
                    {new Date(user.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
