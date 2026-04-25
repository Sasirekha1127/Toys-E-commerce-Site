import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, ShoppingCart, Trash2, Sparkles } from 'lucide-react';
import { useStore } from '../../hooks/useStore';
import Rating from '../../components/user/Rating';
import { formatImageUrl } from '../../context/StoreContext';

export default function Wishlist() {
  const { wishlist, toggleWishlist, addToCart, isInCart } = useStore();
  const navigate = useNavigate();

  if (wishlist.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 text-center page-enter ">
        <div className="max-w-md mx-auto mt-24">
          <h2 className="font-display text-4xl text-orange-700 mb-3">Your Wishlist is Empty</h2>

          <button onClick={() => navigate('/')} className="btn-primary text-lg px-8 py-4">
            Explore Toys
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 pt-20 page-enter">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-4xl text-orange-700 flex items-center gap-3">
            <Heart size={32} className="text-red-400 fill-red-400" />
            My Wishlist
          </h1>
          <p className="text-gray-500 mt-1 font-body">{wishlist.length} toy{wishlist.length > 1 ? 's' : ''} saved</p>
        </div>
        <button
          onClick={() => navigate('/')}
          className="btn-outline text-sm hidden sm:flex items-center gap-2"
        >
          <Sparkles size={15} /> Keep Shopping
        </button>
      </div>

      {/* Products grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {wishlist.map((product, idx) => {
          const inCart = isInCart(product.id);
          const productImage =
            product.image ||
            product.imageUrl ||
            product.image_url ||
            (product.selectedVariant && product.selectedVariant.image_url) ||
            (product.variants && product.variants.length > 0 && product.variants[0].image_url) ||
            product.thumbnail ||
            product.images?.[0] ||
            product.image_urls?.[0] ||
            product.gallery?.[0] ||
            "/images/toy-placeholder.png";
          return (
            <div key={`${product.id}-${idx}`} className="card group flex flex-col">
              {/* Image */}
              <div
                className="relative overflow-hidden bg-orange-50 rounded-t-3xl aspect-square cursor-pointer"
                onClick={() => navigate(`/product/${product.id}`)}
              >
                <img
                  src={formatImageUrl(productImage)}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = "/images/toy-placeholder.png";
                  }}
                />

                {/* Remove from wishlist */}
                <button
                  onClick={e => { e.stopPropagation(); toggleWishlist(product); }}
                  className="absolute top-3 right-3 w-9 h-9 bg-red-500 text-white rounded-full flex items-center justify-center transition-all hover:scale-110 shadow-md"
                  title="Remove from wishlist"
                >
                  <Heart size={16} fill="currentColor" />
                </button>

                {product.badge && (
                  <div className="absolute top-3 left-3">
                    <span className="badge text-xs">{product.badge}</span>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="p-4 flex flex-col flex-1">
                <p className="text-xs font-bold text-orange-400 uppercase tracking-wider mb-1">{product.category}</p>
                <h3
                  className="font-display text-lg text-gray-800 mb-1 cursor-pointer hover:text-orange-600 transition-colors line-clamp-1"
                  onClick={() => navigate(`/product/${product.id}`)}
                >
                  {product.name}
                </h3>
                <Rating rating={product.rating} reviews={product.reviews} size="sm" />

                <div className="flex items-center justify-between mt-auto pt-4">
                  <span className="font-display text-2xl text-orange-600">₹{product.price}</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => toggleWishlist(product)}
                      className="w-9 h-9 flex items-center justify-center rounded-xl border-2 border-red-200 text-red-400 hover:bg-red-50 transition-all hover:scale-110"
                      title="Remove"
                    >
                      <Trash2 size={16} />
                    </button>
                    <button
                      onClick={() => addToCart(product)}
                      className={`flex items-center gap-1.5 text-sm font-bold py-2 px-3 rounded-xl transition-all hover:scale-105 active:scale-95
                        ${inCart
                          ? 'bg-green-100 text-green-700'
                          : 'bg-orange-500 hover:bg-orange-600 text-white shadow-toy'}`}
                    >
                      <ShoppingCart size={15} />
                      {inCart ? '✓' : 'Add'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom CTA */}
      <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-4 bg-orange-50 rounded-3xl p-6 border border-orange-100">
        <div>
          <p className="font-bold text-gray-700">Ready to add everything to cart?</p>
          <p className="text-sm text-gray-400 mt-0.5">Total: <span className="text-orange-600 font-bold">
            ₹{wishlist.reduce((s, p) => s + Number(p.price || 0), 0).toFixed(2)}          </span> for all {wishlist.length} items</p>
        </div>
        <button
          onClick={() => wishlist.forEach(p => addToCart(p))}
          className="btn-primary flex items-center gap-2 whitespace-nowrap"
        >
          <ShoppingCart size={18} /> Add All to Cart
        </button>
      </div>
    </div>
  );
}
