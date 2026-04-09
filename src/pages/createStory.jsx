import React from "react";
import Sidebar from "../components/Sidebar";
import "../styles/createStory.css";
import Topbar from "../components/Topbar";

function CreateStory() {
  return (
    <div className="create-story-page">
      <Sidebar />

      <div className="create-story-main">
        <div className="create-story-overlay"></div>

        <div className="create-story-content">
          <div className="create-story-topbar">
            <Topbar />
          </div>

          <div className="story-builder-layout">
            {/* Left Form */}
            <div className="story-form-card">
              <h2 className="story-form-title">Story Customization Form</h2>

              {/* Row 1 */}
              <div className="top-fields-row">
                {/* Child Name */}
                <div className="input-with-sticker">
                  <img
                    src="/imags/icons8-robotic-94.png"
                    alt="robot"
                    className="side-sticker"
                  />
                  <div className="field-block">
                    <label>Child's Name</label>
                    <input type="text" placeholder="[Enter Name]" />
                  </div>
                </div>

                {/* Age */}
                <div className="input-with-sticker">
                  <img
                    src="/imags/icons8-birthday-cake.gif"
                    alt="cake"
                    className="side-sticker"
                  />
                  <div className="field-block">
                    <label>Age</label>
                    <select>
                      <option>3-5</option>
                      <option>6-8</option>
                      <option>9-11</option>
                      <option>12+</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Moral */}
              <div className="single-field-row">
                <div className="input-with-sticker moral-row">
                  <img
                    src="/imags/icons8-handshake-100.png"
                    alt="moral"
                    className="side-sticker"
                  />
                  <div className="field-block">
                    <label>Moral Lesson</label>
                    <select>
                      <option>Kindness</option>
                      <option>Honesty</option>
                      <option>Courage</option>
                      <option>Sharing</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Story Length */}
              <div className="single-field-row">
                <div className="input-with-sticker story-length-row">
                  <img
                    src="/imags/icons8-storytelling-100.png"
                    alt="book"
                    className="side-sticker"
                  />
                  <div className="field-block">
                    <label>Story Length</label>
                    <div className="length-buttons">
                      <button className="length-btn">Short</button>
                      <button className="length-btn active">Medium</button>
                      <button className="length-btn">Long</button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Genre Cards */}
              <h4 className="section-title">Selectable Story Genre Cards</h4>

              <div className="genre-grid">
                <div className="genre-card active">
                  <img
                    src="/imags/icons8-fantasy-100.png"
                    alt="fantasy"
                    className="genre-sticker"
                  />
                  <p>Fantasy</p>
                </div>

                <div className="genre-card">
                  <img
                    src="/imags/icons8-space-fighter-40.png"
                    alt="adventure"
                    className="genre-sticker"
                  />
                  <p>Adventure</p>
                </div>

                <div className="genre-card">
                  <img
                    src="/imags/icons8-lion-100.png"
                    alt="animals"
                    className="genre-sticker"
                  />
                  <p>Animals</p>
                </div>

                <div className="genre-card">
                  <img
                    src="/imags/icons8-magician-100.png"
                    alt="mystery"
                    className="genre-sticker"
                  />
                  <p>Mystery</p>
                </div>
              </div>

              {/* Illustration */}
              <h4 className="section-title">Illustration Style</h4>

              <div className="style-grid">
                <div className="style-card active">
                  <img
                    src="/imags/icons8-color-palette-100.png"
                    alt="watercolor"
                    className="style-sticker"
                  />
                  <span>Water Color</span>
                </div>

                <div className="style-card">
                  <img
                    src="/imags/icons8-pencil-100.png"
                    alt="pencil"
                    className="style-sticker"
                  />
                  <span>Pencil Sketch</span>
                </div>

                <div className="style-card">
                  <img
                    src="/imags/icons8-finn-100.png"
                    alt="cartoon"
                    className="style-sticker"
                  />
                  <span>Cartoon</span>
                </div>

                <div className="style-card">
                  <img
                    src="/imags/icons8-cartoon-100.png"
                    alt="whimsical"
                    className="style-sticker"
                  />
                  <span>Whimsical</span>
                </div>
              </div>

              <div className="generate-btn-wrap">
                <button className="generate-btn">✨ Generate Magical Story →</button>
              </div>
            </div>

            {/* Right Preview */}
            <div className="story-preview-card">
              <div className="preview-header">
                <div>
                  <h3>Live Story Preview</h3>
                  <p>Sample Story Cover</p>
                </div>

                <div className="preview-actions">
                  <button>Save</button>
                  <button>Share</button>
                </div>
              </div>

              <div className="preview-cover">
                <img
                  src="/imags/pink-castle-blue.webp"
                  alt="story preview"
                />
                <h4>Story Title (Preview)</h4>
              </div>

              <div className="preview-text-box">
                <h5>Example Opening Sentence:</h5>
                <p>
                  "Once upon a time, in a land of cotton candy clouds and
                  talking stars, lived a curious little girl..."
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreateStory;