import React from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import "../styles/MyStories.css";
import "@fortawesome/fontawesome-free/css/all.min.css";

export default function MyStories() {
  const navigate = useNavigate();

  const stories = [
    { id: 1, title: "The Dragon's Picnic", genre: "Fantasy", moral: "Kindness", image: "https://picsum.photos/seed/dragon/400/300", chapters: [] },
    { id: 2, title: "Mia and the Moonbeam", genre: "Fantasy", moral: "Kindness", image: "https://picsum.photos/seed/mia/400/300", chapters: [] },
    { id: 3, title: "The Sleepy Elephant", genre: "Fantasy", moral: "Kindness", image: "https://picsum.photos/seed/elephant/400/300", chapters: [] },
    { id: 4, title: "Oliver's Starfish", genre: "Fantasy", moral: "Kindness", image: "https://picsum.photos/seed/starfish/400/300", chapters: [] },
    { id: 5, title: "Gears and Giggles", genre: "Fantasy", moral: "Kindness", image: "https://picsum.photos/seed/gears/400/300", chapters: [] },
    { id: 6, title: "The Tiny Pirate", genre: "Fantasy", moral: "Kindness", image: "https://picsum.photos/seed/pirate/400/300", chapters: [] },
    { id: 7, title: "The Cloud Castle", genre: "Fantasy", moral: "Kindness", image: "https://picsum.photos/seed/cloudcastle/400/300", chapters: [] },
    { id: 8, title: "The Bedtime Detective", genre: "Fantasy", moral: "Kindness", image: "https://picsum.photos/seed/detective/400/300", chapters: [] },
    { id: 9, title: "Whispering Woods", genre: "Fantasy", moral: "Kindness", image: "https://picsum.photos/seed/whispering/400/300", chapters: [] },
    { id: 10, title: "The Rainbow Key", genre: "Fantasy", moral: "Kindness", image: "https://picsum.photos/seed/rainbowkey/400/300", chapters: [] },
    { id: 11, title: "Sarah's Clockwork Castle", genre: "Fantasy", moral: "Kindness", image: "https://picsum.photos/seed/clockwork/400/300", chapters: [] },
    { id: 12, title: "The Flying Bathtastic", genre: "Fantasy", moral: "Kindness", image: "https://picsum.photos/seed/bathtastic/400/300", chapters: [] },
  ];

  const handleStoryClick = (story) => {
    navigate("/reader", { state: { story } });
  };

  return (
    <div className="main-container">
      <Sidebar activeItem="stories" />

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
                  <h2>Sarah&apos;s Storyscape Library</h2>
                  <span className="stories-badge">{stories.length} Stories</span>
                </div>
              </div>

              <div className="top-center">
                <h3>Search and Filter</h3>

                <div className="search-box">
                  <i className="fas fa-search"></i>
                  <input type="text" placeholder="Find a Story..." />
                </div>
              </div>

              <div className="top-right insight-box">
                <h3>Parent&apos;s Insights</h3>

                <select className="genre-select">
                  <option>Genre</option>
                  <option>Fantasy</option>
                  <option>Adventure</option>
                  <option>Fairy Tale</option>
                </select>

                <div className="insight-status">
                  <span className="status-title">AI Engine Status</span>
                  <div className="status-row">
                    <span className="status-dot"></span>
                    <span className="status-text">Library up-to-date</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="stories-grid">
              {stories.map((story) => (
                <div
                  key={story.id}
                  className="story-tile"
                  onClick={() => handleStoryClick(story)}
                >
                  <div className="story-thumb">
                    <img src={story.image} alt={story.title} />
                  </div>

                  <h4>{story.title}</h4>

                  <div className="meta-list">
                    <div className="meta-item">
                      <i className="far fa-compass"></i>
                      <span>Genre: {story.genre}</span>
                    </div>

                    <div className="meta-item">
                      <i className="fas fa-wand-magic-sparkles"></i>
                      <span>Moral: {story.moral}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="stories-footer">
              <button className="pager-btn">Previous</button>
              <span className="pager-text">Page 1 of 1</span>
              <button className="pager-btn">Next</button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}