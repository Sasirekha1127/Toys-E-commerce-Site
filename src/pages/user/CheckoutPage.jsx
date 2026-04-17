import React, { useState, useEffect, useCallback, } from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "../../hooks/useStore";
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

const COUPONS = {
  TRENDY10: { type: "percent", value: 10, label: "10% off" },
  FIRST50: { type: "flat", value: 50, label: "₹50 off" },
  SAVE100: { type: "flat", value: 100, label: "₹100 off (orders above ₹999)" },
};

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
const inputBase =
  "w-full box-border rounded-xl border bg-white px-4 py-3 text-sm text-gray-800 outline-none transition-all duration-200 focus:ring-2";
const inputNormal =
  "border-orange-200 focus:border-orange-400 focus:ring-orange-100 hover:border-orange-300";
const inputError =
  "border-red-400 bg-red-50 focus:border-red-400 focus:ring-red-100";

// ════════════════════════════════════════════════════════════
// TOAST NOTIFICATION
// ════════════════════════════════════════════════════════════
const Toast = ({ message, visible, onClose }) => (
  <div
    className={`fixed top-5 right-5 z-[9999] flex items-start gap-3 rounded-2xl border border-orange-200 bg-white px-5 py-4 shadow-2xl shadow-orange-100 transition-all duration-500 max-w-sm w-[calc(100vw-2.5rem)] sm:w-auto ${visible
      ? "opacity-100 translate-y-0 pointer-events-auto"
      : "opacity-0 -translate-y-4 pointer-events-none"
      }`}
    role="alert"
    aria-live="assertive"
  >
    {/* Icon */}
    <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-orange-100">
      <AlertCircle size={15} className="text-orange-500" />
    </div>

    {/* Message */}
    <div className="flex-1 min-w-0">
      <p className="text-xs font-bold uppercase tracking-widest text-orange-500 mb-0.5">
        Required Field
      </p>
      <p className="text-sm font-semibold text-gray-800 leading-snug">{message}</p>
    </div>

    {/* Close */}
    <button
      onClick={onClose}
      className="mt-0.5 shrink-0 rounded-lg p-1 text-gray-400 transition-colors hover:bg-orange-50 hover:text-orange-500"
      aria-label="Dismiss"
    >
      <X size={14} />
    </button>

    {/* Progress bar */}
    <div className="absolute bottom-0 left-0 right-0 h-1 overflow-hidden rounded-b-2xl">
      <div
        className={`h-full bg-gradient-to-r from-orange-400 to-amber-400 transition-all duration-[3500ms] ease-linear ${visible ? "w-0" : "w-full"
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
    // Clear any existing timer
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

  // Cleanup on unmount
  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  return { toast, showToast, hideToast };
};

// ── Step Indicator ────────────────────────────────────────────
const StepBar = ({ step }) => (
  <div className="bg-white border-b border-orange-100 px-4 py-6">
    <div className="flex items-center justify-center max-w-sm mx-auto">
      {["Delivery", "Payment", "Confirm"].map((s, i) => {
        const current = step === i + 1;
        const done = step > i + 1;
        return (
          <React.Fragment key={s}>
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold transition-all duration-300 ${current
                  ? "bg-orange-500 text-white shadow-lg shadow-orange-200 scale-110"
                  : done
                    ? "bg-green-500 text-white"
                    : "bg-orange-100 text-orange-300"
                  }`}
              >
                {done ? <CheckCircle2 size={16} /> : i + 1}
              </div>
              <span
                className={`text-[11px] font-semibold tracking-wide ${current ? "text-orange-600" : done ? "text-green-600" : "text-gray-400"
                  }`}
              >
                {s}
              </span>
            </div>
            {i < 2 && (
              <div
                className={`mx-2 mb-4 h-0.5 w-14 sm:w-20 rounded-full transition-all duration-500 ${done ? "bg-green-400" : "bg-orange-100"
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
const Section = ({ title, icon, children }) => (
  <div className="rounded-2xl border border-orange-100 bg-white shadow-sm overflow-hidden">
    <div className="flex items-center gap-2.5 bg-gradient-to-r from-orange-50 to-amber-50 border-b border-orange-100 px-5 py-4">
      {icon && <span className="text-orange-500">{icon}</span>}
      <h3 className="text-sm font-bold uppercase tracking-widest text-orange-600">
        {title}
      </h3>
    </div>
    <div className="p-5">{children}</div>
  </div>
);

// ── Field ─────────────────────────────────────────────────────
const Field = ({ label, error, children }) => (
  <div className="mb-4 last:mb-0">
    <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-gray-500">
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
}) => {
  const [open, setOpen] = useState(true);
  const [inputCode, setInputCode] = useState(couponCode);

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.qty, 0
  );
  const savings = cartItems.reduce(
    (sum, item) =>
      sum + ((item.originalPrice ?? item.price) - item.price) * item.qty, 0
  );
  const delivery = subtotal >= 499 ? 0 : 49;
  const gst = subtotal * GST_RATE;

  let couponDisc = 0;
  if (couponApplied && COUPONS[couponApplied]) {
    const c = COUPONS[couponApplied];
    if (c.type === "percent") couponDisc = (subtotal * c.value) / 100;
    if (c.type === "flat") {
      if (couponApplied === "SAVE100" && subtotal < 999) couponDisc = 0;
      else couponDisc = c.value;
    }
  }

  const total = subtotal + delivery + gst - couponDisc;

  const handleApplyCoupon = () => {
    const code = inputCode.trim().toUpperCase();
    if (!code) { setCouponError("Enter a coupon code"); return; }
    if (!COUPONS[code]) { setCouponError("Invalid coupon code"); setCouponApplied(""); return; }
    if (code === "SAVE100" && subtotal < 999) {
      setCouponError("Minimum order ₹999 required for SAVE100"); setCouponApplied(""); return;
    }
    setCouponApplied(code); setCouponCode(code); setCouponError("");
  };

  const handleRemoveCoupon = () => {
    setCouponApplied(""); setCouponCode(""); setInputCode(""); setCouponError("");
  };

  return (
    <div className="sticky top-5 rounded-2xl border border-orange-100 bg-white shadow-md overflow-hidden">
      {/* Header */}
      <button
        className="w-full flex items-center justify-between bg-gradient-to-r from-orange-500 to-amber-500 px-5 py-4 text-white"
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
          <div className="max-h-60 overflow-y-auto border-b border-orange-50 px-4 py-4 space-y-3">
            {cartItems.map((item) => (
              <div key={item.id} className="flex items-center gap-3">
                <div className="relative shrink-0">
                  <img
                    src={item.images?.[0] || item.image}
                    alt={item.name}
                    className="h-14 w-14 rounded-xl border border-orange-100 object-cover bg-orange-50"
                    onError={(e) => { e.target.style.display = "none"; }}
                  />
                  <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-orange-500 text-[10px] font-extrabold text-white shadow">
                    {item.qty}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-gray-800">{item.name}</p>
                  <p className="text-xs capitalize text-gray-400">{item.category}</p>
                </div>
                <span className="shrink-0 text-sm font-bold text-orange-600">
                  ₹{fmt(item.price * item.qty)}
                </span>
              </div>
            ))}
          </div>

          {/* Coupon */}
          <div className="border-b border-orange-50 bg-orange-50/50 px-4 py-4">
            <div className="flex items-center gap-2 mb-2">
              <Gift size={15} className="text-orange-500" />
              <span className="text-xs font-bold uppercase tracking-widest text-orange-600">Promo Code</span>
            </div>
            {couponApplied ? (
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1.5 rounded-lg bg-green-100 px-3 py-1.5 text-xs font-bold text-green-700 border border-green-200">
                  <CheckCircle2 size={13} /> {couponApplied} applied
                </span>
                <button className="text-xs text-red-400 underline hover:text-red-600 transition-colors" onClick={handleRemoveCoupon}>
                  Remove
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  className="flex-1 rounded-xl border border-orange-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all"
                  placeholder="Enter coupon code"
                  value={inputCode}
                  onChange={(e) => { setInputCode(e.target.value.toUpperCase()); setCouponError(""); }}
                />
                <button
                  className="rounded-xl bg-orange-500 px-4 py-2 text-xs font-bold text-white hover:bg-orange-600 transition-colors shadow-sm"
                  onClick={handleApplyCoupon}
                >
                  Apply
                </button>
              </div>
            )}
            {couponError && <p className="mt-1.5 text-xs text-red-500 font-medium">{couponError}</p>}
            <p className="mt-2 text-[11px] text-gray-400 font-medium">Try: TRENDY10 · FIRST50 · SAVE100</p>
          </div>

          {/* Price breakdown */}
          <div className="border-b border-orange-50 px-4 py-4 space-y-2.5">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Subtotal ({cartItems.reduce((n, i) => n + i.qty, 0)} items)</span>
              <span className="font-medium">₹{fmt(subtotal)}</span>
            </div>
            {savings > 0 && (
              <div className="flex justify-between text-sm font-semibold text-green-600">
                <span>Product Discount</span>
                <span>−₹{fmt(savings)}</span>
              </div>
            )}
            {couponDisc > 0 && (
              <div className="flex justify-between text-sm font-semibold text-green-600">
                <span>Coupon ({couponApplied})</span>
                <span>−₹{fmt(couponDisc)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm text-gray-600">
              <span className="flex items-center gap-1"><Truck size={13} /> Delivery</span>
              <span className={delivery === 0 ? "font-bold text-green-600" : "font-medium"}>
                {delivery === 0 ? "FREE" : `₹${delivery}`}
              </span>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>GST (5%)</span>
              <span className="font-medium">+₹{fmt(gst)}</span>
            </div>
            <div className="h-px bg-orange-100 my-1" />
            <div className="flex justify-between text-base font-extrabold text-gray-900">
              <span>Total Payable</span>
              <span className="text-orange-600">₹{fmt(total)}</span>
            </div>
            {savings + couponDisc > 0 && (
              <div className="mt-2 rounded-xl bg-green-50 border border-green-100 px-3 py-2.5 text-center text-xs font-semibold text-green-700">
                🎉 You save ₹{fmt(savings + couponDisc)} on this order!
              </div>
            )}
          </div>

          {/* Trust badges */}
          <div className="grid grid-cols-3 gap-1 px-4 py-3.5 text-[10px] font-semibold text-gray-400">
            <span className="flex flex-col items-center gap-1">
              <ShieldCheck size={15} className="text-orange-400" />
              Secure Pay
            </span>
            <span className="flex flex-col items-center gap-1">
              <Truck size={15} className="text-orange-400" />
              Fast Ship
            </span>
            <span className="flex flex-col items-center gap-1">
              <Lock size={15} className="text-orange-400" />
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

// Ordered list of delivery fields for first-error toast messaging
const DELIVERY_FIELD_ORDER = [
  { key: "name", label: "full name" },
  { key: "email", label: "email address" },
  { key: "phone", label: "mobile number" },
  { key: "door", label: "door / flat number" },
  { key: "street", label: "street / area" },
  { key: "city", label: "city" },
  { key: "state", label: "state" },
  { key: "pincode", label: "pincode" },
];

const DeliveryStep = ({ data, setData, onNext, user, showToast }) => {
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setData((prev) => ({
      ...prev,
      name: prev.name || user?.name || "",
      email: prev.email || user?.email || "",
      phone: prev.phone || user?.phone || "",
    }));
  }, [user, setData]);

  const setField = (key, value) => {
    setData((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const handleNext = () => {
    const fields = ["name", "email", "phone", "door", "street", "city", "state", "pincode"];
    const newErrors = {};
    fields.forEach((field) => {
      const err = validate[field]?.(data[field] || "");
      if (err) newErrors[field] = err;
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      // Find first missing field in display order and show its toast message
      const firstMissing = DELIVERY_FIELD_ORDER.find((f) => newErrors[f.key]);
      if (firstMissing) showToast(newErrors[firstMissing.key]);
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

  return (
    <div className="flex flex-col gap-5">
      <Section title="Contact Information" icon={<User size={16} />}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Full Name *" error={errors.name}>
            {inp("name", { placeholder: "Ramesh Kumar" })}
          </Field>
          <Field label="Email Address *" error={errors.email}>
            {inp("email", { type: "email", placeholder: "you@email.com" })}
          </Field>
        </div>
        <Field label="Mobile Number *" error={errors.phone}>
          {inp("phone", { type: "tel", placeholder: "9876543210", maxLength: 10 })}
        </Field>
      </Section>

      <Section title="Delivery Address" icon={<MapPin size={16} />}>
        <Field label="Door / Flat Number *" error={errors.door}>
          {inp("door", { placeholder: "No. 12, 3rd Floor" })}
        </Field>
        <Field label="Street / Area / Landmark *" error={errors.street}>
          {inp("street", { placeholder: "Anna Nagar, Near Park" })}
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
      </Section>

      {/* Free delivery badge */}
      <div className="flex items-center gap-3 rounded-2xl bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-100 px-5 py-3.5">
        <Truck size={18} className="text-orange-500 shrink-0" />
        <p className="text-sm text-gray-700 font-medium">
          <span className="font-bold text-orange-600">Free delivery</span> on orders above ₹499!
          Orders below ₹499 attract a ₹49 delivery fee.
        </p>
      </div>

      <button
        className="w-full rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 px-4 py-4 text-sm font-bold tracking-wider text-white shadow-lg shadow-orange-200 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-orange-200 active:translate-y-0"
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
const PaymentStep = ({ onNext, onBack, showToast }) => {
  const [method, setMethod] = useState("card");
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
      // Show the first error as a toast
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
        ? "border-orange-400 bg-orange-50 text-orange-600 shadow-md shadow-orange-100 scale-105"
        : "border-gray-200 bg-gray-50 text-gray-600 hover:border-orange-300 hover:bg-orange-50 hover:text-orange-500"
        }`}
      onClick={() => { setMethod(id); setErrors({}); setSelectedOption(""); }}
    >
      <span className={method === id ? "text-orange-500" : "text-gray-400"}>{icon}</span>
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
          {/* Card visual */}
          <div className="mb-5 rounded-2xl bg-gradient-to-br from-orange-500 via-amber-500 to-orange-700 p-5 shadow-xl shadow-orange-200 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-white/10 -translate-y-10 translate-x-10" />
            <div className="absolute bottom-0 left-0 w-28 h-28 rounded-full bg-white/10 translate-y-8 -translate-x-8" />
            <div className="relative">
              <div className="mb-5 h-7 w-10 rounded-md bg-gradient-to-br from-yellow-200 to-yellow-400 shadow" />
              <p className="mb-4 font-mono text-lg tracking-[0.2em] text-white/90 drop-shadow">
                {card.number || "•••• •••• •••• ••••"}
              </p>
              <div className="flex justify-between text-[11px] tracking-[0.15em] text-white/70 font-medium">
                <span>{card.name || "CARDHOLDER NAME"}</span>
                <span>{card.expiry || "MM/YY"}</span>
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
                className="rounded-xl border border-orange-200 bg-orange-50 px-4 py-2 text-sm font-bold text-orange-600 transition-all hover:bg-orange-100 hover:border-orange-400"
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
                  ? "border-orange-400 bg-orange-50 text-orange-700 shadow-sm"
                  : "border-gray-200 bg-gray-50 text-gray-700 hover:border-orange-300 hover:bg-orange-50"
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
                  ? "border-orange-400 bg-orange-50 text-orange-700 shadow-sm"
                  : "border-gray-200 bg-gray-50 text-gray-700 hover:border-orange-300 hover:bg-orange-50"
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
          <div className="rounded-2xl border border-dashed border-orange-200 bg-orange-50/60 p-4 text-sm leading-7 text-gray-700">
            <p>💰 Pay in cash when your order arrives at your doorstep.</p>
            <p className="text-orange-600 font-medium">Note: COD available for orders up to ₹5,000.</p>
          </div>
        </Section>
      )}

      <div className="flex items-center gap-3">
        <button
          className="rounded-2xl border border-orange-200 bg-white px-5 py-3.5 text-sm font-bold text-orange-600 transition-all hover:bg-orange-50 hover:border-orange-400"
          onClick={onBack}
        >
          ← Back
        </button>
        <button
          className="flex-1 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 px-4 py-4 text-sm font-bold tracking-wider text-white shadow-lg shadow-orange-200 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-orange-200 active:translate-y-0"
          onClick={handleNext}
        >
          Review Order →
        </button>
      </div>
    </div>
  );
};

// ════════════════════════════════════════════════════════════
// STEP 3 — CONFIRM
// ════════════════════════════════════════════════════════════
const ConfirmStep = ({ delivery, cartItems, couponApplied, onBack, onPlace }) => {
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.qty, 0);
  const savings = cartItems.reduce(
    (sum, item) =>
      sum + ((item.originalPrice ?? item.price) - item.price) * item.qty, 0
  );
  const deliveryFee = subtotal >= 499 ? 0 : 49;
  const gst = subtotal * GST_RATE;

  let couponDisc = 0;
  if (couponApplied && COUPONS[couponApplied]) {
    const c = COUPONS[couponApplied];
    if (c.type === "percent") couponDisc = (subtotal * c.value) / 100;
    else couponDisc = c.value;
  }

  const total = subtotal + deliveryFee + gst - couponDisc;

  return (
    <div className="flex flex-col gap-5">
      <Section title="Delivery Address" icon={<MapPin size={16} />}>
        <div className="rounded-2xl border border-orange-100 bg-orange-50/60 p-4 text-sm leading-7 text-gray-800">
          <p className="text-base font-bold text-gray-900">{delivery.name}</p>
          <p className="text-gray-600">{delivery.door}, {delivery.street}</p>
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
          {cartItems.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between py-2.5 border-b border-orange-50 last:border-b-0"
            >
              <div className="flex items-center gap-3">
                <img
                  src={item.images?.[0] || item.image}
                  alt={item.name}
                  className="h-10 w-10 rounded-xl object-cover border border-orange-100 bg-orange-50"
                  onError={(e) => { e.target.style.display = "none"; }}
                />
                <span className="text-sm text-gray-800 font-medium">
                  {item.name} <span className="text-gray-400">× {item.qty}</span>
                </span>
              </div>
              <span className="text-sm font-bold text-orange-600">₹{fmt(item.price * item.qty)}</span>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Price Breakdown" icon={<Tag size={16} />}>
        <div className="space-y-2.5">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Subtotal</span>
            <span className="font-medium">₹{fmt(subtotal)}</span>
          </div>
          {savings > 0 && (
            <div className="flex justify-between text-sm font-semibold text-green-600">
              <span>Product Discount</span>
              <span>−₹{fmt(savings)}</span>
            </div>
          )}
          {couponDisc > 0 && (
            <div className="flex justify-between text-sm font-semibold text-green-600">
              <span>Coupon ({couponApplied})</span>
              <span>−₹{fmt(couponDisc)}</span>
            </div>
          )}
          <div className="flex justify-between text-sm text-gray-600">
            <span>Delivery</span>
            <span className={deliveryFee === 0 ? "font-bold text-green-600" : "font-medium"}>
              {deliveryFee === 0 ? "FREE" : `₹${deliveryFee}`}
            </span>
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <span>GST (5%)</span>
            <span className="font-medium">+₹{fmt(gst)}</span>
          </div>
          <div className="h-px bg-orange-100" />
          <div className="flex justify-between text-base font-extrabold text-gray-900">
            <span>Total Payable</span>
            <span className="text-orange-600">₹{fmt(total)}</span>
          </div>
        </div>
      </Section>

      <div className="flex items-center gap-3">
        <button
          className="rounded-2xl border border-orange-200 bg-white px-5 py-3.5 text-sm font-bold text-orange-600 transition-all hover:bg-orange-50 hover:border-orange-400"
          onClick={onBack}
        >
          ← Back
        </button>
        <button
          className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 px-4 py-4 text-sm font-bold tracking-wider text-white shadow-lg shadow-green-200 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-green-200 active:translate-y-0"
          onClick={onPlace}
        >
          <Lock size={16} /> Place Order · ₹{fmt(total)}
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
      <div className="w-full max-w-md rounded-3xl border border-orange-100 bg-white px-8 py-12 text-center shadow-xl">
        <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-orange-100 to-amber-100 text-5xl shadow-inner">
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
          Thank you, <strong className="text-orange-600">{name}</strong>! Your order is confirmed and on its way.
        </p>
        <div className="mx-auto mb-5 inline-flex items-center gap-2 rounded-2xl border border-orange-200 bg-orange-50 px-5 py-3 text-sm">
          <Package size={16} className="text-orange-500" />
          <span className="text-gray-600">Order ID:</span>
          <strong className="text-orange-700">{orderId}</strong>
        </div>
        <p className="mb-7 text-xs text-gray-400">
          A confirmation email has been sent to your inbox.
        </p>
        <button
          className="w-full rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 px-5 py-4 text-sm font-bold tracking-wider text-white shadow-lg shadow-orange-200 transition-all hover:-translate-y-0.5 hover:shadow-xl"
          onClick={() => navigate("/")}
        >
          Continue Shopping 🛍️
        </button>
      </div>
    </div>
  );
};

// ════════════════════════════════════════════════════════════
// MAIN CHECKOUT PAGE
// ════════════════════════════════════════════════════════════
const CheckoutPage = () => {
  const { cart: items = [], clearCart, addOrder } = useStore();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [delivery, setDelivery] = useState({});
  const [couponCode, setCouponCode] = useState("");
  const [couponApplied, setCouponApplied] = useState("");
  const [couponError, setCouponError] = useState("");
  const [orderId, setOrderId] = useState("");
  const [placed, setPlaced] = useState(false);

  const { toast, showToast, hideToast } = useToast();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const raw = localStorage.getItem("toyCurrentUser");
    if (!raw && !placed) {
      navigate("/auth");
      return;
    }
    if (raw) {
      const parsed = JSON.parse(raw);
      setUser(parsed);
      
      // Fetch latest from DB to pre-fill
      fetch(`http://localhost:5000/api/user/profile/${parsed.id}`)
        .then(res => res.json())
        .then(data => {
          if (data.user) {
            setUser(prev => ({ ...prev, ...data.user }));
          }
        })
        .catch(err => console.error("Checkout profile fetch error:", err));
    }
  }, [navigate, placed]);

  useEffect(() => {
    if (items.length === 0 && !placed) navigate("/cart");
  }, [items, placed, navigate]);

  const handlePlace = async () => {
    const display_id = "ORD-" + Date.now().toString().slice(-8);
    const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);
    const deliveryFee = subtotal >= 499 ? 0 : 49;
    const gst = subtotal * GST_RATE;
    let couponDisc = 0;
    if (couponApplied && COUPONS[couponApplied]) {
      const c = COUPONS[couponApplied];
      couponDisc = c.type === "percent" ? subtotal * (c.value / 100) : c.value;
    }
    const total = subtotal + deliveryFee + gst - couponDisc;

    const orderData = {
      user_id: user?.id || null,
      customer_id: user?.id || null,
      order_id: display_id,
      items: items,
      subtotal: subtotal,
      discount_amount: couponDisc,
      tax_amount: gst,
      shipping_charge: deliveryFee,
      total_amount: total,
      shipping_address: `${delivery.door}, ${delivery.street}, ${delivery.city}, ${delivery.state} - ${delivery.pincode}`,
      coupon_code: couponApplied || "",
      payment_method: paymentMethod || "Card" // Assuming paymentMethod state exists or default to Card
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

      sendOrderEmail(delivery, items, { subtotal, delivery: deliveryFee, gst, total }, display_id);
      setOrderId(display_id);

      addOrder({
        id: display_id,
        items,
        total,
        date: new Date().toISOString(),
        status: 'Confirmed'
      });

      clearCart();
      setPlaced(true);
    } catch (err) {
      console.error("Order placement error:", err);
      showToast("Error placing order. Please try again.");
    }
  };

  if (placed) {
    return (
      <div className="min-h-screen bg-orange-50/30">
        <OrderSuccess orderId={orderId} name={delivery.name || "Customer"} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-orange-50/30 pb-16 text-gray-900">

      {/* ── Toast (rendered once at the top level, always on top) ── */}
      <Toast message={toast.message} visible={toast.visible} onClose={hideToast} />

      {/* Top bar */}
      <div className="bg-gradient-to-r from-orange-600 to-amber-500 px-4 py-3 sm:px-8">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="flex items-center gap-2.5 text-white">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/20 text-lg">
              🧸
            </div>
            <span className="text-sm font-bold tracking-wide">ToyStore — Secure Checkout</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-white/80 font-medium">
            <Lock size={13} /> SSL Secured
          </div>
        </div>
      </div>

      {/* Step bar */}
      <StepBar step={step} />

      {/* Page title */}
      <div className="border-b border-orange-100 bg-white px-4 py-4">
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
            <DeliveryStep
              user={user}
              data={delivery}
              setData={setDelivery}
              onNext={() => setStep(2)}
              showToast={showToast}
            />
          {step === 2 && (
            <PaymentStep
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
              onBack={() => setStep(2)}
              onPlace={handlePlace}
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
            couponError={couponError}
            setCouponError={setCouponError}
          />
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;