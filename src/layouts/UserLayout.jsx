import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import UserHeader from '../components/user/UserHeader';
import Footer from '../components/user/Footer';

export default function UserLayout({ children }) {
  const navigate = useNavigate();

  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem('toyCurrentUser') || 'null');
    const currentSeller = JSON.parse(localStorage.getItem('toyCurrentSeller') || 'null');

    // Allow access if either a regular user OR a seller is logged in
    if (!currentUser && !currentSeller) {
      navigate('/auth');
    }
  }, [navigate]);

  const currentUser = JSON.parse(localStorage.getItem('toyCurrentUser') || 'null');
  const currentSeller = JSON.parse(localStorage.getItem('toyCurrentSeller') || 'null');

  // Render nothing while redirecting if no session at all
  if (!currentUser && !currentSeller) {
    return null;
  }

  return (
    <div className="user-layout min-h-screen flex flex-col bg-orange-50">
      <UserHeader />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}
