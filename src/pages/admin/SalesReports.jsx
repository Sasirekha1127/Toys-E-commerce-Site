import React from 'react';
import { 
  TrendingUp, 
  ShoppingBag, 
  BarChart3, 
  Users,
  IndianRupee,
  Package,
  Calendar
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import { StatCard, SectionHeader } from '../../components/admin/ui/index.jsx';
import { useAdmin } from '../../context/AdminContext';

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-100 px-3 py-2 text-xs shadow-lg rounded-xl">
      <p className="font-semibold text-gray-700 mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }}>
          {p.name}: {p.name === 'sales' ? `₹${p.value.toLocaleString('en-IN')}` : p.value}
        </p>
      ))}
    </div>
  );
}

export default function SalesReports() {
  const { adminSales } = useAdmin();

  const sales = adminSales || { 
    totalOrders: 0, 
    totalSales: 0, 
    topCategories: [], 
    dailyTrends: [] 
  };

  const avgOrderValue = sales.totalOrders > 0 ? (sales.totalSales / sales.totalOrders) : 0;

  return (
    <div className="p-4 space-y-6 page-enter">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Sales Reports</h1>
        <p className="text-sm text-gray-500 mt-1">Comprehensive breakdown of sales performance and trends</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard 
          icon={<IndianRupee size={22} />} 
          label="Gross Revenue" 
          value={`₹${sales.totalSales.toLocaleString('en-IN')}`} 
          growth={14.2} 
          color="brand" 
          delay={0} 
        />
        <StatCard 
          icon={<ShoppingBag size={22} />} 
          label="Total Orders" 
          value={sales.totalOrders.toLocaleString('en-IN')} 
          growth={8.5} 
          color="blue" 
          delay={80} 
        />
        <StatCard 
          icon={<BarChart3 size={22} />} 
          label="Avg. Order Value" 
          value={`₹${avgOrderValue.toFixed(2)}`} 
          growth={5.3} 
          color="purple" 
          delay={160} 
        />
        <StatCard 
          icon={<TrendingUp size={22} />} 
          label="Conversion Rate" 
          value="3.8%" 
          growth={1.2} 
          color="green" 
          delay={240} 
        />
      </div>

      {/* Trends Chart */}
      <div className="card p-5">
        <SectionHeader 
          title="Daily Sales Trend" 
          subtitle="Last 7 days performance" 
          action={
            <div className="flex gap-2">
              <span className="flex items-center gap-1.5 text-xs text-gray-500"><span className="w-3 h-3 rounded-full bg-brand-500" /> Revenue</span>
            </div>
          }
        />
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={sales.dailyTrends} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v}`} />
            <Tooltip content={<CustomTooltip />} />
            <Line type="monotone" dataKey="sales" name="sales" stroke="#f97316" strokeWidth={3} dot={{ fill: '#f97316', r: 4, strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6, strokeWidth: 0 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Top Categories */}
        <div className="card p-5">
          <SectionHeader title="Category Performance" subtitle="Top selling categories by volume" />
          <div className="space-y-5 mt-2">
            {sales.topCategories && sales.topCategories.length > 0 ? (
              sales.topCategories.map((cat, idx) => {
                const maxSold = Math.max(...sales.topCategories.map(c => c.sold));
                const width = maxSold > 0 ? (cat.sold / maxSold) * 100 : 0;
                
                return (
                  <div key={idx} className="group">
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="font-semibold text-gray-700 group-hover:text-brand-600 transition-colors">{cat.category}</span>
                      <span className="text-gray-500 font-medium">{cat.sold} units sold</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                      <div 
                        className="bg-brand-500 h-full rounded-full transition-all duration-1000 ease-out" 
                        style={{ width: `${width}%` }}
                      ></div>
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                <Package size={40} className="mb-2 opacity-20" />
                <p className="text-sm">No category data available</p>
              </div>
            )}
          </div>
        </div>

        {/* Daily Breakdown Table */}
        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50">
            <h3 className="section-title">Detailed Daily Breakdown</h3>
            <p className="text-xs text-gray-400 mt-0.5">Performance log for the past week</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50/70 border-b border-gray-100">
                  <th className="table-th text-left">Date</th>
                  <th className="table-th text-center">Orders</th>
                  <th className="table-th text-right">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {sales.dailyTrends.map((day, idx) => (
                  <tr key={idx} className="table-row">
                    <td className="table-td font-medium text-gray-700">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-gray-400" />
                        {day.date}
                      </div>
                    </td>
                    <td className="table-td text-center text-gray-600">{day.orders}</td>
                    <td className="table-td text-right font-bold text-emerald-600">₹{day.sales.toLocaleString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
