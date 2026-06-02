import React, { useState } from 'react';
import { Plus, Minus, AlertTriangle, CheckCircle, XCircle, Search } from 'lucide-react';
import { SectionHeader, StatusBadge } from '../../components/admin/ui/index.jsx';
import { useAdmin } from '../../context/AdminContext';

export default function Inventory() {
  const { products, restockProduct } = useAdmin();
  const [toast, setToast] = useState('');
  const [pendingRestock, setPendingRestock] = useState({});
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 2500); };

  const handlePendingQty = (id, delta) => {
    setPendingRestock((prev) => ({
      ...prev,
      [id]: Math.max(0, (prev[id] || 0) + delta),
    }));
  };

  const applyRestock = (id) => {
    const qty = Number(pendingRestock[id] || 0);
    if (qty <= 0) { showToast('Click + to add restock quantity first'); return; }
    const product = products.find(p => p.id === id);
    restockProduct(id, qty);
    setPendingRestock((prev) => ({ ...prev, [id]: 0 }));
    showToast(`${product?.name} restocked +${qty} units ✓`);
  };

  const getStockStatus = (stock) => {
    if (stock === 0) return 'Out of Stock';
    if (stock <= 8) return 'Low Stock';
    return 'In Stock';
  };

  const getStockColor = (stock) => {
    if (stock === 0) return 'bg-red-400';
    if (stock <= 8) return 'bg-orange-400';
    return 'bg-emerald-400';
  };

  const filtered = products.filter((p) => {
    const q = search.toLowerCase();
    const matchQ = p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q);
    const matchStatus = filterStatus === 'All'
      || (filterStatus === 'Out of Stock' && p.stock === 0)
      || (filterStatus === 'Low Stock' && p.stock > 0 && p.stock <= 8)
      || (filterStatus === 'In Stock' && p.stock > 8);
    return matchQ && matchStatus;
  });

  const outOfStock = products.filter(p => p.stock === 0).length;
  const lowStock = products.filter(p => p.stock > 0 && p.stock <= 8).length;
  const inStock = products.filter(p => p.stock > 8).length;

  return (
    <div className="p-4 sm:p-6 page-enter">
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white text-sm px-5 py-3 rounded-2xl shadow-xl animate-slide-up">
          {toast}
        </div>
      )}

      <SectionHeader title="Inventory" subtitle="Stock levels across all products" />

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: 'In Stock', value: inStock, icon: <CheckCircle size={18} />, color: 'bg-emerald-50 text-emerald-700 border-emerald-100', status: 'In Stock' },
          { label: 'Low Stock', value: lowStock, icon: <AlertTriangle size={18} />, color: 'bg-orange-50 text-orange-700 border-orange-100', status: 'Low Stock' },
          { label: 'Out of Stock', value: outOfStock, icon: <XCircle size={18} />, color: 'bg-red-50 text-red-700 border-red-100', status: 'Out of Stock' },
        ].map((c) => (
          <button
            key={c.label}
            onClick={() => setFilterStatus(filterStatus === c.status ? 'All' : c.status)}
            className={`card p-4 text-center border transition-all hover:-translate-y-0.5 hover:shadow-md ${c.color} ${filterStatus === c.status ? 'ring-2 ring-offset-1 ring-orange-300' : ''}`}
          >
            <div className="flex items-center justify-center gap-2 mb-1">{c.icon}</div>
            <p className="text-2xl font-bold">{c.value}</p>
            <p className="text-xs mt-0.5 font-medium">{c.label}</p>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2.5 focus-within:border-brand-400 focus-within:ring-2 focus-within:ring-brand-100 transition-all w-full max-w-xs">
          <Search size={15} className="text-gray-400 flex-none" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products…" className="bg-transparent text-sm outline-none w-full text-gray-700 placeholder:text-gray-400" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {['All', 'In Stock', 'Low Stock', 'Out of Stock'].map((s) => (
            <button key={s} onClick={() => setFilterStatus(s)}
              className={`px-3 py-2 rounded-xl text-sm font-medium transition-all border ${filterStatus === s ? 'bg-orange-500 text-white border-orange-500' : 'bg-white border-gray-200 text-gray-600 hover:border-orange-300'}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Inventory Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50/70">
              <tr>
                {['Product', 'Category', 'Current Stock', 'Stock Level', 'Status', 'Restock'].map((h) => (
                  <th key={h} className="table-th whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((p) => {
                const stockStatus = getStockStatus(p.stock);
                const pending = pendingRestock[p.id] || 0;
                const maxBar = Math.max(100, p.stock + 50);

                return (
                  <tr key={p.id} className="table-row">
                    <td className="table-td">
                      <div className="flex items-center gap-3">
                        <img src={p.image} alt={p.name} className="w-10 h-10 rounded-xl object-cover bg-orange-50 flex-none" />
                        <div>
                          <p className="font-medium text-gray-800">{p.name}</p>
                          <p className="text-xs text-gray-400">{p.id}</p>
                        </div>
                      </div>
                    </td>

                    <td className="table-td">
                      <span className="badge badge-orange">{p.category.replace(' Toys', '')}</span>
                    </td>

                    <td className="table-td">
                      <div className="flex items-center gap-2">
                        <span className={`text-lg font-bold ${p.stock === 0 ? 'text-red-500' : p.stock <= 8 ? 'text-orange-500' : 'text-emerald-600'}`}>
                          {p.stock}
                        </span>
                        <span className="text-xs text-gray-400">units</span>
                        {pending > 0 && (
                          <span className="text-xs text-emerald-600 font-medium bg-emerald-50 px-2 py-0.5 rounded-lg">+{pending} pending</span>
                        )}
                      </div>
                    </td>

                    <td className="table-td">
                      <div className="w-28">
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${getStockColor(p.stock)}`}
                            style={{ width: `${Math.min(100, (p.stock / maxBar) * 100)}%` }}
                          />
                        </div>
                        {pending > 0 && (
                          <div className="h-1 bg-gray-100 rounded-full overflow-hidden mt-0.5">
                            <div className="h-full rounded-full bg-emerald-300" style={{ width: `${Math.min(100, ((p.stock + pending) / maxBar) * 100)}%` }} />
                          </div>
                        )}
                      </div>
                    </td>

                    <td className="table-td">
                      <StatusBadge status={stockStatus} />
                    </td>

                    <td className="table-td">
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => handlePendingQty(p.id, -5)}
                          className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-red-100 flex items-center justify-center text-gray-600 hover:text-red-600 transition-all font-bold text-xs">
                          −5
                        </button>
                        <button onClick={() => handlePendingQty(p.id, -1)}
                          className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-red-100 flex items-center justify-center text-gray-600 hover:text-red-600 transition-all">
                          <Minus size={12} />
                        </button>

                        <span className="w-8 text-center text-sm font-semibold text-gray-800">{pending}</span>

                        <button onClick={() => handlePendingQty(p.id, 1)}
                          className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-emerald-100 flex items-center justify-center text-gray-600 hover:text-emerald-600 transition-all">
                          <Plus size={12} />
                        </button>
                        <button onClick={() => handlePendingQty(p.id, 5)}
                          className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-emerald-100 flex items-center justify-center text-gray-600 hover:text-emerald-600 transition-all font-bold text-xs">
                          +5
                        </button>

                        <button
                          onClick={() => applyRestock(p.id)}
                          disabled={pending === 0}
                          className={`ml-1 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${pending > 0 ? 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-sm' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                        >
                          Restock
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="py-16 text-center">
              <p className="text-4xl mb-3">📦</p>
              <p className="text-gray-500">No products match your filter</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
