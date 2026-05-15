import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ChildSidebar from "../components/ChildSidebar";
import Topbar from "../components/Topbar";
import HeroCard from "../components/HeroCard";
import StatCard from "../components/StatCard";
import TopStories from "../components/TopStories";
import RecentActivity from "../components/RecentActivity";
import AiInsights from "../components/AiInsights";
import "../styles/Dashboard.css";

export default function ChildDashboard() {
  const navigate = useNavigate();

  const [child] = useState(() => {
    const stored = localStorage.getItem("childUser");
    return stored ? JSON.parse(stored) : null;
  });

  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!child?.id) {
      navigate("/settings");
      return;
    }

    fetch(`http://127.0.0.1:8000/api/children/${child.id}/dashboard`)
      .then((res) => res.json())
      .then((json) => {
        setDashboardData(json.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Child dashboard error:", err);
        setLoading(false);
      });
  }, [child?.id, navigate]);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="dashboard-layout">
      <ChildSidebar child={child} />

      <main className="dashboard-main">
        <Topbar
          stories={dashboardData?.continue_reading || []}
          notifications={dashboardData?.notifications || []}
        />

        <section className="dashboard-top-section">
          <HeroCard data={dashboardData?.hero_section} isChildDashboard={true} />

          <div className="stats-column">
            <StatCard
              title={dashboardData?.stats?.stories_created ?? 0}
              subtitle="Stories Created"
              icon="📚"
              color="#d0f0c0"
            />
            <StatCard
              title={`${dashboardData?.stats?.reading_time_minutes ?? 0} min`}
              subtitle="Reading Time"
              icon="⏰"
              color="#d6eaff"
            />
            <StatCard
              title={dashboardData?.stats?.favorite_genre ?? "Adventure"}
              subtitle="Favorite Genre"
              icon="🏰"
              color="#ffe0f0"
            />
          </div>
        </section>

        <section className="stories-section">
          <div className="section-header">
            <div>
              <h2>{child?.name}'s Stories</h2>
              <p>Continue reading your stories</p>
            </div>
          </div>

          <TopStories stories={dashboardData?.continue_reading || []} />

          <div className="bottom-grid">
            <AiInsights data={dashboardData?.insights} stats={dashboardData?.stats} />   
            
            <RecentActivity data={dashboardData?.recent_activities || []} />

          </div>
        </section>
      </main>
    </div>
  );
}