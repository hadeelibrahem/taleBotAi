import { BrowserRouter, Navigate, Route, Routes, useParams } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import AboutUs from "./pages/AboutUs";
import StoryReader from "./pages/StoryReader";
import Dashboard from "./pages/Dashboard";
import MyStories from "./pages/MyStories";
import Settings from "./pages/Settings";
import AnalyticsPage from "./pages/AnalyticsPage";
import CreateStory from "./pages/createStory";
import Profile from "./pages/Profile";
import ChildDashboard from "./pages/ChildDashboard";
import Admin from "./pages/Admin";
import { getAdminToken } from "./services/adminApi";

function AdminRoute() {
  if (isChildModeLocked()) {
    return <Navigate to={getChildModePath()} replace />;
  }

  return getAdminToken() ? <Admin /> : <Navigate to="/" replace />;
}

function isChildModeLocked() {
  return localStorage.getItem("childMode") === "true";
}

function getChildModePath() {
  try {
    const child = JSON.parse(localStorage.getItem("childUser") || "null");
    const childId = child?.id || localStorage.getItem("selectedChildId");

    return childId ? `/child/${childId}` : "/";
  } catch {
    return "/";
  }
}

function ParentRoute({ children }) {
  return isChildModeLocked() ? <Navigate to={getChildModePath()} replace /> : children;
}

function PublicRoute({ children }) {
  return isChildModeLocked() ? <Navigate to={getChildModePath()} replace /> : children;
}

function ChildRoute({ children }) {
  const { id } = useParams();
  const lockedPath = getChildModePath();
  const lockedId = lockedPath.match(/^\/child\/([^/]+)/)?.[1];

  if (!isChildModeLocked()) {
    return <Navigate to={localStorage.getItem("token") ? "/settings" : "/"} replace />;
  }

  if (isChildModeLocked() && lockedId && id && String(id) !== String(lockedId)) {
    return <Navigate to={lockedPath} replace />;
  }

  return children;
}




function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PublicRoute><LandingPage /></PublicRoute>} />
        <Route path="/about" element={<PublicRoute><AboutUs /></PublicRoute>} />
        <Route path="/dashboard" element={<ParentRoute><Dashboard /></ParentRoute>} />
        <Route path="/create" element={<ParentRoute><CreateStory /></ParentRoute>} />
        <Route path="/reader" element={<ParentRoute><StoryReader /></ParentRoute>} />
        <Route path="/analytics" element={<ParentRoute><AnalyticsPage /></ParentRoute>} />
        <Route path="/settings" element={<ParentRoute><Settings /></ParentRoute>} />
        <Route path="/profile" element={<ParentRoute><Profile /></ParentRoute>} />
        <Route path="/admin" element={<AdminRoute />} />
        
        <Route path="/child/:id" element={<ChildRoute><ChildDashboard /></ChildRoute>} />
          <Route path="/child/:id/stories" element={<ChildRoute><MyStories /></ChildRoute>} />
          <Route path="/child/:id/reader" element={<ChildRoute><StoryReader /></ChildRoute>} />
          <Route path="/child/:id/create" element={<ChildRoute><CreateStory /></ChildRoute>} />
          <Route path="*" element={<Navigate to={isChildModeLocked() ? getChildModePath() : "/"} replace />} />
      </Routes>

    </BrowserRouter>
  );
}

export default App;
