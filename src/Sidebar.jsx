import React from "react";

export default function Sidebar() {
  return (
    <aside className="w-72 flex flex-col justify-between sidebar-soft p-7">
      <div>
        <div className="flex items-center gap-3 mb-12">
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

        <nav className="space-y-2">
          <a href="#" className="nav-link">
            <span>📊</span> Dashboard
          </a>
          <a href="#" className="nav-link active">
            <span>📚</span> My Stories
          </a>
          <a href="#" className="nav-link">
            <span>✨</span> Create Story
          </a>
          <a href="#" className="nav-link">
            <span>📈</span> Analytics
          </a>
          <a href="#" className="nav-link">
            <span>⚙️</span> Settings
          </a>
        </nav>
      </div>

      <div className="bg-white/60 p-4 rounded-3xl border border-white/80 flex items-center gap-4 shadow-lg backdrop-blur-sm">
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
  );
}