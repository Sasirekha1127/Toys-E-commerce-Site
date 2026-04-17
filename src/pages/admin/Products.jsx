import React, { useState, useRef, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, ChevronDown, Star, Package } from 'lucide-react';
import {
  StatusBadge,
  StarRating,
  SearchBar,
  SectionHeader,
  ConfirmModal,
} from '../../components/admin/ui/index.jsx';
import { useAdmin } from '../../context/AdminContext';

function FilterDropdown({ value, options, onChange, width = 'w-48', name, placeholder }) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const h = (e) => { if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  return (
    <div ref={dropdownRef} className={`relative ${width}`}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`w-full flex items-center justify-between text-sm border rounded-xl px-4 py-2.5 bg-white transition-all
        ${open ? 'border-orange-400 ring-2 ring-orange-100 text-orange-600' : 'border-gray-200 text-gray-600 hover:border-orange-300'}`}
      >
        <span className={`truncate ${value ? '' : 'text-gray-400'}`}>{value || placeholder || 'Select'}</span>
        <ChevronDown size={16} className={`transition-transform duration-200 ${open ? 'rotate-180 text-orange-500' : 'text-gray-400'}`} />
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-2 w-full bg-white border border-orange-100 rounded-xl shadow-lg z-50 overflow-hidden">
          {options.map((option) => (
            <button key={option} type="button"
              onClick={() => {
                if (name) onChange({ target: { name, value: option } });
                else onChange(option);
                setOpen(false);
              }}
              className={`w-full text-left px-4 py-2.5 text-sm transition-all ${value === option ? 'bg-orange-500 text-white' : 'text-gray-700 hover:bg-orange-50 hover:text-orange-600'}`}
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

const EMPTY = {
  name: '', category: 'Soft Toys', price: '', originalPrice: '', stock: '',
  rating: '', reviews: '', status: 'Active', image: '', sold: 0,
  badge: '', description: '', sku: '', brand: '', material: '', ageGroup: '',
  featured: false, bestseller: false, newArrival: false,
};

const CATS = ['Soft Toys', 'Educational Toys', 'Electronic Toys'];
const STATUSES = ['Active', 'Out of Stock'];
const AGE_GROUPS = ['0-2 years', '3-5 years', '6-8 years', '9-12 years', '12+ years'];
const BADGES = ['', 'Best Seller', 'New Arrival', 'Hot Deal', 'Limited Edition', 'Trending'];

function Toggle({ label, checked, onChange }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer select-none">
      <div
        onClick={onChange}
        className={`w-10 h-5 rounded-full relative transition-all duration-200 ${checked ? 'bg-orange-500' : 'bg-gray-200'}`}
      >
        <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-200 ${checked ? 'left-5' : 'left-0.5'}`} />
      </div>
      <span className="text-sm text-gray-600">{label}</span>
    </label>
  );
}

function ProductForm({ title, data, onChange, onToggle, onSave, onClose, saveLabel = 'Save' }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4">
      <div className="bg-white w-full max-w-2xl max-h-[90vh] rounded-3xl shadow-2xl flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-bold text-gray-800">{title}</h2>
            <p className="text-sm text-gray-400 mt-0.5">Fill in product details</p>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center transition">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto">
          {/* Name */}
          <div className="md:col-span-2">
            <label className="label">Product Name *</label>
            <input type="text" name="name" value={data.name} onChange={onChange} className="input" placeholder="Enter product name" />
          </div>

          {/* Category */}
          <div>
            <label className="label">Category *</label>
            <FilterDropdown name="category" value={data.category} options={CATS} onChange={onChange} width="w-full" />
          </div>

          {/* Status */}
          <div>
            <label className="label">Status</label>
            <FilterDropdown name="status" value={data.status} options={STATUSES} onChange={onChange} width="w-full" />
          </div>

          {/* Price */}
          <div>
            <label className="label">Price (₹) *</label>
            <input type="number" name="price" value={data.price} onChange={onChange} className="input" placeholder="e.g. 999" />
          </div>

          {/* Original Price */}
          <div>
            <label className="label">Original Price (₹)</label>
            <input type="number" name="originalPrice" value={data.originalPrice} onChange={onChange} className="input" placeholder="MRP / crossed price" />
          </div>

          {/* Stock */}
          <div>
            <label className="label">Stock *</label>
            <input type="number" name="stock" value={data.stock} onChange={onChange} className="input" placeholder="Units available" />
          </div>

          {/* Rating */}
          <div>
            <label className="label">Rating</label>
            <input type="number" step="0.1" min="0" max="5" name="rating" value={data.rating} onChange={onChange} className="input" placeholder="4.5" />
          </div>

          {/* Reviews count */}
          <div>
            <label className="label">Reviews Count</label>
            <input type="number" name="reviews" value={data.reviews} onChange={onChange} className="input" placeholder="0" />
          </div>

          {/* Sold */}
          <div>
            <label className="label">Sold</label>
            <input type="number" name="sold" value={data.sold} onChange={onChange} className="input" placeholder="0" />
          </div>

          {/* Badge */}
          <div>
            <label className="label">Badge</label>
            <FilterDropdown name="badge" value={data.badge || ''} options={BADGES} onChange={onChange} width="w-full" placeholder="No badge" />
          </div>

          {/* Age Group */}
          <div>
            <label className="label">Age Group</label>
            <FilterDropdown name="ageGroup" value={data.ageGroup || ''} options={AGE_GROUPS} onChange={onChange} width="w-full" placeholder="Select age group" />
          </div>

          {/* Brand */}
          <div>
            <label className="label">Brand</label>
            <input type="text" name="brand" value={data.brand || ''} onChange={onChange} className="input" placeholder="Brand name" />
          </div>

          {/* Material */}
          <div>
            <label className="label">Material</label>
            <input type="text" name="material" value={data.material || ''} onChange={onChange} className="input" placeholder="e.g. Cotton, Plastic" />
          </div>

          {/* SKU */}
          <div>
            <label className="label">SKU</label>
            <input type="text" name="sku" value={data.sku || ''} onChange={onChange} className="input" placeholder="Stock keeping unit" />
          </div>

          {/* Image URL */}
          <div className="md:col-span-2">
            <label className="label">Image URL *</label>
            <input type="text" name="image" value={data.image} onChange={onChange} className="input" placeholder="Paste image URL" />
            {data.image && (
              <img src={data.image} alt="preview" className="mt-2 w-16 h-16 rounded-xl object-cover border border-gray-200" onError={(e) => e.target.style.display = 'none'} />
            )}
          </div>

          {/* Description */}
          <div className="md:col-span-2">
            <label className="label">Description</label>
            <textarea name="description" value={data.description || ''} onChange={onChange} rows={3} className="input resize-none" placeholder="Product description" />
          </div>

          {/* Toggles */}
          <div className="md:col-span-2 flex flex-wrap gap-5 pt-2">
            <Toggle label="Featured" checked={!!data.featured} onChange={() => onToggle('featured')} />
            <Toggle label="Best Seller" checked={!!data.bestseller} onChange={() => onToggle('bestseller')} />
            <Toggle label="New Arrival" checked={!!data.newArrival} onChange={() => onToggle('newArrival')} />
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-3">
          <button onClick={onClose} className="btn-outline">Cancel</button>
          <button onClick={onSave} className="btn-primary">{saveLabel}</button>
        </div>
      </div>
    </div>
  );
}

const NUM_FIELDS = ['price', 'originalPrice', 'stock', 'rating', 'reviews', 'sold'];

export default function Products() {
  const { products, addProduct, updateProduct, deleteProduct } = useAdmin();
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [deleteId, setDeleteId] = useState(null);
  const [toastMsg, setToastMsg] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProduct, setNewProduct] = useState(EMPTY);

  const toast = (msg) => { setToastMsg(msg); setTimeout(() => setToastMsg(''), 2500); };

  const cats = ['All', ...new Set(products.map((p) => p.category))];

  const filtered = products.filter((p) => {
    const q = search.toLowerCase();
    const matchQ = p.name.toLowerCase().includes(q) || p.id.toLowerCase().includes(q);
    const matchCat = filterCat === 'All' || p.category === filterCat;
    const matchStatus = filterStatus === 'All' || p.status === filterStatus;
    return matchQ && matchCat && matchStatus;
  });

  const getStockBadge = (stock) => {
    if (stock === 0) return 'Out of Stock';
    if (stock <= 8) return 'Low Stock';
    return 'In Stock';
  };

  const makeChangeHandler = (setter) => (e) => {
    const { name, value } = e.target;
    setter((prev) => ({
      ...prev,
      [name]: NUM_FIELDS.includes(name) ? (value === '' ? '' : Number(value)) : value,
    }));
  };

  const makeToggleHandler = (setter) => (field) => {
    setter((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleAddProduct = () => {
    if (!newProduct.name.trim() || !newProduct.image.trim() || newProduct.price === '' || newProduct.stock === '') {
      toast('Please fill all required fields');
      return;
    }
    addProduct({
      ...newProduct,
      price: Number(newProduct.price),
      stock: Number(newProduct.stock),
      rating: Number(newProduct.rating || 0),
      reviews: Number(newProduct.reviews || 0),
      sold: Number(newProduct.sold || 0),
    });
    setShowAddModal(false);
    setNewProduct(EMPTY);
    toast('Product added successfully ✓');
  };

  const handleEditSave = () => {
    if (!editProduct.name.trim() || !editProduct.image.trim()) {
      toast('Please fill all required fields');
      return;
    }
    updateProduct(editProduct);
    setShowEditModal(false);
    setEditProduct(null);
    toast('Product updated successfully ✓');
  };

  return (
    <div className="p-4 sm:p-6 page-enter">
      {deleteId && (
        <ConfirmModal
          open={!!deleteId}
          onClose={() => setDeleteId(null)}
          onConfirm={() => { deleteProduct(deleteId); setDeleteId(null); toast('Product deleted'); }}
          title="Delete Product?"
          description="This action cannot be undone. The product will be permanently removed."
        />
      )}

      {showAddModal && (
        <ProductForm
          title="Add Product"
          data={newProduct}
          onChange={makeChangeHandler(setNewProduct)}
          onToggle={makeToggleHandler(setNewProduct)}
          onSave={handleAddProduct}
          onClose={() => { setShowAddModal(false); setNewProduct(EMPTY); }}
          saveLabel="Add Product"
        />
      )}

      {showEditModal && editProduct && (
        <ProductForm
          title="Edit Product"
          data={editProduct}
          onChange={makeChangeHandler(setEditProduct)}
          onToggle={makeToggleHandler(setEditProduct)}
          onSave={handleEditSave}
          onClose={() => { setShowEditModal(false); setEditProduct(null); }}
          saveLabel="Save Changes"
        />
      )}

      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white text-sm font-medium px-5 py-3 rounded-2xl shadow-xl animate-slide-up">
          {toastMsg}
        </div>
      )}

      <SectionHeader
        title="Products"
        subtitle={`${filtered.length} products found`}
        action={
          <button className="btn-primary" onClick={() => { setShowAddModal(true); setNewProduct(EMPTY); }}>
            <Plus size={16} /> Add Product
          </button>
        }
      />

      <div className="flex flex-wrap gap-3 mb-5">
        <SearchBar value={search} onChange={setSearch} placeholder="Search products…" />
        <FilterDropdown value={filterCat} options={cats} onChange={setFilterCat} width="w-52" />
        <FilterDropdown value={filterStatus} options={['All', 'Active', 'Out of Stock']} onChange={setFilterStatus} width="w-44" />
        <div className="flex gap-2 ml-auto">
          <span className="badge badge-green">{products.filter((p) => p.status === 'Active').length} Active</span>
          <span className="badge badge-red">{products.filter((p) => p.status === 'Out of Stock').length} Out of Stock</span>
          <span className="badge badge-orange">{products.filter((p) => p.stock > 0 && p.stock <= 8).length} Low Stock</span>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50/70">
              <tr>
                {['Product', 'Category', 'Price', 'Stock', 'Rating', 'Badges', 'Status', 'Actions'].map((h) => (
                  <th key={h} className="table-th whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((p) => (
                <tr key={p.id} className="table-row">
                  <td className="table-td">
                    <div className="flex items-center gap-3">
                      <img src={p.image} alt={p.name} className="w-11 h-11 rounded-xl object-cover bg-orange-50 flex-none" />
                      <div>
                        <p className="font-medium text-gray-800">{p.name}</p>
                        <p className="text-xs text-gray-400">{p.id}</p>
                        {p.sku && <p className="text-[10px] text-gray-300">SKU: {p.sku}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="table-td">
                    <span className="badge badge-orange">{p.category.replace(' Toys', '')}</span>
                  </td>
                  <td className="table-td">
                    <div>
                      <p className="font-semibold text-gray-900">₹{Number(p.price).toLocaleString('en-IN')}</p>
                      {p.originalPrice && <p className="text-xs text-gray-400 line-through">₹{Number(p.originalPrice).toLocaleString('en-IN')}</p>}
                    </div>
                  </td>
                  <td className="table-td">
                    <div className="flex flex-col gap-1">
                      <StatusBadge status={getStockBadge(p.stock)} />
                      <span className="text-xs text-gray-400">{p.stock} units</span>
                    </div>
                  </td>
                  <td className="table-td"><StarRating rating={p.rating || 0} /></td>
                  <td className="table-td">
                    <div className="flex flex-col gap-0.5">
                      {p.badge && <span className="badge badge-orange text-[10px]">{p.badge}</span>}
                      {p.featured && <span className="badge badge-blue text-[10px]">Featured</span>}
                      {p.newArrival && <span className="badge badge-green text-[10px]">New</span>}
                    </div>
                  </td>
                  <td className="table-td"><StatusBadge status={p.status} /></td>
                  <td className="table-td">
                    <div className="flex gap-1.5">
                      <button className="btn-ghost p-2 rounded-lg" onClick={() => { setEditProduct({ ...p }); setShowEditModal(true); }} title="Edit">
                        <Edit2 size={15} className="text-blue-500" />
                      </button>
                      <button className="btn-danger p-2 rounded-lg" onClick={() => setDeleteId(p.id)} title="Delete">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="py-16 text-center">
              <p className="text-4xl mb-3">📦</p>
              <p className="text-gray-500">No products match your filters</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
