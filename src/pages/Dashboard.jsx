
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import HeroCard from "../components/HeroCard";
import StatCard from "../components/StatCard";

import "../styles/Dashboard.css";
import { FiArrowDown } from "react-icons/fi";
import castleImg from "../assets/hero.png";
import moonImg from "../assets/hero.png";
import rainbowImg from "../assets/hero.png";
import TopStories from "../components/TopStories";
import AiInsights from "../components/AiInsights";
import RecentActivity from "../components/RecentActivity";
export default function Dashboard() {
  

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <main className="dashboard-main">
        <Topbar />

        <section className="dashboard-top-section">
          <HeroCard />

          <div className="stats-column">
            <StatCard
              title="12"
              subtitle="Stories Created"
              icon="📚"
              badge="+3"
              color="#d0f0c0"
            />
            <StatCard
              title="48 min"
              subtitle="Reading Time"
              icon="⏰"
              badge="+12 min"
              color="#d6eaff"
            />
            <StatCard
              title="Fantasy"
              subtitle="Favorite Genre"
              icon="🏰"
              badge="Top"
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

    <span className="view-all">
     View all <FiArrowDown className="arrow-down" />
          </span>

  </div>
  
<TopStories
  castleImg={castleImg}
  moonImg={moonImg}
  rainbowImg={rainbowImg}
/>

<div className="bottom-grid">
  <AiInsights />
  <RecentActivity />
</div>

</section>
 

      </main>
    </div>
  );
}