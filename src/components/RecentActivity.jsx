import React from "react";
import "../styles/recentActivity.css";

const activities = [
  {
    id: 1,
    title: "Created a new story",
    subtitle: "The Dragon's Magical Garden",
    time: "2 hours ago",
    icon: "📘",
  },
  {
    id: 2,
    title: "Finished reading",
    subtitle: "Castle in the Clouds",
    time: "5 hours ago",
    icon: "✅",
  },
  {
    id: 3,
    title: "Marked as favorite",
    subtitle: "Starlight Dreams",
    time: "Yesterday",
    icon: "💗",
  },
  {
    id: 4,
    title: "AI generated story",
    subtitle: "Rainbow Adventure",
    time: "2 days ago",
    icon: "✨",
  },
  {
    id: 5,
    title: "Started reading",
    subtitle: "Under the Ocean Waves",
    time: "3 days ago",
    icon: "📖",
  },
];

export default function RecentActivity() {
  return (
    <div className="recent-activity-card">
      <div className="recent-activity-header">
        <div>
          <h2>Recent Activity</h2>
          <p>Your latest interactions</p>
        </div>
        <button>View all</button>
      </div>

      <div className="activity-list">
        {activities.map((item) => (
          <div className="activity-item" key={item.id}>
            <div className="activity-left">
              <div className="activity-icon">{item.icon}</div>
              <div>
                <h4>{item.title}</h4>
                <p>{item.subtitle}</p>
              </div>
            </div>
            <span className="activity-time">{item.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}