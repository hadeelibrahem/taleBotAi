import React, { useState } from "react";

export default function AccountSection({
  onManage,
  accountData,
  setAccountData,
  plan = "Free",
}) {
  const [copied, setCopied] = useState(false);
  const [showName, setShowName] = useState(true);

  const displayName = accountData?.name || "User";
  const email = accountData?.email || "";
  const firstLetter = displayName.charAt(0).toUpperCase();

  const handleCopy = () => {
    navigator.clipboard.writeText(email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="settings-card account-card">
      <div className="account-header">
        <div className="account-avatar">{firstLetter}</div>

        <div className="account-header-info">
          <h3 className="section-title" style={{ margin: 0 }}>
            Account
          </h3>

          <span className={`account-badge ${plan.toLowerCase()}`}>
            ✦ {plan}
          </span>
        </div>
      </div>

      <div className="input-with-icon account-input-wrap">
        <input
          type="text"
          value={email}
          readOnly
          className="settings-input"
        />

        <button
          type="button"
          className="input-icon-btn"
          onClick={handleCopy}
          title={copied ? "Copied!" : "Copy email"}
          aria-label="Copy email"
        >
          {copied ? "✓" : "📋"}
        </button>
      </div>

      <div className="small-links-row">
        <button
          type="button"
          className={`tiny-link tiny-link-btn set-name-btn ${
            showName ? "name-visible" : "name-hidden"
          }`}
          onClick={() => setShowName((v) => !v)}
          title={showName ? "Hide display name" : "Show display name"}
        >
          <span className="set-name-icon">{showName ? "☑" : "☐"}</span>
          <span>Set name</span>
          <span className="set-name-status">{showName ? "on" : "off"}</span>
        </button>
      </div>

      <div className={`name-field-wrap ${showName ? "is-open" : ""}`}>
        <div className="input-with-icon">
          <input
            type="text"
            value={accountData.name}
            className="settings-input"
            placeholder="Display name"
            onChange={(e) =>
              setAccountData((prev) => ({
                ...prev,
                name: e.target.value,
              }))
            }
          />
          <span className="input-icon">✏️</span>
        </div>
      </div>

      <div className="setting-inline-row" style={{ marginTop: "0.8vw" }}>
        <div className="subscription-info">
          <span className="inline-label">Subscription Plan</span>
        </div>

        <button type="button" className="soft-pill-btn" onClick={onManage}>
          Manage
        </button>
      </div>
    </section>
  );
}