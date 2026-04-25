import React, { useEffect, useMemo, useState, useCallback } from "react";
import { BarChart2, TrendingUp, Eye, ShoppingCart, Download, X, FileText, Calendar, Clock, Package, DollarSign, CheckCircle, XCircle, Activity, CreditCard, Tag } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

/* Initial Mock Data for Demo Account */
const initialAnalytics = {
  revenue: 20495,
  orders: 8,
  visitors: 1200,
  conversionRate: 3.2,
  topProducts: [
    { name: "Teddy Bear", sales: 120 },
    { name: "RC Car", sales: 95 },
    { name: "Science Kit", sales: 60 },
  ],
  salesOverview: [40, 60, 30, 80, 50, 70]
};

const emptyAnalytics = {
  revenue: 0,
  orders: 0,
  visitors: 0,
  conversionRate: 0,
  topProducts: [],
  salesOverview: [0, 0, 0, 0, 0, 0]
};

export default function Analytics() {
  const currentSeller = useMemo(() => JSON.parse(localStorage.getItem('toyCurrentSeller') || '{}'), []);
  const sellerId = currentSeller?.id || currentSeller?.seller_id;
  const isDemo = currentSeller?.email === 'kidstoys@gmail.com';

  const [data, setData] = useState(emptyAnalytics);
  const [loading, setLoading] = useState(true);
  
  // Report States
  const [reportType, setReportType] = useState(null); // 'daily', 'weekly', 'monthly', 'yearly', 'gst'
  const [reportData, setReportData] = useState(null);
  const [reportLoading, setReportLoading] = useState(false);
  
  // Finance States
  const [financeData, setFinanceData] = useState({
    totalRevenue: 0,
    sellerCommission: 0,
    platformFee: 0,
    pendingPayout: 0,
    completedPayout: 0,
    refundAmount: 0,
    netEarnings: 0,
    taxAmount: 0
  });
  const [payouts, setPayouts] = useState([]);
  const [financeLoading, setFinanceLoading] = useState(!isDemo);

  // Trend Data
  const [trendData, setTrendData] = useState([]);
  const [trendFilter, setTrendFilter] = useState('monthly'); // 'weekly', 'monthly', 'yearly'
  const [trendLoading, setTrendLoading] = useState(true);

  const fetchAnalytics = useCallback(async () => {
    if (!sellerId) {
       setLoading(false);
       return;
    }

    setLoading(true);
    try {
      console.log(`[DEBUG] Fetching analytics for seller_id: "${sellerId}"`);
      const res = await fetch(`http://localhost:5000/api/seller/analytics?seller_id=${sellerId}`);
      const apiData = await res.json();
      console.log("[DEBUG] Analytics API Response:", apiData);
      
      if (!apiData.error) {
        setData({
          revenue: apiData.revenue || 0,
          orders: apiData.orders || 0,
          visitors: apiData.visitors || 0,
          conversionRate: apiData.conversionRate || 0,
          topProducts: apiData.topProducts || [],
          salesOverview: apiData.salesOverview && apiData.salesOverview.length > 0
            ? apiData.salesOverview.map(s => s.revenue)
            : [0, 0, 0, 0, 0, 0]
        });
      }
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
    } finally {
      setLoading(false);
    }
  }, [sellerId]);

  const fetchReport = async (type) => {
    if (!sellerId) return;
    setReportType(type);
    setReportLoading(true);
    try {
      const period = type === 'gst' ? 'monthly' : type;
      const res = await fetch(`http://localhost:5000/api/seller/reports?seller_id=${sellerId}&period=${period}`);
      const data = await res.json();
      setReportData(data);
    } catch (err) {
      console.error('Failed to fetch report:', err);
    } finally {
      setReportLoading(false);
    }
  };

  const fetchFinance = useCallback(async () => {
    if (!sellerId) {
      setFinanceLoading(false);
      return;
    }
    setFinanceLoading(true);
    try {
      const [summaryRes, payoutsRes] = await Promise.all([
        fetch(`http://localhost:5000/api/seller/finance/summary?seller_id=${sellerId}`),
        fetch(`http://localhost:5000/api/seller/finance/payouts?seller_id=${sellerId}`)
      ]);
      const summary = await summaryRes.json();
      const payoutsData = await payoutsRes.json();
      
      console.log("[DEBUG] Finance Summary API Response:", summary);
      console.log("[DEBUG] Payouts API Response:", payoutsData);

      if (!summary.error) setFinanceData(summary);
      if (!payoutsData.error) setPayouts(payoutsData.payouts || []);
    } catch (err) {
      console.error('Failed to fetch finance data:', err);
    } finally {
      setFinanceLoading(false);
    }
  }, [sellerId]);

  const fetchTrendData = useCallback(async () => {
    if (!sellerId) return;
    setTrendLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/seller/revenue-trend?seller_id=${sellerId}&period=${trendFilter}`);
      
      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Server returned non-JSON response. Please restart the backend.");
      }

      const trend = await res.json();
      setTrendData(trend);
    } catch (err) {
      console.error('Failed to fetch trend data:', err);
    } finally {
      setTrendLoading(false);
    }
  }, [sellerId, trendFilter]);

  useEffect(() => {
    fetchAnalytics();
    fetchFinance();
    fetchTrendData();
    // Set up polling for "real-time" feel (every 30 seconds)
    const interval = setInterval(() => {
      fetchAnalytics();
      fetchFinance();
      fetchTrendData();
    }, 30000);
    return () => clearInterval(interval);
  }, [fetchAnalytics, fetchFinance, fetchTrendData]);

  const downloadCSV = () => {
    if (!reportData || !reportData.orders) return;
    
    const headers = ["Order ID", "Products", "Quantity", "Revenue", "Discount", "Tax (GST)", "Payment Method", "Status", "Date"];
    const rows = reportData.orders.map(o => {
      let items = [];
      try { items = Array.isArray(o.items) ? o.items : JSON.parse(o.items || '[]'); } catch (e) { }
      const productNames = items.map(i => i.name || i.product_name).join('; ');
      const totalQty = items.reduce((sum, i) => sum + (i.qty || i.quantity || 1), 0);
      
      return [
        o.id,
        `"${productNames}"`,
        totalQty,
        o.total_amount,
        o.discount_amount,
        o.tax_amount,
        o.payment_method,
        o.payment_status,
        new Date(o.ordered_at).toLocaleDateString()
      ];
    });

    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `${reportType}_report_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Analytics</h1>
          <p className="text-gray-500 mt-1">Real-time performance tracking for your store</p>
        </div>
        <div className="flex flex-wrap gap-2">
           <button onClick={() => fetchReport('daily')} className="report-btn"><Clock size={16}/> Daily</button>
           <button onClick={() => fetchReport('weekly')} className="report-btn"><Calendar size={16}/> Weekly</button>
           <button onClick={() => fetchReport('monthly')} className="report-btn"><Calendar size={16}/> Monthly</button>
           <button onClick={() => fetchReport('yearly')} className="report-btn"><Calendar size={16}/> Yearly</button>
           <button onClick={() => fetchReport('gst')} className="report-btn bg-blue-50 text-blue-600 border-blue-100 hover:bg-blue-100"><FileText size={16}/> GST Invoice</button>
        </div>
      </div>

      {/* Top Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card
          title="Total Revenue"
          value={`₹${parseFloat(data.revenue).toLocaleString('en-IN')}`}
          icon={<TrendingUp className="text-emerald-500" />}
          color="emerald"
        />
        <Card
          title="Total Orders"
          value={data.orders}
          icon={<ShoppingCart className="text-blue-500" />}
          color="blue"
        />
        <Card
          title="Total Visitors"
          value={data.visitors.toLocaleString()}
          icon={<Eye className="text-purple-500" />}
          color="purple"
        />
        <Card
          title="Conversion Rate"
          value={`${data.conversionRate}%`}
          icon={<BarChart2 className="text-orange-500" />}
          color="orange"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Chart */}
        <div className="lg:col-span-2 card p-6 bg-white shadow-sm border border-gray-100 rounded-3xl min-h-[400px]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
            <div>
              <h2 className="font-bold text-gray-800 text-lg">Sales Revenue Trend</h2>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">
                {trendFilter === 'weekly' ? 'Last 8 Weeks' : trendFilter === 'yearly' ? 'Last 5 Years' : 'Last 6 Months'}
              </p>
            </div>
            
            <div className="flex bg-gray-100/80 p-1 rounded-xl">
              {['weekly', 'monthly', 'yearly'].map((f) => (
                <button
                  key={f}
                  onClick={() => setTrendFilter(f)}
                  className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
                    trendFilter === f 
                      ? 'bg-white text-orange-600 shadow-sm shadow-orange-100' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="relative w-full h-[320px] min-w-0">
            {/* Loading Overlay */}
            {trendLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-20 transition-opacity duration-300">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
              </div>
            )}
            
            {/* Empty State Overlay */}
            {!trendLoading && (trendData.length === 0 || trendData.every(d => d.revenue === 0)) && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 italic gap-2 z-10 bg-white">
                <Package size={40} className="opacity-20" />
                <p>No sales data yet</p>
              </div>
            )}

            <ResponsiveContainer width="100%" height={320}>
              <BarChart 
                data={trendData} 
                margin={{ top: 20, right: 10, left: -10, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis 
                  dataKey="label" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#9ca3af', fontSize: 11, fontWeight: 600 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#9ca3af', fontSize: 11, fontWeight: 600 }}
                  tickFormatter={(val) => `₹${val >= 1000 ? (val/1000).toFixed(1) + 'k' : val}`}
                />
                <Tooltip 
                  cursor={{ fill: '#fff7ed', radius: 10 }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-gray-800 text-white p-3 rounded-xl shadow-xl border-none text-xs">
                          <p className="font-bold mb-1">{payload[0].payload.label}</p>
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-orange-400" />
                            <p className="text-gray-300">Revenue: <span className="text-white font-bold">₹{payload[0].value.toLocaleString('en-IN')}</span></p>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar 
                  dataKey="revenue" 
                  fill="#f97316" 
                  radius={[6, 6, 0, 0]} 
                  barSize={trendFilter === 'weekly' ? 30 : trendFilter === 'yearly' ? 60 : 45}
                  animationDuration={1500}
                >
                  {trendData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.revenue > 0 ? 'url(#barGradient)' : '#f3f4f6'} 
                      className="hover:opacity-80 transition-opacity cursor-pointer"
                    />
                  ))}
                </Bar>
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#fb923c" />
                    <stop offset="100%" stopColor="#f97316" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Products */}
        <div className="card p-6 bg-white shadow-sm border border-gray-100 rounded-3xl">
          <h2 className="font-bold text-gray-800 text-lg mb-6">Top Performing Products</h2>
          <div className="space-y-4">
            {data.topProducts.length === 0 ? (
               <div className="flex flex-col items-center justify-center py-10 opacity-40">
                 <Package size={40} className="mb-2" />
                 <p className="text-sm">No sales data yet</p>
               </div>
            ) : (
              data.topProducts.map((p, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-2xl bg-gray-50/50 hover:bg-orange-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-xs">{i+1}</div>
                    <p className="text-sm font-medium text-gray-700 truncate max-w-[120px]">{p.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-900">{p.sales}</p>
                    <p className="text-[10px] text-gray-400 uppercase font-bold">Sales</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Finance Section */}
      <div className="space-y-6 pt-8 border-t border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-orange-500 flex items-center justify-center text-white shadow-lg shadow-orange-200">
            <DollarSign size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-gray-900">Finance Overview</h2>
            <p className="text-sm text-gray-500">Real-time earnings and payout tracking</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card 
            title="Total Revenue" 
            value={`₹${(financeData.totalRevenue || 0).toLocaleString('en-IN')}`} 
            icon={<TrendingUp size={20} className="text-emerald-500" />} 
            color="emerald" 
          />
          <Card 
            title="Seller Commission" 
            value={`₹${(financeData.sellerCommission || 0).toLocaleString('en-IN')}`} 
            icon={<Tag size={20} className="text-orange-500" />} 
            color="orange" 
          />
          <Card 
            title="Platform Fee" 
            value={`₹${(financeData.platformFee || 0).toLocaleString('en-IN')}`} 
            icon={<Activity size={20} className="text-blue-500" />} 
            color="blue" 
          />
          <Card 
            title="Net Earnings" 
            value={`₹${(financeData.netEarnings || 0).toLocaleString('en-IN')}`} 
            icon={<TrendingUp size={20} className="text-emerald-500" />} 
            color="emerald" 
          />
          <Card 
            title="Pending Payout" 
            value={`₹${(financeData.pendingPayout || 0).toLocaleString('en-IN')}`} 
            icon={<Clock size={20} className="text-amber-500" />} 
            color="orange" 
          />
          <Card 
            title="Completed Payout" 
            value={`₹${(financeData.completedPayout || 0).toLocaleString('en-IN')}`} 
            icon={<CheckCircle size={20} className="text-emerald-500" />} 
            color="emerald" 
          />
          <Card 
            title="Refund Amount" 
            value={`₹${(financeData.refundAmount || 0).toLocaleString('en-IN')}`} 
            icon={<XCircle size={20} className="text-red-500" />} 
            color="orange" 
          />
          <Card 
            title="GST/Tax Amount" 
            value={`₹${(financeData.taxAmount || 0).toLocaleString('en-IN')}`} 
            icon={<FileText size={20} className="text-blue-500" />} 
            color="blue" 
          />
        </div>

        {/* Recent Payouts Table */}
        <div className="card bg-white shadow-sm border border-gray-100 rounded-[40px] overflow-hidden">
          <div className="px-8 py-6 border-b border-gray-50 flex items-center justify-between">
             <h3 className="font-bold text-gray-800 text-lg">Recent Payouts & Transactions</h3>
             <button className="text-xs font-bold text-orange-600 hover:text-orange-700">View All</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/50">
                  <th className="px-8 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Transaction ID</th>
                  <th className="px-8 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Order ID</th>
                  <th className="px-8 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Sale Amount</th>
                  <th className="px-8 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Commission</th>
                  <th className="px-8 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Payout</th>
                  <th className="px-8 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Date</th>
                  <th className="px-8 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {payouts.map((p) => (
                  <tr key={p.payout_id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-8 py-4 text-sm font-bold text-gray-900 uppercase">PAY{String(p.payout_id).slice(-6)}</td>
                    <td className="px-8 py-4 text-sm text-gray-600 font-medium">ORD{String(p.order_id).padStart(3, '0')}</td>
                    <td className="px-8 py-4 text-sm font-bold text-gray-900">₹{parseFloat(p.sale_amount).toLocaleString('en-IN')}</td>
                    <td className="px-8 py-4 text-sm text-orange-600 font-medium">-₹{parseFloat(p.commission_amount).toLocaleString('en-IN')}</td>
                    <td className="px-8 py-4 text-sm text-emerald-600 font-black">₹{parseFloat(p.payout_amount).toLocaleString('en-IN')}</td>
                    <td className="px-8 py-4 text-sm text-gray-500 font-medium">{new Date(p.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                    <td className="px-8 py-4 text-right">
                      <span className={`inline-flex px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                        p.status?.toLowerCase() === 'completed' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'
                      }`}>
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {payouts.length === 0 && (
                  <tr>
                    <td colSpan="7" className="px-8 py-20 text-center text-gray-400 italic">No payout history found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Report Modal */}
      {reportType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-5xl h-[90vh] overflow-hidden rounded-[40px] shadow-2xl flex flex-col animate-slide-up">
            
            {/* Modal Header */}
            <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
              <div>
                <h2 className="text-2xl font-black text-gray-900 capitalize">{reportType === 'gst' ? 'GST Invoice Report' : `${reportType} Performance Report`}</h2>
                <p className="text-sm text-gray-500">Detailed analytics and order breakdown</p>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={downloadCSV}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-2xl hover:bg-black transition-all text-sm font-bold shadow-lg shadow-gray-200"
                >
                  <Download size={18} /> Download CSV
                </button>
                <button 
                  onClick={() => { setReportType(null); setReportData(null); }}
                  className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-gray-400"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-gray-50/30">
              {reportLoading ? (
                <div className="h-full flex items-center justify-center">
                   <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
                </div>
              ) : reportData ? (
                <>
                  {/* Summary row */}
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <ReportStat label="Orders" value={reportData.summary.total_orders} icon={<ShoppingCart size={16}/>}/>
                    <ReportStat label="Revenue" value={`₹${parseFloat(reportData.summary.total_revenue).toLocaleString('en-IN')}`} icon={<TrendingUp size={16}/>} highlight/>
                    <ReportStat label="Discounts" value={`₹${parseFloat(reportData.summary.total_discounts).toLocaleString('en-IN')}`} icon={<Tag size={16}/>} color="orange"/>
                    <ReportStat label="GST Collected" value={`₹${parseFloat(reportData.summary.total_tax).toLocaleString('en-IN')}`} icon={<FileText size={16}/>} color="blue"/>
                    <ReportStat label="Payment Status" value={`${reportData.summary.paid_orders} Paid / ${reportData.summary.pending_orders} Pend.`} icon={<CreditCard size={16}/>} color="emerald"/>
                  </div>

                  {/* Orders Table */}
                  <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="bg-gray-50/50">
                            <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Order ID</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Product Name</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-center">Qty</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Revenue</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Discount</th>
                            {reportType === 'gst' && <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">GST</th>}
                            <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Method</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {reportData.orders.map((o) => {
                            let items = [];
                            try { items = Array.isArray(o.items) ? o.items : JSON.parse(o.items || '[]'); } catch (e) { }
                            const totalQty = items.reduce((sum, i) => sum + (i.qty || i.quantity || 1), 0);
                            const pName = items.length > 1 ? `${items[0].name || items[0].product_name} + ${items.length - 1}` : (items[0]?.name || items[0]?.product_name || 'Product');
                            
                            return (
                              <tr key={o.id} className="hover:bg-gray-50/50 transition-colors">
                                <td className="px-6 py-4 text-sm font-bold text-gray-900">ORD{String(o.id).padStart(3, '0')}</td>
                                <td className="px-6 py-4 text-sm text-gray-600">{pName}</td>
                                <td className="px-6 py-4 text-sm text-gray-600 text-center font-medium">{totalQty}</td>
                                <td className="px-6 py-4 text-sm font-bold text-gray-900">₹{parseFloat(o.total_amount).toLocaleString('en-IN')}</td>
                                <td className="px-6 py-4 text-sm text-orange-600 font-medium">-₹{parseFloat(o.discount_amount || 0).toLocaleString('en-IN')}</td>
                                {reportType === 'gst' && <td className="px-6 py-4 text-sm text-blue-600 font-medium">₹{parseFloat(o.tax_amount || 0).toLocaleString('en-IN')}</td>}
                                <td className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">{o.payment_method || 'UPI'}</td>
                                <td className="px-6 py-4 text-right">
                                  <span className={`inline-flex px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                    o.payment_status?.toLowerCase() === 'paid' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'
                                  }`}>
                                    {o.payment_status}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                          {reportData.orders.length === 0 && (
                            <tr>
                              <td colSpan="7" className="px-6 py-20 text-center text-gray-400 italic">No orders found for this period.</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* Reusable Components */
function Card({ title, value, icon, color }) {
  const bgMap = {
    emerald: 'bg-emerald-50 text-emerald-600',
    blue: 'bg-blue-50 text-blue-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600'
  };
  
  return (
    <div className="card p-6 bg-white shadow-sm border border-gray-100 rounded-3xl flex items-center justify-between group hover:border-orange-200 transition-all cursor-default">
      <div>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{title}</p>
        <h2 className="text-2xl font-black text-gray-900">{value}</h2>
      </div>
      <div className={`${bgMap[color]} p-4 rounded-2xl group-hover:scale-110 transition-transform`}>{icon}</div>
    </div>
  );
}

function ReportStat({ label, value, icon, color = "orange", highlight = false }) {
  const colorMap = {
    orange: "text-orange-600 bg-orange-50",
    blue: "text-blue-600 bg-blue-50",
    emerald: "text-emerald-600 bg-emerald-50"
  };

  return (
    <div className={`p-4 rounded-3xl border border-gray-100 ${highlight ? 'bg-orange-500 text-white border-transparent shadow-lg shadow-orange-100' : 'bg-white'}`}>
      <div className="flex items-center gap-2 mb-2">
        <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${highlight ? 'bg-white/20' : colorMap[color]}`}>{icon}</div>
        <p className={`text-[10px] font-bold uppercase tracking-widest ${highlight ? 'text-white/80' : 'text-gray-400'}`}>{label}</p>
      </div>
      <p className="text-lg font-black truncate">{value}</p>
    </div>
  );
}