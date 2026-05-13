import { createElement } from "react";
import { motion as Motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";

export function SectionTitle({ title, subtitle }) {
  return (
    <Motion.div
      className="admin-section-heading"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      <h2 className="admin-section-title">{title}</h2>
      <p className="admin-section-subtitle">{subtitle}</p>
    </Motion.div>
  );
}

export function StatCard({ title, value, change, icon: Icon }) {
  return (
    <Motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
    >
      <Card className="admin-stat-card">
        <CardContent className="admin-stat-content">
          <div className="admin-stat-layout">
            <div>
              <p className="admin-stat-label">{title}</p>
              <h3 className="admin-stat-value">{value}</h3>
              <p className="admin-stat-change">{change} this week</p>
            </div>
            <div className="admin-stat-icon">
              {createElement(Icon, { className: "admin-icon-md" })}
            </div>
          </div>
        </CardContent>
      </Card>
    </Motion.div>
  );
}

export function StatusBadge({ status }) {
  const styles = {
    Active: "admin-status-badge--success",
    Banned: "admin-status-badge--danger",
    Suspended: "admin-status-badge--danger",
    Published: "admin-status-badge--success",
    Draft: "admin-status-badge--warning",
    Approved: "admin-status-badge--success",
    Pending: "admin-status-badge--warning",
    Rejected: "admin-status-badge--danger",
  };

  return (
    <span className={`admin-status-badge ${styles[status] || "admin-status-badge--neutral"}`}>
      {status}
    </span>
  );
}

export function AdminDataTable({ title, description, filters, columns, rows, emptyMessage = "No data available." }) {
  return (
    <Card className="admin-data-card">
      <CardContent className="admin-data-card-content">
        {(title || description || filters) && (
          <div className="admin-data-header">
            <div>
              {title ? <h3 className="admin-data-title">{title}</h3> : null}
              {description ? <p className="admin-data-description">{description}</p> : null}
            </div>
            {filters ? <div className="admin-data-filters">{filters}</div> : null}
          </div>
        )}

        <div className="admin-table-scroll">
          <table className="admin-table">
            <thead>
              <tr className="admin-table-head-row">
                {columns.map((column) => (
                  <th key={column.key} className={`admin-table-heading ${column.className || ""}`}>
                    {column.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.length ? (
                rows.map((row) => (
                  <tr key={row.id} className="admin-table-row">
                    {columns.map((column) => (
                      <td key={`${row.id}-${column.key}`} className={`admin-table-cell ${column.cellClassName || ""}`}>
                        {column.render ? column.render(row) : row[column.key]}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length} className="admin-table-empty">
                    {emptyMessage}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
