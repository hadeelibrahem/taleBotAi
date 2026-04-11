import React from "react";
import "../styles/aiInsights.css";

export default function AiInsights() {
  return (
    <div className="ai-insights-card">
      <div className="ai-insights-header">
        <h2>AI Insights</h2>
        <p>Personalized recommendations</p>
      </div>

      <div className="insight-box">
        <h4>Most Popular Theme</h4>
        <p>
          Emma loves magical creatures and friendship stories. Try combining them!
        </p>
      </div>

      <div className="insight-box">
        <h4>Suggested Moral</h4>
        <p>
          “Kindness creates lasting friendships” would be perfect for your next story.
        </p>
      </div>

      <button className="generate-story-btn">Generate AI Story</button>

      <div className="ai-stats">
        <div>
          <h3>92%</h3>
          <p>Completion Rate</p>
        </div>
        <div>
          <h3>4.9</h3>
          <p>Avg Rating</p>
        </div>
      </div>
    </div>
  );
}