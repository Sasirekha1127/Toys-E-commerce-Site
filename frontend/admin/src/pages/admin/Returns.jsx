import React from 'react';
import { useAdmin } from '../../context/AdminContext';
import { CornerDownLeft, Check, X, AlertCircle, RotateCcw, Package, IndianRupee, Search, Filter } from 'lucide-react';
import { StatCard, SectionHeader, StatusBadge, Avatar } from '../../components/admin/ui/index.jsx';

export default function Returns() {
  const { adminReturns, updateReturnStatus } = useAdmin();

  const handleStatusChange = (id, newStatus) => {
    updateReturnStatus(id, newStatus, 'Status updated by admin', '1');
  };

  const pendingCount = adminReturns.filter(r => r.refund_status === 'pending').length;
  const totalRefundAmount = adminReturns.filter(r => r.refund_status === 'approved' || r.refund_status === 'processed').reduce((sum, r) => sum + Number(r.refund_amount || 0), 0);

  return (
    <div className="p-4 space-y-6 page-enter">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Returns</h1>
        <p className="text-sm text-gray-500 mt-1">Manage and process customer refund requests</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard 
          icon={<AlertCircle size={22} />} 
          label="Active Requests" 
          value={pendingCount.toString()} 
          growth={2.5} 
          color="brand" 
          delay={0} 
        />
        <StatCard 
          icon={<IndianRupee size={22} />} 
          label="Total Refunded" 
          value={`₹${totalRefundAmount.toLocaleString('en-IN')}`} 
          growth={8.2} 
          color="blue" 
          delay={80} 
        />
        <StatCard 
          icon={<RotateCcw size={22} />} 
          label="Return Rate" 
          value="4.1%" 
          growth={-1.2} 
          color="purple" 
          delay={160} 
        />
        <StatCard 
          icon={<Package size={22} />} 
          label="Restocked Items" 
          value="124" 
          growth={14.5} 
          color="green" 
          delay={240} 
        />
      </div>

      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gray-50/30">
          <SectionHeader 
            title="Return Requests" 
            subtitle="Review and process incoming requests" 
          />
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
              <input type="text" placeholder="Search returns..." className="pl-9 pr-4 py-2 text-xs border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-100 focus:border-brand-400 outline-none w-full sm:w-64 transition-all" />
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
                <th className="table-th text-left">Request ID</th>
                <th className="table-th text-left">Customer</th>
                <th className="table-th text-left">Order</th>
                <th className="table-th text-left">Reason</th>
                <th className="table-th text-left">Amount</th>
                <th className="table-th text-left">Date</th>
                <th className="table-th text-left">Status</th>
                <th className="table-th text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {adminReturns && adminReturns.length > 0 ? (
                adminReturns.map((req) => (
                  <tr key={req.return_request_id} className="table-row">
                    <td className="table-td font-bold text-brand-600">
                      #{req.return_request_id.slice(0, 6).toUpperCase()}
                    </td>
                    <td className="table-td">
                      <div className="flex items-center gap-2">
                        <Avatar name={req.customer_name || req.customer_id} size="sm" />
                        <span className="font-medium text-gray-700">{req.customer_name || 'Customer'}</span>
                      </div>
                    </td>
                    <td className="table-td font-medium text-gray-500">
                      {req.order_id_display || req.order_id}
                    </td>
                    <td className="table-td max-w-xs">
                      <p className="text-xs text-gray-600 truncate">{req.reason}</p>
                    </td>
                    <td className="table-td font-bold text-gray-900">
                      ₹{Number(req.refund_amount || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="table-td text-gray-400 whitespace-nowrap">
                      {new Date(req.requested_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="table-td">
                      <StatusBadge status={req.refund_status?.charAt(0).toUpperCase() + req.refund_status?.slice(1) || 'Pending'} />
                    </td>
                    <td className="table-td text-right">
                      <div className="flex justify-end">
                        <select
                          value={req.refund_status || 'pending'}
                          onChange={(e) => handleStatusChange(req.return_request_id, e.target.value)}
                          className="text-xs font-semibold bg-white border border-gray-200 rounded-lg px-2 py-1 outline-none hover:border-brand-300 focus:border-brand-500 transition-all cursor-pointer"
                        >
                          <option value="pending">Pending</option>
                          <option value="approved">Approve</option>
                          <option value="rejected">Reject</option>
                          <option value="processed">Processed</option>
                        </select>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="py-16 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-400">
                      <CornerDownLeft size={40} className="mb-2 opacity-20" />
                      <p className="text-sm">No return requests found</p>
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
