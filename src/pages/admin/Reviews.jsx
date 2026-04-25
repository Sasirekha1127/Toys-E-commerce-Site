import React, { useState } from 'react';
import { CheckCircle, Trash2, AlertCircle, X } from 'lucide-react';
import {
  StatusBadge,
  StarRating,
  Avatar,
  SearchBar,
  SectionHeader,
  ConfirmModal,
} from '../../components/admin/ui/index.jsx';
import { useAdmin } from '../../context/AdminContext';

export default function Reviews() {
  const { reviews, approveReview, rejectReview, deleteReview } = useAdmin();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [deleteId, setDeleteId] = useState(null);


  const filtered = reviews.filter((r) => {
    const q = search.toLowerCase();
    const matchQ = r.customer.toLowerCase().includes(q) || r.product.toLowerCase().includes(q) || r.text.toLowerCase().includes(q);
    const matchF = filter === 'All' || r.status === filter;
    return matchQ && matchF;
  });

  const counts = {
    All: reviews.length,
    Approved: reviews.filter((r) => r.status === 'Approved').length,
    Pending: reviews.filter((r) => r.status === 'Pending').length,
    Rejected: reviews.filter((r) => r.status === 'Rejected').length,
  };

  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : '0.0';

  return (
    <div className="p-4 sm:p-6 page-enter">


      <ConfirmModal
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => { deleteReview(deleteId); setDeleteId(null); }}

        title="Delete Review?"
        description="This review will be permanently removed from the system and user side."
      />

      <SectionHeader
        title="Reviews"
        subtitle={`${filtered.length} reviews · Avg ${avgRating}★`}
        action={
          <div className="flex gap-2">
            <span className="badge badge-green">{counts.Approved} Approved</span>
            <span className="badge badge-orange">{counts.Pending} Pending</span>
            <span className="badge badge-red">{counts.Rejected} Rejected</span>
          </div>
        }
      />

      {/* Info banner */}
      <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-100 rounded-xl mb-5 text-sm text-blue-700">
        <CheckCircle size={16} className="text-blue-500 flex-none" />
        Only <strong className="mx-1">Approved</strong> reviews are visible to customers on the user-facing website.
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2 mb-4">
        {['All', 'Approved', 'Pending', 'Rejected'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-xl text-sm font-medium transition-all border ${filter === f
              ? 'bg-orange-500 text-white border-orange-500 shadow-sm'
              : 'bg-white border-gray-200 text-gray-600 hover:border-orange-300 hover:text-orange-600'
              }`}
          >
            {f} <span className={`ml-1 text-xs ${filter === f ? 'opacity-70' : 'text-gray-400'}`}>({counts[f]})</span>
          </button>
        ))}
      </div>

      <div className="mb-5">
        <SearchBar value={search} onChange={setSearch} placeholder="Search by customer, product, review text…" />
      </div>

      {/* Review cards */}
      <div className="space-y-3">
        {filtered.map((r) => (
          <div key={r.id} className={`card p-4 sm:p-5 transition-all hover:-translate-y-0.5 hover:shadow-md ${r.status === 'Rejected' ? 'opacity-60' : ''}`}>
            <div className="flex items-start gap-4">
              {/* Product image */}
              <img
                src={r.productImg}
                alt={r.product}
                className="w-14 h-14 rounded-2xl object-cover bg-orange-50 flex-none hidden sm:block"
                onError={(e) => { e.target.src = 'https://placehold.co/100x100/f3f4f6/a1a1aa?text=Toy'; }}
              />

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Avatar initials={r.avatar} size="sm" />
                      <p className="font-semibold text-gray-800">{r.customer}</p>
                      <StatusBadge status={r.status} />
                    </div>
                    <p className="text-xs text-orange-600 font-medium mt-1">{r.product}</p>
                  </div>
                  <p className="text-xs text-gray-400 whitespace-nowrap">{r.date}</p>
                </div>

                <div className="mt-2">
                  <StarRating rating={r.rating} size={13} />
                </div>

                <p className="text-sm text-gray-600 mt-2 leading-relaxed">{r.text}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-50">
              {r.status !== 'Approved' && (
                <button
                  onClick={() => { approveReview(r.id); }}

                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 text-sm font-medium hover:bg-emerald-100 transition-all border border-emerald-200"
                >
                  <CheckCircle size={14} /> Approve
                </button>
              )}
              {r.status !== 'Rejected' && (
                <button
                  onClick={() => { rejectReview(r.id); }}

                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-50 text-orange-700 text-sm font-medium hover:bg-orange-100 transition-all border border-orange-200"
                >
                  <AlertCircle size={14} /> Reject
                </button>
              )}
              {r.status === 'Approved' && (
                <span className="flex items-center gap-1.5 text-xs text-emerald-600">
                  <CheckCircle size={13} /> Visible on user site
                </span>
              )}
              <button
                onClick={() => setDeleteId(r.id)}
                className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-50 text-red-600 text-sm font-medium hover:bg-red-100 transition-all border border-red-200"
              >
                <Trash2 size={14} /> Delete
              </button>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="py-16 text-center">
            <p className="text-4xl mb-3">⭐</p>
            <p className="text-gray-500">No reviews found</p>
          </div>
        )}
      </div>
    </div>
  );
}
