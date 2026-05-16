import Sidebar from "../components/Sidebar";
import { useEffect, useState } from "react";

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

import AccountSection from "../components/AccountSection";
import ParentalControls from "../components/ParentalControls";
import ChildSettings from "../components/ChildSettings";
import Preferences from "../components/Preferences";

import SubscriptionModal from "../components/modals/SubscriptionModal";
import PasswordModal from "../components/modals/PasswordModal";

const API_BASE = "http://127.0.0.1:8000/api";

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
  const token = localStorage.getItem("token");

  const [accountData, setAccountData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [openSubscription, setOpenSubscription] = useState(false);
  const [openPassword, setOpenPassword] = useState(false);
  const [savedToast, setSavedToast] = useState(false);
  const [selectedChild, setSelectedChild] = useState(null);
  const [childPassword, setChildPassword] = useState("");
  const [childLoginError, setChildLoginError] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [account, setAccount] = useState({
    id: 1,
    name: "",
    email: "",
    plan: "Free",
  });

 const [preferences, setPreferences] = useState({
  new_story_suggestions: false,
  reading_reminders: false,
  account_updates: false,
  disable_story_sharing: false,
  reading_time_limits: false,
});
  const [children, setChildren] = useState([]);
  const [planLimits, setPlanLimits] = useState({
    child_profile_limit: null,
    current_child_profiles: 0,
  });

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await fetch(`${API_BASE}/settings`, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to fetch settings");

      const result = await res.json();
      const data = result.data || {};

      const fetchedAccount = {
        id: data.account?.id || 1,
        name: data.account?.name || "",
        email: data.account?.email || "",
        plan: data.account?.plan || "Free",
      };

      setAccount(fetchedAccount);

    
      setAccountData({
        name: fetchedAccount.name,
        email: fetchedAccount.email,
        password: "",
      });

      setPreferences({
  new_story_suggestions: !!data.preferences?.new_story_suggestions,
  reading_reminders: !!data.preferences?.reading_reminders,
  account_updates: !!data.preferences?.account_updates,
  disable_story_sharing: !!data.preferences?.disable_story_sharing,
  reading_time_limits: !!data.preferences?.reading_time_limits,
});

      setChildren(Array.isArray(data.children) ? data.children : []);
      setPlanLimits({
        child_profile_limit: data.plan_limits?.child_profile_limit ?? null,
        current_child_profiles: data.plan_limits?.current_child_profiles ?? 0,
      });
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);
const handleSave = async () => {
  try {
    const body = {};

    if (accountData.name.trim() !== "") {
      body.name = accountData.name.trim();
    }

    // ✅ ما تبعت الإيميل إلا إذا تغير
    if (accountData.email !== account.email) {
      body.email = accountData.email;
    }

    if (accountData.password.trim() !== "") {
      body.password = accountData.password;
    }

    // إذا ما في شي اتغير ما تبعت طلب
    if (Object.keys(body).length === 0) {
      setSavedToast(true);
      setTimeout(() => setSavedToast(false), 3000);
      return;
    }

    const response = await fetch(`${API_BASE}/settings/account`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      const firstError = data.errors
        ? Object.values(data.errors)[0][0]
        : data.message;
      alert(firstError || "Failed to update account");
      return;
    }

    const updatedName = data.data?.full_name || accountData.name;
    const updatedEmail = data.data?.email || accountData.email;

    setAccount((prev) => ({ ...prev, name: updatedName, email: updatedEmail }));
    setAccountData((prev) => ({
      ...prev,
      name: updatedName,
      email: updatedEmail,
    }));

    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 3000);
  } catch (error) {
    console.error(error);
    alert("Failed to update account");
  }
};

  const handlePasswordUpdate = async (passwordData) => {
    const res = await fetch(`${API_BASE}/settings/account`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(passwordData),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => null);
      throw new Error(errorData?.message || "Failed to update password");
    }

    return res.json();
  };

  const handleDeleteAccount = async () => {
    const res = await fetch(`${API_BASE}/settings/account/delete`, {
      method: "DELETE",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) throw new Error("Failed to delete account");

   
    localStorage.removeItem("token");
    localStorage.removeItem("childUser");
    localStorage.removeItem("childMode");
    localStorage.removeItem("selectedChildId");
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  const handleChildLogin = async () => {
    try {
      setChildLoginError("");

      const res = await fetch(`${API_BASE}/children/${selectedChild.id}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          password: childPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Incorrect password");
      }

      localStorage.setItem("childUser", JSON.stringify(data.data));
      localStorage.setItem("childMode", "true");
      localStorage.setItem("selectedChildId", selectedChild.id);
      window.location.href = `/child/${selectedChild.id}`;
    } catch (err) {
      setChildLoginError(err.message);
    }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <div className="settings-page">
        <FlyingBear side="right" balloon="🎈" />
        <FlyingBear side="left" balloon="🎀" />

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

          {loading && (
            <p style={{ textAlign: "center" }}>Loading settings...</p>
          )}

          {error && (
            <p style={{ textAlign: "center", color: "crimson" }}>{error}</p>
          )}

          {!loading && (
            <div className="settings-grid">
              <div className="settings-column settings-left">
               <AccountSection
  onManage={() => setOpenSubscription(true)}
  accountData={accountData}
  setAccountData={setAccountData}
  plan={account.plan}
/>

                <ParentalControls
                  children={children}
                  setChildren={setChildren}
                  apiBase={API_BASE}
                  planLimits={planLimits}
                />
              </div>

              <div className="settings-column settings-middle">
                <div className="center-bot">
                  <img src="/imags/logo.jpg" alt="TaleBot AI" />
                </div>

            <ChildSettings
  preferences={preferences}
  setPreferences={setPreferences}
  onPassword={() => setOpenPassword(true)}
/>
              </div>

              <div className="settings-column settings-right">
                <Preferences
                  preferences={preferences}
                  setPreferences={setPreferences}
                  onDeleteConfirm={handleDeleteAccount}
                />

                <div className="settings-card children-access-card">
                  <h3>Child Accounts</h3>

                  {children.length === 0 && <p>No children added yet.</p>}

                  {children.map((child) => (
                    <button
                      key={child.id}
                      className="child-access-btn"
                      onClick={() => {
                        setSelectedChild(child);
                        setChildPassword("");
                        setChildLoginError("");
                      }}
                    >
                      {child.avatar} {child.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="settings-footer">
            <button
              className="save-changes-btn"
              onClick={handleSave}
              disabled={loading}
            >
              ✦ Save Changes
            </button>
          </div>
        </div>
      </div>

      {savedToast && (
        <div className="action-toast toast-save">✦ Changes saved successfully!</div>
      )}

    {openSubscription && (
  <SubscriptionModal
    onClose={() => setOpenSubscription(false)}
    currentPlan={account.plan}
  />
)}

      {openPassword && (
        <PasswordModal
          onClose={() => setOpenPassword(false)}
          onSubmit={handlePasswordUpdate}
        />
      )}

      {selectedChild && (
        <div className="modal-overlay" onClick={() => setSelectedChild(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedChild(null)}>
              ✕
            </button>

            <div className="modal-lock-icon">🔒</div>

            <input
              type="password"
              className="modal-input"
              placeholder="Enter password"
              value={childPassword}
              onChange={(e) => setChildPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleChildLogin()}
            />

            {childLoginError && (
              <p className="modal-error">{childLoginError}</p>
            )}

            <button className="modal-submit-btn" onClick={handleChildLogin}>
              login 👶
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
