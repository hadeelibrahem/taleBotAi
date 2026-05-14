import React, { useState } from "react";

export default function Preferences({ preferences, setPreferences, onDeleteConfirm }) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleted, setDeleted] = useState(false);

  const filtering = [
    {
      id: "fantasy_adventure_enabled",
      icon: "🏰",
      label: "Fantasy & Adventure",
      enabled: !!preferences.fantasy_adventure_enabled,
    },
    {
      id: "cartoon_style_enabled",
      icon: "🖼",
      label: "Cartoon Style",
      enabled: !!preferences.cartoon_style_enabled,
    },
  ];

  const prefs = [
    {
      id: "new_story_suggestions",
      label: "New Story Suggestions",
      enabled: !!preferences.new_story_suggestions,
    },
    {
      id: "reading_reminders",
      label: "Reading Reminders",
      enabled: !!preferences.reading_reminders,
    },
    {
      id: "account_updates",
      label: "Account Updates",
      enabled: !!preferences.account_updates,
    },
  ];

  const toggleField = (field) => {
    setPreferences((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const handleDeleteYes = async () => {
    try {
      if (onDeleteConfirm) {
        await onDeleteConfirm();
      }
      setShowConfirm(false);
      setDeleted(true);
      setTimeout(() => setDeleted(false), 3000);
    } catch (err) {
      alert(err.message || "Failed to delete account");
    }
  };

  return (
    <>
      <section className="settings-card">
        <h3 className="section-title">Content Filtering</h3>

        <div className="toggle-list">
          {filtering.map((item) => (
            <div key={item.id} className="toggle-row">
              <div className="toggle-label-wrap">
                <span className="toggle-icon">{item.icon}</span>
                <span className="toggle-label">{item.label}</span>
              </div>
              <button
                className={`toggle-switch ${item.enabled ? "is-on" : ""}`}
                aria-label={item.label}
                onClick={() => toggleField(item.id)}
                type="button"
              >
                <span className="toggle-knob" />
              </button>
            </div>
          ))}
        </div>

        <div className="section-divider" />

        <h3 className="section-title app-pref-title">App Preferences</h3>

        <div className="toggle-list">
          {prefs.map((item) => (
            <div key={item.id} className="toggle-row">
              <div className="toggle-label-wrap">
                <span className="empty-radio" />
                <span className="toggle-label">{item.label}</span>
              </div>
              <button
                className={`toggle-switch ${item.enabled ? "is-on" : ""}`}
                aria-label={item.label}
                onClick={() => toggleField(item.id)}
                type="button"
              >
                <span className="toggle-knob" />
              </button>
            </div>
          ))}
        </div>

        <div className="delete-btn-wrap">
          <button
            className="delete-account-btn"
            onClick={() => setShowConfirm(true)}
            type="button"
          >
            Delete Account
          </button>
        </div>
      </section>

      {showConfirm && (
        <div className="confirm-overlay" onClick={() => setShowConfirm(false)}>
          <div className="confirm-box" onClick={(e) => e.stopPropagation()}>
            <h3 className="confirm-title">Delete Account?</h3>
            <p className="confirm-msg">
              This will permanently delete your account and all data. Are you sure?
            </p>
            <div className="confirm-actions">
              <button className="confirm-no" onClick={() => setShowConfirm(false)}>
                No, Keep it
              </button>
              <button className="confirm-yes" onClick={handleDeleteYes}>
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {deleted && (
        <div className="action-toast toast-delete">
          Account deleted successfully
        </div>
      )}
    </>
  );
}