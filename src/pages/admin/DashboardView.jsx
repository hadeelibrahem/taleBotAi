import { useEffect, useMemo, useState } from "react";
import { BarChart3, BookOpen, Image as ImageIcon, RefreshCw, ShieldAlert, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SectionTitle, StatCard, StatusBadge } from "./components";
import { fetchAdminDashboard } from "@/services/adminApi";

function ActivityCandleChart({ data, loading }) {
  const width = 960;
  const height = 320;
  const padding = { top: 24, right: 26, bottom: 38, left: 36 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  const values = data.flatMap((item) => [item.open, item.high, item.low, item.close]);
  const minValue = Math.min(...values, 0);
  const maxValue = Math.max(...values, 1);
  const range = Math.max(maxValue - minValue, 1);
  const candleGap = chartWidth / Math.max(data.length, 1);
  const bodyWidth = Math.max(4, Math.min(10, candleGap * 0.52));
  const labelEvery = Math.max(1, Math.ceil(data.length / 7));

  function y(value) {
    return padding.top + ((maxValue - value) / range) * chartHeight;
  }

  if (!data.length) {
    return (
      <div className="admin-chart-empty">
        {loading ? "Loading activity chart..." : "No activity data yet."}
      </div>
    );
  }

  return (
    <div className="admin-chart-scroll">
      <svg viewBox={`0 0 ${width} ${height}`} className="admin-chart-svg" role="img" aria-label="45 day activity candle chart">
        <rect width={width} height={height} fill="#ffffff" />
        {[0, 0.25, 0.5, 0.75, 1].map((step) => {
          const gridY = padding.top + chartHeight * step;
          const value = Math.round(maxValue - range * step);

          return (
            <g key={step}>
              <line x1={padding.left} x2={width - padding.right} y1={gridY} y2={gridY} stroke="#eef2f7" />
              <text x={padding.left - 10} y={gridY + 4} textAnchor="end" className="admin-chart-label">
                {value}
              </text>
            </g>
          );
        })}

        <path
          d={data
            .map((item, index) => {
              const x = padding.left + candleGap * index + candleGap / 2;
              return `${index === 0 ? "M" : "L"} ${x} ${y(item.close)}`;
            })
            .join(" ")}
          fill="none"
          stroke="#cbd5e1"
          strokeWidth="1.5"
        />

        {data.map((item, index) => {
          const x = padding.left + candleGap * index + candleGap / 2;
          const openY = y(item.open);
          const closeY = y(item.close);
          const highY = y(item.high);
          const lowY = y(item.low);
          const color = item.direction === "up" ? "#2ca66f" : "#ef6b57";
          const bodyTop = Math.min(openY, closeY);
          const bodyHeight = Math.max(Math.abs(closeY - openY), 3);

          return (
            <g key={item.date}>
              <line x1={x} x2={x} y1={highY} y2={lowY} stroke={color} strokeWidth="1.4" strokeLinecap="round" />
              <rect
                x={x - bodyWidth / 2}
                y={bodyTop}
                width={bodyWidth}
                height={bodyHeight}
                rx="1.5"
                fill={color}
                opacity="0.92"
              />
              {index % labelEvery === 0 || index === data.length - 1 ? (
                <text x={x} y={height - 14} textAnchor="middle" className="admin-chart-label">
                  {item.label}
                </text>
              ) : null}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export default function DashboardView() {
  const [dashboard, setDashboard] = useState({
    stats: {},
    storyTrend: [],
    recentAlerts: [],
    recentStories: [],
    recentUsers: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadDashboard() {
    try {
      setLoading(true);
      setError("");
      const payload = await fetchAdminDashboard();
      setDashboard({
        stats: payload.stats || {},
        storyTrend: Array.isArray(payload.storyTrend) ? payload.storyTrend : [],
        recentAlerts: Array.isArray(payload.recentAlerts) ? payload.recentAlerts : [],
        recentStories: Array.isArray(payload.recentStories) ? payload.recentStories : [],
        recentUsers: Array.isArray(payload.recentUsers) ? payload.recentUsers : [],
      });
    } catch (loadError) {
      setError(loadError.message || "Failed to load dashboard.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  const stats = useMemo(() => [
    {
      title: "Total Users",
      value: String(dashboard.stats.totalUsers || 0),
      change: `${dashboard.stats.premiumUsers || 0} premium`,
      icon: Users,
    },
    {
      title: "Stories Created",
      value: String(dashboard.stats.totalStories || 0),
      change: `${dashboard.stats.pendingStories || 0} pending`,
      icon: BookOpen,
    },
    {
      title: "Images Generated",
      value: String(dashboard.stats.generatedImages || 0),
      change: "stored pages",
      icon: ImageIcon,
    },
    {
      title: "API Errors",
      value: String(dashboard.stats.apiErrors || 0),
      change: "in log file",
      icon: ShieldAlert,
    },
  ], [dashboard.stats]);

  return (
    <div className="admin-page-stack">
      <div className="admin-page-header">
        <SectionTitle title="Dashboard" subtitle="Overview of your TaleBot AI system activity." />
        <Button className="admin-button" onClick={loadDashboard} disabled={loading}>
          <RefreshCw className={`admin-icon-sm ${loading ? "admin-icon-spin" : ""}`} /> Refresh
        </Button>
      </div>

      {error ? <div className="admin-error-message">{error}</div> : null}

      <div className="admin-stats-grid">
        {stats.map((item) => (
          <StatCard key={item.title} {...item} />
        ))}
      </div>

      <div className="admin-dashboard-grid">
        <Card className="admin-panel-card admin-dashboard-chart-card">
          <CardHeader>
            <CardTitle className="admin-card-title admin-card-title-row">
              <BarChart3 className="admin-icon-md" /> 45-Day Activity Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="admin-chart-card-inner">
              <ActivityCandleChart data={dashboard.storyTrend} loading={loading} />
              <div className="admin-chart-legend">
                <span className="admin-chart-legend-item"><span className="admin-chart-legend-swatch admin-chart-legend-swatch--up" /> Higher activity close</span>
                <span className="admin-chart-legend-item"><span className="admin-chart-legend-swatch admin-chart-legend-swatch--down" /> Lower activity close</span>
                <span>Wicks include image and new-user activity.</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="admin-panel-card">
          <CardHeader>
            <CardTitle className="admin-card-title">Recent Alerts</CardTitle>
          </CardHeader>
          <CardContent className="admin-dashboard-list">
            {dashboard.recentAlerts.length ? dashboard.recentAlerts.map((log) => (
              <div key={log.id} className="admin-list-card admin-list-card--soft">
                <div className="admin-list-card-header">
                  <Badge variant="secondary">{log.type}</Badge>
                  <span className="admin-list-time">{log.time}</span>
                </div>
                <p className="admin-list-title">{log.source}</p>
                <p className="admin-list-detail">{log.detail}</p>
              </div>
            )) : (
              <div className="admin-empty-state admin-empty-state--soft">
                {loading ? "Loading alerts..." : "No alerts in the log file."}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="admin-two-column-grid">
        <Card className="admin-panel-card">
          <CardHeader>
            <CardTitle className="admin-card-title">Recent Stories</CardTitle>
          </CardHeader>
          <CardContent className="admin-list-stack">
            {dashboard.recentStories.length ? dashboard.recentStories.map((story) => (
              <div key={story.id} className="admin-list-row-card">
                <div>
                  <p className="admin-list-row-title">{story.title}</p>
                  <p className="admin-list-row-meta">{story.author || "Unknown"} - {story.genre} - {story.createdAt}</p>
                </div>
                <StatusBadge status={story.status} />
              </div>
            )) : (
              <div className="admin-empty-state">
                {loading ? "Loading stories..." : "No stories created yet."}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="admin-panel-card">
          <CardHeader>
            <CardTitle className="admin-card-title">Newest Users</CardTitle>
          </CardHeader>
          <CardContent className="admin-list-stack">
            {dashboard.recentUsers.length ? dashboard.recentUsers.map((user) => (
              <div key={user.id} className="admin-list-row-card">
                <div>
                  <p className="admin-list-row-title">{user.name}</p>
                  <p className="admin-list-row-meta">{user.email} - {user.plan} - {user.joinedAt}</p>
                </div>
                <StatusBadge status={user.status} />
              </div>
            )) : (
              <div className="admin-empty-state">
                {loading ? "Loading users..." : "No users found."}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
