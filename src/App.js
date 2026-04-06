import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mail, Facebook, Apple, ChevronDown, Check, Star, Sparkles, HelpCircle } from 'lucide-react';

const LandingPage = () => {
  const [pageData, setPageData] = useState({ description: [], faqs: [], features: [] });

  useEffect(() => {
    document.title = "TaleBot AI";
    // بيانات About Us (لـ Section 2)
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

  // توحيد توزيع السباركلز في مكان واحد ليستخدم في الواجهتين بنفس الإحداثيات
  const sparkleElements = useMemo(() => [...Array(40)].map((_, i) => ({
    id: i,
    size: Math.random() * 10 + 5,
    top: Math.random() * 100 + "%",
    left: Math.random() * 100 + "%",
    delay: Math.random() * 5
  })), []);

  const pangolinStyle = { fontFamily: "'Pangolin', cursive" };

  // مكون التبويبة العلوية الموحد (TaleBot AI)
  const TopTab = () => (
    <div className="absolute -top-[50px] left-1/2 -translate-x-1/2 z-30">
      <div className="relative bg-white px-12 py-3 rounded-t-[2.5rem] flex items-center justify-center border-t border-x border-white/50 shadow-sm">
        <div className="flex text-2xl font-bold tracking-tight" style={pangolinStyle}>
          <span className="text-[#8eb8e5]">TaleBot</span>
          <span className="text-[#ffb2c5] ml-2">AI</span>
        </div>
        {/* حواف كيرف جانبية */}
        <div className="absolute -bottom-[1px] -left-[20px] w-5 h-5 bg-transparent rounded-br-[20px] shadow-[6px_0_0_0_white]"></div>
        <div className="absolute -bottom-[1px] -right-[20px] w-5 h-5 bg-transparent rounded-bl-[20px] shadow-[-6px_0_0_0_white]"></div>
      </div>
    </div>
  );

  // مكون النجوم الموحد
  const SparkleOverlay = () => (
    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-[2.5rem]">
      {sparkleElements.map((s) => (
        <motion.span
          key={s.id}
          className="absolute text-pink-200/60"
          style={{ top: s.top, left: s.left, fontSize: s.size }}
          animate={{ opacity: [0.2, 0.8, 0.2], scale: [1, 1.2, 1] }}
          transition={{ repeat: Infinity, duration: 3, delay: s.delay }}
        >
          ✦
        </motion.span>
      ))}
    </div>
  );

  return (
    <div className="h-screen overflow-y-scroll snap-y snap-mandatory scroll-smooth bg-[#fdf5f7]" 
         style={{ backgroundImage: "url('/BG.png')", backgroundSize: 'cover', backgroundPosition: 'center' }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Pangolin&display=swap');`}</style>

      {/* ####### القسم الأول: Auth (النسخة الأصلية الدقيقة من الصورة) ####### */}
      <section className="h-screen w-full flex items-center justify-center snap-start p-6 relative">
        <motion.div 
          className="bg-white rounded-[2.5rem] shadow-2xl max-w-5xl w-full min-h-[620px] p-8 relative flex flex-col items-center justify-between"
          initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
        >
          <TopTab />
          <SparkleOverlay />

          {/* العنوان الأصلي الدقيق */}
          <div className="text-center mt-8 z-10">
            <h1 className="text-3xl font-black text-[#3a3a3a] mb-1" style={pangolinStyle}>Welcome to Magical Stories!</h1>
            <p className="text-gray-400 text-sm">Log in or sign up to begin your adventure</p>
          </div>

          {/* الجسم الرئيسي - التوزيع الأصلي */}
          <div className="flex flex-row items-center justify-between w-full z-10 px-4 gap-6">
            
            {/* Log In (Original Style) */}
            <div className="w-[300px] flex flex-col items-center">
              <h2 className="text-xl font-black mb-4 text-[#444]" style={pangolinStyle}>Log In</h2>
              <div className="w-full space-y-4 bg-white p-6 rounded-[2.5rem] border border-white shadow-inner">
                {/* حقل الإيميل العادي */}
                <input type="email" placeholder="Email" className="w-full p-3 rounded-2xl border-none bg-white shadow-sm text-sm focus:ring-1 ring-pink-100 outline-none placeholder:text-gray-300" />
                
                
                <input type="text" placeholder='Username'className="w-full p-3 rounded-2xl border-none bg-white shadow-sm text-sm focus:ring-1 ring-pink-100 outline-none placeholder:text-gray-300"/> 
                <input type="password" placeholder="Password" className="w-full p-3 rounded-2xl border-none bg-white shadow-sm text-sm focus:ring-1 ring-pink-100 outline-none placeholder:text-gray-300" />
                <motion.button whileHover={{ scale: 1.03 }} className="w-full py-3 text-white font-bold rounded-full shadow-lg text-sm" style={{ background: 'linear-gradient(90deg, #a78bfa, #f472b6)' }}>Log In</motion.button>
                <p className="text-center text-[10px] text-gray-400 cursor-pointer pt-1 hover:text-[#ffb2c5] transition-colors">Forgot Password?</p>
              </div>
            </div>

            {/* أنيميشن الروبوت */}
            <motion.img animate={{ y: [0, -15, 0] }} transition={{ repeat: Infinity, duration: 4 }} src="/bot-center.png" className="w-48 drop-shadow-2xl" />

            {/* Sign Up (Original Style) */}
            <div className="w-[300px] flex flex-col items-center">
              <h2 className="text-xl font-black mb-4 text-[#444]" style={pangolinStyle}>Sign Up</h2>
              <div className="w-full space-y-4 bg-white p-6 rounded-[2.5rem] border border-white shadow-inner">
                <input type="text" placeholder="Name" className="w-full p-3 rounded-2xl border-none bg-white shadow-sm text-sm focus:ring-1 ring-pink-100 outline-none placeholder:text-gray-300" />
                <input type="email" placeholder="Email" className="w-full p-3 rounded-2xl border-none bg-white shadow-sm text-sm focus:ring-1 ring-pink-100 outline-none placeholder:text-gray-300" />
                <input type="password" placeholder="Password" className="w-full p-3 rounded-2xl border-none bg-white shadow-sm text-sm focus:ring-1 ring-pink-100 outline-none placeholder:text-gray-300" />
                <motion.button whileHover={{ scale: 1.03 }} className="w-full py-3 text-white font-bold rounded-full shadow-lg text-sm" style={{ background: 'linear-gradient(90deg, #a78bfa, #f472b6)' }}>Create Account</motion.button>
                {/* التشيك بوكس - مطابق للصورة */}
                <div className="flex justify-center items-center gap-2 pt-1">
                  <input type="checkbox" id="signup-terms" className="scale-75 text-pink-300 focus:ring-pink-200" />
                  <label htmlFor="signup-terms" className="text-[10px] text-gray-400 font-medium">I agree of <a href="#" className="hover:text-[#ffb2c5] transition-colors">Terms & Privacy</a></label>
                </div>
              </div>
            </div>

          </div>

          <div className="animate-bounce mt-4 text-gray-300 flex flex-col items-center">
            <span className="text-[10px] font-bold tracking-widest uppercase mb-1">Scroll Down</span>
            <ChevronDown size={20} />
          </div>
        </motion.div>
      </section>

      {/* ####### القسم الثاني: About Us (النسخة الجديدة الدقيقة - مطابقة لستايل الصورة) ####### */}
      <section className="h-screen w-full flex items-center justify-center snap-start p-6 relative overflow-hidden">
        <motion.div 
          className="bg-white rounded-[2.5rem] shadow-2xl max-w-5xl w-full min-h-[620px] p-8 relative flex flex-col items-center"
          initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
        >
          <TopTab />
          <SparkleOverlay />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full h-full pt-10 z-10">
            {/* اليسار: Mascot + FAQs */}
            <div className="flex flex-col items-center justify-center space-y-6">
              <motion.img animate={{ scale: [1, 1.05, 1] }} transition={{ repeat: Infinity, duration: 6 }} src="/aboutus.png" className="w-52 drop-shadow-xl" />
              
              {/* صندوق FAQs الشفاف */}
              <div className="w-full bg-white p-6 rounded-[2.5rem] border border-white/60 shadow-lg">
                <div className="flex items-center gap-2 mb-4">
                  <HelpCircle className="text-pink-300" size={20} />
                  <h3 className="text-gray-800 font-black text-lg" style={pangolinStyle}>Frequently Asked Questions</h3>
                </div>
                <div className="space-y-4">
                  {pageData.faqs.map((faq, i) => (
                    <div key={i} className="text-xs bg-white/30 p-3 rounded-2xl">
                      <p className="font-bold text-[#8eb8e5] mb-1">Q: {faq.q}</p>
                      <p className="text-gray-600 leading-relaxed italic">A: {faq.a}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* اليمين: Description + Why Us */}
            <div className="flex flex-col justify-center space-y-6">
              {/* صندوق What does TaleBOT AI do? الشفاف */}
              <div className="bg-white p-6 rounded-[2.5rem] border border-white/60 shadow-lg relative">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="text-blue-300" size={20} />
                  <h2 className="text-xl font-black text-gray-800" style={pangolinStyle}>What does TaleBOT AI do?</h2>
                </div>
                <ul className="space-y-3">
                  {pageData.description.map((text, i) => (
                    <li key={i} className="text-xs text-gray-700 flex items-start gap-2 leading-relaxed">
                      <span className="text-pink-300 mt-1">✦</span> {text}
                    </li>
                  ))}
                </ul>
              </div>

              {/* صندوق Why Us الشفاف */}
              <div className="bg-white p-6 rounded-[2.5rem] border border-white/60 shadow-lg relative">
                <div className="flex items-center gap-2 mb-4">
                  <Star className="text-yellow-400" size={20} fill="currentColor" />
                  <h2 className="text-xl font-black text-gray-800" style={pangolinStyle}>Why Us?</h2>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {pageData.features.map((f, i) => (
                    <div key={i} className="bg-white p-3 rounded-2xl border border-white/20 flex flex-col items-center text-center">
                      <span className="text-xl mb-1">{f.icon}</span>
                      <p className="text-[10px] font-black text-gray-700 block" style={pangolinStyle}>{f.title}</p>
                      <p className="text-[9px] text-gray-600 leading-tight">{f.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* فوتر بسيط موحد */}
          
        </motion.div>
      </section>
    </div>
  );
};

export default LandingPage;