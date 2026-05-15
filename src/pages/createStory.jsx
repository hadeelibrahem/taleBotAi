import React, { useEffect, useState } from "react";
import ChildSidebar from "../components/ChildSidebar";
import Topbar from "../components/Topbar";
import "../styles/createStory.css";
import { buildApiUrl, parseJsonResponse } from "@/services/apiClient";
import { useParams } from "react-router-dom";

function CreateStory() {
  const { id } = useParams();

  const [formData, setFormData] = useState({
    child_id: id,
    child_name: "",
    age: "3-5",
    moral_lesson: "Kindness",
    story_length: "medium",
    genre: "Fantasy",
    illustration_style: "Water Color",
    use_child_photo: false,
  });

  const [childPhoto, setChildPhoto] = useState(null);
  const [preview, setPreview] = useState({
    title: "Story Title (Preview)",
    opening_sentence: "Once upon a time...",
    pages: [],
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  }, []);
  const planKey = String(user?.plan || "").toLowerCase();
  const canUsePremiumCharacter = ["premium", "unlimited"].some((plan) => planKey.includes(plan));

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      return;
    }

    fetch(buildApiUrl("/api/user"), {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => (response.ok ? response.json() : null))
      .then((payload) => {
        if (payload) {
          localStorage.setItem("user", JSON.stringify(payload));
          setUser(payload);
        }
      })
      .catch(() => {});
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === "use_child_photo" && checked && !canUsePremiumCharacter) {
      setError("Using your child's photo as a character is available for Premium or Unlimited users only.");
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleLengthSelect = (length) => setFormData((prev) => ({ ...prev, story_length: length }));
  const handleGenreSelect = (genre) => setFormData((prev) => ({ ...prev, genre }));
  const handleStyleSelect = (style) => setFormData((prev) => ({ ...prev, illustration_style: style }));

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0] || null;
    if (file) setChildPhoto(file);
  };

  const generateStory = async () => {
    if (loading) return;
    try {
      setLoading(true);
      setError("");
      if (formData.use_child_photo && !canUsePremiumCharacter) {
        setError("Using your child's photo as a character is available for Premium or Unlimited users only.");
        return;
      }

      const payload = new FormData();
      Object.keys(formData).forEach(key => {
        payload.append(key, key === 'use_child_photo' ? (formData[key] ? "1" : "0") : formData[key]);
      });
      if (formData.use_child_photo && childPhoto) payload.append("child_photo", childPhoto);

      const response = await fetch(buildApiUrl("/api/stories/generate"), {
        method: "POST",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        },
        body: payload,
      });
      const result = await parseJsonResponse(response);
      setPreview(result.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-story-page">
      <ChildSidebar child={JSON.parse(localStorage.getItem("childUser") || "null")} />
      <div className="create-story-main">
       
        <div className="create-story-content">
          <div className="create-story-topbar">
            <Topbar />
          </div>

          <div className="story-builder-layout">
            <div className="story-form-card">
              <h2 className="story-form-title">Story Customization Form</h2>

              {/* Row 1: Name and Age with Stickers */}
              <div className="top-fields-row">
                <div className="input-with-sticker">
                  <img src="/imags/icons8-robotic-94.png" alt="robot" className="side-sticker" />
                  <div className="field-block">
                    <label>Child's Name</label>
                    <input type="text" name="child_name" placeholder="[Enter Name]" value={formData.child_name} onChange={handleInputChange} />
                  </div>
                </div>

                <div className="input-with-sticker">
                  <img src="/imags/icons8-birthday-cake.gif" alt="cake" className="side-sticker" />
                  <div className="field-block">
                    <label>Age</label>
                    <select name="age" value={formData.age} onChange={handleInputChange}>
                      <option value="3-5">3-5</option>
                      <option value="6-8">6-8</option>
                      <option value="9-11">9-11</option>
                      <option value="12+">12+</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Moral Lesson with Sticker */}
              <div className="single-field-row">
                <div className="input-with-sticker moral-row">
                  <img src="/imags/icons8-handshake-100.png" alt="moral" className="side-sticker" />
                  <div className="field-block">
                    <label>Moral Lesson</label>
                    <select name="moral_lesson" value={formData.moral_lesson} onChange={handleInputChange}>
                      <option value="Kindness">Kindness</option>
                      <option value="Honesty">Honesty</option>
                      <option value="Courage">Courage</option>
                      <option value="Sharing">Sharing</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Story Length with Sticker */}
              <div className="single-field-row">
                <div className="input-with-sticker story-length-row">
                  <img src="/imags/icons8-storytelling-100.png" alt="book" className="side-sticker" />
                  <div className="field-block">
                    <label>Story Length</label>
                    <div className="length-buttons">
                      {["short", "medium", "long"].map((len) => (
                        <button key={len} type="button" className={`length-btn ${formData.story_length === len ? "active" : ""}`} onClick={() => handleLengthSelect(len)}>
                          {len.charAt(0).toUpperCase() + len.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Genre Grid with original Stickers */}
              <h4 className="section-title">Selectable Story Genre Cards</h4>
              <div className="genre-grid">
                <div className={`genre-card ${formData.genre === "Fantasy" ? "active" : ""}`} onClick={() => handleGenreSelect("Fantasy")}>
                  <img src="/imags/icons8-fantasy-100.png" alt="fantasy" className="genre-sticker" />
                  <p>Fantasy</p>
                </div>
                <div className={`genre-card ${formData.genre === "Adventure" ? "active" : ""}`} onClick={() => handleGenreSelect("Adventure")}>
                  <img src="/imags/icons8-space-fighter-40.png" alt="adventure" className="genre-sticker" />
                  <p>Adventure</p>
                </div>
                <div className={`genre-card ${formData.genre === "Animals" ? "active" : ""}`} onClick={() => handleGenreSelect("Animals")}>
                  <img src="/imags/icons8-lion-100.png" alt="animals" className="genre-sticker" />
                  <p>Animals</p>
                </div>
                <div className={`genre-card ${formData.genre === "Mystery" ? "active" : ""}`} onClick={() => handleGenreSelect("Mystery")}>
                  <img src="/imags/icons8-magician-100.png" alt="mystery" className="genre-sticker" />
                  <p>Mystery</p>
                </div>
              </div>

              {/* Illustration Style Grid with original Stickers */}
              <h4 className="section-title">Illustration Style</h4>
              <div className="style-grid">
                <div className={`style-card ${formData.illustration_style === "Water Color" ? "active" : ""}`} onClick={() => handleStyleSelect("Water Color")}>
                  <img src="/imags/icons8-color-palette-100.png" alt="watercolor" className="style-sticker" />
                  <span>Water Color</span>
                </div>
                <div className={`style-card ${formData.illustration_style === "Pencil Sketch" ? "active" : ""}`} onClick={() => handleStyleSelect("Pencil Sketch")}>
                  <img src="/imags/icons8-pencil-100.png" alt="pencil" className="style-sticker" />
                  <span>Pencil Sketch</span>
                </div>
                <div className={`style-card ${formData.illustration_style === "Cartoon" ? "active" : ""}`} onClick={() => handleStyleSelect("Cartoon")}>
                  <img src="/imags/icons8-finn-100.png" alt="cartoon" className="style-sticker" />
                  <span>Cartoon</span>
                </div>
                <div className={`style-card ${formData.illustration_style === "Whimsical" ? "active" : ""}`} onClick={() => handleStyleSelect("Whimsical")}>
                  <img src="/imags/icons8-cartoon-100.png" alt="whimsical" className="style-sticker" />
                  <span>Whimsical</span>
                </div>
              </div>

              {/* Premium Toggle & Upload Section */}
              <h4 className="section-title">Premium Character Option</h4>
              <div className="premium-toggle-row">
                <label className="modern-switch">
                  <input
                    type="checkbox"
                    name="use_child_photo"
                    checked={formData.use_child_photo}
                    onChange={handleInputChange}
                    disabled={!canUsePremiumCharacter}
                  />
                  <span className="slider round"></span>
                </label>
                <span className="premium-label">
                  Use my child's photo as character (Premium / Unlimited)
                  {!canUsePremiumCharacter ? " - upgrade required" : ""}
                </span>
              </div>

              {formData.use_child_photo && (
                <div className={`upload-container animate-fade-in ${childPhoto ? 'has-file' : ''}`}>
                  <label htmlFor="file-upload" className="custom-upload-card">
                    <input id="file-upload" type="file" accept="image/*" onChange={handlePhotoChange} className="hidden-input" />
                    <div className="upload-content">
                      {childPhoto ? (
                        <div className="image-preview-wrapper">
                          <img src={URL.createObjectURL(childPhoto)} alt="preview" className="upload-preview-img" />
                          <div className="image-overlay"><span>Change Photo</span></div>
                        </div>
                      ) : (
                        <>
                          <div className="upload-icon-circle">
                             <img src="/imags/icons8-upload-96.png" alt="upload" className="upload-icon-anim" />
                          </div>
                          <p className="upload-text">Drag & Drop or <span>Browse</span></p>
                        </>
                      )}
                    </div>
                  </label>
                </div>
              )}

              {error && <p className="error-message">{error}</p>}

              <div className="generate-btn-wrap">
                <button type="button" className="generate-btn" onClick={generateStory} disabled={loading}>
                  {loading ? "Magic in progress..." : "✨ Generate Magical Story →"}
                </button>
              </div>
            </div>

            {/* Preview Card */}
            <div className="story-preview-card">
              <div className="preview-header">
                <div><h3>Live Story Preview</h3><p>Sample Story Cover</p></div>
                <div className="preview-actions"><button>Save</button><button>Share</button></div>
              </div>
              <div className="preview-cover">
                <img src="/imags/pink-castle-blue.webp" alt="preview" />
                <h4>{preview.title}</h4>
              </div>
              <div className="preview-text-box">
                <h5>Opening Sentence:</h5>
                <p>{preview.opening_sentence}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreateStory;
