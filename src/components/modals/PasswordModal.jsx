import React, { useState } from "react";

export default function PasswordModal({ onClose, onSubmit }) {
  const [form, setForm] = useState({
    password: "",
    password_confirmation: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      await onSubmit({
        password: form.password,
        password_confirmation: form.password_confirmation,
      });

      alert("Password updated successfully");
      onClose();
    } catch (err) {
      alert(err.message || "Failed to update password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <h2>Change Password</h2>

        <input
          type="password"
          placeholder="New Password"
          value={form.password}
          onChange={(e) => handleChange("password", e.target.value)}
        />

        <input
          type="password"
          placeholder="Confirm Password"
          value={form.password_confirmation}
          onChange={(e) => handleChange("password_confirmation", e.target.value)}
        />

        <button
          className="modal-btn save"
          onClick={handleSubmit}
          disabled={loading}
          type="button"
        >
          {loading ? "Updating..." : "Update Password"}
        </button>

        <button className="modal-close" onClick={onClose} type="button">
          Cancel
        </button>
      </div>
    </div>
  );
}