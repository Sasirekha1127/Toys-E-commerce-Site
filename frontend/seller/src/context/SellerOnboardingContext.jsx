import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const KEY = 'toySellerOnboarding';

const EMPTY = {
  // Step 1 – Basic Info
  fullName: '', email: '', mobile: '', otpVerified: false, password: '',
  // Step 2 – Business
  businessType: 'Individual', businessName: '', businessAddress: '',
  city: '', state: '', pincode: '', country: 'India',
  // Step 3 – KYC
  panNumber: '', aadhaarNumber: '', kycDocumentImage: null,
  // Step 4 – Bank
  accountHolderName: '', bankName: '', accountNumber: '', confirmAccountNumber: '', ifscCode: '',
  // Step 5 – Store
  storeName: '', storeLogo: null, storeDescription: '', storePincode: '',
  storeAddress: '', returnAddress: '',
  socialLinks: { instagram: '', facebook: '', website: '' },
  brandingBanner: null,
  // Meta
  onboardingCompleted: false,
};

const Ctx = createContext(null);

export function SellerOnboardingProvider({ children }) {
  const [data, setData] = useState(() => ({ ...EMPTY }));

  useEffect(() => {
    // don't persist image blobs to localStorage - store everything else
    const toSave = { ...data, kycDocumentImage: null, storeLogo: null, brandingBanner: null };
    localStorage.setItem(KEY, JSON.stringify(toSave));
  }, [data]);

  const update = useCallback((patch) => setData(d => ({ ...d, ...patch })), []);

  const reset = useCallback(() => {
    setData({ ...EMPTY });
    localStorage.removeItem(KEY);
  }, []);

  const markComplete = useCallback(() => {
    setData(d => ({ ...d, onboardingCompleted: true }));
  }, []);

  return (
    <Ctx.Provider value={{ data, update, reset, markComplete }}>
      {children}
    </Ctx.Provider>
  );
}

export function useOnboarding() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useOnboarding must be used within SellerOnboardingProvider');
  return ctx;
}
