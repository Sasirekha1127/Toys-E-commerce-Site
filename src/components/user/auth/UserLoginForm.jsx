import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import defaultUsers from '../../../data/user/user';

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
}) {
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

  const handleSubmit = (e) => {
    e.preventDefault();

    const err = validate();
    if (Object.keys(err).length) {
      setErrors(err);
      return;
    }

    setLoading(true);

    fetch('http://localhost:5000/api/auth/user/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: form.email.trim(),
        password: form.password,
      }),
    })
      .then(res => res.json())
      .then(data => {
        setLoading(false);
        if (data.error) {
          setErrors({ general: data.error });
        } else {
          localStorage.setItem('authToken', data.token);
          const user = data.user;

          if (user.role === 'admin') {
            localStorage.removeItem('toyCurrentSeller');
            localStorage.setItem('toyCurrentUser', JSON.stringify(user));
            navigate('/admin');
          } else if (user.role === 'seller') {
            localStorage.removeItem('toyCurrentUser');
            
            const sellerEmail = user.email?.toLowerCase?.() || '';
            const pendingSellerEmail = localStorage.getItem('toyNewSellerPendingOnboarding')?.toLowerCase?.() || '';
            
            // newly registered seller in this browser?
            const isPendingNewSeller = !!pendingSellerEmail && !!sellerEmail && pendingSellerEmail === sellerEmail;
            
            // if NOT a new pending seller, we treat them as already onboarded (existing user)
            const forceOnboarded = !isPendingNewSeller;
            
            const currentSellerData = {
              ...user,
              onboardingCompleted: forceOnboarded || user.onboardingCompleted === true,
            };

            localStorage.setItem('toyCurrentSeller', JSON.stringify(currentSellerData));

            if (!forceOnboarded && user.onboardingCompleted === false) {
              navigate('/seller/onboarding');
            } else {
              // clear pending key for existing/old users
              localStorage.removeItem('toyNewSellerPendingOnboarding');

              // sync to DB if they were an old user who wasn't marked complete
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
            localStorage.removeItem('toyCurrentSeller');
            localStorage.setItem('toyCurrentUser', JSON.stringify(user));
            navigate('/home');
          }
        }
      })
      .catch(err => {
        setLoading(false);
        setErrors({ general: 'Server error. Please try again.' });
        console.error('Login error:', err);
      });
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
      </div>
    </form>
  );
}