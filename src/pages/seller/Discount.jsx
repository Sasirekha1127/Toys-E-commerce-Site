import React, { useMemo, useState, useEffect } from 'react';
import {
  Plus,
  Percent,
  CalendarDays,
  Ticket,
  Pencil,
  Trash2,
  X,
  Save,
} from 'lucide-react';

const initialOffers = [
  {
    id: 1,
    title: 'Summer Toys Sale',
    discount: '40% OFF',
    type: 'Category Offer',
    status: 'Active',
    validFrom: '2026-04-10',
    validTo: '2026-04-20',
    coupon: 'SUMMER40',
  },
  {
    id: 2,
    title: 'Buy 2 Get 1 Free',
    discount: 'B2G1',
    type: 'Combo Offer',
    status: 'Scheduled',
    validFrom: '2026-04-15',
    validTo: '2026-04-30',
    coupon: 'B2G1FUN',
  },
  {
    id: 3,
    title: 'Flat ₹200 Off Above ₹1999',
    discount: '₹200 OFF',
    type: 'Cart Offer',
    status: 'Active',
    validFrom: '2026-04-09',
    validTo: '2026-04-18',
    coupon: 'SAVE200',
  },
];

const emptyForm = {
  title: '',
  discount: '',
  type: 'Category Offer',
  status: 'Active',
  validFrom: '',
  validTo: '',
  coupon: '',
};

function formatDateRange(from, to) {
  if (!from || !to) return 'No valid dates';

  const start = new Date(from).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  const end = new Date(to).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  return `${start} - ${end}`;
}

function Field({ label, error, children, full = false }) {
  return (
    <div className={full ? 'md:col-span-2' : ''}>
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        {label}
      </label>
      {children}
      {error ? <p className="text-xs text-red-500 mt-1.5">{error}</p> : null}
    </div>
  );
}

const inputClass =
  'w-full rounded-2xl border border-orange-200 bg-white px-4 py-3.5 text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-orange-300 focus:ring-4 focus:ring-orange-100';

export default function SellerDiscounts() {
  const [offers, setOffers] = useState(initialOffers);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});

  const activeCount = useMemo(
    () => offers.filter((offer) => offer.status === 'Active').length,
    [offers]
  );

  const couponCount = useMemo(
    () => offers.filter((offer) => offer.coupon.trim() !== '').length,
    [offers]
  );

  const scheduledCount = useMemo(
    () => offers.filter((offer) => offer.status === 'Scheduled').length,
    [offers]
  );

  const getSellerId = () => {
    try {
      const seller = JSON.parse(localStorage.getItem('toyCurrentSeller'));
      return seller?.id || 1;
    } catch {
      return 1;
    }
  };

  useEffect(() => {
    fetchDiscounts();
  }, []);

  const fetchDiscounts = async () => {
    try {
      const sid = getSellerId();
      const res = await fetch(`http://localhost:5000/api/discounts?seller_id=${sid}`);
      const data = await res.json();
      if (data.discounts) {
        const mapped = data.discounts.map(d => ({
          id: d.id,
          title: d.title || `Offer ${d.code}`, // Handle potentially missing title from backend
          discount: d.discount_type === 'percentage' ? `${d.discount_value}% OFF` : `₹${d.discount_value} OFF`,
          type: d.offer_type || 'Category Offer',
          status: d.is_active ? 'Active' : 'Scheduled',
          validFrom: d.valid_from ? new Date(d.valid_from).toISOString().split('T')[0] : '',
          validTo: d.valid_until ? new Date(d.valid_until).toISOString().split('T')[0] : '',
          coupon: d.code
        }));
        setOffers(mapped);
      }
    } catch (e) {
      console.error('Failed to fetch discounts from db', e);
    }
  };

  const openCreateModal = () => {
    setEditingId(null);
    setForm(emptyForm);
    setErrors({});
    setShowModal(true);
  };

  const openEditModal = (offer) => {
    setEditingId(offer.id);
    setForm({
      title: offer.title,
      discount: offer.discount,
      type: offer.type,
      status: offer.status,
      validFrom: offer.validFrom,
      validTo: offer.validTo,
      coupon: offer.coupon,
    });
    setErrors({});
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
    setForm(emptyForm);
    setErrors({});
  };

  const openDeleteModal = (id) => {
    setDeleteId(id);
  };

  const closeDeleteModal = () => {
    setDeleteId(null);
  };

  const confirmDelete = () => {
    if (deleteId === null) return;
    setOffers((prev) => prev.filter((offer) => offer.id !== deleteId));
    setDeleteId(null);
  };

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: '' }));
  };

  const validate = () => {
    const newErrors = {};

    if (!form.title.trim()) newErrors.title = 'Offer title is required';
    if (!form.discount.trim()) newErrors.discount = 'Discount value is required';
    if (!form.validFrom) newErrors.validFrom = 'Start date is required';
    if (!form.validTo) newErrors.validTo = 'End date is required';

    if (form.validFrom && form.validTo && form.validFrom > form.validTo) {
      newErrors.validTo = 'Valid To must be after Valid From';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    let discount_type = form.discount.includes('%') ? 'percentage' : 'fixed_amount';
    let discount_value = Number(form.discount.replace(/[^0-9.]/g, '')) || 0;

    const payload = {
      seller_id: getSellerId(),
      code: form.coupon || `COUPON${Date.now().toString().slice(-4)}`,
      discount_type,
      discount_value,
      valid_from: form.validFrom || null,
      valid_until: form.validTo || null,
      usage_limit: 100, // default limit
      // the extra fields which we altered the db to include
      title: form.title,
      offer_type: form.type,
      status: form.status
    };

    try {
      const method = editingId ? 'PUT' : 'POST';
      const url = editingId 
        ? `http://localhost:5000/api/discounts/${editingId}` 
        : 'http://localhost:5000/api/discounts';
        
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      
      if (!data.error) {
        fetchDiscounts();
        closeModal();
      } else {
        alert(data.error);
      }
    } catch (e) {
      console.error(e);
      alert('Failed to connect to database');
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-[#f8f8f8] min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Discounts & Offers</h1>
            <p className="text-sm text-gray-500 mt-1">
              Create Amazon-style attractive deals for your toy store.
            </p>
          </div>

          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white px-5 py-3 font-semibold shadow-md shadow-orange-100 transition"
          >
            <Plus size={18} />
            Create Discount
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
          <div className="bg-white rounded-[26px] border border-orange-100 p-5 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center">
              <Percent size={22} />
            </div>
            <p className="mt-4 text-sm text-gray-400 font-medium">Active Discounts</p>
            <h3 className="text-3xl font-bold text-gray-800 mt-1">{activeCount}</h3>
          </div>

          <div className="bg-white rounded-[26px] border border-orange-100 p-5 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center">
              <Ticket size={22} />
            </div>
            <p className="mt-4 text-sm text-gray-400 font-medium">Coupon Campaigns</p>
            <h3 className="text-3xl font-bold text-gray-800 mt-1">{couponCount}</h3>
          </div>

          <div className="bg-white rounded-[26px] border border-orange-100 p-5 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-green-100 text-green-600 flex items-center justify-center">
              <CalendarDays size={22} />
            </div>
            <p className="mt-4 text-sm text-gray-400 font-medium">Scheduled Offers</p>
            <h3 className="text-3xl font-bold text-gray-800 mt-1">{scheduledCount}</h3>
          </div>
        </div>

        <div className="bg-white rounded-[28px] border border-orange-100 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-orange-100">
            <h2 className="text-xl font-bold text-gray-800">Running Offers</h2>
          </div>

          <div className="divide-y divide-orange-50">
            {offers.length > 0 ? (
              offers.map((offer) => (
                <div
                  key={offer.id}
                  className="px-6 py-5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 hover:bg-orange-50/40 transition"
                >
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">{offer.title}</h3>
                    <p className="text-sm text-gray-500 mt-1">{offer.type}</p>
                    <p className="text-xs text-gray-400 mt-2">
                      {formatDateRange(offer.validFrom, offer.validTo)}
                    </p>
                    {offer.coupon && (
                      <p className="text-xs text-orange-600 font-semibold mt-2">
                        Coupon: {offer.coupon}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="px-3 py-1.5 rounded-full bg-orange-100 text-orange-600 text-sm font-bold">
                      {offer.discount}
                    </span>

                    <span
                      className={`px-3 py-1.5 rounded-full text-sm font-semibold ${
                        offer.status === 'Active'
                          ? 'bg-green-100 text-green-600'
                          : offer.status === 'Scheduled'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {offer.status}
                    </span>

                    <button
                      onClick={() => openEditModal(offer)}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-orange-200 text-orange-600 font-semibold hover:bg-orange-50 transition"
                    >
                      <Pencil size={15} />
                      Edit
                    </button>

                    <button
                      onClick={() => openDeleteModal(offer.id)}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-red-200 text-red-500 font-semibold hover:bg-red-50 transition"
                    >
                      <Trash2 size={15} />
                      Delete
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-6 py-10 text-center text-gray-500">
                No discounts available. Create your first offer.
              </div>
            )}
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px] p-3 sm:p-5 flex items-center justify-center">
          <div className="w-full max-w-4xl bg-white rounded-[28px] shadow-2xl border border-orange-100 overflow-hidden max-h-[92vh] flex flex-col">
            <div className="flex items-center justify-between px-5 sm:px-6 py-4 sm:py-5 border-b border-orange-100 bg-white">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
                  {editingId ? 'Edit Discount' : 'Create Discount'}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Fill the offer details correctly.
                </p>
              </div>

              <button
                onClick={closeModal}
                className="w-10 h-10 rounded-xl hover:bg-gray-100 flex items-center justify-center text-gray-500"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Field label="Offer Title" error={errors.title} full>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => handleChange('title', e.target.value)}
                    placeholder="Enter offer title"
                    className={inputClass}
                  />
                </Field>

                <Field label="Discount Value" error={errors.discount}>
                  <input
                    type="text"
                    value={form.discount}
                    onChange={(e) => handleChange('discount', e.target.value)}
                    placeholder="40% OFF / ₹200 OFF / B2G1"
                    className={inputClass}
                  />
                </Field>

                <Field label="Offer Type" error={errors.type}>
                  <select
                    value={form.type}
                    onChange={(e) => handleChange('type', e.target.value)}
                    className={inputClass}
                  >
                    <option>Category Offer</option>
                    <option>Combo Offer</option>
                    <option>Cart Offer</option>
                    <option>Product Offer</option>
                  </select>
                </Field>

                <Field label="Status" error={errors.status}>
                  <select
                    value={form.status}
                    onChange={(e) => handleChange('status', e.target.value)}
                    className={inputClass}
                  >
                    <option>Active</option>
                    <option>Scheduled</option>
                    <option>Expired</option>
                  </select>
                </Field>

                <Field label="Valid From" error={errors.validFrom}>
                  <input
                    type="date"
                    value={form.validFrom}
                    onChange={(e) => handleChange('validFrom', e.target.value)}
                    className={inputClass}
                  />
                </Field>

                <Field label="Valid To" error={errors.validTo}>
                  <input
                    type="date"
                    value={form.validTo}
                    onChange={(e) => handleChange('validTo', e.target.value)}
                    className={inputClass}
                  />
                </Field>

                <Field label="Coupon Code" error={errors.coupon} full>
                  <input
                    type="text"
                    value={form.coupon}
                    onChange={(e) => handleChange('coupon', e.target.value.toUpperCase())}
                    placeholder="Optional coupon code"
                    className={inputClass}
                  />
                </Field>
              </div>
            </div>

            <div className="px-5 sm:px-6 py-4 border-t border-orange-100 bg-white flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
              <button
                onClick={closeModal}
                className="px-5 py-3 rounded-2xl border border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition"
              >
                Cancel
              </button>

              <button
                onClick={handleSave}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-semibold shadow-md shadow-orange-100 transition"
              >
                <Save size={16} />
                {editingId ? 'Update Discount' : 'Save Discount'}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteId !== null && (
        <div className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-[2px] p-4 flex items-center justify-center">
          <div className="w-full max-w-md bg-white rounded-[28px] shadow-2xl border border-gray-100 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-5">
              <h3 className="text-2xl font-bold text-gray-900">Confirm Delete</h3>
              <button
                onClick={closeDeleteModal}
                className="w-10 h-10 rounded-xl hover:bg-gray-100 flex items-center justify-center text-gray-400 transition"
              >
                <X size={20} />
              </button>
            </div>

            <div className="px-6 pb-2">
              <p className="text-lg leading-8 text-gray-500">
                Are you sure you want to delete this offer? This action cannot be undone.
              </p>
            </div>

            <div className="px-6 py-6 flex flex-col sm:flex-row gap-4">
              <button
                onClick={closeDeleteModal}
                className="flex-1 rounded-2xl border border-gray-200 bg-white text-gray-700 font-semibold py-3.5 hover:bg-gray-50 transition"
              >
                Cancel
              </button>

              <button
                onClick={confirmDelete}
                className="flex-1 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3.5 transition shadow-sm"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}