import "../styles/StatCard.css";

function StatCard({ title, subtitle, icon, badge, color }) {
  return (
    <div className="stat-card">
      <div className="stat-top">
        <div className="stat-dot" style={{ background: color }}></div>
        {badge && <span className="stat-badge">{badge}</span>}
      </div>

      <div className="stat-content">
        <div className="stat-text">
          <h3>{title}</h3>
          <p>{subtitle}</p>
        </div>

        <div className="stat-icon">
          <span>{icon}</span>
        </div>
      </div>
    </div>
  );
}

export default StatCard;