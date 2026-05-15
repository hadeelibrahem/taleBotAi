import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import HeroCard from "../components/HeroCard";
import StatCard from "../components/StatCard";
import TopStories from "../components/TopStories";
import AiInsights from "../components/AiInsights";
import RecentActivity from "../components/RecentActivity";
import "../styles/Dashboard.css";
import { FiArrowDown } from "react-icons/fi";
import castleImg from "../assets/hero.png";
import moonImg from "../assets/hero.png";
import rainbowImg from "../assets/hero.png";

export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/dashboard", {
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
    Accept: "application/json",
  },
})
      .then((res) => res.json())
      .then((json) => {
        setDashboardData(json.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching dashboard:", err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="dashboard-main">
       <Topbar
  stories={dashboardData?.continue_reading || []}
  notifications={dashboardData?.notifications || []}
/>

        <section className="dashboard-top-section">
          <HeroCard data={dashboardData?.hero_section} />

          <div className="stats-column">
            <StatCard
              title={dashboardData?.stats?.stories_created}
              subtitle="Stories Created"
              icon="📚"
              color="#d0f0c0"
            />
            <StatCard
              title={`${dashboardData?.stats?.reading_time_minutes} min`}
              subtitle="Reading Time"
              icon="⏰"
              color="#d6eaff"
            />
            <StatCard
              title={dashboardData?.stats?.favorite_genre}
              subtitle="Favorite Genre"
              icon="🏰"
              color="#ffe0f0"
            />
          </div>
        </section>

        <section className="stories-section">
          <div className="section-header">
            <div>
              <h2>Continue Reading</h2>
              <p>Pick up where you left off</p>
            </div>
          
          </div>

          <TopStories
            stories={dashboardData?.continue_reading}
            castleImg={castleImg}
            moonImg={moonImg}
            rainbowImg={rainbowImg}
          />

          <div className="bottom-grid">
<AiInsights data={dashboardData?.insights} stats={dashboardData?.stats} />            

<RecentActivity data={dashboardData?.recent_activities} />
          </div>
        </section>
      </main>
    </div>
  );
}