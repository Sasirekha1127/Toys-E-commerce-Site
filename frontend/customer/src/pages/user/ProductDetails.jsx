import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ShoppingCart, Heart, ShieldCheck, Truck, RotateCcw,
  Plus, Minus, X, ArrowLeft, Star, ChevronLeft, ChevronRight,
  CheckCircle2, Zap, AlertTriangle,
} from 'lucide-react';
import { useStore } from '../../hooks/useStore';

import { parsePrice, formatImageUrl, getProductImage } from '../../context/StoreContext';
import Rating from '../../components/user/Rating';
import VariantSelector from '../../components/user/Variantselector.jsx';
import { allProducts as allProductsData } from '../../data/user';



const BASE_URL = 'http://localhost:5000';

function RatingStar({ rating, onSetRating, size = 18, interactive = false }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          size={size}
          onClick={() => interactive && onSetRating && onSetRating(s)}
          className={`${s <= rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200'} ${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : ''}`}
        />
      ))}
    </div>
  );
}

function SubmitReviewForm({ productId, onReviewSubmitted }) {
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [images, setImages] = useState([]);
  const [video, setVideo] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  let user = null;
  try {
    user = JSON.parse(localStorage.getItem('toyCurrentUser'));
  } catch {
    user = null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) { alert('Please login to submit a review'); return; }
    if (rating === 0) { alert('Please select a star rating before submitting.'); return; }

    setIsSubmitting(true);
    const formData = new FormData();
    formData.append('productId', productId);
    formData.append('customerId', user.id);
    formData.append('rating', rating);
    formData.append('title', title);
    formData.append('body', body);
    images.forEach(img => formData.append('images', img));
    if (video) formData.append('video', video);

    try {
      const res = await fetch(`${BASE_URL}/api/reviews`, { method: 'POST', body: formData });
      if (res.ok) {
        setTitle('');
        setBody('');
        setImages([]);
        setVideo(null);
        setRating(0);
        setShowForm(false);
        if (onReviewSubmitted) onReviewSubmitted();
      }
    } catch (err) {
      console.error('Submit failed:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) return (
    <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4 text-center">
      <p className="text-orange-600 font-bold mb-2">Want to share your experience?</p>
      <p className="text-xs text-orange-400 mb-0">Please login to write a review and help other parents!</p>
    </div>
  );

  if (!showForm) return (
    <button onClick={() => setShowForm(true)} className="w-full py-3 rounded-2xl border-2 border-dashed border-orange-300 text-orange-500 font-bold hover:bg-orange-50 transition-colors flex items-center justify-center gap-2">
      <CheckCircle2 size={18} /> Write a Review
    </button>
  );

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-orange-100 rounded-3xl p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-lg text-gray-800">Your Review</h3>
        <button type="button" onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
      </div>
      <div className="space-y-1">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Overall Rating</p>
        <RatingStar rating={rating} onSetRating={setRating} size={24} interactive />
      </div>
      <input type="text" placeholder="Review Title (e.g. Excellent toy!)" value={title} onChange={(e) => setTitle(e.target.value)} required className="w-full px-4 py-2.5 rounded-xl border border-orange-100 focus:outline-none focus:ring-2 focus:ring-orange-500/20 text-sm font-bold text-gray-800" />
      <textarea placeholder="Share your experience with this toy..." value={body} onChange={(e) => setBody(e.target.value)} required rows={4} className="w-full px-4 py-2.5 rounded-xl border border-orange-100 focus:outline-none focus:ring-2 focus:ring-orange-500/20 text-sm text-gray-600 leading-relaxed" />
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <p className="text-[10px] font-bold text-gray-400 uppercase">Upload Photos (Max 5)</p>
          <input type="file" accept="image/*" multiple onChange={(e) => setImages(Array.from(e.target.files || []).slice(0, 5))} className="text-xs text-gray-500 file:mr-2 file:py-1 file:px-2 file:rounded-full file:border-0 file:text-[10px] file:font-bold file:bg-orange-50 file:text-orange-600 hover:file:bg-orange-100" />
        </div>
        <div className="space-y-1">
          <p className="text-[10px] font-bold text-gray-400 uppercase">Upload Video</p>
          <input type="file" accept="video/*" onChange={(e) => setVideo(e.target.files?.[0] || null)} className="text-xs text-gray-500 file:mr-2 file:py-1 file:px-2 file:rounded-full file:border-0 file:text-[10px] file:font-bold file:bg-orange-50 file:text-orange-600 hover:file:bg-orange-100" />
        </div>
      </div>
      <button type="submit" disabled={isSubmitting} className="w-full py-3 rounded-2xl bg-orange-500 text-white font-bold shadow-lg hover:bg-orange-600 transition-all active:scale-95 disabled:opacity-50">
        {isSubmitting ? 'Submitting...' : 'Submit Review'}
      </button>
    </form>
  );
}

function RatingBar({ star, count, total }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  const color = star >= 4 ? 'from-green-400 to-green-500' : star === 3 ? 'from-yellow-400 to-amber-400' : 'from-red-400 to-red-500';
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-0.5 w-10 shrink-0 justify-end">
        <span className="text-xs font-bold text-gray-700">{star}</span>
        <Star size={10} className="text-amber-400 fill-amber-400" />
      </div>
      <div className="flex-1 h-1.5 rounded-full bg-orange-100 overflow-hidden">
        <div className={`h-full rounded-full bg-gradient-to-r ${color} transition-all duration-700`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-gray-400 w-5 text-right font-medium">{count}</span>
    </div>
  );
}

function ReviewCard({ r }) {
  const initials = r.customer_name ? r.customer_name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U';
  const name = r.customer_name || 'User';
  let dateStr = '';
  try {
    dateStr = new Date(r.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch { dateStr = ''; }

  const images = Array.isArray(r.images) ? r.images : [];

  return (
    <div className="bg-white rounded-2xl border border-orange-100 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 p-4">
      <div className="flex items-start justify-between mb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-400 to-amber-400 flex items-center justify-center text-xs font-extrabold text-white shrink-0">{initials}</div>
          <div>
            <p className="text-sm font-bold text-gray-800 leading-tight">{name}</p>
            <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-green-600"><CheckCircle2 size={9} /> Verified Buyer</span>
          </div>
        </div>
        <div className="flex items-center gap-0.5 bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded-md shrink-0">
          {r.rating}<Star size={9} className="fill-white text-white ml-0.5" />
        </div>
      </div>
      <p className="text-sm font-bold text-gray-800 mb-1">{r.title}</p>
      <p className="text-xs text-gray-500 leading-relaxed mb-3">{r.body}</p>
      {(images.length > 0 || r.video_url) && (
        <div className="flex gap-1.5 mb-3 overflow-x-auto pb-1 scrollbar-hide">
          {images.map((img, i) => <img key={i} src={formatImageUrl(img)} className="w-12 h-12 rounded-lg object-cover border border-orange-50" alt="" />)}
          {r.video_url && (
            <div className="w-12 h-12 rounded-lg bg-orange-50 flex items-center justify-center text-orange-500 border border-orange-100 relative">
              <RotateCcw size={12} className="relative z-10" />
              <span className="absolute bottom-0 right-0 p-0.5 bg-orange-500 text-white text-[6px] rounded-tl">VID</span>
            </div>
          )}
        </div>
      )}
      <div className="flex items-center justify-between">
        <span className="text-[11px] text-gray-400">{dateStr}</span>
      </div>
    </div>
  );
}

function PhotoReviewLightbox({ reviews, startIndex, onClose }) {
  const [current, setCurrent] = useState(startIndex);
  const r = reviews[current] || {};
  const prev = () => setCurrent((c) => Math.max(0, c - 1));
  const next = () => setCurrent((c) => Math.min(reviews.length - 1, c + 1));

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const images = Array.isArray(r.images) ? r.images : [];
  const displayImage = images[0] ? `${BASE_URL}${images[0]}` : null;
  let dateStr = '';
  try { dateStr = r.created_at ? new Date(r.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : ''; } catch { dateStr = ''; }

  return (
    <div className="fixed inset-0 z-[999] bg-gray-950/90 flex items-center justify-center p-4" onClick={onClose}>
      <div className="relative w-full max-w-4xl bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row" style={{ maxHeight: '90vh' }} onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-3 left-3 z-10 w-8 h-8 rounded-full bg-white/90 text-gray-700 flex items-center justify-center hover:bg-white shadow transition"><X size={16} /></button>
        <div className="relative md:w-3/5 bg-gray-100 flex items-center justify-center" style={{ minHeight: '320px' }}>
          {r.video_url ? (
            <video src={`${BASE_URL}${r.video_url}`} controls autoPlay className="w-full h-full object-contain" style={{ maxHeight: '90vh' }} />
          ) : displayImage ? (
            <img src={displayImage} alt={r.title || ''} className="w-full h-full object-contain" style={{ maxHeight: '90vh' }} />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-orange-50 text-orange-300 text-sm">No Image</div>
          )}
          {current > 0 && <button onClick={(e) => { e.stopPropagation(); prev(); }} className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 flex items-center justify-center shadow hover:bg-white transition"><ChevronLeft size={20} className="text-gray-700" /></button>}
          {current < reviews.length - 1 && <button onClick={(e) => { e.stopPropagation(); next(); }} className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 flex items-center justify-center shadow hover:bg-white transition"><ChevronRight size={20} className="text-gray-700" /></button>}
        </div>
        <div className="md:w-2/5 flex flex-col overflow-y-auto bg-white" style={{ maxHeight: '90vh' }}>
          <div className="p-6 border-b border-orange-50">
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center gap-0.5 bg-green-500 text-white text-xs font-bold px-2.5 py-1 rounded-lg">{r.rating}<Star size={10} className="fill-white text-white ml-0.5" /></div>
              <span className="text-xs text-gray-400">{dateStr}</span>
            </div>
            <p className="text-lg font-bold text-gray-900 mb-2">{r.title}</p>
            <p className="text-sm text-gray-600 leading-relaxed mb-6">{r.body}</p>
          </div>
          <div className="p-6 bg-orange-50/30">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-amber-400 flex items-center justify-center text-sm font-extrabold text-white">{r.customer_name?.[0] || 'U'}</div>
              <div>
                <p className="text-sm font-bold text-gray-800">{r.customer_name || 'Verified Buyer'}</p>
                <div className="flex items-center gap-1 text-[10px] font-bold text-green-600"><CheckCircle2 size={10} /> Verified Purchase</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function RatingsAndReviewsSection({ product, reviews, onReviewSubmitted }) {
  const [lightboxIndex, setLightboxIndex] = useState(null);

  const safeReviews = Array.isArray(reviews) ? reviews : [];
  const photoReviews = safeReviews.filter(r => (Array.isArray(r.images) && r.images.length > 0) || r.video_url);
  const total = safeReviews.length;
  const avg = total > 0 ? safeReviews.reduce((sum, r) => sum + Number(r.rating || 0), 0) / total : Number(product?.rating || 4.5);
  const breakdown = [5, 4, 3, 2, 1].map((s) => ({ star: s, count: safeReviews.filter((r) => Number(r.rating) === s).length }));
  const ratingLabel = (r) => (r >= 4.5 ? 'Excellent' : r >= 4 ? 'Very Good' : r >= 3 ? 'Good' : 'Average');

  return (
    <section className="mt-16" id="reviews-section">
      <div className="flex items-center gap-4 mb-6">
        <div className="flex-1 h-px bg-orange-100" />
        <h2 className="font-display text-2xl text-orange-700 whitespace-nowrap">Ratings &amp; Reviews</h2>
        <div className="flex-1 h-px bg-orange-100" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-8 mb-8 items-start">
        <div className="space-y-8">
          <div className="bg-gradient-to-br from-orange-50 to-white border border-orange-100 rounded-3xl p-5 md:p-7 shadow-sm">
            <div className="grid grid-cols-1 sm:grid-cols-[auto_1fr] gap-8 items-center">
              <div className="flex flex-col items-center text-center sm:pr-8 sm:border-r sm:border-orange-100">
                <p className="text-7xl font-extrabold text-orange-500 leading-none">{avg.toFixed(1)}</p>
                <div className="my-3"><RatingStar rating={Math.round(avg)} /></div>
                <p className="text-sm font-bold text-orange-600">{ratingLabel(avg)}</p>
                <p className="text-xs text-gray-400 mt-1">{total} Verified Ratings</p>
              </div>
              <div className="flex flex-col gap-2 flex-1">
                {breakdown.map(({ star, count }) => <RatingBar key={star} star={star} count={count} total={total} />)}
              </div>
            </div>
          </div>
          {photoReviews.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4 px-1">
                <h3 className="font-display text-lg text-gray-800">Customer Photos & Videos <span className="ml-2 text-sm font-semibold text-orange-500 bg-orange-50 border border-orange-100 rounded-full px-2.5 py-0.5">{photoReviews.length}</span></h3>
              </div>
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                {photoReviews.map((p, i) => {
                  const pImages = Array.isArray(p.images) ? p.images : [];
                  return (
                    <button key={p.review_id || i} onClick={() => setLightboxIndex(i)} className="aspect-square rounded-2xl overflow-hidden border-2 border-transparent hover:border-orange-400 transition-all duration-200 hover:scale-105 relative group shadow-sm bg-gray-50">
                      {pImages[0] ? <img src={formatImageUrl(pImages[0])} className="w-full h-full object-cover" alt="" /> : <div className="w-full h-full flex items-center justify-center text-orange-500 bg-orange-50"><CheckCircle2 size={24} /></div>}
                      {p.video_url && !pImages[0] && <div className="absolute inset-0 flex items-center justify-center bg-black/20"><RotateCcw className="text-white" size={20} /></div>}
                      <div className="absolute bottom-1 left-1 opacity-0 group-hover:opacity-100 transition-opacity bg-green-500 text-white text-[8px] font-bold px-1 py-0.5 rounded">{p.rating}★</div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
          <div className="space-y-4">
            <h3 className="font-display text-lg text-gray-800 mb-2 px-1">Recent Reviews</h3>
            {safeReviews.length > 0 ? (
              safeReviews.slice(0, 10).map((r, i) => <ReviewCard key={r.review_id || i} r={r} />)
            ) : (
              <div className="text-center py-10 bg-orange-50/30 rounded-3xl border border-dashed border-orange-100">
                <p className="text-gray-400 text-sm">No reviews yet. Be the first to share your thoughts!</p>
              </div>
            )}
          </div>
        </div>
        <div className="sticky top-28 space-y-6">
          <SubmitReviewForm productId={product?.pid || product?.id} onReviewSubmitted={onReviewSubmitted} />
          <div className="bg-orange-50 rounded-2xl p-4 border border-orange-100">
            <h4 className="text-xs font-bold text-orange-600 uppercase mb-2">Why Review?</h4>
            <ul className="text-[11px] text-orange-400 space-y-2 font-medium">
              <li className="flex gap-2"><CheckCircle2 size={12} className="shrink-0" /> Help other parents make choices</li>
              <li className="flex gap-2"><CheckCircle2 size={12} className="shrink-0" /> Share your child's reaction</li>
              <li className="flex gap-2"><CheckCircle2 size={12} className="shrink-0" /> Earn "Verified Reviewer" badge</li>
            </ul>
          </div>
        </div>
      </div>
      {lightboxIndex !== null && <PhotoReviewLightbox reviews={photoReviews} startIndex={lightboxIndex} onClose={() => setLightboxIndex(null)} />}
    </section>
  );
}

function ProductDetailsSkeleton() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 mt-32 animate-pulse">
      <div className="h-12 w-36 rounded-2xl bg-orange-100 mb-6" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
        <div className="space-y-4">
          <div className="w-full aspect-square rounded-3xl bg-orange-100" />
          <div className="flex gap-3 justify-center">{[1, 2, 3].map(i => <div key={i} className="w-20 h-20 rounded-2xl bg-orange-100" />)}</div>
        </div>
        <div className="flex flex-col gap-5">
          <div className="h-7 w-32 rounded-full bg-orange-100" />
          <div className="h-10 w-3/4 rounded-xl bg-orange-100" />
          <div className="h-6 w-52 rounded-xl bg-orange-100" />
          <div className="h-10 w-44 rounded-xl bg-orange-100" />
          <div className="space-y-2">{[1, 2, 3].map(i => <div key={i} className="h-4 rounded bg-gray-200" />)}</div>
          <div className="h-5 w-48 rounded bg-green-100" />
          <div className="h-20 w-full rounded-2xl bg-orange-50 border border-orange-100" />
          <div className="flex gap-3">
            <div className="h-12 flex-1 rounded-2xl bg-orange-200" />
            <div className="h-12 w-12 rounded-2xl bg-orange-100" />
          </div>
          <div className="h-12 w-full rounded-2xl bg-orange-100" />
          <div className="grid grid-cols-3 gap-3 pt-2">{[1, 2, 3].map(i => <div key={i} className="h-16 rounded-2xl bg-gray-100" />)}</div>
        </div>
      </div>
    </div>
  );
}

function VariantRequiredBanner({ hasVariants, selectedVariant, onScrollToVariants }) {
  if (!hasVariants || selectedVariant) return null;
  return (
    <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-2.5 text-amber-700 text-sm font-semibold animate-pulse">
      <AlertTriangle size={16} className="shrink-0 text-amber-500" />
      <span>Please select a variant option above</span>
      <button onClick={onScrollToVariants} className="ml-auto text-xs text-amber-500 hover:text-amber-700 underline underline-offset-2">Select</button>
    </div>
  );
}

// Safe product data mapper — handles any shape of raw product
const mapProductData = (raw) => {
  if (!raw) return null;
  const price = Number(raw.price || 0);
  const mrp = Number(raw.mrp || raw.original_price || price * 1.2 || 0);

  const mainImageRaw =
    getProductImage(raw);

  const mapped = {
    ...raw,
    id: String(raw.id || raw.product_id || raw.sku || ''),
    pid: raw.pid || null,
    product_id: raw.product_id || raw.id || null,
    name: raw.name || raw.title || '',
    price: price,
    mrp: mrp,
    image: formatImageUrl(mainImageRaw),
    description: raw.description || '',
    rating: Number(raw.rating || 4.5),
    reviews: Number(raw.reviews || 0),
    category: raw.category || 'Soft Toys',
    gallery: Array.isArray(raw.image_urls) ? raw.image_urls : [],
    variants: (raw.variants || []).map(v => {
      const vGallery = v.gallery_images || v.variant_images || v.gallery || [];
      return {
        ...v,
        variant_name: v.variant_name || 'Color',
        variant_value: v.variant_value || v.color || '',
        color_name: v.color_name || v.variant_value || v.color || '', // Added alias
        color_hex: v.color_hex || '#E5E7EB', // Ensure hex is present
        stock_quantity: Number(v.stock_quantity || 0),
        price: v.price !== undefined && v.price !== null ? Number(v.price) : price,
        mrp: v.mrp !== undefined && v.mrp !== null ? Number(v.mrp) : mrp,
        image_url: formatImageUrl(v.image_url || v.image_path || ''),
        gallery_images: (Array.isArray(vGallery) ? vGallery : []).map(img => formatImageUrl(img))
      };
    }) || [],
    additional_images: (raw.additional_images || []).map(img => ({
      ...img,
      image_url: formatImageUrl(img.image_url || img.url || '')
    })) || [],
    stock: Number(raw.stock_quantity || raw.stock || 50),
    sku: raw.sku || '',
    badge: raw.badge || '',
    gradient: raw.gradient || '',
  };
  return mapped;
};



export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  // ── ALL HOOKS DECLARED UNCONDITIONALLY AT TOP ──────────────────────────────
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [reviews, setReviews] = useState([]);

  const [selectedVariant, setSelectedVariant] = useState(null);
  const [variantError, setVariantError] = useState(false);
  const variantRef = useRef(null);

  const [qty, setQty] = useState(1);
  const [activeImage, setActiveImage] = useState(null);
  const [showFullImage, setShowFullImage] = useState(false);
  const [showZoomPreview, setShowZoomPreview] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const [loading, setLoading] = useState(true);
  const previewImgRef = useRef(null);

  const relatedScrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const { addToCart, toggleWishlist, isWishlisted, isInCart } = useStore();

  const fetchReviews = useCallback(async () => {
    // Reviews might still be in DB, but we'll try to fetch by ID
    if (!id) return;
    try {
      const res = await fetch(`${BASE_URL}/api/reviews/${id}`);
      if (!res.ok) throw new Error(`Reviews fetch failed: ${res.status}`);
      const data = await res.json();
      if (data && Array.isArray(data.reviews)) setReviews(data.reviews);
      else setReviews([]);
    } catch {
      setReviews([]);
    }
  }, [id]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setSelectedVariant(null);
    setActiveImage(null);
    setQty(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    const applyProduct = (mapped) => {
      setProduct(mapped);
      if (mapped.variants?.length > 0) {
        const firstVariant = mapped.variants[0];
        setSelectedVariant(firstVariant);
        if (firstVariant.image_url) {
          setActiveImage(firstVariant.image_url);
        }
      } else {
        setSelectedVariant(null);
        setActiveImage(mapped.image);
      }
    };

    const fetchProductDetails = async () => {
      setLoading(true);
      
      // Look for product in JS data
      const found = allProductsData.find(p => String(p.id) === String(id));
      
      if (found) {
        const mapped = mapProductData(found);
        applyProduct(mapped);

        // Filter related products locally
        const localRelated = allProductsData
          .filter(p => p.category === mapped.category && String(p.id) !== String(mapped.id))
          .slice(0, 8)
          .map(p => mapProductData(p));
        setRelated(localRelated);
      } else {
        setProduct(null);
        setRelated([]);
      }

      setLoading(false);
    };

    fetchProductDetails();
  }, [id]);

  // ── VARIANT SELECTION ──────────────────────────────────────────────────────
  const handleVariantSelect = useCallback((variant) => {
    setSelectedVariant(variant);
    setVariantError(false);
    if (variant?.image_url) {
      setActiveImage(variant.image_url);
    }
  }, []);

  // Swap image when variant changes
  useEffect(() => {
    if (selectedVariant?.image_url) {
      setActiveImage(selectedVariant.image_url);
    }
  }, [selectedVariant]);

  // ── DERIVED VALUES ─────────────────────────────────────────────────────────
  const displayPrice = Number(
    (selectedVariant?.price !== undefined && selectedVariant?.price !== null)
      ? selectedVariant.price
      : (product?.price ?? 0)
  ) || 0;

  const displayMrp = Number(
    (selectedVariant?.mrp !== undefined && selectedVariant?.mrp !== null)
      ? selectedVariant.mrp
      : (product?.mrp ?? (displayPrice * 1.2 || 0))
  ) || 0;

  const displayImage = activeImage || product?.image || '';

  const variantsList = product?.variants || [];
  const hasVariants = variantsList.length > 0;
  const baseStock = Number(product?.stock || 0);
  const totalVariantStock = variantsList.reduce((sum, v) => sum + Number(v.stock_quantity || 0), 0);

  const displayStock = selectedVariant
    ? Number(selectedVariant.stock_quantity || 0)
    : (hasVariants ? totalVariantStock : baseStock);

  const isAnyStockAvailable = hasVariants ? (totalVariantStock > 0) : (baseStock > 0);
  const variantRequired = hasVariants && !selectedVariant;
  const isButtonDisabled = selectedVariant
    ? Number(selectedVariant.stock_quantity || 0) <= 0
    : !isAnyStockAvailable;

  // ── FULL GALLERY (useMemo must be before any early return) ─────────────────
  const fullGallery = useMemo(() => {
    if (!product) return [];

    const normalizeImage = (img) => {
      if (!img) return null;
      if (typeof img === 'string') return img.trim() || null;
      return img.image_url || img.url || null;
    };

    const safeVariants = Array.isArray(product.variants) ? product.variants : [];
    const safeGallery = Array.isArray(product.gallery) ? product.gallery : [];
    const safeAdditional = Array.isArray(product.additional_images) ? product.additional_images : [];

    // 1. Collect all "General" images (those not linked to any specific variant)
    const generalImages = [
      product.image,
      ...safeGallery,
      ...safeAdditional.filter(img => !img?.variant_reference).map(img => normalizeImage(img))
    ].filter(Boolean).filter((img, idx, arr) => arr.indexOf(img) === idx);

    // 2. Collect variant-specific images if a variant is selected
    if (selectedVariant) {
      const variantSku = selectedVariant.sku;
      // Get gallery_images from the variant itself (new structure)
      const variantImages = [
        selectedVariant.image_url,
        ...(selectedVariant.gallery_images || []),
        ...(selectedVariant.variant_images || []), // legacy fallback
        ...safeAdditional.filter(img => img?.variant_reference === variantSku).map(img => normalizeImage(img))
      ].filter(Boolean).filter((img, idx, arr) => arr.indexOf(img) === idx);

      // Return variant images first, then general images
      return [...variantImages, ...generalImages].filter((img, idx, arr) => arr.indexOf(img) === idx);
    }

    // 3. Fallback: Show everything if no variant is selected
    const allImages = [
      ...generalImages,
      ...safeVariants.flatMap(v => [v.image_url, ...(v.gallery_images || []), ...(v.variant_images || [])]),
      ...safeAdditional.map(img => normalizeImage(img))
    ].filter(Boolean).filter((img, idx, arr) => arr.indexOf(img) === idx);

    return allImages;
  }, [product, selectedVariant]);


  // ── SCROLL HELPERS ─────────────────────────────────────────────────────────
  const checkRelatedScroll = useCallback(() => {
    if (!relatedScrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = relatedScrollRef.current;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 8);
  }, []);

  const scrollRelated = (dir) => {
    if (!relatedScrollRef.current) return;
    relatedScrollRef.current.scrollBy({
      left: dir === 'right'
        ? relatedScrollRef.current.clientWidth * 0.75
        : -relatedScrollRef.current.clientWidth * 0.75,
      behavior: 'smooth'
    });
    setTimeout(checkRelatedScroll, 300);
  };

  useEffect(() => {
    const timer = setTimeout(checkRelatedScroll, 200);
    window.addEventListener('resize', checkRelatedScroll);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', checkRelatedScroll);
    };
  }, [loading, id, related.length, checkRelatedScroll]);

  // ── CART / WISHLIST / BUY NOW ──────────────────────────────────────────────
  const scrollToVariants = useCallback(() => {
    variantRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setVariantError(true);
  }, []);

  const handleAddToCart = useCallback(() => {
    if (!product) return;
    if (variantRequired) {
      scrollToVariants();
      return;
    }
    const item = {
      ...product,
      product_id: product.product_id,
      id: product.id,
      price: displayPrice,
      mrp: displayMrp,
      image: displayImage,
      selectedVariant: selectedVariant ?? null,
      qty,
    };
    for (let i = 0; i < qty; i++) addToCart(item);
  }, [product, variantRequired, scrollToVariants, displayPrice, displayMrp, displayImage, selectedVariant, qty, addToCart]);

  const handleBuyNow = useCallback(() => {
    if (!product) return;
    if (variantRequired) {
      scrollToVariants();
      return;
    }
    const buyNowItem = {
      ...product,
      product_id: product.product_id,
      id: product.id,
      price: displayPrice,
      mrp: displayMrp,
      image: displayImage,
      selectedVariant: selectedVariant ?? null,
      qty,
      total: displayPrice * qty,
    };
    navigate('/checkout', { state: { buyNow: true, items: [buyNowItem] } });
  }, [product, variantRequired, scrollToVariants, displayPrice, displayMrp, displayImage, selectedVariant, qty, navigate]);

  const handleToggleWishlist = useCallback(() => {
    if (!product) return;
    toggleWishlist({
      ...product,
      product_id: product.product_id,
      id: product.id,
      price: displayPrice,
      image: displayImage,
      selectedVariant: selectedVariant ?? null,
    });
  }, [product, toggleWishlist, displayPrice, displayImage, selectedVariant]);

  const handlePreviewMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPos({ x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) });
  };

  // ── WISHLIST / CART STATE ──────────────────────────────────────────────────
  const variantId = selectedVariant?.id ?? null;
  const wishlisted = product ? isWishlisted(product.id || product.product_id, variantId) : false;
  const inCart = product ? isInCart(product.id || product.product_id, variantId) : false;

  // ── EARLY RETURNS (after all hooks) ───────────────────────────────────────
  if (loading) return <ProductDetailsSkeleton />;

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 text-center page-enter">
        <div className="text-8xl mb-6">🧸</div>
        <h2 className="font-display text-3xl text-gray-700 mb-3">Toy Not Found!</h2>
        <p className="text-gray-500 mb-8">This toy seems to have wandered off on an adventure...</p>
        <button onClick={() => navigate('/')} className="btn-primary">← Back to Toy Store</button>
      </div>
    );
  }

  // ── RENDER ─────────────────────────────────────────────────────────────────
  return (
    <>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 page-enter mt-32">
        <div className="mb-6">
          <button
            id="back-button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl border-2 border-orange-200 text-orange-600 font-semibold hover:bg-orange-500 hover:text-white hover:border-orange-500 transition-all duration-300 hover:scale-105 active:scale-95 shadow-sm"
          >
            <ArrowLeft size={18} /> Back
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div
              className="rounded-3xl overflow-hidden bg-orange-50 aspect-square shadow-xl cursor-zoom-in relative group"
              onClick={() => setShowFullImage(true)}
            >
              <img
                src={activeImage || getProductImage(product)}
                alt={product.name}
                className="w-full h-full object-contain p-8"
                onError={e => {
                  e.target.src = '/images/toy-placeholder.svg';
                }}
              />
              <div className="absolute bottom-4 right-4 px-3 py-2 rounded-xl text-xs font-bold bg-white/80 backdrop-blur-sm text-orange-600 shadow-sm">
                Click to view full image
              </div>
              {product.badge && (
                <div className="absolute top-4 left-4">
                  <span className="badge text-sm shadow">{product.badge}</span>
                </div>
              )}
              {selectedVariant && (
                <div className="absolute top-4 right-14 bg-orange-500 text-white text-xs font-bold px-2.5 py-1 rounded-xl shadow">
                  {selectedVariant.variant_name}: {selectedVariant.variant_value}
                </div>
              )}
              <button
                id="wishlist-toggle-top"
                onClick={(e) => { e.stopPropagation(); handleToggleWishlist(); }}
                className={`absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110 shadow-lg ${wishlisted ? 'bg-red-500 text-white' : 'bg-white text-gray-400 hover:text-red-400'}`}
              >
                <Heart size={18} fill={wishlisted ? 'currentColor' : 'none'} />
              </button>
            </div>

            {fullGallery.length > 0 && (
              <div className="flex gap-3 justify-center overflow-x-auto pb-2 scrollbar-hide">
                {fullGallery.slice(0, 8).map((img, i) => {
                  const matchingVariant = (product.variants || []).find(v =>
                    v.image_url === img || (v.variant_images && v.variant_images.includes(img))
                  );
                  const isVariantImg = Boolean(matchingVariant);
                  const isActive = displayImage === img || (!displayImage && i === 0);

                  return (
                    <div
                      key={img || i}
                      onClick={() => {
                        setActiveImage(img);
                        if (matchingVariant) setSelectedVariant(matchingVariant);
                      }}
                      className={`w-20 h-20 rounded-2xl overflow-hidden cursor-pointer shrink-0 transition-all relative ${isActive ? 'ring-2 ring-orange-400 shadow-md scale-105' : 'opacity-60 hover:opacity-100 ring-2 ring-transparent hover:ring-orange-200'}`}
                      title={matchingVariant ? `Color: ${matchingVariant.variant_value}` : undefined}
                    >
                      <img
                        src={img}
                        alt={`View ${i + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = '/images/toy-placeholder.svg';
                        }}

                      />
                      {isVariantImg && (
                        <div className="absolute bottom-1 right-1 w-2 h-2 rounded-full bg-orange-500 border border-white" />
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="flex flex-col gap-5">
            <span className="inline-flex items-center gap-1.5 bg-orange-100 text-orange-600 text-xs font-bold px-3 py-1 rounded-full w-fit">
              {product.category}
            </span>

            <h1 className="font-display text-3xl md:text-4xl text-gray-800 leading-tight">{product.name}</h1>

            <div className="flex items-center gap-4 flex-wrap">
              <Rating rating={product.rating} reviews={product.reviews} size="md" />
              <span className="text-sm text-gray-400 font-medium">{product.rating} out of 5 stars</span>
            </div>

            <div className="flex items-baseline gap-3 flex-wrap">
              <span key={displayPrice} className="font-display text-2xl text-orange-600 transition-all duration-300">
                &#x20B9;{displayPrice}
              </span>
              {displayMrp > displayPrice && (
                <>
                  <span className="text-gray-400 line-through text-xl">&#x20B9;{Math.round(displayMrp)}</span>
                  <span className="bg-red-500 text-white text-sm font-extrabold px-2.5 py-0.5 rounded-lg">
                    {Math.round(((displayMrp - displayPrice) / displayMrp) * 100)}% OFF
                  </span>
                </>
              )}
            </div>

            {hasVariants && (
              <div
                ref={variantRef}
                className={`rounded-2xl border p-4 transition-all duration-300 ${variantError
                    ? 'border-amber-400 bg-amber-50/50 shadow-md shadow-amber-100'
                    : 'border-orange-100 bg-orange-50/30'
                  }`}
              >
                <VariantSelector
                  variants={product.variants}
                  selectedVariant={selectedVariant}
                  onSelect={handleVariantSelect}
                />
              </div>
            )}

            <p className="text-gray-600 leading-relaxed font-body text-base">{product.description}</p>

            <div className="flex items-center gap-2">
              <div className={`w-2.5 h-2.5 rounded-full animate-pulse ${isAnyStockAvailable ? 'bg-green-400' : 'bg-red-400'}`} />
              <span className={`font-bold text-sm ${isAnyStockAvailable ? 'text-green-700' : 'text-red-700'}`}>
                {selectedVariant
                  ? (displayStock > 0
                    ? (displayStock <= 5 ? `Only ${displayStock} left!` : `In Stock (${displayStock} units)`)
                    : 'Out of Stock (Selected Variant)')
                  : (isAnyStockAvailable
                    ? (product.stock > 0 ? `In Stock (${product.stock} units)` : 'In Stock (Variants Available)')
                    : 'Out of Stock')}
              </span>
              {displayStock > 0 && displayStock <= 5 && (
                <span className="text-xs font-bold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                  Selling fast!
                </span>
              )}
            </div>

            <div className="flex items-center gap-4">
              <span className="text-sm font-bold text-gray-700">Quantity:</span>
              <div className="flex items-center gap-3 bg-gray-100 rounded-2xl p-1">
                <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="w-9 h-9 rounded-xl bg-white shadow-sm hover:bg-orange-50 hover:text-orange-600 flex items-center justify-center transition-all hover:scale-110 active:scale-95"><Minus size={16} /></button>
                <span className="font-display text-xl text-gray-800 w-8 text-center">{qty}</span>
                <button
                  onClick={() => setQty((q) => Math.min(displayStock || 99, q + 1))}
                  disabled={displayStock <= 0 && hasVariants}
                  className="w-9 h-9 rounded-xl bg-white shadow-sm hover:bg-orange-50 hover:text-orange-600 flex items-center justify-center transition-all hover:scale-110 active:scale-95 disabled:opacity-30"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            <VariantRequiredBanner
              hasVariants={hasVariants}
              selectedVariant={selectedVariant}
              onScrollToVariants={scrollToVariants}
            />

            <div className="flex gap-3">
              <button
                id="add-to-cart-button"
                onClick={handleAddToCart}
                disabled={isButtonDisabled}
                className={`flex-1 h-12 flex items-center justify-center gap-2 rounded-2xl font-bold text-base shadow-toy hover:shadow-toy-hover transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 ${inCart ? 'bg-green-500 hover:bg-green-600 text-white' : 'bg-orange-500 hover:bg-orange-600 text-white'}`}
              >
                <ShoppingCart size={20} />
                {inCart ? 'Added to Cart ✓' : 'Add to Cart'}
              </button>
              <button
                onClick={handleToggleWishlist}
                className={`w-12 h-12 flex items-center justify-center rounded-2xl border-2 transition-all hover:scale-110 active:scale-95 ${wishlisted ? 'bg-red-500 border-red-500 text-white' : 'border-orange-200 text-orange-400 hover:border-orange-400 hover:text-orange-500'}`}
              >
                <Heart size={20} fill={wishlisted ? 'currentColor' : 'none'} />
              </button>
            </div>

            <button
              id="buy-now-button"
              onClick={handleBuyNow}
              disabled={isButtonDisabled}
              className="w-full h-12 flex items-center justify-center gap-2 rounded-2xl font-bold text-base border-2 border-orange-500 text-orange-600 bg-white hover:bg-orange-500 hover:text-white transition-all duration-200 hover:scale-105 active:scale-95 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:bg-white disabled:hover:text-orange-600"
            >
              <Zap size={18} className="fill-current" />
              Buy Now
            </button>

            <div className="grid grid-cols-3 gap-3 pt-4 mt-2 border-t border-gray-100">
              {[
                { icon: <ShieldCheck size={18} />, text: 'Safe & Certified', color: 'text-green-600', bg: 'bg-green-50' },
                { icon: <Truck size={18} />, text: 'Free Shipping ₹999+', color: 'text-orange-600', bg: 'bg-orange-50' },
                { icon: <RotateCcw size={18} />, text: '30-Day Returns', color: 'text-purple-600', bg: 'bg-purple-50' },
              ].map((b, i) => (
                <div key={i} className={`flex flex-col items-center justify-center gap-2 text-center p-3 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition ${b.bg}`}>
                  <div className={b.color}>{b.icon}</div>
                  <span className="text-xs text-gray-600 font-semibold leading-tight">{b.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <RatingsAndReviewsSection product={product} reviews={reviews} onReviewSubmitted={fetchReviews} />

        {related.length > 0 && (
          <section className="mt-16">
            <div className="flex items-center justify-between mb-6 px-1">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center text-2xl shadow-sm border border-orange-200">🧸</div>
                <div>
                  <h2 className="font-display text-2xl md:text-3xl text-gray-800">You Might Also Love</h2>
                  <p className="text-sm text-gray-400 font-body">{related.length} amazing toys</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => scrollRelated('left')} disabled={!canScrollLeft} className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${canScrollLeft ? 'border-orange-200 text-orange-600 hover:bg-orange-500 hover:text-white hover:scale-110' : 'border-gray-200 text-gray-300 cursor-not-allowed'}`}><ChevronLeft size={20} /></button>
                <button onClick={() => scrollRelated('right')} disabled={!canScrollRight} className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${canScrollRight ? 'border-orange-200 text-orange-600 hover:bg-orange-500 hover:text-white hover:scale-110' : 'border-gray-200 text-gray-300 cursor-not-allowed'}`}><ChevronRight size={20} /></button>
              </div>
            </div>
            <div ref={relatedScrollRef} onScroll={checkRelatedScroll} className="flex gap-4 overflow-x-auto scrollbar-hide pb-4 -mx-1 px-1 scroll-smooth" style={{ scrollSnapType: 'x mandatory' }}>
              {related.map((p) => (
                <div key={p.id} className="flex-none w-64 md:w-72" style={{ scrollSnapAlign: 'start' }}>
                  <div onClick={() => navigate(`/product/${p.id}`)} className="cursor-pointer bg-white rounded-3xl overflow-hidden border border-orange-100 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                    <div className="h-56 w-full overflow-hidden bg-orange-50">
                      {p.image ? (
                        <img
                          src={p.image}
                          alt={p.name}
                          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                          onError={(e) => {
                            e.target.src = '/images/toy-placeholder.svg';
                            e.target.style.opacity = '0.5';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-4xl bg-orange-50">🧸</div>
                      )}
                    </div>
                    <div className="p-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full bg-orange-100 text-orange-600 text-xs font-bold mb-2">{p.category}</span>
                      <h3 className="font-bold text-gray-800 text-lg leading-snug line-clamp-2 mb-2">{p.name}</h3>
                      <p className={`text-gray-600 leading-relaxed font-body text-sm ${expandedId === p.id ? '' : 'line-clamp-2'}`}>
                        {p.description || 'This is a high-quality toy loved by kids. Safe, durable, and fun to play with.'}
                      </p>
                      <button onClick={(e) => { e.stopPropagation(); setExpandedId(expandedId === p.id ? null : p.id); }} className="text-orange-500 text-xs font-semibold mt-1 mb-3 hover:underline">
                        {expandedId === p.id ? 'See Less' : 'See More'}
                      </button>
                      <div className="flex items-center gap-2 mb-3 flex-wrap">
                        <span className="text-orange-600 font-extrabold text-base">&#x20B9;{parsePrice(p.price)}</span>
                        {p.mrp && parsePrice(p.mrp) > parsePrice(p.price) ? (
                          <>
                            <span className="text-xs text-gray-400 line-through">&#x20B9;{parsePrice(p.mrp)}</span>
                            <span className="bg-red-500 text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded">{Math.round(((parsePrice(p.mrp) - parsePrice(p.price)) / parsePrice(p.mrp)) * 100)}% OFF</span>
                          </>
                        ) : (
                          <span className="text-xs text-gray-400 line-through">&#x20B9;{Math.round(parsePrice(p.price) * 1.25)}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 mb-4">
                        {[1, 2, 3, 4, 5].map((star) => <Star key={star} size={14} className={star <= Math.round(p.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'} />)}
                        <span className="text-xs text-gray-400 ml-1">{p.rating}</span>
                      </div>
                      <button onClick={(e) => { e.stopPropagation(); addToCart(p); }} className="w-full py-2.5 rounded-2xl bg-orange-500 text-white font-semibold hover:bg-orange-600 transition-all duration-300">Add to Cart</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Full Image Lightbox */}
      {showFullImage && (
        <div className="fixed inset-0 z-[999] bg-black/90 flex items-center justify-center p-6">
          <button onClick={() => { setShowFullImage(false); setShowZoomPreview(false); }} className="absolute top-5 right-5 bg-white text-gray-800 rounded-full p-2 hover:scale-110 transition"><X size={24} /></button>
          <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            <div className="bg-white rounded-2xl overflow-hidden flex items-center justify-center h-[70vh] cursor-crosshair" onMouseEnter={() => setShowZoomPreview(true)} onMouseLeave={() => setShowZoomPreview(false)} onMouseMove={handlePreviewMouseMove}>
              {displayImage && <img src={displayImage} alt={product.name} className="w-full h-full object-cover" onError={e => e.target.src = '/images/toy-placeholder.svg'} />}

            </div>
            {showZoomPreview && displayImage && (
              <div className="hidden lg:flex bg-white rounded-2xl overflow-hidden h-[70vh] items-center justify-center">
                <div className="w-full h-full overflow-hidden">
                  <img ref={previewImgRef} src={displayImage} alt={`${product.name} zoom`} className="w-full h-full object-cover" style={{ transform: 'scale(2.5)', transformOrigin: `${zoomPos.x}% ${zoomPos.y}%` }} />
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}