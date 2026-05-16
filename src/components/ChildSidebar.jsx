import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { NavLink} from "react-router-dom";

export default function ChildSidebar({ child }) {
  const [open, setOpen] = useState(false);
  const { id } = useParams();
const navigate = useNavigate();

const handleLogout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  localStorage.removeItem("childUser");
  localStorage.removeItem("childMode");
  localStorage.removeItem("selectedChildId");
  navigate("/", { replace: true });
};

  return (
    <>
      <div className="lg:hidden flex items-center justify-between px-4 py-3 sidebar-soft border-b border-white/60">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl overflow-hidden shadow-lg border-2 border-white/60">
            <img src="/imags/logo.jpg" alt="TaleBot AI" className="w-full h-full object-cover" />
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
          <div className="hidden lg:flex items-center gap-3 mb-12">
            <div className="w-11 h-11 rounded-2xl overflow-hidden shadow-lg border-2 border-white/60">
              <img src="/imags/logo.jpg" alt="TaleBot AI" className="w-full h-full object-cover" />
            </div>
            <span className="text-2xl font-extrabold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
              TaleBot AI
            </span>
          </div>

          <nav className="space-y-2">

  <NavLink
  to={`/child/${id}`}
  end
  className={({ isActive }) =>
    isActive ? "nav-link active-link" : "nav-link"
  }
  onClick={() => setOpen(false)}
>
  <span>📊</span> Dashboard
</NavLink>

<NavLink
  to={`/child/${id}/stories`}
  className={({ isActive }) =>
    isActive ? "nav-link active-link" : "nav-link"
  }
  onClick={() => setOpen(false)}
>
  <span>📚</span> My Stories
</NavLink>

<NavLink
  to={`/child/${id}/create`}
  className={({ isActive }) =>
    isActive ? "nav-link active-link" : "nav-link"
  }
  onClick={() => setOpen(false)}
>
  <span>✨</span> Create Story
</NavLink>

</nav>
        </div>

        <div className="mt-6">
  <div className="bg-white/60 p-4 rounded-3xl border border-white/80 flex items-center gap-4 shadow-lg backdrop-blur-sm">
    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold text-lg shadow-md border-2 border-white/60">
      {child?.avatar || "👶"}
    </div>
    <div>
      <h4 className="font-bold text-gray-800">{child?.name || "Child"}</h4>
      <p className="text-xs text-purple-600 font-semibold bg-white/60 px-2 py-0.5 rounded-full inline-block mt-1 border border-white/80">
        Child Mode
      </p>
    </div>
  </div>

  <button
            type="button"
            onClick={handleLogout}
            className="w-full rounded-2xl border border-pink-100 bg-white/70 px-4 py-3 text-sm font-extrabold text-pink-600 shadow-lg transition hover:bg-pink-50 hover:text-pink-700"
          >
            Logout
          </button>
</div>
      </aside>
    </>
    
  );

  
}
