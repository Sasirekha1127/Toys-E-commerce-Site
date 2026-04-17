import React from 'react';
import { Star, MessageSquare } from 'lucide-react';
import { sellerReviews } from '../../data/seller/index.js';

function StarRating({ rating, size = 14 }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={size}
          className={i <= Math.round(rating) ? 'star-filled' : 'star-empty'}
        />
      ))}
    </span>
  );
}

const avgRating = (sellerReviews.reduce((s, r) => s + r.rating, 0) / sellerReviews.length).toFixed(1);

const ratingDist = [5, 4, 3, 2, 1].map((star) => ({
  star,
  count: sellerReviews.filter((r) => r.rating === star).length,
  pct: Math.round((sellerReviews.filter((r) => r.rating === star).length / sellerReviews.length) * 100),
}));

export default function SellerReviews() {
  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-5">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Reviews</h2>
        <p className="text-sm text-gray-500">{sellerReviews.length} customer reviews</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

        {/* Rating overview */}
        <div className="card p-6 flex items-center gap-6">
          <div className="text-center flex-none">
            <p className="text-5xl font-bold text-gray-900">{avgRating}</p>
            <StarRating rating={parseFloat(avgRating)} size={18} />
            <p className="text-xs text-gray-400 mt-1">{sellerReviews.length} reviews</p>
          </div>
          <div className="flex-1 space-y-1.5">
            {ratingDist.map(({ star, count, pct }) => (
              <div key={star} className="flex items-center gap-2 text-xs">
                <span className="text-gray-500 w-3 text-right">{star}</span>
                <Star size={11} className="star-filled flex-none" />
                <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-400 rounded-full transition-all" style={{ width: `${pct}%` }} />
                </div>
                <span className="text-gray-400 w-5">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick stats */}
        <div className="card p-6 grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-orange-50 rounded-xl">
            <p className="text-2xl font-bold text-orange-600">{sellerReviews.filter((r) => r.rating === 5).length}</p>
            <p className="text-xs text-gray-500 mt-1">5-Star Reviews</p>
          </div>
          <div className="text-center p-3 bg-emerald-50 rounded-xl">
            <p className="text-2xl font-bold text-emerald-600">
              {Math.round((sellerReviews.filter((r) => r.rating >= 4).length / sellerReviews.length) * 100)}%
            </p>
            <p className="text-xs text-gray-500 mt-1">Positive Rate</p>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded-xl">
            <p className="text-2xl font-bold text-blue-600">{sellerReviews.length}</p>
            <p className="text-xs text-gray-500 mt-1">Total Reviews</p>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-xl">
            <p className="text-2xl font-bold text-purple-600">
              {new Set(sellerReviews.map((r) => r.product)).size}
            </p>
            <p className="text-xs text-gray-500 mt-1">Products Reviewed</p>
          </div>
        </div>
      </div>

      {/* Reviews list */}
      <div className="card overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100">
          <MessageSquare size={18} className="text-orange-500" />
          <p className="section-title">Customer Feedback</p>
        </div>
        <div className="divide-y divide-gray-50">
          {sellerReviews.map((r) => (
            <div key={r.id} className="px-5 py-4 hover:bg-gray-50/50 transition-colors">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-brand-grad flex items-center justify-center text-white font-bold text-sm flex-none">
                  {r.avatar}
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-3 mb-1">
                    <p className="font-semibold text-gray-800">{r.customer}</p>
                    <StarRating rating={r.rating} />
                    <span className="text-xs text-gray-400">{r.date}</span>
                  </div>
                  <p className="text-xs text-orange-500 font-medium mb-1.5">{r.product}</p>
                  <p className="text-sm text-gray-600">{r.comment}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
