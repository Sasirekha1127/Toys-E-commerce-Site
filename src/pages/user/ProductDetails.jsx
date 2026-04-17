import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ShoppingCart, Heart, ShieldCheck, Truck, RotateCcw,
  Plus, Minus, X, ArrowLeft, Star, ChevronLeft, ChevronRight,
  CheckCircle2, ThumbsUp,
} from 'lucide-react';
import { allProducts } from '../../data/user';
import { useStore } from '../../hooks/useStore';
import Rating from '../../components/user/Rating';

// ─────────────────────────────────────────────────────────────
// SAMPLE DATA
// ─────────────────────────────────────────────────────────────
const PHOTO_REVIEWS = [
  {
    id: 'pr1',
    name: 'Meena R.',
    initials: 'MR',
    rating: 5,
    title: 'My little one is obsessed!',
    comment: 'This toy is absolutely wonderful. My daughter carries it everywhere. The colours are bright and the material feels very safe. Highly recommend to all parents!',
    date: '14 Mar 2025',
    helpful: 28,
    images: [
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=700&fit=crop',
    ],
    productId: '1',
  },
  {
    id: 'pr2',
    name: 'Ramesh K.',
    initials: 'RK',
    rating: 5,
    title: 'Exactly as described. Perfect gift!',
    comment: 'Bought this as a birthday gift for my nephew. He absolutely loves it. Quality is top notch and delivery was super fast. Will buy again.',
    date: '2 Mar 2025',
    helpful: 19,
    images: [
      'https://images.unsplash.com/photo-1530325553241-4f6e7690cf36?w=600&h=700&fit=crop',
    ],
    productId: '1',
  },
  {
    id: 'pr3',
    name: 'Sunita V.',
    initials: 'SV',
    rating: 4,
    title: 'Kids are super happy with this',
    comment: 'Good product overall. The packaging was neat and the toy was exactly as shown in the pictures. My twins are both fighting over it!',
    date: '20 Feb 2025',
    helpful: 11,
    images: [
      'https://images.unsplash.com/photo-1566140967404-b8b3932483f5?w=600&h=700&fit=crop',
    ],
    productId: '1',
  },
  {
    id: 'pr4',
    name: 'Lavanya M.',
    initials: 'LM',
    rating: 5,
    title: 'Perfect birthday gift!',
    // comment: 'Gifted this for my son's 3rd birthday and he was so happy. Sturdy build, vibrant colours and completely safe. Will definitely order more toys from here',
    date: '10 Feb 2025',
    helpful: 33,
    images: [
      'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=600&h=700&fit=crop',
    ],
    productId: '2',
  },
  {
    id: 'pr5',
    name: 'Gopal S.',
    initials: 'GS',
    rating: 4,
    title: 'Great quality for the price',
    // comment: 'Really good value. The toy is durable and looks premium. My daughter's friends also wanted one after seeing it. Definitely a crowd favourite!',
    date: '28 Jan 2025',
    helpful: 7,
    images: [
      'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=600&h=700&fit=crop',
    ],
    productId: '2',
  },
  {
    id: 'pr6',
    name: 'Nithya B.',
    initials: 'NB',
    rating: 5,
    title: "My daughter's new favourite toy!",
    comment: 'The toy came well packed and looks exactly like the product pictures. My daughter refuses to sleep without it now. Worth every rupee!',
    date: '15 Jan 2025',
    helpful: 21,
    images: [
      'https://images.unsplash.com/photo-1545558014-8692077e9b5c?w=600&h=700&fit=crop',
    ],
    productId: '3',
  },
  {
    id: 'pr7',
    name: 'Arjun T.',
    initials: 'AT',
    rating: 4,
    title: 'Good toy, decent quality',
    comment: 'Nice toy for the price. The material is sturdy and colorful. Kids enjoy it a lot. Could have better packaging but the product itself is great.',
    date: '5 Jan 2025',
    helpful: 9,
    images: [
      'https://images.unsplash.com/photo-1558618047-f4e0c5f34cf4?w=600&h=700&fit=crop',
    ],
    productId: '3',
  },
  {
    id: 'pr8',
    name: 'Preethi N.',
    initials: 'PN',
    rating: 5,
    title: 'Brilliant! Kids love it',
    comment: 'Ordered twice already! First one was so good I got another one as a gift. The toy is safe, colorful and very engaging for toddlers.',
    date: '22 Dec 2024',
    helpful: 16,
    images: [
      'https://images.unsplash.com/photo-1613771404784-3a5686aa2be3?w=600&h=700&fit=crop',
    ],
    productId: '4',
  },
];

const TEXT_ONLY_REVIEWS = [
  { id: 't1', name: 'Priya S.',  initials: 'PS', rating: 5, title: 'Kids absolutely love it!',      comment: 'Amazing toy! My 4-year-old plays with it non-stop. Great build quality and very safe materials. Worth every rupee.',         date: '12 Mar 2025', helpful: 24, productId: '1' },
  { id: 't2', name: 'Kavin R.',  initials: 'KR', rating: 4, title: 'Great quality, fast delivery',  comment: 'Colors are vibrant and the material feels very sturdy. My son was thrilled when he saw it. Packaging was excellent too.',   date: '28 Feb 2025', helpful: 17, productId: '1' },
  { id: 't3', name: 'Anitha M.', initials: 'AM', rating: 5, title: 'Perfect gift for toddlers',     comment: 'Gifted this to my daughter and she has not put it down since! Safe, sturdy and great value for money.',                       date: '10 Jan 2025', helpful: 31, productId: '2' },
  { id: 't4', name: 'Suresh P.', initials: 'SP', rating: 4, title: 'Good value for money',          comment: 'Solid product. My twins both wanted the same one so I bought two. No complaints at all. Exactly as shown in pictures.',     date: '5 Jan 2025',  helpful: 9,  productId: '2' },
  { id: 't5', name: 'Divya K.',  initials: 'DK', rating: 5, title: 'Highly recommended!',           comment: 'The quality is top-notch. I was worried ordering online but the toy exceeded my expectations. My child loves it.',            date: '20 Dec 2024', helpful: 14, productId: '3' },
  { id: 't6', name: 'Arjun T.',  initials: 'AT', rating: 3, title: 'Decent but could be better',   comment: 'The toy is okay for the price. My kid plays with it occasionally. Quality could be slightly better but no major complaints.', date: '2 Dec 2024',  helpful: 5,  productId: '3' },
];

// ─────────────────────────────────────────────────────────────
// RatingBar
// ─────────────────────────────────────────────────────────────
function RatingBar({ star, count, total }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  const color = star >= 4 ? 'from-green-400 to-green-500'
              : star === 3 ? 'from-yellow-400 to-amber-400'
              : 'from-red-400 to-red-500';
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

// ─────────────────────────────────────────────────────────────
// ReviewCard (text only card)
// ─────────────────────────────────────────────────────────────
function ReviewCard({ r }) {
  return (
    <div className="bg-white rounded-2xl border border-orange-100 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 p-4">
      <div className="flex items-start justify-between mb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-400 to-amber-400 flex items-center justify-center text-xs font-extrabold text-white shrink-0">
            {r.initials}
          </div>
          <div>
            <p className="text-sm font-bold text-gray-800 leading-tight">{r.name}</p>
            <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-green-600">
              <CheckCircle2 size={9} /> Verified Buyer
            </span>
          </div>
        </div>
        <div className="flex items-center gap-0.5 bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded-md shrink-0">
          {r.rating}<Star size={9} className="fill-white text-white ml-0.5" />
        </div>
      </div>
      <p className="text-sm font-bold text-gray-800 mb-1">{r.title}</p>
      <p className="text-xs text-gray-500 leading-relaxed mb-3">{r.comment}</p>
      <div className="flex items-center justify-between">
        <span className="text-[11px] text-gray-400">{r.date}</span>
        <button className="flex items-center gap-1 text-[11px] text-gray-400 hover:text-orange-500 transition-colors">
          <ThumbsUp size={11} /> {r.helpful}
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// ★ Photo + Review Lightbox (Myntra Image 2 layout)
// ─────────────────────────────────────────────────────────────
function PhotoReviewLightbox({ reviews, startIndex, onClose }) {
  const [current, setCurrent] = useState(startIndex);
  const [helpfulVote, setHelpfulVote] = useState(null);
  const r = reviews[current];

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

  return (
    <div
      className="fixed inset-0 z-[999] bg-gray-950/90 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col sm:flex-row"
        style={{ maxHeight: '90vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-3 left-3 z-10 w-8 h-8 rounded-full bg-white/90 text-gray-700 flex items-center justify-center hover:bg-white shadow transition"
        >
          <X size={16} />
        </button>

        {/* ── LEFT: large photo ── */}
        <div className="relative sm:w-1/2 bg-gray-100 flex items-center justify-center" style={{ minHeight: '320px' }}>
          <img
            src={r.images[0]}
            alt={r.title}
            className="w-full h-full object-cover"
            style={{ maxHeight: '90vh' }}
          />

          {/* Prev / Next */}
          {current > 0 && (
            <button
              onClick={(e) => { e.stopPropagation(); prev(); }}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 flex items-center justify-center shadow hover:bg-white transition"
            >
              <ChevronLeft size={20} className="text-gray-700" />
            </button>
          )}
          {current < reviews.length - 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); next(); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 flex items-center justify-center shadow hover:bg-white transition"
            >
              <ChevronRight size={20} className="text-gray-700" />
            </button>
          )}

          {/* Thumbnail rail */}
          <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 px-4">
            {reviews.map((_, i) => (
              <button
                key={i}
                onClick={(e) => { e.stopPropagation(); setCurrent(i); }}
                className={`w-10 h-10 rounded-lg overflow-hidden border-2 transition-all ${i === current ? 'border-orange-500 opacity-100' : 'border-transparent opacity-50 hover:opacity-80'}`}
              >
                <img src={reviews[i].images[0]} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* ── RIGHT: review content ── */}
        <div className="sm:w-1/2 flex flex-col overflow-y-auto" style={{ maxHeight: '90vh' }}>
          <div className="p-5 border-b border-orange-50">
            {/* Rating pill */}
            <div className="flex items-center gap-2 mb-3">
              <div className="flex items-center gap-0.5 bg-green-500 text-white text-xs font-bold px-2.5 py-1 rounded-lg">
                {r.rating}<Star size={10} className="fill-white text-white ml-0.5" />
              </div>
              <span className="text-xs text-gray-400">{r.date}</span>
            </div>
            {/* Title */}
            <p className="text-base font-bold text-gray-900 mb-2">{r.title}</p>
            {/* Comment */}
            <p className="text-sm text-gray-600 leading-relaxed mb-4">{r.comment}</p>
    
          </div>

          {/* Helpful */}
          <div className="px-5 py-3 space-y-3 text-xs text-gray-400">
            <span>Was this review helpful?</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setHelpfulVote('yes')}
                className={`flex items-center gap-1 border rounded-lg px-3 py-1 font-semibold transition ${helpfulVote === 'yes' ? 'bg-orange-500 border-orange-500 text-white' : 'border-orange-200 text-orange-600 hover:bg-orange-50'}`}
              >
                <ThumbsUp size={12} /> Yes
              </button>
              <button
                onClick={() => setHelpfulVote('no')}
                className={`flex items-center gap-1 border rounded-lg px-3 py-1 font-semibold transition ${helpfulVote === 'no' ? 'bg-red-500 border-red-500 text-white' : 'border-orange-200 text-gray-500 hover:bg-gray-100'}`}
              >
                <X size={12} /> No
              </button>
            </div>
          </div>

          {/* Mini list of other reviews */}
          <div className="flex-1 px-4 pb-4 space-y-2 overflow-y-auto">
            <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-2">More Reviews</p>
            {reviews.filter((_, i) => i !== current).map((or, i) => (
              <button
                key={or.id}
                onClick={(e) => { e.stopPropagation(); setCurrent(reviews.indexOf(or)); }}
                className="w-full text-left flex items-center gap-2.5 rounded-xl p-2.5 hover:bg-orange-50 transition group"
              >
                <img src={or.images[0]} alt="" className="w-10 h-10 rounded-xl object-cover border border-orange-100 shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs font-bold text-gray-700 truncate">{or.title}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <div className="flex items-center gap-0.5 bg-green-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                      {or.rating}<Star size={8} className="fill-white text-white ml-0.5" />
                    </div>
                    <span className="text-[10px] text-gray-400">{or.name}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// ★ Ratings & Reviews Section  (combined — summary + photos + reviews)
// ─────────────────────────────────────────────────────────────
function RatingsAndReviewsSection({ product }) {
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [showAllReviews, setShowAllReviews] = useState(false);

  const filteredPhotoReviews = PHOTO_REVIEWS.filter((r) => r.productId === product.id);
  const filteredTextReviews = TEXT_ONLY_REVIEWS.filter((r) => r.productId === product.id);
  const hasImageReviews = filteredPhotoReviews.length > 0;
  const actualReviewCount = filteredPhotoReviews.length + filteredTextReviews.length;
  const allReviews = [...filteredPhotoReviews, ...filteredTextReviews];
  const avg = actualReviewCount > 0
    ? allReviews.reduce((s, r) => s + r.rating, 0) / actualReviewCount
    : product.rating || 4.5;
  const total = actualReviewCount > 0 ? actualReviewCount : product.reviews || 0;

  const productImages = [
    product.image,
    ...(Array.isArray(product.gallery) ? product.gallery : []),
    ...(Array.isArray(product.images) ? product.images : []),
  ].filter(Boolean).slice(0, 4);

  const fallbackImages = productImages.length > 0 ? productImages : [product.image];

  const photoItems = filteredPhotoReviews.length > 0
    ? filteredPhotoReviews
    : fallbackImages.map((url, index) => ({
        id: `fallback-${product.id}-${index}`,
        name: 'Happy Parent',
        initials: 'HP',
        rating: product.rating || 5,
        title: `Best gift for kids`,
        comment: `The ${product.name} arrived quickly and the kids love the colours and build quality. Highly recommended.`,
        date: 'Today',
        helpful: 0,
        images: [url],
        productId: product.id,
      }));

  const photoReviewsToShow = filteredPhotoReviews.length > 0
    ? filteredPhotoReviews.slice(0, 4)
    : photoItems.slice(0, 4);

  const textReviewFallback = [
    {
      id: `fallback-text-${product.id}`,
      name: 'Verified Parent',
      initials: 'VP',
      rating: product.rating || 5,
      title: `Kids absolutely love it!`,
      comment: `Great purchase — safe, colourful and fun. My child plays with it every day and the quality feels excellent.`,
      date: 'Today',
      helpful: 0,
      productId: product.id,
    },
  ];

  const breakdown = [5, 4, 3, 2, 1].map((s) => ({
    star: s,
    count: actualReviewCount > 0
      ? allReviews.filter((r) => r.rating === s).length
      : (s === Math.round(avg) ? total : 0),
  }));

  

  const ratingLabel = (r) => (r >= 4.5 ? 'Excellent' : r >= 4 ? 'Very Good' : r >= 3 ? 'Good' : 'Average');
  const displayedTextReviews = !hasImageReviews
    ? showAllReviews
      ? (filteredTextReviews.length > 0 ? filteredTextReviews : textReviewFallback)
      : (filteredTextReviews.length > 0 ? filteredTextReviews.slice(0, 3) : textReviewFallback)
    : [];

  return (
    <section className="mt-16">
      {/* ── Section header ── */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex-1 h-px bg-orange-100" />
        <h2 className="font-display text-2xl text-orange-700 whitespace-nowrap">Ratings &amp; Reviews</h2>
        <div className="flex-1 h-px bg-orange-100" />
      </div>

      {/* ══════════════════════════════════════════
          PART A — Rating Summary Card
      ══════════════════════════════════════════ */}
      <div className="bg-gradient-to-br from-orange-50 to-white border border-orange-100 rounded-3xl p-5 md:p-7 shadow-sm mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-[auto_1fr_auto] gap-6 items-center">

          {/* Big score */}
          <div className="flex flex-col items-center text-center sm:pr-6 sm:border-r sm:border-orange-100">
            <p className="text-7xl font-extrabold text-orange-500 leading-none">{avg.toFixed(1)}</p>
            <div className="flex gap-0.5 my-2">
              {[1,2,3,4,5].map((s) => (
                <Star key={s} size={18} className={s <= Math.round(avg) ? 'text-amber-400 fill-amber-400' : 'text-gray-200'} />
              ))}
            </div>
            <p className="text-sm font-bold text-orange-600">{ratingLabel(avg)}</p>
            <p className="text-xs text-gray-400 mt-1">{total} Verified Ratings</p>
          </div>

          {/* Bars */}
          <div className="flex flex-col gap-2 sm:px-6 sm:border-r sm:border-orange-100">
            {breakdown.map(({ star, count }) => (
              <RatingBar key={star} star={star} count={count} total={total} />
            ))}
          </div>

          
        </div>
      </div>

      {/* 
          PART B — Customer Photos 
       */}
      <div className="mb-10">
        {/* Sub-header */}
        <div className="flex items-center justify-between mb-4 px-1">
          <h3 className="font-display text-lg text-gray-800">
            Customer Photos
            <span className="ml-2 text-sm font-semibold text-orange-500 bg-orange-50 border border-orange-100 rounded-full px-2.5 py-0.5">
              {photoItems.length}
            </span>
          </h3>
          {photoItems.length > 0 && (
            <button
              onClick={() => setLightboxIndex(0)}
              className="text-xs font-bold text-orange-600 hover:text-orange-700 underline underline-offset-2 transition"
            >
              View All Photos →
            </button>
          )}
        </div>

        {/* Thumbnail grid — Myntra compact style */}
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
          {photoItems.map((p, i) => (
            <button
              key={p.id}
              onClick={() => setLightboxIndex(i)}
              className="aspect-square rounded-2xl overflow-hidden border-2 border-transparent hover:border-orange-400 transition-all duration-200 hover:scale-105 relative group shadow-sm"
            >
              <img
                src={p.images[0]}
                alt={p.title}
                className="w-full h-full object-cover"
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-orange-500/0 group-hover:bg-orange-500/10 transition-all duration-200 flex items-end justify-start p-1">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5 bg-green-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                  {p.rating}<Star size={8} className="fill-white text-white ml-0.5" />
                </div>
              </div>
            </button>
          ))}

          {/* "See more" tile if needed */}
          <button
            onClick={() => setLightboxIndex(0)}
            className="aspect-square rounded-2xl bg-orange-50 border-2 border-dashed border-orange-200 flex flex-col items-center justify-center hover:bg-orange-100 hover:border-orange-400 transition-all duration-200 shadow-sm"
          >
            <span className="text-lg">📸</span>
            <span className="text-[10px] font-bold text-orange-500 mt-0.5 text-center leading-tight px-1">View All</span>
          </button>
        </div>
      </div>

     
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4 px-1">
          <h3 className="font-display text-lg text-gray-800">
            Customer Reviews
          </h3>
        </div>

        {/* Photo reviews */}
        <div className="space-y-4 mb-6">
          {photoReviewsToShow.map((r, i) => (
            <div
              key={r.id}
              className="bg-white rounded-2xl border border-orange-100 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden"
            >
              <div className="flex flex-col sm:flex-row">
                 {/* Review — right */}
                <div className="flex-1 p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-amber-400 flex items-center justify-center text-xs font-extrabold text-white shrink-0">
                        {r.initials}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-800 leading-tight">{r.name}</p>
                        <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-green-600">
                          <CheckCircle2 size={9} /> Verified Buyer
                        </span>
                      </div>
                    </div>
                    <span className="text-[11px] text-gray-400 shrink-0 ml-2">{r.date}</span>
                  </div>
                  <p className="text-sm font-bold text-gray-800 mb-1">{r.title}</p>
                  <p className="text-xs text-gray-500 leading-relaxed mb-3 line-clamp-3">{r.comment}</p>
                  <button className="flex items-center gap-1 text-[11px] text-gray-400 hover:text-orange-500 transition-colors">
                    <ThumbsUp size={11} /> Helpful ({r.helpful})
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        </div>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <PhotoReviewLightbox
          reviews={photoItems}
          startIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </section>
  );
}

// ─────────────────────────────────────────────────────────────
// Skeleton
// ─────────────────────────────────────────────────────────────
function ProductDetailsSkeleton() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 mt-32 animate-pulse">
      <div className="h-12 w-36 rounded-2xl bg-orange-100 mb-6" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
        <div className="space-y-4">
          <div className="w-full aspect-square rounded-3xl bg-orange-100" />
          <div className="flex gap-3 justify-center">
            {[1,2,3].map(i=><div key={i} className="w-20 h-20 rounded-2xl bg-orange-100" />)}
          </div>
        </div>
        <div className="flex flex-col gap-5">
          <div className="h-7 w-32 rounded-full bg-orange-100" />
          <div className="h-10 w-3/4 rounded-xl bg-orange-100" />
          <div className="h-6 w-52 rounded-xl bg-orange-100" />
          <div className="h-10 w-44 rounded-xl bg-orange-100" />
          <div className="space-y-2">{[1,2,3].map(i=><div key={i} className="h-4 rounded bg-gray-200" />)}</div>
          <div className="h-5 w-48 rounded bg-green-100" />
          <div className="flex gap-3"><div className="h-14 flex-1 rounded-2xl bg-orange-200" /><div className="h-14 w-14 rounded-2xl bg-orange-100" /></div>
          <div className="grid grid-cols-3 gap-3 pt-2">{[1,2,3].map(i=><div key={i} className="h-16 rounded-2xl bg-gray-100" />)}</div>
        </div>
      </div>
      <section className="mt-16">
        <div className="h-8 w-56 mx-auto rounded-xl bg-orange-100 mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">{[1,2,3].map(i=><div key={i} className="h-40 rounded-3xl bg-orange-50" />)}</div>
      </section>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Main ProductDetails — all original code preserved
// ─────────────────────────────────────────────────────────────
export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [expandedId, setExpandedId] = useState(null);

  const { addToCart, toggleWishlist, isWishlisted, isInCart } = useStore();
  const [qty, setQty] = useState(1);
  const [showFullImage, setShowFullImage] = useState(false);
  const [showZoomPreview, setShowZoomPreview] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const [loading, setLoading] = useState(true);
  const previewImgRef = useRef(null);

  const relatedScrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft]   = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  useEffect(() => {
    setLoading(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    const localProduct = allProducts.find((p) => String(p.id) === String(id));
    if (localProduct) {
      setProduct(localProduct);
      setRelated(allProducts.filter((p) => p.category === localProduct.category && String(p.id) !== String(localProduct.id)).slice(0, 8));
      setTimeout(() => setLoading(false), 900);
    } else {
      fetch('http://localhost:5000/api/seller-products')
        .then(res => res.json())
        .then(data => {
          if (data.products) {
            const dbProductRaw = data.products.find(p => String(p.id) === String(id));
            if (dbProductRaw) {
               const mappedProduct = {
                  id: String(dbProductRaw.id),
                  name: dbProductRaw.title || '',
                  image: dbProductRaw.image_urls && dbProductRaw.image_urls.length > 0 ? dbProductRaw.image_urls[0] : '',
                  description: dbProductRaw.description || '',
                  price: Number(dbProductRaw.price),
                  rating: 4.5,
                  reviews: 0,
                  category: dbProductRaw.category || 'Soft Toys',
                  gallery: dbProductRaw.image_urls || []
               };
               setProduct(mappedProduct);
               
               const dbRelated = data.products
                 .filter(p => p.category === mappedProduct.category && String(p.id) !== String(mappedProduct.id))
                 .slice(0, 8)
                 .map(p => ({
                    id: String(p.id),
                    name: p.title || '',
                    image: p.image_urls && p.image_urls.length > 0 ? p.image_urls[0] : '',
                    price: Number(p.price),
                    category: p.category || 'Soft Toys'
                 }));
                 
               setRelated([...dbRelated, ...allProducts.filter((p) => p.category === mappedProduct.category)].slice(0, 8));
            } else {
               setProduct(null);
            }
          }
        })
        .catch(console.error)
        .finally(() => setTimeout(() => setLoading(false), 900));
    }
  }, [id]);

  const handlePreviewMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPos({ x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) });
  };

  const checkRelatedScroll = useCallback(() => {
    if (!relatedScrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = relatedScrollRef.current;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 8);
  }, []);

  const scrollRelated = (dir) => {
    if (!relatedScrollRef.current) return;
    relatedScrollRef.current.scrollBy({ left: dir === 'right' ? relatedScrollRef.current.clientWidth * 0.75 : -relatedScrollRef.current.clientWidth * 0.75, behavior: 'smooth' });
    setTimeout(checkRelatedScroll, 300);
  };

  useEffect(() => {
    const timer = setTimeout(checkRelatedScroll, 200);
    window.addEventListener('resize', checkRelatedScroll);
    return () => { clearTimeout(timer); window.removeEventListener('resize', checkRelatedScroll); };
  }, [loading, id, related.length, checkRelatedScroll]);

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

  const wishlisted = isWishlisted(product.id);
  const inCart     = isInCart(product.id);
  const handleAddToCart = () => { for (let i = 0; i < qty; i++) addToCart(product); };

  const reviewProducts  = [product, ...related.slice(0, 2)];
  const featuredReviews = reviewProducts.map((item, index) => {
    const defaultReviews = [
      { id: `${item.id}-1`, name: 'Priya',  role: 'Mom of 2', rating: 5, comment: `Very nice quality! ${item.name} kids-ku romba pidichirukku.`,             avatar: '👩' },
      { id: `${item.id}-2`, name: 'Kavin',  role: 'Dad of 1', rating: 4, comment: `${item.name} material super ah iruku. Packaging um neat ah vandhuduchu.`, avatar: '👨' },
      { id: `${item.id}-3`, name: 'Anitha', role: 'Mom of 1', rating: 5, comment: `${item.name} worth the price. Delivery fast ah vandhuduchu.`,             avatar: '👩‍👧' },
    ];
    const review = item.customerReviews?.length > 0
      ? { ...item.customerReviews[0], role: item.customerReviews[0].role || 'Verified Buyer', avatar: item.customerReviews[0].avatar || '👤' }
      : defaultReviews[index] || defaultReviews[0];
    return { product: item, review };
  });

  return (
    <>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 page-enter mt-32">

        {/* Back Button */}
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl border-2 border-orange-200 text-orange-600 font-semibold hover:bg-orange-500 hover:text-white hover:border-orange-500 transition-all duration-300 hover:scale-105 active:scale-95 shadow-sm"
          >
            <ArrowLeft size={18} /> Back
          </button>
        </div>

        {/* ── Product grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
          {/* Image */}
          <div className="space-y-4">
            <div
              className="rounded-3xl overflow-hidden bg-orange-50 aspect-square shadow-xl cursor-zoom-in relative group"
              onClick={() => setShowFullImage(true)}
            >
              <img src={product.image} alt={product.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                onError={(e) => { e.target.style.display = 'none'; e.target.parentElement.classList.add(product.gradient || 'toy-gradient-1'); }} />
              <div className="absolute bottom-4 right-4 px-3 py-2 rounded-xl text-xs font-bold bg-white/80 backdrop-blur-sm text-orange-600 shadow-sm">
                Click to view full image
              </div>
              {product.badge && <div className="absolute top-4 left-4"><span className="badge text-sm shadow">{product.badge}</span></div>}
              <button onClick={(e) => { e.stopPropagation(); toggleWishlist(product); }}
                className={`absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110 shadow-lg ${wishlisted ? 'bg-red-500 text-white' : 'bg-white text-gray-400 hover:text-red-400'}`}>
                <Heart size={18} fill={wishlisted ? 'currentColor' : 'none'} />
              </button>
            </div>
            <div className="flex gap-3 justify-center">
              {[product.image, product.image, product.image].map((img, i) => (
                <div key={i} onClick={() => setShowFullImage(true)}
                  className={`w-20 h-20 rounded-2xl overflow-hidden cursor-pointer transition-all ${i === 0 ? 'ring-2 ring-orange-400 shadow-md' : 'opacity-60 hover:opacity-100 ring-2 ring-transparent hover:ring-orange-200'}`}>
                  <img src={img} alt={`View ${i+1}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>

          {/* Details */}
          <div className="flex flex-col gap-5">
            <span className="inline-flex items-center gap-1.5 bg-orange-100 text-orange-600 text-xs font-bold px-3 py-1 rounded-full w-fit">{product.category}</span>
            <h1 className="font-display text-3xl md:text-4xl text-gray-800 leading-tight">{product.name}</h1>
            <div className="flex items-center gap-4 flex-wrap">
              <Rating rating={product.rating} reviews={product.reviews} size="md" />
              <span className="text-sm text-gray-400 font-medium">{product.rating} out of 5 stars</span>
            </div>
            <div className="flex items-baseline gap-3">
              <span className="font-display text-2xl text-orange-600">₹{product.price}</span>
              <span className="text-gray-400 line-through text-xl">₹{Math.round(product.price * 1.25)}</span>
              <span className="bg-green-100 text-green-700 text-sm font-bold px-2 py-0.5 rounded-lg">20% OFF</span>
            </div>
            <p className="text-gray-600 leading-relaxed font-body text-base">{product.description}</p>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse" />
              <span className="text-green-700 font-bold text-sm">In Stock — Ships within 24hrs</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm font-bold text-gray-700">Quantity:</span>
              <div className="flex items-center gap-3 bg-gray-100 rounded-2xl p-1">
                <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="w-9 h-9 rounded-xl bg-white shadow-sm hover:bg-orange-50 hover:text-orange-600 flex items-center justify-center transition-all hover:scale-110 active:scale-95"><Minus size={16} /></button>
                <span className="font-display text-xl text-gray-800 w-8 text-center">{qty}</span>
                <button onClick={() => setQty((q) => q + 1)} className="w-9 h-9 rounded-xl bg-white shadow-sm hover:bg-orange-50 hover:text-orange-600 flex items-center justify-center transition-all hover:scale-110 active:scale-95"><Plus size={16} /></button>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={handleAddToCart}
                className={`flex-1 h-12 flex items-center justify-center gap-2 rounded-2xl font-bold text-base shadow-toy hover:shadow-toy-hover transition-all duration-200 hover:scale-105 active:scale-95 ${inCart ? 'bg-green-500 hover:bg-green-600 text-white' : 'bg-orange-500 hover:bg-orange-600 text-white'}`}>
                <ShoppingCart size={20} />{inCart ? 'Added to Cart' : 'Add to Cart'}
              </button>
              <button onClick={() => toggleWishlist(product)}
                className={`w-12 h-12 flex items-center justify-center rounded-2xl border-2 transition-all hover:scale-110 active:scale-95 ${wishlisted ? 'bg-red-500 border-red-500 text-white' : 'border-orange-200 text-orange-400 hover:border-orange-400 hover:text-orange-500'}`}>
                <Heart size={20} fill={wishlisted ? 'currentColor' : 'none'} />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-3 pt-4 mt-2 border-t border-gray-100">
              {[
                { icon: <ShieldCheck size={18} />, text: 'Safe & Certified',    color: 'text-green-600',  bg: 'bg-green-50'  },
                { icon: <Truck       size={18} />, text: 'Free Shipping ₹999+', color: 'text-orange-600', bg: 'bg-orange-50' },
                { icon: <RotateCcw   size={18} />, text: '30-Day Returns',      color: 'text-purple-600', bg: 'bg-purple-50' },
              ].map((b, i) => (
                <div key={i} className={`flex flex-col items-center justify-center gap-2 text-center p-3 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition ${b.bg}`}>
                  <div className={b.color}>{b.icon}</div>
                  <span className="text-xs text-gray-600 font-semibold leading-tight">{b.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

       

        {/* ── ★ NEW: Ratings & Reviews ── */}
        <RatingsAndReviewsSection product={product} />

        {/* ── Related Products (unchanged) ── */}
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
                <button onClick={() => scrollRelated('left')} disabled={!canScrollLeft}
                  className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${canScrollLeft ? 'border-orange-200 text-orange-600 hover:bg-orange-500 hover:text-white hover:scale-110' : 'border-gray-200 text-gray-300 cursor-not-allowed'}`}>
                  <ChevronLeft size={20} />
                </button>
                <button onClick={() => scrollRelated('right')} disabled={!canScrollRight}
                  className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${canScrollRight ? 'border-orange-200 text-orange-600 hover:bg-orange-500 hover:text-white hover:scale-110' : 'border-gray-200 text-gray-300 cursor-not-allowed'}`}>
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>

            <div ref={relatedScrollRef} onScroll={checkRelatedScroll}
              className="flex gap-4 overflow-x-auto scrollbar-hide pb-4 -mx-1 px-1 scroll-smooth"
              style={{ scrollSnapType: 'x mandatory' }}>
              {related.map((p) => (
                <div key={p.id} className="flex-none w-64 md:w-72" style={{ scrollSnapAlign: 'start' }}>
                  <div onClick={() => navigate(`/product/${p.id}`)}
                    className="cursor-pointer bg-white rounded-3xl overflow-hidden border border-orange-100 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                    <div className="h-56 w-full overflow-hidden bg-orange-50">
                      <img src={p.image} alt={p.name} className="w-full h-full object-cover transition-transform duration-300 hover:scale-105" />
                    </div>
                    <div className="p-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full bg-orange-100 text-orange-600 text-xs font-bold mb-2">{p.category}</span>
                      <h3 className="font-bold text-gray-800 text-lg leading-snug line-clamp-2 mb-2">{p.name}</h3>
                      <p className={`text-gray-600 leading-relaxed font-body text-sm ${expandedId === p.id ? '' : 'line-clamp-2'}`}>
                        {p.description || 'This is a high-quality toy loved by kids. Safe, durable, and fun to play with.'}
                      </p>
                      <button onClick={(e) => { e.stopPropagation(); setExpandedId(expandedId === p.id ? null : p.id); }}
                        className="text-orange-500 text-xs font-semibold mt-1 mb-3 hover:underline">
                        {expandedId === p.id ? 'See Less' : 'See More'}
                      </button>
                      <div className="flex items-center gap-2 mb-3 flex-wrap">
                        <span className="text-orange-600 font-extrabold text-base">₹{p.price}</span>
                        <span className="text-xs text-gray-400 line-through">₹{Math.round(p.price * 1.25)}</span>
                      </div>
                      <div className="flex items-center gap-1 mb-4">
                        {[1,2,3,4,5].map((star) => <Star key={star} size={14} className={star <= Math.round(p.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'} />)}
                        <span className="text-xs text-gray-400 ml-1">{p.rating}</span>
                      </div>
                      <button onClick={(e) => { e.stopPropagation(); addToCart(p); }}
                        className="w-full py-2.5 rounded-2xl bg-orange-500 text-white font-semibold hover:bg-orange-600 transition-all duration-300">
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* ── Full-image overlay (unchanged) ── */}
      {showFullImage && (
        <div className="fixed inset-0 z-[999] bg-black/90 flex items-center justify-center p-6">
          <button onClick={() => { setShowFullImage(false); setShowZoomPreview(false); }}
            className="absolute top-5 right-5 bg-white text-gray-800 rounded-full p-2 hover:scale-110 transition">
            <X size={24} />
          </button>
          <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            <div className="bg-white rounded-2xl overflow-hidden flex items-center justify-center h-[70vh] cursor-crosshair"
              onMouseEnter={() => setShowZoomPreview(true)}
              onMouseLeave={() => setShowZoomPreview(false)}
              onMouseMove={handlePreviewMouseMove}>
              <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
            </div>
            {showZoomPreview && (
              <div className="hidden lg:flex bg-white rounded-2xl overflow-hidden h-[70vh] items-center justify-center">
                <div className="w-full h-full overflow-hidden">
                  <img ref={previewImgRef} src={product.image} alt={`${product.name} zoom preview`}
                    className="w-full h-full object-cover"
                    style={{ transform: 'scale(2.5)', transformOrigin: `${zoomPos.x}% ${zoomPos.y}%` }} />
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}