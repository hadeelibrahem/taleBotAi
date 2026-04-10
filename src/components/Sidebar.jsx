import React, { useState } from "react";
import { NavLink } from "react-router-dom";

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* زر الهامبرغر - يظهر فقط في الجوال */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-purple-600 text-white rounded-lg shadow-lg"
      >
        {isOpen ? "✕" : "☰"}
      </button>

      {/* Overlay: خلفية شبه شفافة عند فتح القائمة في الجوال */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        ></div>
      )}

      <aside className={`
  fixed inset-y-0 left-0 z-[100] w-72 flex flex-col justify-between sidebar-soft p-7
  transition-transform duration-300 ease-in-out transform bg-white
  ${isOpen ? "translate-x-0" : "-translate-x-full"} 
  lg:translate-x-0 lg:static lg:h-screen lg:z-20
`}>
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
             <NavLink to="/" className="nav-link" onClick={() => setIsOpen(false)}>
              <span>📊</span> Dashboard
            </NavLink>
             <NavLink to="/stories" className="nav-link" onClick={() => setIsOpen(false)}>
              <span>📚</span> My Stories
            </NavLink>
             <NavLink to="/reader" className="nav-link" onClick={() => setIsOpen(false)}>
              <span>✨</span> Create Story
            </NavLink>
            <NavLink to="/analytics" className="nav-link" onClick={() => setIsOpen(false)}>
              <span>📈</span> Analytics
           </NavLink>
            <NavLink to="/settings" className="nav-link" onClick={() => setIsOpen(false)}>
              <span>⚙️</span> Settings
            </NavLink>
          </nav>
        </div>

        {/* User Profile Section */}
        <div className="bg-white/60 p-4 rounded-3xl border border-white/80 flex items-center gap-4 shadow-lg backdrop-blur-sm">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold text-lg shadow-md border-2 border-white/60">
            SJ
          </div>
          <div className="overflow-hidden">
            <h4 className="font-bold text-gray-800 truncate">Sarah Johnson</h4>
            <p className="text-[10px] text-purple-600 font-semibold bg-white/60 px-2 py-0.5 rounded-full inline-block mt-1 border border-white/80 whitespace-nowrap">
              ✨ Premium Plan
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}