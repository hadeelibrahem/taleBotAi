import React, { useEffect, useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../styles/MyStories.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import ChildSidebar from "../components/ChildSidebar";

export default function MyStories() {
  const navigate = useNavigate();

  const { id } = useParams();
  const selectedChildId = id;
  const [child, setChild] = useState(() => {
    const stored = localStorage.getItem("childUser");
    return stored ? JSON.parse(stored) : null;
  });
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMoral, setSelectedMoral] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const storiesPerPage = 12; 

  // قائمة القيم الأخلاقية المتاحة
  const moralValues = [
    { id: "all", name: "All Values", icon: "🌟" },
    { id: "Kindness", name: "Kindness", icon: "🤝" },
    { id: "Honesty", name: "Honesty", icon: "💎" },
    { id: "Courage", name: "Courage", icon: "🦁" },
    { id: "Sharing", name: "Sharing", icon: "🎁" }
  ];

  useEffect(() => {
    if (!selectedChildId || child?.name) {
      return;
    }

    fetch(`http://127.0.0.1:8000/api/children/${selectedChildId}/dashboard`)
      .then((res) => res.json())
      .then((json) => {
        const name = json.data?.hero_section?.title?.replace("Welcome ", "") || "Child";

        setChild({
          id: selectedChildId,
          name,
          avatar: "ðŸ‘¶",
        });
      })
      .catch((err) => {
        console.error("Child info error:", err);
      });
  }, [selectedChildId, child?.name]);

  // API
 useEffect(() => {
  if (!selectedChildId) {
    setError("No child profile was selected.");
    return;
  }

  const url = `http://127.0.0.1:8000/api/children/${selectedChildId}/stories`;
  setLoading(true);
  setError("");

  fetch(url)
    .then(async res => {
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Unable to load stories.");
      }
      return data;
    })
    .then(data => {
      setStories(data.data || []);
    })
    .catch(error => {
      setStories([]);
      setError(error.message || "Unable to load stories.");
    })
    .finally(() => setLoading(false));
}, [selectedChildId]);

  // فلترة القصص
  const filteredStories = useMemo(() => {
    let filtered = stories;

    if (selectedMoral !== "all") {
      filtered = filtered.filter(story => 
        story.moral_lesson === selectedMoral
      );
    }

    if (searchTerm.trim() !== "") {
      filtered = filtered.filter(story =>
        story.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  }, [stories, searchTerm, selectedMoral]);

  // Pagination
  const totalPages = Math.ceil(filteredStories.length / storiesPerPage);
  const currentStories = useMemo(() => {
    const startIndex = (currentPage - 1) * storiesPerPage;
    return filteredStories.slice(startIndex, startIndex + storiesPerPage);
  }, [filteredStories, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedMoral]);

  const handleStoryClick = async (story) => {
  try {
    const res = await fetch(`http://127.0.0.1:8000/api/children/${selectedChildId}/stories/${story.id}`);
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Unable to open story.");
    }

    navigate(`/child/${selectedChildId}/reader`, {
      state: {
        story: data.data  
      }
    });

  } catch (error) {
    console.error("Error loading story:", error);
    setError(error.message || "Unable to open story.");
  }
};

  const showNoResults = filteredStories.length === 0;

  return (
    <div className="main-container">
      <ChildSidebar child={child} activeItem="stories" />

      <main className="stories-page">
        <div className="stories-shell">
          <div className="stories-breadcrumb">
            <span>Your Adventures</span>
            <span className="crumb-separator">›</span>
            <span className="active-crumb">My Stories</span>
          </div>

          <div className="stories-card">
            <div className="sparkle sparkle-1">✦</div>
            <div className="sparkle sparkle-2">✦</div>
            <div className="sparkle sparkle-3">✦</div>
            <div className="sparkle sparkle-4">✦</div>

            <div className="top-layout">
              <div className="top-left">
                <h1>My Magical Stories</h1>
                <div className="library-row">
                  <h2>{child?.name || "Child"}'s Storyscape Library</h2>
                  <span className="stories-badge">{filteredStories.length} Stories</span>
                </div>
              </div>

              <div className="top-center">
                <h3>Search by Title</h3>
                <div className="search-box">
                  <i className="fas fa-search"></i>
                  <input 
                    type="text" 
                    placeholder="Find a Story..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  {searchTerm && (
                    <button className="search-clear" onClick={() => setSearchTerm("")}>
                      <i className="fas fa-times-circle"></i>
                    </button>
                  )}
                </div>
              </div>

              <div className="top-right insight-box">
                <h3>Filter by Moral Value</h3>
                <div className="moral-filters">
                  {moralValues.map(moral => (
                    <button
                      key={moral.id}
                      className={`moral-chip ${selectedMoral === moral.id ? "active" : ""}`}
                      onClick={() => setSelectedMoral(moral.id)}
                    >
                      <span className="moral-icon">{moral.icon}</span>
                      <span className="moral-name">{moral.name}</span>
                    </button>
                  ))}
                </div>
                <div className="insight-status">
                  <span className="status-title">AI Engine Status</span>
                  <div className="status-row">
                    <span className="status-dot green"></span>
                    <span className="status-text">Library up-to-date</span>
                  </div>
                </div>
              </div>
            </div>

            {!showNoResults && (
              <div className="results-info">
                <span>
                  🎯 Showing {currentStories.length} of {filteredStories.length} stories
                  {searchTerm && ` matching "${searchTerm}"`}
                  {selectedMoral !== "all" && ` with moral: ${selectedMoral}`}
                </span>
              </div>
            )}

            {loading && (
              <div className="no-results">
                <i className="fas fa-spinner fa-spin"></i>
                <h3>Loading stories...</h3>
              </div>
            )}

            {error && !loading && (
              <div className="no-results">
                <i className="fas fa-circle-exclamation"></i>
                <h3>{error}</h3>
              </div>
            )}

            {!loading && !error && (
            <div className="stories-grid">
              {currentStories.map((story) => (
                <div key={story.id} className="story-tile" onClick={() => handleStoryClick(story)}>
                  <div className="story-thumb">
                    <img
                      src={story.image || story.cover_image || `https://picsum.photos/seed/${story.id}/400/300`}
                      alt={story.title}
                    />
                    <div className="story-overlay">
  <div className="overlay-content">
    <i className="fas fa-book-open"></i>
    <button className="read-btn">Read Now ✨</button>
  </div>
</div>
                  </div>
                  <h4>{story.title}</h4>
                  <div className="meta-list">
                    <div className="meta-item">
                      <i className="far fa-compass"></i>
                      <span>{story.genre}</span>
                    </div>
                    <div className="meta-item moral-badge">
                      <i className="fas fa-heart"></i>
                      <span>{story.moral_lesson}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            )}

            {showNoResults && !loading && !error && (
              <div className="no-results">
                <i className="fas fa-book-open"></i>
                <h3>No stories found</h3>
                <button className="clear-filters-btn" onClick={() => {
                  setSearchTerm("");
                  setSelectedMoral("all");
                }}>
                  Clear all filters
                </button>
              </div>
            )}

            {!showNoResults && totalPages > 1 && (
              <div className="stories-footer">
                <button className="pager-btn" onClick={() => setCurrentPage(p => Math.max(1, p-1))} disabled={currentPage === 1}>
                  <i className="fas fa-chevron-left"></i> Previous
                </button>
                <span className="pager-text">Page {currentPage} of {totalPages}</span>
                <button className="pager-btn" onClick={() => setCurrentPage(p => Math.min(totalPages, p+1))} disabled={currentPage === totalPages}>
                  Next <i className="fas fa-chevron-right"></i>
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
