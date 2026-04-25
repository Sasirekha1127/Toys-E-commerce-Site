import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Package,
  ShoppingCart,
  IndianRupee,
  Clock,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Star,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  sellerStats,
  sellerOrders,
  sellerProducts,
  sellerReviews,
  monthlySales,
  lowStockAlerts,
} from '../../data/seller/index.js';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(n) {
  return new Intl.NumberFormat('en-IN').format(n);
}

function StatusBadge({ status }) {
  const map = {
    Delivered: 'badge-green',
    Shipped: 'badge-blue',
    Pending: 'badge-orange',
    Processing: 'badge-gray',
    Cancelled: 'badge-red',
    Paid: 'badge-green',
    Refunded: 'badge-gray',
    Active: 'badge-green',
    'Low Stock': 'badge-orange',
    'Out of Stock': 'badge-red',
  };
  return <span className={`badge ${map[status] || 'badge-gray'}`}>{status}</span>;
}

function StarRating({ rating }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={12}
          className={i <= Math.round(rating) ? 'star-filled' : 'star-empty'}
        />
      ))}
    </span>
  );
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="card px-3 py-2 text-xs shadow-lg">
      <p className="font-semibold text-gray-700 mb-1">{label}</p>
      <p className="text-orange-600">₹{fmt(payload[0]?.value)}</p>
      <p className="text-gray-500">{payload[1]?.value} orders</p>
    </div>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({ icon: Icon, label, value, sub, color, prefix }) {
  return (
    <div className="card p-5 flex items-center justify-between gap-2 animate-slide-up">
      <div>
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{label}</p>
      <p className="text-2xl font-bold text-gray-900 mt-1">
        {prefix && <span className="text-lg">{prefix}</span>}
        {value}
      </p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
      <div className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-none ${color}`}>
        <Icon size={20} className="text-white" />
      </div>
    </div>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export default function SellerDashboard() {
  const navigate = useNavigate();
  const currentSeller = JSON.parse(localStorage.getItem('toyCurrentSeller') || 'null');
  const isDemo = currentSeller?.email === 'kidstoys@gmail.com';

  const [stats, setStats] = useState(isDemo ? { ...sellerStats, revenueTrend: monthlySales } : null);
  const [orders, setOrders] = useState(isDemo ? sellerOrders : []);
  const [products, setProducts] = useState(isDemo ? sellerProducts : []);
  const [reviews, setReviews] = useState(isDemo ? sellerReviews : []);
  const [loading, setLoading] = useState(!isDemo);

  useEffect(() => {
    if (!currentSeller?.id || isDemo) {
      if (!isDemo) setLoading(false);
      return;
    };

    const fetchData = async () => {
      setLoading(true);
      try {
        console.log(`[DEBUG] Fetching dashboard for seller_id: "${currentSeller.id}"`);
        const [dashRes, orderRes, prodRes, revRes] = await Promise.all([
          fetch(`http://localhost:5000/api/seller/dashboard?seller_id=${currentSeller.id}`),
          fetch(`http://localhost:5000/api/orders?seller_id=${currentSeller.id}`),
          fetch(`http://localhost:5000/api/seller-products?seller_id=${currentSeller.id}`),
          fetch(`http://localhost:5000/api/reviews?seller_id=${currentSeller.id}`)
        ]);

        const dashData = await dashRes.json();
        console.log("[DEBUG] Dashboard API Response:", dashData);

        const orderData = await orderRes.json();
        const prodData = await prodRes.json();
        const revData = await revRes.json();

        console.log(`[DEBUG] Raw Seller Orders found: ${orderData.orders?.length || 0}`);

        if (dashData.summary) {
          setStats({
            totalProducts: dashData.summary.totalProducts || 0,
            totalOrders: dashData.summary.totalOrders || 0,
            totalRevenue: dashData.summary.totalSales || 0,
            pendingOrders: dashData.summary.pendingOrders || 0,
            lowStockItems: dashData.summary.lowStockCount || 0,
            revenueTrend: dashData.revenueTrend || []
          });
        }
        setOrders(orderData.orders || []);
        setProducts(prodData.products || []);
        setReviews(revData.reviews || []);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentSeller?.id, isDemo]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  const sellerName = currentSeller?.name?.split(' ')[0] || 'Seller';
  const recentOrders = orders.slice(0, 5);
  const lowStockItems = products.filter(p => p.stock_quantity <= 5).slice(0, 5);
  const displayStats = stats || { totalProducts: 0, totalOrders: 0, totalRevenue: 0, pendingOrders: 0, lowStockItems: 0, revenueTrend: [] };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">

      {/* Welcome */}
      <div className="flex items-center justify-between ">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Welcome back, {sellerName}! </h2>
          <p className="text-sm text-gray-500 mt-0.5">Here's what's happening with your shop today.</p>
        </div>
        <button
          onClick={() => navigate('/seller/products')}
          className="btn-primary hidden sm:flex"
        >
          + Add Product
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-2 ">
        <StatCard
          icon={Package}
          label="Total Products"
          value={displayStats.totalProducts}
          sub="In your shop"
          color="bg-orange-500"
        />
        <StatCard
          icon={ShoppingCart}
          label="Total Orders"
          value={displayStats.totalOrders}
          sub="All time"
          color="bg-blue-500"
        />

        <StatCard
          icon={IndianRupee}
          label="Revenue"
          value={fmt(displayStats.totalRevenue)}
          prefix="₹"
          sub="All time earnings"
          color="bg-emerald-500"
        />

        <StatCard
          icon={Clock}
          label="Pending Orders"
          value={displayStats.pendingOrders}
          sub="Need attention"
          color="bg-amber-500"
        />
        <StatCard
          icon={AlertTriangle}
          label="Low Stock"
          value={displayStats.lowStockItems}
          sub="Items to restock"
          color="bg-red-500"
        />
      </div>

      {/* Chart + Low Stock */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Revenue Chart */}
        <div className="card p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="section-title">Revenue Overview</p>
              <p className="text-xs text-gray-400 mt-0.5">Last 6 months</p>
            </div>
            <div className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg text-xs font-semibold">
              <TrendingUp size={13} />
              +18.4%
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={displayStats.revenueTrend || []} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="sellerRevGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v / 1000}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="revenue" stroke="#f97316" strokeWidth={2.5} fill="url(#sellerRevGrad)" dot={false} activeDot={{ r: 5, fill: '#f97316' }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Low Stock Alerts */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="section-title">Low Stock Alerts</p>
            <button onClick={() => navigate('/seller/inventory')} className="text-xs text-orange-500 font-semibold hover:underline">
              View all
            </button>
          </div>
          <div className="space-y-3">
            {lowStockItems.length > 0 ? lowStockItems.map((item) => (
              <div key={item.id} className="flex items-center gap-3">
                <img
                  src={item.image || item.image_urls?.[0]}
                  alt={item.name || item.title}
                  className="w-10 h-10 rounded-xl object-cover bg-gray-100 flex-none"
                  onError={(e) => { e.target.src = '/images/toy-placeholder.png'; }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{item.name || item.title}</p>
                  <p className="text-xs text-gray-400">{item.stock_quantity || item.stock} left</p>
                </div>
                <StatusBadge status={item.stock_quantity === 0 ? 'Out of Stock' : 'Low Stock'} />
              </div>
            )) : (
              <p className="text-xs text-gray-400 text-center py-8">No low stock alerts</p>
            )}
          </div>
          <button
            onClick={() => navigate('/seller/inventory')}
            className="btn-outline w-full mt-4 justify-center text-xs"
          >
            Restock Items
          </button>
        </div>
      </div>

      {/* Recent Orders + Recent Reviews */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Recent Orders */}
        <div className="card lg:col-span-2 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <p className="section-title">Recent Orders</p>
            <button onClick={() => navigate('/seller/orders')} className="text-xs text-orange-500 font-semibold hover:underline flex items-center gap-1">
              View all <ArrowRight size={12} />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50/60">
                <tr>
                  <th className="table-th">Order ID</th>
                  <th className="table-th">Customer</th>
                  <th className="table-th hidden sm:table-cell">Amount</th>
                  <th className="table-th">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.length > 0 ? recentOrders.map((o) => (
                  <tr key={o.order_id || o.id} className="table-row">
                    <td className="table-td font-mono text-xs text-orange-600">ORD{String(o.order_id || o.id).padStart(3, '0')}</td>
                    <td className="table-td">
                      {o.customer_name && <p className="font-medium text-gray-900">{o.customer_name}</p>}
                      <p className={o.customer_name ? "text-[10px] text-gray-400 font-mono" : "font-medium text-gray-800"}>
                        {o.customer_db_id ? `CUS${String(o.customer_db_id).padStart(3, '0')}` : (o.customer_id || 'CUS-NEW')}
                      </p>
                    </td>
                    <td className="table-td hidden sm:table-cell font-semibold text-gray-800">₹{fmt(o.total_amount || o.amount)}</td>
                    <td className="table-td"><StatusBadge status={o.order_status || o.status} /></td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="4" className="table-td text-center py-8 text-gray-400 text-xs">No recent orders</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Reviews */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="section-title">Recent Reviews</p>
            <button onClick={() => navigate('/seller/reviews')} className="text-xs text-orange-500 font-semibold hover:underline">
              View all
            </button>
          </div>
          <div className="space-y-4">
            {reviews.length > 0 ? reviews.slice(0, 3).map((r, idx) => (
              <div key={r.review_id || r.id || `rev-${idx}`} className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-brand-grad flex items-center justify-center text-white text-xs font-bold flex-none">
                  {r.avatar || r.customer_name?.[0] || 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-gray-800">{r.customer || r.customer_name}</p>
                    <StarRating rating={r.rating} />
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{r.comment || r.body}</p>
                </div>
              </div>
            )) : (
              <p className="text-xs text-gray-400 text-center py-8">No reviews yet</p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
