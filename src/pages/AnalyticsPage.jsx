import React, { useEffect, useRef, useState } from "react";
import "../styles/AnalyticsPage.css";
import Sidebar from "../components/Sidebar";


function useCountUp(target, duration = 1400, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    const numeric = parseFloat(String(target).replace(/[^0-9.]/g, ""));
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
  const strVal = String(item.value);
  const numericPart = strVal.replace(/[^0-9.]/g, "");
  const suffix = strVal.replace(/[0-9.]/g, "");
  const count = useCountUp(strVal, 1400, inView);
  const displayValue = isNaN(parseFloat(numericPart)) ? strVal : `${count}${suffix}`;

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


function AnimatedChart({ weeklyData = [0, 0, 0, 0] }) {
  const polyRef = useRef(null);
  const [ref, inView] = useInView(0.2);
  const [drawn, setDrawn] = useState(false);


  const maxVal = Math.max(...weeklyData, 1);
  const xs = [20, 200, 400, 580];
  const dots = weeklyData.map((v, i) => [
    xs[i],
    200 - Math.round((v / maxVal) * 160), 
  ]);
  const pointsStr = dots.map(([x, y]) => `${x},${y}`).join(" ");
  const areaPath =
    `M${pointsStr.replace(/ /g, " ")} ` +
    `L${dots[dots.length - 1][0]},220 L${dots[0][0]},220 Z`;

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
    el.style.transition = drawn
      ? "stroke-dashoffset 1.8s cubic-bezier(0.4,0,0.2,1)"
      : "none";
  }, [drawn, pointsStr]);

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
          d={areaPath}
          style={{ opacity: drawn ? 1 : 0, transition: "opacity 1.2s ease 0.6s" }}
        />
        {[55, 100, 145, 190].map((y) => (
          <line key={y} x1="20" y1={y} x2="580" y2={y}
            stroke="#f0edf4" strokeWidth="1" strokeDasharray="4 4" />
        ))}
        <polyline
          ref={polyRef}
          fill="none"
          stroke="url(#lg)"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={pointsStr}
        />
        {dots.map(([cx, cy], i) => (
          <circle key={i} cx={cx} cy={cy} r="5"
            fill="#fff" stroke="#9b7cf6" strokeWidth="2.5"
            style={{
              opacity: drawn ? 1 : 0,
              transition: `opacity 0.3s ease ${0.6 + i * 0.2}s`,
            }}
          />
        ))}
      </svg>
    </div>
  );
}



export default function AnalyticsPage() {
  const [cardRef, cardInView]       = useInView(0.05);
  const [titleRef, titleInView]     = useInView(0.1);
  const [middleRef, middleInView]   = useInView(0.1);
  const [storiesRef, storiesInView] = useInView(0.1);

  const [children, setChildren]     = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [analytics, setAnalytics]   = useState(null);
  const [loading, setLoading]       = useState(false);

  const API   = "http://127.0.0.1:8000";
  const token = localStorage.getItem("token");


  useEffect(() => {
    fetch(`${API}/api/analytics/children`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        setChildren(data);
        if (data.length > 0) setSelectedChild(data[0].id);
      })
      .catch(console.error);
  }, []);


  useEffect(() => {
    if (!selectedChild) return;

    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const r = await fetch(`${API}/api/analytics/${selectedChild}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await r.json();
        setAnalytics(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [selectedChild]);

 
  const stats = analytics
    ? [
        { title: "Stories Created",    value: String(analytics.stats.stories_count), sub: "This month",     icon: "📖" },
        { title: "Total Reading Time", value: analytics.stats.reading_time,          sub: "Last 30 days",   icon: "⏱️" },
        { title: "Most Popular Genre", value: analytics.stats.top_genre,             sub: "Top category",   icon: "✨" },
        { title: "Avg Progress",       value: analytics.stats.avg_progress,          sub: "Completion rate",icon: "👥" },
      ]
    : [];

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
              <img src="/imags/logo.jpg" alt="TaleBot AI" className="brand-logo" />
              <span>TaleBot AI</span>
            </div>

       
            <select
              className="filter-chip"
              value={selectedChild || ""}
              onChange={(e) => setSelectedChild(Number(e.target.value))}
            >
              {children.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>


          <h1
            ref={titleRef}
            className={`analytics-title scroll-reveal ${titleInView ? "in-view" : ""}`}
            style={{ transitionDelay: "0.1s" }}
          >
            Analytics & Insights
          </h1>

 
          {loading ? (
            <div className="metrics-grid">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="metric-card skeleton" />
              ))}
            </div>
          ) : (
            <div className="metrics-grid">
              {stats.map((item, i) => (
                <MetricCard key={i} item={item} index={i} />
              ))}
            </div>
          )}

   
          <div
            ref={middleRef}
            className={`middle-grid scroll-reveal ${middleInView ? "in-view" : ""}`}
            style={{ transitionDelay: "0.05s" }}
          >
            <div className="trend-card">
              <h2>Activity Trend</h2>
              <AnimatedChart weeklyData={analytics?.weekly_activity ?? [0, 0, 0, 0]} />
              <div className="chart-labels">
                {["Week 1", "Week 2", "Week 3", "Week 4"].map((l) => (
                  <span key={l}>{l}</span>
                ))}
              </div>
            </div>

            <div className="insights-card">
              <h2>Parental Insights</h2>
              {analytics?.insight ? (
                <>
                  <p>
                    Popular theme: <strong>{analytics.insight.popular_theme}</strong>.
                    Suggested moral: {analytics.insight.suggested_moral}.
                  </p>
                  <div className="insight-badge">
                    ⭐ Avg rating: {analytics.insight.avg_rating} &nbsp;|&nbsp;
                    📊 {analytics.insight.completion_rate}% completion
                  </div>
                </>
              ) : (
                <p>
                  {analytics?.child?.name ?? "Your child"} has been actively exploring{" "}
                  {analytics?.stats?.top_genre ?? "stories"} this month.
                  Reading time is improving steadily.
                </p>
              )}
         
            </div>
          </div>

       
          <div
            ref={storiesRef}
            className={`stories-section scroll-reveal ${storiesInView ? "in-view" : ""}`}
            style={{ transitionDelay: "0.05s" }}
          />
        </div>
      </div>
    </div>
  );
}