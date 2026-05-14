import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, BookOpen, User, Mail, Lock, ShieldCheck, Upload } from 'lucide-react';
import { loginAdmin, registerAdmin } from '../services/adminApi';

import TopTab from '../components/TopTab';
import SparkleOverlay from '../components/SparkleOverlay';
import AboutUsContent from '../components/AboutUsContent'; 

import bgImage from '../assets/images/BG.png';
import botCenter from '../assets/images/bot-center.png';
import aboutUsImage from '../assets/images/aboutus.png';
import loginImage from '../assets/images/login.png';

const LandingPage = () => {
  const navigate = useNavigate();
  const [pageData, setPageData] = useState({ description: [], faqs: [], features: [] });
  const [authMode, setAuthMode] = useState('signup');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '', email: '', password: '', password_confirmation: '', avatar: null, token: ''
  });

  const sparkles = useMemo(() => [...Array(40)].map((_, i) => ({
    id: i,
    size: Math.random() * 15 + 5,
    top: Math.random() * 100 + "%",
    left: Math.random() * 100 + "%",
    delay: Math.random() * 5,
    duration: Math.random() * 3 + 2
  })), []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const email = params.get('email');
    if (token && email) {
      setFormData(prev => ({ ...prev, email, token }));
      setAuthMode('reset');
      setTimeout(() => document.getElementById('auth')?.scrollIntoView({ behavior: 'smooth' }), 100);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    setFormData(prev => ({ ...prev, [name]: files ? files[0] : value }));
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    
    if (authMode === 'reset' || authMode === 'signup' || authMode === 'admin-signup') {
      if (formData.password.length < 8) {
        setMessage('Password must be at least 8 characters long! 🪄');
        return;
      }
      if (formData.password !== formData.password_confirmation) {
        setMessage('Passwords do not match! 🌈');
        return;
      }
    }

    setLoading(true);
    const endpoints = { signup: '/register', login: '/login', forgot: '/forgot-password', reset: '/reset-password' };
    const endpoint = endpoints[authMode];
    let body, headers = { 'Accept': 'application/json' };

    if (authMode === 'admin-login' || authMode === 'admin-signup') {
      headers['Content-Type'] = 'application/json';
      body = JSON.stringify({
        full_name: formData.full_name,
        email: formData.email,
        password: formData.password,
        password_confirmation: formData.password_confirmation,
      });
    } else if (authMode === 'signup') {
      const data = new FormData();
      Object.keys(formData).forEach(key => formData[key] && data.append(key, formData[key]));
      body = data;
    } else {
      headers['Content-Type'] = 'application/json';
      body = JSON.stringify({ email: formData.email, password: formData.password, token: formData.token, password_confirmation: formData.password_confirmation });
    }

    try {
      if (authMode === 'admin-login') {
        await loginAdmin({ email: formData.email, password: formData.password });
        navigate('/admin');
        return;
      }

      if (authMode === 'admin-signup') {
        await registerAdmin({
          full_name: formData.full_name,
          email: formData.email,
          password: formData.password,
          password_confirmation: formData.password_confirmation,
        });
        navigate('/admin');
        return;
      }

      const response = await fetch(`http://localhost:8000/api${endpoint}`, { method: 'POST', body, headers });
      const result = await response.json();
      if (response.ok) {
        if (authMode === 'signup') { setAuthMode('login'); setMessage('Account created!'); }
        else if (authMode === 'login') {
          setIsLoggedIn(true);
          localStorage.setItem('token', result.access_token);
          navigate('/dashboard');
        }
        else if (authMode === 'forgot') setMessage(result.message);
        else if (authMode === 'reset') { 
          console.log("✦ Spell Success: Password has been updated in the magic database!");
          setMessage('Magic! Password updated. An email confirmation is on its way. Redirecting...'); 
          setTimeout(() => setAuthMode('login'), 3000); 
        }
      } else {
        const errorMsg = result.message || (result.errors ? Object.values(result.errors).flat()[0] : 'Something went wrong in the magic.');
        setMessage(errorMsg);
      }
    } catch (err) {
      setMessage('Network error.');
    }
    setLoading(false);
  };

  useEffect(() => {
    setPageData({
      
      description: [
        "Create magical adventures with a friendly AI helper.", 
        "Design your own heroes, dragons, and fairy-tale worlds.", 
        "A safe space for kids to imagine, with tools for parents to watch and cheer."
      ],
     
      faqs: [{ q: "Is it safe for my child?", a: "Absolutely! Our AI is trained to be kind and safe, plus parents can review every story created." }, { q: "How does it work?", a: "Kids share an idea, and our magic bot helps them write and illustrate a whole book!" }],
      features: [
        { icon: "📖", title: "Intuitive", desc: "Seamless." },
        { icon: "🧙", title: "Magic AI", desc: "Limitless tales." },
        { icon: "🛡️", title: "Parent Shield", desc: "Safe & Monitored." },
        { icon: "🎨", title: "Pure Art", desc: "Kid-friendly." }
      ]
    });
  }, []);

  const pangolinStyle = { fontFamily: "'Pangolin', cursive" };

  return (
    <div className="h-screen overflow-y-scroll snap-y snap-mandatory scroll-smooth bg-[#fdf5f7]" 
         style={{ backgroundImage: `url(${bgImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
      {/* استيراد الخط هنا لضمان تطبيقه على كل الأقسام */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Pangolin&display=swap');
      `}</style>

      <section id="home" className="h-screen w-full flex items-center justify-center snap-start p-6 relative">
        <motion.div className="bg-white/90 backdrop-blur-sm rounded-[2.5rem] shadow-2xl max-w-5xl w-full min-h-[620px] p-8 relative flex flex-col items-center justify-center text-center">
          <TopTab />
          
          {/* عرض النجوم العشوائية في القسم الأول */}
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

          <div className="z-10 space-y-8">
            {/* انيميشن لطيف للروبوت (Floating Effect) */}
            <motion.img 
              src={botCenter} 
              alt="TaleBot" 
              className="w-48 mx-auto drop-shadow-2xl mb-4"
              animate={{ y: [0, -20, 0], rotate: [0, 2, -2, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            />

            {/* العنوان بطريقة مبتكرة */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex flex-col items-center"
            >
              <h1 className="text-6xl md:text-8xl font-black tracking-tighter" style={pangolinStyle}>
                <span className="text-[#8eb8e5] drop-shadow-md text-7xl md:text-9xl">TaleBot</span>
                <span className="text-[#ffb2c5] ml-4 drop-shadow-md italic">AI</span>
              </h1>
              <p className="text-xl text-gray-500 mt-4 font-medium max-w-lg">The safest place for little storytellers to bring their dreams to life!</p>
            </motion.div>

            <div className="flex flex-col md:flex-row gap-4 justify-center pt-4">
              <button onClick={() => document.getElementById('about').scrollIntoView({ behavior: 'smooth' })} className="px-8 py-4 bg-white text-[#8eb8e5] border-2 border-[#8eb8e5] font-bold rounded-full shadow-lg flex items-center gap-2 hover:bg-[#8eb8e5] hover:text-white transition-all">About TaleBot <BookOpen size={20}/></button>
              <button onClick={() => { setAuthMode('login'); document.getElementById('auth').scrollIntoView({ behavior: 'smooth' }); }} className="px-8 py-4 bg-gradient-to-r from-[#a78bfa] to-[#f472b6] text-white font-bold rounded-full shadow-xl flex items-center gap-2">Start Adventure <ArrowRight size={20}/></button>
            </div>
          </div>
        </motion.div>
      </section>

      {/* قسم About Us - الترتيب الثاني */}
      <section id="about" className="h-screen w-full flex items-center justify-center snap-start p-6 relative">
        <motion.div className="bg-white/90 backdrop-blur-sm rounded-[2.5rem] shadow-2xl max-w-5xl w-full min-h-[620px] p-8 relative flex flex-col items-center justify-center overflow-hidden border border-white/50">
          <TopTab />
          
          {/* عرض النجوم العشوائية في قسم About Us بنفس طريقة الهوم */}
          {sparkles.map((s) => (
            <motion.span
              key={`about-sparkle-${s.id}`}
              className="absolute text-pink-200 pointer-events-none z-0"
              style={{ top: s.top, left: s.left, fontSize: s.size }}
              animate={{ opacity: [0, 0.8, 0], scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: s.duration, delay: s.delay }}
            >
              ✦
            </motion.span>
          ))}

          <div className="z-10 w-full h-full flex items-center justify-center">
            <AboutUsContent 
              pageData={pageData} 
              mascotImage={aboutUsImage} 
              pangolinStyle={pangolinStyle} 
            />
          </div>
        </motion.div>
      </section>

      {/* قسم Auth (اللوجن والساين إن) - الترتيب الثالث */}
      <section id="auth" className="h-screen w-full flex items-center justify-center snap-start p-6 relative">
        <motion.div className="bg-white rounded-[2.5rem] shadow-2xl max-w-5xl w-full min-h-[620px] p-8 relative flex flex-col items-center justify-between overflow-hidden">
          <TopTab />
          <SparkleOverlay />
          <div className="text-center mt-12 z-10">
            {isLoggedIn ? (
              <><h1 className="text-4xl font-black text-[#ffb2c5] mb-2" style={pangolinStyle}>Welcome Home!</h1></>
            ) : (
              <div className="flex flex-col md:flex-row items-center justify-center gap-12 w-full max-w-4xl mx-auto">
                {/* عرض النجوم العشوائية في قسم Auth */}
                {sparkles.map((s) => (
                  <motion.span
                    key={`auth-sparkle-${s.id}`}
                    className="absolute text-pink-200 pointer-events-none z-0"
                    style={{ top: s.top, left: s.left, fontSize: s.size }}
                    animate={{ opacity: [0, 0.8, 0], scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: s.duration, delay: s.delay }}
                  >
                    ✦
                  </motion.span>
                ))}

                {/* عرض الصورة في جميع أوضاع التسجيل لضمان التناسق */}
                {(authMode === 'login' || authMode === 'forgot' || authMode === 'signup' || authMode === 'admin-login' || authMode === 'admin-signup') && (
                  <motion.img 
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    src={loginImage} 
                    alt="Login Magic" 
                    className="w-64 md:w-80 object-contain drop-shadow-2xl" 
                  />
                )}

                <motion.div 
                  key={authMode} 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="w-full max-w-[380px] space-y-4 bg-white/60 backdrop-blur-md p-8 rounded-[2.5rem] border border-white shadow-2xl relative"
                >
                  {/* العناوين بنفس ثيم TaleBot AI */}
                  <div className="flex justify-center items-center mb-6 gap-2">
                    <span className="text-[#8eb8e5] text-4xl font-black" style={pangolinStyle}>
                      {authMode === 'forgot' ? 'Reset' : authMode === 'signup' || authMode === 'admin-signup' ? 'Join' : 'Welcome'}
                    </span>
                    <span className="text-[#ffb2c5] text-4xl font-black italic drop-shadow-sm" style={pangolinStyle}>
                      {authMode === 'admin-login' || authMode === 'admin-signup' ? 'Admin' : authMode === 'forgot' ? 'Magic' : authMode === 'signup' ? 'Fun!' : 'Back'}
                    </span>
                  </div>
                  
                  <div className="space-y-3">
                    {(authMode === 'signup' || authMode === 'admin-signup') && (
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8eb8e5]" size={18} />
                        <input name="full_name" value={formData.full_name} onChange={handleInputChange} type="text" placeholder="Full Name" className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/80 shadow-sm outline-none focus:ring-2 focus:ring-[#8eb8e5] transition-all" />
                      </div>
                    )}
                    
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8eb8e5]" size={18} />
                      <input name="email" value={formData.email} onChange={handleInputChange} type="email" placeholder="Email Address" readOnly={authMode === 'reset'} className={`w-full pl-12 pr-4 py-4 rounded-2xl shadow-sm outline-none focus:ring-2 focus:ring-[#8eb8e5] transition-all ${authMode === 'reset' ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'bg-white/80'}`} />
                    </div>

                    {authMode !== 'forgot' && (
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8eb8e5]" size={18} />
                        <input name="password" value={formData.password} onChange={handleInputChange} type="password" placeholder={authMode === 'reset' ? "New Password" : "Password"} className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/80 shadow-sm outline-none focus:ring-2 focus:ring-[#8eb8e5] transition-all" />
                      </div>
                    )}

                    {(authMode === 'signup' || authMode === 'admin-signup' || authMode === 'reset') && (
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8eb8e5]" size={18} />
                        <input name="password_confirmation" value={formData.password_confirmation} onChange={handleInputChange} type="password" placeholder="Confirm Password" className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/80 shadow-sm outline-none focus:ring-2 focus:ring-[#8eb8e5] transition-all" />
                      </div>
                    )}

                    {authMode === 'signup' && (
                      <div className="relative group">
                        <Upload className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8eb8e5]" size={18} />
                        <input name="avatar" onChange={handleInputChange} type="file" className="hidden" id="avatar-upload" />
                        <label htmlFor="avatar-upload" className="block w-full pl-12 pr-4 py-4 rounded-2xl bg-white/80 shadow-sm text-gray-400 text-sm cursor-pointer group-hover:bg-white transition-all overflow-hidden text-ellipsis whitespace-nowrap">
                          {formData.avatar ? formData.avatar.name : 'Choose your Avatar'}
                        </label>
                      </div>
                    )}
                  </div>

                  <button onClick={handleAuthSubmit} className="w-full py-4 text-white font-black rounded-full shadow-lg transition-transform hover:scale-105 active:scale-95 mt-4" style={{ background: 'linear-gradient(90deg, #a78bfa, #f472b6)' }}>
                    {loading ? 'Casting Magic...' : authMode === 'signup' || authMode === 'admin-signup' ? 'Create Account' : 'Submit'}
                  </button>

                  {message && <p className="text-xs text-center text-pink-500 font-bold bg-pink-50 py-2 rounded-lg">{message}</p>}
                  
                  <div className="flex flex-col gap-3 text-xs font-bold text-gray-500 px-2 mt-6">
                    <button onClick={() => {
                      setAuthMode(authMode === 'login' ? 'signup' : authMode === 'admin-login' ? 'admin-signup' : authMode === 'admin-signup' ? 'admin-login' : 'login');
                      setMessage('');
                    }} className="hover:text-[#f472b6] transition-colors">
                      {authMode === 'admin-login'
                        ? "Create an admin account"
                        : authMode === 'admin-signup'
                          ? "Already an admin? Log in"
                          : authMode === 'login'
                            ? "Don't have an account? Create one!"
                            : "Already have an account? Log In"}
                    </button>
                    {authMode === 'login' && <button onClick={() => { setAuthMode('forgot'); setMessage(''); }} className="hover:text-[#8eb8e5] transition-colors self-center">Forgot Password?</button>}
                    {(authMode === 'login' || authMode === 'signup') && (
                      <button onClick={() => { setAuthMode('admin-login'); setMessage(''); }} className="hover:text-[#8b5cf6] transition-colors self-center flex items-center gap-1">
                        <ShieldCheck size={14} /> Log in as admin
                      </button>
                    )}
                    {(authMode === 'admin-login' || authMode === 'admin-signup') && (
                      <button onClick={() => { setAuthMode('login'); setMessage(''); }} className="hover:text-[#8eb8e5] transition-colors self-center">
                        Continue as storyteller
                      </button>
                    )}
                  </div>
                </motion.div>
              </div>
            )}
          </div>
        </motion.div>
      </section>
    </div>
  );
};

export default LandingPage;
