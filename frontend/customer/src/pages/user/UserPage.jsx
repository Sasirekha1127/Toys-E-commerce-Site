import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  User, Mail, Phone, MapPin, ShoppingBag,
  Heart, ChevronRight, LogOut, Pencil, Save,
  X, ShieldCheck, Package, Star, ArrowLeft,
  Camera, Plus, Trash2, Home, Briefcase, CheckCircle2, LayoutDashboard
} from "lucide-react";
import { useStore } from "../../hooks/useStore";

const API = "http://localhost:5000";

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
    address1: user?.address1 || "",
    address2: user?.address2 || "",
    profileImage: user?.profile_pic || user?.profileImage || "",
    gender: user?.gender || "",
    dob: user?.birthdate ? new Date(user.birthdate).toISOString().split('T')[0] : "",
    city: user?.city || "",
    state: user?.state || "",
    pincode: user?.pincode || "",
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

          <Field label="Address Line 1" error={errors.address1}>
            <input
              type="text"
              className={inputCls(errors.address1)}
              value={form.address1}
              onChange={(e) => updateField("address1", e.target.value)}
              placeholder="Flat, House no., Building, Apartment"
            />
          </Field>

          <Field label="Address Line 2" error={errors.address2}>
            <input
              type="text"
              className={inputCls(errors.address2)}
              value={form.address2}
              onChange={(e) => updateField("address2", e.target.value)}
              placeholder="Area, Street, Sector, Village"
            />
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="City" error={errors.city}>
              <input
                type="text"
                className={inputCls(errors.city)}
                value={form.city}
                onChange={(e) => updateField("city", e.target.value)}
                placeholder="City"
              />
            </Field>
            <Field label="State" error={errors.state}>
              <input
                type="text"
                className={inputCls(errors.state)}
                value={form.state}
                onChange={(e) => updateField("state", e.target.value)}
                placeholder="State"
              />
            </Field>
          </div>

          <Field label="Pincode" error={errors.pincode}>
            <input
              type="text"
              className={inputCls(errors.pincode)}
              value={form.pincode}
              onChange={(e) => updateField("pincode", e.target.value)}
              placeholder="Pincode"
            />
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Gender" error={errors.gender}>
              <select
                className={inputCls(errors.gender)}
                value={form.gender}
                onChange={(e) => updateField("gender", e.target.value)}
              >
                <option value="">Select gender</option>
                <option value="Female">Female</option>
                <option value="Male">Male</option>
                <option value="Other">Other</option>
              </select>
            </Field>

            <Field label="Date of Birth" error={errors.dob}>
              <input
                type="date"
                className={inputCls(errors.dob)}
                value={form.dob}
                onChange={(e) => updateField("dob", e.target.value)}
              />
            </Field>
          </div>
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
  const { wishlist, cartCount, orders, logout } = useStore();

  const [user, setUser] = useState(null);
  const [showEdit, setShowEdit] = useState(false);
  const [showAddressMgr, setShowAddressMgr] = useState(false);
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
        const customerId = parsed.customer_id || parsed.id;
        const res = await fetch(`http://localhost:5000/api/user/profile/${customerId}`);
        const data = await res.json();

        if (res.ok) {
          const fullUser = { ...parsed, ...data.user, profileImage: data.user.profile_pic };
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
        address1: form.address1,
        address2: form.address2,
        city: form.city,
        state: form.state,
        pincode: form.pincode,
        country: form.country || user.country,
        profile_pic: form.profileImage, // Harmonized with backend profile_pic
        gender: form.gender,
        birthdate: form.dob,
      };

      const res = await fetch(`http://localhost:5000/api/user/profile/${user.customer_id || user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        // Enforce consistent property names and ensure all fields are synchronized
        const updated = { 
          ...user, 
          ...data.user, 
          profileImage: data.user.profile_pic || form.profileImage 
        };
        localStorage.setItem("toyCurrentUser", JSON.stringify(updated));
        setUser(updated);
        setShowEdit(false);
        setSaved(true);
        // Trigger storage event to refresh Header immediately
        window.dispatchEvent(new Event("storage"));
        setTimeout(() => setSaved(false), 2500);
      } else {
        alert(data.error || "Failed to save profile");
      }
    } catch (err) {
      console.error("Save profile error:", err);
      alert("An error occurred while saving profile");
    }
  };

  const confirmLogout = () => {
    logout();
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
                {(user.profile_pic || user.profileImage) ? (
                  <img
                    src={user.profile_pic || user.profileImage}
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

        {/* Stats Row: Now full width below banner */}
        <div className="bg-white/75 backdrop-blur-sm border border-orange-100 rounded-[28px] overflow-hidden shadow-sm mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-3">
            {[
              { label: "Cart Items", value: cartCount, icon: ShoppingBag },
              { label: "Wishlist", value: wishlist.length, icon: Heart },
              { label: "Orders", value: orders.length, icon: Package },
            ].map(({ label, value, icon: Icon }) => (
              <div
                key={label}
                className="flex flex-col items-center justify-center py-6 gap-1 border-b sm:border-b-0 sm:border-r border-orange-100 last:border-0"
              >
                <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center mb-1">
                  <Icon size={18} className="text-orange-500" />
                </div>
                <p
                  className="text-2xl font-black text-gray-800"
                  style={{ fontFamily: "'Fredoka One', cursive" }}
                >
                  {value}
                </p>
                <p className="text-[10px] font-bold text-orange-400 uppercase tracking-widest text-center px-2">
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 xl:gap-10 items-stretch">
          {/* ── LEFT: Profile Details ── */}
          <div className="bg-white/75 backdrop-blur-sm border border-orange-100 rounded-[28px] overflow-hidden shadow-sm">
            <div className="px-5 sm:px-7 py-6">
              <div className="flex items-center gap-2 pb-4 border-b border-orange-100 mb-2">
                <User size={18} className="text-orange-500 flex-none" />
                <h2
                  className="text-lg font-bold text-gray-800"
                  style={{ fontFamily: "'Fredoka One', cursive" }}
                >
                  Profile Details
                </h2>
              </div>

              <div className="pt-2">
                <InfoRow icon={User} label="Full Name" value={user.name} />
                <InfoRow icon={Mail} label="Email Address" value={user.email} />
                <InfoRow icon={Phone} label="Mobile Number" value={user.phone} />
                <InfoRow icon={MapPin} label="Address Line 1" value={user.address1} />
                <InfoRow icon={MapPin} label="Address Line 2" value={user.address2} />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-0 md:gap-4">
                  <InfoRow icon={MapPin} label="City" value={user.city} />
                  <InfoRow icon={MapPin} label="State" value={user.state} />
                  <InfoRow icon={MapPin} label="Pincode" value={user.pincode} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-0 md:gap-4">
                  <InfoRow icon={User} label="Gender" value={user.gender} />
                  <InfoRow
                    icon={Star}
                    label="Date of Birth"
                    value={user.birthdate ? new Date(user.birthdate).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "long",
                      year: "numeric"
                    }) : ""}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ── RIGHT: Account Actions ── */}
          <div className="bg-white/75 backdrop-blur-sm border border-orange-100 rounded-[28px] overflow-hidden shadow-sm">
            <div className="border-b border-orange-100 px-5 sm:px-7 py-5 flex items-center gap-2">
              <ShieldCheck size={18} className="text-orange-500 flex-none" />
              <h2
                className="text-lg font-bold text-gray-800"
                style={{ fontFamily: "'Fredoka One', cursive" }}
              >
                Account Actions
              </h2>
            </div>

            <div className="px-5 sm:px-7 py-6 flex flex-col h-full justify-between pb-12">
              <div className="space-y-1">
                {user.role === 'admin' && (
                  <QuickCard
                    icon={LayoutDashboard}
                    title="Return to Admin Dashboard"
                    sub="Go back to admin control panel"
                    onClick={() => navigate("/admin")}
                  />
                )}
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
                  onClick={() => setShowAddressMgr(true)}
                />
                <QuickCard
                  icon={Star}
                  title="Edit Profile"
                  sub="Update your personal information"
                  onClick={() => setShowEdit(true)}
                />
              </div>

              <div className="mt-8">
                <button
                  onClick={() => setShowLogoutConfirm(true)}
                  className="w-full flex items-center justify-center mb-20 gap-2 py-3.5 rounded-2xl border-2 border-orange-200 text-orange-500 font-bold text-sm hover:bg-orange-50 hover:border-orange-300 transition-all duration-200 group"
                >
                  <LogOut size={16} className="group-hover:-translate-x-0.5 transition-transform" />
                  Sign Out
                </button>
              </div>
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

      {showAddressMgr && user && (
        <AddressManager
          customerId={user.customer_id || user.id}
          onClose={() => setShowAddressMgr(false)}
        />
      )}
    </div>
  );
}

// ── ADDRESS MANAGER COMPONENTS ───────────────────────────────────────
const EMPTY_ADDR = {
  full_name: "", phone: "", address_line_1: "", address_line_2: "",
  city: "", state: "", pincode: "", address_type: "Home", is_default: false,
};

function AddressForm({ initial, onSave, onCancel, saving }) {
  const [form, setForm] = useState(initial || EMPTY_ADDR);
  const [errors, setErrors] = useState({});

  const set = (k, v) => {
    setForm(p => ({ ...p, [k]: v }));
    setErrors(p => ({ ...p, [k]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.full_name.trim()) e.full_name = "Full name is required";
    if (!form.phone.trim()) e.phone = "Phone is required";
    else if (!/^[6-9]\d{9}$/.test(form.phone.replace(/\s/g, ""))) e.phone = "Enter a valid 10-digit number";
    if (!form.address_line_1.trim()) e.address_line_1 = "Address line 1 is required";
    if (!form.city.trim()) e.city = "City is required";
    if (!form.state.trim()) e.state = "State is required";
    if (!form.pincode.trim()) e.pincode = "Pincode is required";
    else if (!/^\d{6}$/.test(form.pincode)) e.pincode = "Enter a valid 6-digit pincode";
    return e;
  };

  const handleSave = () => {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    onSave(form);
  };

  const inp = (err) =>
    `w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all ${
      err ? "border-red-300 bg-red-50" : "border-orange-200 bg-orange-50/40 hover:border-orange-300"
    }`;

  const Lbl = ({ label, err, children }) => (
    <div className="space-y-1">
      <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide">{label}</label>
      {children}
      {err && <p className="text-xs text-red-500 font-medium">{err}</p>}
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        {["Home", "Work", "Other"].map(t => (
          <button key={t} type="button" onClick={() => set("address_type", t)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold border-2 transition-all ${
              form.address_type === t ? "border-orange-500 bg-orange-500 text-white" : "border-orange-200 text-gray-600 hover:border-orange-300"
            }`}>
            {t === "Home" ? <Home size={13} /> : t === "Work" ? <Briefcase size={13} /> : <MapPin size={13} />}
            {t}
          </button>
        ))}
      </div>

      <Lbl label="Full Name" err={errors.full_name}>
        <input type="text" className={inp(errors.full_name)} value={form.full_name}
          onChange={e => set("full_name", e.target.value)} />
      </Lbl>

      <Lbl label="Phone" err={errors.phone}>
        <input type="tel" className={inp(errors.phone)} value={form.phone}
          onChange={e => set("phone", e.target.value.replace(/\D/g, "").slice(0, 10))} maxLength={10} />
      </Lbl>

      <Lbl label="Address Line 1" err={errors.address_line_1}>
        <input type="text" className={inp(errors.address_line_1)} value={form.address_line_1}
          onChange={e => set("address_line_1", e.target.value)} />
      </Lbl>

      <Lbl label="Address Line 2" err={errors.address_line_2}>
        <input type="text" className={inp(errors.address_line_2)} value={form.address_line_2}
          onChange={e => set("address_line_2", e.target.value)} />
      </Lbl>

      <div className="grid grid-cols-2 gap-4">
        <Lbl label="City" err={errors.city}>
          <input type="text" className={inp(errors.city)} value={form.city}
            onChange={e => set("city", e.target.value)} />
        </Lbl>
        <Lbl label="State" err={errors.state}>
          <input type="text" className={inp(errors.state)} value={form.state}
            onChange={e => set("state", e.target.value)} />
        </Lbl>
      </div>

      <Lbl label="Pincode" err={errors.pincode}>
        <input type="text" className={inp(errors.pincode)} value={form.pincode}
          onChange={e => set("pincode", e.target.value.replace(/\D/g, "").slice(0, 6))} maxLength={6} />
      </Lbl>

      <label className="flex items-center gap-2 cursor-pointer">
        <input type="checkbox" checked={form.is_default} onChange={e => set("is_default", e.target.checked)}
          className="w-4 h-4 text-orange-500 rounded border-orange-200 focus:ring-orange-400" />
        <span className="text-sm font-semibold text-gray-700">Set as default address</span>
      </label>

      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onCancel}
          className="flex-1 py-3 rounded-2xl border border-orange-200 text-orange-600 font-bold text-sm">Cancel</button>
        <button type="button" onClick={handleSave} disabled={saving}
          className="flex-1 py-3 rounded-2xl bg-orange-500 text-white font-bold text-sm hover:bg-orange-600 shadow-md">
          {saving ? "Saving..." : "Save Address"}
        </button>
      </div>
    </div>
  );
}

function AddressCard({ addr, onEdit, onDelete, onSetDefault }) {
  return (
    <div className={`p-4 rounded-2xl border-2 transition-all ${addr.is_default ? "border-orange-400 bg-orange-50" : "border-orange-100 bg-white"}`}>
      <div className="flex justify-between items-start mb-2">
        <span className="text-[10px] font-bold uppercase tracking-widest text-orange-600 bg-orange-100 px-2 py-0.5 rounded-full">{addr.address_type}</span>
        {addr.is_default && <span className="text-[10px] font-bold text-green-600">DEFAULT</span>}
      </div>
      <p className="text-sm font-bold text-gray-800">{addr.full_name}</p>
      <p className="text-xs text-gray-600">{addr.phone}</p>
      <p className="text-xs text-gray-500 mt-1">{addr.address_line_1}, {addr.address_line_2 && addr.address_line_2 + ","} {addr.city}, {addr.state} - {addr.pincode}</p>
      <div className="flex gap-2 mt-3">
        <button onClick={() => onEdit(addr)} className="text-xs font-bold text-orange-600 border border-orange-200 px-3 py-1.5 rounded-xl bg-white hover:bg-orange-50">Edit</button>
        <button onClick={() => onDelete(addr.address_id)} className="text-xs font-bold text-red-500 border border-red-100 px-3 py-1.5 rounded-xl bg-white hover:bg-red-50">Remove</button>
        {!addr.is_default && <button onClick={() => onSetDefault(addr.address_id)} className="text-xs font-bold text-gray-600 border border-gray-200 px-3 py-1.5 rounded-xl bg-white hover:bg-gray-50 ml-auto">Set Default</button>}
      </div>
    </div>
  );
}



function AddressManager({ customerId, onClose }) {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState("list");
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetchAddresses = useCallback(async () => {
    try {
      const res = await fetch(`${API}/api/addresses/${customerId}`);
      const data = await res.json();
      setAddresses(data.addresses || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [customerId]);

  useEffect(() => { fetchAddresses(); }, [fetchAddresses]);

  const onSave = async (form) => {
    setSaving(true);
    const url = mode === "add" ? `${API}/api/addresses/${customerId}` : `${API}/api/addresses/${customerId}/${editing.address_id}`;
    const method = mode === "add" ? "POST" : "PUT";
    try {
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      if (res.ok) { fetchAddresses(); setMode("list"); setEditing(null); }
    } catch (err) { alert("Failed to save address"); }
    finally { setSaving(false); }
  };

  const onDelete = async (id) => {
    if (!window.confirm("Remove address?")) return;
    try {
      const res = await fetch(`${API}/api/addresses/${customerId}/${id}`, { method: "DELETE" });
      if (res.ok) fetchAddresses();
    } catch (err) { alert("Failed to delete"); }
  };

  const onSetDefault = async (id) => {
    try {
      const res = await fetch(`${API}/api/addresses/${customerId}/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...addresses.find(a => a.address_id === id), is_default: true }) });
      if (res.ok) fetchAddresses();
    } catch (err) { console.error(err); }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-lg max-h-[90vh] flex flex-col rounded-3xl bg-white shadow-2xl border border-orange-100 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 border-b border-orange-100 bg-gradient-to-r from-orange-500 to-amber-500">
          <h3 className="text-lg font-bold text-white tracking-wide">
            {mode === "list" ? "My Addresses" : mode === "add" ? "Add Address" : "Edit Address"}
          </h3>
          <button onClick={onClose} className="text-white hover:bg-white/20 rounded-full p-1"><X size={20} /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          {mode === "list" ? (
            loading ? <div className="p-10 text-center">Loading...</div> : (
              <div className="space-y-4">
                {addresses.map(a => <AddressCard key={a.address_id} addr={a} onEdit={(addr) => { setEditing(addr); setMode("edit"); }} onDelete={onDelete} onSetDefault={onSetDefault} />)}
                <button onClick={() => setMode("add")} className="w-full py-4 rounded-2xl border-2 border-dashed border-orange-200 text-orange-500 font-bold text-sm hover:bg-orange-50">+ Add New Address</button>
              </div>
            )
          ) : (
            <AddressForm initial={editing} onSave={onSave} onCancel={() => { setMode("list"); setEditing(null); }} saving={saving} />
          )}
        </div>
      </div>
    </div>
  );
}
