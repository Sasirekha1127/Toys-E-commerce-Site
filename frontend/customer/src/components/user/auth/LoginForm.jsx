import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Field({ label, error, children }) {
  return (
    <div className="space-y-1.5">
      {label && <label className="text-sm font-semibold text-gray-700">{label}</label>}
      {children}
      {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
    </div>
  );
}

export default function LoginForm({ onSwitch }) {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: '',
    password: '',
    remember: false,
  });

  const [errors, setErrors] = useState({});
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const set = (k, v) => {
    setForm(prev => ({ ...prev, [k]: v }));
    if (errors[k] || errors.general) {
      setErrors(prev => ({ ...prev, [k]: '', general: '' }));
    }
  };

  const validate = () => {
    const err = {};

    if (!form.email.trim()) {
      err.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      err.email = 'Enter valid email';
    }

    if (!form.password) {
      err.password = 'Password is required';
    }

    return err;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const err = validate();
    if (Object.keys(err).length) {
      setErrors(err);
      return;
    }

    const users = JSON.parse(localStorage.getItem('toyUsers') || '[]');

    const matchedUser = users.find(
      (u) =>
        u.email.toLowerCase() === form.email.trim().toLowerCase() &&
        u.password === form.password
    );

    if (!matchedUser) {
      setErrors({ general: 'Invalid email or password' });
      return;
    }

    setLoading(true);

    setTimeout(() => {
      const sessionUser = {
        name: matchedUser.name,
        email: matchedUser.email,
      };

      localStorage.setItem('toyCurrentUser', JSON.stringify(sessionUser));
      setLoading(false);
      navigate('/home');
    }, 1000);
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <Field label="Email Address" error={errors.email}>
          <input
            type="email"
            value={form.email}
            onChange={(e) => set('email', e.target.value)}
            placeholder="you@example.com"
            className="lf-input"
            style={errors.email ? { borderColor: '#f87171', background: '#fff5f5' } : {}}
          />
        </Field>

        <Field label="Password" error={errors.password}>
          <div className="relative">
            <input
              type={showPass ? 'text' : 'password'}
              value={form.password}
              onChange={(e) => set('password', e.target.value)}
              placeholder="••••••••"
              className="lf-input pr-11"
              style={errors.password ? { borderColor: '#f87171', background: '#fff5f5' } : {}}
            />
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-orange-500 transition-colors"
            >
              {showPass ? 'Hide' : 'Show'}
            </button>
          </div>
        </Field>

        {errors.general && (
          <p className="text-sm text-red-500 font-medium text-center">
            {errors.general}
          </p>
        )}


        <button
          type="submit"
          disabled={loading}
          className="lf-btn-primary w-full"
        >
          {loading ? 'Signing in…' : 'Sign In to ToyStore 🛒'}
        </button>

        <p className="text-center text-sm text-gray-500">
          New to ToyStore?{' '}
          <button
            type="button"
            onClick={onSwitch}
            className="text-orange-500 font-bold hover:text-orange-600 hover:underline transition-colors"
          >
            Create free account
          </button>
        </p>
      </form>

      <style>{`
        .lf-input {
          width: 100%;
          padding: 11px 14px;
          border-radius: 14px;
          border: 2px solid #e5e7eb;
          background: #f9fafb;
          font-size: 14px;
          color: #1f2937;
          outline: none;
          transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
          font-family: inherit;
        }

        .lf-input::placeholder {
          color: #9ca3af;
        }

        .lf-input:focus {
          border-color: #f97316;
          background: #fff;
          box-shadow: 0 0 0 4px rgba(249,115,22,0.12);
        }

        .lf-btn-primary {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 12px 20px;
          border-radius: 16px;
          border: none;
          background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
          color: #fff;
          font-weight: 700;
          font-size: 15px;
          cursor: pointer;
          transition: transform 0.15s, box-shadow 0.15s, opacity 0.2s;
          box-shadow: 0 4px 16px rgba(249,115,22,0.38);
          font-family: inherit;
        }

        .lf-btn-primary:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(249,115,22,0.45);
        }

        .lf-btn-primary:active:not(:disabled) {
          transform: translateY(0);
        }

        .lf-btn-primary:disabled {
          opacity: 0.65;
          cursor: not-allowed;
        }
      `}</style>
    </>
  );
}