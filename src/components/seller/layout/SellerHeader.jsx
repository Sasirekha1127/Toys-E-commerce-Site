import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Menu, Bell, ChevronDown, User, LogOut } from 'lucide-react';

const pageTitles = {
  '/seller': 'Seller Dashboard',
  '/seller/products': 'My Products',
  '/seller/orders': 'Orders',
  '/seller/inventory': 'Inventory',
  '/seller/reviews': 'Reviews',
  '/seller/profile': 'Shop Profile',
  '/seller/notifications': 'Notifications',
};

const notifications = [
  { id: 1, text: 'New order #ORD-8821 received', time: '5m ago', unread: true },
  { id: 2, text: 'Low stock: Magnetic Drawing Board (3 left)', time: '30m ago', unread: true },
  { id: 3, text: 'New 5★ review on Classic Teddy Bear', time: '2h ago', unread: false },
];

export default function SellerHeader({ onMenuClick }) {
  const location = useLocation();
  const navigate = useNavigate();
  const title = pageTitles[location.pathname] || 'Seller Dashboard';

  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const unread = notifications.filter((n) => n.unread).length;

  const profileRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-20 bg-white border-b border-gray-100 px-4 sm:px-6 h-16 flex items-center gap-4">
      {/* Hamburger */}
      <button
        onClick={onMenuClick}
        className="lg:hidden w-9 h-9 flex items-center justify-center rounded-xl hover:bg-brand-50 text-gray-500 hover:text-brand-600 transition-colors"
      >
        <Menu size={20} />
      </button>

      {/* Title */}
      <div className="flex-1">
        <h1 className="text-lg font-semibold text-gray-800">{title}</h1>
        <p className="text-xs text-gray-400 hidden sm:block">
          {new Date().toLocaleDateString('en-IN', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </p>
      </div>

      {/* Notifications */}
      <div className="relative">
        <button
          onClick={() => navigate('/seller/notifications')}
          className="relative w-9 h-9 flex items-center justify-center rounded-xl hover:bg-brand-50 text-gray-500 hover:text-brand-600 transition-colors"
        >
          <Bell size={20} />
          {unread > 0 && (
            <span className="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center text-[10px] font-bold text-white bg-orange-500 rounded-full ring-2 ring-white">
              {unread}
            </span>
          )}
        </button>
      </div>

      {/* Profile */}
      <div className="relative" ref={profileRef}>
        {(() => {
          const currentSeller = JSON.parse(localStorage.getItem('toyCurrentSeller') || 'null');
          const sellerName = currentSeller?.sellerName || 'Seller';
          const shopName = currentSeller?.shopName || 'Shop';
          const email = currentSeller?.email || 'seller@example.com';
          const initial = sellerName.charAt(0).toUpperCase();

          return (
            <>
              <button
                type="button"
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2 cursor-pointer group hover:bg-gray-50 px-2 py-1.5 rounded-xl transition"
              >
                <div className="w-9 h-9 rounded-xl bg-brand-grad flex items-center justify-center text-white text-sm font-bold shadow-sm">
                  {initial}
                </div>

                <div className="hidden sm:block text-left">
                  <p className="text-sm font-medium text-gray-800 leading-none">{sellerName}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{email}</p>
                </div>

                <ChevronDown size={16} className="text-gray-400 hidden sm:block" />
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 top-14 w-52 bg-white border border-gray-100 rounded-2xl shadow-xl py-2 z-50">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm text-gray-800">{shopName}</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setShowProfileMenu(false);
                      navigate('/seller/profile');
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition"
                  >
                    <User size={16} />
                    My Profile
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      localStorage.removeItem('toyCurrentSeller');
                      window.location.href = '/auth';
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-red-50 hover:text-red-500 transition"
                  >
                    <LogOut size={16} />
                    Logout
                  </button>
                </div>
              )}
            </>
          );
        })()}
      </div>
    </header>
  );
}