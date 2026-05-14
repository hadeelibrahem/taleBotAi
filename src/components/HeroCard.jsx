import React from "react";
import { NavLink } from "react-router-dom";
import "../styles/HeroCard.css";

function HeroCard({ data }) {
  const hour = new Date().getHours();

  let greeting = "";

  if (hour >= 5 && hour < 12) {
    greeting = "Good morning";
  } else if (hour >= 12 && hour < 18) {
    greeting = "Good evening";
  } else {
    greeting = "Good night";
  }

  return (
    <div className="hero-container">
      <div className="hero-content">
        <span className="badge">✨ {data?.badge || "AI-Powered Stories"}</span>

        <h1>
          {data?.title || greeting}
        </h1>

        <p>{data?.subtitle}</p>

        <div className="hero-buttons">
          <NavLink to="/create" className="btn-primary hero-link">
            <span>🖋️</span> {data?.actions?.[0]?.label || "Create New Story"}
          </NavLink>

          <NavLink to="/stories" className="btn-secondary hero-link">
            {data?.actions?.[1]?.label || "View All Stories"} →
          </NavLink>
        </div>
      </div>
    </div>
  );
}

export default HeroCard;