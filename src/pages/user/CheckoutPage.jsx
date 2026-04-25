import React, { useState, useEffect, useCallback, } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useStore } from "../../hooks/useStore";
import { parsePrice } from "../../context/StoreContext";
// import { useAuth } from "../../pages/user/Auth";
import emailjs from "emailjs-com";
import {
  Lock,
  ChevronDown,
  ChevronUp,
  Tag,
  Truck,
  ShieldCheck,
  CreditCard,
  Smartphone,
  Building2,
  Wallet,
  CheckCircle2,
  AlertCircle,
  Package,
  MapPin,
  User,
  Mail,
  Phone,
  Gift,
  Star,
  X,
} from "lucide-react";
import dotenv from "dotenv";
// ── GST rate ──────────────────────────────────────────────────
const GST_RATE = 0.05;

// Coupons will be fetched from backend

// ── Helpers ───────────────────────────────────────────────────
const fmt = (n) =>
  Number(n || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const validate = {
  name: (v) =>
    !v.trim()
      ? "Please enter your full name"
      : v.trim().length < 2
        ? "Please enter a valid name"
        : "",
  email: (v) =>
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim())
      ? "Please enter a valid email address"
      : "",
  phone: (v) =>
    !/^[6-9]\d{9}$/.test(v.replace(/\s/g, ""))
      ? "Please enter a valid 10-digit mobile number"
      : "",
  pincode: (v) =>
    !/^\d{6}$/.test(v.trim()) ? "Please enter a valid 6-digit pincode" : "",
  door: (v) => (!v.trim() ? "Please enter your door / flat number" : ""),
  street: (v) => (!v.trim() ? "Please enter your street / area" : ""),
  city: (v) => (!v.trim() ? "Please enter your city" : ""),
  state: (v) => (!v.trim() ? "Please select your state" : ""),
  card: (v) =>
    !/^\d{16}$/.test(v.replace(/\s/g, ""))
      ? "Enter a valid 16-digit card number"
      : "",
  expiry: (v) =>
    !/^(0[1-9]|1[0-2])\/\d{2}$/.test(v) ? "Format: MM/YY" : "",
  cvv: (v) => (!/^\d{3,4}$/.test(v) ? "Enter 3 or 4 digit CVV" : ""),
  upi: (v) =>
    !/^[\w.\-+]+@[\w]+$/.test(v.trim())
      ? "Enter a valid UPI ID (e.g. name@upi)"
      : "",
};

const STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa",
  "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala",
  "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland",
  "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
  "Uttar Pradesh", "Uttarakhand", "West Bengal", "Delhi", "Jammu & Kashmir",
  "Ladakh", "Puducherry",
];

// ── Email Helper ──────────────────────────────────────────────
const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

if (EMAILJS_PUBLIC_KEY) {
  emailjs.init(EMAILJS_PUBLIC_KEY);
}

const sendOrderEmail = (delivery, items, totals, orderId) => {
  const itemListHTML = items
    .map(
      (item) => `
      <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #eee;">
        <span>${item.name} x ${item.qty}</span>
        <span>₹${fmt(item.price * item.qty)}</span>
      </div>
    `
    )
    .join("");

  const templateParams = {
    name: delivery.name,
    email: delivery.email,
    phone: delivery.phone,
    door: delivery.door,
    street: delivery.street,
    city: delivery.city,
    state: delivery.state,
    pincode: delivery.pincode,
    order_id: orderId,
    items: itemListHTML,
    subtotal: fmt(totals.subtotal),
    delivery_charge: fmt(totals.delivery),
    gst: fmt(totals.gst),
    total: fmt(totals.total),
    brand_name: "ToyStore",
    email_subject: "Order Confirmation - ToyStore",
    email_header: "Order Received - ToyStore",
    email_footer: "Thank you for shopping with ToyStore!",
  };

  emailjs
    .send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams)
    .then(() => console.log("Email sent successfully"))
    .catch((err) => console.log("Email error:", err));
};

// ── Reusable class helpers ────────────────────────────────────
// Softer input borders — use orange-300 (not orange-400) for focus ring
const inputBase =
  "w-full box-border rounded-xl border bg-white px-4 py-3 text-sm text-gray-800 outline-none transition-all duration-200 focus:ring-2";
const inputNormal =
  "border-gray-200 focus:border-orange-300 focus:ring-orange-100 hover:border-orange-200";
const inputError =
  "border-red-300 bg-red-50 focus:border-red-300 focus:ring-red-100";

// ════════════════════════════════════════════════════════════
// TOAST NOTIFICATION
// ════════════════════════════════════════════════════════════
const Toast = ({ message, visible, onClose }) => (
  <div
    className={`fixed top-5 right-5 z-[9999] flex items-start gap-3 rounded-2xl border border-orange-100 bg-white px-5 py-4 shadow-xl shadow-gray-200/80 transition-all duration-500 max-w-sm w-[calc(100vw-2.5rem)] sm:w-auto ${visible
      ? "opacity-100 translate-y-0 pointer-events-auto"
      : "opacity-0 -translate-y-4 pointer-events-none"
      }`}
    role="alert"
    aria-live="assertive"
  >
    {/* Icon */}
    <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-orange-50">
      <AlertCircle size={15} className="text-orange-400" />
    </div>

    {/* Message */}
    <div className="flex-1 min-w-0">
      <p className="text-xs font-bold uppercase tracking-widest text-orange-400 mb-0.5">
        Required Field
      </p>
      <p className="text-sm font-semibold text-gray-800 leading-snug">{message}</p>
    </div>

    {/* Close */}
    <button
      onClick={onClose}
      className="mt-0.5 shrink-0 rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
      aria-label="Dismiss"
    >
      <X size={14} />
    </button>

    {/* Progress bar */}
    <div className="absolute bottom-0 left-0 right-0 h-0.5 overflow-hidden rounded-b-2xl">
      <div
        className={`h-full bg-gradient-to-r from-orange-300 to-amber-300 transition-all duration-[3500ms] ease-linear ${visible ? "w-0" : "w-full"
          }`}
      />
    </div>
  </div>
);

// ── useToast hook ─────────────────────────────────────────────
const useToast = () => {
  const [toast, setToast] = useState({ visible: false, message: "" });
  const timerRef = React.useRef(null);

  const showToast = useCallback((message) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setToast({ visible: true, message });
    timerRef.current = setTimeout(() => {
      setToast((prev) => ({ ...prev, visible: false }));
    }, 3500);
  }, []);

  const hideToast = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setToast((prev) => ({ ...prev, visible: false }));
  }, []);

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  return { toast, showToast, hideToast };
};

// ── Step Indicator ────────────────────────────────────────────
const StepBar = ({ step }) => (
  <div className="bg-white border-b border-gray-100 px-4 py-6">
    <div className="flex items-center justify-center max-w-sm mx-auto">
      {["Delivery", "Payment", "Confirm"].map((s, i) => {
        const current = step === i + 1;
        const done = step > i + 1;
        return (
          <React.Fragment key={s}>
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold transition-all duration-300 ${current
                  ? "bg-orange-500 text-white shadow-md shadow-orange-200/60 scale-110"
                  : done
                    ? "bg-emerald-500 text-white"
                    : "bg-gray-100 text-gray-400"
                  }`}
              >
                {done ? <CheckCircle2 size={16} /> : i + 1}
              </div>
              <span
                className={`text-[11px] font-semibold tracking-wide ${current ? "text-orange-500" : done ? "text-emerald-600" : "text-gray-400"
                  }`}
              >
                {s}
              </span>
            </div>
            {i < 2 && (
              <div
                className={`mx-2 mb-4 h-px w-14 sm:w-20 rounded-full transition-all duration-500 ${done ? "bg-emerald-300" : "bg-gray-200"
                  }`}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  </div>
);

// ── Section Card ──────────────────────────────────────────────
// Softer header: light warm gray instead of orange-50 gradient
const Section = ({ title, icon, children }) => (
  <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
    <div className="flex items-center gap-2.5 bg-gray-50 border-b border-gray-100 px-5 py-4">
      {icon && <span className="text-orange-400">{icon}</span>}
      <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500">
        {title}
      </h3>
    </div>
    <div className="p-5">{children}</div>
  </div>
);

// ── Field ─────────────────────────────────────────────────────
const Field = ({ label, error, children }) => (
  <div className="mb-4 last:mb-0">
    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-gray-400">
      {label}
    </label>
    {children}
    {error && (
      <span className="mt-1.5 flex items-center gap-1 text-xs text-red-500 font-medium">
        <AlertCircle size={12} /> {error}
      </span>
    )}
  </div>
);

// ════════════════════════════════════════════════════════════
// ORDER SUMMARY
// ════════════════════════════════════════════════════════════
const OrderSummary = ({
  cartItems, couponCode, setCouponCode,
  couponApplied, setCouponApplied,
  couponError, setCouponError,
  couponAmount, setCouponAmount,
  setAppliedCouponId,
}) => {
  const [open, setOpen] = useState(true);
  const [inputCode, setInputCode] = useState(couponCode);
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [showCouponsList, setShowCouponsList] = useState(false);

  const subtotal = cartItems.reduce(
    (sum, item) => sum + parsePrice(item.price) * item.qty, 0
  );
  const savings = cartItems.reduce(
    (sum, item) =>
      sum + (parsePrice(item.originalPrice ?? item.price) - parsePrice(item.price)) * (item.qty || 0), 0
  );
  const delivery = subtotal >= 499 ? 0 : 49;
  const gst = subtotal * GST_RATE;

  useEffect(() => {
    fetchAvailableCoupons();
  }, []);

  const fetchAvailableCoupons = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/coupons/available");
      const data = await res.json();
      if (data.coupons) setAvailableCoupons(data.coupons);
    } catch (err) {
      console.error("Error fetching available coupons:", err);
    }
  };

  const handleApplyCoupon = async (codeToApply) => {
    const code = (codeToApply || inputCode).trim().toUpperCase();
    if (!code) { setCouponError("Enter a coupon code"); return; }

    try {
      const res = await fetch("http://localhost:5000/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, subtotal })
      });
      const data = await res.json();

      if (data.valid) {
        setCouponApplied(data.code);
        setCouponCode(data.code);
        setCouponAmount(data.discount_amount);
        setAppliedCouponId(data.coupon_id);
        setCouponError("");
        setShowCouponsList(false);
      } else {
        setCouponError(data.error || "Invalid coupon code");
        setCouponApplied("");
        setCouponAmount(0);
      }
    } catch (err) {
      setCouponError("Failed to validate coupon");
    }
  };

  const handleRemoveCoupon = () => {
    setCouponApplied("");
    setCouponCode("");
    setInputCode("");
    setCouponAmount(0);
    setAppliedCouponId(null);
    setCouponError("");
  };

  const total = subtotal + delivery + gst - couponAmount;

  return (
    <div className="sticky top-5 rounded-2xl border border-gray-200 bg-white shadow-md overflow-hidden">
      {/* Header — muted warm tone instead of vivid orange-to-amber gradient */}
      <button
        className="w-full flex items-center justify-between bg-orange-500 px-5 py-4 text-white"
        onClick={() => setOpen((p) => !p)}
      >
        <div className="flex items-center gap-2.5">
          <Package size={18} />
          <span className="text-sm font-bold tracking-wide">
            Order Summary
          </span>
          <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-bold">
            {cartItems.length} item{cartItems.length > 1 ? "s" : ""}
          </span>
        </div>
        {open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </button>

      {open && (
        <>
          {/* Items */}
          <div className="max-h-60 overflow-y-auto border-b border-gray-100 px-4 py-4 space-y-3">
            {cartItems.map((item, idx) => (
              <div key={`${item.id}-${idx}`} className="flex items-center gap-3">
                <div className="relative shrink-0">
                  <img
                    src={item.images?.[0] || item.image}
                    alt={item.name}
                    className="h-14 w-14 rounded-xl border border-gray-100 object-cover bg-gray-50"
                    onError={(e) => { e.target.style.display = "none"; }}
                  />
                  <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-orange-500 text-[10px] font-extrabold text-white shadow-sm">
                    {item.qty}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-gray-800">{item.name}</p>
                  <p className="text-xs capitalize text-gray-400">{item.category}</p>
                  {item.selectedVariant && (
                    <p className="text-xs text-orange-500 font-medium">
                      {item.selectedVariant.variant_name}: {item.selectedVariant.variant_value}
                    </p>
                  )}
                </div>
                <span className="shrink-0 text-sm font-bold text-gray-800">
                  ₹{fmt(item.price * item.qty)}
                </span>
              </div>
            ))}
          </div>

          {/* Coupon */}
          <div className="border-b border-gray-100 bg-gray-50/60 px-4 py-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Gift size={15} className="text-orange-400" />
                <span className="text-xs font-bold uppercase tracking-widest text-gray-500">Promo Code</span>
              </div>
              {!couponApplied && availableCoupons.length > 0 && (
                <button
                  onClick={() => setShowCouponsList(!showCouponsList)}
                  className="text-[10px] font-bold text-orange-500 hover:text-orange-600 uppercase tracking-wider"
                >
                  {showCouponsList ? "Hide Offers" : "View Offers"}
                </button>
              )}
            </div>

            {couponApplied ? (
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 border border-emerald-200">
                  <CheckCircle2 size={13} /> {couponApplied} applied
                </span>
                <button className="text-xs text-red-400 underline hover:text-red-500 transition-colors" onClick={handleRemoveCoupon}>
                  Remove
                </button>
              </div>
            ) : (
              <>
                <div className="flex gap-2">
                  <input
                    className="flex-1 rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100 transition-all font-mono font-bold placeholder:font-normal placeholder:text-gray-400"
                    placeholder="Enter coupon code"
                    value={inputCode}
                    onChange={(e) => { setInputCode(e.target.value.toUpperCase()); setCouponError(""); }}
                  />
                  <button
                    className="rounded-xl bg-orange-500 px-4 py-2 text-xs font-bold text-white hover:bg-orange-600 transition-colors"
                    onClick={() => handleApplyCoupon()}
                  >
                    Apply
                  </button>
                </div>

                {showCouponsList && (
                  <div className="mt-3 space-y-2 animate-in fade-in slide-in-from-top-1 duration-200">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Available Offers</p>
                    <div className="max-h-40 overflow-y-auto space-y-2 pr-1">
                      {availableCoupons.map((c) => {
                        const isApplicable = subtotal >= c.min_order_val;
                        return (
                          <div
                            key={c.coupon_id}
                            onClick={() => isApplicable && handleApplyCoupon(c.code)}
                            className={`p-2.5 rounded-xl border flex items-center justify-between transition ${isApplicable
                              ? "bg-white border-gray-200 hover:border-orange-300 cursor-pointer"
                              : "bg-gray-50 border-gray-100 opacity-60 cursor-not-allowed"
                              }`}
                          >
                            <div className="min-w-0 flex-1">
                              <p className={`text-xs font-bold ${isApplicable ? 'text-orange-500' : 'text-gray-400'} font-mono`}>{c.code}</p>
                              <p className="text-[10px] text-gray-500 mt-0.5 truncate">{c.title || c.description}</p>
                              {!isApplicable && (
                                <p className="text-[9px] text-red-400 font-bold mt-0.5">Need ₹{fmt(c.min_order_val - subtotal)} more</p>
                              )}
                            </div>
                            <div className="text-right flex-none">
                              <p className={`text-[10px] font-bold ${isApplicable ? 'text-emerald-600' : 'text-gray-400'}`}>
                                {c.discount_type === 'percentage' ? `${c.discount_percent}% OFF` : `₹${fmt(c.discount_value)} OFF`}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </>
            )}
            {couponError && <p className="mt-1.5 text-xs text-red-500 font-medium">{couponError}</p>}
          </div>

          {/* Price breakdown */}
          <div className="border-b border-gray-100 px-4 py-4 space-y-2.5">
            <div className="flex justify-between text-sm text-gray-500">
              <span>Subtotal ({cartItems.reduce((n, i) => n + i.qty, 0)} items)</span>
              <span className="font-medium text-gray-700">₹{fmt(subtotal)}</span>
            </div>
            {savings > 0 && (
              <div className="flex justify-between text-sm font-semibold text-emerald-600">
                <span>Product Discount</span>
                <span>−₹{fmt(savings)}</span>
              </div>
            )}
            {couponAmount > 0 && (
              <div className="flex justify-between text-sm font-semibold text-emerald-600">
                <span>Coupon ({couponApplied})</span>
                <span>−₹{fmt(couponAmount)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm text-gray-500">
              <span className="flex items-center gap-1"><Truck size={13} /> Delivery</span>
              <span className={delivery === 0 ? "font-bold text-emerald-600" : "font-medium text-gray-700"}>
                {delivery === 0 ? "FREE" : `₹${delivery}`}
              </span>
            </div>
            <div className="flex justify-between text-sm text-gray-500">
              <span>GST (5%)</span>
              <span className="font-medium text-gray-700">+₹{fmt(gst)}</span>
            </div>
            <div className="h-px bg-gray-100 my-1" />
            <div className="flex justify-between text-base font-extrabold text-gray-900">
              <span>Total Payable</span>
              {/* Orange only on the total amount — makes it pop without overwhelming */}
              <span className="text-orange-500">₹{fmt(total)}</span>
            </div>
            {savings + couponAmount > 0 && (
              <div className="mt-2 rounded-xl bg-emerald-50 border border-emerald-100 px-3 py-2.5 text-center text-xs font-semibold text-emerald-700">
                🎉 You save ₹{fmt(savings + couponAmount)} on this order!
              </div>
            )}
          </div>

          {/* Trust badges — subtler */}
          <div className="grid grid-cols-3 gap-1 px-4 py-3.5 text-[10px] font-semibold text-gray-400">
            <span className="flex flex-col items-center gap-1">
              <ShieldCheck size={15} className="text-gray-400" />
              Secure Pay
            </span>
            <span className="flex flex-col items-center gap-1">
              <Truck size={15} className="text-gray-400" />
              Fast Ship
            </span>
            <span className="flex flex-col items-center gap-1">
              <Lock size={15} className="text-gray-400" />
              Safe & Private
            </span>
          </div>
        </>
      )}
    </div>
  );
};

// ════════════════════════════════════════════════════════════
// STEP 1 — DELIVERY DETAILS
// ════════════════════════════════════════════════════════════
const DELIVERY_FIELD_ORDER = [
  { key: "name", label: "full name" },
  { key: "email", label: "email address" },
  { key: "phone", label: "mobile number" },
  { key: "address", label: "address" },
  { key: "city", label: "city" },
  { key: "state", label: "state" },
  { key: "pincode", label: "pincode" },
];

const DeliveryStep = ({
  data, setData, onNext, user, showToast,
  saveAddress, setSaveAddress, addressType, setAddressType,
  isDefaultAddress, setIsDefaultAddress,
  addresses = [], setAddresses, selectedAddressId, onSelectAddress,
  showNewAddrForm, setShowNewAddrForm
}) => {
  const [errors, setErrors] = useState({});
  const [isExpanded, setIsExpanded] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);

  useEffect(() => {
    if (showNewAddrForm && !data.name && !editingAddressId) {
      setData((prev) => ({
        ...prev,
        name: prev.name || user?.name || "",
        email: prev.email || user?.email || "",
        phone: prev.phone || user?.phone || "",
      }));
    }
  }, [user, setData, showNewAddrForm, data.name, editingAddressId]);

  const setField = (key, value) => {
    setData((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const loadAddressIntoForm = (addr) => {
    setData({
      name: addr.full_name,
      email: user?.email || "",
      phone: addr.phone,
      address: addr.address_line_1 + (addr.address_line_2 ? ", " + addr.address_line_2 : ""),
      city: addr.city,
      state: addr.state,
      pincode: addr.pincode
    });
    setAddressType(addr.address_type || "Home");
    setSaveAddress(true);
  };

  const handleEditAddress = (addr) => {
    setEditingAddressId(addr.address_id);
    setShowNewAddrForm(true);
    setIsExpanded(true);
    loadAddressIntoForm(addr);
  };

  const validateForm = () => {
    const fields = ["name", "email", "phone", "address", "city", "state", "pincode"];
    const newErrors = {};
    fields.forEach((field) => {
      const err = validate[field]?.(data[field] || "");
      if (err) newErrors[field] = err;
    });
    return newErrors;
  };

  const handleSaveEdit = async () => {
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      const firstMissing = DELIVERY_FIELD_ORDER.find((f) => newErrors[f.key]);
      if (firstMissing) showToast(newErrors[firstMissing.key]);
      return;
    }

    try {
      const customerId = user?.customer_id || user?.id;
      const addressData = {
        full_name: data.name,
        phone: data.phone,
        address_line_1: data.address,
        address_line_2: "",
        city: data.city,
        state: data.state,
        pincode: data.pincode,
        address_type: addressType || "Home",
        is_default: isDefaultAddress || (addresses.find(a => a.address_id === editingAddressId)?.is_default || false)
      };

      const res = await fetch(`http://localhost:5000/api/addresses/${customerId}/${editingAddressId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(addressData)
      });

      if (!res.ok) throw new Error("Failed to update address");

      const updated = await res.json();

      if (setAddresses) {
        setAddresses(prev => prev.map(a => a.address_id === editingAddressId ? updated.address : a));
      }

      showToast("Address updated successfully!");
      setEditingAddressId(null);
      setShowNewAddrForm(false);
      onSelectAddress(updated.address);
      setIsExpanded(false);
    } catch (err) {
      console.error(err);
      showToast("Failed to update address.");
    }
  };

  const handleNext = () => {
    if (showNewAddrForm && !editingAddressId) {
      const newErrors = validateForm();
      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        const firstMissing = DELIVERY_FIELD_ORDER.find((f) => newErrors[f.key]);
        if (firstMissing) showToast(newErrors[firstMissing.key]);
        return;
      }
    } else if (!selectedAddressId) {
      showToast("Please select or add a delivery address");
      return;
    }
    onNext();
  };

  const inp = (key, props = {}) => (
    <input
      className={`${inputBase} ${errors[key] ? inputError : inputNormal}`}
      value={data[key] || ""}
      onChange={(e) => setField(key, e.target.value)}
      {...props}
    />
  );

  const selectedAddrObj = addresses.find(a => a.address_id === selectedAddressId);
  const showCollapsed = !isExpanded && !showNewAddrForm && selectedAddrObj;

  return (
    <div className="flex flex-col gap-5">
      {/* Existing Addresses Section */}
      {addresses.length > 0 && (
        <Section title="Delivery Address" icon={<MapPin size={16} />}>
          {showCollapsed ? (
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 rounded-2xl border-2 border-orange-400 bg-orange-50/40 p-5">
              <div className="flex items-start gap-4">
                <div className="mt-1 flex h-5 w-5 items-center justify-center rounded-full bg-orange-500 text-white shrink-0">
                  <CheckCircle2 size={12} />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-bold text-gray-900">{selectedAddrObj.full_name}</p>
                    <span className="rounded-full bg-orange-100 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-orange-500">
                      {selectedAddrObj.address_type || "Home"}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed max-w-md">
                    {selectedAddrObj.address_line_1} {selectedAddrObj.address_line_2 && <>{selectedAddrObj.address_line_2} </>} <br />
                    {selectedAddrObj.city}, {selectedAddrObj.state} - {selectedAddrObj.pincode}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-gray-700">Phone: {selectedAddrObj.phone}</p>
                </div>
              </div>
              <button
                onClick={() => setIsExpanded(true)}
                className="text-sm font-bold text-orange-500 hover:text-orange-600 whitespace-nowrap self-start"
              >
                Change
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-4 mb-4">
              {addresses.map((addr) => {
                const isActive = selectedAddressId === addr.address_id && !showNewAddrForm;
                return (
                  <div
                    key={addr.address_id}
                    className={`relative rounded-2xl border-2 p-4 transition-all duration-200 ${isActive
                      ? "border-orange-400 bg-orange-50/40"
                      : "border-gray-200 bg-white hover:border-orange-200 cursor-pointer"
                      }`}
                    onClick={() => {
                      if (!isActive) {
                        onSelectAddress(addr);
                        setShowNewAddrForm(false);
                        setEditingAddressId(null);
                      }
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-1">
                        <div className={`h-4 w-4 rounded-full border flex items-center justify-center ${isActive ? 'border-orange-400 bg-orange-500' : 'border-gray-300'}`}>
                          {isActive && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-1">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-bold text-gray-900">{addr.full_name}</p>
                            <span className="rounded-full bg-orange-50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-orange-500">
                              {addr.address_type || "Home"}
                            </span>
                          </div>
                          {!showNewAddrForm && (
                            <button
                              onClick={(e) => { e.stopPropagation(); handleEditAddress(addr); }}
                              className="text-xs font-bold text-orange-400 hover:text-orange-600"
                            >
                              Edit
                            </button>
                          )}
                        </div>
                        <p className="mt-1 text-sm text-gray-600 leading-relaxed">
                          {addr.address_line_1} {addr.address_line_2 && <>{addr.address_line_2} </>} <br />
                          {addr.city}, {addr.state} - {addr.pincode}
                        </p>
                        <p className="mt-1 text-sm font-semibold text-gray-700">Phone: {addr.phone}</p>

                        {isActive && !showNewAddrForm && (
                          <div className="mt-4">
                            <button
                              onClick={() => setIsExpanded(false)}
                              className="rounded-xl bg-orange-500 px-5 py-2 text-xs font-bold text-white hover:bg-orange-600 transition-colors"
                            >
                              Deliver to this address
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {isExpanded && !showNewAddrForm && (
            <button
              onClick={() => {
                setShowNewAddrForm(true);
                setEditingAddressId(null);
                setData({
                  name: user?.name || "",
                  email: user?.email || "",
                  phone: user?.phone || "",
                  address: "", city: "", state: "", pincode: ""
                });
              }}
              className="mt-2 text-sm font-bold text-gray-400 hover:text-orange-500 flex items-center gap-1 transition-colors"
            >
              <span className="text-lg">+</span> Add a new delivering address
            </button>
          )}
        </Section>
      )}

      {/* New / Edit Address Form */}
      {(showNewAddrForm || addresses.length === 0) && (
        <>
          <Section title={editingAddressId ? "Edit Address" : "New Delivery Address"} icon={<MapPin size={16} />}>
            <Field label="Full Name *" error={errors.name}>
              {inp("name", { placeholder: "Ramesh Kumar" })}
            </Field>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Email Address *" error={errors.email}>
                {inp("email", { type: "email", placeholder: "you@email.com" })}
              </Field>
              <Field label="Mobile Number *" error={errors.phone}>
                {inp("phone", { type: "tel", placeholder: "9876543210", maxLength: 10 })}
              </Field>
            </div>

            <div className="h-px bg-gray-100 my-4" />

            <Field label="Address *" error={errors.address}>
              {inp("address", { placeholder: "Flat, House no., Area, Street" })}
            </Field>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="City *" error={errors.city}>
                {inp("city", { placeholder: "Chennai" })}
              </Field>
              <Field label="Pincode *" error={errors.pincode}>
                {inp("pincode", { placeholder: "600001", maxLength: 6 })}
              </Field>
            </div>
            <Field label="State *" error={errors.state}>
              <select
                className={`${inputBase} ${errors.state ? inputError : inputNormal} cursor-pointer`}
                value={data.state || ""}
                onChange={(e) => setField("state", e.target.value)}
              >
                <option value="">Select State</option>
                {STATES.map((state) => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
            </Field>
            <Field label="Country">
              <input
                className={`${inputBase} ${inputNormal} bg-gray-50 cursor-not-allowed`}
                value="India"
                disabled
              />
            </Field>

            {user && (
              <div className="mt-4 space-y-3 rounded-2xl border border-gray-200 bg-gray-50/60 p-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={saveAddress}
                    onChange={(e) => setSaveAddress(e.target.checked)}
                    className="w-4 h-4 text-orange-500 rounded border-gray-300 focus:ring-orange-300"
                  />
                  <span className="text-sm font-semibold text-gray-700">Save this address for future use</span>
                </label>

                {saveAddress && (
                  <>
                    <div className="flex gap-2 mt-2">
                      {["Home", "Work", "Other"].map(type => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setAddressType(type)}
                          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${addressType === type
                            ? "bg-orange-500 text-white"
                            : "bg-white text-gray-500 border border-gray-200 hover:border-orange-200"
                            }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>

                    <label className="flex items-center gap-3 cursor-pointer mt-3">
                      <input
                        type="checkbox"
                        checked={isDefaultAddress}
                        onChange={(e) => setIsDefaultAddress(e.target.checked)}
                        className="w-4 h-4 text-orange-500 rounded border-gray-300 focus:ring-orange-300"
                      />
                      <span className="text-sm font-semibold text-gray-700">Make this my default address</span>
                    </label>
                  </>
                )}
              </div>
            )}

            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              {editingAddressId ? (
                <>
                  <button
                    onClick={handleSaveEdit}
                    className="flex-1 rounded-xl bg-orange-500 py-3.5 text-sm font-bold text-white hover:bg-orange-600 transition-colors"
                  >
                    Save Changes
                  </button>
                  <button
                    onClick={() => {
                      setEditingAddressId(null);
                      setShowNewAddrForm(false);
                      if (addresses.length > 0) {
                        const def = addresses.find(a => a.address_id === selectedAddressId) || addresses[0];
                        onSelectAddress(def);
                      }
                    }}
                    className="flex-1 rounded-xl border border-gray-200 bg-white py-3.5 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                addresses.length > 0 && (
                  <button
                    onClick={() => {
                      setShowNewAddrForm(false);
                      const def = addresses.find(a => a.address_id === selectedAddressId) || addresses[0];
                      onSelectAddress(def);
                    }}
                    className="w-full text-sm font-semibold text-gray-400 hover:text-gray-600 underline text-center"
                  >
                    Cancel
                  </button>
                )
              )}
            </div>
          </Section>
        </>
      )}

      {/* Free delivery badge — softer warm tint */}
      <div className="flex items-center gap-3 rounded-2xl bg-amber-50 border border-amber-100 px-5 py-3.5 mt-2">
        <Truck size={18} className="text-amber-500 shrink-0" />
        <p className="text-sm text-gray-600 font-medium">
          <span className="font-bold text-amber-600">Free delivery</span> on orders above ₹499!
          Orders below ₹499 attract a ₹49 delivery fee.
        </p>
      </div>

      <button
        className="w-full rounded-2xl bg-orange-500 px-4 py-4 text-sm font-bold tracking-wider text-white shadow-md shadow-orange-200/50 transition-all hover:-translate-y-0.5 hover:bg-orange-600 hover:shadow-lg hover:shadow-orange-200/50 active:translate-y-0 mt-2"
        onClick={handleNext}
      >
        Continue to Payment →
      </button>
    </div>
  );
};

// ════════════════════════════════════════════════════════════
// STEP 2 — PAYMENT
// ════════════════════════════════════════════════════════════
const PaymentStep = ({ method, setMethod, onNext, onBack, showToast }) => {
  const [card, setCard] = useState({ number: "", expiry: "", cvv: "", name: "" });
  const [upi, setUpi] = useState("");
  const [selectedOption, setSelectedOption] = useState("");
  const [errors, setErrors] = useState({});

  const setCardField = (key, value) => {
    setCard((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const formatCardNum = (value) =>
    value.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
  const formatExpiry = (value) => {
    const digits = value.replace(/\D/g, "").slice(0, 4);
    return digits.length >= 3 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
  };

  const handleNext = () => {
    const newErrors = {};

    if (method === "card") {
      const cardErr = validate.card(card.number);
      const expiryErr = validate.expiry(card.expiry);
      const cvvErr = validate.cvv(card.cvv);
      if (cardErr) newErrors.number = cardErr;
      if (expiryErr) newErrors.expiry = expiryErr;
      if (cvvErr) newErrors.cvv = cvvErr;
      if (!card.name.trim()) newErrors.cardName = "Please enter the cardholder name";
    } else if (method === "upi") {
      const upiErr = validate.upi(upi);
      if (upiErr) newErrors.upi = upiErr;
    } else if (method === "netbanking") {
      if (!selectedOption) newErrors.net = "Please select a bank to continue";
    } else if (method === "wallet") {
      if (!selectedOption) newErrors.wallet = "Please select a wallet to continue";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      const firstMsg = Object.values(newErrors)[0];
      showToast(firstMsg);
      return;
    }
    onNext();
  };

  const banks = [
    "State Bank of India", "HDFC Bank", "ICICI Bank", "Axis Bank",
    "Kotak Mahindra Bank", "Bank of Baroda", "Punjab National Bank", "Canara Bank",
  ];
  const wallets = [
    "Paytm Wallet", "Amazon Pay", "Mobikwik", "Freecharge", "Airtel Money", "JioMoney",
  ];

  const PayMethod = ({ id, icon, label }) => (
    <button
      type="button"
      className={`flex flex-col items-center gap-1.5 rounded-xl border px-4 py-3 text-xs font-bold transition-all duration-200 min-w-[72px] ${method === id
        ? "border-orange-300 bg-orange-50 text-orange-500 shadow-sm scale-105"
        : "border-gray-200 bg-gray-50 text-gray-500 hover:border-orange-200 hover:bg-orange-50 hover:text-orange-400"
        }`}
      onClick={() => { setMethod(id); setErrors({}); setSelectedOption(""); }}
    >
      <span className={method === id ? "text-orange-400" : "text-gray-400"}>{icon}</span>
      <span>{label}</span>
    </button>
  );

  return (
    <div className="flex flex-col gap-5">
      <Section title="Payment Method" icon={<CreditCard size={16} />}>
        <div className="flex flex-wrap gap-3">
          <PayMethod id="card" icon={<CreditCard size={18} />} label="Card" />
          <PayMethod id="upi" icon={<Smartphone size={18} />} label="UPI" />
          <PayMethod id="netbanking" icon={<Building2 size={18} />} label="Net Banking" />
          <PayMethod id="wallet" icon={<Wallet size={18} />} label="Wallet" />
          <PayMethod id="cod" icon={<Truck size={18} />} label="COD" />
        </div>
      </Section>

      {method === "card" && (
        <Section title="Card Details" icon={<CreditCard size={16} />}>
          {/* Card visual — soft orange, minimal and modern */}
          <div className="mb-5 rounded-2xl bg-gradient-to-br from-orange-50 via-orange-100/50 to-orange-50 border border-orange-100 p-6 shadow-sm relative overflow-hidden">
            {/* Soft decorative elements */}
            <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-orange-200/20 -translate-y-16 translate-x-16" />
            <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full bg-white/60 translate-y-12 -translate-x-12" />
            
            <div className="relative">
              {/* Card Chip Visual */}
              <div className="mb-6 h-8 w-11 rounded-lg bg-gradient-to-br from-orange-200 to-amber-300 shadow-sm border border-orange-200/50" />
              
              <p className="mb-5 font-mono text-xl tracking-[0.2em] text-orange-950/80 drop-shadow-sm">
                {card.number || "•••• •••• •••• ••••"}
              </p>
              
              <div className="flex justify-between items-end text-[10px] tracking-[0.15em] text-orange-900/70 font-bold uppercase">
                <div className="flex flex-col gap-1">
                  <span className="text-[8px] text-orange-400 font-bold tracking-normal opacity-70">CARDHOLDER NAME</span>
                  <span className="tracking-widest">{card.name || "CARDHOLDER NAME"}</span>
                </div>
                <div className="flex flex-col gap-1 items-end">
                  <span className="text-[8px] text-orange-400 font-bold tracking-normal opacity-70">EXPIRES</span>
                  <span className="tracking-widest">{card.expiry || "MM/YY"}</span>
                </div>
              </div>
            </div>
          </div>

          <Field label="Card Number *" error={errors.number}>
            <input
              className={`${inputBase} ${errors.number ? inputError : inputNormal} font-mono tracking-widest`}
              placeholder="1234 5678 9012 3456"
              maxLength={19}
              value={card.number}
              onChange={(e) => setCardField("number", formatCardNum(e.target.value))}
            />
          </Field>
          <Field label="Cardholder Name *" error={errors.cardName}>
            <input
              className={`${inputBase} ${errors.cardName ? inputError : inputNormal}`}
              placeholder="As on card"
              value={card.name}
              onChange={(e) => setCardField("name", e.target.value.toUpperCase())}
            />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Expiry Date *" error={errors.expiry}>
              <input
                className={`${inputBase} ${errors.expiry ? inputError : inputNormal}`}
                placeholder="MM/YY"
                maxLength={5}
                value={card.expiry}
                onChange={(e) => setCardField("expiry", formatExpiry(e.target.value))}
              />
            </Field>
            <Field label="CVV *" error={errors.cvv}>
              <input
                className={`${inputBase} ${errors.cvv ? inputError : inputNormal}`}
                placeholder="•••"
                maxLength={4}
                type="password"
                value={card.cvv}
                onChange={(e) => setCardField("cvv", e.target.value.replace(/\D/g, ""))}
              />
            </Field>
          </div>
        </Section>
      )}

      {method === "upi" && (
        <Section title="UPI Payment" icon={<Smartphone size={16} />}>
          <div className="mb-4 flex flex-wrap gap-2">
            {["GPay", "PhonePe", "Paytm", "BHIM"].map((app) => (
              <button
                key={app}
                type="button"
                className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-2 text-sm font-bold text-gray-600 transition-all hover:bg-orange-50 hover:border-orange-200 hover:text-orange-500"
              >
                {app}
              </button>
            ))}
          </div>
          <Field label="UPI ID *" error={errors.upi}>
            <input
              className={`${inputBase} ${errors.upi ? inputError : inputNormal}`}
              placeholder="yourname@upi"
              value={upi}
              onChange={(e) => { setUpi(e.target.value); if (errors.upi) setErrors((p) => ({ ...p, upi: "" })); }}
            />
          </Field>
          <p className="mt-2 text-xs text-gray-400">
            Enter your UPI ID and a payment request will be sent to your UPI app.
          </p>
        </Section>
      )}

      {method === "netbanking" && (
        <Section title="Select Your Bank" icon={<Building2 size={16} />}>
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {banks.map((bank) => (
              <button
                key={bank}
                type="button"
                className={`rounded-xl border px-4 py-3 text-left text-sm font-medium transition-all ${selectedOption === bank
                  ? "border-orange-300 bg-orange-50 text-orange-600"
                  : "border-gray-200 bg-gray-50 text-gray-700 hover:border-orange-200 hover:bg-orange-50"
                  }`}
                onClick={() => { setSelectedOption(bank); setErrors((p) => ({ ...p, net: "" })); }}
              >
                {bank}
              </button>
            ))}
          </div>
          {errors.net && (
            <p className="mt-2 flex items-center gap-1 text-xs text-red-500 font-medium">
              <AlertCircle size={12} /> {errors.net}
            </p>
          )}
        </Section>
      )}

      {method === "wallet" && (
        <Section title="Select Wallet" icon={<Wallet size={16} />}>
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {wallets.map((wallet) => (
              <button
                key={wallet}
                type="button"
                className={`rounded-xl border px-4 py-3 text-left text-sm font-medium transition-all ${selectedOption === wallet
                  ? "border-orange-300 bg-orange-50 text-orange-600"
                  : "border-gray-200 bg-gray-50 text-gray-700 hover:border-orange-200 hover:bg-orange-50"
                  }`}
                onClick={() => { setSelectedOption(wallet); setErrors((p) => ({ ...p, wallet: "" })); }}
              >
                {wallet}
              </button>
            ))}
          </div>
          {errors.wallet && (
            <p className="mt-2 flex items-center gap-1 text-xs text-red-500 font-medium">
              <AlertCircle size={12} /> {errors.wallet}
            </p>
          )}
        </Section>
      )}

      {method === "cod" && (
        <Section title="Cash on Delivery" icon={<Truck size={16} />}>
          <div className="rounded-2xl border border-dashed border-amber-200 bg-amber-50/60 p-4 text-sm leading-7 text-gray-700">
            <p>💰 Pay in cash when your order arrives at your doorstep.</p>
            <p className="text-amber-600 font-medium">Note: COD available for orders up to ₹5,000.</p>
          </div>
        </Section>
      )}

      <div className="flex items-center gap-3">
        <button
          className="rounded-2xl border border-gray-200 bg-white px-5 py-3.5 text-sm font-bold text-gray-600 transition-all hover:bg-gray-50 hover:border-gray-300"
          onClick={onBack}
        >
          ← Back
        </button>
        <button
          className="flex-1 rounded-2xl bg-orange-500 px-4 py-4 text-sm font-bold tracking-wider text-white shadow-md shadow-orange-200/50 transition-all hover:-translate-y-0.5 hover:bg-orange-600 hover:shadow-lg hover:shadow-orange-200/50 active:translate-y-0"
          onClick={handleNext}
        >
          Review Order →
        </button>
      </div>
    </div>
  );
};

// STEP 3 — CONFIRM
const ConfirmStep = ({ delivery, cartItems, onBack, onPlace, couponApplied, couponAmount, isAdmin }) => {
  const subtotal = cartItems.reduce((sum, item) => sum + parsePrice(item.price) * (item.qty || 0), 0);
  const savings = cartItems.reduce(
    (sum, item) =>
      sum + (parsePrice(item.originalPrice ?? item.price) - parsePrice(item.price)) * (item.qty || 0), 0
  );
  const deliveryFee = subtotal >= 499 ? 0 : 49;
  const gst = subtotal * GST_RATE;
  const total = subtotal + deliveryFee + gst - couponAmount;

  return (
    <div className="flex flex-col gap-5">
      <Section title="Delivery Address" icon={<MapPin size={16} />}>
        <div className="rounded-2xl border border-gray-200 bg-gray-50/60 p-4 text-sm leading-7 text-gray-800">
          <p className="text-base font-bold text-gray-900">{delivery.name}</p>
          <p className="text-gray-600">{delivery.address}</p>
          <p className="text-gray-600">{delivery.city} — {delivery.pincode}</p>
          <p className="text-gray-600">{delivery.state}</p>
          <div className="mt-2 flex flex-wrap gap-3 text-xs text-gray-500 font-medium">
            <span className="flex items-center gap-1"><Phone size={12} className="text-orange-400" /> {delivery.phone}</span>
            <span className="flex items-center gap-1"><Mail size={12} className="text-orange-400" /> {delivery.email}</span>
          </div>
        </div>
      </Section>

      <Section title="Order Items" icon={<Package size={16} />}>
        <div className="space-y-2">
          {cartItems.map((item, idx) => (
            <div
              key={`${item.id}-${idx}`}
              className="flex items-center justify-between py-2.5 border-b border-gray-100 last:border-b-0"
            >
              <div className="flex items-center gap-3">
                <img
                  src={item.images?.[0] || item.image}
                  alt={item.name}
                  className="h-10 w-10 rounded-xl object-cover border border-gray-100 bg-gray-50"
                  onError={(e) => { e.target.style.display = "none"; }}
                />
                <div>
                  <span className="text-sm text-gray-800 font-medium">
                    {item.name} <span className="text-gray-400">× {item.qty}</span>
                  </span>
                  {item.selectedVariant && (
                    <p className="text-xs text-orange-400 font-medium">
                      {item.selectedVariant.variant_name}: {item.selectedVariant.variant_value}
                    </p>
                  )}
                </div>
              </div>
              <span className="text-sm font-bold text-gray-800">₹{fmt(item.price * item.qty)}</span>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Price Breakdown" icon={<Tag size={16} />}>
        <div className="space-y-2.5">
          <div className="flex justify-between text-sm text-gray-500">
            <span>Subtotal</span>
            <span className="font-medium text-gray-700">₹{fmt(subtotal)}</span>
          </div>
          {savings > 0 && (
            <div className="flex justify-between text-sm font-semibold text-emerald-600">
              <span>Product Discount</span>
              <span>−₹{fmt(savings)}</span>
            </div>
          )}
          {couponAmount > 0 && (
            <div className="flex justify-between text-sm font-semibold text-emerald-600">
              <span>Coupon ({couponApplied})</span>
              <span>−₹{fmt(couponAmount)}</span>
            </div>
          )}
          <div className="flex justify-between text-sm text-gray-500">
            <span>Delivery</span>
            <span className={deliveryFee === 0 ? "font-bold text-emerald-600" : "font-medium text-gray-700"}>
              {deliveryFee === 0 ? "FREE" : `₹${deliveryFee}`}
            </span>
          </div>
          <div className="flex justify-between text-sm text-gray-500">
            <span>GST (5%)</span>
            <span className="font-medium text-gray-700">+₹{fmt(gst)}</span>
          </div>
          <div className="h-px bg-gray-100" />
          <div className="flex justify-between text-base font-extrabold text-gray-900">
            <span>Total Payable</span>
            <span className="text-orange-500">₹{fmt(total)}</span>
          </div>
        </div>
      </Section>

      <div className="flex items-center gap-3">
        <button
          className="rounded-2xl border border-gray-200 bg-white px-5 py-3.5 text-sm font-bold text-gray-600 transition-all hover:bg-gray-50 hover:border-gray-300"
          onClick={onBack}
        >
          ← Back
        </button>
        <button
          className={`flex flex-1 items-center justify-center gap-2 rounded-2xl px-4 py-4 text-sm font-bold tracking-wider text-white shadow-md transition-all ${
            isAdmin 
              ? "bg-gray-400 cursor-not-allowed" 
              : "bg-emerald-600 shadow-emerald-200/50 hover:-translate-y-0.5 hover:bg-emerald-700 hover:shadow-lg hover:shadow-emerald-200/50 active:translate-y-0"
          }`}
          onClick={isAdmin ? null : onPlace}
          disabled={isAdmin}
        >
          <Lock size={16} /> {isAdmin ? "Admin Checkout Disabled" : `Place Order · ₹${fmt(total)}`}
        </button>
      </div>
    </div>
  );
};

// ════════════════════════════════════════════════════════════
// SUCCESS
// ════════════════════════════════════════════════════════════
const OrderSuccess = ({ orderId, name }) => {
  const navigate = useNavigate();
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-3xl border border-gray-100 bg-white px-8 py-12 text-center shadow-xl shadow-gray-200/60">
        <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-orange-50 text-5xl">
          🎉
        </div>
        <div className="mb-1 flex items-center justify-center gap-1">
          {[1, 2, 3, 4, 5].map(i => (
            <Star key={i} size={14} className="fill-amber-400 text-amber-400" />
          ))}
        </div>
        <h2 className="mt-3 mb-2 text-2xl font-extrabold text-gray-900">
          Order Placed!
        </h2>
        <p className="mb-5 text-sm text-gray-500">
          Thank you, <strong className="text-orange-500">{name}</strong>! Your order is confirmed and on its way.
        </p>
        <div className="mx-auto mb-5 inline-flex items-center gap-2 rounded-2xl border border-gray-100 bg-gray-50 px-5 py-3 text-sm">
          <Package size={16} className="text-orange-400" />
          <span className="text-gray-500">Order ID:</span>
          <strong className="text-gray-800">{orderId}</strong>
        </div>
        <p className="mb-7 text-xs text-gray-400">
          A confirmation email has been sent to your inbox.
        </p>
        <button
          className="w-full rounded-2xl bg-orange-500 px-5 py-4 text-sm font-bold tracking-wider text-white shadow-md shadow-orange-200/50 transition-all hover:-translate-y-0.5 hover:bg-orange-600 hover:shadow-lg"
          onClick={() => navigate("/")}
        >
          Continue Shopping
        </button>
      </div>
    </div>
  );
};

// MAIN CHECKOUT PAGE
const CheckoutPage = () => {
  const location = useLocation();
  const isBuyNow = location.state?.buyNow === true;
  const buyNowItems = location.state?.items ?? [];

  const { cart, clearCart, addOrder } = useStore();
  const navigate = useNavigate();

  const items = isBuyNow ? buyNowItems : cart;

  const [step, setStep] = useState(1);
  const [delivery, setDelivery] = useState({});
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [couponCode, setCouponCode] = useState("");
  const [couponApplied, setCouponApplied] = useState("");
  const [couponError, setCouponError] = useState("");
  const [couponAmount, setCouponAmount] = useState(0);
  const [appliedCouponId, setAppliedCouponId] = useState(null);
  const [orderId, setOrderId] = useState("");
  const [placed, setPlaced] = useState(false);
  const [saveAddress, setSaveAddress] = useState(true);
  const [isDefaultAddress, setIsDefaultAddress] = useState(false);
  const [addressType, setAddressType] = useState("Home");

  const { toast, showToast, hideToast } = useToast();
  const [user, setUser] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [loadingAddr, setLoadingAddr] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [showNewAddrForm, setShowNewAddrForm] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem("toyCurrentUser");
    if (!raw && !placed) {
      navigate("/auth");
      return;
    }
    if (raw) {
      const parsed = JSON.parse(raw);
      setUser(parsed);

      const customerId = parsed.customer_id || parsed.id;

      fetch(`http://localhost:5000/api/user/profile/${customerId}`)
        .then(res => res.json())
        .then(data => {
          if (data.user) {
            setUser(prev => ({ ...prev, ...data.user }));
          }
        })
        .catch(err => console.error("Checkout profile fetch error:", err));

      setLoadingAddr(true);
      fetch(`http://localhost:5000/api/addresses/${customerId}`)
        .then(res => res.json())
        .then(data => {
          const list = data.addresses || [];
          setAddresses(list);
          if (list.length > 0) {
            const def = list.find(a => a.is_default) || list[0];
            setSelectedAddressId(def.address_id);
            setDelivery({
              name: def.full_name,
              email: parsed.email,
              phone: def.phone,
              address: def.address_line_1 + (def.address_line_2 ? ", " + def.address_line_2 : ""),
              city: def.city,
              state: def.state,
              pincode: def.pincode
            });
            setShowNewAddrForm(false);
          } else {
            setShowNewAddrForm(true);
          }
        })
        .catch(err => console.error("Checkout addresses fetch error:", err))
        .finally(() => setLoadingAddr(false));
    }
  }, [navigate, placed]);

  useEffect(() => {
    if (items.length === 0 && !placed && !isBuyNow) navigate("/cart");
  }, [items, placed, isBuyNow, navigate]);

  const handlePlace = async () => {
    const display_id = "ORD-" + Date.now().toString().slice(-8);
    const subtotal = items.reduce((sum, item) => sum + parsePrice(item.price) * (item.qty || 0), 0);
    const deliveryFee = subtotal >= 499 ? 0 : 49;
    const gst = subtotal * GST_RATE;
    const total = subtotal + deliveryFee + gst - couponAmount;

    if (user?.role === 'admin') {
      alert("Admins are not allowed to place customer orders. Please log in with a normal customer account to complete your purchase.");
      return;
    }

    console.log("COUPON SENT TO BACKEND:", {
      coupon_id: appliedCouponId,
      coupon_code: couponApplied,
      discount_amount: couponAmount
    });

    const orderData = {
      user_id: user?.customer_id || user?.id || null,
      customer_id: user?.customer_id || user?.id || null,
      address_id: selectedAddressId,
      order_id: display_id,
      items: items,
      subtotal: subtotal,
      discount_amount: couponAmount || 0,
      tax_amount: gst,
      shipping_charge: deliveryFee,
      total_amount: total,
      shipping_address: `${delivery.address}, ${delivery.city}, ${delivery.state} - ${delivery.pincode}`,
      coupon_id: appliedCouponId || null,
      coupon_code: couponApplied || null,
      payment_method: paymentMethod || "Card"
    };

    try {
      const response = await fetch("http://localhost:5000/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        throw new Error("Failed to save order to database");
      }

      const result = await response.json();
      console.log("Order saved to DB:", result);

      if (showNewAddrForm && saveAddress) {
        const customerId = user?.customer_id || user?.id;
        const addressData = {
          full_name: delivery.name,
          phone: delivery.phone,
          address_line_1: delivery.address,
          address_line_2: "",
          city: delivery.city,
          state: delivery.state,
          pincode: delivery.pincode,
          address_type: addressType || "Home",
          is_default: isDefaultAddress
        };
        try {
          await fetch(`http://localhost:5000/api/addresses/${customerId}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(addressData)
          });
        } catch (err) {
          console.error("Network error while saving address:", err.message);
        }
      }

      sendOrderEmail(delivery, items, { subtotal, delivery: deliveryFee, gst, total }, display_id);
      setOrderId(display_id);

      addOrder({
        id: display_id,
        items,
        total,
        date: new Date().toISOString(),
        status: 'Confirmed'
      });

      if (!isBuyNow) clearCart();

      setPlaced(true);
    } catch (err) {
      console.error("Order placement error:", err);
      showToast("Error placing order. Please try again.");
    }
  };

  if (placed) {
    return (
      <div className="min-h-screen bg-gray-50">
        <OrderSuccess orderId={orderId} name={delivery.name || "Customer"} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-16 text-gray-900">

      <Toast message={toast.message} visible={toast.visible} onClose={hideToast} />

      {/* Top bar — deeper, more grounded tone instead of vivid orange-600/amber-500 */}
      <div className="bg-orange-600 px-4 py-3 sm:px-8">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="flex items-center gap-2.5 text-white">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/15 text-lg">
              🧸
            </div>
            <span className="text-sm font-bold tracking-wide">ToyStore — Secure Checkout</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-white/70 font-medium">
            <Lock size={13} /> SSL Secured
          </div>
        </div>
      </div>

      {/* Step bar */}
      <StepBar step={step} />

      {user?.role === 'admin' && step === 3 && (
        <div className="mx-auto max-w-6xl mt-4 px-4 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-3 rounded-2xl bg-red-50 border border-red-100 px-5 py-4 text-sm text-red-600 font-semibold shadow-sm">
            <AlertCircle size={20} className="shrink-0" />
            <p>Admin Session Detected: Admins are not allowed to place orders. Please log in as a customer to complete your purchase.</p>
          </div>
        </div>
      )}

      {/* Page title */}
      <div className="border-b border-gray-100 bg-white px-4 py-4">
        <div className="mx-auto max-w-6xl">
          <h1 className="text-xl font-extrabold text-gray-900">
            {step === 1 && "Delivery Details"}
            {step === 2 && "Payment Details"}
            {step === 3 && "Review & Confirm"}
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">
            {step === 1 && "Enter your contact and shipping address"}
            {step === 2 && "Choose how you'd like to pay"}
            {step === 3 && "Review your order before placing it"}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto mt-6 grid max-w-6xl grid-cols-1 gap-6 px-4 lg:grid-cols-[1fr_380px]">
        {/* Form column */}
        <div>
          {step === 1 && (
            <DeliveryStep
              user={user}
              data={delivery}
              setData={setDelivery}
              onNext={() => setStep(2)}
              showToast={showToast}
              saveAddress={saveAddress}
              setSaveAddress={setSaveAddress}
              addressType={addressType}
              setAddressType={setAddressType}
              isDefaultAddress={isDefaultAddress}
              setIsDefaultAddress={setIsDefaultAddress}
              addresses={addresses}
              setAddresses={setAddresses}
              selectedAddressId={selectedAddressId}
              onSelectAddress={(addr) => {
                setSelectedAddressId(addr.address_id);
                setDelivery({
                  name: addr.full_name,
                  email: user?.email,
                  phone: addr.phone,
                  address: addr.address_line_1 + (addr.address_line_2 ? ", " + addr.address_line_2 : ""),
                  city: addr.city,
                  state: addr.state,
                  pincode: addr.pincode
                });
                setShowNewAddrForm(false);
              }}
              showNewAddrForm={showNewAddrForm}
              setShowNewAddrForm={setShowNewAddrForm}
            />
          )}
          {step === 2 && (
            <PaymentStep
              method={paymentMethod}
              setMethod={setPaymentMethod}
              onNext={() => setStep(3)}
              onBack={() => setStep(1)}
              showToast={showToast}
            />
          )}
          {step === 3 && (
            <ConfirmStep
              delivery={delivery}
              cartItems={items}
              couponApplied={couponApplied}
              couponAmount={couponAmount}
              onBack={() => setStep(2)}
              onPlace={handlePlace}
              isAdmin={user?.role === 'admin'}
            />
          )}
        </div>

        {/* Order summary column */}
        <div className="order-first lg:order-none">
          <OrderSummary
            cartItems={items}
            couponCode={couponCode}
            setCouponCode={setCouponCode}
            couponApplied={couponApplied}
            setCouponApplied={setCouponApplied}
            couponAmount={couponAmount}
            setCouponAmount={setCouponAmount}
            couponError={couponError}
            setCouponError={setCouponError}
            setAppliedCouponId={setAppliedCouponId}
          />
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;