import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

const IconEye = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const IconEyeOff = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
    <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
    <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
    <line x1="2" y1="2" x2="22" y2="22" />
  </svg>
);

const IconCheck = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const IconSpinner = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    style={{ animation: 'rf-spin 0.8s linear infinite', display: 'block' }}
  >
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);

function Field({ label, error, success, children }) {
  return (
    <div className="space-y-1.5">
      {label && <label className="block text-sm font-semibold text-gray-700">{label}</label>}
      {children}
      {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
      {!error && success && (
        <p className="text-xs text-green-600 font-medium flex items-center gap-1">
          <IconCheck /> {success}
        </p>
      )}
    </div>
  );
}

function PasswordInput({ value, onChange, placeholder, hasError }) {
  const [show, setShow] = useState(false);

  return (
    <div className="relative">
      <input
        type={show ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="auth-input pr-11"
        style={hasError ? { borderColor: '#f87171', background: '#fff5f5' } : {}}
      />
      <button
        type="button"
        onClick={() => setShow(s => !s)}
        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-orange-500 transition-colors"
      >
        {show ? <IconEyeOff /> : <IconEye />}
      </button>
    </div>
  );
}

function StrengthMeter({ password }) {
  const checks = useMemo(
    () => ({
      length: password.length >= 8,
      upper: /[A-Z]/.test(password),
      lower: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      symbol: /[^A-Za-z0-9]/.test(password),
    }),
    [password]
  );

  if (!password) return null;

  return (
    <div className="mt-2 space-y-1 text-xs">
      <p className={checks.length ? 'text-green-500' : 'text-gray-400'}>• Minimum 8 characters</p>
      <p className={checks.upper ? 'text-green-500' : 'text-gray-400'}>• One uppercase letter</p>
      <p className={checks.lower ? 'text-green-500' : 'text-gray-400'}>• One lowercase letter</p>
      <p className={checks.number ? 'text-green-500' : 'text-gray-400'}>• One number</p>
      <p className={checks.symbol ? 'text-green-500' : 'text-gray-400'}>• One special character</p>
    </div>
  );
}

export default function SellerRegisterForm({ onSwitchToUserLogin, onSwitchToSellerLogin }) {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: '',
    password: '',
    confirm: '',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const set = (k, v) => {
    setForm(f => ({ ...f, [k]: v }));
    if (errors[k]) setErrors(e => ({ ...e, [k]: '' }));
  };

  const validate = () => {
    const e = {};

    if (!form.email.trim()) e.email = 'Email address is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Please enter a valid email';

    if (!form.password) e.password = 'Password is required';
    else if (form.password.length < 8) e.password = 'Minimum 8 characters required';

    if (!form.confirm) e.confirm = 'Please confirm your password';
    else if (form.confirm !== form.password) e.confirm = 'Passwords do not match';

    return e;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();

    const e = validate();
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('http://localhost:5000/api/auth/seller/register', {
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
        setErrors({ email: data.error || 'Registration failed' });
        return;
      }

      // Mark only newly registered seller for onboarding
      localStorage.setItem('toyNewSellerPendingOnboarding', form.email.toLowerCase());
      alert('Seller account created successfully! Please login to continue.');

      if (onSwitchToSellerLogin) {
        onSwitchToSellerLogin();
      } else {
        navigate('/seller/login');
      }
    } catch (err) {
      setLoading(false);
      setErrors({ email: 'Server error. Please try again later.' });
      console.error('Seller registration error:', err);
    }
  };

  const confirmOk = form.confirm && form.confirm === form.password;

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <Field label="Email Address" error={errors.email}>
          <input
            type="email"
            value={form.email}
            onChange={e => set('email', e.target.value)}
            placeholder="seller@example.com"
            className="auth-input"
            style={errors.email ? { borderColor: '#f87171', background: '#fff5f5' } : {}}
          />
        </Field>

        <Field label="Password" error={errors.password}>
          <PasswordInput
            value={form.password}
            onChange={e => set('password', e.target.value)}
            placeholder="Create a strong password"
            hasError={!!errors.password}
          />
          <StrengthMeter password={form.password} />
        </Field>

        <Field
          label="Confirm Password"
          error={errors.confirm}
          success={confirmOk ? 'Passwords match' : ''}
        >
          <PasswordInput
            value={form.confirm}
            onChange={e => set('confirm', e.target.value)}
            placeholder="Re-enter your password"
            hasError={!!errors.confirm}
          />
        </Field>

        <button type="submit" disabled={loading} className="auth-btn-primary">
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <IconSpinner /> Creating seller account…
            </span>
          ) : (
            'Create Seller Account 🏪'
          )}
        </button>

        <div className="pt-1 text-center space-y-2">
          <button
            type="button"
            onClick={onSwitchToSellerLogin || (() => navigate('/seller/login'))}
            className="block w-full text-sm font-semibold text-orange-600 hover:text-orange-700 transition"
          >
            Go to Seller Login
          </button>

          <button
            type="button"
            onClick={onSwitchToUserLogin}
            className="block w-full text-sm font-semibold text-gray-500 hover:text-orange-600 transition"
          >
            ← Back to User Login
          </button>
        </div>
      </form>

      <style>{`
        @keyframes rf-spin { to { transform: rotate(360deg); } }
      `}</style>
    </>
  );
}