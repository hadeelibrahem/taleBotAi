import React from "react";

const API_BASE = "http://127.0.0.1:8000/api";

export default function ChildSettings({
  preferences,
  setPreferences,
  onPassword,
}) {
  const token = localStorage.getItem("token");

  const options = [
    {
      id: "disable_story_sharing",
      icon: "📝",
      label: "Disable Story Sharing",
      enabled: !!preferences.disable_story_sharing,
    },
    {
      id: "reading_time_limits",
      icon: "📘",
      label: "Reading Time Limits",
      enabled: !!preferences.reading_time_limits,
      small: "⏱",
    },
  ];

  const toggleField = async (field) => {
    const newValue = !preferences[field];

    setPreferences((prev) => ({
      ...prev,
      [field]: newValue,
    }));

    try {
      const res = await fetch(`${API_BASE}/settings/preferences`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          [field]: newValue,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to save setting");
      }

      setPreferences((prev) => ({
        ...prev,
        ...data.data,
      }));
    } catch (err) {
      console.error("Failed to save child setting:", err);

      setPreferences((prev) => ({
        ...prev,
        [field]: !newValue,
      }));

      alert("Failed to save setting");
    }
  };

  return (
    <section className="settings-card middle-card">
      <h3 className="section-title">Child Profiles</h3>

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

      <div className="toggle-list">
        {options.map((item) => (
          <div key={item.id} className="toggle-row">
            <div className="toggle-label-wrap">
              <span className="toggle-icon">{item.icon}</span>
              <span className="toggle-label">{item.label}</span>
            </div>

            <div className="toggle-right-wrap">
              {item.small && (
                <span className="small-side-icon">{item.small}</span>
              )}

              <button
                type="button"
                className={`toggle-switch ${item.enabled ? "is-on" : ""}`}
                aria-label={item.label}
                onClick={() => toggleField(item.id)}
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