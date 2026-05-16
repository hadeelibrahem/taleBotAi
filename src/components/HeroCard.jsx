import React from "react";
import { NavLink } from "react-router-dom";
import "../styles/HeroCard.css";

function HeroCard({ data, isChildDashboard = false, childId }) {
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

        <h1>{data?.title || greeting}</h1>

        <p>{data?.subtitle}</p>

        {isChildDashboard && (
          <div className="hero-buttons">
            <NavLink
              to={`/child/${childId}/create`}
              className="btn-primary hero-link"
            >
              <span>🖋️</span>{" "}
              {data?.actions?.[0]?.label || "Create Story"}
            </NavLink>

            <NavLink
              to={`/child/${childId}/stories`}
              className="btn-secondary hero-link"
            >
              {data?.actions?.[1]?.label || "My Stories"} →
            </NavLink>
          </div>
        )}
      </div>
    </div>
  );
}

export default HeroCard;