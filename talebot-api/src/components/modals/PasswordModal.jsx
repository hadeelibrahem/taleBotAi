import React from "react";

export default function PasswordModal({ onClose }) {
  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <h2>Change Password</h2>

        <input type="password" placeholder="Current Password" />
        <input type="password" placeholder="New Password" />
        <input type="password" placeholder="Confirm Password" />

        <button className="modal-btn save">Update Password</button>

        <button className="modal-close" onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
}