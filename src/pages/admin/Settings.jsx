import React, { useState } from 'react';
import { Save, Eye, EyeOff, Store, User, Lock, Bell, Shield, ChevronDown, ChevronUp, Globe, Phone, MapPin, Mail } from 'lucide-react';
import { SectionHeader } from '../../components/admin/ui/index.jsx';
import { useAdmin } from '../../context/AdminContext';

function Section({ id, title, icon, open, onToggle, children }) {
  return (
    <div className="card overflow-hidden">
      <button
        onClick={() => onToggle(id)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-orange-50 rounded-xl flex items-center justify-center text-orange-500">{icon}</div>
          <span className="font-semibold text-gray-800">{title}</span>
        </div>
        {open ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
      </button>
      {open && <div className="px-5 pb-5 border-t border-gray-50">{children}</div>}
    </div>
  );
}

export default function Settings() {
  const { settings, updateSettings } = useAdmin();
  const [toast, setToast] = useState('');
  const [openSections, setOpenSections] = useState({ shop: true, profile: false, password: false, social: false });
  const [showPw, setShowPw] = useState({ current: false, new: false, confirm: false });

  const [shopForm, setShopForm] = useState({ ...settings });
  const [pwForm, setPwForm] = useState({ current: '', new: '', confirm: '' });
  const [profileForm, setProfileForm] = useState({
    adminName: 'Admin User',
    adminEmail: settings.email || 'admin@toystore.com',
    adminPhone: settings.phone || '',
    adminRole: 'Super Admin',
  });
  const [socialForm, setSocialForm] = useState({
    facebook: settings.facebook || '',
    instagram: settings.instagram || '',
    twitter: settings.twitter || '',
    youtube: settings.youtube || '',
  });

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 2500); };

  const toggleSection = (id) => setOpenSections((prev) => ({ ...prev, [id]: !prev[id] }));

  const saveShop = () => {
    updateSettings(shopForm);
    showToast('Shop settings saved ✓');
  };

  const savePassword = () => {
    if (!pwForm.current || !pwForm.new || !pwForm.confirm) { showToast('Please fill all password fields'); return; }
    if (pwForm.new !== pwForm.confirm) { showToast('New passwords do not match'); return; }
    if (pwForm.new.length < 6) { showToast('Password must be at least 6 characters'); return; }
    setPwForm({ current: '', new: '', confirm: '' });
    showToast('Password changed successfully ✓');
  };

  const saveProfile = () => {
    updateSettings({ email: profileForm.adminEmail, phone: profileForm.adminPhone });
    showToast('Profile updated ✓');
  };

  const saveSocial = () => {
    updateSettings(socialForm);
    showToast('Social links saved ✓');
  };

  return (
    <div className="p-4 sm:p-6 page-enter max-w-2xl">
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white text-sm px-5 py-3 rounded-2xl shadow-xl animate-slide-up">
          {toast}
        </div>
      )}

      <SectionHeader title="Settings" subtitle="Manage your store preferences" />

      <div className="space-y-3">
        {/* Shop Info */}
        <Section id="shop" title="Shop Information" icon={<Store size={18} />} open={openSections.shop} onToggle={toggleSection}>
          <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Shop Name</label>
              <input type="text" value={shopForm.shopName || ''} onChange={e => setShopForm(p => ({ ...p, shopName: e.target.value }))} className="input" placeholder="ToyStore" />
            </div>
            <div>
              <label className="label">Tagline</label>
              <input type="text" value={shopForm.tagline || ''} onChange={e => setShopForm(p => ({ ...p, tagline: e.target.value }))} className="input" placeholder="Magic Toys for Little Dreamers" />
            </div>
            <div>
              <label className="label flex items-center gap-1.5"><Mail size={13} className="text-orange-400" /> Email</label>
              <input type="email" value={shopForm.email || ''} onChange={e => setShopForm(p => ({ ...p, email: e.target.value }))} className="input" />
            </div>
            <div>
              <label className="label flex items-center gap-1.5"><Phone size={13} className="text-orange-400" /> Phone</label>
              <input type="text" value={shopForm.phone || ''} onChange={e => setShopForm(p => ({ ...p, phone: e.target.value }))} className="input" />
            </div>
            <div className="sm:col-span-2">
              <label className="label flex items-center gap-1.5"><MapPin size={13} className="text-orange-400" /> Address</label>
              <input type="text" value={shopForm.address || ''} onChange={e => setShopForm(p => ({ ...p, address: e.target.value }))} className="input" />
            </div>
            <div>
              <label className="label">Currency</label>
              <select value={shopForm.currency || 'INR'} onChange={e => setShopForm(p => ({ ...p, currency: e.target.value }))} className="input">
                <option value="INR">INR (₹)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
              </select>
            </div>
            <div>
              <label className="label">Timezone</label>
              <select value={shopForm.timezone || 'Asia/Kolkata'} onChange={e => setShopForm(p => ({ ...p, timezone: e.target.value }))} className="input">
                <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                <option value="UTC">UTC</option>
                <option value="America/New_York">America/New_York</option>
              </select>
            </div>
            <div>
              <label className="label">Store Logo URL</label>
              <input type="text" value={shopForm.logo || ''} onChange={e => setShopForm(p => ({ ...p, logo: e.target.value }))} className="input" placeholder="Paste logo image URL" />
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <button onClick={saveShop} className="btn-primary"><Save size={15} /> Save Shop Info</button>
          </div>
        </Section>

        {/* Admin Profile */}
        <Section id="profile" title="Admin Profile" icon={<User size={18} />} open={openSections.profile} onToggle={toggleSection}>
          <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Full Name</label>
              <input type="text" value={profileForm.adminName} onChange={e => setProfileForm(p => ({ ...p, adminName: e.target.value }))} className="input" />
            </div>
            <div>
              <label className="label">Role</label>
              <input type="text" value={profileForm.adminRole} onChange={e => setProfileForm(p => ({ ...p, adminRole: e.target.value }))} className="input" />
            </div>
            <div>
              <label className="label">Email</label>
              <input type="email" value={profileForm.adminEmail} onChange={e => setProfileForm(p => ({ ...p, adminEmail: e.target.value }))} className="input" />
            </div>
            <div>
              <label className="label">Phone</label>
              <input type="text" value={profileForm.adminPhone} onChange={e => setProfileForm(p => ({ ...p, adminPhone: e.target.value }))} className="input" />
            </div>
          </div>

          {/* Avatar preview */}
          <div className="mt-4 flex items-center gap-4 p-4 bg-orange-50 rounded-2xl">
            <div className="w-14 h-14 rounded-2xl bg-brand-grad flex items-center justify-center text-white text-xl font-bold">
              {profileForm.adminName.charAt(0)}
            </div>
            <div>
              <p className="font-semibold text-gray-800">{profileForm.adminName}</p>
              <p className="text-sm text-orange-600">{profileForm.adminRole}</p>
              <p className="text-xs text-gray-400">{profileForm.adminEmail}</p>
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <button onClick={saveProfile} className="btn-primary"><Save size={15} /> Save Profile</button>
          </div>
        </Section>

        {/* Change Password */}
        <Section id="password" title="Change Password" icon={<Lock size={18} />} open={openSections.password} onToggle={toggleSection}>
          <div className="pt-4 space-y-3">
            {[
              { field: 'current', label: 'Current Password' },
              { field: 'new', label: 'New Password' },
              { field: 'confirm', label: 'Confirm New Password' },
            ].map(({ field, label }) => (
              <div key={field}>
                <label className="label">{label}</label>
                <div className="relative">
                  <input
                    type={showPw[field] ? 'text' : 'password'}
                    value={pwForm[field]}
                    onChange={e => setPwForm(p => ({ ...p, [field]: e.target.value }))}
                    className="input pr-10"
                    placeholder="••••••••"
                  />
                  <button type="button" onClick={() => setShowPw(p => ({ ...p, [field]: !p[field] }))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPw[field] ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            ))}
            <div className="flex justify-end mt-2">
              <button onClick={savePassword} className="btn-primary"><Lock size={15} /> Update Password</button>
            </div>
          </div>
        </Section>

        {/* Social Links */}
        <Section id="social" title="Social Links" icon={<Globe size={18} />} open={openSections.social} onToggle={toggleSection}>
          <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { field: 'facebook', label: '📘 Facebook', placeholder: 'https://facebook.com/yourstore' },
              { field: 'instagram', label: '📷 Instagram', placeholder: 'https://instagram.com/yourstore' },
              { field: 'twitter', label: '🐦 Twitter / X', placeholder: 'https://twitter.com/yourstore' },
              { field: 'youtube', label: '▶️ YouTube', placeholder: 'https://youtube.com/yourstore' },
            ].map(({ field, label, placeholder }) => (
              <div key={field}>
                <label className="label">{label}</label>
                <input type="url" value={socialForm[field] || ''} onChange={e => setSocialForm(p => ({ ...p, [field]: e.target.value }))} className="input" placeholder={placeholder} />
              </div>
            ))}
          </div>
          <div className="flex justify-end mt-4">
            <button onClick={saveSocial} className="btn-primary"><Save size={15} /> Save Social Links</button>
          </div>
        </Section>
      </div>
    </div>
  );
}
