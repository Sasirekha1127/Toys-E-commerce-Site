import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../../hooks/useStore';
import defaultUsers from '../../../data/user/user';
import { sendLoginEmail } from '../../../utils/emailService';

function Field({ label, error, children }) {
  return (
    <div className="space-y-1.5">
      {label && <label className="text-sm font-semibold text-gray-700">{label}</label>}
      {children}
      {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
    </div>
  );
}

export default function UserLoginForm({
  onSwitchToSellerLogin,
  onSwitchToSellerRegister,
  onSwitchToUserRegister,
  onSwitchToAdminLogin,
}) {
  const { login } = useStore();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState({});
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const set = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));

    if (errors[key] || errors.general) {
      setErrors((prev) => ({ ...prev, [key]: '', general: '' }));
    }
  };

  const validate = () => {
    const err = {};

    if (!form.email.trim()) {
      err.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      err.email = 'Enter a valid email';
    }

    if (!form.password) {
      err.password = 'Password is required';
    }

    return err;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const err = validate();
    if (Object.keys(err).length) {
      setErrors(err);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/auth/user/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.email.trim(),
          password: form.password,
        }),
      });
      const data = await response.json();
      setLoading(false);

      if (data.error) {
        setErrors({ general: data.error });
      } else {
        localStorage.setItem('authToken', data.token);
        const user = data.user;

        if (user.role === 'admin') {
          login(user, 'admin');
          navigate('/admin');
        } else if (user.role === 'seller') {
          const sellerEmail = user.email?.toLowerCase?.() || '';
          const pendingSellerEmail = localStorage.getItem('toyNewSellerPendingOnboarding')?.toLowerCase?.() || '';
          const isPendingNewSeller = !!pendingSellerEmail && !!sellerEmail && pendingSellerEmail === sellerEmail;
          const forceOnboarded = !isPendingNewSeller;

          const currentSellerData = {
            ...user,
            onboardingCompleted: forceOnboarded || user.onboardingCompleted === true,
          };

          login(currentSellerData, 'seller');

          if (!forceOnboarded && user.onboardingCompleted === false) {
            navigate('/seller/onboarding');
          } else {
            localStorage.removeItem('toyNewSellerPendingOnboarding');
            if (forceOnboarded && user.onboardingCompleted === false) {
              fetch('http://localhost:5000/api/auth/seller/onboarding/complete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ seller_id: user.id || user.seller_id }),
              }).catch(err => console.error('Silent onboarding completion failed:', err));
            }
            navigate('/seller');
          }
        } else {
          login(user, 'user');
          try {
            await sendLoginEmail(user);
          } catch (error) {
            console.warn("Login email failed:", error);
          }
          navigate('/home');
        }
      }
    } catch (err) {
      setLoading(false);
      setErrors({ general: 'Server error. Please try again.' });
      console.error('Login error:', err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      <Field label="Email Address" error={errors.email}>
        <input
          type="email"
          value={form.email}
          onChange={(e) => set('email', e.target.value)}
          placeholder="you@example.com"
          className="auth-input"
        />
      </Field>

      <Field label="Password" error={errors.password}>
        <div className="relative">
          <input
            type={showPass ? 'text' : 'password'}
            value={form.password}
            onChange={(e) => set('password', e.target.value)}
            placeholder="••••••••"
            className="auth-input pr-11"
          />
          <button
            type="button"
            onClick={() => setShowPass((prev) => !prev)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-orange-500 text-xs font-semibold"
          >
            {showPass ? 'Hide' : 'Show'}
          </button>
        </div>
      </Field>

      {errors.general && (
        <p className="text-sm text-red-500 text-center">{errors.general}</p>
      )}

      <button type="submit" disabled={loading} className="auth-btn-primary">
        {loading ? 'Signing in…' : 'Sign In to ToyStore 🛒'}
      </button>

      <div className="pt-1 text-center space-y-2">
        <button
          type="button"
          onClick={onSwitchToUserRegister}
          className="block w-full text-sm font-semibold text-orange-600"
        >
          Create User Account
        </button>

        <button  
          type="button"
          onClick={onSwitchToSellerRegister}
          className="block w-full text-sm font-semibold text-gray-500 hover:text-orange-600 transition"
        >
          Seller Register
        </button>

        <button
          type="button"
          onClick={onSwitchToAdminLogin}
          className="block w-full text-sm font-semibold text-gray-400 hover:text-orange-600 transition"
        >
          Admin Login
        </button>
      </div>
    </form>
  );
}