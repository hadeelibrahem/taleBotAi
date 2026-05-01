/*import { BrowserRouter, Routes, Route } from "react-router-dom";
import Admin from "./pages/Admin";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Admin />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;*/

import { BrowserRouter, Routes, Route } from "react-router-dom";
import StoryReader from "./pages/StoryReader";
import Dashboard from "./pages/Dashboard";
import MyStories from "./pages/MyStories";
import Settings from "./pages/Settings";
import AnalyticsPage from "./pages/AnalyticsPage";
import CreateStory from "./pages/createStory";
import Profile from "./pages/Profile"; 

function App() {
  return (
    <BrowserRouter>
      

        <div className="flex-1 p-6">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/stories" element={<MyStories />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/reader" element={<StoryReader />} />
            <Route path="/create" element={<CreateStory/>} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/profile" element={<Profile />}
            />
          </Routes>
        </div>
     
    </BrowserRouter>
  );
}

export default App;
