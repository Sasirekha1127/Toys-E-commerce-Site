import React, { useState } from 'react';
import { Mail, Phone, Eye, UserX, UserCheck, X } from 'lucide-react';
import { StatusBadge, Avatar, SearchBar, SectionHeader } from '../../components/admin/ui/index.jsx';
import { useAdmin } from '../../context/AdminContext';

export default function Customers() {
  const { customers, orders } = useAdmin();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [viewCustomer, setViewCustomer] = useState(null);
  const [toast, setToast] = useState('');

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 2500); };

  const filtered = customers.filter((c) => {
    const q = search.toLowerCase();
    const matchQ = c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || c.phone.includes(q);
    const matchF = filter === 'All' || c.status === filter;
    return matchQ && matchF;
  });

  // Get orders for a customer
  const getCustomerOrders = (email) => orders.filter((o) => o.email === email);

  return (
    <div className="p-4 sm:p-6 page-enter">
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white text-sm px-5 py-3 rounded-2xl shadow-xl animate-slide-up">
          {toast}
        </div>
      )}

      {/* Customer Detail Modal */}
      {viewCustomer && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-800">Customer Profile</h2>
              <button onClick={() => setViewCustomer(null)} className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center transition">
                <X size={18} />
              </button>
            </div>
            <div className="p-6 space-y-4 overflow-y-auto">
              {/* Avatar + name */}
              <div className="flex items-center gap-4 p-4 bg-orange-50 rounded-2xl">
                <Avatar initials={viewCustomer.avatar} size="lg" />
                <div>
                  <p className="text-lg font-bold text-gray-800">{viewCustomer.name}</p>
                  <p className="text-sm text-gray-500">Member since {viewCustomer.joined}</p>
                  <StatusBadge status={viewCustomer.status} />
                </div>
              </div>

              {/* Contact */}
              <div className="space-y-2">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <Mail size={16} className="text-orange-500" />
                  <span className="text-sm text-gray-700">{viewCustomer.email}</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <Phone size={16} className="text-orange-500" />
                  <span className="text-sm text-gray-700">{viewCustomer.phone}</span>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-blue-50 rounded-xl text-center">
                  <p className="text-2xl font-bold text-blue-600">{viewCustomer.orders}</p>
                  <p className="text-xs text-blue-500 mt-0.5">Total Orders</p>
                </div>
                <div className="p-3 bg-emerald-50 rounded-xl text-center">
                  <p className="text-2xl font-bold text-emerald-600">₹{Number(viewCustomer.spent).toLocaleString('en-IN')}</p>
                  <p className="text-xs text-emerald-500 mt-0.5">Total Spent</p>
                </div>
              </div>

              {/* Recent orders */}
              {(() => {
                const co = getCustomerOrders(viewCustomer.email);
                return co.length > 0 ? (
                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-2">Recent Orders</p>
                    <div className="space-y-2">
                      {co.slice(0, 4).map((o) => (
                        <div key={o.id} className="flex items-center justify-between p-2.5 bg-gray-50 rounded-xl">
                          <div>
                            <p className="text-xs font-medium text-orange-600">{o.id}</p>
                            <p className="text-xs text-gray-600 truncate max-w-[200px]">{o.product}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs font-semibold">₹{o.amount.toLocaleString('en-IN')}</p>
                            <StatusBadge status={o.status} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null;
              })()}
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex justify-end">
              <button onClick={() => setViewCustomer(null)} className="btn-primary">Close</button>
            </div>
          </div>
        </div>
      )}

      <SectionHeader
        title="Customers"
        subtitle={`${filtered.length} customers`}
        action={
          <div className="flex gap-2">
            <span className="badge badge-green">{customers.filter((c) => c.status === 'Active').length} Active</span>
            <span className="badge badge-gray">{customers.filter((c) => c.status === 'Inactive').length} Inactive</span>
          </div>
        }
      />

      <div className="flex flex-wrap gap-3 mb-5">
        <SearchBar value={search} onChange={setSearch} placeholder="Search customers…" />
        <div className="flex gap-2">
          {['All', 'Active', 'Inactive'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all border ${filter === f
                ? 'bg-orange-500 text-white border-orange-500'
                : 'bg-white border-gray-200 text-gray-600 hover:border-orange-300'
                }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        {[
          { label: 'Total Customers', value: customers.length, color: 'bg-blue-50 text-blue-600' },
          { label: 'Active', value: customers.filter(c => c.status === 'Active').length, color: 'bg-emerald-50 text-emerald-600' },
          { label: 'Inactive', value: customers.filter(c => c.status === 'Inactive').length, color: 'bg-gray-50 text-gray-600' },
          { label: 'Total Revenue', value: `₹${customers.reduce((s, c) => s + (c.spent || 0), 0).toLocaleString('en-IN')}`, color: 'bg-orange-50 text-orange-600' },
        ].map((s) => (
          <div key={s.label} className={`card p-4 ${s.color} border-0`}>
            <p className="text-xl font-bold">{s.value}</p>
            <p className="text-xs mt-0.5 opacity-70">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50/70">
              <tr>
                {['Customer', 'Contact', 'Orders', 'Total Spent', 'Joined', 'Status', 'Actions'].map((h) => (
                  <th key={h} className="table-th whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((c) => (
                <tr key={c.id} className="table-row">
                  <td className="table-td">
                    <div className="flex items-center gap-3">
                      <Avatar initials={c.avatar} size="sm" />
                      <div>
                        <p className="font-medium text-gray-800">{c.name}</p>
                        <p className="text-xs text-gray-400">{c.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="table-td">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5 text-xs text-gray-500">
                        <Mail size={11} className="text-orange-400" /> {c.email}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-gray-500">
                        <Phone size={11} className="text-orange-400" /> {c.phone}
                      </div>
                    </div>
                  </td>
                  <td className="table-td">
                    <span className="font-semibold text-gray-900">{c.orders}</span>
                    <span className="text-xs text-gray-400 ml-1">orders</span>
                  </td>
                  <td className="table-td font-semibold text-gray-900">₹{Number(c.spent).toLocaleString('en-IN')}</td>
                  <td className="table-td text-gray-400 whitespace-nowrap">{c.joined}</td>
                  <td className="table-td"><StatusBadge status={c.status} /></td>
                  <td className="table-td">
                    <button
                      className="btn-ghost p-2 rounded-lg"
                      onClick={() => setViewCustomer(c)}
                      title="View profile"
                    >
                      <Eye size={15} className="text-blue-500" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="py-16 text-center">
              <p className="text-4xl mb-3">👥</p>
              <p className="text-gray-500">No customers found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
