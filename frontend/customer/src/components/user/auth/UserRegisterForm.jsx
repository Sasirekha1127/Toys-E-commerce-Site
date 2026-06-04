import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../../hooks/useStore';

function IconSpinner() {
  return (
    <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

function Field({ label, error, success, children }) {
  return (
    <div className="flex flex-col gap-1 text-left relative">
      <label className="text-sm font-bold text-gray-700 ml-1">{label}</label>
      {children}
      {error && (
        <p className="text-xs text-red-500 font-medium ml-1 animate-in fade-in slide-in-from-top-1">
          {error}
        </p>
      )}
      {success && !error && (
        <p className="text-xs text-green-600 font-medium ml-1 flex items-center gap-1">
          {success}
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
        className="auth-input pr-10"
        style={hasError ? { borderColor: '#f87171', background: '#fff5f5' } : {}}
      />
      <button
        type="button"
        onClick={() => setShow(!show)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-orange-500"
      >
        {show ? 'Hide' : 'Show'}
      </button>
    </div>
  );
}

function StrengthMeter({ password }) {
  if (!password) return null;

  let strength = 0;
  if (password.length > 5) strength += 1;
  if (password.length > 7) strength += 1;
  if (/[A-Z]/.test(password) && /[0-9]/.test(password)) strength += 1;
  if (/[^A-Za-z0-9]/.test(password)) strength += 1;

  const getStyle = () => {
    if (strength === 0) return { w: '25%', c: 'bg-red-400', txt: 'Weak' };
    if (strength === 1 || strength === 2) return { w: '50%', c: 'bg-amber-400', txt: 'Fair' };
    if (strength === 3) return { w: '75%', c: 'bg-blue-400', txt: 'Good' };
    return { w: '100%', c: 'bg-green-500', txt: 'Strong' };
  };

  const s = getStyle();

  return (
    <div className="mt-1.5 px-1 flex items-center justify-between gap-3">
      <div className="h-1.5 flex-1 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full ${s.c} transition-all duration-300`} style={{ width: s.w }} />
      </div>
      <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400">
        {s.txt}
      </span>
    </div>
  );
}

export default function UserRegisterForm({ onSwitchToUserLogin }) {
  const navigate = useNavigate();
  const { login } = useStore();
  const [form, setForm] = useState({
    name: '',
    phone: '',
    profilePic: '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    pincode: '',
    country: '',
    dob: '',
    gender: '',
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

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 800;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
          set('profilePic', compressedBase64);
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const safeTrim = (val) => (val || '').trim();

  const validate = () => {
    const e = {};

    const safeTrim = (val) => (typeof val === 'string' ? val.trim() : '');

    if (!safeTrim(form.name)) e.name = 'Full name is required';
    else if (safeTrim(form.name).length < 2) e.name = 'Name must be at least 2 characters';

    if (!safeTrim(form.phone)) e.phone = 'Phone number is required';

    if (!safeTrim(form.address1)) e.address1 = 'Address Line 1 is required';
    if (!safeTrim(form.city)) e.city = 'City is required';
    if (!safeTrim(form.state)) e.state = 'State is required';
    
    const pin = safeTrim(form.pincode);
    if (!pin) e.pincode = 'Pincode is required';
    else if (!/^\d+$/.test(pin)) e.pincode = 'Pincode must be numbers only';
    
    if (!safeTrim(form.country)) e.country = 'Country is required';

    if (!form.dob) e.dob = 'Date of birth is required';
    if (!form.gender) e.gender = 'Please select gender';

    const email = safeTrim(form.email);
    if (!email) e.email = 'Email address is required';
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = 'Please enter a valid email';

    const pwd = safeTrim(form.password);
    const conf = safeTrim(form.confirm);

    if (!pwd) e.password = 'Password is required';
    else if (pwd.length < 8) e.password = 'Minimum 8 characters required';

    if (!conf) e.confirm = 'Please confirm your password';
    else if (conf !== pwd) e.confirm = 'Passwords do not match';

    return e;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    console.log("---------- REGISTER START ----------");

    try {
      const e = validate();
      if (Object.keys(e).length) {
        console.warn("Validation failed:", e);
        setErrors(e);
        return;
      }

      setLoading(true);

      const payload = {
        name: safeTrim(form.name),
        phone: safeTrim(form.phone),
        profilePic: form.profilePic,
        address1: safeTrim(form.address1),
        address2: safeTrim(form.address2),
        city: safeTrim(form.city),
        state: safeTrim(form.state),
        pincode: safeTrim(form.pincode),
        country: safeTrim(form.country),
        dob: form.dob,
        gender: form.gender,
        email: safeTrim(form.email),
        password: form.password,
      };

      console.log("Payload compiled successfully. Sending to API:", payload);

      const res = await fetch('http://localhost:5000/api/auth/user/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      setLoading(false);

      if (!res.ok || data.error) {
        console.error("API Error during register:", data);
        setErrors({ email: data.error || data.details || 'Registration failed' });
      } else {
        console.log("Registration API returned Success! Logging user in...", data);
        if (data.token && data.user) {
           localStorage.setItem('authToken', data.token);
           login(data.user, 'user');
           navigate('/home');
        } else {
           setDone(true);
        }
      }
    } catch (err) {
      setLoading(false);
      console.error('Frontend Catch Error:', err);
      setErrors({ email: 'Server error or crash during submission. Details: ' + err.message });
    }
  };

  const confirmOk = form.confirm && form.confirm.trim() === form.password.trim();

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
        <div className="flex flex-col items-center gap-4 py-2">
          <div className="relative group">
            <div className="w-24 h-24 rounded-full border-2 border-orange-200 bg-orange-50 flex items-center justify-center overflow-hidden shadow-sm transition-all group-hover:border-orange-400">
              {form.profilePic ? (
                <img src={form.profilePic} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <svg className="w-12 h-12 text-orange-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              )}
            </div>
            <label className="absolute bottom-0 right-0 w-8 h-8 bg-orange-500 rounded-full border-2 border-white flex items-center justify-center cursor-pointer shadow-md hover:bg-orange-600 transition-colors">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
            </label>
          </div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest italic">Upload Profile Picture</p>
        </div>

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

        <Field label="Phone Number" error={errors.phone}>
          <input
            type="tel"
            value={form.phone}
            onChange={(e) => set('phone', e.target.value)}
            placeholder="Enter your phone number"
            className="auth-input"
            style={errors.phone ? { borderColor: '#f87171', background: '#fff5f5' } : {}}
          />
        </Field>
        
        <Field label="Date of Birth" error={errors.dob}>
          <input
            type="date"
            value={form.dob}
            onChange={(e) => set('dob', e.target.value)}
            className="auth-input"
            style={errors.dob ? { borderColor: '#f87171', background: '#fff5f5' } : {}}
          />
        </Field>

        <Field label="Gender" error={errors.gender}>
          <select
            value={form.gender}
            onChange={(e) => set('gender', e.target.value)}
            className="auth-input"
            style={errors.gender ? { borderColor: '#f87171', background: '#fff5f5' } : {}}
          >
            <option value="">Select gender</option>
            <option value="Female">Female</option>
            <option value="Male">Male</option>
            <option value="Other">Other</option>
          </select>
        </Field>

        <Field label="Address Line 1" error={errors.address1}>
          <input type="text" value={form.address1} onChange={(e) => set('address1', e.target.value)} placeholder="Flat, House no., Building, Apartment" className="auth-input" style={errors.address1 ? { borderColor: '#f87171', background: '#fff5f5' } : {}} />
        </Field>

        <Field label="Address Line 2 (Optional)" error={errors.address2}>
          <input type="text" value={form.address2} onChange={(e) => set('address2', e.target.value)} placeholder="Area, Street, Sector, Village" className="auth-input" style={errors.address2 ? { borderColor: '#f87171', background: '#fff5f5' } : {}} />
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="City" error={errors.city}>
            <input type="text" value={form.city} onChange={(e) => set('city', e.target.value)} placeholder="City" className="auth-input" style={errors.city ? { borderColor: '#f87171', background: '#fff5f5' } : {}} />
          </Field>
          <Field label="State" error={errors.state}>
            <input type="text" value={form.state} onChange={(e) => set('state', e.target.value)} placeholder="State" className="auth-input" style={errors.state ? { borderColor: '#f87171', background: '#fff5f5' } : {}} />
          </Field>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Pincode" error={errors.pincode}>
            <input type="text" value={form.pincode} onChange={(e) => set('pincode', e.target.value)} placeholder="Pincode" className="auth-input" style={errors.pincode ? { borderColor: '#f87171', background: '#fff5f5' } : {}} />
          </Field>
          <Field label="Country" error={errors.country}>
            <input type="text" value={form.country} onChange={(e) => set('country', e.target.value)} placeholder="Country" className="auth-input" style={errors.country ? { borderColor: '#f87171', background: '#fff5f5' } : {}} />
          </Field>
        </div>

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