import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import UserLoginForm from '../../components/user/auth/UserLoginForm';
import SellerLoginForm from '../../components/user/auth/SellerLoginForm';
import SellerRegisterForm from '../../components/user/auth/SellerRegisterForm';
import UserRegisterForm from '../../components/user/auth/UserRegisterForm';
import AdminLoginForm from '../../components/user/auth/AdminLoginForm';

/* ── Floating toy emoji that bob around the illustration side ── */
const floaters = [
  { emoji: '🧸', style: 'top-[8%] left-[12%] text-4xl', delay: '0s' },
  { emoji: '🚀', style: 'top-[18%] right-[8%] text-3xl', delay: '0.4s' },
  { emoji: '🎮', style: 'top-[44%] left-[6%] text-3xl', delay: '0.8s' },
  { emoji: '🦄', style: 'bottom-[24%] right-[10%] text-4xl', delay: '0.2s' },
  { emoji: '🎨', style: 'bottom-[12%] left-[18%] text-3xl', delay: '0.6s' },
  { emoji: '🎯', style: 'top-[30%] right-[20%] text-2xl', delay: '1s' },
  { emoji: '🪀', style: 'bottom-[38%] left-[22%] text-2xl', delay: '0.3s' },
  { emoji: '⭐', style: 'top-[60%] right-[5%] text-2xl', delay: '0.7s' },
];

const titleMap = {
  'user-login': {
    title: 'Sign in to your account',
    desc: 'Access your wishlist, orders & more',
  },
  'user-register': {
    title: 'Create your account',
    desc: 'Join ToyStore and start exploring!',
  },
  'seller-login': {
    title: 'Seller Login',
    desc: 'Manage your shop & products',
  },
  'seller-register': {
    title: 'Create Seller Account',
    desc: 'Create your seller account in 30 seconds',
  },
  'admin-login': {
    title: 'Admin Login',
    desc: 'Access the admin dashboard',
  },
};

export default function AuthPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [view, setView] = useState('user-login');

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const target = params.get('target');
    if (target === 'admin') {
      setView('admin-login');
    } else if (target === 'seller') {
      setView('seller-login');
    }
  }, [location]);

  const current = titleMap[view];

  return (
    <div className="auth-page-root min-h-screen w-full flex flex-col md:flex-row relative overflow-hidden">
      <div className="auth-blob auth-blob-1" />
      <div className="auth-blob auth-blob-2" />
      <div className="auth-blob auth-blob-3" />

      {/* LEFT SIDE */}
      <div className="auth-left hidden md:flex md:w-[45%] lg:w-[42%] flex-col items-center justify-center relative p-10 lg:p-12 overflow-hidden">
        <div className="absolute w-64 h-64 rounded-full bg-white/10 -top-16 -left-16" />
        <div className="absolute w-48 h-48 rounded-full bg-white/10 bottom-8 right-[-32px]" />
        <div className="absolute w-32 h-32 rounded-full bg-white/10 top-1/2 left-[-24px]" />

        {floaters.map((f, i) => (
          <div
            key={i}
            className={`absolute ${f.style} select-none auth-float`}
            style={{ animationDelay: f.delay }}
          >
            {f.emoji}
          </div>
        ))}

        <div className="relative z-10 text-center max-w-sm">
          <div className="w-36 h-36 mx-auto mb-6 bg-white/20 backdrop-blur-sm rounded-[2.5rem] flex items-center justify-center shadow-xl border border-white/30">
            <span className="text-7xl">🧸</span>
          </div>

          <h2
            className="text-white font-black text-3xl leading-tight mb-3"
            style={{ fontFamily: "'Fredoka One', cursive" }}
          >
            ToyStore
          </h2>

          <p className="text-white/80 text-sm font-medium leading-relaxed max-w-xs mx-auto">
            Discover thousands of magical toys, games & gifts that spark joy in every child 🎉
          </p>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="flex-1 w-full bg-white flex flex-col justify-center px-6 sm:px-8 md:px-10 lg:px-16 py-10 md:py-12 min-h-screen overflow-y-auto">
        <div className="flex items-center gap-2 mb-7 md:hidden">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl flex items-center justify-center shadow">
            <span className="text-xl">🧸</span>
          </div>
          <span
            className="font-black text-xl text-orange-600"
            style={{ fontFamily: "'Fredoka One', cursive" }}
          >
            ToyStore
          </span>
        </div>

        <div className="w-full max-w-2xl mx-auto">
          <div className="mb-7">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles size={18} className="text-orange-400" />
              <span className="text-xs font-bold text-orange-500 uppercase tracking-widest">
                Welcome
              </span>
            </div>

            <h1
              className="text-2xl sm:text-3xl font-black text-gray-900 leading-tight"
              style={{ fontFamily: "'Fredoka One', cursive" }}
            >
              {current.title}
            </h1>

            <p className="text-sm text-gray-500 mt-1">{current.desc}</p>
          </div>

          <div className="auth-form-wrap" key={view}>
            {view === 'user-login' && (
              <UserLoginForm
                onSwitchToUserRegister={() => setView('user-register')}
                onSwitchToSellerRegister={() => setView('seller-register')}
                onSwitchToSellerLogin={() => setView('seller-login')}
                onSwitchToAdminLogin={() => setView('admin-login')}
              />
            )}

            {view === 'user-register' && (
              <UserRegisterForm
                onSwitchToUserLogin={() => setView('user-login')}
              />
            )}

            {view === 'seller-login' && (
              <SellerLoginForm
                onSwitchToSellerRegister={() => setView('seller-register')}
                onSwitchToUserLogin={() => setView('user-login')}
                onSwitchToAdminLogin={() => setView('admin-login')}
              />
            )}

            {view === 'seller-register' && (
              <SellerRegisterForm
                onSwitchToSellerLogin={() => setView('seller-login')}
                onSwitchToUserLogin={() => setView('user-login')}
              />
            )}

            {view === 'admin-login' && (
               <AdminLoginForm
                 onSwitchToUserLogin={() => setView('user-login')}
               />
            )}
          </div>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka+One&display=swap');

        .auth-page-root {
          background: linear-gradient(135deg, #fff7ed 0%, #ffedd5 40%, #fed7aa 100%);
        }

        .auth-blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(60px);
          pointer-events: none;
          z-index: 0;
        }

        .auth-blob-1 {
          width: 500px;
          height: 500px;
          background: rgba(251,146,60,0.18);
          top: -120px;
          left: -120px;
          animation: blobDrift 10s ease-in-out infinite;
        }

        .auth-blob-2 {
          width: 400px;
          height: 400px;
          background: rgba(249,115,22,0.13);
          bottom: -100px;
          right: -80px;
          animation: blobDrift 13s ease-in-out infinite reverse;
        }

        .auth-blob-3 {
          width: 300px;
          height: 300px;
          background: rgba(253,186,116,0.2);
          top: 40%;
          left: 40%;
          animation: blobDrift 8s ease-in-out infinite 2s;
        }

        @keyframes blobDrift {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(30px, 20px) scale(1.07); }
        }

        .auth-left {
          background: linear-gradient(145deg, #f97316 0%, #ea580c 55%, #c2410c 100%);
          z-index: 1;
        }

        .auth-float {
          animation: toyFloat 4s ease-in-out infinite;
        }

        @keyframes toyFloat {
          0%, 100% { transform: translateY(0px) rotate(-3deg); }
          50% { transform: translateY(-12px) rotate(3deg); }
        }

        .auth-input {
          width: 100%;
          padding: 0.625rem 0.875rem;
          border: 2px solid #e5e7eb;
          border-radius: 0.75rem;
          font-size: 0.875rem;
          background: #fafafa;
          transition: all 0.2s;
          outline: none;
          color: #1f2937;
        }

        .auth-input:focus {
          border-color: #f97316;
          background: #fff;
          box-shadow: 0 0 0 3px rgba(249,115,22,0.15);
        }

        .auth-input::placeholder {
          color: #9ca3af;
        }

        .auth-btn-primary {
          width: 100%;
          padding: 0.75rem 1.5rem;
          background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
          color: white;
          font-weight: 700;
          font-size: 0.9375rem;
          border-radius: 0.875rem;
          border: none;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 4px 14px rgba(249,115,22,0.35);
        }

        .auth-btn-primary:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(249,115,22,0.45);
        }

        .auth-btn-primary:active:not(:disabled) {
          transform: translateY(0);
        }

        .auth-btn-primary:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .auth-form-wrap {
          animation: formSlide 0.3s ease-out;
        }

        @keyframes formSlide {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 767px) {
          .auth-page-root {
            min-height: 100vh;
          }
        }
      `}</style>
    </div>
  );
}