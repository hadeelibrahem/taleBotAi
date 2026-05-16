import React from "react";
import "../styles/topStories.css";

const fallbackImage = "https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&w=800&q=80";

export default function TopStories({ stories = [], onStoryClick }) {
  return (
    <div className="top-stories-section">
      <div className="top-stories-grid">
        {stories.length === 0 ? (
          <p>No stories yet.</p>
        ) : (
          stories.map((story) => (
            <div
              className="top-story-card"
              key={story.id}
              role={onStoryClick ? "button" : undefined}
              tabIndex={onStoryClick ? 0 : undefined}
              onClick={() => onStoryClick?.(story)}
              onKeyDown={(event) => {
                if (!onStoryClick) return;
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  onStoryClick(story);
                }
              }}
            >
              <div className="top-story-image-wrap">
                <img
                  src={story.cover_image || fallbackImage}
                  alt={story.title}
                  className="top-story-image"
                />
              </div>
              <div className="top-story-content">
                <h3>{story.title}</h3>
                <p>
                  For {story.child_name || 'N/A'} · <span>{story.genre}</span>
                </p>
                <div className="story-progress-row">
                  <span>Progress</span>
                  <span>{story.progress_percentage}%</span>
                </div>
                <div className="story-progress-bar">
                  <div
                    className="story-progress-fill"
                    style={{ width: `${story.progress_percentage}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
