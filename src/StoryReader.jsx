import React, { useEffect, useMemo, useRef, useState } from "react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import Sidebar from "./Sidebar";
import "./StoryReader.css";

const pagesData = [
  {
    title: "✨ The Curious Key",
    content:
      "In the heart of the whispering woods, where the ancient oaks whispered secrets to the wind, lived a young girl named Elara. She had always been curious about the old clockwork castle that stood silent on the hill, its gears frozen in time.",
    image: "https://picsum.photos/seed/dragon/800/400",
  },
  {
    title: "🌟 The Hidden Path",
    content:
      "One sunny morning, while chasing a golden butterfly with sparkly wings, Elara stumbled upon a hidden path she had never seen before. The path was covered with glowing moss that sparkled like tiny stars.",
    image: "https://picsum.photos/seed/forest/800/400",
  },
  {
    title: "🏰 The Magical Castle",
    content:
      "At the end of the path stood the magnificent clockwork castle. Its towers reached toward the clouds, and intricate gears covered every surface, ticking and turning gently.",
    image: "https://picsum.photos/seed/castle/800/400",
  },
  {
    title: "🔑 The Golden Key",
    content:
      "Inside, Elara found a cozy room filled with ticking clocks of all shapes and sizes. In the center, on a velvet cushion, lay a golden key that glowed with warm light.",
    image: "https://picsum.photos/seed/key/800/400",
  },
  {
    title: "🌈 The Adventure Begins",
    content:
      "With the key in her hand, the castle magically came to life! Gears began turning and singing, music started playing, and a secret door revealed itself.",
    image: "https://picsum.photos/seed/magic/800/400",
  },
];

export default function StoryReader() {
  const [currentPage, setCurrentPage] = useState(0);
  const [speaking, setSpeaking] = useState(false);
  const [selectedVoiceType, setSelectedVoiceType] = useState("male");
  const [recordedAudio, setRecordedAudio] = useState(null);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [downloadText, setDownloadText] = useState("Download");

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const utteranceRef = useRef(null);
  const audioRef = useRef(null);
  const bookRef = useRef(null);

  const currentStory = useMemo(() => pagesData[currentPage], [currentPage]);

  useEffect(() => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.getVoices();
    }

    const handleKeyDown = (e) => {
      if (e.key === "ArrowRight") nextPage();
      if (e.key === "ArrowLeft") prevPage();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      stopSpeaking();
    };
  }, [currentPage, selectedVoiceType, recordedAudio]);

  const animateBook = (rotation) => {
    if (!bookRef.current) return;
    bookRef.current.style.transform = `scale(0.98) rotate(${rotation}deg)`;
    setTimeout(() => {
      if (bookRef.current) {
        bookRef.current.style.transform = "scale(1) rotate(0deg)";
      }
    }, 300);
  };

  const nextPage = () => {
    if (currentPage < pagesData.length - 1) {
      stopSpeaking();
      setCurrentPage((prev) => prev + 1);
      animateBook(1);
    } else {
      alert("🎉 Congratulations! You finished the story! Want to read the next one?");
    }
  };

  const prevPage = () => {
    if (currentPage > 0) {
      stopSpeaking();
      setCurrentPage((prev) => prev - 1);
      animateBook(-1);
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
        alert("✅ Your voice has been recorded! Now the story will be read with your voice.");
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

      audio.onended = () => {
        setSpeaking(false);
      };

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
    utterance.onerror = () => {
      setSpeaking(false);
      alert("❌ An error occurred with text-to-speech.");
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const downloadPDF = async () => {
    if (!bookRef.current) return;

    try {
      setDownloadLoading(true);
      setDownloadText("⏳ Loading...");

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "px",
        format: "a4",
      });

      const originalPage = currentPage;

      for (let i = 0; i < pagesData.length; i++) {
        setCurrentPage(i);
        await new Promise((resolve) => setTimeout(resolve, 500));

        const canvas = await html2canvas(bookRef.current, {
          scale: 2,
          backgroundColor: "#fff9f0",
          logging: false,
          allowTaint: true,
          useCORS: true,
        });

        const imgData = canvas.toDataURL("image/png");
        const imgWidth = pdf.internal.pageSize.getWidth();
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        if (i > 0) {
          pdf.addPage();
        }

        pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
        setDownloadText(`⏳ Page ${i + 1}/${pagesData.length}...`);
      }

      pdf.save("magical-story.pdf");
      setCurrentPage(originalPage);
      setDownloadText("Download");
      setDownloadLoading(false);
      alert("✅ Story downloaded successfully!");
    } catch (error) {
      console.error("PDF error:", error);
      setDownloadText("Download");
      setDownloadLoading(false);
      alert("❌ Sorry, an error occurred. Please try again.");
    }
  };

  return (
    <div className="main-container">
      <Sidebar activeItem="create" />

      <main className="flex-1 stories-bg p-8 overflow-y-auto">
        <div className="logo-watermark"></div>
        <div className="logo-corner"></div>

        <div className="stars-container">
          <i className="star large fa-solid fa-star" style={{ top: "5%", left: "10%" }}></i>
          <i className="star large fa-solid fa-star" style={{ top: "15%", left: "85%" }}></i>
          <i className="star large fa-solid fa-star" style={{ top: "30%", left: "70%" }}></i>
          <i className="star medium fa-solid fa-star" style={{ top: "10%", left: "35%" }}></i>
          <i className="star medium fa-solid fa-star" style={{ top: "45%", left: "75%" }}></i>
          <i className="star small fa-regular fa-star" style={{ top: "8%", left: "92%" }}></i>
          <i className="star small fa-regular fa-star" style={{ top: "72%", left: "15%" }}></i>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="mb-6">
            <div className="breadcrumb-cute">
              <i className="fa-regular fa-folder-open mr-2"></i>
              Sarah&apos;s Adventures
              <i className="fa-solid fa-chevron-right mx-2 text-pink-300"></i>
              The Magical Clockwork Castle
            </div>

            <h1>Story Reader &amp; Editor</h1>
            <h2>
              <i className="fa-regular fa-bookmark mr-2 text-pink-400"></i>
              Chapter 1: The Curious Key
            </h2>
          </div>

          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="cute-page-btn" onClick={prevPage}>
              <i className="fa-solid fa-chevron-left"></i>
            </div>

            <div className="cute-book" id="storyBook" ref={bookRef}>
              <div className="cute-pages" id="bookPages">
                <div id="pageContent">
                  <div className="page-image">
                    <img src={currentStory.image} alt={currentStory.title} />
                  </div>

                  <div className="cute-chapter-title">
                    <i className="fa-regular fa-star"></i> {currentStory.title}
                  </div>

                  <div className="cute-story-text">
                    <p>{currentStory.content}</p>
                    <p style={{ marginTop: "15px", color: "#c084fc", fontStyle: "italic" }}>
                      ✨ To be continued... ✨
                    </p>
                  </div>
                </div>

                <div className="page-indicator" id="pageNumber">
                  📖 Page {currentPage + 1} of {pagesData.length}
                </div>
              </div>
            </div>

            <div className="cute-page-btn" onClick={nextPage}>
              <i className="fa-solid fa-chevron-right"></i>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mt-4">
            <div className="cute-card">
              <div className="cute-card-title">
                <i className="fa-solid fa-gamepad text-pink-400"></i> Story Controls
              </div>

              <div className="flex gap-2 mb-3">
                <div
                  className={`cute-btn flex-1 ${speaking ? "speaking" : ""}`}
                  onClick={speakCurrentPage}
                >
                  <i className="fa-solid fa-headphones"></i>
                  <span>
                    {speaking
                      ? selectedVoiceType === "male"
                        ? "🔊 Male..."
                        : selectedVoiceType === "female"
                        ? "🔊 Female..."
                        : "🔊 Playing..."
                      : "Listen"}
                  </span>
                </div>

                <div
                  className={`cute-btn flex-1 ${downloadLoading ? "loading" : ""}`}
                  onClick={downloadPDF}
                >
                  <i className="fa-solid fa-file-pdf"></i>
                  <span>{downloadText}</span>
                </div>
              </div>

              <div className="voice-options">
                <button
                  className={`voice-option-btn ${selectedVoiceType === "male" ? "active" : ""}`}
                  onClick={() => selectVoiceType("male")}
                >
                  <i className="fa-solid fa-user-tie"></i> Male
                </button>

                <button
                  className={`voice-option-btn ${selectedVoiceType === "female" ? "active" : ""}`}
                  onClick={() => selectVoiceType("female")}
                >
                  <i className="fa-solid fa-user-nurse"></i> Female
                </button>

                <button
                  className={`voice-option-btn ${selectedVoiceType === "recorded" ? "active" : ""}`}
                  onClick={() => selectVoiceType("recorded")}
                >
                  <i className="fa-solid fa-microphone"></i> My Voice
                </button>
              </div>
            </div>

            <div className="cute-card">
              <div className="cute-card-title">
                <i className="fa-solid fa-star text-yellow-400"></i> Rate this Story
              </div>
              <div className="cute-stars">
                <i className="fa-solid fa-star"></i>
                <i className="fa-solid fa-star"></i>
                <i className="fa-solid fa-star"></i>
                <i className="fa-solid fa-star"></i>
                <i className="fa-regular fa-star"></i>
              </div>
              <div className="text-sm text-purple-400">4.5 (234 reviews)</div>
            </div>

            <div className="cute-card">
              <div className="cute-card-title">
                <i className="fa-solid fa-chart-simple text-purple-400"></i> Parent&apos;s Insights
              </div>
              <div className="flex justify-between mb-1">
                <span className="text-purple-600">Reading Time</span>
                <span className="text-2xl font-bold text-pink-400">48 min</span>
              </div>
              <div className="cute-progress">
                <div className="cute-progress-fill"></div>
              </div>
              <div className="flex justify-between text-xs text-purple-400">
                <span>75% completed</span>
                <span>12/16 chapters</span>
              </div>
            </div>

            <div className="cute-card">
              <div className="cute-card-title">
                <i className="fa-regular fa-pen-to-square text-purple-400"></i> Editor &amp; Feedback
              </div>
              <div className="cute-btn" onClick={() => alert("Opening text editor ✏️")}>
                <i className="fa-regular fa-pen-to-square"></i> Edit Text
              </div>
              <div className="cute-btn" onClick={() => alert("Added to favorites ❤️")}>
                <i className="fa-regular fa-heart"></i> Add to Favorites
              </div>
            </div>

            <div className="cute-card flex flex-col justify-center">
              <div className="flex items-center gap-2 mb-2">
                <i className="fa-regular fa-circle-check text-green-500 text-xl"></i>
                <span className="font-bold text-gray-700">AI Status</span>
              </div>
              <span className="cute-badge bg-green-400 text-center">Story Complete ✅</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}