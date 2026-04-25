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
import { formatImageUrl } from '../../context/StoreContext';

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

function ProductForm({ title, data, onChange, onToggle, onSave, onClose, saveLabel = 'Save', categoryOptions = [] }) {
  return (
    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 transition-all duration-300">
      <div className="bg-white w-full max-w-2xl max-h-[calc(100vh-40px)] md:max-h-[90vh] rounded-[2rem] shadow-2xl flex flex-col overflow-hidden animate-slide-up">
        
        {/* Header - Fixed at top */}
        <div className="flex-none flex items-center justify-between px-6 sm:px-8 py-5 border-b border-gray-50 bg-white">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{title}</h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">Please fill in all the required product details</p>
          </div>
          <button 
            onClick={onClose} 
            className="w-10 h-10 rounded-2xl bg-gray-50 text-gray-400 hover:bg-red-50 hover:text-red-500 flex items-center justify-center transition-all duration-200"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 bg-gray-50/30">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
            {/* Name - Full Width */}
            <div className="md:col-span-2">
              <label className="label">Product Name *</label>
              <input type="text" name="name" value={data.name} onChange={onChange} className="input" placeholder="e.g. Premium Teddy Bear" />
            </div>

            {/* Category */}
            <div className="w-full">
              <label className="label">Category *</label>
              <FilterDropdown name="category" value={data.category} options={categoryOptions} onChange={onChange} width="w-full" />
            </div>

            {/* Status */}
            <div className="w-full">
              <label className="label">Status</label>
              <FilterDropdown name="status" value={data.status} options={STATUSES} onChange={onChange} width="w-full" />
            </div>

            {/* Price */}
            <div>
              <label className="label">Price (₹) *</label>
              <input type="number" name="price" value={data.price} onChange={onChange} className="input" placeholder="0.00" />
            </div>

            {/* Original Price */}
            <div>
              <label className="label">Original Price (₹)</label>
              <input type="number" name="originalPrice" value={data.originalPrice} onChange={onChange} className="input" placeholder="MRP" />
            </div>

            {/* Stock */}
            <div>
              <label className="label">Stock Quantity *</label>
              <input type="number" name="stock" value={data.stock} onChange={onChange} className="input" placeholder="Units" />
            </div>

            {/* Rating */}
            <div>
              <label className="label">Initial Rating</label>
              <input type="number" step="0.1" min="0" max="5" name="rating" value={data.rating} onChange={onChange} className="input" placeholder="4.5" />
            </div>

            {/* Reviews count */}
            <div>
              <label className="label">Reviews Count</label>
              <input type="number" name="reviews" value={data.reviews} onChange={onChange} className="input" placeholder="0" />
            </div>

            {/* Sold */}
            <div>
              <label className="label">Items Sold</label>
              <input type="number" name="sold" value={data.sold} onChange={onChange} className="input" placeholder="0" />
            </div>

            {/* Badge */}
            <div className="w-full">
              <label className="label">Product Badge</label>
              <FilterDropdown name="badge" value={data.badge || ''} options={BADGES} onChange={onChange} width="w-full" placeholder="Select badge" />
            </div>

            {/* Age Group */}
            <div className="w-full">
              <label className="label">Age Group</label>
              <FilterDropdown name="ageGroup" value={data.ageGroup || ''} options={ AGE_GROUPS } onChange={onChange} width="w-full" placeholder="Select age group" />
            </div>

            {/* Brand */}
            <div>
              <label className="label">Brand</label>
              <input type="text" name="brand" value={data.brand || ''} onChange={onChange} className="input" placeholder="Brand name" />
            </div>

            {/* Material */}
            <div>
              <label className="label">Material</label>
              <input type="text" name="material" value={data.material || ''} onChange={onChange} className="input" placeholder="e.g. Cotton" />
            </div>

            {/* SKU */}
            <div className="md:col-span-2">
              <label className="label">SKU (Unique ID)</label>
              <input type="text" name="sku" value={data.sku || ''} onChange={onChange} className="input" placeholder="e.g. TOY-BEAR-01" />
            </div>

            {/* Image URL */}
            <div className="md:col-span-2">
              <label className="label">Image URL *</label>
              <div className="flex flex-col sm:flex-row gap-3">
                <input type="text" name="image" value={data.image} onChange={onChange} className="input flex-1" placeholder="https://example.com/image.jpg" />
                {data.image && (
                  <img src={formatImageUrl(data.image)} alt="Preview" className="w-12 h-12 rounded-xl object-cover border-2 border-orange-100 bg-white" onError={(e) => e.target.style.display = 'none'} />
                )}
              </div>
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="label">Product Description</label>
              <textarea name="description" value={data.description || ''} onChange={onChange} rows={3} className="input resize-none min-h-[100px]" placeholder="Detailed product information..." />
            </div>

            {/* Toggles */}
            <div className="md:col-span-2 flex flex-wrap gap-x-8 gap-y-4 py-4 px-1 bg-white rounded-2xl border border-gray-100 justify-around">
              <Toggle label="Featured Product" checked={!!data.featured} onChange={() => onToggle('featured')} />
              <Toggle label="Best Seller" checked={!!data.bestseller} onChange={() => onToggle('bestseller')} />
              <Toggle label="New Arrival" checked={!!data.newArrival} onChange={() => onToggle('newArrival')} />
            </div>
          </div>
          {/* Extra padding at bottom to ensure no content is hidden */}
          <div className="h-8" />
        </div>

        {/* Footer - Fixed at bottom */}
        <div className="flex-none px-6 sm:px-8 py-5 border-t border-gray-50 bg-white flex items-center justify-end gap-3">
          <button 
            onClick={onClose} 
            className="px-6 py-2.5 rounded-2xl font-bold text-gray-500 hover:bg-gray-100 transition-all active:scale-95"
          >
            Cancel
          </button>
          <button 
            onClick={onSave} 
            className="px-8 py-2.5 rounded-2xl font-bold text-white bg-orange-500 hover:bg-orange-600 shadow-lg shadow-orange-100 transition-all active:scale-95 flex items-center gap-2"
          >
            {saveLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

const NUM_FIELDS = ['price', 'originalPrice', 'stock', 'rating', 'reviews', 'sold'];

export default function Products() {
  const { products, categories, addProduct, updateProduct, deleteProduct } = useAdmin();
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [deleteId, setDeleteId] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const [editProduct, setEditProduct] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProduct, setNewProduct] = useState(EMPTY);



  const CATS = categories.map(c => c.name);
  const cats = ['All', ...CATS];

  const filtered = products.filter((p) => {
    const q = (search || '').toLowerCase();
    const matchQ = (p.name || '').toLowerCase().includes(q) || 
                   (p.id || '').toLowerCase().includes(q);
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
  };


  const handleEditSave = () => {
    if (!editProduct.name.trim() || !editProduct.image.trim()) {
      return;
    }

    updateProduct(editProduct);
    setShowEditModal(false);
    setEditProduct(null);
  };


  return (
    <div className="p-4 sm:p-6 page-enter">
      {deleteId && (
        <ConfirmModal
          open={!!deleteId}
          onClose={() => setDeleteId(null)}
          onConfirm={() => { deleteProduct(deleteId); setDeleteId(null); }}

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
          categoryOptions={CATS}
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
          categoryOptions={CATS}
        />
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
              {filtered.map((p) => {
                const productImage =
                  p.image ||
                  p.imageUrl ||
                  p.image_url ||
                  p.thumbnail ||
                  p.images?.[0] ||
                  p.image_urls?.[0] ||
                  p.gallery?.[0] ||
                  "/images/toy-placeholder.png";
                return (
                <tr key={p.id} className="table-row">
                  <td className="table-td">
                    <div className="flex items-center gap-3">
                      <img src={formatImageUrl(productImage)} alt={p.name} className="w-11 h-11 rounded-xl object-cover bg-orange-50 flex-none" onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/images/toy-placeholder.png'; }} />
                      <div>
                        <p className="font-medium text-gray-800">{p.name}</p>
                        <p className="text-xs text-gray-400">{p.displayId || p.id}</p>
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
                );
              })}
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
