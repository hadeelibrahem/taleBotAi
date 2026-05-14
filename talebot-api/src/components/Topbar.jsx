import { useState } from "react";
import "../styles/Topbar.css";

function Topbar() {
  const [showSearch, setShowSearch] = useState(false);

  return (
    <div className="topbar">
      <div className={`search-box ${showSearch ? "active" : ""}`}>
        <button
          className="search-btn"
          onClick={() => setShowSearch(!showSearch)}
        >
          🔍
        </button>

        <input
          type="text"
          placeholder="Search stories..."
          className="search-input"
        />
      </div>

      <button className="bell-btn">
        <span className="bell-icon">🔔</span>
        <span className="notif-dot"></span>
      </button>
    </div>
  );
}

export default Topbar;