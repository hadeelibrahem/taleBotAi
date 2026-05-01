import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Bug, Clock3, RefreshCw, Search, ShieldCheck, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SectionTitle, StatCard } from "./components";
import { clearAdminLogs, fetchAdminLogs } from "@/services/adminApi";

const levelStyles = {
  emergency: "admin-log-level--danger",
  alert: "admin-log-level--danger",
  critical: "admin-log-level--danger",
  error: "admin-log-level--danger",
  warning: "admin-log-level--warning",
  notice: "admin-log-level--notice",
  info: "admin-log-level--info",
  debug: "admin-log-level--debug",
};

export default function LogsView() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [levelFilter, setLevelFilter] = useState("All");
  const [clearing, setClearing] = useState(false);

  async function loadLogs() {
    try {
      setLoading(true);
      setError("");
      setLogs(await fetchAdminLogs());
    } catch (loadError) {
      setError(loadError.message || "Failed to load logs.");
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadLogs();
  }, []);

  async function clearLogs() {
    const confirmed = window.confirm("Clear the Laravel log file?");
    if (!confirmed) {
      return;
    }

    try {
      setClearing(true);
      setError("");
      setLogs(await clearAdminLogs());
    } catch (clearError) {
      setError(clearError.message || "Failed to clear logs.");
    } finally {
      setClearing(false);
    }
  }

  const levels = useMemo(() => {
    return ["All", ...Array.from(new Set(logs.map((log) => log.type))).sort()];
  }, [logs]);

  const filteredLogs = useMemo(() => {
    const keyword = query.trim().toLowerCase();

    return logs.filter((log) => {
      const matchesLevel = levelFilter === "All" || log.type === levelFilter;
      const matchesQuery = !keyword || [log.type, log.source, log.detail, log.message, log.environment]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(keyword);

      return matchesLevel && matchesQuery;
    });
  }, [levelFilter, logs, query]);

  const stats = useMemo(() => {
    const errors = logs.filter((log) => ["error", "critical", "alert", "emergency"].includes(log.level)).length;
    const warnings = logs.filter((log) => log.level === "warning").length;
    const healthy = logs.length - errors - warnings;

    return [
      { title: "Total Logs", value: String(logs.length), change: `${filteredLogs.length} visible`, icon: Bug },
      { title: "Errors", value: String(errors), change: `${errors} urgent`, icon: AlertTriangle },
      { title: "Warnings", value: String(warnings), change: `${warnings} review`, icon: Clock3 },
      { title: "Other Events", value: String(Math.max(healthy, 0)), change: "tracked", icon: ShieldCheck },
    ];
  }, [filteredLogs.length, logs]);

  return (
    <div className="admin-page-stack">
      <SectionTitle title="Logs & Errors" subtitle="Track API issues, failures, and service health." />

      <div className="admin-stats-grid">
        {stats.map((item) => (
          <StatCard key={item.title} {...item} />
        ))}
      </div>

      {error ? <div className="admin-error-message">{error}</div> : null}

      <Card className="admin-panel-card">
        <CardContent className="admin-logs-content">
          <div className="admin-logs-header">
            <div>
              <h3 className="admin-data-title">Laravel Logs</h3>
              <p className="admin-data-description">Latest 100 entries from storage/logs/laravel.log.</p>
            </div>
            <div className="admin-logs-controls">
              <div className="admin-search-field">
                <Search className="admin-search-icon" />
                <Input
                  className="admin-search-input"
                  placeholder="Search logs..."
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                />
              </div>
              <div className="admin-filter-row">
                {levels.map((level) => (
                  <Button
                    key={level}
                    variant={levelFilter === level ? "default" : "outline"}
                    className="admin-button"
                    onClick={() => setLevelFilter(level)}
                  >
                    {level}
                  </Button>
                ))}
              </div>
              <Button className="admin-button" onClick={loadLogs} disabled={loading}>
                <RefreshCw className={`admin-icon-sm ${loading ? "admin-icon-spin" : ""}`} /> Refresh
              </Button>
              <Button variant="outline" className="admin-button admin-button--danger" onClick={clearLogs} disabled={clearing || !logs.length}>
                <Trash2 className="admin-icon-sm" /> Clear
              </Button>
            </div>
          </div>

          <div className="admin-logs-list">
            {filteredLogs.length ? (
              filteredLogs.map((log) => (
                <div key={log.id} className="admin-log-item">
                  <div className="admin-log-layout">
                    <div className="admin-log-copy">
                      <div className="admin-log-meta-row">
                        <Badge variant="secondary" className={`admin-log-level ${levelStyles[log.level] || levelStyles.debug}`}>
                          {log.type}
                        </Badge>
                        <span className="admin-log-source">{log.source}</span>
                        <span className="admin-log-environment">{log.environment}</span>
                      </div>
                      <p className="admin-log-detail">{log.detail}</p>
                    </div>
                    <div className="admin-log-time">
                      <Clock3 className="admin-icon-sm" />
                      {log.time}
                    </div>
                  </div>
                  {log.context ? (
                    <details className="admin-log-context">
                      <summary className="admin-log-context-summary">Context</summary>
                      <pre className="admin-log-context-raw">{log.raw}</pre>
                    </details>
                  ) : null}
                </div>
              ))
            ) : (
              <div className="admin-empty-state">
                {loading ? "Loading logs..." : "No logs match the current filters."}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
