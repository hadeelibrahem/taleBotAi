import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

const ResetPasswordForm = ({ email: initialEmail, token: initialToken, onPasswordResetSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    email: initialEmail || '',
    token: initialToken || '',
    password: '',
    password_confirmation: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const pangolinStyle = { fontFamily: "'Pangolin', cursive" };

  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      email: initialEmail || '',
      token: initialToken || '',
    }));
  }, [initialEmail, initialToken]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    if (formData.password !== formData.password_confirmation) {
        setMessage('New password and confirm password do not match.');
        setLoading(false);
        return;
    }

    try {
        const response = await fetch('http://localhost:8000/api/reset-password', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({
                email: formData.email,
                token: formData.token,
                password: formData.password,
                password_confirmation: formData.password_confirmation,
            }),
        });

        const result = await response.json();
        if (response.ok) {
            setMessage('✦ Your magic has been restored! Redirecting to login...');
            
            setTimeout(() => {
                onPasswordResetSuccess();
            }, 2500);
            
        } else {
            const errorMsg = result.message || (result.errors ? Object.values(result.errors).flat()[0] : 'Failed to reset password.');
            setMessage(errorMsg);
        }
    } catch (err) {
        setMessage('Network error, the spell failed.');
    } finally {
        if (!message.includes('restored')) setLoading(false);
    }
};

  return (
    <motion.div
      key="reset-password-form"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="w-full space-y-4 bg-white/50 p-8 rounded-[2.5rem] border border-white shadow-xl backdrop-blur-sm"
    >
      <h2 className="text-2xl font-black mb-6 text-[#444] text-center" style={pangolinStyle}>
        Reset Your Magical Password
      </h2>

      <input name="email" value={formData.email} type="email" placeholder="Email" className="w-full p-4 rounded-2xl border-none bg-white shadow-sm text-sm focus:ring-2 ring-pink-100 outline-none placeholder:text-gray-300" disabled />
      <input name="password" value={formData.password} onChange={handleInputChange} type="password" placeholder="New Password" className="w-full p-4 rounded-2xl border-none bg-white shadow-sm text-sm focus:ring-2 ring-pink-100 outline-none placeholder:text-gray-300" />
      <input name="password_confirmation" value={formData.password_confirmation} onChange={handleInputChange} type="password" placeholder="Confirm New Password" className="w-full p-4 rounded-2xl border-none bg-white shadow-sm text-sm focus:ring-2 ring-pink-100 outline-none placeholder:text-gray-300" />

      <motion.button onClick={handleSubmit} whileHover={{ scale: 1.03 }} disabled={loading} className="w-full py-4 text-white font-bold rounded-full shadow-lg text-sm mt-2" style={{ background: 'linear-gradient(90deg, #a78bfa, #f472b6)' }}>
        {loading ? 'Updating Magic...' : 'Update Password'}
      </motion.button>

      {message && <p className="text-[10px] text-center text-pink-500 font-bold">{message}</p>}

      <div className="text-center pt-4">
        <p onClick={onCancel} className="text-[10px] text-gray-300 cursor-pointer mt-2 hover:text-[#ffb2c5]">
          Cancel
        </p>
      </div>
    </motion.div>
  );
};

export default ResetPasswordForm;