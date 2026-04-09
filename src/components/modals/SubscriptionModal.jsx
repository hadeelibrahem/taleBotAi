import React from "react";

export default function SubscriptionModal({ onClose }) {
  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <h2>Subscription Plan</h2>

        <p>Your current plan: <strong>Premium</strong></p>

        <button className="modal-btn upgrade">Upgrade Plan</button>
        <button className="modal-btn cancel">Cancel Subscription</button>

        <button className="modal-close" onClick={onClose}>Close</button>
      </div>
    </div>
  );
}