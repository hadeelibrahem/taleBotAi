import React from "react";

export default function SubscriptionModal({ onClose }) {
  const handleUpgrade = () => {
    alert("Upgrade feature is not connected yet.");
  };

  const handleCancelSubscription = () => {
    alert("Cancel subscription feature is not connected yet.");
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <h2>Subscription Plan</h2>

        <p>Your current plan: <strong>Premium</strong></p>

        <button
          type="button"
          className="modal-btn upgrade"
          onClick={handleUpgrade}
        >
          Upgrade Plan
        </button>

        <button
          type="button"
          className="modal-btn cancel"
          onClick={handleCancelSubscription}
        >
          Cancel Subscription
        </button>

        <button
          type="button"
          className="modal-close"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  );
}