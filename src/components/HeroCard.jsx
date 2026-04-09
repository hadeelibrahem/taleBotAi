import React from 'react';
import "../styles/HeroCard.css";

function HeroCard() {
  return (
    <div className="hero-container">
      <div className="hero-content">
        <span className="badge">✨ AI-Powered Stories</span>
        <h1>Good evening, Sarah! </h1>
        <p>
          You've crafted 12 enchanting tales this month. Ready to dream
          up another magical bedside story?
        </p>
        <div className="hero-buttons">
          <button className="btn-primary">
            <span>🖋️</span> Create New Story
          </button>
          <button className="btn-secondary">
         View All Stories  →
          </button>
        </div>
      </div>
    </div>
  );
}
export default HeroCard;