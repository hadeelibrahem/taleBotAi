import Sidebar from "../components/Sidebar";
import { useState } from "react";

// ─── Styles ───
import "../styles/variables.css";
import "../styles/layout.css";
import "../styles/shared.css";
import "../styles/accountSection.css";
import "../styles/parentalControls.css";
import "../styles/childSettings.css";
import "../styles/preferences.css";
import "../styles/modal.css";
import "../styles/bearBalloon.css";
import "../styles/confirmToast.css";

// ─── Components ───
import AccountSection from "../components/AccountSection";
import ParentalControls from "../components/ParentalControls";
import ChildSettings from "../components/ChildSettings";
import Preferences from "../components/Preferences";

import SubscriptionModal from "../components/modals/SubscriptionModal";
import PasswordModal from "../components/modals/PasswordModal";

function FlyingBear({ side, balloon }) {
  return (
    <div className={`bear-balloon-wrap bear-${side}`}>
      <div className="balloon">{balloon}</div>
      <svg className="balloon-string" viewBox="0 0 20 60" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M10 0 Q14 20 8 40 Q4 55 10 60"
          stroke="rgba(180,160,220,0.6)"
          strokeWidth="1.5"
          fill="none"
          strokeDasharray="3,3"
        />
      </svg>
      <div className="bear-body">🧸</div>
    </div>
  );
}

export default function Settings() {
  const [openSubscription, setOpenSubscription] = useState(false);
  const [openPassword, setOpenPassword]         = useState(false);
  const [savedToast, setSavedToast]             = useState(false);

  const handleSave = () => {
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 3000);
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <div className="settings-page">

        <FlyingBear side="right" balloon="🎈" />
        <FlyingBear side="left"  balloon="🎀" />

        <div className="settings-shell">
          <span className="sparkle sparkle-1">✦</span>
          <span className="sparkle sparkle-2">✦</span>
          <span className="sparkle sparkle-3">✦</span>
          <span className="corner-deco corner-left">🌸</span>
          <span className="corner-deco corner-right">🌿</span>

          <div className="settings-logo-badge">
            <img src="/imags/logo.jpg" alt="TaleBot AI" />
            <span>TaleBot AI</span>
          </div>

          <h1 className="settings-title">Settings</h1>

          <div className="settings-grid">
            <div className="settings-column settings-left">
              <AccountSection onManage={() => setOpenSubscription(true)} />
              <ParentalControls />
            </div>

            <div className="settings-column settings-middle">
              <div className="center-bot">
                <img src="/imags/logo.jpg" alt="TaleBot AI" />
              </div>
              <ChildSettings onPassword={() => setOpenPassword(true)} />
            </div>

            <div className="settings-column settings-right">
              <Preferences />
            </div>
          </div>

          <div className="settings-footer">
            <button className="save-changes-btn" onClick={handleSave}>
              ✦ Save Changes
            </button>
          </div>
        </div>
      </div>

      {/* ── Save Toast ── */}
      {savedToast && (
        <div className="action-toast toast-save">
          ✦ Changes saved successfully!
        </div>
      )}

      {openSubscription && (
        <SubscriptionModal onClose={() => setOpenSubscription(false)} />
      )}
      {openPassword && (
        <PasswordModal onClose={() => setOpenPassword(false)} />
      )}
    </div>
  );
}