import React, { useState, useMemo } from 'react';

const IconEye = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);

const IconEyeOff = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/>
    <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/>
    <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/>
    <line x1="2" y1="2" x2="22" y2="22"/>
  </svg>
);

const IconCheck = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
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
    style={{ animation: 'uf-spin 0.8s linear infinite', display: 'block' }}
  >
    <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
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
        onClick={() => setShow((s) => !s)}
        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-orange-500 transition-colors"
      >
        {show ? <IconEyeOff /> : <IconEye />}
      </button>
    </div>
  );
}

function StrengthMeter({ password }) {
  const checks = useMemo(() => ({
    length: password.length >= 8,
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    symbol: /[^A-Za-z0-9]/.test(password),
  }), [password]);

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

export default function UserRegisterForm({ onSwitchToUserLogin }) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirm: '',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const set = (k, v) => {
    setForm((f) => ({ ...f, [k]: v }));
    if (errors[k]) setErrors((e) => ({ ...e, [k]: '' }));
  };

  const validate = () => {
    const e = {};

    if (!form.name.trim()) e.name = 'Full name is required';
    else if (form.name.trim().length < 2) e.name = 'Name must be at least 2 characters';

    if (!form.email.trim()) e.email = 'Email address is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Please enter a valid email';

    if (!form.password) e.password = 'Password is required';
    else if (form.password.length < 8) e.password = 'Minimum 8 characters required';

    if (!form.confirm) e.confirm = 'Please confirm your password';
    else if (form.confirm !== form.password) e.confirm = 'Passwords do not match';

    return e;
  };

  const handleSubmit = (ev) => {
    ev.preventDefault();

    const e = validate();
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }

    setLoading(true);

    fetch('http://localhost:5000/api/auth/user/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
      }),
    })
      .then(res => res.json())
      .then(data => {
        setLoading(false);
        if (data.error) {
          setErrors({ email: data.error });
        } else {
          setDone(true);
        }
      })
      .catch(err => {
        setLoading(false);
        setErrors({ email: 'Server error. Please try again later.' });
        console.error('Registration error:', err);
      });
  };

  const confirmOk = form.confirm && form.confirm === form.password;

  if (done) {
    return (
      <div className="text-center py-10 space-y-3" style={{ animation: 'uf-fadein 0.4s ease' }}>
        <div style={{ fontSize: 52 }}>🎊</div>
        <p className="text-xl font-bold text-gray-800">Account Created!</p>
        <p className="text-sm text-gray-500">
          Welcome to ToyStore, <strong>{form.name.split(' ')[0]}</strong>!
        </p>
        <button
          onClick={onSwitchToUserLogin}
          className="auth-btn-primary mt-4"
          style={{ display: 'inline-block', width: 'auto', padding: '0.625rem 1.5rem' }}
        >
          Sign In Now →
        </button>
      </div>
    );
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <Field label="Full Name" error={errors.name}>
          <input
            type="text"
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
            placeholder="Enter your full name"
            className="auth-input"
            style={errors.name ? { borderColor: '#f87171', background: '#fff5f5' } : {}}
          />
        </Field>

        <Field label="Email Address" error={errors.email}>
          <input
            type="email"
            value={form.email}
            onChange={(e) => set('email', e.target.value)}
            placeholder="you@example.com"
            className="auth-input"
            style={errors.email ? { borderColor: '#f87171', background: '#fff5f5' } : {}}
          />
        </Field>

        <Field label="Password" error={errors.password}>
          <PasswordInput
            value={form.password}
            onChange={(e) => set('password', e.target.value)}
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
            onChange={(e) => set('confirm', e.target.value)}
            placeholder="Re-enter your password"
            hasError={!!errors.confirm}
          />
        </Field>

        <button type="submit" disabled={loading} className="auth-btn-primary">
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <IconSpinner /> Creating account…
            </span>
          ) : (
            'Create My Account 🎉'
          )}
        </button>

        <div className="pt-1 text-center">
          <button
            type="button"
            onClick={onSwitchToUserLogin}
            className="block w-full text-sm font-semibold text-gray-500 hover:text-orange-600 transition"
          >
            ← Back to Sign In
          </button>
        </div>
      </form>

      <style>{`
        @keyframes uf-spin { to { transform: rotate(360deg); } }
        @keyframes uf-fadein {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
}