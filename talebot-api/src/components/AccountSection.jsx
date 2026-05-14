import React, { useState } from "react";

export default function AccountSection({ onManage }) {
  const [copied, setCopied] = useState(false);
  const [showName, setShowName] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordText, setShowPasswordText] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText("sarah.johnson@email.com");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="settings-card account-card">
      <div className="account-header">
        <div className="account-avatar">SJ</div>
        <div className="account-header-info">
          <h3 className="section-title" style={{ margin: 0 }}>Account</h3>
          <span className="account-badge">✦ Premium</span>
        </div>
      </div>

      <div className="input-with-icon account-input-wrap">
        <input
          type="text"
          value="sarah.johnson@email.com"
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
          {copied ? "✓" : "🔒"}
        </button>
      </div>

      <div className={`password-field-wrap ${showPassword ? "is-open" : ""}`}>
        <div className="input-with-icon">
          <input
            type={showPasswordText ? "text" : "password"}
            defaultValue="mysecretpassword"
            className="settings-input"
            placeholder="New password"
          />
          <button
            type="button"
            className="input-icon-btn"
            onClick={() => setShowPasswordText((v) => !v)}
            aria-label={showPasswordText ? "Hide password" : "Show password"}
            title={showPasswordText ? "Hide" : "Show"}
          >
            {showPasswordText ? "🙈" : "👁"}
          </button>
        </div>
      </div>

      <div className="small-links-row">
        <button
          type="button"
          className={`tiny-link tiny-link-btn ${showPassword ? "active" : ""}`}
          onClick={() => setShowPassword((v) => !v)}
        >
          ✉ Password
        </button>

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
            defaultValue="Sarah Johnson"
            className="settings-input"
            placeholder="Display name"
          />
          <span className="input-icon">✏️</span>
        </div>
      </div>

      <div className="setting-inline-row" style={{ marginTop: "0.8vw" }}>
        <div className="subscription-info">
          <span className="inline-label">Subscription Plan</span>
        </div>

        <button
          type="button"
          className="soft-pill-btn"
          onClick={onManage}
        >
          Manage
        </button>
      </div>
    </section>
  );
}