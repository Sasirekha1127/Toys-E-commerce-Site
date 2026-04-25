import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Star,
  Boxes,
  User,
  X,
  ChevronRight,
  BarChart2,
  Percent,
} from 'lucide-react';
import { IndianRupee } from 'lucide-react';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/seller' },
  { icon: Package, label: 'My Products', path: '/seller/products' },
  { icon: ShoppingCart, label: 'Orders', path: '/seller/orders' },
  { icon: Boxes, label: 'Inventory', path: '/seller/inventory' },
  { icon: IndianRupee, label: 'Payments', path: '/seller/payments' },
  { icon: Star, label: 'Reviews', path: '/seller/reviews' },
  { icon: BarChart2, label: 'Analytics', path: '/seller/analytics' },
  { icon: Percent, label: 'Discounts', path: '/seller/discounts' },
  { icon: User, label: 'Setting', path: '/seller/profile' },
];

export default function SellerSidebar({ open, onClose }) {
  const location = useLocation();
  const navigate = useNavigate();

  const handleNav = (path) => {
    navigate(path);
    if (onClose) onClose();
  };

  const isActivePath = (path) => {
    if (path === '/seller') return location.pathname === '/seller';
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 h-full w-64 bg-white shadow-sidebar z-40
          flex flex-col transition-transform duration-300 ease-in-out
          lg:translate-x-0 lg:static lg:shadow-sidebar
          ${open ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Brand */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-gray-100">

          {/* ✅ CLICKABLE BRAND */}
          <div
            className="flex items-center gap-2.5 text-left"
          >
            <div className="w-9 h-9 bg-brand-grad rounded-xl flex items-center justify-center shadow-sm">
              <span className="text-lg">🧸</span>
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-base leading-none">
                ToyStore
              </p>
              <p className="text-[10px] text-orange-500 font-semibold tracking-wide mt-0.5">
                SELLER
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="lg:hidden w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400"
          >
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-hidden">
          <p className="px-3 py-1.5 text-[10px] font-semibold text-gray-400 uppercase tracking-widest">
            Seller Menu
          </p>

          {navItems.map(({ icon: Icon, label, path }) => {
            const active = isActivePath(path);

            return (
              <button
                key={path}
                onClick={() => handleNav(path)}
                className={`w-full ${active ? 'sidebar-link-active' : 'sidebar-link-inactive'
                  }`}
              >
                <Icon size={18} className="flex-none" />
                <span className="flex-1 text-left">{label}</span>
                {active && <ChevronRight size={14} className="opacity-70" />}
              </button>
            );
          })}
        </nav>

        {/* Footer badge */}
        <div className="px-4 py-4 border-t border-gray-100">
          {(() => {
            const currentSeller = JSON.parse(
              localStorage.getItem('toyCurrentSeller') || 'null'
            );
            const shopName = currentSeller?.shopName || 'Shop';
            const initial =
              currentSeller?.sellerName?.charAt(0).toUpperCase() || 'S';

            return (
              <div className="flex items-center gap-2.5 bg-orange-50 rounded-xl px-3 py-2.5">
                <div className="w-7 h-7 rounded-lg bg-brand-grad flex items-center justify-center text-white text-xs font-bold">
                  {initial}
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-800 leading-none">
                    {shopName}
                  </p>
                  <p className="text-[10px] text-orange-500 mt-0.5 font-medium">
                    ● Active Seller
                  </p>
                </div>
              </div>
            );
          })()}
        </div>
      </aside>
    </>
  );
}