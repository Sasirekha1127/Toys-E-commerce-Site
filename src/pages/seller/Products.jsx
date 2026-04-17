import React, { useEffect, useMemo, useState } from 'react';
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  X,
  Star,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
} from 'lucide-react';
import { sellerProducts as initialProducts } from '../../data/seller/index.js';

const STORAGE_KEY = 'toySellerProducts_v3';
const PAGE_SIZE = 5;

function fmt(n) {
  return new Intl.NumberFormat('en-IN').format(Number(n || 0));
}

function StatusBadge({ status }) {
  const map = {
    Active: 'badge-green',
    'In Stock': 'badge-green',
    'Low Stock': 'badge-orange',
    'Out of Stock': 'badge-red',
    Draft: 'badge-gray',
    Disabled: 'badge-red',
  };

  return (
    <span className={`badge ${map[status] || 'badge-gray'} whitespace-nowrap`}>
      {status}
    </span>
  );
}

const categories = ['Soft Toys', 'Educational Toys', 'Electronic Toys'];
const stockStatuses = ['All', 'Active', 'Low Stock', 'Out of Stock', 'Draft', 'Disabled'];
const sortOptions = [
  'Newest',
  'Price: Low to High',
  'Price: High to Low',
  'Stock: Low to High',
  'Stock: High to Low',
  'Name: A-Z',
];

const emptyForm = {
  name: '',
  category: 'Soft Toys',
  price: '',
  mrp: '',
  stock: '',
  sku: '',
  brand: '',
  ageGroup: '',
  material: '',
  status: 'Active',
  variant: false,
  linkedReviewId: '',
  image: '',
  gallery: '',
  description: '',
  featured: false,
  weight: '',
  length: '',
  breadth: '',
  height: '',
};

function getStockStatus(stock, forcedStatus) {
  if (forcedStatus === 'Draft' || forcedStatus === 'Disabled') return forcedStatus;
  const qty = Number(stock || 0);
  if (qty <= 0) return 'Out of Stock';
  if (qty <= 5) return 'Low Stock';
  return 'Active';
}

function normalizeProducts(list) {
  return list.map((item) => {
    const stock = Number(item.stock || 0);
    const price = Number(item.price || 0);
    const mrp = Number(item.mrp || item.price || 0);
    const manualStatus =
      item.status === 'Draft' || item.status === 'Disabled' ? item.status : null;

    const gallery = Array.isArray(item.gallery)
      ? item.gallery
      : typeof item.gallery === 'string' && item.gallery.trim()
      ? item.gallery.split(',').map((img) => img.trim()).filter(Boolean)
      : item.image
      ? [item.image]
      : [];

    return {
      ...item,
      price,
      mrp,
      stock,
      sku: item.sku || `SKU-${item.id || Date.now()}`,
      brand: item.brand || 'ToyStore',
      ageGroup: item.ageGroup || '',
      material: item.material || '',
      featured: Boolean(item.featured),
      variant: Boolean(item.variant),
      linkedReviewId: item.linkedReviewId || '',
      weight: item.weight ?? '',
      length: item.length ?? '',
      breadth: item.breadth ?? '',
      height: item.height ?? '',
      image: item.image || gallery[0] || '',
      gallery,
      status: getStockStatus(stock, manualStatus),
      rating: item.rating ?? 0,
      reviews: item.reviews ?? 0,
      description: item.description ?? '',
    };
  });
}

function getInitialProducts() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    if (Array.isArray(stored) && stored.length > 0) {
      return normalizeProducts(stored);
    }
  } catch {}

  const normalized = normalizeProducts(initialProducts);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
  return normalized;
}

export default function Products() {
  const [products, setProducts] = useState(() => getInitialProducts());
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [sortBy, setSortBy] = useState('Newest');
  const [currentPage, setCurrentPage] = useState(1);

  const [showFormPage, setShowFormPage] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [errors, setErrors] = useState({});

  const getSellerId = () => {
    try {
      const seller = JSON.parse(localStorage.getItem('toyCurrentSeller'));
      return seller?.id || 1;
    } catch {
      return 1;
    }
  };

  const fetchProducts = async () => {
    try {
      const sid = getSellerId();
      const res = await fetch(`http://localhost:5000/api/seller-products?seller_id=${sid}`);
      const data = await res.json();

      if (data.products) {
        const mapped = data.products.map((p) => ({
          id: p.id,
          name: p.title || '',
          category: p.category || 'Soft Toys',
          price: Number(p.price || 0),
          stock: Number(p.stock_quantity || 0),
          description: p.description || '',
          image: p.image_urls && p.image_urls.length > 0 ? p.image_urls[0] : '',
          gallery: p.image_urls || [],
          mrp: Number(p.mrp || p.price || 0),
          sku: p.sku || `SKU-${p.id}`,
          brand: p.brand || 'ToyStore',
          ageGroup: p.age_group || '',
          material: p.material || '',
          featured: Boolean(p.featured),
          variant: Boolean(p.variant_of_product),
          linkedReviewId: p.linked_review_id || '',
          weight: p.weight ?? '',
          length: p.length ?? '',
          breadth: p.breadth ?? '',
          height: p.height ?? '',
          status: p.product_status || getStockStatus(p.stock_quantity || 0, null),
          rating: 0,
          reviews: 0,
        }));

        setProducts(mapped);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(mapped));
      }
    } catch (e) {
      console.error('Error fetching products', e);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const stats = useMemo(() => {
    const total = products.length;
    const active = products.filter((p) => p.status === 'Active').length;
    const lowStock = products.filter((p) => p.status === 'Low Stock').length;
    const outOfStock = products.filter((p) => p.status === 'Out of Stock').length;
    return { total, active, lowStock, outOfStock };
  }, [products]);

  const filtered = useMemo(() => {
    let list = products.filter((p) => {
      const q = search.toLowerCase().trim();

      const matchSearch =
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q);

      const matchCat = filterCat === 'All' || p.category === filterCat;
      const matchStatus = filterStatus === 'All' || p.status === filterStatus;

      return matchSearch && matchCat && matchStatus;
    });

    switch (sortBy) {
      case 'Price: Low to High':
        list.sort((a, b) => a.price - b.price);
        break;
      case 'Price: High to Low':
        list.sort((a, b) => b.price - a.price);
        break;
      case 'Stock: Low to High':
        list.sort((a, b) => a.stock - b.stock);
        break;
      case 'Stock: High to Low':
        list.sort((a, b) => b.stock - a.stock);
        break;
      case 'Name: A-Z':
        list.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        list.sort((a, b) => String(b.id).localeCompare(String(a.id)));
        break;
    }

    return list;
  }, [products, search, filterCat, filterStatus, sortBy]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, filterCat, filterStatus, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, currentPage]);

  const resetForm = () => {
    setForm(emptyForm);
    setEditId(null);
    setErrors({});
  };

  const openAdd = () => {
    resetForm();
    setShowFormPage(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openEdit = (p) => {
    setForm({
      name: p.name || '',
      category: p.category || 'Soft Toys',
      price: String(p.price ?? ''),
      mrp: String(p.mrp ?? ''),
      stock: String(p.stock ?? ''),
      sku: p.sku || '',
      brand: p.brand || '',
      ageGroup: p.ageGroup || '',
      material: p.material || '',
      status: p.status || 'Active',
      variant: Boolean(p.variant),
      linkedReviewId: p.linkedReviewId || '',
      image: p.image || '',
      gallery: Array.isArray(p.gallery) ? p.gallery.join(', ') : '',
      description: p.description || '',
      featured: Boolean(p.featured),
      weight: String(p.weight ?? ''),
      length: String(p.length ?? ''),
      breadth: String(p.breadth ?? ''),
      height: String(p.height ?? ''),
    });

    setEditId(p.id);
    setErrors({});
    setShowFormPage(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const askDelete = (id) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setDeleteId(null);
    setShowDeleteModal(false);
  };

  const closeFormPage = () => {
    setShowFormPage(false);
    resetForm();
  };

  const validateForm = () => {
    const nextErrors = {};

    if (!form.name.trim()) nextErrors.name = 'Product name is required';
    if (!form.sku.trim()) nextErrors.sku = 'SKU is required';
    if (!form.brand.trim()) nextErrors.brand = 'Brand is required';
    if (!form.price || Number(form.price) <= 0) nextErrors.price = 'Enter valid selling price';
    if (form.mrp && Number(form.mrp) < Number(form.price)) {
      nextErrors.mrp = 'MRP should be greater than or equal to selling price';
    }
    if (form.stock === '' || Number(form.stock) < 0) nextErrors.stock = 'Enter valid stock';
    if (!form.image.trim()) nextErrors.image = 'Main image URL is required';

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    const stock = Number(form.stock);
    const price = Number(form.price);
    const mrp = Number(form.mrp || form.price);
    const gallery = form.gallery
      .split(',')
      .map((img) => img.trim())
      .filter(Boolean);

    const status = getStockStatus(stock, form.status);

    const payload = {
      seller_id: getSellerId(),
      title: form.name,
      category: form.category,
      price,
      mrp,
      stock_quantity: stock,
      sku: form.sku,
      brand: form.brand,
      age_group: form.ageGroup,
      material: form.material,
      image_urls: [form.image, ...gallery.filter((img) => img !== form.image)],
      description: form.description,
      featured: form.featured,
      product_status: status,
      variant_of_product: form.variant,
      linked_review_id: form.linkedReviewId || null,
      weight: form.weight === '' ? null : Number(form.weight),
      length: form.length === '' ? null : Number(form.length),
      breadth: form.breadth === '' ? null : Number(form.breadth),
      height: form.height === '' ? null : Number(form.height),
    };

    console.log("Sending Product Data:", payload);

    try {
      const url = editId
        ? `http://localhost:5000/api/seller-products/${editId}`
        : `http://localhost:5000/api/seller-products`;
      const method = editId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!data.error) {
        await fetchProducts();
        closeFormPage();
      } else {
        alert(data.error);
      }
    } catch (e) {
      console.error(e);
      alert('Failed to connect to database');
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;

    try {
      const res = await fetch(`http://localhost:5000/api/seller-products/${deleteId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        await fetchProducts();
      }
    } catch (e) {
      console.error(e);
    }

    closeDeleteModal();
  };

  const toggleFeatured = async (product) => {
    const payload = {
      title: product.name,
      description: product.description,
      price: product.price,
      stock_quantity: product.stock,
      category: product.category,
      image_urls: product.gallery?.length ? product.gallery : [product.image],
      mrp: product.mrp,
      sku: product.sku,
      brand: product.brand,
      age_group: product.ageGroup,
      material: product.material,
      featured: !product.featured,
      product_status: product.status,
      variant_of_product: product.variant,
      linked_review_id: product.linkedReviewId || null,
      weight: product.weight || null,
      length: product.length || null,
      breadth: product.breadth || null,
      height: product.height || null,
    };

    try {
      const res = await fetch(`http://localhost:5000/api/seller-products/${product.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        await fetchProducts();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const startItem = filtered.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const endItem = Math.min(currentPage * PAGE_SIZE, filtered.length);

  if (showFormPage) {
    return (
      <div className="p-4 sm:p-6 max-w-7xl mx-auto">
        <div className="card rounded-2xl border border-orange-100 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-white">
            <div className="flex items-center gap-3">
              <button
                onClick={closeFormPage}
                className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center hover:bg-gray-50"
              >
                <ArrowLeft size={18} />
              </button>
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  {editId ? 'Edit Product' : 'Add New Product'}
                </h3>
                <p className="text-sm text-gray-500">
                  Fill all product details below
                </p>
              </div>
            </div>

            <button
              onClick={closeFormPage}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400"
            >
              <X size={18} />
            </button>
          </div>

          <div className="p-5 sm:p-6 lg:p-8 space-y-8">
            {/* Basic Details */}
            <div className="space-y-4">
              <h4 className="text-base font-bold text-gray-900">Basic Details</h4>

              <div>
                <label className="label">Product Name</label>
                <input
                  className="input"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Teddy Bear"
                />
                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">Category</label>
                  <select
                    className="input"
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                  >
                    {categories.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="label">Brand</label>
                  <input
                    className="input"
                    value={form.brand}
                    onChange={(e) => setForm({ ...form, brand: e.target.value })}
                    placeholder="e.g. ToyStore"
                  />
                  {errors.brand && <p className="text-xs text-red-500 mt-1">{errors.brand}</p>}
                </div>

                <div>
                  <label className="label">Selling Price (₹)</label>
                  <input
                    className="input"
                    type="number"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    placeholder="1499"
                  />
                  {errors.price && <p className="text-xs text-red-500 mt-1">{errors.price}</p>}
                </div>

                <div>
                  <label className="label">MRP (₹)</label>
                  <input
                    className="input"
                    type="number"
                    value={form.mrp}
                    onChange={(e) => setForm({ ...form, mrp: e.target.value })}
                    placeholder="1999"
                  />
                  {errors.mrp && <p className="text-xs text-red-500 mt-1">{errors.mrp}</p>}
                </div>

                <div>
                  <label className="label">Stock Quantity</label>
                  <input
                    className="input"
                    type="number"
                    value={form.stock}
                    onChange={(e) => setForm({ ...form, stock: e.target.value })}
                    placeholder="50"
                  />
                  {errors.stock && <p className="text-xs text-red-500 mt-1">{errors.stock}</p>}
                </div>

                <div>
                  <label className="label">SKU</label>
                  <input
                    className="input"
                    value={form.sku}
                    onChange={(e) => setForm({ ...form, sku: e.target.value })}
                    placeholder="TOY-1001"
                  />
                  {errors.sku && <p className="text-xs text-red-500 mt-1">{errors.sku}</p>}
                </div>

                <div>
                  <label className="label">Age Group</label>
                  <input
                    className="input"
                    value={form.ageGroup}
                    onChange={(e) => setForm({ ...form, ageGroup: e.target.value })}
                    placeholder="3+ Years"
                  />
                </div>

                <div>
                  <label className="label">Material</label>
                  <input
                    className="input"
                    value={form.material}
                    onChange={(e) => setForm({ ...form, material: e.target.value })}
                    placeholder="Cotton / Plastic"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="label">Manual Status</label>
                  <select
                    className="input"
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                  >
                    <option value="Active">Auto / Active</option>
                    <option value="Draft">Draft</option>
                    <option value="Disabled">Disabled</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Variations */}
            <div className="space-y-4">
              <h4 className="text-base font-bold text-gray-900">Variations & Linking</h4>

              <label className="inline-flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.variant}
                  onChange={(e) => setForm({ ...form, variant: e.target.checked })}
                />
                <span className="text-sm text-gray-700">
                  This product is a variant of another product
                </span>
              </label>

              <div>
                <label className="label">Linked Review ID</label>
                <input
                  className="input"
                  value={form.linkedReviewId}
                  onChange={(e) => setForm({ ...form, linkedReviewId: e.target.value })}
                  placeholder="Optional"
                />
              </div>
            </div>

            {/* Images */}
            <div className="space-y-4">
              <h4 className="text-base font-bold text-gray-900">Images & Description</h4>

              <div>
                <label className="label">Main Image URL</label>
                <input
                  className="input"
                  value={form.image}
                  onChange={(e) => setForm({ ...form, image: e.target.value })}
                  placeholder="https://..."
                />
                {errors.image && <p className="text-xs text-red-500 mt-1">{errors.image}</p>}
              </div>

              <div>
                <label className="label">Gallery Image URLs</label>
                <input
                  className="input"
                  value={form.gallery}
                  onChange={(e) => setForm({ ...form, gallery: e.target.value })}
                  placeholder="https://img1.jpg, https://img2.jpg"
                />
                <p className="text-xs text-gray-400 mt-1">Use comma to add multiple image URLs</p>
              </div>

              <div>
                <label className="label">Description</label>
                <textarea
                  className="input min-h-[120px] resize-none"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Enter product description"
                />
              </div>

              <label className="inline-flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.featured}
                  onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                />
                <span className="text-sm font-medium text-gray-700">
                  Mark as featured product
                </span>
              </label>

              {form.image ? (
                <div className="rounded-2xl border border-orange-100 bg-orange-50/40 p-3">
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-white border border-orange-100">
                      <img
                        src={form.image}
                        alt="Preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">Image Preview</p>
                      <p className="text-xs text-gray-500">Main product image preview</p>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>

            {/* Dimensions */}
            <div className="space-y-4">
              <h4 className="text-base font-bold text-gray-900">Dimensions & Shipping (Optional)</h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="label">Weight (kg)</label>
                  <input
                    className="input"
                    type="number"
                    step="0.01"
                    value={form.weight}
                    onChange={(e) => setForm({ ...form, weight: e.target.value })}
                    placeholder="e.g. 1.5"
                  />
                </div>

                <div>
                  <label className="label">Length (cm)</label>
                  <input
                    className="input"
                    type="number"
                    step="0.01"
                    value={form.length}
                    onChange={(e) => setForm({ ...form, length: e.target.value })}
                    placeholder="e.g. 20"
                  />
                </div>

                <div>
                  <label className="label">Breadth (cm)</label>
                  <input
                    className="input"
                    type="number"
                    step="0.01"
                    value={form.breadth}
                    onChange={(e) => setForm({ ...form, breadth: e.target.value })}
                    placeholder="e.g. 15"
                  />
                </div>

                <div>
                  <label className="label">Height (cm)</label>
                  <input
                    className="input"
                    type="number"
                    step="0.01"
                    value={form.height}
                    onChange={(e) => setForm({ ...form, height: e.target.value })}
                    placeholder="e.g. 10"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3 px-5 py-4 border-t border-gray-100 bg-white">
            <button onClick={closeFormPage} className="btn-outline flex-1 justify-center">
              Cancel
            </button>

            <button onClick={handleSave} className="btn-primary flex-1 justify-center">
              {editId ? 'Save Changes' : 'Add Product'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-5 overflow-x-hidden">
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">My Products</h2>
          <p className="text-sm text-gray-500">{products.length} products in your shop</p>
        </div>

        <button onClick={openAdd} className="btn-primary">
          <Plus size={16} /> Add Product
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="card p-4 rounded-2xl">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Total</p>
          <h3 className="text-2xl font-bold text-gray-900 mt-2">{stats.total}</h3>
        </div>

        <div className="card p-4 rounded-2xl">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Active</p>
          <h3 className="text-2xl font-bold text-green-600 mt-2">{stats.active}</h3>
        </div>

        <div className="card p-4 rounded-2xl">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Low Stock</p>
          <h3 className="text-2xl font-bold text-orange-500 mt-2">{stats.lowStock}</h3>
        </div>

        <div className="card p-4 rounded-2xl">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Out of Stock</p>
          <h3 className="text-2xl font-bold text-red-500 mt-2">{stats.outOfStock}</h3>
        </div>
      </div>

      <div className="card p-4 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[220px]">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            className="input pl-9 w-full"
            placeholder="Search by name, SKU, brand..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          className="input w-full sm:w-[180px]"
          value={filterCat}
          onChange={(e) => setFilterCat(e.target.value)}
        >
          <option value="All">All Categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <select
          className="input w-full sm:w-[170px]"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          {stockStatuses.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        <select
          className="input w-full sm:w-[190px]"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          {sortOptions.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <div className="card overflow-hidden">
        <div className="w-full overflow-x-auto">
          <table className="w-full min-w-[980px] table-fixed">
            <thead className="bg-gray-50/60 border-b border-gray-100">
              <tr>
                <th className="table-th w-[30%]">Product</th>
                <th className="table-th w-[14%]">SKU</th>
                <th className="table-th w-[14%]">Category</th>
                <th className="table-th w-[12%] hidden xl:table-cell">Brand</th>
                <th className="table-th w-[10%]">Price</th>
                <th className="table-th w-[10%]">Stock</th>
                <th className="table-th w-[12%]">Status</th>
                <th className="table-th w-[12%] hidden xl:table-cell">Featured</th>
                <th className="table-th w-[12%] text-right">Actions</th>
              </tr>
            </thead>

            <tbody>
              {paginatedProducts.map((p) => (
                <tr key={p.id} className="table-row align-top">
                  <td className="table-td">
                    <div className="flex items-start gap-3 min-w-0">
                      <img
                        src={p.image}
                        alt={p.name}
                        className="w-12 h-12 rounded-xl object-cover bg-gray-100 flex-none"
                      />
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-800 truncate">{p.name}</p>
                        <div className="text-xs text-gray-400 mt-1 space-y-1">
                          <p className="truncate">{p.id}</p>
                          {p.ageGroup ? <p className="truncate">{p.ageGroup}</p> : null}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="table-td text-gray-600 font-medium break-words">{p.sku}</td>
                  <td className="table-td text-gray-500 break-words">{p.category}</td>
                  <td className="table-td hidden xl:table-cell text-gray-500 break-words">{p.brand}</td>
                  <td className="table-td font-semibold text-gray-800 whitespace-nowrap">₹{fmt(p.price)}</td>
                  <td className="table-td text-gray-700 whitespace-nowrap">{p.stock} units</td>
                  <td className="table-td"><StatusBadge status={p.status} /></td>

                  <td className="table-td hidden xl:table-cell">
                    <button
                      onClick={() => toggleFeatured(p)}
                      className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition whitespace-nowrap ${
                        p.featured
                          ? 'bg-orange-100 text-orange-600'
                          : 'bg-gray-100 text-gray-500 hover:bg-orange-50 hover:text-orange-500'
                      }`}
                    >
                      <Star size={13} className={p.featured ? 'fill-current' : ''} />
                      {p.featured ? 'Featured' : 'Mark'}
                    </button>
                  </td>

                  <td className="table-td text-right">
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => openEdit(p)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-orange-50 text-orange-500 hover:bg-orange-100 transition"
                      >
                        <Pencil size={14} />
                      </button>

                      <button
                        onClick={() => askDelete(p.id)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {paginatedProducts.length === 0 && (
                <tr>
                  <td colSpan={9} className="table-td text-center text-gray-400 py-10">
                    No products found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="border-t border-gray-100 px-5 py-3 bg-gray-50/40 flex items-center justify-between">
          <p className="text-xs text-gray-400">
            Showing {startItem} to {endItem} of {filtered.length} products
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-semibold bg-gray-100 text-gray-600 hover:bg-orange-50 hover:text-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              <ChevronLeft size={16} />
              Prev
            </button>

            <span className="text-sm font-semibold text-gray-600 px-2">
              {currentPage} / {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-semibold bg-gray-100 text-gray-600 hover:bg-orange-50 hover:text-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              Next
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-bold text-gray-900">Confirm Delete</h3>
              <button
                onClick={closeDeleteModal}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-sm text-gray-500 leading-6">
              Are you sure you want to delete this product? This action cannot be undone.
            </p>

            <div className="flex gap-3 mt-6">
              <button onClick={closeDeleteModal} className="btn-outline flex-1 justify-center">
                Cancel
              </button>

              <button
                onClick={confirmDelete}
                className="flex-1 justify-center inline-flex items-center rounded-xl px-4 py-2.5 font-semibold bg-orange-500 text-white hover:bg-orange-600 transition"
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