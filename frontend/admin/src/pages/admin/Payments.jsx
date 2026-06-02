import React from 'react';
import { useAdmin } from '../../context/AdminContext';
import { CreditCard, CheckCircle, XCircle, Clock, IndianRupee, Search, Filter } from 'lucide-react';
import { StatCard, SectionHeader, StatusBadge, Avatar } from '../../components/admin/ui/index.jsx';

export default function Payments() {
  const { adminPayments, updatePaymentStatus } = useAdmin();

  const handleStatusChange = (id, newStatus) => {
    updatePaymentStatus(id, newStatus);
  };

  const totalPaid = adminPayments.filter(p => p.payment_status === 'paid').reduce((sum, p) => sum + Number(p.amount), 0);
  const pendingCount = adminPayments.filter(p => p.payment_status === 'pending').length;

  return (
    <div className="p-4 space-y-6 page-enter">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
        <p className="text-sm text-gray-500 mt-1">Monitor and manage all financial transactions</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard 
          icon={<IndianRupee size={22} />} 
          label="Total Collected" 
          value={`₹${totalPaid.toLocaleString('en-IN')}`} 
          growth={15.4} 
          color="brand" 
          delay={0} 
        />
        <StatCard 
          icon={<Clock size={22} />} 
          label="Pending Payments" 
          value={pendingCount.toString()} 
          growth={-5.2} 
          color="blue" 
          delay={80} 
        />
        <StatCard 
          icon={<CreditCard size={22} />} 
          label="Net Transactions" 
          value={adminPayments.length.toString()} 
          growth={10.1} 
          color="purple" 
          delay={160} 
        />
        <StatCard 
          icon={<CheckCircle size={22} />} 
          label="Success Rate" 
          value="98.2%" 
          growth={0.5} 
          color="green" 
          delay={240} 
        />
      </div>

      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gray-50/30">
          <SectionHeader 
            title="Recent Transactions" 
            subtitle="View and verify payments" 
          />
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
              <input type="text" placeholder="Search payments..." className="pl-9 pr-4 py-2 text-xs border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-100 focus:border-brand-400 outline-none w-full sm:w-64 transition-all" />
            </div>
            <button className="p-2 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
              <Filter size={14} className="text-gray-500" />
            </button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50/70 border-b border-gray-100">
                <th className="table-th text-left">Transaction ID</th>
                <th className="table-th text-left">Customer</th>
                <th className="table-th text-left">Order</th>
                <th className="table-th text-left">Amount</th>
                <th className="table-th text-left">Method</th>
                <th className="table-th text-left">Date</th>
                <th className="table-th text-left">Status</th>
                <th className="table-th text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {adminPayments && adminPayments.length > 0 ? (
                adminPayments.map((payment) => (
                  <tr key={payment.id} className="table-row">
                    <td className="table-td font-bold text-brand-600">
                      {payment.id}
                    </td>
                    <td className="table-td">
                      <div className="flex items-center gap-2">
                        <Avatar name={payment.customer_name || payment.customer_id} size="sm" />
                        <span className="font-medium text-gray-700">{payment.customer_name || 'Guest'}</span>
                      </div>
                    </td>
                    <td className="table-td font-medium text-gray-500">
                      {payment.order_id_display || payment.order_id}
                    </td>
                    <td className="table-td font-bold text-gray-900">
                      ₹{Number(payment.amount).toLocaleString('en-IN')}
                    </td>
                    <td className="table-td">
                      <div className="flex items-center gap-1.5 text-gray-500">
                        <CreditCard size={14} />
                        <span className="text-xs">{payment.payment_method || 'Card'}</span>
                      </div>
                    </td>
                    <td className="table-td text-gray-400 whitespace-nowrap">
                      {new Date(payment.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="table-td">
                      <StatusBadge status={payment.payment_status.charAt(0).toUpperCase() + payment.payment_status.slice(1)} />
                    </td>
                    <td className="table-td text-right">
                      <div className="flex justify-end">
                        <select
                          value={payment.payment_status}
                          onChange={(e) => handleStatusChange(payment.id, e.target.value)}
                          className="text-xs font-semibold bg-white border border-gray-200 rounded-lg px-2 py-1 outline-none hover:border-brand-300 focus:border-brand-500 transition-all cursor-pointer"
                        >
                          <option value="pending">Pending</option>
                          <option value="paid">Paid</option>
                          <option value="failed">Failed</option>
                          <option value="refunded">Refunded</option>
                        </select>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="py-16 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-400">
                      <CreditCard size={40} className="mb-2 opacity-20" />
                      <p className="text-sm">No transaction records found</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
