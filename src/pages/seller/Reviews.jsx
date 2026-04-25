import React, { useEffect, useState, useMemo } from 'react';
import { Star, MessageSquare, Package } from 'lucide-react';
import { formatImageUrl } from '../../context/StoreContext';

function StarRating({ rating, size = 14 }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={size}
          className={i <= Math.round(rating) ? 'text-amber-400 fill-amber-400' : 'text-gray-200'}
        />
      ))}
    </span>
  );
}

export default function SellerReviews() {
  const currentSeller = useMemo(() => JSON.parse(localStorage.getItem('toyCurrentSeller') || '{}'), []);

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReviews = async () => {
    if (!currentSeller?.id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/reviews?seller_id=${currentSeller.id}`);
      const data = await res.json();
      console.log('[DEBUG] Fetched seller reviews response:', data);
      if (data.reviews) setReviews(data.reviews);
    } catch (err) {
      console.error('Failed to fetch reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [currentSeller?.id]);

  const stats = useMemo(() => {
    if (reviews.length === 0) return { avg: "0.0", total: 0, dist: [], positivePct: 0 };
    
    const total = reviews.length;
    const sum = reviews.reduce((s, r) => s + (Number(r.rating) || 0), 0);
    const avg = (sum / total).toFixed(1);
    
    const dist = [5, 4, 3, 2, 1].map(star => {
      const count = reviews.filter(r => Math.round(r.rating) === star).length;
      return {
        star,
        count,
        pct: Math.round((count / total) * 100)
      };
    });

    const positiveCount = reviews.filter(r => r.rating >= 4).length;
    const positivePct = Math.round((positiveCount / total) * 100);

    return { avg, total, dist, positivePct };
  }, [reviews]);

  if (loading) return (
    <div className="p-10 text-center">
      <div className="animate-spin w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full mx-auto mb-4"></div>
      <p className="text-gray-500 font-medium">Loading customer feedback...</p>
    </div>
  );

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Customer Reviews</h2>
          <p className="text-sm text-gray-500 font-medium">Manage and monitor your product ratings</p>
        </div>
        <div className="text-right hidden sm:block">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Last Updated</p>
          <p className="text-sm font-semibold text-gray-700">{new Date().toLocaleDateString()}</p>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-white rounded-3xl border border-gray-100 shadow-sm p-8 flex flex-col items-center justify-center text-center">
          <p className="text-6xl font-black text-gray-900 mb-2">{stats.avg}</p>
          <StarRating rating={parseFloat(stats.avg)} size={24} />
          <p className="text-sm text-gray-500 font-bold mt-4 uppercase tracking-widest">{stats.total} Total Reviews</p>
          <div className="w-full h-px bg-gray-50 my-6"></div>
          <div className="w-full space-y-2">
            {stats.dist.map(({ star, count, pct }) => (
              <div key={star} className="flex items-center gap-3 text-xs">
                <span className="font-bold text-gray-400 w-2">{star}</span>
                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-400 rounded-full" style={{ width: `${pct}%` }} />
                </div>
                <span className="text-gray-400 font-bold w-6">{count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 grid grid-cols-2 gap-4">
          <div className="bg-orange-50 rounded-3xl p-6 flex flex-col justify-between border border-orange-100/50">
            <div className="w-10 h-10 rounded-2xl bg-orange-500 text-white flex items-center justify-center shadow-lg shadow-orange-200 mb-4"><Star size={20} fill="currentColor" /></div>
            <div>
              <p className="text-3xl font-black text-orange-600">{reviews.filter(r => r.rating === 5).length}</p>
              <p className="text-sm font-bold text-orange-400 uppercase tracking-wider">Perfect 5-Stars</p>
            </div>
          </div>
          <div className="bg-emerald-50 rounded-3xl p-6 flex flex-col justify-between border border-emerald-100/50">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-200 mb-4"><Star size={20} fill="currentColor" /></div>
            <div>
              <p className="text-3xl font-black text-emerald-600">{stats.positivePct}%</p>
              <p className="text-sm font-bold text-emerald-400 uppercase tracking-wider">Positive Rate</p>
            </div>
          </div>
          <div className="bg-blue-50 rounded-3xl p-6 flex flex-col justify-between border border-blue-100/50">
            <div className="w-10 h-10 rounded-2xl bg-blue-500 text-white flex items-center justify-center shadow-lg shadow-blue-200 mb-4"><MessageSquare size={20} fill="currentColor" /></div>
            <div>
              <p className="text-3xl font-black text-blue-600">{stats.total}</p>
              <p className="text-sm font-bold text-blue-400 uppercase tracking-wider">Total Feedback</p>
            </div>
          </div>
          <div className="bg-purple-50 rounded-3xl p-6 flex flex-col justify-between border border-purple-100/50">
            <div className="w-10 h-10 rounded-2xl bg-purple-500 text-white flex items-center justify-center shadow-lg shadow-purple-200 mb-4"><Package size={20} /></div>
            <div>
              <p className="text-3xl font-black text-purple-600">{new Set(reviews.map(r => r.product_id)).size}</p>
              <p className="text-sm font-bold text-purple-400 uppercase tracking-wider">Products Covered</p>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
          <div className="flex items-center gap-2">
            <MessageSquare size={18} className="text-orange-500" />
            <h3 className="font-bold text-gray-800">Recent Customer Feedback</h3>
          </div>
          <span className="text-xs font-bold text-gray-400 bg-white px-3 py-1 rounded-full border border-gray-100">{reviews.length} Reviews Found</span>
        </div>

        <div className="divide-y divide-gray-50">
          {reviews.length === 0 ? (
            <div className="py-20 text-center">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare size={24} className="text-gray-300" />
              </div>
              <p className="text-gray-400 font-medium">No reviews found in your database yet.</p>
            </div>
          ) : (
            reviews.map((r) => (
              <div key={r.review_id || r.id} className="p-6 hover:bg-gray-50/50 transition-all duration-200">
                <div className="flex items-start gap-5">
                  {/* Product Image */}
                  <div className="w-16 h-16 rounded-2xl overflow-hidden border border-gray-100 bg-gray-50 flex-none group relative">
                    <img 
                      src={formatImageUrl(r.product_image)} 
                      alt={r.product_name} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      onError={(e) => { e.target.src = '/images/toy-placeholder.png'; }}
                    />
                    <div className="absolute inset-0 bg-black/5"></div>
                  </div>

                  <div className="flex-1 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-white text-[10px] font-black shadow-sm">
                          {(r.customer_name || 'U').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 text-sm">{r.customer_name || 'Anonymous Parent'}</p>
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">{r.customer_email || 'Verified Customer'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <StarRating rating={r.rating} size={14} />
                        <span className="text-[11px] font-bold text-gray-300">{new Date(r.created_at).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5 mb-2">
                        <Package size={12} className="text-orange-400" />
                        <p className="text-xs font-black text-orange-600 uppercase tracking-wide">{r.product_name || 'Unnamed Toy'}</p>
                      </div>
                      <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100/50 relative">
                        <div className="absolute -top-2 left-4 w-4 h-4 bg-gray-50 rotate-45 border-l border-t border-gray-100/50"></div>
                        <p className="text-sm text-gray-700 leading-relaxed italic font-medium">
                          "{r.comment || r.body || 'No review message provided'}"
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
