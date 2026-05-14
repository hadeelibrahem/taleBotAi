import React from "react";
import "../styles/recentActivity.css";

const getIcon = (type) => {
  const icons = {
    created: "📘",
    finished: "✅",
    favorite: "💗",
    generated: "✨",
    started: "📖",
  };
  return icons[type] || "📌";
};

export default function RecentActivity({ data = [] }) {
  return (
    <div className="recent-activity-card">
      <div className="recent-activity-header">
        <div>
          <h2>Recent Activity</h2>
          <p>Your latest interactions</p>
        </div>
 
      </div>
      <div className="activity-list">
        {data.length === 0 ? (
          <p>No recent activity.</p>
        ) : (
          data.map((item) => (
            <div className="activity-item" key={item.id}>
              <div className="activity-left">
                <div className="activity-icon">{getIcon(item.activity_type)}</div>
                <div>
                  <h4>{item.description}</h4>
                  <p>{item.story_title}</p>
                </div>
              </div>
              <span className="activity-time">{item.time_ago}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}