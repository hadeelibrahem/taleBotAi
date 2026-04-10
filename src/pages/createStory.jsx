import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import "../styles/createStory.css";
import Topbar from "../components/Topbar";

function CreateStory() {
  const [formData, setFormData] = useState({
    child_name: "",
    age: "3-5",
    moral_lesson: "Kindness",
    story_length: "medium",
    genre: "Fantasy",
    illustration_style: "Water Color",
  });

  const [preview, setPreview] = useState({
    title: "Story Title (Preview)",
    opening_sentence:
      "Once upon a time, in a land of cotton candy clouds and talking stars, lived a curious little child...",
    pages: [],
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLengthSelect = (length) => {
    setFormData((prev) => ({
      ...prev,
      story_length: length,
    }));
  };

  const handleGenreSelect = (genre) => {
    setFormData((prev) => ({
      ...prev,
      genre,
    }));
  };

  const handleStyleSelect = (style) => {
    setFormData((prev) => ({
      ...prev,
      illustration_style: style,
    }));
  };

  const generateStory = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("http://127.0.0.1:8000/api/stories/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        if (result.errors) {
          const firstError = Object.values(result.errors)[0]?.[0];
          throw new Error(firstError || "Validation failed");
        }
        throw new Error(result.message || "Failed to generate story");
      }

      setPreview({
        title: result.data.title || "Generated Story",
        opening_sentence:
          result.data.opening_sentence || "No opening sentence returned.",
        pages: result.data.pages || [],
      });
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

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
            <div className="story-form-card">
              <h2 className="story-form-title">Story Customization Form</h2>

              <div className="top-fields-row">
                <div className="input-with-sticker">
                  <img
                    src="/imags/icons8-robotic-94.png"
                    alt="robot"
                    className="side-sticker"
                  />
                  <div className="field-block">
                    <label>Child's Name</label>
                    <input
                      type="text"
                      name="child_name"
                      placeholder="[Enter Name]"
                      value={formData.child_name}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="input-with-sticker">
                  <img
                    src="/imags/icons8-birthday-cake.gif"
                    alt="cake"
                    className="side-sticker"
                  />
                  <div className="field-block">
                    <label>Age</label>
                    <select
                      name="age"
                      value={formData.age}
                      onChange={handleInputChange}
                    >
                      <option value="3-5">3-5</option>
                      <option value="6-8">6-8</option>
                      <option value="9-11">9-11</option>
                      <option value="12+">12+</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="single-field-row">
                <div className="input-with-sticker moral-row">
                  <img
                    src="/imags/icons8-handshake-100.png"
                    alt="moral"
                    className="side-sticker"
                  />
                  <div className="field-block">
                    <label>Moral Lesson</label>
                    <select
                      name="moral_lesson"
                      value={formData.moral_lesson}
                      onChange={handleInputChange}
                    >
                      <option value="Kindness">Kindness</option>
                      <option value="Honesty">Honesty</option>
                      <option value="Courage">Courage</option>
                      <option value="Sharing">Sharing</option>
                    </select>
                  </div>
                </div>
              </div>

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
                      <button
                        type="button"
                        className={`length-btn ${
                          formData.story_length === "short" ? "active" : ""
                        }`}
                        onClick={() => handleLengthSelect("short")}
                      >
                        Short
                      </button>
                      <button
                        type="button"
                        className={`length-btn ${
                          formData.story_length === "medium" ? "active" : ""
                        }`}
                        onClick={() => handleLengthSelect("medium")}
                      >
                        Medium
                      </button>
                      <button
                        type="button"
                        className={`length-btn ${
                          formData.story_length === "long" ? "active" : ""
                        }`}
                        onClick={() => handleLengthSelect("long")}
                      >
                        Long
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <h4 className="section-title">Selectable Story Genre Cards</h4>

              <div className="genre-grid">
                <div
                  className={`genre-card ${
                    formData.genre === "Fantasy" ? "active" : ""
                  }`}
                  onClick={() => handleGenreSelect("Fantasy")}
                >
                  <img
                    src="/imags/icons8-fantasy-100.png"
                    alt="fantasy"
                    className="genre-sticker"
                  />
                  <p>Fantasy</p>
                </div>

                <div
                  className={`genre-card ${
                    formData.genre === "Adventure" ? "active" : ""
                  }`}
                  onClick={() => handleGenreSelect("Adventure")}
                >
                  <img
                    src="/imags/icons8-space-fighter-40.png"
                    alt="adventure"
                    className="genre-sticker"
                  />
                  <p>Adventure</p>
                </div>

                <div
                  className={`genre-card ${
                    formData.genre === "Animals" ? "active" : ""
                  }`}
                  onClick={() => handleGenreSelect("Animals")}
                >
                  <img
                    src="/imags/icons8-lion-100.png"
                    alt="animals"
                    className="genre-sticker"
                  />
                  <p>Animals</p>
                </div>

                <div
                  className={`genre-card ${
                    formData.genre === "Mystery" ? "active" : ""
                  }`}
                  onClick={() => handleGenreSelect("Mystery")}
                >
                  <img
                    src="/imags/icons8-magician-100.png"
                    alt="mystery"
                    className="genre-sticker"
                  />
                  <p>Mystery</p>
                </div>
              </div>

              <h4 className="section-title">Illustration Style</h4>

              <div className="style-grid">
                <div
                  className={`style-card ${
                    formData.illustration_style === "Water Color" ? "active" : ""
                  }`}
                  onClick={() => handleStyleSelect("Water Color")}
                >
                  <img
                    src="/imags/icons8-color-palette-100.png"
                    alt="watercolor"
                    className="style-sticker"
                  />
                  <span>Water Color</span>
                </div>

                <div
                  className={`style-card ${
                    formData.illustration_style === "Pencil Sketch"
                      ? "active"
                      : ""
                  }`}
                  onClick={() => handleStyleSelect("Pencil Sketch")}
                >
                  <img
                    src="/imags/icons8-pencil-100.png"
                    alt="pencil"
                    className="style-sticker"
                  />
                  <span>Pencil Sketch</span>
                </div>

                <div
                  className={`style-card ${
                    formData.illustration_style === "Cartoon" ? "active" : ""
                  }`}
                  onClick={() => handleStyleSelect("Cartoon")}
                >
                  <img
                    src="/imags/icons8-finn-100.png"
                    alt="cartoon"
                    className="style-sticker"
                  />
                  <span>Cartoon</span>
                </div>

                <div
                  className={`style-card ${
                    formData.illustration_style === "Whimsical" ? "active" : ""
                  }`}
                  onClick={() => handleStyleSelect("Whimsical")}
                >
                  <img
                    src="/imags/icons8-cartoon-100.png"
                    alt="whimsical"
                    className="style-sticker"
                  />
                  <span>Whimsical</span>
                </div>
              </div>

              {error && <p style={{ color: "red", marginTop: "10px" }}>{error}</p>}

              <div className="generate-btn-wrap">
                <button
                  type="button"
                  className="generate-btn"
                  onClick={generateStory}
                  disabled={loading}
                >
                  {loading ? "Generating..." : "✨ Generate Magical Story →"}
                </button>
              </div>
            </div>

            <div className="story-preview-card">
              <div className="preview-header">
                <div>
                  <h3>Live Story Preview</h3>
                  <p>Sample Story Cover</p>
                </div>

                <div className="preview-actions">
                  <button type="button">Save</button>
                  <button type="button">Share</button>
                </div>
              </div>

              <div className="preview-cover">
                <img
                  src="/imags/pink-castle-blue.webp"
                  alt="story preview"
                />
                <h4>{preview.title}</h4>
              </div>

              <div className="preview-text-box">
                <h5>Example Opening Sentence:</h5>
                <p>{preview.opening_sentence}</p>
              </div>

              {preview.pages?.length > 0 && (
                <div className="preview-text-box" style={{ marginTop: "16px" }}>
                  <h5>Story Pages:</h5>
                  {preview.pages.map((page) => (
                    <p key={page.page_number}>
                      <strong>Page {page.page_number}:</strong> {page.text}
                    </p>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreateStory;