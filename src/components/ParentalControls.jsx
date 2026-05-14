import React, { useState } from "react";

const avatarOptions = ["👧", "👦", "🧒", "👶", "🧑", "👱"];

export default function ParentalControls({ children, setChildren, apiBase }) {
  const [activeId, setActiveId] = useState(null);
  const [editData, setEditData] = useState({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [newChild, setNewChild] = useState({
    avatar: "🧒",
    name: "",
    age: "",
  });

  const handleEdit = (child) => {
    if (activeId === child.id) {
      setActiveId(null);
    } else {
      setActiveId(child.id);
      setEditData({
        name: child.name || "",
        age: child.age || "",
        avatar: child.avatar || "🧒",
      });
    }
  };

  const handleSave = async (id) => {
    try {
      const res = await fetch(`${apiBase}/settings/children/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          name: editData.name,
          age: Number(editData.age),
          avatar: editData.avatar,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to update child");
      }

      const result = await res.json();
      const updatedChild = result.data;

      setChildren((prev) =>
        prev.map((c) => (c.id === id ? updatedChild : c))
      );

      setActiveId(null);
    } catch (err) {
      alert(err.message || "Update failed");
    }
  };

  const handleAdd = async () => {
    try {
      if (!newChild.name.trim()) return;

      const res = await fetch(`${apiBase}/settings/children`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          name: newChild.name,
          age: Number(newChild.age),
          avatar: newChild.avatar,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to add child");
      }

      const result = await res.json();
      setChildren((prev) => [...prev, result.data]);

      setNewChild({ avatar: "🧒", name: "", age: "" });
      setShowAddForm(false);
    } catch (err) {
      alert(err.message || "Add child failed");
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`${apiBase}/settings/children/${id}`, {
        method: "DELETE",
        headers: {
          Accept: "application/json",
        },
      });

      if (!res.ok) {
        throw new Error("Failed to delete child");
      }

      setChildren((prev) => prev.filter((c) => c.id !== id));
      if (activeId === id) setActiveId(null);
    } catch (err) {
      alert(err.message || "Delete failed");
    }
  };

  return (
    <section className="settings-card">
      <h3 className="section-title">Parental Controls</h3>

      <div className="profile-list">
        {children.map((child) => {
          const isActive = activeId === child.id;

          return (
            <div key={child.id} className="child-item">
              <div className="profile-row">
                <div className="profile-info">
                  <span className="profile-icon">{child.avatar || "🧒"}</span>
                  <div className="profile-name-wrap">
                    <span className="profile-name">{child.name}</span>
                    <span className="profile-age">Age {child.age}</span>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    className={`mini-edit-btn ${isActive ? "is-active" : ""}`}
                    onClick={() => handleEdit(child)}
                    type="button"
                  >
                    {isActive ? "✕ Close" : "✎ Edit"}
                  </button>

                  <button
                    className="mini-edit-btn"
                    onClick={() => handleDelete(child.id)}
                    type="button"
                  >
                    🗑 Delete
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

                  <button className="save-child-btn" onClick={() => handleSave(child.id)} type="button">
                    ✓ Save Changes
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <button
        className={`add-child-btn ${showAddForm ? "is-cancel" : ""}`}
        onClick={() => setShowAddForm((v) => !v)}
        type="button"
      >
        {showAddForm ? "✕ Cancel" : "+ Add Child Profile"}
      </button>

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

          <button className="save-child-btn" onClick={handleAdd} type="button">
            + Add Child
          </button>
        </div>
      </div>
    </section>
  );
}