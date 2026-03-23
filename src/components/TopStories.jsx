import React from "react";
import "../styles/topStories.css";

const stories = [
  {
    id: 1,
    title: "The Dragon's Magical Garden",
    author: "Oliver",
    genre: "Fantasy",
    progress: 75,
    image:
      "https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 2,
    title: "Castle in the Clouds",
    author: "Oliver",
    genre: "Adventure",
    progress: 45,
    image:
      "https://images.unsplash.com/photo-1511818966892-d7d671e672a2?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 3,
    title: "Starlight Dreams",
    author: "Sophia",
    genre: "Bedtime",
    progress: 100,
    image:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 4,
    title: "Rainbow Adventure",
    author: "Liam",
    genre: "Fun",
    progress: 30,
    image:
      "https://images.unsplash.com/photo-1494253109108-2e30c049369b?auto=format&fit=crop&w=800&q=80",
  },
];

export default function TopStories() {
  return (
    <div className="top-stories-section">
      <div className="top-stories-header">
       
       
      </div>

      <div className="top-stories-grid">
        {stories.map((story) => (
          <div className="top-story-card" key={story.id}>
            <div className="top-story-image-wrap">
              <img src={story.image} alt={story.title} className="top-story-image" />
            </div>

            <div className="top-story-content">
              <h3>{story.title}</h3>
              <p>
                For {story.author} · <span>{story.genre}</span>
              </p>

              <div className="story-progress-row">
                <span>Progress</span>
                <span>{story.progress}%</span>
              </div>

              <div className="story-progress-bar">
                <div
                  className="story-progress-fill"
                  style={{ width: `${story.progress}%` }}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}