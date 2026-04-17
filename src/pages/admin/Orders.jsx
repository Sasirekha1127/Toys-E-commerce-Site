import React, { useState } from 'react';
import { Download, Eye, ChevronDown, X } from 'lucide-react';
import { StatusBadge, Avatar, SearchBar, SectionHeader } from '../../components/admin/ui/index.jsx';
import { useAdmin } from '../../context/AdminContext';

const STATUSES = ['All', 'Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
const STATUS_OPTIONS = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

export default function Orders() {
  const { orders, updateOrderStatus } = useAdmin();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('All');
  const [viewOrder, setViewOrder] = useState(null);
  const [toast, setToast] = useState('');

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 2500); };

  const filtered = orders.filter((o) => {
    const q = search.toLowerCase();
    const matchQ = o.id.toLowerCase().includes(q) || o.customer.toLowerCase().includes(q) || o.product.toLowerCase().includes(q);
    const matchS = status === 'All' || o.status === status;
    return matchQ && matchS;
  });

  const counts = STATUSES.slice(1).map((s) => ({ s, n: orders.filter((o) => o.status === s).length }));

  const handleStatusChange = (orderId, newStatus) => {
    updateOrderStatus(orderId, newStatus);
    showToast(`Order status updated to ${newStatus} ✓`);
    if (viewOrder && viewOrder.id === orderId) {
      setViewOrder((prev) => ({ ...prev, status: newStatus }));
    }
  };

  return (
    <div className="p-4 sm:p-6 page-enter">
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white text-sm px-5 py-3 rounded-2xl shadow-xl animate-slide-up">
          {toast}
        </div>
      )}

      {/* Order Detail Modal */}
      {viewOrder && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <h2 className="text-xl font-bold text-gray-800">Order Details</h2>
                <p className="text-sm text-orange-500 font-medium mt-0.5">{viewOrder.id}</p>
              </div>
              <button onClick={() => setViewOrder(null)} className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center transition">
                <X size={18} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {/* Customer */}
              <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-2xl">
                <Avatar initials={viewOrder.customer.split(' ').map((n) => n[0]).join('')} size="md" />
                <div>
                  <p className="font-semibold text-gray-800">{viewOrder.customer}</p>
                  <p className="text-sm text-gray-500">{viewOrder.email}</p>
                </div>
              </div>

              {/* Details grid */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Order Date', value: viewOrder.date },
                  { label: 'Items', value: `${viewOrder.items} item${viewOrder.items !== 1 ? 's' : ''}` },
                  { label: 'Total Amount', value: `₹${viewOrder.amount.toLocaleString('en-IN')}` },
                  { label: 'Payment', value: 'Paid' },
                ].map((d) => (
                  <div key={d.label} className="p-3 bg-gray-50 rounded-xl">
                    <p className="text-xs text-gray-400 mb-0.5">{d.label}</p>
                    <p className="font-semibold text-gray-800 text-sm">{d.value}</p>
                  </div>
                ))}
              </div>

              {/* Product */}
              <div className="p-3 bg-gray-50 rounded-xl">
                <p className="text-xs text-gray-400 mb-1">Product(s)</p>
                <p className="font-medium text-gray-800">{viewOrder.product}</p>
              </div>

              {/* Status update */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Update Status</p>
                <div className="flex flex-wrap gap-2">
                  {STATUS_OPTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => handleStatusChange(viewOrder.id, s)}
                      className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-all border ${viewOrder.status === s
                        ? 'bg-orange-500 text-white border-orange-500 shadow-sm'
                        : 'border-gray-200 text-gray-600 hover:border-orange-300 hover:text-orange-600'
                        }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-sm text-gray-500">Current status:</span>
                <StatusBadge status={viewOrder.status} />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex justify-end">
              <button onClick={() => setViewOrder(null)} className="btn-primary">Close</button>
            </div>
          </div>
        </div>
      )}

      <SectionHeader
        title="Orders"
        subtitle={`${filtered.length} orders`}
        action={
          <button className="btn-outline" onClick={() => alert('Export feature coming soon')}>
            <Download size={15} /> Export
          </button>
        }
      />

      {/* Status tabs */}
      <div className="flex gap-2 flex-wrap mb-5">
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setStatus(s)}
            className={`px-4 py-1.5 rounded-xl text-sm font-medium transition-all ${status === s
              ? 'bg-brand-500 text-white shadow-sm'
              : 'bg-white border border-gray-200 text-gray-600 hover:border-brand-300 hover:text-brand-600'
              }`}
          >
            {s}
            {s !== 'All' && (
              <span className={`ml-1.5 text-xs ${status === s ? 'opacity-70' : 'text-gray-400'}`}>
                ({counts.find((c) => c.s === s)?.n || 0})
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-3 mb-5">
        <SearchBar value={search} onChange={setSearch} placeholder="Search by order ID, customer, product…" />
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-5">
        {counts.map(({ s, n }) => (
          <div key={s} className="card p-3 text-center cursor-pointer hover:shadow-md transition-all" onClick={() => setStatus(s)}>
            <p className="text-lg font-bold text-gray-900">{n}</p>
            <p className="text-xs text-gray-400 mt-0.5">{s}</p>
          </div>
        ))}
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50/70">
              <tr>
                {['Order ID', 'Customer', 'Product', 'Amount', 'Date', 'Status', 'Actions'].map((h) => (
                  <th key={h} className="table-th whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((o) => (
                <tr key={o.id} className="table-row">
                  <td className="table-td font-medium text-brand-600">{o.id}</td>
                  <td className="table-td">
                    <div className="flex items-center gap-2">
                      <Avatar initials={o.customer.split(' ').map((n) => n[0]).join('')} size="sm" />
                      <div>
                        <p className="whitespace-nowrap font-medium">{o.customer}</p>
                        <p className="text-xs text-gray-400">{o.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="table-td text-gray-500 max-w-[180px] truncate">{o.product}</td>
                  <td className="table-td font-semibold">₹{o.amount.toLocaleString('en-IN')}</td>
                  <td className="table-td text-gray-400 whitespace-nowrap">{o.date}</td>
                  <td className="table-td"><StatusBadge status={o.status} /></td>
                  <td className="table-td">
                    <div className="flex gap-1.5">
                      <button
                        className="btn-ghost p-2 rounded-lg"
                        onClick={() => setViewOrder(o)}
                        title="View details"
                      >
                        <Eye size={15} className="text-blue-500" />
                      </button>
                      {/* Quick status dropdown */}
                      <select
                        value={o.status}
                        onChange={(e) => handleStatusChange(o.id, e.target.value)}
                        className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white text-gray-600 cursor-pointer hover:border-orange-300 focus:outline-none focus:border-orange-400"
                      >
                        {STATUS_OPTIONS.map((s) => <option key={s}>{s}</option>)}
                      </select>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="py-16 text-center">
              <p className="text-4xl mb-3">📋</p>
              <p className="text-gray-500">No orders found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
