import React, { useState, useRef, useEffect } from 'react';
import {
  Package,
  ShoppingCart,
  Users,
  IndianRupee,
  ArrowRight,
  ChevronDown,
  Grid3X3,
  AlertTriangle,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import { salesData } from '../../data/admin/index.js';
import {
  StatCard,
  StatusBadge,
  StarRating,
  Avatar,
  SectionHeader,
} from '../../components/admin/ui/index.jsx';
import { useAdmin } from '../../context/AdminContext';

function FilterDropdown({ value, options, onChange, width = 'w-40' }) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} className={`relative ${width}`}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`w-full flex items-center justify-between text-xs border rounded-lg px-3 py-2 bg-white transition-all
        ${open ? 'border-orange-400 ring-2 ring-orange-100 text-orange-600' : 'border-gray-200 text-gray-600 hover:border-orange-300'}`}
      >
        <span className="truncate">{value}</span>
        <ChevronDown size={14} className={`transition-transform duration-200 ${open ? 'rotate-180 text-orange-500' : 'text-gray-400'}`} />
      </button>
      {open && (
        <div className="absolute top-full right-0 mt-2 w-full bg-white border border-orange-100 rounded-xl shadow-lg z-50 overflow-hidden">
          {options.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => { onChange(option); setOpen(false); }}
              className={`w-full text-left px-3 py-2 text-xs transition-all ${value === option ? 'bg-orange-500 text-white' : 'text-gray-700 hover:bg-orange-50 hover:text-orange-600'}`}
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="card px-3 py-2 text-xs shadow-lg">
      <p className="font-semibold text-gray-700 mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }}>
          {p.name}: {p.name === 'revenue' ? `₹${p.value.toLocaleString('en-IN')}` : p.value}
        </p>
      ))}
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [period, setPeriod] = useState('Last 6 months');
  const { products, orders, reviews, adminStats, categories } = useAdmin();

  const topSelling = [...products].sort((a, b) => (b.sold || 0) - (a.sold || 0)).slice(0, 5);
  const lowStock = products.filter((p) => p.stock > 0 && p.stock <= 8);
  const recentOrders = orders.slice(0, 6);
  const recentReviews = reviews.slice(0, 3);

  return (
    <div className="p-4 space-y-6 page-enter">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div onClick={() => navigate('/admin/products')} className="cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-orange-200 hover:border hover:border-orange-300 rounded-2xl">
          <StatCard icon={<Package size={22} />} label="Total Products" value={adminStats.totalProducts} growth={adminStats.productsGrowth} color="brand" delay={0} />
        </div>
        <div onClick={() => navigate('/admin/orders')} className="cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-orange-200 hover:border hover:border-orange-300 rounded-2xl">
          <StatCard icon={<ShoppingCart size={22} />} label="Total Orders" value={adminStats.totalOrders.toLocaleString('en-IN')} growth={adminStats.ordersGrowth} color="blue" delay={80} />
        </div>
        <div onClick={() => navigate('/admin/customers')} className="cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-orange-200 hover:border hover:border-orange-300 rounded-2xl">
          <StatCard icon={<Users size={22} />} label="Total Customers" value={adminStats.totalCustomers.toLocaleString('en-IN')} growth={adminStats.customersGrowth} color="purple" delay={160} />
        </div>
        <div onClick={() => navigate('/admin')} className="cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-orange-200 hover:border hover:border-orange-300 rounded-2xl">
          <StatCard icon={<IndianRupee size={22} />} label="Total Revenue" value={`₹${adminStats.totalRevenue.toLocaleString('en-IN')}`} growth={adminStats.revenueGrowth} color="green" delay={240} />
        </div>
      </div>

      {/* Secondary stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Categories', value: adminStats.totalCategories, icon: <Grid3X3 size={16} />, path: '/admin/categories', color: 'text-violet-600 bg-violet-50' },
          { label: 'Low Stock Items', value: adminStats.lowStockItems, icon: <AlertTriangle size={16} />, path: '/admin/inventory', color: 'text-orange-600 bg-orange-50' },
          { label: 'Pending Reviews', value: reviews.filter(r => r.status === 'Pending').length, icon: <span className="text-sm">⭐</span>, path: '/admin/reviews', color: 'text-amber-600 bg-amber-50' },
          { label: 'Active Offers', value: reviews.filter(r => r.status === 'Active').length || 1, icon: <span className="text-sm">🏷️</span>, path: '/admin/offers', color: 'text-emerald-600 bg-emerald-50' },
        ].map((s) => (
          <div key={s.label} onClick={() => navigate(s.path)} className="card p-4 cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
            <div className="flex items-center gap-2 mb-1">
              <span className={`w-7 h-7 rounded-lg flex items-center justify-center ${s.color}`}>{s.icon}</span>
            </div>
            <p className="text-xl font-bold text-gray-900">{s.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="card p-5 xl:col-span-2">
          <SectionHeader
            title="Revenue Overview"
            subtitle="Last 6 months performance"
            action={
              <FilterDropdown value={period} options={['Last 6 months', 'Last 12 months']} onChange={setPeriod} width="w-40" />
            }
          />
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={salesData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="targetGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="revenue" name="revenue" stroke="#f97316" strokeWidth={2.5} fill="url(#revGrad)" dot={{ fill: '#f97316', r: 3 }} />
              <Area type="monotone" dataKey="target" name="target" stroke="#3b82f6" strokeWidth={2} strokeDasharray="4 4" fill="url(#targetGrad)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
          <div className="flex gap-4 mt-2 justify-end">
            <span className="flex items-center gap-1.5 text-xs text-gray-500"><span className="w-5 h-0.5 bg-brand-500 rounded inline-block" /> Revenue</span>
            <span className="flex items-center gap-1.5 text-xs text-gray-500"><span className="w-5 h-0.5 bg-blue-400 rounded inline-block" /> Target</span>
          </div>
        </div>

        <div className="card p-5">
          <SectionHeader title="Orders / Month" subtitle="Monthly order volume" />
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={salesData} margin={{ top: 0, right: 0, left: -25, bottom: 0 }} barSize={14}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="orders" name="orders" fill="#f97316" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Category Overview */}
      <div className="card p-5">
        <SectionHeader
          title="Category Overview"
          subtitle="Products per category"
          action={<button className="btn-ghost text-xs" onClick={() => navigate('/admin/categories')}>Manage</button>}
        />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {categories.map((c) => (
            <div key={c.id} className={`rounded-xl p-3 text-center transition-all hover:-translate-y-0.5 hover:shadow-md ${c.active ? 'bg-orange-50 border border-orange-100' : 'bg-gray-50 border border-gray-100 opacity-60'}`}>
              <div className="text-2xl mb-1">{c.icon}</div>
              <p className="text-xs font-semibold text-gray-800 leading-tight">{c.name}</p>
              <p className="text-[10px] text-gray-400 mt-0.5">{c.products} products</p>
              {!c.active && <span className="text-[9px] text-gray-400 block">Hidden</span>}
            </div>
          ))}
        </div>
      </div>

      {/* Recent Orders */}
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <h2 className="section-title">Recent Orders</h2>
            <p className="text-xs text-gray-400 mt-0.5">Latest 6 orders</p>
          </div>
          <button className="btn-ghost text-sm" onClick={() => navigate('/admin/orders')}>
            View All <ArrowRight size={14} />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50/70">
              <tr>
                {['Order ID', 'Customer', 'Product', 'Amount', 'Date', 'Status'].map((h) => (
                  <th key={h} className="table-th whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {recentOrders.map((o) => (
                <tr key={o.id} className="table-row">
                  <td className="table-td font-medium text-brand-600">{o.id}</td>
                  <td className="table-td">
                    <div className="flex items-center gap-2">
                      <Avatar initials={o.customer.split(' ').map((n) => n[0]).join('')} size="sm" />
                      <span className="whitespace-nowrap">{o.customer}</span>
                    </div>
                  </td>
                  <td className="table-td text-gray-500 max-w-[180px] truncate">{o.product}</td>
                  <td className="table-td font-semibold">₹{o.amount.toLocaleString('en-IN')}</td>
                  <td className="table-td text-gray-400 whitespace-nowrap">{o.date}</td>
                  <td className="table-td"><StatusBadge status={o.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom 3-col */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {/* Top Selling */}
        <div className="card p-5">
          <SectionHeader title="Top Selling" subtitle="By units sold" action={<button className="btn-ghost text-xs" onClick={() => navigate('/admin/products')}>View all</button>} />
          <div className="space-y-3">
            {topSelling.map((p, i) => (
              <div key={p.id} className="flex items-center gap-3">
                <span className="text-xs font-bold text-gray-400 w-4">{i + 1}</span>
                <img src={p.image} alt={p.name} className="w-10 h-10 rounded-xl object-cover bg-orange-50 flex-none" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{p.name}</p>
                  <p className="text-xs text-gray-400">{p.sold || 0} sold</p>
                </div>
                <span className="text-sm font-semibold text-brand-600">₹{Number(p.price).toLocaleString('en-IN')}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Low Stock */}
        <div className="card p-5">
          <SectionHeader title="Low Stock Alert" subtitle="Needs restocking soon" action={<button className="btn-ghost text-xs" onClick={() => navigate('/admin/inventory')}>Manage</button>} />
          <div className="space-y-3">
            {lowStock.map((p) => (
              <div key={p.id} className="flex items-center gap-3">
                <img src={p.image} alt={p.name} className="w-10 h-10 rounded-xl object-cover bg-orange-50 flex-none" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{p.name}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${p.stock <= 5 ? 'bg-red-400' : 'bg-orange-400'}`} style={{ width: `${Math.min(100, (p.stock / 50) * 100)}%` }} />
                    </div>
                    <span className={`text-xs font-bold ${p.stock <= 5 ? 'text-red-500' : 'text-orange-500'}`}>{p.stock} left</span>
                  </div>
                </div>
              </div>
            ))}
            {lowStock.length === 0 && <p className="text-sm text-gray-400 text-center py-4">All products well stocked ✓</p>}
          </div>
        </div>

        {/* Recent Reviews */}
        <div className="card p-5">
          <SectionHeader title="Recent Reviews" subtitle="Awaiting moderation" action={<button className="btn-ghost text-xs" onClick={() => navigate('/admin/reviews')}>View all</button>} />
          <div className="space-y-4">
            {recentReviews.map((r) => (
              <div key={r.id} className="flex gap-3">
                <Avatar initials={r.avatar} size="sm" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <p className="text-sm font-medium text-gray-800 truncate">{r.customer}</p>
                    <StatusBadge status={r.status} />
                  </div>
                  <StarRating rating={r.rating} size={11} />
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">{r.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card p-5">
        <SectionHeader title="Quick Actions" subtitle="Common admin tasks" />
        <div className="flex flex-wrap gap-3">
          {[
            { label: '➕ Add Product', path: '/admin/products', color: 'btn-primary' },
            { label: '📦 Manage Inventory', path: '/admin/inventory', color: 'btn-outline' },
            { label: '🏷️ Create Offer', path: '/admin/offers', color: 'btn-outline' },
            { label: '📋 View Orders', path: '/admin/orders', color: 'btn-outline' },
            { label: '⭐ Moderate Reviews', path: '/admin/reviews', color: 'btn-outline' },
            { label: '⚙️ Settings', path: '/admin/settings', color: 'btn-outline' },
          ].map((a) => (
            <button key={a.label} className={a.color} onClick={() => navigate(a.path)}>
              {a.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
