import { useState } from "react";
import { useToast } from "../../components/ui/Toast";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { BarChart3, Download, Calendar, FileText } from "lucide-react";
import api from "../../utils/api";

export default function AdminReports() {
  const { addToast } = useToast();
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchReport = async () => {
    if (!from || !to) {
      addToast("Please select a date range", "error");
      return;
    }
    setLoading(true);
    try {
      const res = await api.get(`/admin/analytics?from=${from}&to=${to}`);
      setData(res.data);
      addToast("Report generated successfully", "success");
    } catch (err) {
      addToast("Failed to generate report", "error");
    } finally {
      setLoading(false);
    }
  };

  const exportCSV = () => {
    if (!data) return;

    const rows = [
      ["Date", "Applications"],
      ...data.appChartData.map((d) => [d.date, d.count]),
      [],
      ["Summary"],
      ["Total Applications", data.summary.totalApplications],
      ["Total Jobs Posted", data.summary.totalJobs],
      ["Successful Hires", data.summary.hiredCount],
      [],
      ["Job Type", "Count"],
      ...data.typeChartData.map((d) => [d.name, d.value]),
      [],
      ["Application Status", "Count"],
      ...data.statusChartData.map((d) => [d.name, d.value]),
    ];

    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `CareerNexus_Report_${from}_to_${to}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    addToast("CSV downloaded successfully", "success");
  };

  return (
    <div className="space-y-6 fade-in">
      <div>
        <h2
          className="text-xl font-bold"
          style={{ color: "var(--color-text-primary)" }}
        >
          Reports
        </h2>
        <p
          className="text-sm mt-1"
          style={{ color: "var(--color-text-muted)" }}
        >
          Generate and export platform activity reports
        </p>
      </div>

      {/* Date range selector */}
      <Card>
        <h3
          className="font-semibold mb-4 flex items-center gap-2"
          style={{ color: "var(--color-text-primary)" }}
        >
          <Calendar size={18} style={{ color: "#3B82F6" }} />
          Select Date Range
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <Input
            label="From Date"
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            icon={Calendar}
          />
          <Input
            label="To Date"
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            icon={Calendar}
          />
        </div>
        <div className="flex gap-3">
          <Button
            variant="primary"
            icon={BarChart3}
            onClick={fetchReport}
            disabled={loading}
          >
            {loading ? "Generating..." : "Generate Report"}
          </Button>
          {data && (
            <Button variant="outline" icon={Download} onClick={exportCSV}>
              Export CSV
            </Button>
          )}
        </div>
      </Card>

      {/* Report results */}
      {data && (
        <div className="space-y-4 fade-in">
          {/* Summary */}
          <div className="grid grid-cols-3 gap-4">
            {[
              {
                label: "Total Applications",
                value: data.summary.totalApplications,
                color: "#3B82F6",
              },
              {
                label: "Jobs Posted",
                value: data.summary.totalJobs,
                color: "#06B6D4",
              },
              {
                label: "Successful Hires",
                value: data.summary.hiredCount,
                color: "#10B981",
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
                  {s.value}
                </p>
                <p
                  className="text-xs mt-1"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  {from} → {to}
                </p>
              </Card>
            ))}
          </div>

          {/* Job type breakdown */}
          <Card>
            <h3
              className="font-semibold mb-4"
              style={{ color: "var(--color-text-primary)" }}
            >
              Job Type Breakdown
            </h3>
            <div className="space-y-3">
              {data.typeChartData.map((item) => (
                <div key={item.name}>
                  <div className="flex justify-between text-sm mb-1">
                    <span
                      className="capitalize"
                      style={{ color: "var(--color-text-secondary)" }}
                    >
                      {item.name}
                    </span>
                    <span style={{ color: "var(--color-text-primary)" }}>
                      {item.value}
                    </span>
                  </div>
                  <div
                    className="w-full h-2 rounded-full overflow-hidden"
                    style={{ background: "var(--color-bg-hover)" }}
                  >
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${data.summary.totalJobs > 0 ? (item.value / data.summary.totalJobs) * 100 : 0}%`,
                        background: "#3B82F6",
                        transition: "width 0.5s ease",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Application status breakdown */}
          <Card>
            <h3
              className="font-semibold mb-4"
              style={{ color: "var(--color-text-primary)" }}
            >
              Application Status Breakdown
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {data.statusChartData.map((item, i) => {
                const colors = ["#F59E0B", "#10B981", "#3B82F6", "#EF4444"];
                return (
                  <div
                    key={item.name}
                    className="text-center p-3 rounded-xl"
                    style={{ background: "var(--color-bg-hover)" }}
                  >
                    <p
                      className="text-2xl font-bold"
                      style={{ color: colors[i] }}
                    >
                      {item.value}
                    </p>
                    <p
                      className="text-xs capitalize mt-1"
                      style={{ color: "var(--color-text-muted)" }}
                    >
                      {item.name}
                    </p>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
