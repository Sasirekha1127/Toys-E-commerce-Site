import React, { useState, useRef, useEffect } from 'react';
import { Plus, Edit2, Trash2, Package, ChevronDown, Eye, EyeOff } from 'lucide-react';
import { StatusBadge, SectionHeader, ConfirmModal } from '../../components/admin/ui/index.jsx';
import { useAdmin } from '../../context/AdminContext';

function FilterDropdown({ value, options, onChange, width = 'w-full' }) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const h = (e) => { if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  return (
    <div ref={dropdownRef} className={`relative ${width}`}>
      <button type="button" onClick={() => setOpen(!open)}
        className={`w-full flex items-center justify-between rounded-xl border px-4 py-2.5 text-sm bg-white transition-all
        ${open ? 'border-orange-400 ring-2 ring-orange-100 text-orange-600' : 'border-gray-200 text-gray-600 hover:border-orange-300'}`}
      >
        <span>{value}</span>
        <ChevronDown size={16} className={`transition-transform duration-200 ${open ? 'rotate-180 text-orange-500' : 'text-gray-400'}`} />
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-2 w-full overflow-hidden rounded-xl border border-orange-100 bg-white shadow-lg z-50">
          {options.map((o) => (
            <button key={o} type="button" onClick={() => { onChange(o); setOpen(false); }}
              className={`w-full text-left px-4 py-2.5 text-sm transition-all ${value === o ? 'bg-orange-500 text-white' : 'text-gray-700 hover:bg-orange-50 hover:text-orange-600'}`}>
              {o}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

const EMPTY_CAT = { name: '', icon: '🧸', description: '', ageRange: '', active: true };

const ICONS = ['🧸', '🔬', '🤖', '🍼', '🎨', '🏗️', '🚗', '✈️', '⚽', '🎭', '🎲', '🎯', '🔭', '🎸', '🧩'];

export default function Categories() {
  const { categories, addCategory, updateCategory, deleteCategory, toggleCategoryVisibility, products } = useAdmin();
  const [showForm, setShowForm] = useState(false);
  const [editCat, setEditCat] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [form, setForm] = useState(EMPTY_CAT);
  const [toast, setToast] = useState('');

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 2500); };

  const openAdd = () => { setForm(EMPTY_CAT); setEditCat(null); setShowForm(true); };
  const openEdit = (c) => { setForm({ name: c.name, icon: c.icon, description: c.description, ageRange: c.ageRange, active: c.active }); setEditCat(c); setShowForm(true); };

  const handleSubmit = () => {
    if (!form.name.trim()) { showToast('Category name is required'); return; }
    if (editCat) {
      updateCategory({ ...editCat, ...form });
      showToast('Category updated ✓');
    } else {
      addCategory(form);
      showToast('Category added ✓');
    }
    setShowForm(false);
    setEditCat(null);
  };

  // Live product counts per category from admin state
  const getCatProductCount = (catName) => products.filter(p => p.category === catName).length;

  return (
    <div className="p-4 sm:p-6 page-enter">
      {toast && <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white text-sm px-5 py-3 rounded-2xl shadow-xl animate-slide-up">{toast}</div>}

      <ConfirmModal
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => { deleteCategory(deleteId); setDeleteId(null); showToast('Category deleted'); }}
        title="Delete Category?"
        description="This will remove the category. Products in this category won't be deleted."
      />

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-800">{editCat ? 'Edit Category' : 'Add Category'}</h2>
              <button onClick={() => setShowForm(false)} className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center transition">✕</button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="label">Category Name *</label>
                <input type="text" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="input" placeholder="e.g. Soft Toys" />
              </div>
              <div>
                <label className="label">Icon</label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {ICONS.map(ic => (
                    <button key={ic} type="button" onClick={() => setForm(p => ({ ...p, icon: ic }))}
                      className={`w-10 h-10 text-xl rounded-xl flex items-center justify-center transition-all ${form.icon === ic ? 'bg-orange-500 shadow-md scale-110' : 'bg-gray-100 hover:bg-orange-100'}`}
                    >{ic}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="label">Description</label>
                <input type="text" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} className="input" placeholder="Brief description" />
              </div>
              <div>
                <label className="label">Age Range</label>
                <input type="text" value={form.ageRange} onChange={e => setForm(p => ({ ...p, ageRange: e.target.value }))} className="input" placeholder="e.g. 3-8 yrs" />
              </div>
              <label className="flex items-center gap-3 cursor-pointer">
                <div onClick={() => setForm(p => ({ ...p, active: !p.active }))}
                  className={`w-10 h-5 rounded-full relative transition-all ${form.active ? 'bg-orange-500' : 'bg-gray-200'}`}>
                  <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all ${form.active ? 'left-5' : 'left-0.5'}`} />
                </div>
                <span className="text-sm text-gray-600">Visible to customers</span>
              </label>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
              <button onClick={() => setShowForm(false)} className="btn-outline">Cancel</button>
              <button onClick={handleSubmit} className="btn-primary">{editCat ? 'Save Changes' : 'Add Category'}</button>
            </div>
          </div>
        </div>
      )}

      <SectionHeader
        title="Categories"
        subtitle={`${categories.length} categories`}
        action={<button className="btn-primary" onClick={openAdd}><Plus size={16} /> Add Category</button>}
      />

      {/* Summary badges */}
      <div className="flex gap-2 flex-wrap mb-5">
        <span className="badge badge-green">{categories.filter(c => c.active).length} Visible</span>
        <span className="badge badge-gray">{categories.filter(c => !c.active).length} Hidden</span>
        <span className="badge badge-orange">{categories.length} Total</span>
      </div>

      {/* Category Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((c) => (
          <div key={c.id} className={`card p-5 transition-all hover:-translate-y-0.5 hover:shadow-lg ${!c.active ? 'opacity-60' : ''}`}>
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center text-2xl">{c.icon}</div>
                <div>
                  <p className="font-semibold text-gray-800">{c.name}</p>
                  <p className="text-xs text-gray-400">{c.ageRange}</p>
                </div>
              </div>
              <StatusBadge status={c.active ? 'Active' : 'Inactive'} />
            </div>

            <p className="text-sm text-gray-500 mb-3 line-clamp-2">{c.description}</p>

            <div className="flex items-center gap-2 p-2.5 bg-orange-50 rounded-xl mb-4">
              <Package size={14} className="text-orange-500" />
              <span className="text-sm font-semibold text-orange-700">{getCatProductCount(c.name)} products</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => toggleCategoryVisibility(c.id)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-medium transition-all border
                ${c.active ? 'border-gray-200 text-gray-600 hover:bg-gray-50' : 'border-orange-200 text-orange-600 hover:bg-orange-50'}`}
              >
                {c.active ? <><EyeOff size={14} /> Hide</> : <><Eye size={14} /> Show</>}
              </button>
              <button onClick={() => openEdit(c)} className="p-2 rounded-xl border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all">
                <Edit2 size={15} className="text-blue-500" />
              </button>
              <button onClick={() => setDeleteId(c.id)} className="p-2 rounded-xl border border-gray-200 hover:border-red-300 hover:bg-red-50 transition-all">
                <Trash2 size={15} className="text-red-500" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
