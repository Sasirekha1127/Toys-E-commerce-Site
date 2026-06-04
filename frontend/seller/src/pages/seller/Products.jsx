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

const PAGE_SIZE = 5;

function fmt(n) {
  return new Intl.NumberFormat('en-IN').format(Number(n || 0));
}

function fmtValue(val, suffix = '') {
  if (val === null || val === undefined || val === '') return '—';
  return `${val}${suffix}`;
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

const categories = ['Soft Toys', 'Educational Toys', 'Electronic Toys', 'Wooden Toys'];
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
  brand: 'ToyStore',
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
  weightUnit: 'kg',
  length: '',
  breadth: '',
  height: '',
  variants: [], // Array of { variant_name, variant_value, sku, price, stock_quantity, weight, weight_unit }
  mainFile: null,
  galleryFiles: [],
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
      weightUnit: item.weight_unit || 'kg',
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

function getInitialMockProducts() {
  return normalizeProducts(initialProducts);
}

export default function Products() {
  const currentSeller = useMemo(() => JSON.parse(localStorage.getItem('toyCurrentSeller') || '{}'), []);
  const isDemo = currentSeller?.email === 'kidstoys@gmail.com';

  const [products, setProducts] = useState(() => isDemo ? getInitialMockProducts() : []);
  const [loading, setLoading] = useState(!isDemo);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [sortBy, setSortBy] = useState('Newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedId, setExpandedId] = useState(null);


  const [showFormPage, setShowFormPage] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [errors, setErrors] = useState({});

  const fetchProducts = async () => {
    if (isDemo || !currentSeller?.id) {
      setLoading(false);
      return;
    };

    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/seller-products?seller_id=${currentSeller.id}`);
      const data = await res.json();

      if (data.products) {
        const mapped = data.products.map((p) => ({
          id: p.id,
          name: p.title || '',
          category: p.category || 'Soft Toys',
          price: Number(p.price || 0),
          stock: Number(p.stock_quantity || 0),
          description: p.description || '',
          image: p.image_url || (p.image_urls && p.image_urls.length > 0 ? p.image_urls[0] : ''),
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
          weightUnit: p.weight_unit || 'kg',
          length: p.length ?? '',
          breadth: p.breadth ?? '',
          height: p.height ?? '',
          status: p.product_status || getStockStatus(p.stock_quantity || 0, null),
          rating: 0,
          reviews: 0,
          variants: (p.variants || []).map(v => ({...v, weight_unit: v.weight_unit || 'kg'})), // Enforce weight_unit on variants
          additional_images: p.additional_images || [], // Nested images from API
        }));

        setProducts(mapped);
      }
    } catch (e) {
      console.error('Error fetching products', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [currentSeller?.id, isDemo]);

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
      weightUnit: p.weightUnit || 'kg',
      length: String(p.length ?? ''),
      breadth: String(p.breadth ?? ''),
      height: String(p.height ?? ''),
      variants: (p.variants || []).map(v => ({...v, image: v.image || '', weight_unit: v.weight_unit || 'kg'})),
      mainFile: null,
      galleryFiles: [],
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

  const addVariant = () => {
    setForm((f) => ({
      ...f,
      variants: [
        ...f.variants,
        {
          variant_name: '',
          variant_value: '',
          sku: `${f.sku}-VAR-${f.variants.length + 1}`,
          price: f.price,
          stock_quantity: '0',
          weight: f.weight,
          weight_unit: f.weightUnit || 'kg',
          image: ''
        }
      ]
    }));
  };

  const removeVariant = (index) => {
    setForm((f) => ({
      ...f,
      variants: f.variants.filter((_, i) => i !== index)
    }));
  };

  const updateVariant = (index, key, val) => {
    setForm((f) => {
      const next = [...f.variants];
      next[index] = { ...next[index], [key]: val };
      return { ...f, variants: next };
    });
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
    if (!form.image.trim() && !form.mainFile) nextErrors.image = 'Main image (URL or file) is required';

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    const cleanNum = (val) => {
      if (!val || val === '') return 0;
      return Number(String(val).replace(/[₹$,\s]/g, '')) || 0;
    };

    const stock = Number(form.stock);
    const price = cleanNum(form.price);
    const mrp = cleanNum(form.mrp || form.price);
    const gallery = form.gallery
      .split(',')
      .map((img) => img.trim())
      .filter(Boolean);

    const status = getStockStatus(stock, form.status);

    const formData = new FormData();
    formData.append('seller_id', currentSeller.id);
    formData.append('title', form.name);
    formData.append('category', form.category);
    formData.append('price', price);
    formData.append('mrp', mrp);
    formData.append('stock_quantity', stock);
    formData.append('sku', form.sku);
    formData.append('brand', form.brand);
    formData.append('age_group', form.ageGroup);
    formData.append('material', form.material);
    formData.append('description', form.description);
    formData.append('featured', form.featured);
    formData.append('product_status', status);
    formData.append('variant_of_product', form.variant);
    formData.append('linked_review_id', form.linkedReviewId || '');
    formData.append('weight', form.weight === '' ? null : Number(form.weight));
    formData.append('weight_unit', form.weightUnit || 'kg');
    formData.append('length', form.length === '' ? null : Number(form.length));
    formData.append('breadth', form.breadth === '' ? null : Number(form.breadth));
    formData.append('height', form.height === '' ? null : Number(form.height));

    // Handle string image URLs as fallback
    formData.append('image_urls', JSON.stringify([form.image, ...gallery.filter((img) => img !== form.image)]));

    // Variants and Additional Images must be stringified for FormData
    formData.append('variants', JSON.stringify(form.variants.map(v => ({
      ...v,
      price: Number(v.price) || price,
      stock_quantity: Number(v.stock_quantity) || 0,
      weight: v.weight === '' ? null : Number(v.weight),
      weight_unit: v.weight_unit || 'kg'
    }))));

    const additional_images = [
      { url: form.image, alt: form.name, is_primary: true, sort_order: 0, image_type: 'main' },
      ...gallery
        .filter(url => url !== form.image)
        .map((url, i) => ({
          url: url,
          alt: form.name,
          is_primary: false,
          sort_order: i + 1,
          image_type: 'gallery'
        })),
      ...form.variants
        .filter(v => v.image && v.image.trim() !== '')
        .map((v, i) => ({
          url: v.image,
          alt: `${form.name} - ${v.variant_name} ${v.variant_value}`.trim(),
          is_primary: false,
          sort_order: gallery.length + i + 1,
          image_type: 'variant',
          variant_reference: v.sku || v.variant_name
        }))
    ];
    formData.append('additional_images', JSON.stringify(additional_images));

    // ── Append Files ──
    if (form.mainFile) {
      formData.append('main_image', form.mainFile);
    }
    if (form.galleryFiles && form.galleryFiles.length > 0) {
      form.galleryFiles.forEach((file) => {
        formData.append('gallery_images', file);
      });
    }

    try {
      const url = editId
        ? `http://localhost:5000/api/seller-products/${editId}`
        : `http://localhost:5000/api/seller-products`;
      const method = editId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        body: formData, // No Content-Type header needed for FormData
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
                  This product has multiple variants (Size, Color, etc.)
                </span>
              </label>

              {form.variant && (
                <div className="space-y-4 pt-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-gray-700">Product Variants</p>
                    <button
                      type="button"
                      onClick={addVariant}
                      className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1"
                    >
                      <Plus size={14} /> Add Variant
                    </button>
                  </div>

                  <div className="space-y-3">
                    {form.variants.map((v, idx) => (
                      <div key={idx} className="p-4 rounded-2xl border border-gray-100 bg-gray-50/50 relative group">
                        <button
                          type="button"
                          onClick={() => removeVariant(idx)}
                          className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow-sm"
                        >
                          <X size={12} />
                        </button>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          <div>
                            <label className="text-[10px] font-bold text-gray-400 uppercase">Name (e.g. Size)</label>
                            <input
                              className="input text-sm py-1.5"
                              value={v.variant_name}
                              onChange={(e) => updateVariant(idx, 'variant_name', e.target.value)}
                              placeholder="Size"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-gray-400 uppercase">Value (e.g. XL)</label>
                            <input
                              className="input text-sm py-1.5"
                              value={v.variant_value}
                              onChange={(e) => updateVariant(idx, 'variant_value', e.target.value)}
                              placeholder="XL"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-gray-400 uppercase">SKU</label>
                            <input
                              className="input text-sm py-1.5"
                              value={v.sku}
                              onChange={(e) => updateVariant(idx, 'sku', e.target.value)}
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-gray-400 uppercase">Price (₹)</label>
                            <input
                              className="input text-sm py-1.5"
                              type="number"
                              value={v.price}
                              onChange={(e) => updateVariant(idx, 'price', e.target.value)}
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-gray-400 uppercase">Stock</label>
                            <input
                              className="input text-sm py-1.5"
                              type="number"
                              value={v.stock_quantity}
                              onChange={(e) => updateVariant(idx, 'stock_quantity', e.target.value)}
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-gray-400 uppercase">Weight</label>
                            <div className="flex gap-1.5">
                              <input
                                className="input text-sm py-1.5 flex-1"
                                type="number"
                                step="0.01"
                                value={v.weight}
                                onChange={(e) => updateVariant(idx, 'weight', e.target.value)}
                                placeholder="0.0"
                              />
                              <select
                                className="w-12 rounded-xl border border-orange-200 bg-white px-1 py-1.5 text-[10px] text-gray-800 outline-none transition focus:border-orange-300 focus:ring-4 focus:ring-orange-100"
                                value={v.weight_unit || 'kg'}
                                onChange={(e) => updateVariant(idx, 'weight_unit', e.target.value)}
                              >
                                <option value="kg">kg</option>
                                <option value="g">g</option>
                              </select>
                            </div>
                          </div>
                          <div className="sm:col-span-2 lg:col-span-3">
                            <label className="text-[10px] font-bold text-gray-400 uppercase">Image URL (Optional)</label>
                            <input
                              className="input text-sm py-1.5"
                              value={v.image || ''}
                              onChange={(e) => updateVariant(idx, 'image', e.target.value)}
                              placeholder="Image link for this variant"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                    {form.variants.length === 0 && (
                      <div className="text-center py-6 border-2 border-dashed border-gray-100 rounded-2xl">
                        <p className="text-xs text-gray-400">No variants added yet. Click "Add Variant" to start.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="pt-2">
                <label className="label">Linked Review ID</label>
                <input
                  className="input"
                  value={form.linkedReviewId}
                  onChange={(e) => setForm({ ...form, linkedReviewId: e.target.value })}
                  placeholder="Optional"
                />
              </div>
            </div>

            <div className="space-y-8">
              <div className="space-y-6">
                <h4 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-2">Product Media</h4>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Main Image Selection */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-semibold text-gray-700">Main Display Image</label>
                      <span className="text-[10px] bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full font-bold uppercase">Required</span>
                    </div>

                    <div className="space-y-3">
                      {/* File Upload Option */}
                      <div className="flex items-center gap-4">
                        <label className="flex-1 cursor-pointer">
                          <div className={`border-2 border-dashed rounded-2xl p-6 transition-all flex flex-col items-center justify-center gap-2 ${form.mainFile ? 'border-orange-400 bg-orange-50' : 'border-gray-200 bg-gray-50 hover:border-orange-200 hover:bg-orange-50/30'}`}>
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${form.mainFile ? 'bg-orange-500 text-white' : 'bg-white text-gray-400 shadow-sm'}`}>
                               <Plus size={20} />
                            </div>
                            <span className="text-sm font-medium text-gray-600">{form.mainFile ? 'Change Image' : 'Click to Upload Image'}</span>
                            <span className="text-[10px] text-gray-400">JPG, PNG, WEBP (Max 5MB)</span>
                            <input 
                              type="file" 
                              className="hidden" 
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files[0];
                                if (file) setForm({ ...form, mainFile: file });
                              }}
                            />
                          </div>
                        </label>

                        {/* Preview */}
                        <div className="w-32 h-32 rounded-2xl border border-gray-100 bg-white overflow-hidden shadow-sm flex-shrink-0 flex items-center justify-center">
                          {form.mainFile ? (
                            <img src={URL.createObjectURL(form.mainFile)} className="w-full h-full object-cover" alt="Preview" />
                          ) : form.image ? (
                            <img src={form.image} className="w-full h-full object-cover opacity-60" alt="URL Preview" />
                          ) : (
                            <div className="text-gray-300 text-[10px] text-center px-4">No image selected</div>
                          )}
                        </div>
                      </div>

                      {/* URL Fallback */}
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span className="text-gray-400 text-xs font-mono">http://</span>
                        </div>
                        <input
                          className="input pl-14 text-xs"
                          value={form.image}
                          onChange={(e) => setForm({ ...form, image: e.target.value })}
                          placeholder="Or paste external image URL..."
                        />
                      </div>
                      {errors.image && <p className="text-xs text-red-500">{errors.image}</p>}
                    </div>
                  </div>

                  {/* Gallery Selection */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-semibold text-gray-700">Gallery Images</label>
                      <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-bold uppercase">Optional</span>
                    </div>

                    <div className="space-y-4">
                      {/* Multi Upload */}
                      <label className="block cursor-pointer">
                        <div className="border-2 border-dashed border-gray-200 rounded-2xl p-4 bg-gray-50 hover:border-orange-200 transition-all flex items-center justify-center gap-3">
                          <Plus size={16} className="text-gray-400" />
                          <span className="text-xs font-semibold text-gray-600">Add Gallery Images (Support multiple selection)</span>
                          <input 
                            type="file" 
                            className="hidden" 
                            multiple 
                            accept="image/*"
                            onChange={(e) => {
                              const files = Array.from(e.target.files);
                              setForm({ ...form, galleryFiles: [...form.galleryFiles, ...files] });
                            }}
                          />
                        </div>
                      </label>

                      {/* File Previews */}
                      {form.galleryFiles.length > 0 && (
                        <div className="grid grid-cols-5 gap-2 max-h-40 overflow-y-auto p-1">
                          {form.galleryFiles.map((f, idx) => (
                            <div key={idx} className="group relative aspect-square rounded-lg border border-orange-100 bg-white overflow-hidden shadow-sm">
                              <img src={URL.createObjectURL(f)} className="w-full h-full object-cover" alt="Gallery preview" />
                              <button 
                                onClick={(e) => {
                                  e.preventDefault();
                                  setForm({ ...form, galleryFiles: form.galleryFiles.filter((_, i) => i !== idx) });
                                }}
                                className="absolute top-0.5 right-0.5 w-5 h-5 bg-red-500 text-white rounded-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X size={12} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* URL Fallback */}
                      <div>
                        <p className="text-[10px] text-gray-400 mb-1.5 font-medium ml-1">Or provide comma-separated URLs</p>
                        <input
                          className="input text-xs"
                          value={form.gallery}
                          onChange={(e) => setForm({ ...form, gallery: e.target.value })}
                          placeholder="https://img1.com, https://img2.com..."
                        />
                      </div>
                    </div>
                  </div>
                </div>
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
              <h4 className="text-base font-bold text-gray-900">Dimensions & Shipping</h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="label">Weight</label>
                  <div className="flex gap-2">
                    <input
                      className="input"
                      type="number"
                      step="0.01"
                      value={form.weight}
                      onChange={(e) => setForm({ ...form, weight: e.target.value })}
                      placeholder="e.g. 1.5"
                    />
                    <select
                      className="w-20 rounded-2xl border border-orange-200 bg-white px-2 py-3.5 text-sm text-gray-800 outline-none transition focus:border-orange-300 focus:ring-4 focus:ring-orange-100"
                      value={form.weightUnit}
                      onChange={(e) => setForm({ ...form, weightUnit: e.target.value })}
                    >
                      <option value="kg">kg</option>
                      <option value="g">g</option>
                    </select>
                  </div>
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
              {paginatedProducts.map((p) => {
                const isExpanded = expandedId === p.id;

                return (
                  <React.Fragment key={p.id}>
                    <tr
                      className="table-row align-top cursor-pointer hover:bg-orange-50/30 transition"
                      onClick={() => setExpandedId(isExpanded ? null : p.id)}
                    >
                      <td className="table-td">
                        <div className="flex items-start gap-3 min-w-0">
                          <img
                            src={p.image}
                            alt={p.name}
                            className="w-14 h-14 rounded-xl object-cover bg-gray-100 flex-none border border-orange-100"
                          />
                          <div className="min-w-0">
                            <p className="font-semibold text-gray-800 truncate">{p.name}</p>
                            <div className="text-xs text-gray-400 mt-1 space-y-1">
                              <p className="truncate">{p.id}</p>
                              {p.ageGroup ? <p className="truncate">Age: {p.ageGroup}</p> : null}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="table-td text-gray-600 font-medium break-words">{p.sku}</td>
                      <td className="table-td text-gray-500 break-words">{p.category}</td>
                      <td className="table-td hidden xl:table-cell text-gray-500 break-words">{p.brand}</td>
                      <td className="table-td font-semibold text-gray-800 whitespace-nowrap">₹{fmt(p.price)}</td>
                      <td className="table-td text-gray-700 whitespace-nowrap">{p.stock} units</td>
                      <td className="table-td">
                        <StatusBadge status={p.status} />
                      </td>

                      <td className="table-td hidden xl:table-cell">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFeatured(p);
                          }}
                          className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition whitespace-nowrap ${p.featured
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
                            onClick={(e) => {
                              e.stopPropagation();
                              openEdit(p);
                            }}
                            className="w-8 h-8 flex items-center justify-center rounded-lg bg-orange-50 text-orange-500 hover:bg-orange-100 transition"
                          >
                            <Pencil size={14} />
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              askDelete(p.id);
                            }}
                            className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>

                    {isExpanded && (
                      <tr className="bg-gradient-to-b from-orange-50/40 to-white">
                        <td colSpan={9} className="px-5 py-6 border-t border-orange-100">

                          {/* Header strip */}
                          <div className="flex flex-wrap items-center gap-2 mb-5">
                            <h3 className="text-base font-bold text-gray-900">{p.name}</h3>
                            <StatusBadge status={p.status} />
                            {p.featured && (
                              <span className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold bg-orange-100 text-orange-600">
                                <Star size={11} className="fill-current" /> Featured
                              </span>
                            )}
                            {p.variant && (
                              <span className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold bg-blue-50 text-blue-500">
                                Variant Product
                              </span>
                            )}
                          </div>

                          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

                            {/* ── Column 1: Images ── */}
                            <div className="lg:col-span-3">
                              <div className="bg-white rounded-2xl border border-orange-100 p-3 space-y-3">
                                <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 px-1">Images</p>

                                {/* Main image */}
                                <div className="aspect-square rounded-xl overflow-hidden bg-gray-50 border border-orange-100">
                                  {p.image ? (
                                    <img
                                      src={p.image}
                                      alt={p.name}
                                      className="w-full h-full object-cover"
                                      onError={(e) => { e.currentTarget.src = ''; e.currentTarget.alt = 'No image'; }}
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">No image</div>
                                  )}
                                </div>

                                {/* Gallery thumbnails */}
                                {p.gallery?.filter(Boolean).length > 0 && (
                                  <div>
                                    <p className="text-[11px] text-gray-400 mb-1.5 px-1">Gallery ({p.gallery.filter(Boolean).length})</p>
                                    <div className="grid grid-cols-4 gap-1.5">
                                      {p.gallery.filter(Boolean).map((img, idx) => (
                                        <div key={idx} className="aspect-square rounded-lg overflow-hidden border border-orange-100 bg-gray-50">
                                          <img
                                            src={img}
                                            alt={`${p.name} ${idx + 1}`}
                                            className="w-full h-full object-cover"
                                            onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                          />
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* ── Column 2: Description + Basic Info ── */}
                            <div className="lg:col-span-5 space-y-4">

                              {/* Description */}
                              <div className="bg-white rounded-2xl border border-orange-100 p-4">
                                <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-2">Description</p>
                                <p className="text-sm text-gray-600 leading-relaxed">
                                  {p.description?.trim() || <span className="italic text-gray-400">No description added.</span>}
                                </p>
                              </div>

                              {/* Basic Info */}
                              <div className="bg-white rounded-2xl border border-orange-100 p-4">
                                <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-3">Product Info</p>
                                <div className="space-y-2 text-sm">
                                  {[
                                    ['SKU', fmtValue(p.sku)],
                                    ['Category', fmtValue(p.category)],
                                    ['Brand', fmtValue(p.brand)],
                                    ['Age Group', fmtValue(p.ageGroup)],
                                    ['Material', fmtValue(p.material)],
                                    ['Is Variant', p.variant ? 'Yes' : 'No'],
                                    ...(p.linkedReviewId ? [['Linked Review ID', p.linkedReviewId]] : []),
                                  ].map(([label, value]) => (
                                    <div key={label} className="flex items-center justify-between gap-4 py-1 border-b border-gray-50 last:border-0">
                                      <span className="text-gray-500 shrink-0">{label}</span>
                                      <span className="font-medium text-gray-800 text-right break-all">{value}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>

                            {/* ── Column 3: Pricing + Dimensions ── */}
                            <div className="lg:col-span-4 space-y-4">

                              {/* Pricing & Stock */}
                              <div className="bg-white rounded-2xl border border-orange-100 p-4">
                                <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-3">Pricing & Stock</p>
                                <div className="space-y-2 text-sm">
                                  <div className="flex items-center justify-between gap-4 py-1 border-b border-gray-50">
                                    <span className="text-gray-500">Selling Price</span>
                                    <span className="font-bold text-gray-900 text-base">₹{fmt(p.price)}</span>
                                  </div>
                                  <div className="flex items-center justify-between gap-4 py-1 border-b border-gray-50">
                                    <span className="text-gray-500">MRP</span>
                                    <span className="font-medium text-gray-500 line-through">₹{fmt(p.mrp)}</span>
                                  </div>
                                  {p.mrp > p.price && (
                                    <div className="flex items-center justify-between gap-4 py-1 border-b border-gray-50">
                                      <span className="text-gray-500">Discount</span>
                                      <span className="font-semibold text-green-600">
                                        {Math.round(((p.mrp - p.price) / p.mrp) * 100)}% off
                                      </span>
                                    </div>
                                  )}
                                  <div className="flex items-center justify-between gap-4 py-1">
                                    <span className="text-gray-500">Stock</span>
                                    <span className={`font-semibold ${
                                      p.stock <= 0 ? 'text-red-500' :
                                      p.stock <= 5 ? 'text-orange-500' : 'text-green-600'
                                    }`}>{p.stock} units</span>
                                  </div>
                                </div>
                              </div>

                              {/* Dimensions */}
                              <div className="bg-white rounded-2xl border border-orange-100 p-4">
                                <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-3">Dimensions & Shipping</p>
                                <div className="grid grid-cols-2 gap-2">
                                  {[
                                    ['Weight', fmtValue(p.weight, ` ${p.weightUnit || 'kg'}`)],
                                    ['Length', fmtValue(p.length, ' cm')],
                                    ['Breadth', fmtValue(p.breadth, ' cm')],
                                    ['Height', fmtValue(p.height, ' cm')],
                                  ].map(([label, value]) => (
                                    <div key={label} className="rounded-xl bg-orange-50/70 px-3 py-2.5">
                                      <p className="text-[11px] text-gray-400">{label}</p>
                                      <p className="text-sm font-semibold text-gray-800 mt-0.5">{value}</p>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Quick actions */}
                              <div className="flex gap-2">
                                <button
                                  onClick={(e) => { e.stopPropagation(); openEdit(p); }}
                                  className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl px-3 py-2.5 text-sm font-semibold bg-orange-500 text-white hover:bg-orange-600 transition"
                                >
                                  <Pencil size={14} /> Edit Product
                                </button>
                                <button
                                  onClick={(e) => { e.stopPropagation(); askDelete(p.id); }}
                                  className="inline-flex items-center justify-center gap-1.5 rounded-xl px-3 py-2.5 text-sm font-semibold bg-red-50 text-red-500 hover:bg-red-100 transition"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </div>

                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}

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