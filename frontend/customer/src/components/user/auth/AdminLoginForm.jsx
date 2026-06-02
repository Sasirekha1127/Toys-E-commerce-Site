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

export default function AdminLoginForm({ onSwitchToUserLogin }) {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: '',
    password: '',
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

    setLoading(true);

    fetch('http://localhost:5000/api/auth/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: form.email.trim(),
        password: form.password,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        setLoading(false);
        if (data.error) {
          setErrors({ general: data.error });
        } else {
          localStorage.setItem('toyCurrentUser', JSON.stringify(data.user));
          localStorage.setItem('authToken', data.token);
          navigate('/admin');
        }
      })
      .catch((err) => {
        setLoading(false);
        setErrors({ general: 'Server error. Please try again later.' });
        console.error('Admin login error:', err);
      });
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <Field label="Admin Email Address" error={errors.email}>
          <input
            type="email"
            value={form.email}
            onChange={(e) => set('email', e.target.value)}
            placeholder="admin@example.com"
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
          className="auth-btn-primary"
        >
          {loading ? 'Signing in…' : 'Sign In to Admin Dashboard ⚙️'}
        </button>

        <div className="pt-2 text-center">
          <button
            type="button"
            onClick={onSwitchToUserLogin}
            className="text-sm font-semibold text-gray-500 hover:text-orange-600 transition"
          >
            ← Back to User Login
          </button>
        </div>
      </form>
    </>
  );
}     