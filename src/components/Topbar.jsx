import { useMemo, useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Topbar.css";

function Topbar({ stories = [], notifications = [] }) {
  const [showSearch, setShowSearch] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [query, setQuery] = useState("");
  const [dismissedIds, setDismissedIds] = useState(new Set());

  const navigate = useNavigate();
  const notifRef = useRef(null);

  const visibleNotifs = useMemo(
    () => notifications.filter((n) => !dismissedIds.has(n.id)),
    [notifications, dismissedIds]
  );

  const hasNotifications = visibleNotifs.length > 0;

  const handleNotifClick = (id) => {
    setDismissedIds((prev) => new Set([...prev, id]));
  };

  useEffect(() => {
    function handleClickOutside(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredStories = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return stories.filter((story) => story.title?.toLowerCase().includes(q));
  }, [query, stories]);

  const handleStoryClick = (story) => {
    navigate("/stories", { state: { search: story.title } });
    setShowSearch(false);
    setQuery("");
  };

  return (
    <div className="topbar">
      <div className="topbar-search-area">
        <div className={`topbar-search-box ${showSearch ? "active" : ""}`}>
          <button
            type="button"
            className="topbar-search-btn"
            onClick={() => {
              setShowSearch((prev) => !prev);
              setQuery("");
            }}
          >
            {showSearch ? "✕" : "🔍"}
          </button>

          <div className={`topbar-search-input-wrap ${showSearch ? "show" : ""}`}>
            <input
              type="text"
              placeholder="Search stories..."
              className="topbar-search-input"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus={showSearch}
            />
          </div>
        </div>

        {showSearch && query.trim() && (
          <div className="topbar-search-results">
            {filteredStories.length > 0 ? (
              filteredStories.map((story) => (
                <button
                  key={story.id}
                  className="topbar-search-result-item"
                  onClick={() => handleStoryClick(story)}
                >
                  <span className="topbar-result-title">{story.title}</span>
                  <span className="topbar-result-genre">{story.genre}</span>
                </button>
              ))
            ) : (
              <div className="topbar-search-no-results">No stories found</div>
            )}
          </div>
        )}
      </div>

      {/* الجرس */}
      <div className="topbar-notif-wrapper" ref={notifRef}>
        <button
          className="topbar-bell-btn"
          onClick={() => setShowNotifications((prev) => !prev)}
        >
          <span className="topbar-bell-icon">🔔</span>
          {hasNotifications && <span className="topbar-notif-dot"></span>}
        </button>

        {showNotifications && (
          <div className="topbar-notif-dropdown">
            <h4>Notifications</h4>
            {visibleNotifs.length === 0 ? (
              <p className="topbar-notif-empty">No notifications</p>
            ) : (
              visibleNotifs.map((n, i) => (
                <div
                  className="topbar-notif-item"
                  key={n.id || i}
                  onClick={() => handleNotifClick(n.id)}
                >
                  <span className="topbar-notif-title">{n.title}</span>
                  <span className="topbar-notif-msg">{n.message}</span>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Topbar;