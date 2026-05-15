import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
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
  return getAdminToken() ? <Admin /> : <Navigate to="/" replace />;
}




function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/stories" element={<MyStories />} />
        <Route path="/create" element={<CreateStory />} />
        <Route path="/reader" element={<StoryReader />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/admin" element={<AdminRoute />} />
        
        <Route path="/child/:id" element={<ChildDashboard />} />
          <Route path="/child/:id/stories" element={<MyStories />} />
          <Route path="/child/:id/create" element={<CreateStory />} />
          <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

    </BrowserRouter>
  );
}

export default App;
