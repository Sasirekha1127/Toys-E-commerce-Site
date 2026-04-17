import React from 'react';
import { Star, TrendingUp, TrendingDown } from 'lucide-react';

/* ─── Stat Card ─── */
export function StatCard({ icon, label, value, growth, color = 'brand', delay = 0 }) {
  const colorMap = {
    brand: 'bg-brand-50 text-brand-600',
    green: 'bg-emerald-50 text-emerald-600',
    blue: 'bg-blue-50 text-blue-600',
    purple: 'bg-purple-50 text-purple-600',
  };
  const pos = growth >= 0;
  return (
    <div className="stat-card" style={{ animationDelay: `${delay}ms` }}>
      <div>
        <p className="text-sm text-gray-500 mb-1">{label}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <div className={`flex items-center gap-1 mt-1.5 text-xs font-medium ${pos ? 'text-emerald-600' : 'text-red-500'}`}>
          {pos ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
          {Math.abs(growth)}% vs last month
        </div>
      </div>
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-none ${colorMap[color]}`}>
        {icon}
      </div>
    </div>
  );
}

/* ─── Status Badge ─── */
export function StatusBadge({ status }) {
  const map = {
    Delivered: 'badge-green',
    Active: 'badge-green',
    Approved: 'badge-green',
    Shipped: 'badge-blue',
    Processing: 'badge-orange',
    Pending: 'badge-orange',
    Scheduled: 'badge-blue',
    'Out of Stock': 'badge-red',
    Cancelled: 'badge-red',
    Rejected: 'badge-red',
    Expired: 'badge-gray',
    Inactive: 'badge-gray',
    'Low Stock': 'badge-orange',
    'In Stock': 'badge-green',
  };
  const dots = {
    Delivered: 'bg-emerald-400', Active: 'bg-emerald-400', Approved: 'bg-emerald-400',
    Shipped: 'bg-blue-400', Processing: 'bg-orange-400', Pending: 'bg-orange-400',
    Scheduled: 'bg-blue-400',
    'Out of Stock': 'bg-red-400', Cancelled: 'bg-red-400', Rejected: 'bg-red-400',
    Expired: 'bg-gray-400', Inactive: 'bg-gray-400',
    'Low Stock': 'bg-orange-400', 'In Stock': 'bg-emerald-400',
  };
  return (
    <span className={`badge ${map[status] || 'badge-gray'}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dots[status] || 'bg-gray-400'}`}/>
      {status}
    </span>
  );
}

/* ─── Star Rating ─── */
export function StarRating({ rating, size = 14 }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1,2,3,4,5].map(s => (
        <Star
          key={s}
          size={size}
          className={s <= Math.round(rating) ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'}
        />
      ))}
      <span className="text-xs text-gray-500 ml-1">{rating}</span>
    </div>
  );
}

/* ─── Avatar ─── */
export function Avatar({ initials, size = 'sm', color = 'brand' }) {
  const sizes = { sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm', lg: 'w-12 h-12 text-base' };
  const colors = {
    brand: 'bg-brand-100 text-brand-700',
    green: 'bg-emerald-100 text-emerald-700',
    blue: 'bg-blue-100 text-blue-700',
    purple: 'bg-purple-100 text-purple-700',
  };
  const pick = ['brand','green','blue','purple'][initials.charCodeAt(0) % 4];
  return ( 
    <div className={`rounded-xl flex items-center justify-center font-bold flex-none ${sizes[size]} ${colors[pick]}`}>
      {initials}
    </div>
  );
}

/* ─── Section Header ─── */
export function SectionHeader({ title, subtitle, action }) {
  return (
    <div className="flex items-start justify-between gap-4 mb-5">
      <div>
        <h2 className="section-title">{title}</h2>
        {subtitle && <p className="text-sm text-gray-400 mt-0.5">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

/* ─── Empty State ─── */
export function EmptyState({ icon, title, description }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="text-5xl mb-4">{icon}</div>
      <p className="font-semibold text-gray-700 mb-1">{title}</p>
      <p className="text-sm text-gray-400">{description}</p>
    </div>
  );
}

/* ─── Search + Filter Bar ─── */
export function SearchBar({ value, onChange, placeholder = 'Search…' }) {
  return (
    <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2.5 focus-within:border-brand-400 focus-within:ring-2 focus-within:ring-brand-100 transition-all w-full max-w-xs">
      <svg className="text-gray-400 flex-none" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="bg-transparent text-sm outline-none w-full text-gray-700 placeholder:text-gray-400"
      />
    </div>
  );
}

/* ─── Confirm Modal ─── */
export function ConfirmModal({ open, onClose, onConfirm, title, description }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="card p-6 w-full max-w-sm animate-slide-up">
        <h3 className="font-semibold text-gray-900 text-lg mb-2">{title}</h3>
        <p className="text-sm text-gray-500 mb-6">{description}</p>
        <div className="flex gap-3 justify-end">
          <button className="btn-outline" onClick={onClose}>Cancel</button>
          <button className="btn bg-red-500 hover:bg-red-600 text-white" onClick={() => { onConfirm(); onClose(); }}>Delete</button>
        </div>
      </div>
    </div>
  );
}

/* ─── Mini chart placeholder ─── */
export function SparklinePlaceholder({ color = '#f97316' }) {
  return (
    <svg viewBox="0 0 80 30" className="w-20 h-8">
      <polyline
        points="0,25 15,18 25,20 35,10 48,14 58,6 70,8 80,4"
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
