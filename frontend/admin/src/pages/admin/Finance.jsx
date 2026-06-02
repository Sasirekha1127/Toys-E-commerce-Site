import React from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  CreditCard, 
  PieChart, 
  IndianRupee,
  Activity,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
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
import { StatCard, SectionHeader } from '../../components/admin/ui/index.jsx';
import { useAdmin } from '../../context/AdminContext';

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-100 px-3 py-2 text-xs shadow-lg rounded-xl">
      <p className="font-semibold text-gray-700 mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }}>
          {p.name}: ₹{p.value.toLocaleString('en-IN')}
        </p>
      ))}
    </div>
  );
}

export default function Finance() {
  const { adminFinance, adminPaymentsStats, adminPeriodFinance, financePeriod, fetchAdminFinance, syncAdminFinance } = useAdmin();
  const [syncing, setSyncing] = React.useState(false);

  const handlePeriodChange = (e) => {
    fetchAdminFinance(e.target.value);
  };

  const handleSync = async () => {
    setSyncing(true);
    await syncAdminFinance();
    setSyncing(false);
  };

  const finance = adminFinance || { 
    totalRevenue: 0, 
    totalTax: 0, 
    totalShipping: 0, 
    totalExpenses: 0, 
    netProfit: 0, 
    monthlyRevenue: [] 
  };

  const paymentsData = adminPaymentsStats || [];

  return (
    <div className="p-4 space-y-6 page-enter">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Revenue Overview</h1>
          <p className="text-sm text-gray-500 mt-1">Detailed financial performance and periodic analytics</p>
        </div>
        <div className="flex items-center gap-3">
          <select 
            value={financePeriod} 
            onChange={handlePeriodChange}
            className="bg-white border border-gray-200 text-sm font-medium rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-brand-500/20"
          >
            <option value="weekly">Weekly View</option>
            <option value="monthly">Monthly View</option>
            <option value="quarterly">Quarterly View</option>
            <option value="half-yearly">Half-Yearly View</option>
            <option value="annual">Annual View</option>
          </select>
          <button 
            onClick={handleSync}
            disabled={syncing}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
              syncing 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                : 'bg-brand-500 text-white hover:bg-brand-600 shadow-sm hover:shadow-md'
            }`}
          >
            <Activity size={16} className={syncing ? 'animate-spin' : ''} />
            {syncing ? 'Syncing...' : 'Sync Data'}
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard 
          icon={<IndianRupee size={22} />} 
          label="Total Revenue" 
          value={`₹${finance.totalRevenue.toLocaleString('en-IN')}`} 
          growth={12.5} 
          color="brand" 
          delay={0} 
        />
        <StatCard 
          icon={<ArrowDownRight size={22} />} 
          label="Total Expenses" 
          value={`₹${finance.totalExpenses.toLocaleString('en-IN')}`} 
          growth={-2.4} 
          color="blue" 
          delay={80} 
        />
        <StatCard 
          icon={<PieChart size={22} />} 
          label="Total Tax Collected" 
          value={`₹${finance.totalTax.toLocaleString('en-IN')}`} 
          growth={5.2} 
          color="purple" 
          delay={160} 
        />
        <StatCard 
          icon={<Activity size={22} />} 
          label="Net Profit" 
          value={`₹${finance.netProfit.toLocaleString('en-IN')}`} 
          growth={finance.netProfit > 0 ? 8.1 : 0} 
          color="green" 
          delay={240} 
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Revenue Overview Chart */}
        <div className="card p-5 xl:col-span-2">
          <SectionHeader 
            title="Revenue Trend" 
            subtitle={`${financePeriod.charAt(0).toUpperCase() + financePeriod.slice(1).replace('-', ' ')} performance analysis`} 
          />
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart 
              data={adminPeriodFinance.map(d => ({
                label: financePeriod === 'weekly' ? `W${d.week_number} ${d.year}` :
                       financePeriod === 'monthly' ? `${d.month_number}/${d.year}` : 
                       financePeriod === 'quarterly' ? `Q${d.quarter_number} ${d.year}` :
                       financePeriod === 'half-yearly' ? `H${d.half_number} ${d.year}` :
                       `${d.year}`,
                revenue: parseFloat(d.revenue || 0)
              })).reverse()} 
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="revGradFinance" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#f97316" strokeWidth={2.5} fill="url(#revGradFinance)" dot={{ fill: '#f97316', r: 4 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Transactions / Payments Chart */}
        <div className="card p-5">
          <SectionHeader 
            title="Payment Volume" 
            subtitle="Successful transactions per month" 
          />
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={paymentsData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }} barSize={20}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="payments" name="Payments" fill="#f97316" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Secondary Stats/Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card p-5">
          <SectionHeader title="Financial Breakdown" subtitle="Distribution of revenue and costs" />
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-brand-100 text-brand-600 flex items-center justify-center">
                  <IndianRupee size={16} />
                </div>
                <span className="text-sm font-medium text-gray-700">Gross Sales</span>
              </div>
              <span className="font-bold text-gray-900">₹{finance.totalRevenue.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                  <ArrowDownRight size={16} />
                </div>
                <span className="text-sm font-medium text-gray-700">Total Expenses</span>
              </div>
              <span className="font-bold text-red-500">₹{finance.totalExpenses.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center">
                  <PieChart size={16} />
                </div>
                <span className="text-sm font-medium text-gray-700">Tax Liabilities</span>
              </div>
              <span className="font-bold text-gray-900">₹{finance.totalTax.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        <div className="card p-5">
          <SectionHeader title="Profitability" subtitle="Net profit analysis" />
          <div className="flex flex-col items-center justify-center h-48">
            <div className={`text-5xl font-black mb-2 ${finance.netProfit >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
              {finance.netProfit >= 0 ? '+' : ''}₹{finance.netProfit.toLocaleString('en-IN')}
            </div>
            <p className="text-sm text-gray-500">Estimated Net Profit (YTD)</p>
            <div className="mt-6 flex items-center gap-2 text-xs font-bold px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-full">
              <ArrowUpRight size={14} />
              Healthy Profit Margin
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
