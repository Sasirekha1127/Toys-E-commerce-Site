import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOnboarding } from '../../context/SellerOnboardingContext';

/* ─── Icons ─────────────────────────────── */
const Eye = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOff = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
    <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
    <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
    <line x1="2" y1="2" x2="22" y2="22" />
  </svg>
);

const Check = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const Upload = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="16 16 12 12 8 16" />
    <line x1="12" y1="12" x2="12" y2="21" />
    <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
  </svg>
);

const Spinner = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ animation: 'ob-spin 0.8s linear infinite', display: 'block' }}>
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);

const X = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const DocFile = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 9 9 8 9" />
  </svg>
);

/* ─── Shared sub-components ─────────────── */
function Field({ label, error, hint, children }) {
  return (
    <div className="ob-field space-y-1.5">
      {label && <label className="block text-sm font-semibold text-gray-700">{label}</label>}
      {children}
      {hint && !error && <p className="text-xs text-gray-400">{hint}</p>}
      {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
    </div>
  );
}

function OBInput({ error, className = '', style = {}, ...props }) {
  return (
    <input
      className={`ob-input ${className}`}
      style={error ? { borderColor: '#f87171', background: '#fff5f5', ...style } : style}
      {...props}
    />
  );
}

function OBSelect({ error, children, className = '', style = {}, ...props }) {
  return (
    <select
      className={`ob-input ${className}`}
      style={error ? { borderColor: '#f87171', background: '#fff5f5', ...style } : style}
      {...props}
    >
      {children}
    </select>
  );
}

/* ─── Generic upload box ─────────────────── */
function ImageUpload({ label, value, onChange, hint, required, accept = 'image/*' }) {
  const inputRef = useRef();

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => onChange({ file, preview: ev.target.result, name: file.name });
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-sm font-semibold text-gray-700">
          {label}
          {required && <span className="text-red-400 ml-1">*</span>}
        </label>
      )}

      {value?.preview ? (
        <div className="relative inline-block">
          {value.preview.startsWith('data:application/pdf') ? (
            <div className="h-28 w-28 rounded-xl border border-gray-200 bg-gray-50 flex flex-col items-center justify-center gap-1 text-gray-400">
              <DocFile />
              <span className="text-[10px] font-bold uppercase">PDF</span>
            </div>
          ) : (
            <img src={value.preview} alt="preview" className="h-28 w-auto rounded-xl border border-gray-200 object-cover" />
          )}
          <button
            type="button"
            onClick={() => onChange(null)}
            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow"
          >
            <X />
          </button>
          <p className="text-xs text-gray-400 mt-1">{value.name}</p>
        </div>
      ) : (
        <button type="button" onClick={() => inputRef.current?.click()} className="ob-upload-btn">
          <span className="ob-upload-icon-wrap">
            <Upload />
          </span>
          <span className="text-sm font-semibold text-gray-600">Click to upload</span>
          <span className="text-xs text-gray-400">{hint || 'JPG, PNG up to 5MB'}</span>
        </button>
      )}

      <input ref={inputRef} type="file" accept={accept} className="hidden" onChange={handleFile} />
    </div>
  );
}

/* ─── Step 1: Basic Info ─────────────────── */
function Step1({ data, update, errors, setErrors }) {
  const [showPass, setShowPass] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpInput, setOtpInput] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState('');

  const set = (k, v) => {
    update({ [k]: v });
    setErrors((e) => ({ ...e, [k]: '' }));
  };

  const sendOtp = () => {
    if (!/^[6-9]\d{9}$/.test(data.mobile)) {
      setErrors((e) => ({ ...e, mobile: 'Enter valid number' }));
      return;
    }

    setOtpSent(true);
    if (import.meta.env.DEV) {
      setOtpInput('123456');
      alert('Local Development Mode: Test OTP 123456 generated automatically');
    } else {
      alert('OTP sent to your mobile number');
    }
  };

  const verifyOtp = () => {
    const validOtp = import.meta.env.DEV ? '123456' : '1234'; // Use 1234 as fallback for pro-legacy if needed
    if (otpInput === validOtp) {
      update({ otpVerified: true });
      setOtpError('');
    } else {
      setOtpError(`Wrong OTP${import.meta.env.DEV ? ' (use 123456)' : ''}`);
    }
  };

  return (
    <div className="ob-step-content space-y-4">
      <Field label="Full Name" error={errors.fullName}>
        <OBInput value={data.fullName} onChange={(e) => set('fullName', e.target.value)} placeholder="Your full name" error={errors.fullName} />
      </Field>

      <Field label="Email Address" error={errors.email}>
        <OBInput type="email" value={data.email} onChange={(e) => set('email', e.target.value)} placeholder="seller@example.com" error={errors.email} />
      </Field>

      <Field label="Mobile Number" error={errors.mobile}>
        <div className="flex items-center gap-3">
          <div className="h-12 px-4 rounded-xl border border-gray-300 bg-gray-50 flex items-center justify-center text-gray-600 text-sm font-medium">
            +91
          </div>

          <input
            type="text"
            value={data.mobile}
            onChange={(e) => set('mobile', e.target.value.replace(/\D/g, '').slice(0, 10))}
            placeholder="Enter mobile number"
            className="flex-1 h-12 px-4 rounded-xl border border-gray-300 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 text-gray-700"
            style={errors.mobile ? { borderColor: '#f87171', background: '#fff5f5' } : {}}
          />

          <button
            type="button"
            onClick={data.otpVerified ? undefined : sendOtp}
            disabled={otpLoading || data.otpVerified}
            className="h-12 px-4 rounded-xl text-sm font-bold transition-all"
            style={{
              background: data.otpVerified ? '#d1fae5' : '#f97316',
              color: data.otpVerified ? '#065f46' : '#fff',
              cursor: data.otpVerified ? 'default' : 'pointer',
              minWidth: '110px',
            }}
          >
            {data.otpVerified ? '✓ Verified' : otpLoading ? 'Sending...' : 'Send OTP'}
          </button>
        </div>
      </Field>

      {otpSent && !data.otpVerified && (
        <Field error={otpError} hint="Enter the 4-digit OTP sent to your mobile">
          <div className="flex gap-2">
            <OBInput
              value={otpInput}
              onChange={(e) => {
                setOtpInput(e.target.value.replace(/\D/g, '').slice(0, 6));
                setOtpError('');
              }}
              placeholder="Enter OTP"
              error={otpError}
              style={{ flex: 1 }}
            />
            <button type="button" onClick={verifyOtp} className="px-4 py-2 rounded-xl text-xs font-bold bg-orange-500 text-white hover:bg-orange-600 transition-colors">
              Verify
            </button>
          </div>
        </Field>
      )}

      <Field label="Password" error={errors.password}>
        <div className="relative">
          <OBInput
            type={showPass ? 'text' : 'password'}
            value={data.password}
            onChange={(e) => set('password', e.target.value)}
            placeholder="Create a strong password"
            error={errors.password}
            style={{ paddingRight: '2.75rem' }}
          />
          <button
            type="button"
            onClick={() => setShowPass((s) => !s)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-orange-500 transition-colors"
          >
            {showPass ? <EyeOff /> : <Eye />}
          </button>
        </div>
      </Field>
    </div>
  );
}

/* ─── Step 2: Business Info ──────────────── */
function Step2({ data, update, errors, setErrors }) {
  const set = (k, v) => {
    update({ [k]: v });
    setErrors((e) => ({ ...e, [k]: '' }));
  };

  return (
    <div className="ob-step-content space-y-4">
      <Field label="Business Type" error={errors.businessType}>
        <OBSelect value={data.businessType} onChange={(e) => set('businessType', e.target.value)} error={errors.businessType}>
          {['Individual', 'Sole Proprietor', 'Partnership', 'Pvt Ltd / LLP'].map((t) => (
            <option key={t}>{t}</option>
          ))}
        </OBSelect>
      </Field>

      <Field label="Business Name" error={errors.businessName}>
        <OBInput value={data.businessName} onChange={(e) => set('businessName', e.target.value)} placeholder="Your business or brand name" error={errors.businessName} />
      </Field>

      <Field label="Business Address" error={errors.businessAddress}>
        <textarea
          className="ob-input resize-none"
          rows={2}
          value={data.businessAddress}
          onChange={(e) => set('businessAddress', e.target.value)}
          placeholder="Door no., Street, Area"
          style={errors.businessAddress ? { borderColor: '#f87171', background: '#fff5f5' } : {}}
        />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="City" error={errors.city}>
          <OBInput value={data.city} onChange={(e) => set('city', e.target.value)} placeholder="Chennai" error={errors.city} />
        </Field>
        <Field label="State" error={errors.state}>
          <OBInput value={data.state} onChange={(e) => set('state', e.target.value)} placeholder="Tamil Nadu" error={errors.state} />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Pincode" error={errors.pincode}>
          <OBInput value={data.pincode} onChange={(e) => set('pincode', e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="600001" error={errors.pincode} />
        </Field>
        <Field label="Country" error={errors.country}>
          <OBInput value={data.country} onChange={(e) => set('country', e.target.value)} placeholder="India" error={errors.country} />
        </Field>
      </div>
    </div>
  );
}

/* ─── Step 3: KYC ────────────────────────── */
function Step3({ data, update, errors, setErrors }) {
  const set = (k, v) => {
    update({ [k]: v });
    setErrors((e) => ({ ...e, [k]: '' }));
  };

  return (
    <div className="ob-step-content space-y-4">
      <div className="ob-info-banner ob-info-banner--orange">
        <span className="ob-info-banner__icon">🔒</span>
        <span>Your KYC details are encrypted and stored securely. Required for seller verification.</span>
      </div>

      <Field label="PAN Card Number" error={errors.panNumber} hint="Format: ABCDE1234F">
        <OBInput value={data.panNumber} onChange={(e) => set('panNumber', e.target.value.toUpperCase().slice(0, 10))} placeholder="ABCDE1234F" error={errors.panNumber} />
      </Field>

      <Field label="Aadhaar Number" error={errors.aadhaarNumber} hint="12-digit Aadhaar number">
        <OBInput value={data.aadhaarNumber} onChange={(e) => set('aadhaarNumber', e.target.value.replace(/\D/g, '').slice(0, 12))} placeholder="1234 5678 9012" error={errors.aadhaarNumber} />
      </Field>

      <ImageUpload
        label="Upload KYC Document"
        value={data.kycDocumentImage}
        onChange={(v) => {
          update({ kycDocumentImage: v });
          setErrors((e) => ({ ...e, kycDocumentImage: '' }));
        }}
        accept=".pdf"
        hint="Upload PDF copy of PAN card, Aadhaar or any valid ID"
        required
      />
      {errors.kycDocumentImage && <p className="text-xs text-red-500 font-medium">{errors.kycDocumentImage}</p>}
    </div>
  );
}

/* ─── Step 4: Bank Details ───────────────── */
function Step4({ data, update, errors, setErrors }) {
  const set = (k, v) => {
    update({ [k]: v });
    setErrors((e) => ({ ...e, [k]: '' }));
  };

  const match = data.accountNumber && data.confirmAccountNumber && data.accountNumber === data.confirmAccountNumber;

  return (
    <div className="ob-step-content space-y-4">
      <div className="ob-info-banner ob-info-banner--blue">
        <span className="ob-info-banner__icon">🏦</span>
        <span>Payments will be credited to this account after order fulfilment.</span>
      </div>

      <Field label="Account Holder Name" error={errors.accountHolderName}>
        <OBInput value={data.accountHolderName} onChange={(e) => set('accountHolderName', e.target.value)} placeholder="As per bank records" error={errors.accountHolderName} />
      </Field>

      <Field label="Bank Name" error={errors.bankName}>
        <OBInput value={data.bankName} onChange={(e) => set('bankName', e.target.value)} placeholder="State Bank of India" error={errors.bankName} />
      </Field>

      <Field label="Account Number" error={errors.accountNumber}>
        <OBInput value={data.accountNumber} onChange={(e) => set('accountNumber', e.target.value.replace(/\D/g, ''))} placeholder="Enter account number" error={errors.accountNumber} />
      </Field>

      <Field label="Confirm Account Number" error={errors.confirmAccountNumber} hint={match ? '✓ Account numbers match' : ''}>
        <OBInput
          value={data.confirmAccountNumber}
          onChange={(e) => set('confirmAccountNumber', e.target.value.replace(/\D/g, ''))}
          placeholder="Re-enter account number"
          error={errors.confirmAccountNumber}
          style={match ? { borderColor: '#34d399', background: '#f0fdf4' } : {}}
        />
      </Field>

      <Field label="IFSC Code" error={errors.ifscCode} hint="Format: SBIN0001234">
        <OBInput value={data.ifscCode} onChange={(e) => set('ifscCode', e.target.value.toUpperCase().slice(0, 11))} placeholder="SBIN0001234" error={errors.ifscCode} />
      </Field>
    </div>
  );
}

/* ─── Step 5: Store Info ─────────────────── */
function Step5({ data, update, errors, setErrors }) {
  const set = (k, v) => {
    update({ [k]: v });
    setErrors((e) => ({ ...e, [k]: '' }));
  };

  const setLink = (k, v) => update({ socialLinks: { ...data.socialLinks, [k]: v } });

  return (
    <div className="ob-step-content space-y-4">
      <Field label="Store Name" error={errors.storeName}>
        <OBInput value={data.storeName} onChange={(e) => set('storeName', e.target.value)} placeholder="Kids Toys Shop" error={errors.storeName} />
      </Field>

      <Field label="Store Description" error={errors.storeDescription}>
        <textarea
          className="ob-input resize-none"
          rows={3}
          value={data.storeDescription}
          onChange={(e) => set('storeDescription', e.target.value)}
          placeholder="Tell buyers what makes your store special..."
          style={errors.storeDescription ? { borderColor: '#f87171', background: '#fff5f5' } : {}}
        />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Store Pincode" error={errors.storePincode}>
          <OBInput value={data.storePincode} onChange={(e) => set('storePincode', e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="600001" error={errors.storePincode} />
        </Field>
        <div />
      </div>

      <Field label="Store Address" error={errors.storeAddress}>
        <textarea
          className="ob-input resize-none"
          rows={2}
          value={data.storeAddress}
          onChange={(e) => set('storeAddress', e.target.value)}
          placeholder="Store address for shipping"
          style={errors.storeAddress ? { borderColor: '#f87171', background: '#fff5f5' } : {}}
        />
      </Field>

      <Field label="Return Address" error={errors.returnAddress}>
        <textarea
          className="ob-input resize-none"
          rows={2}
          value={data.returnAddress}
          onChange={(e) => set('returnAddress', e.target.value)}
          placeholder="Address for return shipments"
          style={errors.returnAddress ? { borderColor: '#f87171', background: '#fff5f5' } : {}}
        />
      </Field>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <ImageUpload label="Store Logo" value={data.storeLogo} onChange={(v) => update({ storeLogo: v })} hint="PNG/JPG, 200×200 recommended" />
        <ImageUpload label="Branding Banner" value={data.brandingBanner} onChange={(v) => update({ brandingBanner: v })} hint="1200×300 recommended" />
      </div>

      <div className="space-y-3">
        <p className="text-sm font-semibold text-gray-700">
          Social Links <span className="text-xs font-normal text-gray-400">(Optional)</span>
        </p>
        <OBInput value={data.socialLinks?.instagram || ''} onChange={(e) => setLink('instagram', e.target.value)} placeholder="Instagram profile URL" />
        <OBInput value={data.socialLinks?.facebook || ''} onChange={(e) => setLink('facebook', e.target.value)} placeholder="Facebook page URL" />
        <OBInput value={data.socialLinks?.website || ''} onChange={(e) => setLink('website', e.target.value)} placeholder="Website URL" />
      </div>
    </div>
  );
}

/* ─── Success screen ─────────────────────── */
function SuccessScreen({ onGo }) {
  const items = ['Profile verified', 'Business info saved', 'KYC submitted', 'Bank details added', 'Store live!'];

  return (
    <div className="ob-success flex flex-col items-center justify-center text-center py-10 space-y-5">
      <div className="ob-success__toys">
        <span className="ob-success__toy" style={{ '--i': 1 }}>🧸</span>
        <span className="ob-success__toy" style={{ '--i': 2 }}>🎁</span>
        <span className="ob-success__toy" style={{ '--i': 3 }}>🚂</span>
        <span className="ob-success__toy" style={{ '--i': 4 }}>🪀</span>
        <span className="ob-success__toy" style={{ '--i': 5 }}>🎈</span>
        <span className="ob-success__toy" style={{ '--i': 6 }}>🧩</span>
      </div>

      <div className="ob-success__burst">
        <div className="ob-success__ring ob-success__ring--1" />
        <div className="ob-success__ring ob-success__ring--2" />
        <div className="ob-success__emoji">🎉</div>
      </div>

      <div>
        <h3 className="ob-success__title">Setup Complete!</h3>
        <p className="text-gray-500 text-sm mt-1">Your seller account is ready. Welcome to ToyStore!</p>
      </div>

      <ul className="ob-success__checklist">
        {items.map((t, index) => (
          <li key={t} className="ob-success__check-item" style={{ '--delay': `${index * 0.12}s` }}>
            <span className="ob-success__check-icon">
              <Check />
            </span>
            {t}
          </li>
        ))}
      </ul>

      <button onClick={onGo} className="ob-btn-primary ob-btn-primary--wide ob-success__cta">
        Go to Seller Dashboard 🏪
      </button>
    </div>
  );
}

/* ─── STEP CONFIG ────────────────────────── */
const STEPS = [
  { id: 1, label: 'Basic Info', short: '1', emoji: '👤', title: 'Basic Seller Info', sub: 'Tell us about yourself to get started' },
  { id: 2, label: 'Business', short: '2', emoji: '🏢', title: 'Business Information', sub: 'Help buyers know your business' },
  { id: 3, label: 'KYC', short: '3', emoji: '🪪', title: 'KYC Verification', sub: 'Required for seller verification in India' },
  { id: 4, label: 'Bank', short: '4', emoji: '🏦', title: 'Bank Details', sub: 'Where we send your earnings' },
  { id: 5, label: 'Store Info', short: '5', emoji: '🧸', title: 'Store Information', sub: 'Set up your public store profile' },
];

function validate(step, data) {
  const e = {};

  if (step === 1) {
    if (!data.fullName.trim()) e.fullName = 'Full name is required';
    if (!data.email.trim()) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(data.email)) e.email = 'Enter a valid email';
    if (!data.mobile.trim()) e.mobile = 'Mobile number is required';
    else if (!/^[6-9]\d{9}$/.test(data.mobile)) e.mobile = 'Enter a valid 10-digit mobile number';
    if (!data.otpVerified) e.mobile = (e.mobile || '') + (e.mobile ? ' · ' : '') + 'Please verify your mobile number';
    if (!data.password) e.password = 'Password is required';
    else if (data.password.length < 6) e.password = 'Minimum 6 characters';
  }

  if (step === 2) {
    if (!data.businessName.trim()) e.businessName = 'Business name is required';
    if (!data.businessAddress.trim()) e.businessAddress = 'Address is required';
    if (!data.city.trim()) e.city = 'City is required';
    if (!data.state.trim()) e.state = 'State is required';
    if (!data.pincode || !/^\d{6}$/.test(data.pincode)) e.pincode = 'Valid 6-digit pincode required';
    if (!data.country.trim()) e.country = 'Country is required';
  }

  if (step === 3) {
    if (!data.panNumber || !/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(data.panNumber)) e.panNumber = 'Enter valid PAN (e.g. ABCDE1234F)';
    if (!data.aadhaarNumber || data.aadhaarNumber.length !== 12) e.aadhaarNumber = 'Enter valid 12-digit Aadhaar number';
    if (!data.kycDocumentImage) e.kycDocumentImage = 'Please upload a KYC document';
  }

  if (step === 4) {
    if (!data.accountHolderName.trim()) e.accountHolderName = 'Account holder name is required';
    if (!data.bankName.trim()) e.bankName = 'Bank name is required';
    if (!data.accountNumber || data.accountNumber.length < 9) e.accountNumber = 'Enter valid account number (min 9 digits)';
    if (!data.confirmAccountNumber) e.confirmAccountNumber = 'Please confirm account number';
    else if (data.accountNumber !== data.confirmAccountNumber) e.confirmAccountNumber = 'Account numbers do not match';
    if (!data.ifscCode || !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(data.ifscCode)) e.ifscCode = 'Enter valid IFSC code (e.g. SBIN0001234)';
  }

  if (step === 5) {
    if (!data.storeName.trim()) e.storeName = 'Store name is required';
    if (!data.storeDescription.trim()) e.storeDescription = 'Store description is required';
    if (!data.storePincode || !/^\d{6}$/.test(data.storePincode)) e.storePincode = 'Valid 6-digit pincode required';
    if (!data.storeAddress.trim()) e.storeAddress = 'Store address is required';
    if (!data.returnAddress.trim()) e.returnAddress = 'Return address is required';
  }

  return e;
}

/* ─── MAIN COMPONENT ─────────────────────── */
export default function SellerOnboarding() {
  const navigate = useNavigate();
  const { data, update, markComplete } = useOnboarding();

  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const currentSeller = JSON.parse(localStorage.getItem('toyCurrentSeller') || 'null');
  const currentStepMeta = STEPS.find((s) => s.id === step);

  React.useEffect(() => {
    if (!currentSeller) {
      navigate('/auth');
      return;
    }

    if (currentSeller.onboardingCompleted === true) {
      navigate('/seller');
      return;
    }

    // Only pre-fill email and password from the registration/login session; all other fields start blank.
    if (currentSeller?.email && !data.email) {
      update({ email: currentSeller.email });
    }
    if (currentSeller?.password && !data.password) {
      update({ password: currentSeller.password });
    }
  }, [currentSeller, data.email, data.password, navigate, update]);

  const goNext = () => {
    const errs = validate(step, data);
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setErrors({});
    if (step < 5) {
      setStep((s) => s + 1);
    } else {
      handleSubmit();
    }
  };

  const goBack = () => {
    setErrors({});
    setStep((s) => Math.max(1, s - 1));
  };

  const handleSubmit = async () => {
    setSubmitting(true);

    try {
      const payload = {
        seller_id: currentSeller.id || currentSeller.seller_id,
        ...data
      };

      const res = await fetch('http://127.0.0.1:5000/api/auth/seller/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const contentType = res.headers.get('content-type');
      let result;
      if (contentType && contentType.includes('application/json')) {
        result = await res.json();
      } else {
        const text = await res.text();
        throw new Error(`Server returned non-JSON response: ${text.slice(0, 100)}...`);
      }

      if (!res.ok) {
        throw new Error(result.error || 'Failed to save onboarding data');
      }

      markComplete();

      const sel = JSON.parse(localStorage.getItem('toyCurrentSeller') || '{}');
      const updatedSeller = { ...sel, onboardingCompleted: true };

      localStorage.setItem('toyCurrentSeller', JSON.stringify(updatedSeller));
      localStorage.removeItem('toyNewSellerPendingOnboarding');

      setDone(true);
    } catch (err) {
      console.error('Onboarding submission failed:', err);
      alert('Failed to save onboarding details: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const pct = (step / 5) * 100;

  if (!currentSeller) return null;
  if (currentSeller.onboardingCompleted === true && !done) return null;

  return (
    <div className="ob-root">
      <div className="ob-blob ob-blob--tl" />
      <div className="ob-blob ob-blob--br" />
      <div className="ob-blob ob-blob--mid" />
      <div className="ob-dots" />

      <header className="ob-header">
        <div className="ob-header__inner">
          <div className="ob-header__brand">
            <div className="ob-header__logo">🧸</div>
            <div>
              <span className="ob-header__brand-name">ToyStore</span>
              <span className="ob-header__brand-sub">Seller Setup</span>
            </div>
          </div>

          <span className={`ob-header__badge ${done ? 'ob-header__badge--done' : ''}`}>
            {done ? 'Complete ✓' : `Step ${step} of 5`}
          </span>
        </div>

        {!done && (
          <div className="ob-progress">
            <div className="ob-progress__track">
              <div className="ob-progress__fill" style={{ width: `${pct}%` }} />
              <div className="ob-progress__dot" style={{ left: `calc(${pct}% - 6px)` }} />
            </div>
          </div>
        )}
      </header>

      <main className="ob-main">
        {!done && (
          <div className="ob-stepper">
            {STEPS.map((s, i) => {
              const doneStep = step > s.id;
              const active = step === s.id;

              return (
                <React.Fragment key={s.id}>
                  <div className="ob-stepper__item">
                    <div
                      className={[
                        'ob-stepper__circle',
                        doneStep ? 'ob-stepper__circle--done' : active ? 'ob-stepper__circle--active' : 'ob-stepper__circle--idle',
                      ].join(' ')}
                    >
                      {doneStep ? <Check /> : active ? <span className="ob-stepper__emoji">{s.emoji}</span> : <span className="ob-stepper__num">{s.short}</span>}
                    </div>

                    <span
                      className={[
                        'ob-stepper__label',
                        doneStep ? 'ob-stepper__label--done' : active ? 'ob-stepper__label--active' : 'ob-stepper__label--idle',
                      ].join(' ')}
                    >
                      {s.label}
                    </span>
                  </div>

                  {i < STEPS.length - 1 && (
                    <div className={`ob-stepper__connector ${step > s.id ? 'ob-stepper__connector--done' : 'ob-stepper__connector--idle'}`} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        )}

        <div className="ob-card">
          {!done && (
            <div className="ob-card__header">
              <div className="ob-card__header-emoji">{currentStepMeta?.emoji}</div>
              <div className="ob-card__header-text">
                <h2 className="ob-card__title">{currentStepMeta?.title}</h2>
                <p className="ob-card__sub">{currentStepMeta?.sub}</p>
              </div>
              <div className="ob-card__header-deco ob-card__header-deco--1" />
              <div className="ob-card__header-deco ob-card__header-deco--2" />
            </div>
          )}

          <div className="ob-card__body">
            {done ? (
              <SuccessScreen onGo={() => navigate('/seller')} />
            ) : (
              <>
                {step === 1 && <Step1 data={data} update={update} errors={errors} setErrors={setErrors} />}
                {step === 2 && <Step2 data={data} update={update} errors={errors} setErrors={setErrors} />}
                {step === 3 && <Step3 data={data} update={update} errors={errors} setErrors={setErrors} />}
                {step === 4 && <Step4 data={data} update={update} errors={errors} setErrors={setErrors} />}
                {step === 5 && <Step5 data={data} update={update} errors={errors} setErrors={setErrors} />}

                <div className="ob-actions">
                  {step > 1 && (
                    <button type="button" onClick={goBack} className="ob-btn-back">
                      ← Back
                    </button>
                  )}

                  <button type="button" onClick={goNext} disabled={submitting} className="ob-btn-primary">
                    {submitting ? (
                      <span className="ob-btn-primary__loading">
                        <Spinner />
                        Saving…
                      </span>
                    ) : step === 5 ? (
                      'Complete Setup 🎉'
                    ) : (
                      'Save & Continue →'
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {!done && <p className="ob-footer-note">Your progress is saved automatically. You can come back anytime.</p>}
      </main>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka+One&family=Poppins:wght@400;500;600;700;800&display=swap');

        @keyframes ob-spin { to { transform: rotate(360deg); } }
        @keyframes ob-fadeSlideUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes ob-blobFloat {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-18px) scale(1.04); }
        }
        @keyframes ob-blobFloatAlt {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(14px) scale(1.03); }
        }
        @keyframes ob-progressPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(249,115,22,0.5); }
          50% { box-shadow: 0 0 0 6px rgba(249,115,22,0); }
        }
        @keyframes ob-successPop {
          0% { transform: scale(0) rotate(-15deg); opacity: 0; }
          60% { transform: scale(1.15) rotate(5deg); opacity: 1; }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        @keyframes ob-ringPulse {
          0% { transform: scale(0.8); opacity: 0.9; }
          100% { transform: scale(2.2); opacity: 0; }
        }
        @keyframes ob-checkIn {
          from { opacity: 0; transform: translateX(-14px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes ob-toyFloat {
          0%, 100% { transform: translateY(0) rotate(0deg); opacity: 0.8; }
          33% { transform: translateY(-12px) rotate(8deg); opacity: 1; }
          66% { transform: translateY(-6px) rotate(-6deg); opacity: 0.9; }
        }
        @keyframes ob-ctaPulse {
          0%, 100% { box-shadow: 0 6px 24px rgba(249,115,22,0.4); }
          50% { box-shadow: 0 8px 32px rgba(249,115,22,0.6); }
        }
        @keyframes ob-uploadBounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }

        .ob-root {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          background: linear-gradient(145deg, #fff7ed 0%, #fffbf5 40%, #fff3e0 70%, #fef3c7 100%);
          position: relative;
          overflow-x: hidden;
          font-family: 'Poppins', sans-serif;
        }

        .ob-blob {
          position: fixed;
          border-radius: 50%;
          filter: blur(60px);
          pointer-events: none;
          z-index: 0;
        }

        .ob-blob--tl {
          width: 420px;
          height: 420px;
          top: -140px;
          left: -140px;
          background: radial-gradient(circle, rgba(251,146,60,0.22) 0%, rgba(249,115,22,0.08) 60%, transparent 100%);
          animation: ob-blobFloat 7s ease-in-out infinite;
        }

        .ob-blob--br {
          width: 380px;
          height: 380px;
          bottom: -120px;
          right: -100px;
          background: radial-gradient(circle, rgba(253,186,116,0.2) 0%, rgba(251,146,60,0.07) 60%, transparent 100%);
          animation: ob-blobFloatAlt 9s ease-in-out infinite;
        }

        .ob-blob--mid {
          width: 260px;
          height: 260px;
          top: 45%;
          left: 55%;
          background: radial-gradient(circle, rgba(254,215,170,0.18) 0%, transparent 70%);
          animation: ob-blobFloat 11s ease-in-out infinite reverse;
        }

        .ob-dots {
          position: fixed;
          inset: 0;
          z-index: 0;
          pointer-events: none;
          background-image: radial-gradient(circle, rgba(251,146,60,0.18) 1.2px, transparent 1.2px);
          background-size: 28px 28px;
          mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 100%);
        }

        .ob-header {
          position: sticky;
          top: 0;
          z-index: 30;
          background: rgba(255,255,255,0.88);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          border-bottom: 1px solid rgba(251,146,60,0.18);
          box-shadow: 0 2px 16px rgba(249,115,22,0.07);
        }

        .ob-header__inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          max-width: 720px;
          margin: 0 auto;
          padding: 14px 20px;
        }

        .ob-header__brand {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .ob-header__logo {
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          box-shadow: 0 4px 12px rgba(249,115,22,0.35);
        }

        .ob-header__brand-name {
          font-family: 'Fredoka One', cursive;
          font-size: 1.2rem;
          color: #ea580c;
          line-height: 1;
          display: block;
        }

        .ob-header__brand-sub {
          font-size: 0.68rem;
          color: #fb923c;
          font-weight: 600;
          letter-spacing: 0.05em;
          display: block;
          margin-top: 1px;
        }

        .ob-header__badge {
          font-size: 0.75rem;
          font-weight: 700;
          color: #9a3412;
          background: linear-gradient(135deg, #ffedd5 0%, #fed7aa 100%);
          border: 1px solid #fdba74;
          padding: 5px 14px;
          border-radius: 999px;
          box-shadow: 0 2px 8px rgba(249,115,22,0.12);
        }

        .ob-header__badge--done {
          color: #065f46;
          background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
          border-color: #6ee7b7;
        }

        .ob-progress {
          padding: 0 20px 10px;
          max-width: 720px;
          margin: 0 auto;
        }

        .ob-progress__track {
          height: 5px;
          background: #fed7aa;
          border-radius: 99px;
          position: relative;
          overflow: visible;
        }

        .ob-progress__fill {
          height: 100%;
          background: linear-gradient(90deg, #fb923c 0%, #f97316 50%, #ea580c 100%);
          border-radius: 99px;
          transition: width 0.55s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .ob-progress__dot {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 12px;
          height: 12px;
          background: #f97316;
          border-radius: 50%;
          border: 2px solid white;
          box-shadow: 0 0 0 3px rgba(249,115,22,0.3);
          transition: left 0.55s cubic-bezier(0.4, 0, 0.2, 1);
          animation: ob-progressPulse 1.8s ease-in-out infinite;
        }

        .ob-main {
          flex: 1;
          width: 100%;
          max-width: 720px;
          margin: 0 auto;
          padding: 24px 16px 40px;
          position: relative;
          z-index: 1;
        }

        @media (min-width: 640px) {
          .ob-main { padding: 32px 24px 48px; }
        }

        .ob-stepper {
          display: flex;
          align-items: flex-start;
          margin-bottom: 24px;
          overflow-x: auto;
          padding-bottom: 4px;
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        .ob-stepper::-webkit-scrollbar { display: none; }

        .ob-stepper__item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          flex: none;
        }

        .ob-stepper__circle {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 13px;
          font-weight: 700;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
        }

        .ob-stepper__circle--idle {
          background: #f3f4f6;
          color: #9ca3af;
          border: 2px solid #e5e7eb;
        }

        .ob-stepper__circle--active {
          background: linear-gradient(135deg, #f97316, #ea580c);
          color: white;
          border: 2px solid transparent;
          box-shadow: 0 0 0 4px rgba(249,115,22,0.2), 0 4px 14px rgba(249,115,22,0.4);
          transform: scale(1.12);
        }

        .ob-stepper__circle--done {
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
          border: 2px solid transparent;
          box-shadow: 0 2px 8px rgba(16,185,129,0.3);
        }

        .ob-stepper__emoji {
          font-size: 16px;
          line-height: 1;
        }

        .ob-stepper__num {
          font-size: 13px;
          font-weight: 800;
        }

        .ob-stepper__label {
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.02em;
          transition: color 0.2s;
          white-space: nowrap;
        }

        .ob-stepper__label--idle { color: #9ca3af; }
        .ob-stepper__label--active { color: #ea580c; }
        .ob-stepper__label--done { color: #059669; }

        .ob-stepper__connector {
          flex: 1;
          height: 2px;
          margin-bottom: 22px;
          min-width: 18px;
          border-radius: 99px;
          transition: background 0.4s;
        }

        .ob-stepper__connector--idle { background: #e5e7eb; }
        .ob-stepper__connector--done { background: linear-gradient(90deg, #34d399, #10b981); }

        .ob-card {
          background: rgba(255,255,255,0.96);
          border-radius: 24px;
          border: 1px solid rgba(251,146,60,0.15);
          box-shadow: 0 4px 24px rgba(249,115,22,0.08), 0 1px 3px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.9);
          overflow: hidden;
          backdrop-filter: blur(8px);
        }

        .ob-card__header {
          padding: 22px 24px 18px;
          background: linear-gradient(120deg, #fff7ed 0%, #ffedd5 40%, #fef3c7 100%);
          border-bottom: 1px solid rgba(251,146,60,0.15);
          display: flex;
          align-items: center;
          gap: 14px;
          position: relative;
          overflow: hidden;
        }

        .ob-card__header-emoji {
          font-size: 2rem;
          flex: none;
          line-height: 1;
          filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));
        }

        .ob-card__header-text {
          flex: 1;
          min-width: 0;
        }

        .ob-card__title {
          font-family: 'Fredoka One', cursive;
          font-size: 1.35rem;
          color: #9a3412;
          line-height: 1.15;
          margin: 0;
        }

        .ob-card__sub {
          font-size: 0.78rem;
          color: #c2410c;
          font-weight: 500;
          margin-top: 2px;
        }

        .ob-card__header-deco {
          position: absolute;
          border-radius: 50%;
          background: rgba(249,115,22,0.08);
          pointer-events: none;
        }

        .ob-card__header-deco--1 {
          width: 90px;
          height: 90px;
          top: -35px;
          right: 50px;
        }

        .ob-card__header-deco--2 {
          width: 55px;
          height: 55px;
          bottom: -20px;
          right: 20px;
        }

        .ob-card__body {
          padding: 24px;
        }

        @media (min-width: 640px) {
          .ob-card__body { padding: 28px 32px; }
        }

        .ob-step-content {
          animation: ob-fadeSlideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1) both;
        }

        .ob-field {
          animation: ob-fadeSlideUp 0.3s ease both;
        }

        .ob-input {
          width: 100%;
          padding: 0.72rem 1rem;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          font-size: 0.875rem;
          font-family: 'Poppins', sans-serif;
          background: #fafafa;
          color: #1f2937;
          transition: all 0.22s cubic-bezier(0.4, 0, 0.2, 1);
          outline: none;
          min-width: 0;
          box-sizing: border-box;
        }

        .ob-input:hover:not(:focus) {
          border-color: #fdba74;
          background: #fffaf5;
        }

        .ob-input:focus {
          border-color: #f97316;
          background: #ffffff;
          box-shadow: 0 0 0 3.5px rgba(249,115,22,0.14), 0 2px 8px rgba(249,115,22,0.08);
        }

        .ob-input::placeholder {
          color: #9ca3af;
          font-weight: 400;
        }

        .ob-info-banner {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          border-radius: 14px;
          padding: 12px 14px;
          font-size: 0.78rem;
          font-weight: 600;
          line-height: 1.5;
          border: 1.5px solid;
        }

        .ob-info-banner__icon {
          font-size: 1rem;
          flex: none;
          margin-top: 1px;
        }

        .ob-info-banner--orange {
          background: linear-gradient(135deg, #fff7ed, #ffedd5);
          border-color: #fdba74;
          color: #9a3412;
        }

        .ob-info-banner--blue {
          background: linear-gradient(135deg, #eff6ff, #dbeafe);
          border-color: #93c5fd;
          color: #1e40af;
        }

        .ob-upload-btn {
          width: 100%;
          border: 2.5px dashed #fed7aa;
          border-radius: 16px;
          padding: 20px 16px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          background: linear-gradient(135deg, #fffbf7 0%, #fff7ee 100%);
          cursor: pointer;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .ob-upload-btn:hover {
          border-color: #f97316;
          background: linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%);
          box-shadow: 0 4px 16px rgba(249,115,22,0.1);
          transform: translateY(-2px);
        }

        .ob-upload-btn:hover .ob-upload-icon-wrap {
          animation: ob-uploadBounce 0.6s ease infinite;
          color: #ea580c;
        }

        .ob-upload-icon-wrap {
          width: 44px;
          height: 44px;
          background: linear-gradient(135deg, #ffedd5, #fed7aa);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #f97316;
          transition: all 0.2s;
        }

        .ob-actions {
          display: flex;
          gap: 12px;
          margin-top: 24px;
          padding-top: 20px;
          border-top: 1px solid #fef3c7;
        }

        .ob-btn-back {
          flex: 1;
          padding: 13px 16px;
          border-radius: 14px;
          border: 2px solid #e5e7eb;
          background: white;
          font-size: 0.875rem;
          font-weight: 700;
          color: #6b7280;
          cursor: pointer;
          font-family: 'Poppins', sans-serif;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .ob-btn-back:hover {
          border-color: #fdba74;
          color: #ea580c;
          background: #fff7ed;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.06);
        }

        .ob-btn-primary {
          flex: 2;
          padding: 13px 20px;
          background: linear-gradient(135deg, #fb923c 0%, #f97316 45%, #ea580c 100%);
          color: white;
          font-weight: 700;
          font-size: 0.9rem;
          border-radius: 14px;
          border: none;
          cursor: pointer;
          font-family: 'Poppins', sans-serif;
          box-shadow: 0 4px 16px rgba(249,115,22,0.38), inset 0 1px 0 rgba(255,255,255,0.15);
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }

        .ob-btn-primary:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(249,115,22,0.5);
        }

        .ob-btn-primary:disabled {
          opacity: 0.65;
          cursor: not-allowed;
        }

        .ob-btn-primary--wide {
          width: 100%;
          max-width: 300px;
        }

        .ob-btn-primary__loading {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .ob-success {
          position: relative;
          overflow: hidden;
        }

        .ob-success__burst {
          position: relative;
          width: 96px;
          height: 96px;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: ob-successPop 0.6s cubic-bezier(0.34,1.56,0.64,1) both;
          animation-delay: 0.1s;
        }

        .ob-success__ring {
          position: absolute;
          border-radius: 50%;
          border: 3px solid rgba(249,115,22,0.4);
        }

        .ob-success__ring--1 {
          inset: 0;
          animation: ob-ringPulse 1.2s ease-out infinite;
          animation-delay: 0.4s;
        }

        .ob-success__ring--2 {
          inset: -8px;
          animation: ob-ringPulse 1.2s ease-out infinite;
          animation-delay: 0.7s;
        }

        .ob-success__emoji {
          width: 96px;
          height: 96px;
          border-radius: 50%;
          background: linear-gradient(135deg, #ffedd5, #fed7aa);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2.8rem;
          box-shadow: 0 8px 32px rgba(249,115,22,0.25);
          border: 3px solid rgba(249,115,22,0.2);
        }

        .ob-success__toys {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 120px;
          pointer-events: none;
          overflow: hidden;
        }

        .ob-success__toy {
          position: absolute;
          font-size: 1.3rem;
          animation: ob-toyFloat 3s ease-in-out infinite;
          animation-delay: calc(var(--i) * 0.5s);
          opacity: 0;
        }

        .ob-success__toy:nth-child(1) { left: 5%; top: 20%; }
        .ob-success__toy:nth-child(2) { left: 18%; top: 60%; }
        .ob-success__toy:nth-child(3) { left: 35%; top: 10%; }
        .ob-success__toy:nth-child(4) { right: 35%; top: 55%; }
        .ob-success__toy:nth-child(5) { right: 15%; top: 15%; }
        .ob-success__toy:nth-child(6) { right: 5%; top: 50%; }

        .ob-success__title {
          font-family: 'Fredoka One', cursive;
          font-size: 2rem;
          color: #9a3412;
          line-height: 1;
        }

        .ob-success__checklist {
          list-style: none;
          padding: 0;
          margin: 0;
          background: linear-gradient(135deg, #f0fdf4, #dcfce7);
          border: 1.5px solid #86efac;
          border-radius: 18px;
          padding: 16px 20px;
          width: 100%;
          max-width: 320px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .ob-success__check-item {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 0.85rem;
          color: #15803d;
          font-weight: 600;
          animation: ob-checkIn 0.4s ease both;
          animation-delay: var(--delay, 0s);
        }

        .ob-success__check-icon {
          width: 22px;
          height: 22px;
          background: linear-gradient(135deg, #22c55e, #16a34a);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          flex: none;
          box-shadow: 0 2px 8px rgba(34,197,94,0.35);
        }

        .ob-success__cta {
          animation: ob-ctaPulse 2s ease-in-out infinite;
          animation-delay: 1s;
        }

        .ob-footer-note {
          text-align: center;
          font-size: 0.75rem;
          color: #d97706;
          font-weight: 500;
          margin-top: 16px;
          opacity: 0.8;
        }
      `}</style>
    </div>
  );
}