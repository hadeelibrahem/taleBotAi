import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import Sidebar from "../components/Sidebar";
import "../styles/StoryReader.css";
import "@fortawesome/fontawesome-free/css/all.min.css";

export default function StoryReader() {
  const location = useLocation();
  const navigate = useNavigate();
  const story = location.state?.story;

  useEffect(() => {
    if (!story) {
      navigate("/stories");
    }
  }, [story, navigate]);

  const [currentPage, setCurrentPage] = useState(0);
  const [speaking, setSpeaking] = useState(false);
  const [selectedVoiceType, setSelectedVoiceType] = useState("male");
  const [recordedAudio, setRecordedAudio] = useState(null);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioRef = useRef(null);
  const bookRef = useRef(null);

  const pagesData = useMemo(() => {
    if (story?.chapters && story.chapters.length > 0) {
      return story.chapters.map((chapter) => ({
        title: chapter.title,
        content: chapter.content,
        image: chapter.image || story.image,
      }));
    }

    return [
      {
        title: "✨ The Curious Key",
        content:
          "In the heart of the whispering woods, a small golden key shimmered beneath the morning sun. Sarah bent down carefully and picked it up with wonder in her eyes. It felt warm and magical in her hand, as if it had been waiting just for her. Around her, the leaves danced softly in the wind, and somewhere far away she could hear tiny bells ringing in the forest.",
        image: "https://picsum.photos/seed/default/800/500",
      },
      {
        title: "🌟 The Hidden Path",
        content:
          "One sunny morning, Sarah discovered a narrow path behind the old oak tree leading to a magical castle. The path sparkled with silver dust, and every step she took made the flowers glow brighter. Butterflies fluttered beside her as if they were guiding her to something truly special. She smiled, knowing that an unforgettable adventure was about to begin.",
        image: "https://picsum.photos/seed/default2/800/500",
      },
    ];
  }, [story]);

  const currentStory = useMemo(() => pagesData[currentPage], [pagesData, currentPage]);

  useEffect(() => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.getVoices();
    }

    const handleKeyDown = (e) => {
      if (e.key === "ArrowRight") nextPage();
      if (e.key === "ArrowLeft") prevPage();
      if (e.key === "Escape") setIsExpanded(false);
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      stopSpeaking();
    };
  }, [currentPage, pagesData.length]);

  useEffect(() => {
    document.body.style.overflow = isExpanded ? "hidden" : "hidden";

    return () => {
      document.body.style.overflow = "hidden";
    };
  }, [isExpanded]);

  const animateStoryCard = (direction) => {
    if (!bookRef.current) return;

    bookRef.current.style.transform = `translateY(-4px) scale(0.99) ${
      direction === "next" ? "rotate(0.6deg)" : "rotate(-0.6deg)"
    }`;

    setTimeout(() => {
      if (bookRef.current) {
        bookRef.current.style.transform = "translateY(0) scale(1) rotate(0deg)";
      }
    }, 260);
  };

  const nextPage = () => {
    if (currentPage < pagesData.length - 1) {
      stopSpeaking();
      setCurrentPage((prev) => prev + 1);
      animateStoryCard("next");
    } else {
      alert("🎉 Congratulations! You finished the story!");
    }
  };

  const prevPage = () => {
    if (currentPage > 0) {
      stopSpeaking();
      setCurrentPage((prev) => prev - 1);
      animateStoryCard("prev");
    }
  };

  const stopSpeaking = () => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    setSpeaking(false);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);

      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/mp3" });
        setRecordedAudio(audioBlob);
        alert("✅ Your voice has been recorded!");
      };

      mediaRecorder.start();

      setTimeout(() => {
        if (mediaRecorder.state === "recording") {
          mediaRecorder.stop();
          mediaRecorder.stream.getTracks().forEach((track) => track.stop());
        }
      }, 30000);
    } catch (error) {
      console.error("Microphone error:", error);
      alert("❌ Please allow microphone access to record your voice.");
    }
  };

  const selectVoiceType = async (type) => {
    setSelectedVoiceType(type);
    if (type === "recorded") {
      await startRecording();
    }
  };

  const speakCurrentPage = () => {
    const textToSpeak = `${currentStory.title}. ${currentStory.content}`;

    if (speaking) {
      stopSpeaking();
      return;
    }

    if (selectedVoiceType === "recorded" && recordedAudio) {
      const audio = new Audio(URL.createObjectURL(recordedAudio));
      audioRef.current = audio;
      setSpeaking(true);
      audio.play();
      audio.onended = () => setSpeaking(false);
      return;
    }

    if (!("speechSynthesis" in window)) {
      alert("❌ Your browser does not support text-to-speech.");
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    const voices = window.speechSynthesis.getVoices();

    if (selectedVoiceType === "male") {
      const maleVoice = voices.find(
        (voice) =>
          voice.name.includes("Google UK English Male") ||
          voice.name.includes("Microsoft David") ||
          voice.name.includes("Male")
      );
      if (maleVoice) utterance.voice = maleVoice;
    } else if (selectedVoiceType === "female") {
      const femaleVoice = voices.find(
        (voice) =>
          voice.name.includes("Google US English") ||
          voice.name.includes("Microsoft Zira") ||
          voice.name.includes("Female")
      );
      if (femaleVoice) utterance.voice = femaleVoice;
    }

    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1;
    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const downloadPDF = async () => {
    if (!bookRef.current) return;

    try {
      setDownloadLoading(true);

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "px",
        format: "a4",
      });

      const originalPage = currentPage;

      for (let i = 0; i < pagesData.length; i++) {
        setCurrentPage(i);
        await new Promise((resolve) => setTimeout(resolve, 400));

        const canvas = await html2canvas(bookRef.current, {
          scale: 2,
          backgroundColor: "#ffffff",
          logging: false,
          allowTaint: true,
          useCORS: true,
        });

        const imgData = canvas.toDataURL("image/png");
        const imgWidth = pdf.internal.pageSize.getWidth();
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        if (i > 0) pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
      }

      pdf.save(`${story?.title || "story"}.pdf`);
      setCurrentPage(originalPage);
      alert("✅ Story downloaded successfully!");
    } catch (error) {
      console.error("PDF error:", error);
      alert("❌ Sorry, an error occurred. Please try again.");
    } finally {
      setDownloadLoading(false);
    }
  };

  if (!story) return null;

  return (
    <>
      <div className="main-container">
        <Sidebar activeItem="stories" />

        <main className="reader-page">
          <div className="reader-shell">
            <div className="reader-breadcrumb">
              <span>Sarah's Adventures</span>
              <span className="crumb-separator">›</span>
              <span className="active-crumb">{story.title}</span>
            </div>

            <div className="reader-card">
              <div className="sparkle sparkle-1">✦</div>
              <div className="sparkle sparkle-2">✦</div>
              <div className="sparkle sparkle-3">✦</div>
              <div className="sparkle sparkle-4">✦</div>

              <div className="reader-header">
                <h1>Story Reader &amp; Editor</h1>
                <h2 className="reader-subtitle">
                  <i className="fa-regular fa-bookmark"></i> {currentStory.title}
                </h2>
              </div>

              <div className="reader-book-area">
                <div className="storybook-card" ref={bookRef}>
                  <div className="storybook-float star-a">⭐</div>
                  <div className="storybook-float star-b">✨</div>
                  <div className="storybook-float star-c">🌙</div>

                  <div className="storybook-media">
                    <img src={currentStory.image} alt={currentStory.title} />
                    <div className="storybook-cloud cloud-1"></div>
                    <div className="storybook-cloud cloud-2"></div>
                  </div>

                  <div className="storybook-content">
                    <div className="storybook-topbar">
                      <span className="chapter-badge">Chapter {currentPage + 1}</span>
                      <span className="mini-page-badge">
                        Page {currentPage + 1} / {pagesData.length}
                      </span>
                    </div>

                    <h3 className="storybook-title">{currentStory.title}</h3>

                    <div className="storybook-text-box">
                      <p>{currentStory.content}</p>
                    </div>

                    <div className="storybook-actions">
                      <button
                        className="story-action-btn expand-btn"
                        onClick={() => setIsExpanded(true)}
                      >
                        <i className="fa-solid fa-expand"></i>
                        <span>Expand Story</span>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="reader-pagination">
                  <button className="pager-btn" onClick={prevPage}>
                    <i className="fa-solid fa-chevron-left"></i> Previous
                  </button>

                  <span className="page-info">
                    Page {currentPage + 1} of {pagesData.length}
                  </span>

                  <button className="pager-btn" onClick={nextPage}>
                    Next <i className="fa-solid fa-chevron-right"></i>
                  </button>
                </div>
              </div>

              <div className="reader-controls-grid">
                <div className="control-card">
                  <div className="control-header">
                    <i className="fa-solid fa-gamepad"></i>
                    <h3>Story Controls</h3>
                  </div>

                  <div className="control-buttons">
                    <button
                      className={`control-btn primary ${speaking ? "active" : ""}`}
                      onClick={speakCurrentPage}
                    >
                      <i className="fa-solid fa-headphones"></i>
                      <span>{speaking ? "Speaking..." : "Listen (TTS)"}</span>
                    </button>

                    <button
                      className={`control-btn secondary ${downloadLoading ? "loading" : ""}`}
                      onClick={downloadPDF}
                    >
                      <i className="fa-solid fa-file-pdf"></i>
                      <span>{downloadLoading ? "Loading..." : "Download PDF"}</span>
                    </button>
                  </div>

                  <div className="voice-group">
                    <button
                      className={`voice-chip ${selectedVoiceType === "male" ? "active" : ""}`}
                      onClick={() => selectVoiceType("male")}
                    >
                      <i className="fa-solid fa-user-tie"></i> Male
                    </button>

                    <button
                      className={`voice-chip ${selectedVoiceType === "female" ? "active" : ""}`}
                      onClick={() => selectVoiceType("female")}
                    >
                      <i className="fa-solid fa-user-nurse"></i> Female
                    </button>

                    <button
                      className={`voice-chip ${selectedVoiceType === "recorded" ? "active" : ""}`}
                      onClick={() => selectVoiceType("recorded")}
                    >
                      <i className="fa-solid fa-microphone"></i> My Voice
                    </button>
                  </div>
                </div>

                <div className="control-card">
                  <div className="control-header">
                    <i className="fa-solid fa-star"></i>
                    <h3>Rate this Story</h3>
                  </div>

                  <div className="rating-stars">
                    <i className="fa-solid fa-star"></i>
                    <i className="fa-solid fa-star"></i>
                    <i className="fa-solid fa-star"></i>
                    <i className="fa-solid fa-star"></i>
                    <i className="fa-regular fa-star"></i>
                  </div>

                  <div className="rating-text">4.5 (234 reviews)</div>
                </div>

                <div className="control-card">
                  <div className="control-header">
                    <i className="fa-solid fa-chart-simple"></i>
                    <h3>Parent's Insights</h3>
                  </div>

                  <div className="insight-time">
                    <span className="time-number">48</span>
                    <span className="time-unit">min</span>
                  </div>

                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: "75%" }}></div>
                  </div>

                  <div className="progress-labels">
                    <span>75% completed</span>
                    <span>12/16 chapters</span>
                  </div>
                </div>

                <div className="control-card">
                  <div className="control-header">
                    <i className="fa-regular fa-pen-to-square"></i>
                    <h3>Editor &amp; Feedback</h3>
                  </div>

                  <div className="control-buttons vertical">
                    <button className="control-btn outline" onClick={() => alert("Edit Text ✏️")}>
                      <i className="fa-regular fa-pen-to-square"></i> Edit Text
                    </button>

                    <button
                      className="control-btn outline"
                      onClick={() => alert("Added to favorites ❤️")}
                    >
                      <i className="fa-regular fa-heart"></i> Add to Favorites
                    </button>
                  </div>
                </div>

                <div className="control-card ai-status">
                  <div className="status-row">
                    <span className="status-dot green"></span>
                    <span className="status-label">AI Engine Status</span>
                  </div>

                  <div className="status-badge">Story Complete ✅</div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* ===== EXPANDED FULLSCREEN MODE - صورة كاملة والنص تحت ===== */}
{isExpanded && (
  <div className="fullscreen-reader-overlay">
    <div className="fullscreen-reader-container">
      <button className="fullscreen-close-btn" onClick={() => setIsExpanded(false)}>
        <i className="fa-solid fa-xmark"></i> Close
      </button>

      <div className="fullscreen-content">
        {/* الصورة - كاملة بدون تقطيع */}
        <div className="fullscreen-image">
          <img src={currentStory.image} alt={currentStory.title} />
          <div className="fullscreen-chapter-badge">
            <i className="fa-regular fa-star"></i> Chapter {currentPage + 1}
          </div>
        </div>

        {/* العنوان */}
        <h1 className="fullscreen-title">{currentStory.title}</h1>

        {/* النص تحت الصورة */}
        <div className="fullscreen-text">
          <p>{currentStory.content}</p>
        </div>

        {/* شريط التقدم */}
        <div className="fullscreen-progress">
          <div className="fullscreen-progress-bar">
            <div className="fullscreen-progress-fill" style={{ width: `${Math.round(((currentPage + 1) / pagesData.length) * 100)}%` }}></div>
          </div>
          <span className="fullscreen-progress-text">
            Page {currentPage + 1} of {pagesData.length} · {Math.round(((currentPage + 1) / pagesData.length) * 100)}% complete
          </span>
        </div>

        {/* أزرار التنقل الكبيرة */}
        <div className="fullscreen-nav">
          <button className="fullscreen-nav-btn prev" onClick={prevPage}>
            <i className="fa-solid fa-chevron-left"></i> Previous Page
          </button>
          <button className="fullscreen-nav-btn next" onClick={nextPage}>
            Next Page <i className="fa-solid fa-chevron-right"></i>
          </button>
        </div>
      </div>
    </div>
  </div>
)}
    </>
  );
}