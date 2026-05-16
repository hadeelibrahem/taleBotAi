import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import Sidebar from "../components/Sidebar";
import ChildSidebar from "../components/ChildSidebar";
import "../styles/StoryReader.css";
import "@fortawesome/fontawesome-free/css/all.min.css";

export default function StoryReader() {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();
  const story = location.state?.story;
  const selectedChildId = id || localStorage.getItem("selectedChildId") || 1;
  const isChildReader = Boolean(id);
  const [child, setChild] = useState(() => {
    const stored = localStorage.getItem("childUser");
    return stored ? JSON.parse(stored) : null;
  });

  const [currentPage, setCurrentPage] = useState(0);
  const [speaking, setSpeaking] = useState(false);
  const [selectedVoiceType, setSelectedVoiceType] = useState("male");
  const [recordedAudio, setRecordedAudio] = useState(null);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [readingSeconds, setReadingSeconds] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState("");
  const [savedProgress, setSavedProgress] = useState(null);
  const [showProgressChoice, setShowProgressChoice] = useState(false);
  const [progressPercentage, setProgressPercentage] = useState(0);
  const [autoPlay, setAutoPlay] = useState(false);
  const [canUseCartoonVoice, setCanUseCartoonVoice] = useState(false);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioRef = useRef(null);
  const bookRef = useRef(null);
  const autoPlayRef = useRef(false);

  useEffect(() => {
    if (!story) {
      navigate(id ? `/child/${id}/stories` : "/stories");
    }
  }, [story, navigate, id]);

  useEffect(() => {
    if (!id || child?.name) {
      return;
    }

    fetch(`http://127.0.0.1:8000/api/children/${id}/dashboard`)
      .then((res) => res.json())
      .then((json) => {
        const name = json.data?.hero_section?.title?.replace("Welcome ", "") || "Child";

        setChild({
          id,
          name,
          avatar: "ðŸ‘¶",
        });
      })
      .catch((err) => {
        console.error("Child info error:", err);
      });
  }, [id, child?.name]);

  useEffect(() => {
    const timer = setInterval(() => {
      setReadingSeconds((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    const isPaidPlan = (user) => {
      const plan = String(user?.plan || "").toLowerCase();
      return ["premium", "unlimited"].includes(plan) && user?.payment_status !== "expired";
    };

    if (storedUser) {
      try {
        setCanUseCartoonVoice(isPaidPlan(JSON.parse(storedUser)));
      } catch {
        setCanUseCartoonVoice(false);
      }
    }

    if (!token) return;

    fetch("http://127.0.0.1:8000/api/user", {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((user) => {
        if (!user) return;
        localStorage.setItem("user", JSON.stringify(user));
        setCanUseCartoonVoice(isPaidPlan(user));
      })
      .catch((error) => {
        console.error("Plan check error:", error);
      });
  }, []);

  const saveRating = async (ratingValue) => {
    if (!story) return;

    try {
      await fetch("http://127.0.0.1:8000/api/story-ratings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          child_id: selectedChildId,
          story_id: story.id,
          rating: ratingValue,
        }),
      });

      alert(`You rated this story ${ratingValue} stars ⭐`);
    } catch (error) {
      console.error("Rating error:", error);
    }
  };

  useEffect(() => {
  if (!story?.id) return;

fetch(`http://127.0.0.1:8000/api/favorites/check/${selectedChildId}/${story.id}`) 
     .then((res) => res.json())
    .then((data) => {
      setIsFavorite(data.is_favorite);
    })
    .catch((error) => console.error("Check favorite error:", error));
}, [story?.id, selectedChildId]);

  const pagesData = useMemo(() => {
    if (story?.chapters && story.chapters.length > 0) {
      return story.chapters.map((chapter, index) => ({
        id: chapter.id,
        title: chapter.title || `Page ${index + 1}`,
        content: chapter.content || chapter.text || "",
        image: chapter.image || story.image,
      }));
    }

    if (story?.pages && story.pages.length > 0) {
      return story.pages.map((page, index) => ({
        id: page.id,
        title: page.title || story.title || `Page ${page.page_number || index + 1}`,
        content: page.content || page.text || page.text_content || "",
        image: page.image || page.image_url || story.image || story.cover_image,
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

    
  useEffect(() => {
  if (!story?.id || pagesData.length === 0) return;

  const fetchProgress = async () => {
    try {
      setCurrentPage(0);
      setReadingSeconds(0);
      setSavedProgress(null);
      setShowProgressChoice(false);

      const res = await fetch(
        `http://127.0.0.1:8000/api/progress/${selectedChildId}/${story.id}`
      );

      const data = await res.json();

      if (data.success && data.data) {
        const savedPercentage = Number(data.data.progress_percentage || 0);
        const savedMinutes = Number(data.data.reading_time_minutes || 0);

        if (savedPercentage > 0 || savedMinutes > 0) {
          setSavedProgress(data.data);
          setShowProgressChoice(true);
        }
      }
    } catch (error) {
      console.error("Fetch progress error:", error);
    }
  };

  fetchProgress();
}, [story?.id, pagesData.length, selectedChildId]);

  const currentStory = useMemo(() => {
    return pagesData[currentPage];
  }, [pagesData, currentPage]);

  useEffect(() => {
  if (currentStory?.content) {
    setEditedText(currentStory.content);
  }
}, [currentStory]);


  useEffect(() => {
  if ("speechSynthesis" in window) {
    window.speechSynthesis.getVoices();
  }

  const handleKeyDown = (e) => {
    if (e.key === "Escape") setIsExpanded(false);
  };

  document.addEventListener("keydown", handleKeyDown);

  return () => {
    document.removeEventListener("keydown", handleKeyDown);
  };
}, []);

  useEffect(() => {
    document.body.style.overflow = isExpanded ? "hidden" : "auto";

    return () => {
      document.body.style.overflow = "auto";
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

  const continueReading = () => {
  if (!savedProgress) return;

  const savedPercentage = Number(savedProgress.progress_percentage || 0);
  const savedMinutes = Number(savedProgress.reading_time_minutes || 0);

  if (savedPercentage >= 100) {
    alert("You already finished this story 🎉");
    setCurrentPage(pagesData.length - 1);
    setReadingSeconds(savedMinutes * 60);
    setProgressPercentage(100);
    setShowProgressChoice(false);
    return;
  }

  setReadingSeconds(savedMinutes * 60);
  setProgressPercentage(savedPercentage);

  const savedPage =
    Math.round((savedPercentage / 100) * pagesData.length) - 1;

  if (savedPage >= 0 && savedPage < pagesData.length) {
    setCurrentPage(savedPage);
  } else {
    setCurrentPage(0);
  }

  setShowProgressChoice(false);
};

const startStoryOver = async () => {
  try {
    setCurrentPage(0);
    setReadingSeconds(0);
    setShowProgressChoice(false);
    setSavedProgress(null);

    await fetch("http://127.0.0.1:8000/api/progress/reset", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        child_id: selectedChildId,
        story_id: story.id,
      }),
    });
  } catch (error) {
    console.error("Reset progress error:", error);
  }
};

const saveProgress = async (pageIndex) => {
  try {
    const progressPercentage = Math.round(
      ((pageIndex + 1) / pagesData.length) * 100
    );

    setProgressPercentage(progressPercentage);

    const res = await fetch("http://127.0.0.1:8000/api/progress", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        child_id: selectedChildId,
        story_id: story.id,
        progress_percentage: progressPercentage,
        reading_time_minutes: Math.ceil(readingSeconds / 60),
      }),
    });

    const data = await res.json();
    console.log("Progress response:", data);
  } catch (error) {
    console.error("Progress error:", error);
  }
};

const saveEditedText = async () => {
  try {
    console.log("Current story:", currentStory);
    console.log("Page ID:", currentStory?.id);

    if (!currentStory?.id) {
      alert("Cannot edit this page because page ID is missing.");
      return;
    }

    const res = await fetch(
      `http://127.0.0.1:8000/api/story-pages/${currentStory.id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          content: editedText,
        }),
      }
    );

    const data = await res.json();

    console.log("Update status:", res.status);
    console.log("Update response:", data);

    if (!res.ok) {
      alert(data.message || "Failed to update text.");
      return;
    }

    currentStory.content = editedText;
    setIsEditing(false);
    alert("Text updated successfully ✨");
  } catch (error) {
    console.error("Edit text error:", error);
    alert("Error while updating text.");
  }
};



  const nextPage = () => {
  if (currentPage < pagesData.length - 1) {
    stopSpeaking();

    const newPage = currentPage + 1;

    setCurrentPage(newPage);
    saveProgress(newPage);

    animateStoryCard("next");
  } else {
    alert("🎉 Congratulations! You finished the story!");
    saveProgress(currentPage);
  }
};

 const prevPage = () => {
  if (currentPage > 0) {
    stopSpeaking();

    const newPage = currentPage - 1;

    setCurrentPage(newPage);
    saveProgress(newPage);

    animateStoryCard("prev");
  }
};

const toggleFavorite = async () => {
  try {
    if (isFavorite) {
    await fetch(`http://127.0.0.1:8000/api/favorites/${selectedChildId}/${story.id}`, {
  method: "DELETE",
});

      setIsFavorite(false);
    } else {
      await fetch("http://127.0.0.1:8000/api/favorites", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          child_id: selectedChildId,
          story_id: story.id,
        }),
      });

      setIsFavorite(true);
    }
  } catch (error) {
    console.error("Favorite error:", error);
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
    if (type === "cartoon" && !canUseCartoonVoice) {
      alert("Cartoon voice is available for Premium or Unlimited plans only.");
      return;
    }

    setSelectedVoiceType(type);
    if (type === "recorded") {
      await startRecording();
    }
  };

const playCartoonVoice = async (text, onEnded = null) => {
  try {

    stopSpeaking();

    setSpeaking(true);

    const response = await fetch(
      "http://127.0.0.1:8000/api/cartoon-voice",
      {
        method: "POST",
        headers:{
          "Content-Type":"application/json",
          Accept: "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          text:text
        })
      }
    );

    const data = await response.json();

    if(!response.ok || !data.audio_url){
      throw new Error(data.error || "No audio URL returned");
    }

    const audio = new Audio(data.audio_url);

    audioRef.current = audio;

    audio.onended=()=>{
      setSpeaking(false);
      if (typeof onEnded === "function") {
        onEnded();
      }
    };

    audio.onerror=()=>{
      setSpeaking(false);
      if (autoPlayRef.current) {
        autoPlayRef.current = false;
        setAutoPlay(false);
      }
      alert("Cartoon voice audio could not be played.");
    };

    await audio.play();

  } catch(error){

    console.error(error);

    setSpeaking(false);

    alert(error.message || "Cartoon voice error");
  }
};

const pickBrowserVoice = (voices, type) => {
  const byName = (name) =>
    voices.find((voice) => voice.name.toLowerCase().includes(name.toLowerCase()));

  if (type === "male") {
    return (
      byName("Adam Multilingual") ||
      byName("Adam Dragon HD Latest") ||
      byName("Adam") ||
      byName("Google UK English Male") ||
      byName("Microsoft David") ||
      voices.find((voice) => voice.name.toLowerCase().includes("male"))
    );
  }

  if (type === "female") {
    return (
      byName("Ava") ||
      byName("Microsoft Ava") ||
      byName("Google US English") ||
      byName("Microsoft Zira") ||
      voices.find((voice) => voice.name.toLowerCase().includes("female"))
    );
  }

  return null;
};

const speakCurrentPage = async () => {
  const textToSpeak = `${currentStory.title}. ${currentStory.content}`;

  if (speaking) {
    stopSpeaking();
    return;
  }

  // 🔥 CARTOON FIRST (IMPORTANT)
  if (selectedVoiceType === "cartoon") {
    playCartoonVoice(textToSpeak);
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
  const preferredVoice = pickBrowserVoice(voices, selectedVoiceType);

  if (preferredVoice) utterance.voice = preferredVoice;

  utterance.rate = 0.9;
  utterance.pitch = 1.5;
  utterance.volume = 1;

  utterance.onstart = () => setSpeaking(true);
  utterance.onend = () => setSpeaking(false);
  utterance.onerror = () => setSpeaking(false);

  window.speechSynthesis.speak(utterance);
};

const autoPlayStory = () => {
  if (selectedVoiceType !== "cartoon" && !("speechSynthesis" in window)) {
    alert("Your browser does not support text-to-speech.");
    return;
  }

  if (selectedVoiceType === "cartoon" && !canUseCartoonVoice) {
    alert("Cartoon voice is available for Premium or Unlimited plans only.");
    return;
  }

  if (autoPlayRef.current) {
    autoPlayRef.current = false;
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setAutoPlay(false);
    setSpeaking(false);
    return;
  }

  autoPlayRef.current = true;
  setAutoPlay(true);
  playPage(currentPage);
};

const playPage = (pageIndex) => {
  if (!autoPlayRef.current) return;

  if (pageIndex >= pagesData.length) {
    autoPlayRef.current = false;
    setAutoPlay(false);
    setSpeaking(false);
    alert("🎉 Story finished!");
    return;
  }

  const page = pagesData[pageIndex];
  const textToSpeak = `${page.title}. ${page.content}`;

if(selectedVoiceType==="cartoon"){
   setCurrentPage(pageIndex);
   playCartoonVoice(textToSpeak, () => {
    if (!autoPlayRef.current) return;

    saveProgress(pageIndex);

    const nextPageIndex = pageIndex + 1;

    if (nextPageIndex < pagesData.length) {
      setTimeout(() => {
        if (!autoPlayRef.current) return;

        setCurrentPage(nextPageIndex);
        playPage(nextPageIndex);
      }, 700);
    } else {
      autoPlayRef.current = false;
      setAutoPlay(false);
      setSpeaking(false);
      saveProgress(pageIndex);
      alert("ðŸŽ‰ Story finished!");
    }
   });
   return;
}

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(textToSpeak);
  const voices = window.speechSynthesis.getVoices();
  const preferredVoice = pickBrowserVoice(voices, selectedVoiceType);

  if (preferredVoice) utterance.voice = preferredVoice;

  utterance.rate = selectedVoiceType === "cartoon" ? 0.82 : 0.9;
  utterance.pitch = selectedVoiceType === "cartoon" ? 1.6 : 1;
  utterance.volume = 1;

  utterance.onstart = () => {
    setSpeaking(true);
    setCurrentPage(pageIndex);
  };

  utterance.onend = () => {
    if (!autoPlayRef.current) return;

    setSpeaking(false);
    saveProgress(pageIndex);

    const nextPageIndex = pageIndex + 1;

    if (nextPageIndex < pagesData.length) {
      setTimeout(() => {
        if (!autoPlayRef.current) return;

        setCurrentPage(nextPageIndex);
        playPage(nextPageIndex);
      }, 700);
    } else {
      autoPlayRef.current = false;
      setAutoPlay(false);
      setSpeaking(false);
      saveProgress(pageIndex);
      alert("🎉 Story finished!");
    }
  };

  utterance.onerror = () => {
    autoPlayRef.current = false;
    setAutoPlay(false);
    setSpeaking(false);
  };

  window.speechSynthesis.speak(utterance);
};

 const downloadPDF = async () => {
  try {
    setDownloadLoading(true);

    const pdf = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4",
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    const sanitizeText = (text = "") => {
      return text
        .replace(/[^\u0000-\u007F]/g, "")
        .replace(/\s+/g, " ")
        .trim();
    };

    const loadImage = (src) =>
      new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
      });

    const themes = [
      {
        pageBg: [252, 244, 248],
        blob1: [245, 232, 250],
        blob2: [255, 239, 213],
        blob3: [232, 244, 255],
        cardBorder: [236, 220, 241],
        badge: [224, 196, 238],
        badgeText: [88, 58, 108],
        pageBadge: [241, 228, 245],
        pageBadgeText: [106, 82, 128],
        sky: [246, 239, 255],
        titleBanner: [255, 242, 204],
        titleBannerBorder: [245, 214, 160],
        titleText: [92, 52, 120],
        divider: [226, 204, 236],
        textBoxBg: [252, 248, 255],
        textBoxBorder: [220, 201, 232],
        footerBg: [244, 235, 248],
        footerText: [130, 102, 150],
      },
      {
        pageBg: [242, 248, 255],
        blob1: [223, 240, 255],
        blob2: [255, 242, 214],
        blob3: [237, 230, 255],
        cardBorder: [210, 226, 243],
        badge: [188, 222, 255],
        badgeText: [53, 86, 126],
        pageBadge: [226, 240, 252],
        pageBadgeText: [69, 97, 136],
        sky: [237, 246, 255],
        titleBanner: [255, 234, 214],
        titleBannerBorder: [242, 195, 154],
        titleText: [70, 77, 134],
        divider: [200, 220, 240],
        textBoxBg: [248, 252, 255],
        textBoxBorder: [206, 224, 242],
        footerBg: [231, 242, 252],
        footerText: [94, 116, 145],
      },
      {
        pageBg: [248, 245, 255],
        blob1: [235, 228, 255],
        blob2: [255, 239, 221],
        blob3: [231, 248, 238],
        cardBorder: [224, 215, 241],
        badge: [214, 198, 248],
        badgeText: [86, 63, 126],
        pageBadge: [239, 232, 248],
        pageBadgeText: [103, 84, 132],
        sky: [245, 240, 255],
        titleBanner: [255, 244, 200],
        titleBannerBorder: [236, 213, 142],
        titleText: [98, 64, 132],
        divider: [221, 208, 239],
        textBoxBg: [251, 248, 255],
        textBoxBorder: [220, 208, 236],
        footerBg: [239, 232, 248],
        footerText: [121, 98, 148],
      },
    ];

    const drawCircle = (x, y, r, color) => {
      pdf.setFillColor(...color);
      pdf.circle(x, y, r, "F");
    };

    const drawCloud = (x, y, scale = 1, color = [255, 255, 255]) => {
      pdf.setFillColor(...color);
      pdf.circle(x, y, 4 * scale, "F");
      pdf.circle(x + 5 * scale, y - 2 * scale, 5 * scale, "F");
      pdf.circle(x + 10 * scale, y, 4.5 * scale, "F");
      pdf.roundedRect(x - 2 * scale, y, 14 * scale, 5 * scale, 2, 2, "F");
    };

    const drawStars = () => {
      const dots = [
        [18, 16, 1.1, [255, 214, 102]],
        [28, 23, 0.8, [255, 193, 204]],
        [190, 20, 1.0, [255, 214, 102]],
        [197, 28, 0.8, [196, 181, 253]],
        [22, 276, 1.0, [255, 193, 204]],
        [188, 274, 1.0, [255, 214, 102]],
      ];

      dots.forEach(([x, y, r, c]) => drawCircle(x, y, r, c));
    };

    const drawPageDecorations = (theme) => {
      pdf.setFillColor(...theme.pageBg);
      pdf.rect(0, 0, pageWidth, pageHeight, "F");

      pdf.setFillColor(...theme.blob1);
      pdf.circle(26, 24, 19, "F");

      pdf.setFillColor(...theme.blob2);
      pdf.circle(190, 34, 16, "F");

      pdf.setFillColor(...theme.blob3);
      pdf.circle(182, 255, 20, "F");

      drawStars();
      drawCloud(24, 36, 0.7, [255, 255, 255]);
      drawCloud(168, 30, 0.6, [255, 255, 255]);
    };

    const drawStoryPage = async ({
      page,
      index,
      pageNumberLabel,
      showContinuation = false,
      contentOverride = null,
    }) => {
      const theme = themes[index % themes.length];
      const cleanTitle = sanitizeText(page.title || `Chapter ${index + 1}`);
      const cleanContent = sanitizeText(contentOverride ?? page.content ?? "");

      {
        drawPageDecorations(theme);

        const cardX = 10;
        const cardY = 10;
        const cardW = pageWidth - 20;
        const cardH = pageHeight - 20;
        const textX = cardX + 16;
        const textW = 130;
        const imageX = cardX + cardW - 129;
        const imageY = cardY + 20;
        const imageW = 113;
        const imageH = cardH - 40;

        pdf.setFillColor(255, 248, 253);
        pdf.roundedRect(cardX, cardY, cardW, cardH, 12, 12, "F");
        pdf.setDrawColor(...theme.cardBorder);
        pdf.setLineWidth(0.7);
        pdf.roundedRect(cardX, cardY, cardW, cardH, 12, 12, "S");

        pdf.setFillColor(255, 255, 255);
        pdf.roundedRect(imageX - 3, imageY - 3, imageW + 6, imageH + 6, 10, 10, "F");
        pdf.setDrawColor(...theme.textBoxBorder);
        pdf.roundedRect(imageX - 3, imageY - 3, imageW + 6, imageH + 6, 10, 10, "S");

        if (page.image) {
          try {
            const img = await loadImage(page.image);
            let imgW = imageW;
            let imgH = (img.height * imgW) / img.width;

            if (imgH > imageH) {
              imgH = imageH;
              imgW = (img.width * imgH) / img.height;
            }

            const imgX = imageX + (imageW - imgW) / 2;
            const imgY = imageY + (imageH - imgH) / 2;
            pdf.addImage(img, "JPEG", imgX, imgY, imgW, imgH);
          } catch (error) {
            console.error("Image load failed:", error);
          }
        }

        pdf.setFillColor(...theme.badge);
        pdf.roundedRect(textX, cardY + 14, 43, 12, 6, 6, "F");
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(10);
        pdf.setTextColor(...theme.badgeText);
        pdf.text(
          showContinuation ? `Chapter ${index + 1} cont.` : `Chapter ${index + 1}`,
          textX + 5,
          cardY + 21.5
        );

        pdf.setFillColor(...theme.pageBadge);
        pdf.roundedRect(textX + textW - 36, cardY + 14, 36, 12, 6, 6, "F");
        pdf.setDrawColor(...theme.textBoxBorder);
        pdf.roundedRect(textX + textW - 36, cardY + 14, 36, 12, 6, 6, "S");
        pdf.setFontSize(9.5);
        pdf.setTextColor(...theme.pageBadgeText);
        pdf.text(pageNumberLabel, textX + textW - 30, cardY + 21.4);

        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(22);
        pdf.setTextColor(...theme.titleText);
        const titleText = showContinuation ? `${cleanTitle} (continued)` : cleanTitle;
        const titleLines = pdf.splitTextToSize(titleText, textW);
        pdf.text(titleLines.slice(0, 2), textX, cardY + 43);

        const titleBlockHeight = Math.min(titleLines.length, 2) * 9;
        const textBoxX = textX;
        const textBoxY = cardY + 48 + titleBlockHeight;
        const textBoxW = textW;
        const textBoxH = cardY + cardH - textBoxY - 25;
        const horizontalPadding = 8;
        const topPadding = 12;
        const lineHeight = 7.2;

        pdf.setFillColor(...theme.textBoxBg);
        pdf.setDrawColor(...theme.textBoxBorder);
        pdf.setLineWidth(0.6);
        pdf.roundedRect(textBoxX, textBoxY, textBoxW, textBoxH, 9, 9, "FD");

        drawCircle(textBoxX + 8, textBoxY + 8, 1.4, [255, 196, 196]);
        drawCircle(textBoxX + 13, textBoxY + 8, 1.4, [255, 223, 128]);
        drawCircle(textBoxX + 18, textBoxY + 8, 1.4, [196, 181, 253]);

        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(12.5);
        pdf.setTextColor(60, 48, 95);
        pdf.setLineHeightFactor(1.55);

        const wrappedText = pdf.splitTextToSize(cleanContent, textBoxW - horizontalPadding * 2);
        const maxLines = Math.floor((textBoxH - topPadding - 8) / lineHeight);
        const firstChunk = wrappedText.slice(0, maxLines);
        const remainingChunk = wrappedText.slice(maxLines);

        pdf.text(firstChunk, textBoxX + horizontalPadding, textBoxY + topPadding);

        pdf.setFillColor(...theme.footerBg);
        pdf.roundedRect(textX + 15, cardY + cardH - 16, textW - 30, 8, 4, 4, "F");
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(8.5);
        pdf.setTextColor(...theme.footerText);
        pdf.text("TaleBot AI storybook reader", textX + textW / 2, cardY + cardH - 10.8, {
          align: "center",
        });

        return remainingChunk;
      }

      drawPageDecorations(theme);

      const cardX = 10;
      const cardY = 12;
      const cardW = pageWidth - 20;
      const cardH = pageHeight - 24;

      pdf.setFillColor(255, 255, 255);
      pdf.roundedRect(cardX, cardY, cardW, cardH, 10, 10, "F");

      pdf.setDrawColor(...theme.cardBorder);
      pdf.setLineWidth(0.6);
      pdf.roundedRect(cardX, cardY, cardW, cardH, 10, 10, "S");

      pdf.setFillColor(...theme.badge);
      pdf.roundedRect(cardX + 6, cardY + 7, 40, 12, 5, 5, "F");
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(12);
      pdf.setTextColor(...theme.badgeText);
      pdf.text(
        showContinuation ? `Chapter ${index + 1} - Continue` : `Chapter ${index + 1}`,
        cardX + 8,
        cardY + 14.8
      );

      pdf.setFillColor(...theme.pageBadge);
      pdf.roundedRect(cardX + cardW - 34, cardY + 7, 28, 12, 5, 5, "F");
      pdf.setFontSize(11);
      pdf.setTextColor(...theme.pageBadgeText);
      pdf.text(pageNumberLabel, cardX + cardW - 28.5, cardY + 14.8);

      let currentY = cardY + 24;

      if (!showContinuation) {
        pdf.setFillColor(...theme.sky);
        pdf.roundedRect(cardX + 8, currentY, cardW - 16, 96, 8, 8, "F");

        drawCloud(cardX + 26, currentY + 14, 0.65, [255, 255, 255]);
        drawCloud(cardX + cardW - 48, currentY + 18, 0.55, [255, 255, 255]);

        if (page.image) {
          try {
            const img = await loadImage(page.image);

            const frameX = cardX + 22;
            const frameY = currentY + 6;
            const frameW = cardW - 44;
            const frameH = 84;

            pdf.setFillColor(242, 236, 247);
            pdf.roundedRect(frameX + 1.8, frameY + 1.8, frameW, frameH, 5, 5, "F");

            pdf.setFillColor(255, 255, 255);
            pdf.roundedRect(frameX, frameY, frameW, frameH, 5, 5, "F");
            pdf.setDrawColor(...theme.cardBorder);
            pdf.setLineWidth(0.8);
            pdf.roundedRect(frameX, frameY, frameW, frameH, 5, 5, "S");

            let imgW = frameW - 6;
            let imgH = (img.height * imgW) / img.width;

            if (imgH > frameH - 6) {
              imgH = frameH - 6;
              imgW = (img.width * imgH) / img.height;
            }

            const imgX = frameX + (frameW - imgW) / 2;
            const imgY = frameY + (frameH - imgH) / 2;

            pdf.addImage(img, "JPEG", imgX, imgY, imgW, imgH);
          } catch (error) {
            console.error("Image load failed:", error);
          }
        }

        currentY += 104;
      }

      const titleBannerX = cardX + 16;
      const titleBannerY = currentY;
      const titleBannerW = cardW - 32;
      const titleBannerH = showContinuation ? 16 : 18;

      pdf.setFillColor(...theme.titleBanner);
      pdf.roundedRect(titleBannerX, titleBannerY, titleBannerW, titleBannerH, 6, 6, "F");
      pdf.setDrawColor(...theme.titleBannerBorder);
      pdf.roundedRect(titleBannerX, titleBannerY, titleBannerW, titleBannerH, 6, 6, "S");

      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(showContinuation ? 16 : 20);
      pdf.setTextColor(...theme.titleText);

      const titleText = showContinuation ? `${cleanTitle} (continued)` : cleanTitle;
      const centeredTitle = pdf.splitTextToSize(titleText, titleBannerW - 12);
      pdf.text(centeredTitle, pageWidth / 2, titleBannerY + (showContinuation ? 10.5 : 11.8), {
        align: "center",
      });

      currentY += showContinuation ? 22 : 26;

      pdf.setDrawColor(...theme.divider);
      pdf.setLineWidth(0.7);
      pdf.line(cardX + 14, currentY, cardX + cardW - 14, currentY);
      currentY += 8;

      // ===== صندوق النص المعدل =====
      const textBoxX = cardX + 10;
      const textBoxY = currentY;
      const textBoxW = cardW - 20;

      const horizontalPadding = 5;
      const topPadding = 16;
      const bottomPadding = 10;
      const lineHeight = 7;

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(13);
      pdf.setTextColor(78, 78, 78);
      pdf.setCharSpace(0);

      const usableTextWidth = textBoxW - (horizontalPadding * 2);
      const wrappedText = pdf.splitTextToSize(cleanContent, usableTextWidth);

      const maxTextHeight = showContinuation ? 165 : 82;
      const maxLines = Math.floor((maxTextHeight - topPadding - bottomPadding) / lineHeight);

      const firstChunk = wrappedText.slice(0, maxLines);
      const remainingChunk = wrappedText.slice(maxLines);

      const actualTextHeight = Math.max(
        64,
        topPadding + bottomPadding + (firstChunk.length * lineHeight)
      );

      const textBoxH = Math.min(maxTextHeight, actualTextHeight);

      pdf.setFillColor(...theme.textBoxBg);
      pdf.setDrawColor(...theme.textBoxBorder);
      pdf.roundedRect(textBoxX, textBoxY, textBoxW, textBoxH, 8, 8, "FD");

      drawCircle(textBoxX + 8, textBoxY + 8, 1.4, [255, 196, 196]);
      drawCircle(textBoxX + 13, textBoxY + 8, 1.4, [255, 223, 128]);
      drawCircle(textBoxX + 18, textBoxY + 8, 1.4, [196, 181, 253]);

      pdf.text(firstChunk, textBoxX + horizontalPadding, textBoxY + topPadding);

      pdf.setFillColor(...theme.footerBg);
      pdf.roundedRect(cardX + 45, pageHeight - 23, cardW - 90, 9, 4, 4, "F");

      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(9.2);
      pdf.setTextColor(...theme.footerText);
      pdf.text("A magical little story for happy readers", pageWidth / 2, pageHeight - 17.2, {
        align: "center",
      });

      return remainingChunk;
    };

    let visualPageCounter = 1;

    for (let i = 0; i < pagesData.length; i++) {
      const page = pagesData[i];

      if (i > 0) pdf.addPage();

      let remaining = await drawStoryPage({
        page,
        index: i,
        pageNumberLabel: `Page ${visualPageCounter}`,
        showContinuation: false,
      });

      visualPageCounter += 1;

      while (remaining.length > 0) {
        pdf.addPage();

        remaining = await drawStoryPage({
          page,
          index: i,
          pageNumberLabel: `Page ${visualPageCounter}`,
          showContinuation: true,
          contentOverride: remaining.join(" "),
        });

        visualPageCounter += 1;
      }
    }

   pdf.save(`${sanitizeText(story?.title || "storybook")}.pdf`);
alert("✅ PDF has been generated successfully!");

} catch (error) {
  console.error("PDF error:", error);
  alert("❌ An error occurred while generating the PDF.");
} finally {
  setDownloadLoading(false);
}
};

  if (!story) return null;

  return (
    <>
      <div className="main-container">
        {isChildReader ? (
          <ChildSidebar child={child} activeItem="stories" />
        ) : (
          <Sidebar activeItem="stories" />
        )}

        <main className="reader-page">
          <div className="reader-shell">
            <div className="reader-breadcrumb">
              <span>{child?.name || "Child"}'s Adventures</span>
              <span className="crumb-separator">›</span>
              <span className="active-crumb">{story.title}</span>
            </div>

            <div className="reader-card">
                {showProgressChoice && savedProgress && (
    <div className="resume-progress-card">
      <div>
        <h3>Welcome back! ✨</h3>

        <p>
          You already started this story.
          You reached {savedProgress.progress_percentage}% and spent about{" "}
          {savedProgress.reading_time_minutes} min reading.
        </p>
      </div>

      <div className="resume-progress-actions">
        <button onClick={continueReading}>
          Continue Reading
        </button>

        <button onClick={startStoryOver}>
          Start Over
        </button>
      </div>
    </div>
  )}
              
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
  {isEditing ? (
    <textarea
      value={editedText}
      onChange={(e) => setEditedText(e.target.value)}
      style={{
        width: "100%",
        minHeight: "140px",
        border: "none",
        outline: "none",
        resize: "vertical",
        fontSize: "15px",
        background: "transparent",
      }}
    />
  ) : (
    <p>{currentStory.content}</p>
  )}
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

                    <button
  className={`control-btn primary ${autoPlay ? "active" : ""}`}
  onClick={autoPlayStory}
>
  <i className="fa-solid fa-play"></i>
  <span>{autoPlay ? "Stop Auto Play" : "Auto Play Story"}</span>
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
  className={`voice-chip ${selectedVoiceType === "cartoon" ? "active" : ""} ${!canUseCartoonVoice ? "locked" : ""}`}
  onClick={() => selectVoiceType("cartoon")}
  disabled={!canUseCartoonVoice}
  title={!canUseCartoonVoice ? "Premium or Unlimited plan required" : "Cartoon voice"}
>
  <i className="fa-solid fa-wand-magic-sparkles"></i> Cartoon
  {!canUseCartoonVoice && <span className="voice-lock">Premium</span>}
</button> 

                  </div>
                </div>

                <div className="control-card">
                  <div className="control-header">
                    <i className="fa-solid fa-star"></i>
                    <h3>Rate this Story</h3>
                  </div>

                 <div className="rating-stars">
                 {[1, 2, 3, 4, 5].map((star) => (
                  <i
                   key={star}
                   className="fa-solid fa-star"
                   onClick={() => saveRating(star)}
                   style={{ cursor: "pointer" }}
                   ></i>
                   ))}
                 </div>
                </div>

                <div className="control-card">
                  <div className="control-header">
                    <i className="fa-solid fa-chart-simple"></i>
                    <h3>Parent's Insights</h3>
                  </div>

                  <div className="insight-time">
                    <span className="time-number">{Math.ceil(readingSeconds / 60)}</span>
                    <span className="time-unit">min</span>
                  </div>

                  <div className="progress-bar">
<div
  className="progress-fill"
  style={{
    width: `${progressPercentage}%`
  }}
></div>       
           </div>

                  <div className="progress-labels">
                    <span>
  {progressPercentage}% completed
</span>

<span>
  {currentPage + 1}/{pagesData.length} pages
</span>
                  </div>
                </div>

                <div className="control-card">
                  <div className="control-header">
                    <i className="fa-regular fa-pen-to-square"></i>
                    <h3>Editor &amp; Feedback</h3>
                  </div>

                  <div className="control-buttons vertical">
             <button
  className="control-btn outline"
  onClick={() => {
    if (isEditing) {
      saveEditedText();
    } else {
      setEditedText(currentStory.content);
      setIsEditing(true);
    }
  }}
>
  <i className="fa-regular fa-pen-to-square"></i>
  {isEditing ? " Save Text" : " Quick Edit"}
</button>

                    <button className="control-btn outline" onClick={toggleFavorite}>
  <i
    className={isFavorite ? "fa-solid fa-heart" : "fa-regular fa-heart"}
    style={{ color: isFavorite ? "red" : undefined }}
  ></i>
  {isFavorite ? " In Favorites" : " Add to Favorites"}
</button>
                  </div>
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
            <div className="fullscreen-progress-fill" style={{ width: `${progressPercentage}%` }}></div>
          </div>
          <span className="fullscreen-progress-text">
            Page {progressPercentage}% complete
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
