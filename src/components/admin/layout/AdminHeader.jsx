import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Menu, Bell, ChevronDown, User, LogOut } from 'lucide-react';

const pageTitles = {
  '/admin': 'Dashboard',
  '/admin/products': 'Products',
  '/admin/categories': 'Categories',
  '/admin/orders': 'Orders',
  '/admin/customers': 'Customers',
  '/admin/reviews': 'Reviews',
  '/admin/offers': 'Offers & Banners',
  '/admin/inventory': 'Inventory',
  '/admin/settings': 'Settings',
};

const notifications = [
  { id: 1, text: 'New order #ORD-5821 received', time: '2m ago', unread: true },
  { id: 2, text: 'Low stock alert: Science Lab Starter', time: '14m ago', unread: true },
  { id: 3, text: 'Review pending approval from Anjali S.', time: '1h ago', unread: false },
];

export default function Header({ onMenuClick }) {
  const location = useLocation();
  const navigate = useNavigate();
  const title = pageTitles[location.pathname] || 'Dashboard';

  const [showNotif, setShowNotif] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const unread = notifications.filter((n) => n.unread).length;

  const currentUser = JSON.parse(localStorage.getItem('toyCurrentUser') || 'null');

  const profileRef = useRef(null);
  const notifRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotif(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('toyCurrentUser');
    setShowProfileMenu(false);
    navigate('/auth');
  };

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
      <div className="relative" ref={notifRef}>
        <button
          onClick={() => setShowNotif(!showNotif)}
          className="relative w-9 h-9 flex items-center justify-center rounded-xl hover:bg-brand-50 text-gray-500 hover:text-brand-600 transition-colors"
        >
          <Bell size={20} />
          {unread > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-500 rounded-full ring-2 ring-white" />
          )}
        </button>

        {showNotif && (
          <div className="absolute right-0 top-12 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <p className="font-semibold text-sm text-gray-800">Notifications</p>
              {unread > 0 && (
                <span className="px-2 py-1 rounded-full text-[10px] font-semibold bg-orange-100 text-orange-600">
                  {unread} new
                </span>
              )}
            </div>

            <div className="divide-y divide-gray-50">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className={`px-4 py-3 hover:bg-gray-50 transition-colors ${n.unread ? 'bg-orange-50/50' : ''}`}
                >
                  <p className="text-sm text-gray-700">{n.text}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{n.time}</p>
                </div>
              ))}
            </div>

            <div className="px-4 py-2.5 border-t border-gray-100">
              <button
                className="text-xs text-orange-600 font-medium hover:underline"
                onClick={() => setShowNotif(false)}
              >
                Mark all as read
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Admin/User Profile */}
      <div className="relative" ref={profileRef}>
        <button
          type="button"
          onClick={() => setShowProfileMenu(!showProfileMenu)}
          className="flex items-center gap-2 cursor-pointer group hover:bg-gray-50 px-2 py-1.5 rounded-xl transition"
        >
          <div className="w-9 h-9 rounded-xl bg-brand-grad flex items-center justify-center text-white text-sm font-bold shadow-sm">
            {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'A'}
          </div>

          <div className="hidden sm:block text-left">
            <p className="text-sm font-medium text-gray-800 leading-none">
              {currentUser?.name || 'Admin'}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              {currentUser?.email || 'admin@toystore.com'}
            </p>
          </div>

          <ChevronDown size={16} className="text-gray-400 hidden sm:block" />
        </button>

        {showProfileMenu && (
          <div className="absolute right-0 top-14 w-52 bg-white border border-gray-100 rounded-2xl shadow-xl py-2 z-50">
            <button
              type="button"
              onClick={() => {
                setShowProfileMenu(false);
                navigate('/admin');
              }}
              className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition"
            >
              <User size={16} />
              My Profile
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-red-50 hover:text-red-500 transition"
            >
              <LogOut size={16} />
              Sign Out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}