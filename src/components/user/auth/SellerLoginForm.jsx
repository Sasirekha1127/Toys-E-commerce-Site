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

export default function SellerLoginForm({
  onSwitchToUser,
  onSwitchToSellerRegister,
  onSwitchToUserLogin,
  onSwitchToAdminLogin,
}) {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const set = (k, v) => {
    setForm((prev) => ({ ...prev, [k]: v }));
    if (errors[k] || errors.general) {
      setErrors((prev) => ({ ...prev, [k]: '', general: '' }));
    }
  };

  const validate = () => {
    const err = {};
    if (!form.email.trim()) err.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) err.email = 'Enter a valid email';

    if (!form.password) err.password = 'Password is required';

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
      const res = await fetch('http://localhost:5000/api/auth/seller/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.email.trim(),
          password: form.password,
        }),
      });

      const data = await res.json();
      setLoading(false);

      if (!res.ok || data.error) {
        setErrors({ general: data.error || 'Login failed' });
        return;
      }

      const matched = data.user || {};
      const sellerEmail = matched.email?.toLowerCase?.() || '';
      const pendingSellerEmail =
        localStorage.getItem('toyNewSellerPendingOnboarding')?.toLowerCase?.() || '';

      // only newly registered seller should see onboarding
      const isPendingNewSeller =
        !!pendingSellerEmail &&
        !!sellerEmail &&
        pendingSellerEmail === sellerEmail;

      // backend value OR local saved value
      const savedSeller = JSON.parse(localStorage.getItem('toyCurrentSeller') || 'null');
      const alreadyCompleted =
        matched.onboardingCompleted === true ||
        savedSeller?.onboardingCompleted === true;

      const shouldShowOnboarding = isPendingNewSeller && !alreadyCompleted;

      const currentSellerData = {
        ...matched,
        password: form.password, // Carry password for onboarding pre-fill
        onboardingCompleted: (alreadyCompleted || !isPendingNewSeller) ? true : false,
      };

      localStorage.setItem('toyCurrentSeller', JSON.stringify(currentSellerData));
      localStorage.setItem('authToken', data.token);

      if (shouldShowOnboarding) {
        navigate('/seller/onboarding');
      } else {
        // if old user or already completed, clear pending key
        localStorage.removeItem('toyNewSellerPendingOnboarding');

        // if they are an old user but backend says false, update backend in background
        if (!isPendingNewSeller && matched.onboardingCompleted === false) {
          fetch('http://localhost:5000/api/auth/seller/onboarding/complete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ seller_id: matched.id || matched.seller_id }),
          }).catch(err => console.error('Silent onboarding completion failed:', err));
        }

        navigate('/seller');
      }
    } catch (err) {
      setLoading(false);
      setErrors({ general: 'Server error. Please try again.' });
      console.error('Seller login error:', err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      <Field label="Email Address" error={errors.email}>
        <input
          type="email"
          value={form.email}
          onChange={(e) => set('email', e.target.value)}
          placeholder="seller@example.com"
          className="auth-input"
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
            className="auth-input pr-11"
            style={errors.password ? { borderColor: '#f87171', background: '#fff5f5' } : {}}
          />
          <button
            type="button"
            onClick={() => setShowPass((s) => !s)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-orange-500 transition-colors text-xs font-semibold"
          >
            {showPass ? 'Hide' : 'Show'}
          </button>
        </div>
      </Field>

      {errors.general && (
        <p className="text-sm text-red-500 font-medium text-center">{errors.general}</p>
      )}

      <button type="submit" disabled={loading} className="auth-btn-primary">
        {loading ? 'Signing in…' : 'Sign In to Seller Dashboard 🏪'}
      </button>

      <div className="pt-1 text-center space-y-2">
        <button
          type="button"
          onClick={() => (onSwitchToSellerRegister || (() => navigate('/seller/register')))()}
          className="block w-full text-sm font-semibold text-orange-600 hover:text-orange-700 transition"
        >
          Create New Seller Account
        </button>

        <button
          type="button"
          onClick={() => (onSwitchToUser || onSwitchToUserLogin || (() => { }))()}
          className="block w-full text-sm font-semibold text-gray-500 hover:text-orange-600 transition"
        >
          ← Back to User Login
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