import React, { useState } from "react";

const initialFiltering = [
  { id: 1, icon: "🏰", label: "Fantasy & Adventure", enabled: false },
  { id: 2, icon: "🖼", label: "Cartoon Style", enabled: false },
];

const initialPrefs = [
  { id: 1, label: "New Story Suggestions", enabled: false },
  { id: 2, label: "Reading Reminders", enabled: false },
  { id: 3, label: "Account Updates", enabled: false },
];

export default function Preferences({ onDeleteConfirm }) {
  const [filtering, setFiltering] = useState(initialFiltering);
  const [prefs, setPrefs]         = useState(initialPrefs);
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleted, setDeleted]     = useState(false);

  const toggleFilter = (id) =>
    setFiltering((prev) => prev.map((o) => (o.id === id ? { ...o, enabled: !o.enabled } : o)));

  const togglePref = (id) =>
    setPrefs((prev) => prev.map((o) => (o.id === id ? { ...o, enabled: !o.enabled } : o)));

  const handleDeleteYes = () => {
    setShowConfirm(false);
    setDeleted(true);
    setTimeout(() => setDeleted(false), 3000);
    if (onDeleteConfirm) onDeleteConfirm();
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
                onClick={() => toggleFilter(item.id)}
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
                onClick={() => togglePref(item.id)}
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
          >
             Delete Account
          </button>
        </div>
      </section>

      {/* ── Confirm Delete Modal ── */}
      {showConfirm && (
        <div className="confirm-overlay" onClick={() => setShowConfirm(false)}>
          <div className="confirm-box" onClick={(e) => e.stopPropagation()}>
            <h3 className="confirm-title">Delete Account?</h3>
            <p className="confirm-msg">
              This will permanently delete your account and all data. Are you sure?
            </p>
            <div className="confirm-actions">
              <button className="confirm-no"  onClick={() => setShowConfirm(false)}>
                No, Keep it
              </button>
              <button className="confirm-yes" onClick={handleDeleteYes}>
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Deleted Toast ── */}
      {deleted && (
        <div className="action-toast toast-delete">
           Account deleted successfully
        </div>
      )}
    </>
  );
}