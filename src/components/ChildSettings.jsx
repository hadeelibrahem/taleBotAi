import React from "react";

export default function ChildSettings({ onPassword }) {
  return (
    <section className="settings-card middle-card">
      <div className="plan-boxes">
        <button
          type="button"
          className="gradient-action-btn"
          onClick={onPassword}
        >
          Manage Password
        </button>
      </div>

      <div className="section-divider" />
    </section>
  );
}