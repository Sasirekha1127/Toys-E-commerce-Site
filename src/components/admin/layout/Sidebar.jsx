import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Grid3X3,
  ShoppingCart,
  Users,
  Star,
  Tag,
  Boxes,
  Settings,
  X,
  ChevronRight
} from 'lucide-react';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
  { icon: Package, label: 'Products', path: '/admin/products' },
  { icon: Grid3X3, label: 'Categories', path: '/admin/categories' },
  { icon: ShoppingCart, label: 'Orders', path: '/admin/orders' },
  { icon: Users, label: 'Customers', path: '/admin/customers' },
  { icon: Star, label: 'Reviews', path: '/admin/reviews' },
  { icon: Tag, label: 'Offers / Banners', path: '/admin/offers' },
  { icon: Boxes, label: 'Inventory', path: '/admin/inventory' },
  { icon: Settings, label: 'Settings', path: '/admin/settings' },
];

export default function Sidebar({ open, onClose }) {
  const location = useLocation();
  const navigate = useNavigate();

  const handleNav = (path) => {
    navigate(path);
    if (onClose) onClose();
  };

  const isActivePath = (path) => {
    if (path === '/admin') {
      return location.pathname === '/admin';
    }
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
        <div className="flex items-center justify-between px-5 py-5 border-b border-gray-100">
          <div
            onClick={() => navigate('/')}
            className="flex items-center gap-2.5 cursor-pointer"
          >
            <div className="w-9 h-9 bg-brand-grad rounded-xl flex items-center justify-center shadow-sm">
              <span className="text-lg">🧸</span>
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-base leading-none">
                ToyStore
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

        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          <p className="px-3 py-1.5 text-[10px] font-semibold text-gray-400 uppercase tracking-widest">
            Main Menu
          </p>

          {navItems.slice(0, 8).map(({ icon: Icon, label, path }) => {
            const active = isActivePath(path);

            return (
              <button
                key={path}
                onClick={() => handleNav(path)}
                className={`w-full ${active ? 'sidebar-link-active' : 'sidebar-link-inactive'}`}
              >
                <Icon size={18} className="flex-none" />
                <span className="flex-1 text-left">{label}</span>
                {active && <ChevronRight size={14} className="opacity-70" />}
              </button>
            );
          })}

          <p className="px-3 pt-4 pb-1.5 text-[10px] font-semibold text-gray-400 uppercase tracking-widest">
            Preferences
          </p>

          {navItems.slice(8).map(({ icon: Icon, label, path }) => {
            const active = isActivePath(path);

            return (
              <button
                key={path}
                onClick={() => handleNav(path)}
                className={`w-full ${active ? 'sidebar-link-active' : 'sidebar-link-inactive'}`}
              >
                <Icon size={18} className="flex-none" />
                <span className="flex-1 text-left">{label}</span>
                {active && <ChevronRight size={14} className="opacity-70" />}
              </button>
            );
          })}
        </nav>
      </aside>
    </>
  );
}