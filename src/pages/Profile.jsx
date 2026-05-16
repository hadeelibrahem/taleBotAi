
import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "../styles/Profile.css";

export default function Profile() {
  const [openSection, setOpenSection] = useState(null);
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState("");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const API = "http://127.0.0.1:8000";
  const token = localStorage.getItem("token");

  const toggleSection = (section) => {
    setOpenSection(openSection === section ? null : section);
  };

  useEffect(() => {
    setLoading(true);
    setError("");

    fetch(`${API}/api/analytics/children`, {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        const childList = Array.isArray(data) ? data : [];
        const storedChildId = localStorage.getItem("selectedChildId");
        const initialChild =
          childList.find((child) => String(child.id) === String(storedChildId)) ||
          childList[0];

        setChildren(childList);
        setSelectedChild(initialChild?.id || "");

        if (initialChild?.id) {
          localStorage.setItem("selectedChildId", initialChild.id);
        }

        if (childList.length === 0) {
          setUser(null);
          setError("No child profiles found.");
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error("Children error:", err);
        setError("Unable to load child profiles.");
        setLoading(false);
      });
  }, [token]);

  useEffect(() => {
    if (!selectedChild) return;

    setLoading(true);
    setError("");
    localStorage.setItem("selectedChildId", selectedChild);

    fetch(`${API}/api/profile/${selectedChild}`, {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.message || "Unable to load profile.");
        }
        return data;
      })
      .then((data) => {
        setUser(data);
      })
      .catch((err) => {
        console.error("Profile error:", err);
        setUser(null);
        setError(err.message || "Unable to load profile.");
      })
      .finally(() => setLoading(false));
  }, [selectedChild, token]);

  if (loading) {
    return <div>Loading profile...</div>;
  }

  if (error && !user) {
    return <div>{error}</div>;
  }

  if (!user) {
    return <div>Profile not found.</div>;
  }

  return (
    <div className="main-container">
      <Sidebar activeItem="profile" />

      <main className="profile-page">
        <div className="profile-shell">
          <div className="profile-breadcrumb">
            <span>{user.child_name}'s Account</span>
            <span className="crumb-separator">›</span>
            <span className="active-crumb">My Profile</span>
          </div>

          <div className="profile-card-main">
            <div className="sparkle sparkle-1">✨</div>
            <div className="sparkle sparkle-2">⭐</div>
            <div className="sparkle sparkle-3">🌟</div>
            <div className="sparkle sparkle-4">💫</div>

            <div className="profile-topbar">
              <div>
                <span className="profile-topbar-label">Child Profile</span>
                <strong>{user.child_name}</strong>
              </div>

              <select
                className="profile-child-select"
                value={selectedChild}
                onChange={(event) => setSelectedChild(event.target.value)}
              >
                {children.map((child) => (
                  <option key={child.id} value={child.id}>
                    {child.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="profile-header">
              <div className="profile-avatar">
                <img src={user.avatar} alt="avatar" />
                <span className="profile-plan-badge">{user.plan}</span>
              </div>

              <h1 className="profile-name">{user.child_name}</h1>
              <p className="profile-email">Parent: {user.name}</p>
              <p className="profile-since">
                <i className="fa-regular fa-calendar"></i> Member since {user.memberSince}
              </p>
            </div>

            <div className="profile-stats-grid">
              <div className="stat-card">
                <div className="stat-icon">📚</div>
                <div className="stat-number">{user.stories}</div>
                <div className="stat-label">Stories Created</div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">⏱️</div>
                <div className="stat-number">{user.readingTime}</div>
                <div className="stat-label">Reading Minutes</div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">✅</div>
                <div className="stat-number">{user.completedStories}</div>
                <div className="stat-label">Completed Stories</div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">✨</div>
                <div className="stat-number">{user.favGenre}</div>
                <div className="stat-label">Favorite Genre</div>
              </div>
            </div>

            <div className="profile-accordion">
              <div className="accordion-item">
                <button className="accordion-btn" onClick={() => toggleSection("stats")}>
                  <span>
                    <i className="fa-solid fa-chart-line"></i> Reading Stats
                  </span>
                  <i
                    className={`fa-solid fa-chevron-${
                      openSection === "stats" ? "up" : "down"
                    }`}
                  ></i>
                </button>

                {openSection === "stats" && (
                  <div className="accordion-panel">
                    <div className="stats-details">
                      <div className="detail-row">
                        <span>📊 Completion Rate:</span>
                        <strong>{user.completionRate}%</strong>
                      </div>

                      <div className="detail-row">
                        <span>⭐ Average Rating:</span>
                        <strong>{user.avgRating}/5</strong>
                      </div>

                      <div className="detail-row">
                        <span>📖 Stories In Progress:</span>
                        <strong>{user.storiesInProgress}</strong>
                      </div>

                      <div className="detail-row">
                        <span>🎯 Weekly Goal:</span>
                        <strong>
                          {user.weeklyGoal.current}/{user.weeklyGoal.target} stories
                        </strong>
                      </div>

                      <div className="progress-bar">
                        <div
                          className="progress-fill"
                          style={{
                            width: `${(user.weeklyGoal.current / user.weeklyGoal.target) * 100}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="accordion-item">
                <button className="accordion-btn" onClick={() => toggleSection("favorites")}>
                  <span>
                    <i className="fa-solid fa-heart"></i> Favorite Stories
                  </span>
                  <i
                    className={`fa-solid fa-chevron-${
                      openSection === "favorites" ? "up" : "down"
                    }`}
                  ></i>
                </button>

                {openSection === "favorites" && (
                  <div className="accordion-panel">
                    <div className="favorite-stories-container">
                      {user.favoriteStories.map((story, index) => (
                        <div key={index} className="favorite-story-card">
                          <div className="favorite-story-cover">
                            <img src={story.cover} alt={story.title} />
                          </div>

                          <div className="favorite-story-info">
                            <div className="favorite-story-title">{story.title}</div>
                            <div className="favorite-story-genre">{story.genre}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="accordion-item">
                <button className="accordion-btn" onClick={() => toggleSection("insights")}>
                  <span>
                    <i className="fa-solid fa-lightbulb"></i> Story Insights
                  </span>
                  <i
                    className={`fa-solid fa-chevron-${
                      openSection === "insights" ? "up" : "down"
                    }`}
                  ></i>
                </button>

                {openSection === "insights" && (
                  <div className="accordion-panel">
                    <div className="insights-grid">
                      <div className="insight-card">
                        <div className="insight-label">Popular Theme</div>
                        <div className="insight-value">{user.popularTheme}</div>
                      </div>

                      <div className="insight-card">
                        <div className="insight-label">Suggested Moral</div>
                        <div className="insight-value">{user.suggestedMoral}</div>
                      </div>

                      <div className="insight-card">
                        <div className="insight-label">Safe Content Filter</div>
                        <div className="insight-value">{user.safeContent}</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="accordion-item">
                <button className="accordion-btn" onClick={() => toggleSection("activity")}>
                  <span>
                    <i className="fa-solid fa-clock-rotate-left"></i> Latest Activity
                  </span>
                  <i
                    className={`fa-solid fa-chevron-${
                      openSection === "activity" ? "up" : "down"
                    }`}
                  ></i>
                </button>

                {openSection === "activity" && (
                  <div className="accordion-panel">
                    <div className="latest-activity-card">
                      <div className="latest-activity-header">
                        <span className="activity-badge">Recent</span>
                        <span className="activity-time">{user.latestActivity.time}</span>
                      </div>

                      <h3 className="latest-activity-title">{user.latestActivity.title}</h3>
                      <p className="latest-activity-description">
                        {user.latestActivity.description}
                      </p>

                    
                    </div>
                  </div>
                )}
              </div>
            </div>

          
          </div>
        </div>
      </main>
    </div>
  );
}
