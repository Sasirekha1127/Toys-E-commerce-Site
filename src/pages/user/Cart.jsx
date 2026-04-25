import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Trash2, Plus, Minus, ArrowLeft, Tag, Truck, ShieldCheck, Heart } from 'lucide-react';
import { useStore } from '../../hooks/useStore';
import { parsePrice, formatImageUrl } from '../../context/StoreContext';
import Rating from '../../components/user/Rating';

export default function Cart() {
  const { cart, removeFromCart, updateQty, cartTotal, toggleWishlist, isWishlisted } = useStore();
  const navigate = useNavigate();

  //  Indian pricing
  const numericCartTotal = parsePrice(cartTotal);
  const shipping = numericCartTotal >= 500 || numericCartTotal === 0 ? 0 : 50;
  const tax = numericCartTotal * 0.08;
  const total = numericCartTotal + shipping + tax;

  if (cart.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 text-center page-enter">
        <div className="max-w-md mx-auto mt-24">
          <h2 className="font-display text-4xl text-orange-700 mb-3">Your Cart is Empty!</h2>

          <button onClick={() => navigate('/home')} className="btn-primary text-lg px-8 py-4">
            Start Shopping
          </button>
        </div>
      </div>
    );

  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 page-enter">

      {/* Header */}
      <div className="flex items-center gap-4 mb-8 ">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 flex items-center justify-center rounded-xl border-2 border-gray-200 text-gray-500 hover:border-orange-300 hover:text-orange-600 transition-all"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="mt-24">
          <h1 className="font-display text-4xl text-orange-700 flex items-center gap-3">
            <ShoppingCart size={32} className="text-orange-500" /> My Cart
          </h1>
          <p className="text-gray-500 mt-0.5 font-body">
            {cart.length} item{cart.length > 1 ? 's' : ''} in cart
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">



          {cart.map((item, idx) => {
            const itemVariantId = item.variant_id || item.selectedVariant?.variant_id || null;
            const wishlisted = isWishlisted(item.id, itemVariantId);
            const itemImage =
              item.image ||
              item.imageUrl ||
              item.image_url ||
              (item.selectedVariant && item.selectedVariant.image_url) ||
              (item.variants && item.variants.length > 0 && item.variants[0].image_url) ||
              item.thumbnail ||
              item.images?.[0] ||
              item.image_urls?.[0] ||
              item.gallery?.[0] ||
              "/images/toy-placeholder.png";
            return (
              <div key={`${item.id}-${idx}-${itemVariantId}`} className="bg-white rounded-3xl shadow-toy p-4 flex gap-4">

                {/* Image */}
                <div
                  className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl overflow-hidden bg-orange-50 cursor-pointer"
                  onClick={() => navigate(`/product/${item.id}`)}
                >
                  <img
                    src={formatImageUrl(itemImage)}
                    alt={item.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = "/images/toy-placeholder.png";
                    }}
                  />
                </div>

                {/* Info */}
                <div className="flex flex-col flex-1">

                  <div className="flex justify-between">
                    <div>
                      <p className="text-xs text-orange-400 uppercase">{item.category}</p>
                      <h3
                        className="text-lg font-bold cursor-pointer hover:text-orange-600"
                        onClick={() => navigate(`/product/${item.id}`)}
                      >
                        {item.name}
                      </h3>
                      <Rating rating={item.rating} reviews={item.reviews} size="sm" />
                    </div>

                    <span className="text-xl font-bold text-orange-600">
                      ₹{(parsePrice(item.price) * item.qty).toFixed(2)}
                    </span>
                  </div>

                  {/* Bottom */}
                  <div className="flex justify-between mt-4 flex-wrap gap-3">

                    {/* Qty */}
                    <div className="flex items-center gap-2">
                      <button onClick={() => item.qty === 1 ? removeFromCart(item.id, itemVariantId) : updateQty(item.id, item.qty - 1, itemVariantId)}>
                        {item.qty === 1 ? <Trash2 size={14} /> : <Minus size={14} />}
                      </button>

                      <span>{item.qty}</span>

                      <button onClick={() => updateQty(item.id, item.qty + 1, itemVariantId)}>
                        <Plus size={14} />
                      </button>
                    </div>

                    {/* Price */}
                    <span className="text-gray-500">₹{parsePrice(item.price)} each</span>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => toggleWishlist(item)}
                        className={`flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-xl border transition-all hover:scale-105
                          ${wishlisted ? 'border-red-300 bg-red-50 text-red-500' : 'border-gray-200 text-gray-400 hover:border-red-200 hover:text-red-400'}`}
                      >
                        <Heart size={13} fill={wishlisted ? 'currentColor' : 'none'} />
                        {wishlisted ? 'Wishlisted' : 'Wishlist'}
                      </button>
                      <button
                        onClick={() => removeFromCart(item.id, itemVariantId)}
                        className="flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-xl border border-gray-200 text-gray-400 hover:border-red-200 hover:text-red-500 hover:bg-red-50 transition-all hover:scale-105"
                      >
                        <Trash2 size={13} /> Remove
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary */}
        <div className="bg-white rounded-3xl p-6 shadow-toy">

          <h2 className="text-xl font-bold mb-4">Order Summary</h2>

          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>₹{numericCartTotal.toFixed(2)}</span>
            </div>

            <div className="flex justify-between">
              <span>Shipping</span>
              <span>{shipping === 0 ? 'FREE' : `₹${shipping}`}</span>
            </div>

            <div className="flex justify-between">
              <span>Tax</span>
              <span>₹{tax.toFixed(2)}</span>
            </div>

            <div className="flex justify-between font-bold text-lg">
              <span>Total</span>
              <span>₹{total.toFixed(2)}</span>
            </div>
          </div>

          <button
            onClick={() => {
              const ok = window.confirm("Proceed to checkout? 🛒");
              if (ok) {
                navigate("/checkout");
              }
            }}
            className="w-full mt-6 bg-orange-500 hover:bg-orange-600 text-white font-bold text-lg py-4 rounded-2xl
  shadow-toy hover:shadow-toy-hover transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
          >
            <ShoppingCart size={20} /> Checkout Securely
          </button>

        </div>
      </div>
    </div>
  );
}