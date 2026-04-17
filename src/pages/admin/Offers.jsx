import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Tag, Calendar, ToggleLeft, ToggleRight, Image, X } from 'lucide-react';
import { StatusBadge, SectionHeader, ConfirmModal } from '../../components/admin/ui/index.jsx';
import { useAdmin } from '../../context/AdminContext';

const OFFER_CATS = ['All', 'Soft Toys', 'Educational Toys', 'Electronic Toys'];
const OFFER_STATUSES = ['Active', 'Scheduled', 'Expired'];

const EMPTY_OFFER = { title: '', description: '', discount: '', category: 'All', startDate: '', endDate: '', status: 'Scheduled' };
const EMPTY_BANNER = { title: '', description: '', cta: 'Shop Now', link: '', image: '', active: true };

function OfferForm({ data, onChange, onSave, onClose, title }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-800">{title}</h2>
          <button onClick={onClose} className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center transition"><X size={18} /></button>
        </div>
        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="label">Offer Title *</label>
            <input type="text" name="title" value={data.title} onChange={onChange} className="input" placeholder="e.g. Summer Sale" />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Description</label>
            <textarea name="description" value={data.description} onChange={onChange} rows={2} className="input resize-none" placeholder="Offer details" />
          </div>
          <div>
            <label className="label">Discount</label>
            <input type="text" name="discount" value={data.discount} onChange={onChange} className="input" placeholder="e.g. 30% OFF" />
          </div>
          <div>
            <label className="label">Category</label>
            <select name="category" value={data.category} onChange={onChange} className="input">
              {OFFER_CATS.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Start Date</label>
            <input type="date" name="startDate" value={data.startDate} onChange={onChange} className="input" />
          </div>
          <div>
            <label className="label">End Date</label>
            <input type="date" name="endDate" value={data.endDate} onChange={onChange} className="input" />
          </div>
          <div>
            <label className="label">Status</label>
            <select name="status" value={data.status} onChange={onChange} className="input">
              {OFFER_STATUSES.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>
        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
          <button onClick={onClose} className="btn-outline">Cancel</button>
          <button onClick={onSave} className="btn-primary">Save Offer</button>
        </div>
      </div>
    </div>
  );
}

function BannerForm({ data, onChange, onToggle, onSave, onClose, title }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-800">{title}</h2>
          <button onClick={onClose} className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center transition"><X size={18} /></button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="label">Banner Title *</label>
            <input type="text" name="title" value={data.title} onChange={onChange} className="input" placeholder="e.g. Soft & Snuggly" />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea name="description" value={data.description} onChange={onChange} rows={2} className="input resize-none" placeholder="Hero banner tagline" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">CTA Button Text</label>
              <input type="text" name="cta" value={data.cta} onChange={onChange} className="input" placeholder="Shop Now" />
            </div>
            <div>
              <label className="label">Link (section ID)</label>
              <input type="text" name="link" value={data.link} onChange={onChange} className="input" placeholder="soft-toys" />
            </div>
          </div>
          <div>
            <label className="label">Image URL</label>
            <input type="text" name="image" value={data.image} onChange={onChange} className="input" placeholder="Paste banner image URL" />
            {data.image && <img src={data.image} alt="preview" className="mt-2 w-full h-28 object-cover rounded-xl border border-gray-200" onError={e => e.target.style.display='none'} />}
          </div>
          <label className="flex items-center gap-3 cursor-pointer">
            <div onClick={onToggle} className={`w-10 h-5 rounded-full relative transition-all ${data.active ? 'bg-orange-500' : 'bg-gray-200'}`}>
              <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all ${data.active ? 'left-5' : 'left-0.5'}`} />
            </div>
            <span className="text-sm text-gray-600">Active (visible on homepage)</span>
          </label>
        </div>
        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
          <button onClick={onClose} className="btn-outline">Cancel</button>
          <button onClick={onSave} className="btn-primary">Save Banner</button>
        </div>
      </div>
    </div>
  );
}

export default function Offers() {
  const { offers, addOffer, updateOffer, deleteOffer, toggleOfferStatus, banners, addBanner, updateBanner, deleteBanner, toggleBanner } = useAdmin();

  const [tab, setTab] = useState('offers');
  const [showOfferForm, setShowOfferForm] = useState(false);
  const [editOfferId, setEditOfferId] = useState(null);
  const [deleteOfferId, setDeleteOfferId] = useState(null);
  const [offerForm, setOfferForm] = useState(EMPTY_OFFER);

  const [showBannerForm, setShowBannerForm] = useState(false);
  const [editBannerId, setEditBannerId] = useState(null);
  const [deleteBannerId, setDeleteBannerId] = useState(null);
  const [bannerForm, setBannerForm] = useState(EMPTY_BANNER);

  const [toast, setToast] = useState('');
  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 2500); };

  /* Offer handlers */
  const handleOfferChange = (e) => setOfferForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  const openAddOffer = () => { setOfferForm(EMPTY_OFFER); setEditOfferId(null); setShowOfferForm(true); };
  const openEditOffer = (o) => {
    setOfferForm({ title: o.title, description: o.description, discount: o.discount, category: o.category, startDate: o.startDate, endDate: o.endDate, status: o.status });
    setEditOfferId(o.id); setShowOfferForm(true);
  };
  const handleOfferSave = () => {
    if (!offerForm.title.trim()) return;
    if (editOfferId) { updateOffer({ ...offers.find(o => o.id === editOfferId), ...offerForm }); showToast('Offer updated ✓'); }
    else { addOffer(offerForm); showToast('Offer created ✓'); }
    setShowOfferForm(false); setEditOfferId(null);
  };

  /* Banner handlers */
  const handleBannerChange = (e) => setBannerForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  const openAddBanner = () => { setBannerForm(EMPTY_BANNER); setEditBannerId(null); setShowBannerForm(true); };
  const openEditBanner = (b) => {
    setBannerForm({ title: b.title, description: b.description, cta: b.cta, link: b.link, image: b.image, active: b.active });
    setEditBannerId(b.id); setShowBannerForm(true);
  };
  const handleBannerSave = () => {
    if (!bannerForm.title.trim()) return;
    if (editBannerId) { updateBanner({ ...banners.find(b => b.id === editBannerId), ...bannerForm }); showToast('Banner updated ✓'); }
    else { addBanner(bannerForm); showToast('Banner added — visible on homepage ✓'); }
    setShowBannerForm(false); setEditBannerId(null);
  };

  return (
    <div className="p-4 sm:p-6 page-enter">
      {toast && <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white text-sm px-5 py-3 rounded-2xl shadow-xl animate-slide-up">{toast}</div>}

      <ConfirmModal open={!!deleteOfferId} onClose={() => setDeleteOfferId(null)}
        onConfirm={() => { deleteOffer(deleteOfferId); setDeleteOfferId(null); showToast('Offer deleted'); }}
        title="Delete Offer?" description="This promotional offer will be permanently removed." />

      <ConfirmModal open={!!deleteBannerId} onClose={() => setDeleteBannerId(null)}
        onConfirm={() => { deleteBanner(deleteBannerId); setDeleteBannerId(null); showToast('Banner deleted — removed from homepage'); }}
        title="Delete Banner?" description="This banner will be removed from the homepage carousel." />

      {showOfferForm && <OfferForm data={offerForm} onChange={handleOfferChange} onSave={handleOfferSave} onClose={() => setShowOfferForm(false)} title={editOfferId ? 'Edit Offer' : 'Create Offer'} />}
      {showBannerForm && <BannerForm data={bannerForm} onChange={handleBannerChange} onToggle={() => setBannerForm(p => ({ ...p, active: !p.active }))} onSave={handleBannerSave} onClose={() => setShowBannerForm(false)} title={editBannerId ? 'Edit Banner' : 'Add Banner'} />}

      <SectionHeader title="Offers & Banners" subtitle="Manage homepage promotions and hero banners" />

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-100 pb-1">
        {[
          { key: 'offers', label: `🏷️ Offers (${offers.length})` },
          { key: 'banners', label: `🖼️ Hero Banners (${banners.length})` },
        ].map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-5 py-2.5 rounded-t-xl text-sm font-medium transition-all border-b-2 ${tab === t.key ? 'border-orange-500 text-orange-600 bg-orange-50' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Offers Tab */}
      {tab === 'offers' && (
        <>
          <div className="flex justify-end mb-4">
            <button className="btn-primary" onClick={openAddOffer}><Plus size={16} /> Create Offer</button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {offers.map((o) => (
              <div key={o.id} className={`card overflow-hidden transition-all hover:-translate-y-0.5 hover:shadow-lg ${o.status === 'Expired' ? 'opacity-60' : ''}`}>
                <div className={`h-24 bg-gradient-to-r ${o.color || 'from-orange-400 to-rose-400'} relative`}>
                  {o.image && <img src={o.image} alt={o.title} className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-40" />}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-black text-white drop-shadow">{o.discount}</span>
                  </div>
                  <div className="absolute top-2 right-2"><StatusBadge status={o.status} /></div>
                </div>
                <div className="p-4">
                  <p className="font-semibold text-gray-800">{o.title}</p>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">{o.description}</p>
                  <div className="flex items-center gap-1.5 mt-2 text-xs text-gray-400">
                    <Tag size={11} className="text-orange-400" /> {o.category}
                    <span className="mx-1">·</span>
                    <Calendar size={11} className="text-orange-400" /> {o.startDate} → {o.endDate}
                  </div>
                  <div className="flex gap-2 mt-3">
                    {(o.status === 'Active' || o.status === 'Scheduled') && (
                      <button onClick={() => { toggleOfferStatus(o.id); showToast('Status toggled'); }}
                        className="flex-1 py-1.5 rounded-xl text-xs font-medium border border-orange-200 text-orange-600 hover:bg-orange-50 transition">
                        Toggle Status
                      </button>
                    )}
                    <button onClick={() => openEditOffer(o)} className="p-2 rounded-xl border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition"><Edit2 size={13} className="text-blue-500" /></button>
                    <button onClick={() => setDeleteOfferId(o.id)} className="p-2 rounded-xl border border-gray-200 hover:border-red-300 hover:bg-red-50 transition"><Trash2 size={13} className="text-red-500" /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Banners Tab */}
      {tab === 'banners' && (
        <>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-500">Active banners appear in the homepage hero carousel</p>
            <button className="btn-primary" onClick={openAddBanner}><Plus size={16} /> Add Banner</button>
          </div>
          <div className="space-y-4">
            {banners.map((b) => (
              <div key={b.id} className={`card p-4 flex items-center gap-4 transition-all hover:shadow-md ${!b.active ? 'opacity-60' : ''}`}>
                {b.image ? (
                  <img src={b.image} alt={b.title} className="w-24 h-16 rounded-xl object-cover bg-orange-50 flex-none" onError={e => e.target.style.display='none'} />
                ) : (
                  <div className="w-24 h-16 rounded-xl bg-orange-50 flex-none flex items-center justify-center"><Image size={20} className="text-orange-300" /></div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-gray-800">{b.title}</p>
                    <StatusBadge status={b.active ? 'Active' : 'Inactive'} />
                  </div>
                  <p className="text-sm text-gray-500 mt-0.5 line-clamp-1">{b.description}</p>
                  <p className="text-xs text-orange-500 mt-1">CTA: {b.cta} → #{b.link}</p>
                </div>
                <div className="flex items-center gap-2 flex-none">
                  <button onClick={() => { toggleBanner(b.id); showToast(b.active ? 'Banner hidden from homepage' : 'Banner now showing on homepage ✓'); }}
                    className={`p-2 rounded-xl border transition ${b.active ? 'border-gray-200 text-gray-400 hover:bg-gray-50' : 'border-orange-200 text-orange-500 hover:bg-orange-50'}`}
                    title={b.active ? 'Hide banner' : 'Show banner'}>
                    {b.active ? <ToggleRight size={18} className="text-orange-500" /> : <ToggleLeft size={18} />}
                  </button>
                  <button onClick={() => openEditBanner(b)} className="p-2 rounded-xl border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition"><Edit2 size={14} className="text-blue-500" /></button>
                  <button onClick={() => setDeleteBannerId(b.id)} className="p-2 rounded-xl border border-gray-200 hover:border-red-300 hover:bg-red-50 transition"><Trash2 size={14} className="text-red-500" /></button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
