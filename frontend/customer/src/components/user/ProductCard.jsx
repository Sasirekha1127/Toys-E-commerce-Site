import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, ShoppingCart, Eye } from 'lucide-react';
import { useStore } from '../../hooks/useStore';
import Rating from './Rating';
import { parsePrice, formatImageUrl, getProductImage } from '../../context/StoreContext';

// Compute discount % from product data
function getDiscount(product) {
  const price = parsePrice(product.price);
  const mrp = parsePrice(product.mrp);
  if (!mrp || mrp <= price) return null;
  return Math.round(((mrp - price) / mrp) * 100);
}

export default function ProductCard({ product, disableNavigation = false }) {
  const navigate = useNavigate();
  const { addToCart, toggleWishlist, isWishlisted, isInCart } = useStore();
  const wishlisted = isWishlisted(product.id);
  const inCart = isInCart(product.id);
  const [showPopup, setShowPopup] = useState(false);
  const [showCartPopup, setShowCartPopup] = useState(false);
  const discountPct = getDiscount(product);
  const price = parsePrice(product.price);
  const mrp = parsePrice(product.mrp);

  const handleWishlist = (e) => {
    e.stopPropagation();
    toggleWishlist(product);
    setShowPopup(true);
    setTimeout(() => setShowPopup(false), 1200);
  };

  const handleCart = (e) => {
    e.stopPropagation();
    addToCart(product);
    setShowCartPopup(true);
    setTimeout(() => setShowCartPopup(false), 1200);
  };
  const imageSrc =
    product.image ||
    product.image_url ||
    product.variants?.[0]?.image_url ||
    product.variants?.[0]?.gallery_images?.[0];

  const productImage = formatImageUrl(imageSrc);

  return (
    <div
      onClick={() => {
        if (!disableNavigation) {
          navigate(`/product/${product.id}`);
        }
      }}
      className={`card group relative transition-all duration-300 
      hover:shadow-[0_10px_30px_rgba(300,115,0,0.35)] hover:-translate-y-1
      ${disableNavigation ? "cursor-default" : "cursor-pointer"}`}    >
      {/* Discount Badge */}
      {discountPct && (
        <div className="absolute top-3 left-3 z-10">
          <span className="bg-red-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-md shadow leading-tight">
            {discountPct}% OFF
          </span>
        </div>
      )}

      {/* Wishlist Button */}
      <button
        onClick={handleWishlist}
        className={`absolute top-3 right-3 z-20 w-9 h-9 rounded-full flex items-center justify-center 
          transition-all duration-200 shadow-sm
          ${wishlisted ? 'bg-red-500 text-white' : 'bg-white text-gray-400 hover:text-red-400'}`}
        aria-label="Toggle wishlist"
      >
        <Heart size={16} fill={wishlisted ? 'currentColor' : 'none'} />
      </button>

      {/* Popup near heart */}
      {showPopup && (
        <div className="absolute top-3 right-14 z-30 bg-white text-orange-600 text-xs font-semibold px-3 py-1.5 rounded-full shadow-md border border-orange-200 animate-popup">
          {wishlisted ? 'Wishlisted!' : 'Removed!'}
        </div>
      )}

      {/* Image */}
      <div className="relative overflow-hidden bg-orange-50 rounded-t-3xl aspect-square">
        <img
          src={productImage}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = "/images/toy-placeholder.svg";
          }}
        />

        <div className="absolute inset-0 bg-orange-900/0 group-hover:bg-orange-900/10 transition-all duration-300 flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
            <span className="flex items-center gap-2 bg-white/90 backdrop-blur-sm text-orange-700 font-bold text-sm px-4 py-2 rounded-full shadow-lg">
              <Eye size={15} /> View Details
            </span>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col flex-1 gap-2">
        <p className="text-xs font-bold text-orange-400 uppercase tracking-wider">{product.category}</p>
        <h3 className="font-display text-lg text-gray-800 leading-tight line-clamp-1">{product.name}</h3>
        <p className="text-sm text-gray-500 line-clamp-2 font-body leading-relaxed">{product.description}</p>

        <div className="mt-auto pt-2">
          <Rating rating={product.rating} reviews={product.reviews} size="sm" />

          <div className="flex items-center justify-between mt-3 relative">
            <div className="flex flex-col gap-0.5">
              <span className="font-display text-xl text-orange-600">₹{price}</span>
              {mrp > price && (
                <span className="text-xs text-gray-400 line-through">₹{mrp}</span>
              )}
            </div>

            {/* cart */}
            <div className="relative">
              <button
                className="flex items-center gap-1.5 text-sm font-bold py-2 px-4 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 bg-orange-500 hover:bg-orange-600 text-white shadow-toy hover:shadow-toy-hover"
                onClick={handleCart}
              >
                <ShoppingCart size={15} />
                Add
              </button>

              {showCartPopup && (
                <div className="absolute top-1/4 right-20 -translate-y-1/2 z-30 bg-white text-orange-600 text-xs font-semibold px-3 py-1.5 rounded-full shadow-md border border-orange-200 animate-popup whitespace-nowrap">
                  Added to Cart!
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}