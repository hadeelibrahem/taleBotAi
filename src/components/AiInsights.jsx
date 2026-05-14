import React from "react";
import "../styles/aiInsights.css";

export default function AiInsights({ data = [], stats = {} }) {
  return (
    <div className="ai-insights-card">
      <div className="ai-insights-header">
        <h2>AI Insights</h2>
        <p>Personalized recommendations</p>
      </div>


      {data.map((insight, index) => (
        <div className="insight-box" key={index}>
          <h4>{insight.title}</h4>
          <p>{insight.content}</p>
        </div>
      ))}

    
      <div className="ai-stats">
        <div>
          <h3>{stats?.completion_rate ?? 0}%</h3>
          <p>Completion Rate</p>
        </div>
        <div>
          <h3>{stats?.avg_rating ?? 0}</h3>
          <p>Avg Rating</p>
        </div>
      </div>
    </div>
  );
}