import React, { useState, useEffect, useMemo } from 'react';
import TopTab from '../components/TopTab';
import bgImage from '../assets/images/BG.png';
import mascotImage from '../assets/images/aboutus.png';
import AboutUsContent from '../components/AboutUsContent';
import { motion } from 'framer-motion';

const AboutUs = () => {
  const [pageData, setPageData] = useState({ description: [], faqs: [], features: [] });

  const pangolinStyle = { fontFamily: "'Pangolin', cursive" };

  const sparkles = useMemo(() => [...Array(40)].map((_, i) => ({
    id: i,
    size: Math.random() * 15 + 5,
    top: Math.random() * 100 + "%",
    left: Math.random() * 100 + "%",
    delay: Math.random() * 5,
    duration: Math.random() * 3 + 2
  })), []);

  useEffect(() => {
    setPageData({
      description: ["Creating magical stories with a kind AI friend.", "Giving parents the tools to keep every adventure safe and fun.", "Sparking creativity in a world built just for kids."],
      faqs: [{ q: "Is TaleBot AI safe?", a: "Yes! Every story is filtered, and parents have a special dashboard to monitor content." }],
      features: [
        { icon: "🪄", title: "Magic Tales", desc: "Created by AI." },
        { icon: "🛡️", title: "Safe Play", desc: "Parental control." },
        { icon: "🌈", title: "Colorful", desc: "Kid-friendly art." },
        { icon: "👪", title: "Family First", desc: "Safe for all ages." }
      ]
    });
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-cover bg-center font-['Pangolin']" 
         style={{ backgroundImage: `url(${bgImage})` }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Pangolin&display=swap');`}</style>
      <div className="relative w-full max-w-5xl bg-white/90 backdrop-blur-md rounded-[2.5rem] shadow-2xl overflow-hidden min-h-[600px]">
        <TopTab />
        
        {/* النجوم العشوائية */}
        {sparkles.map((s) => (
          <motion.span
            key={s.id}
            className="absolute text-pink-200 pointer-events-none z-0"
            style={{ top: s.top, left: s.left, fontSize: s.size }}
            animate={{ opacity: [0, 0.8, 0], scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: s.duration, delay: s.delay }}
          >
            ✦
          </motion.span>
        ))}

        <div className="z-10 relative w-full h-full flex items-center justify-center">
          <AboutUsContent 
            pageData={pageData} 
            mascotImage={mascotImage} 
            pangolinStyle={pangolinStyle} 
          />
        </div>
      </div>
    </div>
  );
};

export default AboutUs;