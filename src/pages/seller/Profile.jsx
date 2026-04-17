import { useState, useEffect } from "react";
import {
  FaUser, FaLock, FaBell, FaPalette, FaStore,
  FaEnvelope, FaPhone, FaMapMarkerAlt, FaSave,
  FaEye, FaEyeSlash, FaShoppingCart, FaStar,
  FaBoxOpen, FaRupeeSign, FaCheckCircle
} from "react-icons/fa";
import { sellerProfile, sellerStats } from "../../data/seller/index.js";

function fmt(n) { return new Intl.NumberFormat("en-IN").format(n); }

/* ── Reusable toggle ── */
const Toggle = ({ on, onChange }) => (
  <button
    onClick={() => onChange(!on)}
    className={`relative w-12 h-6 rounded-full transition-all duration-300 flex-none
      ${on ? "bg-orange-500" : "bg-gray-200"}`}
    aria-checked={on}
    role="switch"
  >
    <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-all duration-300
      ${on ? "left-[26px]" : "left-0.5"}`} />
  </button>
);

/* ── Field wrapper ── */
const Field = ({ label, icon: Icon, children }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-xs font-semibold text-stone-500 flex items-center gap-1.5 uppercase tracking-wide">
      {Icon && <Icon size={11} className="text-orange-400" />} {label}
    </label>
    {children}
  </div>
);

/* ── Card wrapper ── */
const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-2xl border border-orange-100 shadow-sm ${className}`}>
    {children}
  </div>
);

const CardHeader = ({ icon: Icon, title }) => (
  <div className="flex items-center gap-2.5 px-6 py-4 border-b border-orange-50">
    <div className="w-8 h-8 rounded-xl bg-orange-100 flex items-center justify-center">
      <Icon size={15} className="text-orange-500" />
    </div>
    <h3 className="text-base font-bold text-stone-800" style={{ fontFamily: "'Baloo 2', cursive" }}>
      {title}
    </h3>
  </div>
);

export default function SellerSettings() {
  /* Profile form */
  const [profile, setProfile] = useState({
    shopName: "",
    name: "",
    email: "",
    phone: "",
    location: "",
  });
  const [profileSaved, setProfileSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profileError, setProfileError] = useState("");

  /* Password form */
  const [passwords, setPasswords] = useState({ current: "", newPw: "", confirm: "" });
  const [showPw, setShowPw] = useState({ current: false, newPw: false, confirm: false });
  const [pwSaved, setPwSaved] = useState(false);
  const [pwError, setPwError] = useState("");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const sellerData = JSON.parse(localStorage.getItem('toyCurrentSeller') || '{}');
      if (!sellerData.id) {
        setProfileError("Session expired. Please login again.");
        setLoading(false);
        return;
      }

      const response = await fetch(`http://localhost:5000/api/auth/seller/profile/${sellerData.id}`);
      const data = await response.json();

      if (response.ok) {
        setProfile({
          shopName: data.seller.store_name || "",
          name: data.seller.name || "",
          email: data.seller.email || "",
          phone: data.seller.phone || "",
          location: data.seller.location || "",
        });
      } else {
        setProfileError(data.error || "Failed to fetch profile.");
      }
    } catch (err) {
      console.error('Fetch profile error:', err);
      setProfileError("Server error. Could not load profile.");
    } finally {
      setLoading(false);
    }
  };

  /* Notifications */
  const [notifs, setNotifs] = useState({
    orders: true,
    payments: true,
    reviews: true,
    messages: false,
  });

  /* Appearance */
  const [darkMode, setDarkMode] = useState(false);

  const saveProfile = async () => {
    setProfileError("");
    try {
      const sellerData = JSON.parse(localStorage.getItem('toyCurrentSeller') || '{}');
      if (!sellerData.id) {
        setProfileError("Session expired. Please login again.");
        return;
      }

      const response = await fetch(`http://localhost:5000/api/auth/seller/profile/${sellerData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: profile.name,
          email: profile.email,
          store_name: profile.shopName,
          phone: profile.phone,
          location: profile.location,
          bio: "", 
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setProfileSaved(true);
        // Update localStorage
        const updatedSeller = { 
          ...sellerData, 
          name: data.seller.name, 
          email: data.seller.email,
          storeName: data.seller.store_name 
        };
        localStorage.setItem('toyCurrentSeller', JSON.stringify(updatedSeller));
        setTimeout(() => setProfileSaved(false), 2500);
      } else {
        setProfileError(data.error || "Failed to save profile.");
      }
    } catch (err) {
      console.error('Save profile error:', err);
      setProfileError("Server error. Could not save changes.");
    }
  };

  const updatePassword = async () => {
    if (!passwords.current) { setPwError("Enter your current password."); return; }
    if (passwords.newPw.length < 6) { setPwError("New password must be at least 6 characters."); return; }
    if (passwords.newPw !== passwords.confirm) { setPwError("Passwords do not match."); return; }
    
    setPwError("");
    
    try {
      const sellerData = JSON.parse(localStorage.getItem('toyCurrentSeller') || '{}');
      if (!sellerData.email) {
        setPwError("Session expired. Please login again.");
        return;
      }

      const response = await fetch('http://localhost:5000/api/auth/seller/update-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: sellerData.email,
          currentPassword: passwords.current,
          newPassword: passwords.newPw,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setPwSaved(true);
        setPasswords({ current: "", newPw: "", confirm: "" });
        setTimeout(() => setPwSaved(false), 2500);
      } else {
        setPwError(data.error || "Failed to update password.");
      }
    } catch (err) {
      console.error('Update password error:', err);
      setPwError("Server error. Please try again later.");
    }
  };

  const inputCls = "w-full px-4 py-2.5 rounded-xl border border-orange-200 bg-orange-50/40 text-sm text-stone-700 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400 transition placeholder-stone-400";

  return (
    <div className="min-h-screen bg-orange-50" style={{ fontFamily: "'Poppins', sans-serif" }}>

    
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">

        {/* Page title */}
        <div>
          <h1 className="text-2xl font-black text-stone-800" style={{ fontFamily: "'Baloo 2', cursive" }}>
             Settings
          </h1>
          <p className="text-sm text-stone-400 mt-0.5">Manage your account & preferences</p>
        </div>

    
        

        {/* ── Row 1: Profile + Security ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Profile Settings */}
          <Card>
            <CardHeader icon={FaUser} title="Profile Settings" />
            <div className="p-6 space-y-4">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-8 space-y-3">
                  <div className="w-8 h-8 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin"></div>
                  <p className="text-sm text-stone-400">Loading profile...</p>
                </div>
              ) : (
                <>
                  <Field label="Store Name" icon={FaStore}>
                    <input className={inputCls} value={profile.shopName}
                      onChange={e => setProfile({ ...profile, shopName: e.target.value })} />
                  </Field>
                  <Field label="Full Name" icon={FaUser}>
                    <input className={inputCls} value={profile.name}
                      onChange={e => setProfile({ ...profile, name: e.target.value })} />
                  </Field>
                  <Field label="Email" icon={FaEnvelope}>
                    <input className={inputCls} type="email" value={profile.email}
                      onChange={e => setProfile({ ...profile, email: e.target.value })} />
                  </Field>
                  <Field label="Phone" icon={FaPhone}>
                    <input className={inputCls} value={profile.phone}
                      onChange={e => setProfile({ ...profile, phone: e.target.value })} />
                  </Field>
                  <Field label="Store Location" icon={FaMapMarkerAlt}>
                    <input className={inputCls} value={profile.location}
                      onChange={e => setProfile({ ...profile, location: e.target.value })} />
                  </Field>

                  {profileError && (
                    <p className="text-xs text-red-500 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
                       ⚠️ {profileError}
                    </p>
                  )}

                  <button onClick={saveProfile}
                    className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold py-2.5 rounded-xl transition-all hover:shadow-md hover:shadow-orange-200 text-sm mt-2">
                    {profileSaved
                      ? <><FaCheckCircle size={14} /> Saved!</>
                      : <><FaSave size={14} /> Save Changes</>}
                  </button>
                </>
              )}
            </div>
          </Card>

          {/* Security */}
          <Card>
            <CardHeader icon={FaLock} title="Security" />
            <div className="p-6 space-y-4">
              {[
                { key: "current", label: "Current Password" },
                { key: "newPw",   label: "New Password" },
                { key: "confirm", label: "Confirm Password" },
              ].map(({ key, label }) => (
                <Field key={key} label={label} icon={FaLock}>
                  <div className="relative">
                    <input
                      className={inputCls + " pr-10"}
                      type={showPw[key] ? "text" : "password"}
                      placeholder="••••••••"
                      value={passwords[key]}
                      onChange={e => setPasswords({ ...passwords, [key]: e.target.value })}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw(s => ({ ...s, [key]: !s[key] }))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-orange-500 transition-colors"
                    >
                      {showPw[key] ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                    </button>
                  </div>
                </Field>
              ))}

              {pwError && (
                <p className="text-xs text-red-500 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
                  ⚠️ {pwError}
                </p>
              )}

              <button onClick={updatePassword}
                className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold py-2.5 rounded-xl transition-all hover:shadow-md hover:shadow-orange-200 text-sm mt-2">
                {pwSaved
                  ? <><FaCheckCircle size={14} /> Password Updated!</>
                  : <><FaLock size={14} /> Update Password</>}
              </button>

              {/* Password tips */}
              <div className="bg-orange-50 border border-orange-100 rounded-xl p-3 space-y-1">
                <p className="text-xs font-semibold text-orange-600">Password tips:</p>
                {["At least 6 characters", "Mix letters, numbers & symbols", "Don't reuse old passwords"].map(tip => (
                  <p key={tip} className="text-xs text-stone-400 flex items-center gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-orange-300 flex-none" /> {tip}
                  </p>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* ── Row 2: Notifications + Appearance ── */}
       <div className="grid grid-cols-1 gap-6">

  {/* Notification Preferences */}
  <Card className="w-full">
    <CardHeader icon={FaBell} title="Notification Preferences" />

    <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
      {[
        { key: "orders",   label: "Orders Notifications",   sub: "New orders, status updates" },
        { key: "payments", label: "Payments Notifications", sub: "Payment received & failed" },
        { key: "reviews",  label: "Reviews Notifications",  sub: "New ratings & feedback" },
        { key: "messages", label: "Messages Notifications", sub: "Customer messages & queries" },
      ].map(({ key, label, sub }) => (
        <div
          key={key}
          className="flex items-center justify-between p-3.5 rounded-xl bg-orange-50/60 border border-orange-100 hover:border-orange-200 transition-colors w-full"
        >
          <div>
            <p className="text-sm font-semibold text-stone-700">{label}</p>
            <p className="text-xs text-stone-400 mt-0.5">{sub}</p>
          </div>

          <Toggle
            on={notifs[key]}
            onChange={val => setNotifs(n => ({ ...n, [key]: val }))}
          />
        </div>
      ))}
    </div>
  </Card>

</div>

        {/* ── Store Settings ── */}
        <Card>
          <CardHeader icon={FaStore} title="Store Settings" />
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { label: "Email Notifications",  sub: "Receive order & review emails",          def: true  },
              { label: "Low Stock Alerts",      sub: "Alert when stock falls below 5 units",   def: true  },
              { label: "Auto-accept Orders",    sub: "Automatically accept incoming orders",    def: false },
              { label: "Holiday Mode",          sub: "Temporarily pause all new orders",        def: false },
            ].map(({ label, sub, def }) => {
              const [on, setOn] = useState(def);
              return (
                <div key={label}
                  className="flex items-center justify-between p-4 rounded-xl bg-orange-50/50 border border-orange-100 hover:border-orange-200 transition-colors">
                  <div>
                    <p className="text-sm font-semibold text-stone-700">{label}</p>
                    <p className="text-xs text-stone-400 mt-0.5">{sub}</p>
                  </div>
                  <Toggle on={on} onChange={setOn} />
                </div>
              );
            })}
          </div>
        </Card>

      </div>
    </div>
  );
}