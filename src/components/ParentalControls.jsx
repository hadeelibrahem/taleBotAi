import React, { useState } from "react";

const defaultAvatar = "\u{1F9D2}";
const avatarOptions = [
  "\u{1F467}",
  "\u{1F466}",
  defaultAvatar,
  "\u{1F476}",
  "\u{1F9D1}",
  "\u{1F471}",
];
const hasPhotoConsent = (child) => Boolean(child?.allow_photo_usage);

export default function ParentalControls({ children, setChildren, apiBase, planLimits }) {
  const [activeId, setActiveId] = useState(null);
  const [editData, setEditData] = useState({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [newChild, setNewChild] = useState({
    avatar: defaultAvatar,
    name: "",
    age: "",
    allow_photo_usage: false,
  });

  const token = localStorage.getItem("token");
  const childProfileLimit = planLimits?.child_profile_limit ?? null;
  const childCount = (children || []).length;
  const reachedChildLimit =
    childProfileLimit !== null && childCount >= Number(childProfileLimit);

  const handleEdit = (child) => {
    if (activeId === child.id) {
      setActiveId(null);
      return;
    }

    setActiveId(child.id);
    setEditData({
      name: child.name || "",
      age: child.age || "",
      avatar: child.avatar || defaultAvatar,
      allow_photo_usage: hasPhotoConsent(child),
    });
  };

  const handleSave = async (id) => {
    try {
      const res = await fetch(`${apiBase}/settings/children/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: editData.name,
          age: Number(editData.age),
          avatar: editData.avatar,
          allow_photo_usage: Boolean(editData.allow_photo_usage),
        }),
      });

      if (!res.ok) throw new Error("Failed to update child");

      const result = await res.json();
      setChildren((prev) => prev.map((c) => (c.id === id ? result.data : c)));
      setActiveId(null);
    } catch (err) {
      alert(err.message || "Update failed");
    }
  };

  const handleAdd = async () => {
    if (!newChild.name.trim()) return;
    if (reachedChildLimit) {
      alert(`Your plan allows up to ${childProfileLimit} child profiles.`);
      setShowAddForm(false);
      return;
    }

    try {
      const response = await fetch(`${apiBase}/settings/children`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: newChild.name,
          age: Number(newChild.age),
          avatar: newChild.avatar,
          allow_photo_usage: Boolean(newChild.allow_photo_usage),
          reading_time_limit: null,
          safe_content_filter: false,
          disable_story_sharing: false,
          moderate_language: false,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Failed to add child");
        return;
      }

      setChildren((prev) => [...prev, data.data]);
      setNewChild({ avatar: defaultAvatar, name: "", age: "", allow_photo_usage: false });
      setShowAddForm(false);
      alert("Child added successfully!");
    } catch (error) {
      console.error(error);
      alert("Failed to add child");
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`${apiBase}/settings/children/${id}`, {
        method: "DELETE",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to delete child");

      setChildren((prev) => prev.filter((c) => c.id !== id));
      if (activeId === id) setActiveId(null);
    } catch (err) {
      alert(err.message || "Delete failed");
    }
  };

  const renderPhotoConsent = (value, onChange) => (
    <label className="photo-consent-row">
      <input
        type="checkbox"
        checked={Boolean(value)}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span className="photo-consent-copy">
        <strong>Allow child photo use</strong>
        <small>Parent agrees this child's photo may be used as a story character reference.</small>
      </span>
    </label>
  );

  return (
    <section className="settings-card">
      <h3 className="section-title">Parental Controls</h3>

      <div className="profile-list">
        {(children || []).map((child) => {
          const isActive = activeId === child.id;

          return (
            <div key={child.id} className="child-item">
              <div className="profile-row">
                <div className="profile-info">
                  <span className="profile-icon">{child.avatar || defaultAvatar}</span>
                  <div className="profile-name-wrap">
                    <span className="profile-name">{child.name}</span>
                    <span className="profile-age">Age {child.age}</span>
                    <span className={`photo-consent-badge ${hasPhotoConsent(child) ? "is-on" : ""}`}>
                      Photo use {hasPhotoConsent(child) ? "allowed" : "not allowed"}
                    </span>
                  </div>
                </div>

                <div className="profile-actions">
                  <button
                    className={`mini-edit-btn ${isActive ? "is-active" : ""}`}
                    onClick={() => handleEdit(child)}
                    type="button"
                  >
                    {isActive ? "Close" : "Edit"}
                  </button>

                  <button
                    className="mini-edit-btn"
                    onClick={() => handleDelete(child.id)}
                    type="button"
                  >
                    Delete
                  </button>
                </div>
              </div>

              <div className={`child-edit-panel ${isActive ? "is-open" : ""}`}>
                <div className="child-edit-inner">
                  <div className="edit-field-group">
                    <label className="edit-label">Avatar</label>
                    <div className="avatar-picker">
                      {avatarOptions.map((av) => (
                        <button
                          key={av}
                          type="button"
                          className={`avatar-option ${editData.avatar === av ? "selected" : ""}`}
                          onClick={() => setEditData((d) => ({ ...d, avatar: av }))}
                        >
                          {av}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="edit-field-group">
                    <label className="edit-label">Name</label>
                    <input
                      className="settings-input edit-input"
                      value={editData.name || ""}
                      onChange={(e) => setEditData((d) => ({ ...d, name: e.target.value }))}
                      placeholder="Child's name"
                    />
                  </div>

                  <div className="edit-field-group">
                    <label className="edit-label">Age</label>
                    <input
                      className="settings-input edit-input"
                      type="number"
                      min="1"
                      max="18"
                      value={editData.age || ""}
                      onChange={(e) => setEditData((d) => ({ ...d, age: e.target.value }))}
                      placeholder="Age"
                    />
                  </div>

                  {renderPhotoConsent(editData.allow_photo_usage, (checked) =>
                    setEditData((d) => ({ ...d, allow_photo_usage: checked }))
                  )}

                  <button className="save-child-btn" onClick={() => handleSave(child.id)} type="button">
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <button
        className={`add-child-btn ${showAddForm ? "is-cancel" : ""}`}
        onClick={() => {
          if (reachedChildLimit && !showAddForm) {
            alert(`Your plan allows up to ${childProfileLimit} child profiles.`);
            return;
          }

          setShowAddForm((v) => !v);
        }}
        disabled={reachedChildLimit && !showAddForm}
        type="button"
        title={
          reachedChildLimit
            ? `Your plan allows up to ${childProfileLimit} child profiles.`
            : undefined
        }
      >
        {showAddForm ? "Cancel" : "+ Add Child Profile"}
      </button>

      {reachedChildLimit && (
        <p className="plan-box-note">
          Child limit reached ({childCount}/{childProfileLimit})
        </p>
      )}

      <div className={`child-edit-panel add-child-panel ${showAddForm ? "is-open" : ""}`}>
        <div className="child-edit-inner">
          <div className="edit-field-group">
            <label className="edit-label">Avatar</label>
            <div className="avatar-picker">
              {avatarOptions.map((av) => (
                <button
                  key={av}
                  type="button"
                  className={`avatar-option ${newChild.avatar === av ? "selected" : ""}`}
                  onClick={() => setNewChild((d) => ({ ...d, avatar: av }))}
                >
                  {av}
                </button>
              ))}
            </div>
          </div>

          <div className="edit-field-group">
            <label className="edit-label">Name</label>
            <input
              className="settings-input edit-input"
              value={newChild.name}
              onChange={(e) => setNewChild((d) => ({ ...d, name: e.target.value }))}
              placeholder="Child's name"
            />
          </div>

          <div className="edit-field-group">
            <label className="edit-label">Age</label>
            <input
              className="settings-input edit-input"
              type="number"
              min="1"
              max="18"
              value={newChild.age}
              onChange={(e) => setNewChild((d) => ({ ...d, age: e.target.value }))}
              placeholder="Age"
            />
          </div>

          {renderPhotoConsent(newChild.allow_photo_usage, (checked) =>
            setNewChild((d) => ({ ...d, allow_photo_usage: checked }))
          )}

          <button className="save-child-btn" onClick={handleAdd} type="button">
            + Add Child
          </button>
        </div>
      </div>
    </section>
  );
}
