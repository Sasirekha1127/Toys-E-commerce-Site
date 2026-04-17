import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  User, Mail, Phone, MapPin, ShoppingBag,
  Heart, ChevronRight, LogOut, Pencil, Save,
  X, ShieldCheck, Package, Star, ArrowLeft,
  Camera
} from "lucide-react";
import { useStore } from "../../hooks/useStore";

function initials(name = "") {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3 py-4 border-b border-orange-100 last:border-0">
      <div className="w-9 h-9 rounded-xl bg-orange-100 flex items-center justify-center flex-none mt-0.5">
        <Icon size={16} className="text-orange-500" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-semibold text-orange-400 uppercase tracking-wider mb-0.5">
          {label}
        </p>
        <p className="text-sm font-semibold text-gray-800 break-words">
          {value || <span className="text-gray-400 font-normal italic">Not added yet</span>}
        </p>
      </div>
    </div>
  );
}

function QuickCard({ icon: Icon, title, sub, onClick, badge }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-4 px-2 py-4 border-b border-orange-100 last:border-b-0 group text-left transition-all duration-200"
    >
      <div className="w-11 h-11 rounded-2xl bg-orange-100 flex items-center justify-center flex-none group-hover:bg-orange-500 transition-colors duration-200">
        <Icon size={20} className="text-orange-500 group-hover:text-white transition-colors duration-200" />
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-bold text-gray-800 text-sm group-hover:text-orange-600 transition-colors">
          {title}
        </p>
        <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
      </div>

      {badge !== undefined && (
        <span className="flex-none min-w-[24px] h-6 px-1.5 bg-orange-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
          {badge}
        </span>
      )}

      <ChevronRight size={16} className="flex-none text-gray-300 group-hover:text-orange-400 transition-colors" />
    </button>
  );
}

function EditModal({ user, onSave, onClose }) {
  const [form, setForm] = useState(() => ({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    address: user?.address || "",
    profileImage: user?.profileImage || "",
  }));
  const [errors, setErrors] = useState({});

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      updateField("profileImage", reader.result);
    };
    reader.readAsDataURL(file);
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.email.trim()) e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Enter a valid email";

    const cleanPhone = form.phone.replace(/\s/g, "");
    if (form.phone && !/^[6-9]\d{9}$/.test(cleanPhone)) {
      e.phone = "Enter a valid 10-digit mobile number";
    }

    return e;
  };

  const handleSave = () => {
    const e = validate();
    if (Object.keys(e).length > 0) {
      setErrors(e);
      return;
    }
    onSave({
      ...form,
    });
  };

  const Field = ({ label, error, children }) => (
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide">
        {label}
      </label>
      {children}
      {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
    </div>
  );

  const inputCls = (err) =>
    `w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all ${err
      ? "border-red-300 bg-red-50"
      : "border-orange-200 bg-orange-50/40 hover:border-orange-300"
    }`;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
  <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white shadow-2xl border border-orange-100">
    <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-5 border-b border-orange-100 bg-gradient-to-r from-orange-500 to-amber-500 rounded-t-3xl">
      <div className="flex items-center gap-2">
        <Pencil size={18} className="text-white" />
        <h3
          className="text-lg font-bold text-white"
          style={{ fontFamily: "'Fredoka One', cursive" }}
        >
          Edit Profile
        </h3>
      </div>

      <button
        type="button"
        onClick={onClose}
        className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition-colors"
      >
        <X size={18} />
      </button>
    </div>

    <div className="p-6 md:p-8 space-y-5">
      <Field label="Profile Image">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="w-24 h-24 rounded-3xl overflow-hidden border-2 border-orange-200 bg-orange-50 flex items-center justify-center shrink-0">
            {form.profileImage ? (
              <img
                src={form.profileImage}
                alt="Profile Preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <User size={30} className="text-orange-300" />
            )}
          </div>

          <label className="cursor-pointer inline-flex w-fit items-center gap-2 px-5 py-3 rounded-2xl bg-orange-100 hover:bg-orange-200 text-orange-600 font-bold text-sm md:text-base transition-colors">
            <Camera size={18} />
            Upload Image
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </label>
        </div>
      </Field>

      <Field label="Full Name" error={errors.name}>
        <input
          type="text"
          className={inputCls(errors.name)}
          value={form.name}
          onChange={(e) => updateField("name", e.target.value)}
          placeholder="Your full name"
          autoComplete="name"
        />
      </Field>

      <Field label="Email Address" error={errors.email}>
        <input
          type="email"
          className={inputCls(errors.email)}
          value={form.email}
          onChange={(e) => updateField("email", e.target.value)}
          placeholder="your@email.com"
          autoComplete="email"
        />
      </Field>

      <Field label="Mobile Number" error={errors.phone}>
        <input
          type="tel"
          className={inputCls(errors.phone)}
          value={form.phone}
          onChange={(e) =>
            updateField("phone", e.target.value.replace(/\D/g, "").slice(0, 10))
          }
          placeholder="9876543210"
          autoComplete="tel"
          maxLength={10}
        />
      </Field>

      <Field label="Delivery Address" error={errors.address}>
        <textarea
          className={`${inputCls(errors.address)} resize-none min-h-[120px]`}
          rows={4}
          value={form.address}
          onChange={(e) => updateField("address", e.target.value)}
          placeholder="Street, City, State, Pincode"
        />
      </Field>
    </div>

    <div className="sticky bottom-0 bg-white px-6 md:px-8 pb-6 pt-2 border-t border-orange-100">
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 py-3 rounded-2xl border border-orange-200 text-orange-600 font-bold text-sm md:text-base hover:bg-orange-50 transition-colors"
        >
          Cancel
        </button>

        <button
          type="button"
          onClick={handleSave}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold text-sm md:text-base hover:from-orange-600 hover:to-amber-600 transition-all shadow-toy hover:shadow-toy-hover"
        >
          <Save size={18} />
          Save Changes
        </button>
      </div>
    </div>
  </div>
</div>
  );
}

function OrdersPage({ orders, onBack, navigate }) {
  return (
    <div className="min-h-screen bg-orange-50">
      <div className="bg-gradient-to-br from-orange-500 via-orange-500 to-amber-400 pt-6 pb-10 px-4 sm:px-6 relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-48 h-48 bg-white/10 rounded-full" />
        <div className="absolute top-10 -left-8 w-32 h-32 bg-white/10 rounded-full" />
        <div className="absolute -bottom-6 right-20 w-24 h-24 bg-white/10 rounded-full" />

        <div className="max-w-6xl mx-auto relative z-10">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-white/80 hover:text-white text-sm font-semibold mb-6 group transition-colors"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
            Back to Profile
          </button>

          <div className="flex items-center gap-3 mt-10">
            <div className="w-14 h-14 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center">
              <Package size={26} className="text-white" />
            </div>
            <div>
              <h1
                className="text-white font-black text-2xl sm:text-3xl"
                style={{ fontFamily: "'Fredoka One', cursive" }}
              >
                My Orders
              </h1>
              <p className="text-orange-100 text-sm">
                Track, review and manage your orders
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 pb-12">
        {orders.length === 0 ? (
          <div className="bg-white border border-orange-100 rounded-[28px] p-10 text-center">
            <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShoppingBag size={32} className="text-orange-200" />
            </div>
            <h4 className="text-lg font-bold text-gray-800">No orders yet!</h4>
            <p className="text-sm text-gray-500">Your shopping journey starts here.</p>
            <button
              onClick={() => navigate("/")}
              className="mt-6 px-6 py-2.5 rounded-2xl bg-orange-500 text-white font-bold text-sm hover:bg-orange-600 transition-colors"
            >
              Go Shopping
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white border border-orange-100 rounded-[28px] p-5 sm:p-6"
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-5">
                  <div>
                    <p className="text-xs font-bold text-orange-400 uppercase tracking-widest">
                      Order ID
                    </p>
                    <p className="text-base font-black text-gray-800 break-all">
                      {order.id}
                    </p>
                  </div>

                  <div className="lg:text-right">
                    <p className="text-xs font-bold text-orange-400 uppercase tracking-widest">
                      Order Date
                    </p>
                    <p className="text-sm font-semibold text-gray-700">
                      {new Date(order.date).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 flex-wrap">
                    <span
                      className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${order.status === "Confirmed"
                          ? "bg-green-100 text-green-600"
                          : "bg-orange-100 text-orange-600"
                        }`}
                    >
                      {order.status}
                    </span>
                    <p className="text-base font-black text-orange-600">
                      ₹{order.total.toLocaleString("en-IN")}
                    </p>
                  </div>
                </div>

                <div className="border-t border-orange-100 pt-4">
                  <div className="rounded-2xl bg-orange-50/50 border border-orange-100 p-4 sm:p-5">
                    <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
                      <h3 className="text-sm font-black text-gray-800 uppercase tracking-wide">
                        Order Details
                      </h3>
                      <button
                        onClick={() => window.print()}
                        className="px-4 py-2 rounded-2xl bg-orange-500 text-white font-bold text-sm hover:bg-orange-600 transition-colors"
                      >
                        Print Invoice
                      </button>
                    </div>

                    <div className="space-y-4">
                      {order.items.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-3 sm:gap-4 bg-white border border-orange-100 rounded-2xl p-3"
                        >
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-16 h-16 rounded-xl object-cover bg-orange-50 flex-none"
                          />

                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-gray-800 truncate">
                              {item.name}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              Qty: {item.qty} × ₹{item.price}
                            </p>
                            {item.description && (
                              <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                                {item.description}
                              </p>
                            )}
                          </div>

                          <div className="text-right flex-none">
                            <p className="text-sm font-black text-gray-800">
                              ₹{(item.qty * item.price).toLocaleString("en-IN")}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-5 pt-4 border-t border-orange-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="text-sm text-gray-600">
                        <span className="font-semibold text-gray-800">Payment Status:</span>{" "}
                        <span className="text-green-600 font-bold">Paid</span>
                      </div>
                      <div className="text-lg font-black text-orange-600">
                        Total: ₹{order.total.toLocaleString("en-IN")}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function UserProfile() {
  const navigate = useNavigate();
  const { wishlist, cartCount, orders } = useStore();

  const [user, setUser] = useState(null);
  const [showEdit, setShowEdit] = useState(false

    
  );
  const [showOrdersPage, setShowOrdersPage] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem("toyCurrentUser");
    if (!raw) {
      navigate("/auth");
      return;
    }

    const parsed = JSON.parse(raw);

    const fetchProfile = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/user/profile/${parsed.id}`);
        const data = await res.json();

        if (res.ok) {
          const fullUser = { ...parsed, ...data.user };
          setUser(fullUser);
          localStorage.setItem("toyCurrentUser", JSON.stringify(fullUser));
        } else {
          setUser(parsed);
        }
      } catch (err) {
        console.error("Failed to fetch profile:", err);
        setUser(parsed);
      }
    };

    fetchProfile();
  }, [navigate]);

  const handleSave = async (form) => {
    try {
      const payload = {
        name: form.name,
        email: form.email,
        phone: form.phone,
        address: form.address,
        profileImage: form.profileImage,
      };

      let updated = null;

      try {
        const res = await fetch(`http://localhost:5000/api/user/profile/${user.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const data = await res.json();

        if (res.ok) {
          updated = { ...user, ...data.user, profileImage: form.profileImage };
        } else {
          updated = { ...user, ...payload };
        }
      } catch {
        updated = { ...user, ...payload };
      }

      localStorage.setItem("toyCurrentUser", JSON.stringify(updated));
      setUser(updated);
      setShowEdit(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      console.error("Save profile error:", err);
      alert("An error occurred while saving profile");
    }
  };

  const confirmLogout = () => {
    localStorage.removeItem("toyCurrentUser");
    setShowLogoutConfirm(false);
    navigate("/");
  };

  if (!user) return null;

  const userInitials = initials(user.name || user.email || "U");
  const joinDate = (() => {
    try {
      return new Date().toLocaleDateString("en-IN", { month: "long", year: "numeric" });
    } catch {
      return "";
    }
  })();

  if (showOrdersPage) {
    return (
      <>
        <OrdersPage
          orders={orders}
          onBack={() => setShowOrdersPage(false)}
          navigate={navigate}
        />

        {showLogoutConfirm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
              <div className="bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-5 text-center">
                <h3
                  className="text-white text-lg font-black"
                  style={{ fontFamily: "'Fredoka One', cursive" }}
                >
                  Confirm Logout
                </h3>
              </div>

              <div className="p-6 text-center">
                <p className="text-sm text-gray-600 font-semibold">
                  Are you sure you want to sign out?
                </p>
              </div>

              <div className="flex gap-3 px-6 pb-6">
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="flex-1 py-2.5 rounded-2xl border border-orange-200 text-orange-600 font-bold text-sm hover:bg-orange-50 transition-colors"
                >
                  Cancel
                </button>

                <button
                  onClick={confirmLogout}
                  className="flex-1 py-2.5 rounded-2xl bg-red-500 text-white font-bold text-sm hover:bg-red-600 transition-colors"
                >
                  Yes, Logout
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <div className="min-h-screen bg-orange-50 page-enter">
      <div className="bg-gradient-to-br from-orange-500 via-orange-500 to-amber-400 pt-6 pb-14 px-4 sm:px-6 relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-48 h-48 bg-white/10 rounded-full" />
        <div className="absolute top-10 -left-8 w-32 h-32 bg-white/10 rounded-full" />
        <div className="absolute -bottom-6 right-20 w-24 h-24 bg-white/10 rounded-full" />

        <div className="max-w-7xl mx-auto relative z-10">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-white/80 hover:text-white text-sm font-semibold mb-6 group transition-colors"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
            Back
          </button>

          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5">
            <div className="relative flex-none">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-white/20 backdrop-blur border-4 border-white/40 flex items-center justify-center shadow-xl overflow-hidden">
                {user.profileImage ? (
                  <img
                    src={user.profileImage}
                    alt={user.name || "User"}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span
                    className="text-white font-black text-4xl sm:text-5xl"
                    style={{ fontFamily: "'Fredoka One', cursive" }}
                  >
                    {userInitials}
                  </span>
                )}
              </div>

              {/* <button
                onClick={() => setShowEdit(true)}
                className="absolute -bottom-2 -right-2 w-8 h-8 bg-white rounded-xl flex items-center justify-center shadow-toy hover:bg-orange-50 transition-colors"
              >
                <Pencil size={13} className="text-orange-500" />
              </button> */}
            </div>

            <div className="text-center sm:text-left pb-1 mt-10">
              <h1
                className="text-white font-black text-2xl sm:text-3xl leading-none"
                style={{ fontFamily: "'Fredoka One', cursive" }}
              >
                {user.name || "My Account"}
              </h1>
              <p className="text-orange-100 text-sm mt-1 break-all sm:break-normal">
                {user.email}
              </p>

              <div className="flex items-center justify-center sm:justify-start gap-2 mt-2 flex-wrap">
                <span className="flex items-center gap-1 bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full border border-white/30">
                  <ShieldCheck size={11} /> Verified Member
                </span>
                <span className="text-white/70 text-xs">Member since {joinDate}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 pb-12 relative z-10">
        {saved && (
          <div className="fixed bottom-6 right-6 z-50 toast flex items-center gap-2 bg-orange-500 text-white text-sm font-semibold px-5 py-3 rounded-2xl shadow-xl">
            <ShieldCheck size={16} /> Profile saved!
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 xl:gap-10 items-start">
          <div className="lg:col-span-7">
            <div className="bg-white/75 backdrop-blur-sm border border-orange-100 rounded-[28px] overflow-hidden">
              <div className="grid grid-cols-3 border-b border-orange-100">
                {[
                  { label: "Cart Items", value: cartCount, icon: ShoppingBag },
                  { label: "Wishlist", value: wishlist.length, icon: Heart },
                  { label: "Orders", value: orders.length, icon: Package },
                ].map(({ label, value, icon: Icon }) => (
                  <div
                    key={label}
                    className="flex flex-col items-center justify-center py-5 gap-1 border-r border-orange-100 last:border-r-0"
                  >
                    <Icon size={18} className="text-orange-400" />
                    <p
                      className="text-2xl font-black text-gray-800"
                      style={{ fontFamily: "'Fredoka One', cursive" }}
                    >
                      {value}
                    </p>
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide text-center px-2">
                      {label}
                    </p>
                  </div>
                ))}
              </div>

              <div className="px-5 sm:px-7 py-6">
                <div className="flex items-center justify-between gap-3 pb-4 border-b border-orange-100">
                  <div className="flex items-center gap-2 min-w-0">
                    <User size={16} className="text-orange-500 flex-none" />
                    <h2
                      className="font-bold text-gray-800"
                      style={{ fontFamily: "'Fredoka One', cursive" }}
                    >
                      Profile Details
                    </h2>
                  </div>

                  {/* <button
                    onClick={() => setShowEdit(true)}
                    className="flex items-center gap-1.5 text-xs font-bold text-orange-500 hover:text-orange-600 bg-orange-50 hover:bg-orange-100 px-3 py-1.5 rounded-xl transition-all"
                  >
                    <Pencil size={12} /> Edit
                  </button> */}
                </div>

                <div className="pt-2">
                  <InfoRow icon={User} label="Full Name" value={user.name} />
                  <InfoRow icon={Mail} label="Email Address" value={user.email} />
                  <InfoRow icon={Phone} label="Mobile Number" value={user.phone} />
                  <InfoRow icon={MapPin} label="Delivery Address" value={user.address} />
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-24">
              <div className="pb-3 px-1">
                <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider">
                  Account Details
                </h2>
              </div>

              <div>
                <QuickCard
                  icon={ShoppingBag}
                  title="My Orders"
                  sub="Track, return or buy again"
                  badge={orders.length > 0 ? orders.length : undefined}
                  onClick={() => setShowOrdersPage(true)}
                />
                <QuickCard
                  icon={Heart}
                  title="My Wishlist"
                  sub="Your saved items"
                  badge={wishlist.length}
                  onClick={() => navigate("/wishlist")}
                />
                <QuickCard
                  icon={ShoppingBag}
                  title="My Cart"
                  sub="View and manage your shopping cart"
                  badge={cartCount || undefined}
                  onClick={() => navigate("/cart")}
                />
                <QuickCard
                  icon={MapPin}
                  title="Addresses"
                  sub="Manage your delivery addresses"
                  onClick={() => setShowEdit(true)}
                />
                <QuickCard
                  icon={Star}
                  title="Profile Details"
                  sub="Edit your personal information"
                  onClick={() => setShowEdit(true)}
                />
              </div>

              <button
                onClick={() => setShowLogoutConfirm(true)}
                className="w-full mt-5 flex items-center justify-center gap-2 py-3.5 rounded-2xl border-2 border-orange-200 text-orange-500 font-bold text-sm hover:bg-orange-50 hover:border-orange-300 transition-all duration-200 group"
              >
                <LogOut size={16} className="group-hover:-translate-x-0.5 transition-transform" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>

      {showEdit && user && (
        <EditModal
          key={user.id || user.email}
          user={user}
          onSave={handleSave}
          onClose={() => setShowEdit(false)}
        />
      )}

      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-5 text-center">
              <h3
                className="text-white text-lg font-black"
                style={{ fontFamily: "'Fredoka One', cursive" }}
              >
                Confirm Logout
              </h3>
            </div>

            <div className="p-6 text-center">
              <p className="text-sm text-gray-600 font-semibold">
                Are you sure you want to sign out?
              </p>
            </div>

            <div className="flex gap-3 px-6 pb-6">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-2.5 rounded-2xl border border-orange-200 text-orange-600 font-bold text-sm hover:bg-orange-50 transition-colors"
              >
                Cancel
              </button>

              <button
                onClick={confirmLogout}
                className="flex-1 py-2.5 rounded-2xl bg-orange-500 text-white font-bold text-sm hover:bg-orange-600 transition-colors"
              >
                Yes, Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}