import React, { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, PackageX, CheckCircle, RefreshCw, X } from 'lucide-react';
import { sellerProducts as initialProducts } from '../../data/seller/index.js';

const STORAGE_KEY = "toySellerInventory_v1";

function fmt(n) {
  return new Intl.NumberFormat('en-IN').format(n);
}

function getStatus(stock) {
  if (stock === 0) return 'Out of Stock';
  if (stock <= 5) return 'Low Stock';
  return 'Active';
}

function StatusBadge({ status }) {
  const map = {
    Active: 'badge-green',
    'Low Stock': 'badge-orange',
    'Out of Stock': 'badge-red',
  };
  return <span className={`badge ${map[status]}`}>{status}</span>;
}

function StockBar({ stock }) {
  const pct = Math.min((stock / 150) * 100, 100);
  const color =
    stock === 0 ? 'bg-red-400' :
    stock <= 5 ? 'bg-orange-400' :
    'bg-green-400';

  return (
    <div className="w-full h-1.5 bg-gray-100 rounded-full">
      <div className={`${color} h-full`} style={{ width: `${pct}%` }} />
    </div>
  );
}

function getInitialProducts() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (stored) return stored;
  } catch {}

  const data = initialProducts.map(p => ({
    ...p,
    stock: Number(p.stock || 0),
    status: getStatus(Number(p.stock || 0)),
  }));

  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  return data;
}

export default function SellerInventory() {
  const [products, setProducts] = useState(getInitialProducts);
  const [selected, setSelected] = useState(null);
  const [qty, setQty] = useState('');

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
  }, [products]);

  const stats = useMemo(() => {
    return {
      healthy: products.filter(p => p.stock > 5).length,
      low: products.filter(p => p.stock > 0 && p.stock <= 5).length,
      out: products.filter(p => p.stock === 0).length,
    };
  }, [products]);

  const openRestock = (product) => {
    setSelected(product);
    setQty('');
  };

  const closeModal = () => {
    setSelected(null);
    setQty('');
  };

  const handleRestock = () => {
    if (!qty || Number(qty) <= 0) return;

    setProducts(prev =>
      prev.map(p =>
        p.id === selected.id
          ? {
              ...p,
              stock: p.stock + Number(qty),
              status: getStatus(p.stock + Number(qty)),
            }
          : p
      )
    );

    closeModal();
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-5">

      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-gray-900">Inventory</h2>
        <p className="text-sm text-gray-500">Manage stock & restock items</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card p-4 flex items-center gap-3">
          <CheckCircle className="text-green-500" />
          <div>
            <p className="text-xl font-bold">{stats.healthy}</p>
            <p className="text-xs text-gray-400">In Stock</p>
          </div>
        </div>

        <div className="card p-4 flex items-center gap-3">
          <AlertTriangle className="text-orange-500" />
          <div>
            <p className="text-xl font-bold">{stats.low}</p>
            <p className="text-xs text-gray-400">Low Stock</p>
          </div>
        </div>

        <div className="card p-4 flex items-center gap-3">
          <PackageX className="text-red-500" />
          <div>
            <p className="text-xl font-bold">{stats.out}</p>
            <p className="text-xs text-gray-400">Out of Stock</p>
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="table-th">Product</th>
                <th className="table-th">Category</th>
                <th className="table-th">Stock</th>
                <th className="table-th">Bar</th>
                <th className="table-th">Status</th>
                <th className="table-th">Action</th>
              </tr>
            </thead>

            <tbody>
              {products.map(p => (
                <tr key={p.id} className="table-row">
                  <td className="table-td flex items-center gap-3">
                    <img src={p.image} className="w-10 h-10 rounded-xl object-cover" />
                    <span>{p.name}</span>
                  </td>

                  <td className="table-td">{p.category}</td>

                  <td className="table-td font-semibold">
                    {p.stock} units
                  </td>

                  <td className="table-td w-32">
                    <StockBar stock={p.stock} />
                  </td>

                  <td className="table-td">
                    <StatusBadge status={p.status} />
                  </td>

                  <td className="table-td">
                    {(p.status !== 'Active') ? (
                      <button
                        onClick={() => openRestock(p)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-orange-50 text-orange-600 rounded-lg hover:bg-orange-100"
                      >
                        <RefreshCw size={14} />
                        Restock
                      </button>
                    ) : (
                      <span className="text-gray-400 text-xs">Good</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>

          </table>
        </div>
      </div>

      {/* MODAL */}
      {selected && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold">Restock</h3>
              <X onClick={closeModal} className="cursor-pointer" />
            </div>

            <p className="text-sm mb-3">{selected.name}</p>

            <input
              type="number"
              className="input w-full"
              placeholder="Enter quantity"
              value={qty}
              onChange={(e) => setQty(e.target.value)}
            />

            <button
              onClick={handleRestock}
              className="btn-primary w-full mt-4"
            >
              Add Stock
            </button>
          </div>
        </div>
      )}
    </div>
  );
}