import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "../styles/Profile.css";

export default function Profile() {
  const [openSection, setOpenSection] = useState(null);

  const toggleSection = (section) => {
    setOpenSection(openSection === section ? null : section);
  };

  const user = {
    name: "Sarah Johnson",
    email: "sarah@talbot.ai",
    plan: "Premium",
    avatar: "/imags/logo.jpg",
    memberSince: "March 2024",
    stories: 12,
    readingTime: 48,
    streak: 7,
    favGenre: "Fantasy",

    pagesRead: 156,
    completedBooks: 8,
    weeklyGoal: { current: 3, target: 5 },
    points: 72,
    pointsTarget: 100,
    favoriteCharacters: [
      { emoji: "🐉", name: "Dragon", story: "The Dragon's Picnic" },
      { emoji: "🌙", name: "Moonbeam", story: "Mia and the Moonbeam" },
      { emoji: "☁️", name: "Cloud Princess", story: "The Cloud Castle" }
    ],
    readingMood: "happy",
    recentThoughts: "I loved the magic castle! ✨"
  };

  return (
    <div className="main-container">
      <Sidebar activeItem="profile" />

      <main className="profile-page">
        <div className="profile-shell">
          {/* Breadcrumb */}
          <div className="profile-breadcrumb">
            <span>Sarah's Account</span>
            <span className="crumb-separator">›</span>
            <span className="active-crumb">My Profile</span>
          </div>

          {/* Card الرئيسي */}
          <div className="profile-card-main">
            <div className="sparkle sparkle-1">✨</div>
            <div className="sparkle sparkle-2">⭐</div>
            <div className="sparkle sparkle-3">🌟</div>
            <div className="sparkle sparkle-4">💫</div>

            {/* Header */}
            <div className="profile-header">
              <div className="profile-avatar">
                <img src={user.avatar} alt="avatar" />
                <span className="profile-plan-badge">{user.plan}</span>
              </div>
              <h1 className="profile-name">{user.name}</h1>
              <p className="profile-email">{user.email}</p>
              <p className="profile-since">
                <i className="fa-regular fa-calendar"></i> Member since {user.memberSince}
              </p>
            </div>

            {/* Stats Grid - نفسها */}
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
                <div className="stat-icon">🔥</div>
                <div className="stat-number">{user.streak}</div>
                <div className="stat-label">Day Streak</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">✨</div>
                <div className="stat-number">{user.favGenre}</div>
                <div className="stat-label">Favorite Genre</div>
              </div>
            </div>

            {/* ===== محتويات جديدة ===== */}
            <div className="profile-accordion">
              
              {/* 1. Reading Stats (إحصائيات متقدمة) */}
              <div className="accordion-item">
                <button className="accordion-btn" onClick={() => toggleSection("stats")}>
                  <span><i className="fa-solid fa-chart-line"></i> Reading Stats</span>
                  <i className={`fa-solid fa-chevron-${openSection === "stats" ? "up" : "down"}`}></i>
                </button>
                {openSection === "stats" && (
                  <div className="accordion-panel">
                    <div className="stats-details">
                      <div className="detail-row">
                        <span>📄 Pages Read:</span>
                        <strong>{user.pagesRead} pages</strong>
                      </div>
                      <div className="detail-row">
                        <span>✅ Completed Books:</span>
                        <strong>{user.completedBooks} books</strong>
                      </div>
                      <div className="detail-row">
                        <span>🎯 Weekly Goal:</span>
                        <strong>{user.weeklyGoal.current}/{user.weeklyGoal.target} stories</strong>
                      </div>
                      <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${(user.weeklyGoal.current / user.weeklyGoal.target) * 100}%` }}></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 2. Current Goals (الأهداف الحالية) */}
              <div className="accordion-item">
                <button className="accordion-btn" onClick={() => toggleSection("goals")}>
                  <span><i className="fa-solid fa-bullseye"></i> Current Goals</span>
                  <i className={`fa-solid fa-chevron-${openSection === "goals" ? "up" : "down"}`}></i>
                </button>
                {openSection === "goals" && (
                  <div className="accordion-panel">
                    <div className="goals-container">
                      <div className="goal-card">
                        <div className="goal-icon">🎯</div>
                        <div className="goal-info">
                          <div className="goal-title">Read 5 stories this week</div>
                          <div className="goal-progress">{user.weeklyGoal.current}/{user.weeklyGoal.target} completed</div>
                          <div className="goal-progress-bar">
                            <div className="goal-fill" style={{ width: `${(user.weeklyGoal.current / user.weeklyGoal.target) * 100}%` }}></div>
                          </div>
                        </div>
                      </div>
                      <div className="goal-card">
                        <div className="goal-icon">⭐</div>
                        <div className="goal-info">
                          <div className="goal-title">Earn 100 reading points</div>
                          <div className="goal-progress">{user.points}/{user.pointsTarget} points</div>
                          <div className="goal-progress-bar">
                            <div className="goal-fill" style={{ width: `${(user.points / user.pointsTarget) * 100}%` }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 3. Favorite Characters (شخصيات مفضلة) */}
              <div className="accordion-item">
                <button className="accordion-btn" onClick={() => toggleSection("characters")}>
                  <span><i className="fa-solid fa-face-smile"></i> Favorite Characters</span>
                  <i className={`fa-solid fa-chevron-${openSection === "characters" ? "up" : "down"}`}></i>
                </button>
                {openSection === "characters" && (
                  <div className="accordion-panel">
                    <div className="characters-container">
                      {user.favoriteCharacters.map((char, i) => (
                        <div key={i} className="character-card">
                          <div className="character-emoji">{char.emoji}</div>
                          <div className="character-name">{char.name}</div>
                          <div className="character-story">{char.story}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* 4. Reading Journal (يوميات القراءة) */}
              <div className="accordion-item">
                <button className="accordion-btn" onClick={() => toggleSection("journal")}>
                  <span><i className="fa-regular fa-bookmark"></i> Reading Journal</span>
                  <i className={`fa-solid fa-chevron-${openSection === "journal" ? "up" : "down"}`}></i>
                </button>
                {openSection === "journal" && (
                  <div className="accordion-panel">
                    <div className="journal-entry">
                      <div className="journal-mood">
                        <span>Today's mood:</span>
                        <span className="mood-emoji">
                          {user.readingMood === "happy" ? "😊" : user.readingMood === "excited" ? "🤩" : "😴"}
                        </span>
                      </div>
                      <div className="journal-thought">
                        <i className="fa-regular fa-message"></i>
                        <p>{user.recentThoughts}</p>
                      </div>
                      <button className="journal-btn">
                        <i className="fa-regular fa-pen-to-square"></i> Write new thought
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Share Button */}
            <div className="profile-share">
              <button className="share-btn">
                <i className="fa-solid fa-share-alt"></i> Share My Profile
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}