import { BrowserRouter, Routes, Route } from "react-router-dom";

import StoryReader from "./pages/StoryReader";
import Dashboard from "./pages/Dashboard";
import MyStories from "./pages/MyStories";
import Settings from "./pages/Settings";
import AnalyticsPage from "./pages/AnalyticsPage";
import CreateStory from "./pages/createStory";

function App() {
  return (
    <BrowserRouter>
      

        <div className="flex-1 p-6">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/stories" element={<MyStories />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/reader" element={<CreateStory />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
          </Routes>
        </div>
     
    </BrowserRouter>
  );
}

export default App;