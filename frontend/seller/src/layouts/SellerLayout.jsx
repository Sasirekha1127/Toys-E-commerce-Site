import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SellerSidebar from '../components/seller/layout/SellerSidebar';
import SellerHeader from '../components/seller/layout/SellerHeader';

export default function SellerLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const currentSeller = JSON.parse(localStorage.getItem('toyCurrentSeller') || 'null');
    if (!currentSeller) {
      window.location.href = 'http://localhost:5173/auth?target=seller';
      return;
    }

    // Route-guard: redirect to onboarding if NOT completed
    // We trust the onboardingCompleted flag in the seller object
    if (currentSeller.onboardingCompleted !== true) {
      navigate('/seller/onboarding');
    }
  }, [navigate]);

  const currentSeller = JSON.parse(localStorage.getItem('toyCurrentSeller') || 'null');
  if (!currentSeller || currentSeller.onboardingCompleted !== true) return null;

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <SellerSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <SellerHeader onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
