import React, { useState } from "react";

const initialOptions = [
  { id: 1, icon: "🧸", label: "Moderate Language", enabled: false },
  { id: 2, icon: "📝", label: "Disable Story Sharing", enabled: false },
  { id: 3, icon: "🛡", label: "Safe Content Filter", enabled: false },
  { id: 4, icon: "📘", label: "Reading Time Limits", enabled: false, small: "⏱" },
];

export default function ChildSettings({ onPassword }) {
  const [options, setOptions] = useState(initialOptions);

  const toggle = (id) => {
    setOptions((prev) =>
      prev.map((o) => (o.id === id ? { ...o, enabled: !o.enabled } : o))
    );
  };

  return (
    <section className="settings-card middle-card">
      <h3 className="section-title">Child Profiles</h3>

      <div className="plan-boxes">
        <div className="mini-plan-box">Premium Plan</div>
        <button
          type="button"
          className="gradient-action-btn"
          onClick={onPassword}
        >
          Manage Password
        </button>
      </div>

      <div className="section-divider" />

      <div className="toggle-list">
        {options.map((item) => (
          <div key={item.id} className="toggle-row">
            <div className="toggle-label-wrap">
              <span className="toggle-icon">{item.icon}</span>
              <span className="toggle-label">{item.label}</span>
            </div>

            <div className="toggle-right-wrap">
              {item.small && <span className="small-side-icon">{item.small}</span>}
              <button
                type="button"
                className={`toggle-switch ${item.enabled ? "is-on" : ""}`}
                aria-label={item.label}
                onClick={() => toggle(item.id)}
              >
                <span className="toggle-knob" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}