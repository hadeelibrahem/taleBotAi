import React from 'react';
import { motion } from 'framer-motion';

const AboutUsContent = ({ pageData, mascotImage, pangolinStyle }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-5xl h-full p-4 md:p-8 pt-20 overflow-y-auto md:overflow-visible z-10">
      {/* البطاقة 1: صورة الروبوت المتحركة */}
      <motion.div 
        whileHover={{ y: -5, scale: 1.02 }}
        className="bg-white/60 backdrop-blur-md rounded-[2.5rem] p-6 flex flex-col items-center justify-center border border-white shadow-xl"
      >
        <motion.img 
          src={mascotImage} 
          alt="Mascot" 
          className="w-48 h-48 md:w-56 md:h-56 object-contain drop-shadow-2xl"
          animate={{ y: [0, -15, 0], rotate: [0, 3, -3, 0] }}
          transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
        />
        <h3 className="mt-4 text-xl font-black text-[#ffb2c5]" style={pangolinStyle}>Your Magic Friend</h3>
      </motion.div>

      {/* البطاقة 2: ماذا نفعل؟ */}
      <motion.div 
        whileHover={{ y: -5, scale: 1.02 }}
        className="bg-white/60 backdrop-blur-md rounded-[2.5rem] p-8 flex flex-col justify-center border border-white shadow-xl text-left"
      >
        <h2 className="text-2xl font-black text-[#8eb8e5] mb-4" style={pangolinStyle}>What we do?</h2>
        <ul className="space-y-3">
          {pageData.description.map((text, i) => (
            <li key={i} className="text-sm text-gray-700 flex items-start gap-2 leading-relaxed">
              <span className="text-pink-300 mt-1">✦</span> {text}
            </li>
          ))}
        </ul>
      </motion.div>

      {/* البطاقة 3: الأسئلة الشائعة FAQs */}
      <motion.div 
        whileHover={{ y: -5, scale: 1.02 }}
        className="bg-white/60 backdrop-blur-md rounded-[2.5rem] p-8 flex flex-col justify-center border border-white shadow-xl text-left"
      >
        <h3 className="text-xl font-black mb-4 text-[#ffb2c5]" style={pangolinStyle}>Magic FAQs</h3>
        <div className="space-y-4">
          {pageData.faqs.map((faq, idx) => (
            <div key={idx} className="bg-white/40 p-3 rounded-2xl border border-white/50">
              <p className="font-bold text-sm text-[#444]">Q: {faq.q}</p>
              <p className="italic text-xs text-gray-600 mt-1">A: {faq.a}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* البطاقة 4: المميزات Our Features */}
      <motion.div 
        whileHover={{ y: -5, scale: 1.02 }}
        className="bg-white/60 backdrop-blur-md rounded-[2.5rem] p-8 flex flex-col justify-center border border-white shadow-xl"
      >
        <h2 className="text-2xl font-black mb-4 text-[#8eb8e5]" style={pangolinStyle}>Our Features</h2>
        <div className="grid grid-cols-2 gap-3">
          {pageData.features.map((feature, i) => (
            <div key={i} className="flex flex-col items-center bg-white/50 p-3 rounded-2xl shadow-sm border border-white/50 text-center">
              <span className="text-2xl mb-1">{feature.icon}</span>
              <h4 className="font-bold text-[10px] text-gray-700 uppercase" style={pangolinStyle}>{feature.title}</h4>
              <p className="text-[9px] opacity-75 leading-tight">{feature.desc}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default AboutUsContent;