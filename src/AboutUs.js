import React, { useState, useEffect } from 'react';

const AboutUs = () => {
  const [pageData, setPageData] = useState({
    description: [],
    faqs: [],
    features: []
  });

  useEffect(() => {
    // محاكاة جلب البيانات - هنا تربطها بـ Laravel مستقبلاً
    setPageData({
      description: [
        "Provides powerful, easy-to-use tools to craft magical stories.",
        "Empowers users to generate immersive narratives and characters.",
        "Utilizes advanced AI to spark creativity for all ages."
      ],
      faqs: [
        { q: "Who is TaleBot AI for?", a: "Writers, dreamers, parents, and storytellers of all ages." },
        { q: "Is it safe?", a: "Yes, with a focus on inspiring and wholesome magical content." }
      ],
      features: [
        { icon: "📖", title: "Intuitive Platform", desc: "Designed for seamless storytelling." },
        { icon: "🧙", title: "Limitless Creativity", desc: "Explore endless magical possibilities." },
        { icon: "🏅", title: "Community Focused", desc: "Join a supportive network of creators." },
        { icon: "⚙️", title: "Innovative Tech", desc: "Constantly evolving AI features." }
      ]
    });
  }, []);

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-6 font-sans bg-cover bg-center bg-no-repeat"
      style={{ 
        // استبدل هذا المسار بمسار صورتك الخاصة
        backgroundImage: `url('/BG.png')` 
      }}
    >
      {/* المستطيل الأبيض (البطاقة) */}
      <div className="relative w-full max-w-5xl bg-white/85 backdrop-blur-md rounded-[2.5rem] shadow-2xl border border-white/40 overflow-hidden">
        
        {/* لسان التبويب العلوي */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-white px-10 py-1.5 rounded-b-3xl shadow-sm border-x border-b border-gray-100 z-10">
          <h1 className="text-[#98b4f5] font-bold tracking-tight">
            TaleBot <span className="text-[#f4baba]">AI +</span>
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 p-10 pt-20">
          
          {/* القسم الأيسر */}
          <div className="flex flex-col items-center space-y-8 text-center md:text-left">
            <div className="relative">
              {/* صورة الروبوت أو الماascot */}
              <img 
                src="/aboutus.png" 
                alt="TaleBot Mascot" 
                className="w-64 h-64 object-contain drop-shadow-2xl"
              />
            </div>

            {/* صندوق الأسئلة */}
            <div className="w-full bg-white/40 p-6 rounded-3xl border border-white/60 shadow-inner">
              <h3 className="text-gray-700 font-bold mb-4 flex items-center justify-center md:justify-start gap-2">
                2 Frequently Asked Questions <span className="text-pink-300">✦</span>
              </h3>
              <div className="space-y-4 text-sm text-left">
                {pageData.faqs.map((faq, idx) => (
                  <div key={idx}>
                    <p className="font-bold text-gray-800 underline decoration-pink-200">Q: {faq.q}</p>
                    <p className="text-gray-600 italic mt-1 leading-relaxed">A: {faq.a}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* القسم الأيمن */}
          <div className="space-y-6">
            <div className="bg-white/40 p-6 rounded-3xl border border-white/60">
              <h2 className="text-xl font-black text-gray-800 mb-4">
                What does TaleBOT AI do? <span className="text-blue-300">✦</span>
              </h2>
              <ul className="space-y-3 text-sm text-gray-700 list-disc list-inside">
                {pageData.description.map((text, i) => (
                  <li key={i}>{text}</li>
                ))}
              </ul>
            </div>

            <div className="bg-white/40 p-6 rounded-3xl border border-white/60">
              <h2 className="text-xl font-black text-gray-800 mb-4">
                Why Us? <span className="text-green-300">★</span>
              </h2>
              <div className="grid gap-4">
                {pageData.features.map((f, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="text-xl">{f.icon}</span>
                    <div className="text-sm">
                      <span className="font-bold text-gray-800">{f.title}:</span>
                      <span className="text-gray-600 block sm:inline ml-1">{f.desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 border-t border-gray-100 p-6 flex flex-col sm:flex-row justify-between items-center bg-white/20 text-[10px] uppercase tracking-widest text-gray-500 font-bold">
          <p>TaleBot AI - © 2024</p>
          <div className="flex items-center gap-6 mt-4 sm:mt-0">
            <span className="cursor-pointer hover:underline">Contact Us</span>
            <div className="flex gap-2">
               <div className="w-6 h-6 bg-gray-400 rounded-full flex items-center justify-center text-white text-xs">f</div>
               <div className="w-6 h-6 bg-gray-400 rounded-full flex items-center justify-center text-white text-xs"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;