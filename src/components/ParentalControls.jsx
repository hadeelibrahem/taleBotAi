import React, { useState } from "react";

const initialChildren = [
  { id: 1, icon: "👧", name: "Sarah",  age: 7,  interests: "Stories, Drawing",  disabled: false },
  { id: 2, icon: "👦", name: "Liam",   age: 10, interests: "Science, Adventures", disabled: false },
  { id: 3, icon: "🧒", name: "Emma",   age: 5,  interests: "Animals, Music",    disabled: false },
];

const avatarOptions = ["👧","👦","🧒","👶","🧑","👱"];

export default function ParentalControls() {
  const [children, setChildren]     = useState(initialChildren);
  const [activeId, setActiveId]     = useState(null);
  const [editData, setEditData]     = useState({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [newChild, setNewChild]     = useState({ icon: "🧒", name: "", age: "", interests: "" });

  const handleEdit = (child) => {
    if (activeId === child.id) {
      setActiveId(null);
    } else {
      setActiveId(child.id);
      setEditData({ name: child.name, age: child.age, interests: child.interests, icon: child.icon });
    }
  };

  const handleSave = (id) => {
    setChildren((prev) =>
      prev.map((c) => c.id === id ? { ...c, ...editData } : c)
    );
    setActiveId(null);
  };

  const handleAdd = () => {
    if (!newChild.name.trim()) return;
    const id = Date.now();
    setChildren((prev) => [...prev, { ...newChild, id, disabled: false }]);
    setNewChild({ icon: "🧒", name: "", age: "", interests: "" });
    setShowAddForm(false);
  };

  return (
    <section className="settings-card">
      <h3 className="section-title">Parental Controls</h3>

      <div className="profile-list">
        {children.map((child) => {
          const isActive = activeId === child.id;
          return (
            <div key={child.id} className="child-item">

              {/* Row */}
              <div className="profile-row">
                <div className="profile-info">
                  <span className="profile-icon">{child.icon}</span>
                  <div className="profile-name-wrap">
                    <span className="profile-name">{child.name}</span>
                    <span className="profile-age">Age {child.age}</span>
                  </div>
                </div>

                <button
                  className={`mini-edit-btn ${child.disabled ? "is-disabled" : ""} ${isActive ? "is-active" : ""}`}
                  onClick={() => !child.disabled && handleEdit(child)}
                >
                  {isActive ? "✕ Close" : "✎ Edit"}
                </button>
              </div>

              {/* Expandable edit panel */}
              <div className={`child-edit-panel ${isActive ? "is-open" : ""}`}>
                <div className="child-edit-inner">

                  {/* Avatar picker */}
                  <div className="edit-field-group">
                    <label className="edit-label">Avatar</label>
                    <div className="avatar-picker">
                      {avatarOptions.map((av) => (
                        <button
                          key={av}
                          className={`avatar-option ${editData.icon === av ? "selected" : ""}`}
                          onClick={() => setEditData((d) => ({ ...d, icon: av }))}
                        >
                          {av}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Name */}
                  <div className="edit-field-group">
                    <label className="edit-label">Name</label>
                    <input
                      className="settings-input edit-input"
                      value={editData.name || ""}
                      onChange={(e) => setEditData((d) => ({ ...d, name: e.target.value }))}
                      placeholder="Child's name"
                    />
                  </div>

                  {/* Age */}
                  <div className="edit-field-group">
                    <label className="edit-label">Age</label>
                    <input
                      className="settings-input edit-input"
                      type="number"
                      min="1"
                      max="17"
                      value={editData.age || ""}
                      onChange={(e) => setEditData((d) => ({ ...d, age: e.target.value }))}
                      placeholder="Age"
                    />
                  </div>

                  {/* Interests */}
                  <div className="edit-field-group">
                    <label className="edit-label">Interests</label>
                    <input
                      className="settings-input edit-input"
                      value={editData.interests || ""}
                      onChange={(e) => setEditData((d) => ({ ...d, interests: e.target.value }))}
                      placeholder="e.g. Stories, Drawing"
                    />
                  </div>

                  <button className="save-child-btn" onClick={() => handleSave(child.id)}>
                    ✓ Save Changes
                  </button>
                </div>
              </div>

            </div>
          );
        })}
      </div>

      {/* Add Child button */}
      <button
        className={`add-child-btn ${showAddForm ? "is-cancel" : ""}`}
        onClick={() => setShowAddForm((v) => !v)}
      >
        {showAddForm ? "✕ Cancel" : "+ Add Child Profile"}
      </button>

      {/* Add Child form */}
      <div className={`child-edit-panel add-child-panel ${showAddForm ? "is-open" : ""}`}>
        <div className="child-edit-inner">

          {/* Avatar picker */}
          <div className="edit-field-group">
            <label className="edit-label">Avatar</label>
            <div className="avatar-picker">
              {avatarOptions.map((av) => (
                <button
                  key={av}
                  className={`avatar-option ${newChild.icon === av ? "selected" : ""}`}
                  onClick={() => setNewChild((d) => ({ ...d, icon: av }))}
                >
                  {av}
                </button>
              ))}
            </div>
          </div>

          {/* Name */}
          <div className="edit-field-group">
            <label className="edit-label">Name</label>
            <input
              className="settings-input edit-input"
              value={newChild.name}
              onChange={(e) => setNewChild((d) => ({ ...d, name: e.target.value }))}
              placeholder="Child's name"
            />
          </div>

          {/* Age */}
          <div className="edit-field-group">
            <label className="edit-label">Age</label>
            <input
              className="settings-input edit-input"
              type="number"
              min="1"
              max="17"
              value={newChild.age}
              onChange={(e) => setNewChild((d) => ({ ...d, age: e.target.value }))}
              placeholder="Age"
            />
          </div>

          {/* Interests */}
          <div className="edit-field-group">
            <label className="edit-label">Interests</label>
            <input
              className="settings-input edit-input"
              value={newChild.interests}
              onChange={(e) => setNewChild((d) => ({ ...d, interests: e.target.value }))}
              placeholder="e.g. Animals, Music"
            />
          </div>

          <button className="save-child-btn" onClick={handleAdd}>
            + Add Child
          </button>
        </div>
      </div>

    </section>
  );
}