import React from "react";
import Sidebar from "../components/Sidebar";
export default function MyStories() {
  return (
    <div className="main-container">
       {/* القائمة الجانبية */}
     <Sidebar />

      {/* القسم الرئيسي */}
      <main className="flex-1 stories-bg p-8 overflow-y-auto">
        {/* اللوجو كخلفية متكررة */}
        <div className="logo-watermark"></div>

        {/* اللوجو في الزاوية */}
        <div className="logo-corner"></div>

        {/* حاوية النجوم */}
        <div className="stars-container">
          {/* نجوم كبيرة */}
          <i
            className="star large fa-solid fa-star"
            style={{ top: "5%", left: "10%" }}
          ></i>
          <i
            className="star large fa-solid fa-star"
            style={{ top: "15%", left: "85%" }}
          ></i>
          <i
            className="star large fa-solid fa-star"
            style={{ top: "30%", left: "70%" }}
          ></i>
          <i
            className="star large fa-solid fa-star"
            style={{ top: "50%", left: "20%" }}
          ></i>
          <i
            className="star large fa-solid fa-star"
            style={{ top: "75%", left: "90%" }}
          ></i>
          <i
            className="star large fa-solid fa-star"
            style={{ top: "90%", left: "40%" }}
          ></i>

          {/* نجوم متوسطة */}
          <i
            className="star medium fa-solid fa-star"
            style={{ top: "10%", left: "35%" }}
          ></i>
          <i
            className="star medium fa-solid fa-star"
            style={{ top: "22%", left: "55%" }}
          ></i>
          <i
            className="star medium fa-solid fa-star"
            style={{ top: "38%", left: "15%" }}
          ></i>
          <i
            className="star medium fa-solid fa-star"
            style={{ top: "45%", left: "75%" }}
          ></i>
          <i
            className="star medium fa-solid fa-star"
            style={{ top: "60%", left: "30%" }}
          ></i>
          <i
            className="star medium fa-solid fa-star"
            style={{ top: "80%", left: "60%" }}
          ></i>

          {/* نجوم صغيرة */}
          <i
            className="star small fa-regular fa-star"
            style={{ top: "8%", left: "92%" }}
          ></i>
          <i
            className="star small fa-regular fa-star"
            style={{ top: "25%", left: "8%" }}
          ></i>
          <i
            className="star small fa-regular fa-star"
            style={{ top: "42%", left: "88%" }}
          ></i>
          <i
            className="star small fa-regular fa-star"
            style={{ top: "58%", left: "45%" }}
          ></i>
          <i
            className="star small fa-regular fa-star"
            style={{ top: "72%", left: "15%" }}
          ></i>
          <i
            className="star small fa-regular fa-star"
            style={{ top: "88%", left: "70%" }}
          ></i>
        </div>

        {/* الهيدر */}
        <div className="flex justify-between items-start mb-8 relative z-10">
          <div>
            <h2 className="text-4xl font-extrabold mb-2">My Magical Stories</h2>
            <div className="flex items-center gap-4 mt-1">
              <span className="library-text">🌸 Sarah's Storyscape Library</span>
              <span className="stories-count px-4 py-1.5 rounded-full text-xs font-bold shadow-sm border backdrop-blur-sm">
                12 Stories
              </span>
            </div>
          </div>

          {/* لوحة Parent's Insights */}
          <div className="insight-panel p-6 w-80 shadow-xl">
            <h3 className="font-bold text-gray-700 text-lg mb-4 flex items-center justify-between">
              Parent&apos;s Insights
              <span className="text-2xl">📘</span>
            </h3>
            <div className="space-y-4">
              <div className="relative">
                <span className="absolute left-3 top-3.5 text-gray-400">🔍</span>
                <input
                  type="text"
                  placeholder="Find a story..."
                  className="search-input"
                />
              </div>
              <select className="w-full bg-white/70 border-0 rounded-2xl px-4 py-3 text-sm text-gray-600 focus:outline-none focus:ring-4 ring-purple-200/50 shadow-inner">
                <option>📖 All Genres</option>
                <option>🐉 Fantasy</option>
                <option>🚀 Adventure</option>
                <option>🪄 Fairy Tale</option>
              </select>
            </div>
            <div className="mt-5 pt-3 border-t border-white/60">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">🤖 AI Engine Status</span>
                <span className="text-xs bg-green-200/80 text-green-700 px-3 py-1 rounded-full font-semibold">
                  Library up-to-date
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* شبكة القصص */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 auto-rows-fr relative z-10">
          <div className="story-card p-3">
            <div className="story-image">
              <img
                src="https://picsum.photos/seed/dragon/400/300"
                alt="Dragon"
              />
            </div>
            <h3>The Dragon&apos;s Picnic</h3>
            <div className="story-info">
              <span className="genre">🐉 Fantasy</span>
              <span className="moral">❤️ Kindness</span>
            </div>
          </div>

          <div className="story-card p-3">
            <div className="story-image">
              <img src="https://picsum.photos/seed/mia/400/300" alt="Mia" />
            </div>
            <h3>Mia and the Moonbeam</h3>
            <div className="story-info">
              <span className="genre">🐉 Fantasy</span>
              <span className="moral">❤️ Kindness</span>
            </div>
          </div>

          <div className="story-card p-3">
            <div className="story-image">
              <img
                src="https://picsum.photos/seed/elephant/400/300"
                alt="Elephant"
              />
            </div>
            <h3>The Sleepy Elephant</h3>
            <div className="story-info">
              <span className="genre">🐉 Fantasy</span>
              <span className="moral">❤️ Kindness</span>
            </div>
          </div>

          <div className="story-card p-3">
            <div className="story-image">
              <img
                src="https://picsum.photos/seed/starfish/400/300"
                alt="Starfish"
              />
            </div>
            <h3>Oliver&apos;s Starfish</h3>
            <div className="story-info">
              <span className="genre">🐉 Fantasy</span>
              <span className="moral">❤️ Kindness</span>
            </div>
          </div>

          <div className="story-card p-3">
            <div className="story-image">
              <img
                src="https://picsum.photos/seed/gears/400/300"
                alt="Gears"
              />
            </div>
            <h3>Gears and Giggles</h3>
            <div className="story-info">
              <span className="genre">🐉 Fantasy</span>
              <span className="moral">❤️ Kindness</span>
            </div>
          </div>

          <div className="story-card p-3">
            <div className="story-image">
              <img
                src="https://picsum.photos/seed/pirate/400/300"
                alt="Pirate"
              />
            </div>
            <h3>The Tiny Pirate</h3>
            <div className="story-info">
              <span className="genre">🐉 Fantasy</span>
              <span className="moral">❤️ Kindness</span>
            </div>
          </div>

          <div className="story-card p-3">
            <div className="story-image">
              <img
                src="https://picsum.photos/seed/cloudcastle/400/300"
                alt="Cloud Castle"
              />
            </div>
            <h3>The Cloud Castle</h3>
            <div className="story-info">
              <span className="genre">🐉 Fantasy</span>
              <span className="moral">❤️ Kindness</span>
            </div>
          </div>

          <div className="story-card p-3">
            <div className="story-image">
              <img
                src="https://picsum.photos/seed/detective/400/300"
                alt="Detective"
              />
            </div>
            <h3>The Bedtime Detective</h3>
            <div className="story-info">
              <span className="genre">🐉 Fantasy</span>
              <span className="moral">❤️ Kindness</span>
            </div>
          </div>

          <div className="story-card p-3">
            <div className="story-image">
              <img
                src="https://picsum.photos/seed/whispering/400/300"
                alt="Whispering Woods"
              />
            </div>
            <h3>Whispering Woods</h3>
            <div className="story-info">
              <span className="genre">🐉 Fantasy</span>
              <span className="moral">❤️ Kindness</span>
            </div>
          </div>

          <div className="story-card p-3">
            <div className="story-image">
              <img
                src="https://picsum.photos/seed/rainbowkey/400/300"
                alt="Rainbow Key"
              />
            </div>
            <h3>The Rainbow Key</h3>
            <div className="story-info">
              <span className="genre">🐉 Fantasy</span>
              <span className="moral">❤️ Kindness</span>
            </div>
          </div>

          <div className="story-card p-3">
            <div className="story-image">
              <img
                src="https://picsum.photos/seed/clockwork/400/300"
                alt="Clockwork Castle"
              />
            </div>
            <h3>Sarah&apos;s Clockwork Castle</h3>
            <div className="story-info">
              <span className="genre">🐉 Fantasy</span>
              <span className="moral">❤️ Kindness</span>
            </div>
          </div>

          <div className="story-card p-3">
            <div className="story-image">
              <img
                src="https://picsum.photos/seed/bathtastic/400/300"
                alt="Flying Bathtastic"
              />
            </div>
            <h3>The Flying Bathtastic</h3>
            <div className="story-info">
              <span className="genre">🐉 Fantasy</span>
              <span className="moral">❤️ Kindness</span>
            </div>
          </div>
        </div>

        {/* Pagination */}
        <div className="mt-10 flex justify-center items-center gap-6 relative z-10">
          <button className="px-5 py-2 rounded-full bg-white/70 border border-white text-sm font-semibold text-purple-600 hover:bg-purple-100 transition shadow-sm">
            ← Previous
          </button>
          <span className="text-sm font-semibold text-indigo-900 bg-white/50 px-4 py-2 rounded-full border border-white/70">
            Page 1 of 1
          </span>
          <button className="px-5 py-2 rounded-full bg-white/70 border border-white text-sm font-semibold text-purple-600 hover:bg-purple-100 transition shadow-sm">
            Next →
          </button>
        </div>
      </main>
    </div>
  );
}