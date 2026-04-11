import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";

export default function Sidebar() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="lg:hidden flex items-center justify-between px-4 py-3 sidebar-soft border-b border-white/60">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl overflow-hidden shadow-lg border-2 border-white/60">
            <img
              src="/imags/logo.jpg"
              alt="TaleBot AI"
              className="w-full h-full object-cover"
            />
          </div>
          <span className="text-lg font-extrabold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
            TaleBot AI
          </span>
        </div>

        <button
          onClick={() => setOpen(!open)}
          className="bg-white/70 px-3 py-2 rounded-xl shadow text-xl"
        >
          {open ? "✕" : "☰"}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`
          sidebar-soft
          w-full lg:w-72
          lg:min-h-screen
          flex-col justify-between
          p-5 lg:p-7
          ${open ? "flex" : "hidden"} lg:flex
        `}
      >
        <div>
          {/* Logo Section Desktop */}
          <div className="hidden lg:flex items-center gap-3 mb-12">
            <div className="w-11 h-11 rounded-2xl overflow-hidden shadow-lg border-2 border-white/60">
              <img
                src="/imags/logo.jpg"
                alt="TaleBot AI"
                className="w-full h-full object-cover"
              />
            </div>
            <span className="text-2xl font-extrabold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
              TaleBot AI
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-2">
            <NavLink to="/" className="nav-link" onClick={() => setOpen(false)}>
              <span>📊</span> Dashboard
            </NavLink>
            <NavLink to="/stories" className="nav-link" onClick={() => setOpen(false)}>
              <span>📚</span> My Stories
            </NavLink>
            <NavLink to="/create" className="nav-link" onClick={() => setOpen(false)}>
              <span>✨</span> Create Story
            </NavLink>
            <NavLink to="/analytics" className="nav-link" onClick={() => setOpen(false)}>
              <span>📈</span> Analytics
            </NavLink>
            <NavLink to="/settings" className="nav-link" onClick={() => setOpen(false)}>
              <span>⚙️</span> Settings
            </NavLink>
          </nav>
        </div>

        {/* User Section */}
        <div
          className="bg-white/60 p-4 rounded-3xl border border-white/80 flex items-center gap-4 shadow-lg backdrop-blur-sm cursor-pointer mt-6"
          onClick={() => {
            navigate("/profile");
            setOpen(false);
          }}
        >
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold text-lg shadow-md border-2 border-white/60">
            SJ
          </div>
          <div>
            <h4 className="font-bold text-gray-800">Sarah Johnson</h4>
            <p className="text-xs text-purple-600 font-semibold bg-white/60 px-2 py-0.5 rounded-full inline-block mt-1 border border-white/80">
              ✨ Premium Plan
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}