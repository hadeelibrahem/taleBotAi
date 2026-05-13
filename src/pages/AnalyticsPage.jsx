import React, { useEffect, useRef, useState } from "react";
import "../styles/AnalyticsPage.css";
import Sidebar from "../components/Sidebar";

const stats = [
  { title: "Stories Created", value: "56", sub: "This month", icon: "📖" },
  { title: "Total Reading Time", value: "15h 30m", sub: "Last 30 days", icon: "⏱️" },
  { title: "Most Popular Genre", value: "Fantasy", sub: "Top category", icon: "✨" },
  { title: "Active Readers", value: "27%", sub: "Engagement rate", icon: "👥" },
];

const topStories = [
  { id: 1, title: "The Dragon Prince", img: "/images/story1.jpg" },
  { id: 2, title: "The Dragon's Picnic", img: "/images/story2.jpg" },
  { id: 3, title: "The Mysterious Woods", img: "/images/story3.jpg" },
  { id: 4, title: "Mia and Moonlight", img: "/images/story4.jpg" },
  { id: 5, title: "Mia and Her Friends", img: "/images/story5.jpg" },
];
 

function useCountUp(target, duration = 1400, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    const numeric = parseFloat(target.replace(/[^0-9.]/g, ""));
    if (isNaN(numeric)) return;
    let startTime = null;
    const step = (ts) => {
      if (!startTime) startTime = ts;
      const p = Math.min((ts - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setCount(Math.floor(eased * numeric));
      if (p < 1) requestAnimationFrame(step);
      else setCount(numeric);
    };
    requestAnimationFrame(step);
  }, [start, target, duration]);
  return count;
}

function useInView(threshold = 0.15) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) { setInView(true); obs.disconnect(); }
      },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, inView];
}

function MetricCard({ item, index }) {
  const [ref, inView] = useInView(0.2);
  const numericPart = item.value.replace(/[^0-9.]/g, "");
  const suffix = item.value.replace(/[0-9.]/g, "");
  const count = useCountUp(item.value, 1400, inView);
  const displayValue = isNaN(parseFloat(numericPart)) ? item.value : `${count}${suffix}`;

  return (
    <div
      ref={ref}
      className={`metric-card scroll-reveal ${inView ? "in-view" : ""}`}
      style={{ transitionDelay: `${index * 0.1}s` }}
    >
      <div className="metric-icon">{item.icon}</div>
      <p className="metric-label">{item.title}</p>
      <h3 className="metric-number">{displayValue}</h3>
      <span className="metric-sub">{item.sub}</span>
    </div>
  );
}


function AnimatedChart() {
  const polyRef = useRef(null);
  const [ref, inView] = useInView(0.2);
  const [drawn, setDrawn] = useState(false);

  useEffect(() => {
    if (inView) {
      const t = setTimeout(() => setDrawn(true), 200);
      return () => clearTimeout(t);
    }
  }, [inView]);

  useEffect(() => {
    const el = polyRef.current;
    if (!el) return;
    const len = 800;
    el.style.strokeDasharray = len;
    el.style.strokeDashoffset = drawn ? 0 : len;
    el.style.transition = drawn ? "stroke-dashoffset 1.8s cubic-bezier(0.4,0,0.2,1)" : "none";
  }, [drawn]);

  const dots = [[20,180],[90,170],[160,145],[230,130],[300,95],[370,155],[440,138],[510,90],[580,55]];

  return (
    <div ref={ref}>
      <svg viewBox="0 0 600 220" className="trend-svg">
        <defs>
          <linearGradient id="lg" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#9b7cf6" />
            <stop offset="100%" stopColor="#e879a0" />
          </linearGradient>
          <linearGradient id="ag" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#9b7cf6" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#9b7cf6" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          fill="url(#ag)"
          d="M20,180 90,170 160,145 230,130 300,95 370,155 440,138 510,90 580,55 L580,220 L20,220 Z"
          style={{ opacity: drawn ? 1 : 0, transition: "opacity 1.2s ease 0.6s" }}
        />
        {[55,100,145,190].map(y => (
          <line key={y} x1="20" y1={y} x2="580" y2={y} stroke="#f0edf4" strokeWidth="1" strokeDasharray="4 4" />
        ))}
        <polyline
          ref={polyRef}
          fill="none"
          stroke="url(#lg)"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          points="20,180 90,170 160,145 230,130 300,95 370,155 440,138 510,90 580,55"
        />
        {dots.map(([cx, cy], i) => (
          <circle
            key={i} cx={cx} cy={cy} r="5"
            fill="#fff" stroke="#9b7cf6" strokeWidth="2.5"
            style={{ opacity: drawn ? 1 : 0, transition: `opacity 0.3s ease ${0.6 + i * 0.12}s` }}
          />
        ))}
      </svg>
    </div>
  );
}

function StoryCard({ story, index }) {
  const [ref, inView] = useInView(0.15);
  return (
    <div
      ref={ref}
      className={`story-card scroll-reveal ${inView ? "in-view" : ""}`}
      style={{ transitionDelay: `${index * 0.09}s` }}
    >
      <div className="story-img-wrap">
        <img src={story.img} alt={story.title} className="story-img" />
        <div className="story-overlay">
          <span className="story-read-btn">Read</span>
        </div>
      </div>
      <p className="story-title">{story.title}</p>
    </div>
  );
}


export default function AnalyticsPage() {
  const [cardRef, cardInView]     = useInView(0.05);
  const [titleRef, titleInView]   = useInView(0.1);
  const [middleRef, middleInView] = useInView(0.1);
  const [storiesRef, storiesInView] = useInView(0.1);

  return (
    <div className="analytics-layout">
      <Sidebar />

      <div className="analytics-page">
        <div
          ref={cardRef}
          className={`analytics-card scroll-reveal ${cardInView ? "in-view" : ""}`}
        >
     
          <div className="analytics-header">
            <div className="brand">
              <img src="/imags/logo.jpg"
              alt="TaleBot AI" 
              className="brand-logo" />
              <span>TaleBot AI</span>
            </div>
            <div className="filter-chip">Last 30 Days </div>
          </div>

          <h1
            ref={titleRef}
            className={`analytics-title scroll-reveal ${titleInView ? "in-view" : ""}`}
            style={{ transitionDelay: "0.1s" }}
          >
            Analytics & Insights
          </h1>

          <div className="metrics-grid">
            {stats.map((item, i) => <MetricCard key={i} item={item} index={i} />)}
          </div>

        
          <div
            ref={middleRef}
            className={`middle-grid scroll-reveal ${middleInView ? "in-view" : ""}`}
            style={{ transitionDelay: "0.05s" }}
          >
            <div className="trend-card">
              <h2>Activity Trend</h2>
              <AnimatedChart />
              <div className="chart-labels">
                {["Week 1","Week 2","Week 3","Week 4"].map(l => <span key={l}>{l}</span>)}
              </div>
            </div>

            <div className="insights-card">
              <h2>Parental Insights</h2>
              <p>
                Your child has been actively exploring fantasy stories this month.
                Reading time is improving steadily.
              </p>
              <div className="insight-badge">📈 +12% this week</div>
            </div>
          </div>

        
          <div
            ref={storiesRef}
            className={`stories-section scroll-reveal ${storiesInView ? "in-view" : ""}`}
            style={{ transitionDelay: "0.05s" }}
          >
            <h2>Top Stories</h2>
            <div className="stories-row">
              {topStories.map((story, i) => (
                <StoryCard key={story.id} story={story} index={i} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}