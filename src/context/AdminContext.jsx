import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { products as INIT_PRODUCTS, categories as INIT_CATEGORIES } from '../data/admin/products.js';
import { orders as INIT_ORDERS } from '../data/admin/orders.js';
import { customers as INIT_CUSTOMERS } from '../data/admin/customers.js';
import { reviews as INIT_REVIEWS, offers as INIT_OFFERS } from '../data/admin/index.js';

/* ─── helpers ─── */
function load(key, fallback) {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : fallback;
  } catch {
    return fallback;
  }
}
function save(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch { }
}

function formatImageUrl(url) {
  if (!url) return 'https://placehold.co/400x400/f3f4f6/a1a1aa?text=No+Image';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  if (url.startsWith('/uploads/')) return `http://localhost:5000${url}`;
  return url.startsWith('/') ? url : `/${url}`;
}

/* ─── initial banners derived from offers ─── */
const INIT_BANNERS = [
  {
    id: 'B001',
    title: 'Soft & Snuggly',
    description: 'Explore our cuddly collection of plush friends your little one will adore forever.',
    cta: 'Shop Soft Toys',
    link: 'soft-toys',
    image: 'https://static.vecteezy.com/system/resources/thumbnails/046/096/593/small/plush-yellow-bear-sitting-on-blue-floor-in-playroom-free-photo.jpeg',
    active: true,
  },
  {
    id: 'B002',
    title: 'Learn & Grow',
    description: 'Educational toys that make every discovery a celebration and every lesson an adventure.',
    cta: 'Shop Educational',
    link: 'educational-toys',
    image: 'https://img.freepik.com/premium-photo/decorative-cartoon-kids-toys-banner-must-have-playful-children-is-charming_922357-43058.jpg',
    active: true,
  },
  {
    id: 'B003',
    title: 'Tech & Wonder',
    description: 'Electronic toys packed with lights, sound, and magic for endless hours of excitement.',
    cta: 'Shop Electronic',
    link: 'electronic-toys',
    image: 'https://img.freepik.com/premium-photo/decorative-cartoon-kids-toys-banner-must-have-playful-children-is-charming_922357-44021.jpg',
    active: true,
  },
];

const INIT_SETTINGS = {
  shopName: 'ToyStore',
  tagline: 'Magic Toys for Little Dreamers',
  email: 'hello@toystore.com',
  phone: '+91 98765 43210',
  address: '123 Toy Street, Funville, India',
  currency: 'INR',
  timezone: 'Asia/Kolkata',
  facebook: 'https://facebook.com/toystore',
  instagram: 'https://instagram.com/toystore',
  twitter: 'https://twitter.com/toystore',
  logo: '',
};

/* ─── Context ─── */
const AdminContext = createContext(null);

export function AdminProvider({ children }) {
  const [products, setProducts] = useState([]); // Start empty for real-time fetch
  const [categories, setCategories] = useState(() => load('admin-categories', INIT_CATEGORIES));
  const [orders, setOrders] = useState(() => load('admin-orders', INIT_ORDERS));
  const [customers, setCustomers] = useState(() => load('admin-customers', INIT_CUSTOMERS));
  const [reviews, setReviews] = useState(() => load('admin-reviews', INIT_REVIEWS));
  const [offers, setOffers] = useState(() => load('admin-offers', INIT_OFFERS));
  const [banners, setBanners] = useState(() => load('admin-banners', INIT_BANNERS));
  const [settings, setSettings] = useState(() => load('admin-settings', INIT_SETTINGS));
  const [coupons, setCoupons] = useState([]);

  // NEW ADMIN STATES
  const [adminPayments, setAdminPayments] = useState([]);
  const [adminReturns, setAdminReturns] = useState([]);
  const [adminVendors, setAdminVendors] = useState([]);
  const [adminFinance, setAdminFinance] = useState(null);
  const [adminSales, setAdminSales] = useState(null);
  const [adminPaymentsStats, setAdminPaymentsStats] = useState([]);
  const [adminPeriodFinance, setAdminPeriodFinance] = useState([]);
  const [financePeriod, setFinancePeriod] = useState('monthly');
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => setToast(null), 3000);
  }, []);


  /* persistence for non-db items */
  // useEffect(() => save('admin-products',   products),   [products]); // Disable persistence for real-time data
  useEffect(() => save('admin-categories', categories), [categories]);
  useEffect(() => save('admin-orders', orders), [orders]);
  useEffect(() => save('admin-customers', customers), [customers]);
  useEffect(() => save('admin-reviews', reviews), [reviews]);
  useEffect(() => save('admin-offers', offers), [offers]);
  useEffect(() => save('admin-banners', banners), [banners]);
  useEffect(() => save('admin-settings', settings), [settings]);

  /* Fetch Coupons from Backend */
  const fetchCoupons = useCallback(async () => {
    try {
      const res = await fetch('http://localhost:5000/api/coupons?admin_id=1');
      const data = await res.json();
      if (data.coupons) setCoupons(data.coupons);
    } catch (err) {
      console.error('Failed to fetch coupons:', err);
    }
  }, []);

  /* Fetch Products from Backend */
  const fetchProducts = useCallback(async () => {
    try {
      const res = await fetch('http://localhost:5000/api/products?admin_id=1');
      const data = await res.json();
      if (data.products) {
        const mapped = data.products.map(p => ({
          ...p,
          id: p.id,
          name: p.title || p.name || 'Unnamed Product',
          displayId: p.product_id && !String(p.product_id).startsWith("00000000")
            ? p.product_id
            : `PRDT${String(p.id).padStart(3, "0")}`,
          category: p.category || 'Soft Toys',
          price: Number(p.price || 0),
          originalPrice: Number(p.mrp || 0),
          stock: Number(p.stock_quantity || 0),
          image: formatImageUrl(
            (Array.isArray(p.image_urls) && p.image_urls.length > 0 && p.image_urls[0] && p.image_urls[0].trim() !== '')
              ? p.image_urls[0]
              : (p.image_url || p.image || '')
          ),
          status: p.is_active ? 'Active' : 'Draft',
          rating: Number(p.rating || 0),
          reviews: Number(p.reviews || 0),
          sold: Number(p.sold || 0)
        }));
        setProducts(mapped);
      }
    } catch (err) {
      console.error('Failed to fetch products:', err);
    }
  }, []);

  /* Fetch Orders from Backend */
  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch('http://localhost:5000/api/orders?admin_id=1');
      const data = await res.json();
      if (data.orders) {
        const mapped = data.orders.map(o => ({
          ...o,
          id: String(o.order_id || o.id || ''),
          customer: o.customer_name || `User ${o.customer_id?.slice(-4) || 'Unknown'}`,
          email: o.customer_email || '',
          amount: Number(o.total_amount || 0),
          status: o.order_status || 'Pending',
          payment: o.payment_status || 'Paid',
          date: new Date(o.ordered_at).toLocaleDateString("en-IN"),
          rawDate: o.ordered_at,
          product: o.items && o.items.length > 0 ? o.items[0].name : 'Products'
        }));
        setOrders(mapped);
      }
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    }
  }, []);

  /* Fetch Reviews from Backend */
  const fetchReviews = useCallback(async () => {
    try {
      const res = await fetch('http://localhost:5000/api/reviews?admin_id=1');
      const data = await res.json();
      if (data.reviews) {
        const mapped = data.reviews.map(r => ({
          ...r,
          id: String(r.review_id || r.id || ''),
          customer: `Customer ${r.customer_code || 'C000'}`,
          avatar: (r.customer_name || 'U').split(' ').map(n => n[0]).join(''),
          rating: Number(r.rating || 0),
          text: r.body || '',
          date: new Date(r.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
          product: r.product_title || String(r.product_id || 'Product'),
          productImg: formatImageUrl(
            r.product_image ||
            (Array.isArray(r.product_image_urls) && r.product_image_urls.length > 0 ? r.product_image_urls[0] : null) ||
            (Array.isArray(r.image_urls) && r.image_urls.length > 0 ? r.image_urls[0] : null)
          )
        }));
        setReviews(mapped);
      }
    } catch (err) {
      console.error('Failed to fetch reviews:', err);
    }
  }, []);


  /* Fetch Categories from Backend */
  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch('http://localhost:5000/api/categories?admin_id=1');
      const data = await res.json();
      if (data.categories) {
        const mapped = data.categories.map(c => ({
          ...c,
          id: String(c.category_id || c.id || ''),
          active: c.is_active,
          ageRange: c.age_range,
          products: parseInt(c.product_count) || 0
        }));
        setCategories(mapped);
      }
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  }, []);

  /* Fetch Customers from Backend */
  const fetchCustomers = useCallback(async () => {
    try {
      const res = await fetch('http://localhost:5000/api/admin/customers');
      const data = await res.json();
      if (data.customers) {
        const mapped = data.customers.map(c => {
          const custOrders = orders.filter(o => o.customer_id === c.customer_id);
          return {
            ...c,
            id: String(c.customer_id || c.id || ''),
            avatar: c.name ? c.name.split(' ').map(n => n[0]).join('') : 'U',
            status: custOrders.length > 0 ? 'Active' : 'Inactive',
            joined: c.created_at ? new Date(c.created_at).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : 'Unknown',
            orders: custOrders.length,
            spent: custOrders.reduce((sum, o) => sum + (o.amount || 0), 0),
            createdAt: c.created_at
          };
        });
        setCustomers(mapped);
      }
    } catch (err) {
      console.error('Failed to fetch customers:', err);
    }
  }, []);

  /* New Admin Fetches */
  const fetchAdminPayments = useCallback(async () => {
    try {
      const res = await fetch('http://localhost:5000/api/admin/payments');
      const data = await res.json();
      if (data.payments) setAdminPayments(data.payments);
    } catch (err) { console.error('Failed to fetch admin payments:', err); }
  }, []);

  const fetchAdminReturns = useCallback(async () => {
    try {
      const res = await fetch('http://localhost:5000/api/admin/returns');
      const data = await res.json();
      if (data.returns) setAdminReturns(data.returns);
    } catch (err) { console.error('Failed to fetch admin returns:', err); }
  }, []);

  const fetchAdminVendors = useCallback(async () => {
    try {
      const res = await fetch('http://localhost:5000/api/admin/vendors');
      const data = await res.json();
      if (data.vendors) setAdminVendors(data.vendors);
    } catch (err) { console.error('Failed to fetch admin vendors:', err); }
  }, []);

  const fetchAdminFinance = useCallback(async (period = 'monthly') => {
    try {
      const [summaryRes, monthlyRes, periodRes] = await Promise.all([
        fetch('http://localhost:5000/api/finance/summary'),
        fetch('http://localhost:5000/api/finance/monthly-revenue'),
        fetch(`http://localhost:5000/api/admin/finance/stats?period=${period}`)
      ]);
      const summary = await summaryRes.json();
      const monthly = await monthlyRes.json();
      const periodData = await periodRes.json();

      setAdminFinance({
        ...summary,
        monthlyRevenue: monthly
      });
      setAdminPeriodFinance(periodData);
      setFinancePeriod(period);
    } catch (err) { console.error('Failed to fetch admin finance:', err); }
  }, []);

  const syncAdminFinance = useCallback(async () => {
    try {
      const res = await fetch('http://localhost:5000/api/admin/finance/sync', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        await fetchAdminFinance(financePeriod);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Failed to sync admin finance:', err);
      return false;
    }
  }, [fetchAdminFinance, financePeriod]);

  const fetchAdminSales = useCallback(async () => {
    try {
      const res = await fetch('http://localhost:5000/api/admin/sales');
      const data = await res.json();
      if (data.sales) setAdminSales(data.sales);
    } catch (err) { console.error('Failed to fetch admin sales:', err); }
  }, []);

  const fetchAdminPaymentsStats = useCallback(async () => {
    try {
      const res = await fetch('http://localhost:5000/api/finance/payments-stats');
      const data = await res.json();
      if (Array.isArray(data)) setAdminPaymentsStats(data);
    } catch (err) { console.error('Failed to fetch admin payments stats:', err); }
  }, []);

  useEffect(() => {
    fetchCoupons();
    fetchProducts();
    fetchCategories();
    fetchReviews();
    fetchOrders();
    fetchCustomers();
    fetchAdminPayments();
    fetchAdminReturns();
    fetchAdminVendors();
    fetchAdminFinance();
    fetchAdminSales();
    fetchAdminPaymentsStats();
  }, [
    fetchCoupons, fetchProducts, fetchCategories, fetchReviews, fetchOrders, fetchCustomers,
    fetchAdminPayments, fetchAdminReturns, fetchAdminVendors, fetchAdminFinance, fetchAdminSales, fetchAdminPaymentsStats
  ]);

  /* ── Products ── */
  const addProduct = useCallback(async (p) => {
    try {
      // Map UI fields to DB fields
      const payload = {
        title: p.name,
        description: p.description || '',
        price: Number(p.price),
        stock_quantity: Number(p.stock),
        category: p.category,
        image_urls: p.image && p.image.trim() !== '' ? [p.image.trim()] : [],
        admin_id: '00000000-0000-0000-0000-000000000001',
        is_active: p.status === 'Active'
      };

      const res = await fetch('http://localhost:5000/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.product) {
        await fetchProducts(); // Refresh list
        showToast('Product added successfully ✓', 'success');
        return data.product;
      }
    } catch (err) {
      console.error('Failed to add product to DB:', err);
      showToast('Failed to add product', 'error');
    }
  }, [fetchProducts, showToast]);

  const updateProduct = useCallback(async (updated) => {
    try {
      // Map UI fields to DB fields
      const payload = {
        title: updated.name,
        description: updated.description || '',
        price: Number(updated.price),
        stock_quantity: Number(updated.stock),
        category: updated.category,
        image_urls: updated.image && updated.image.trim() !== '' ? [updated.image.trim()] : [],
        is_active: updated.status === 'Active'
      };

      const res = await fetch(`http://localhost:5000/api/products/${updated.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        await fetchProducts(); // Refresh list
        showToast('Product updated successfully ✓', 'success');
      } else {
        showToast('Failed to update product', 'error');
      }
    } catch (err) {
      console.error('Failed to update product in DB:', err);
      showToast('Error updating product', 'error');
    }
  }, [fetchProducts, showToast]);

  const deleteProduct = useCallback(async (id) => {
    try {
      const res = await fetch(`http://localhost:5000/api/products/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        await fetchProducts(); // Refresh list
        showToast('Product deleted', 'info');
      } else {
        showToast('Failed to delete product', 'error');
      }
    } catch (err) {
      console.error('Failed to delete product from DB:', err);
      showToast('Error deleting product', 'error');
    }
  }, [fetchProducts, showToast]);


  /* ── Categories ── */
  const addCategory = useCallback(async (c) => {
    try {
      const payload = {
        name: c.name,
        slug: c.name.toLowerCase().replace(/ /g, '-'),
        icon: c.icon,
        description: c.description,
        age_range: c.ageRange,
        is_active: c.active,
        admin_id: null
      };
      const res = await fetch('http://localhost:5000/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) await fetchCategories();
    } catch (err) { console.error('Failed to add category:', err); }
  }, [fetchCategories]);

  const updateCategory = useCallback(async (updated) => {
    try {
      const payload = {
        name: updated.name,
        slug: updated.name.toLowerCase().replace(/ /g, '-'),
        icon: updated.icon,
        description: updated.description,
        age_range: updated.ageRange,
        is_active: updated.active
      };
      const res = await fetch(`http://localhost:5000/api/categories/${updated.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) await fetchCategories();
    } catch (err) { console.error('Failed to update category:', err); }
  }, [fetchCategories]);

  const deleteCategory = useCallback(async (id) => {
    try {
      const res = await fetch(`http://localhost:5000/api/categories/${id}`, { method: 'DELETE' });
      if (res.ok) await fetchCategories();
    } catch (err) { console.error('Failed to delete category:', err); }
  }, [fetchCategories]);

  const toggleCategoryVisibility = useCallback(async (id) => {
    try {
      const cat = categories.find(c => c.id === id);
      if (!cat) return;
      const res = await fetch(`http://localhost:5000/api/categories/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !cat.active })
      });
      if (res.ok) await fetchCategories();
    } catch (err) { console.error('Failed to toggle category visibility:', err); }
  }, [categories, fetchCategories]);

  /* ── Orders ── */
  const updateOrderStatus = useCallback(async (id, status) => {
    try {
      const res = await fetch(`http://localhost:5000/api/orders/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_status: status })
      });
      if (res.ok) {
        setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
        fetchAdminFinance();
        fetchAdminSales();
      }
    } catch (err) {
      console.error('Failed to update order status:', err);
    }
  }, [fetchAdminFinance, fetchAdminSales]);

  /* ── Reviews ── */
  const approveReview = useCallback(async (id) => {
    try {
      const res = await fetch(`http://localhost:5000/api/reviews/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Approved' })
      });
      if (res.ok) {
        await fetchReviews();
        showToast('Review approved ✓', 'success');
      }
    } catch (err) {
      console.error('Failed to approve review:', err);
      showToast('Failed to approve review', 'error');
    }
  }, [fetchReviews, showToast]);

  const rejectReview = useCallback(async (id) => {
    try {
      const res = await fetch(`http://localhost:5000/api/reviews/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Rejected' })
      });
      if (res.ok) {
        await fetchReviews();
        showToast('Review rejected', 'info');
      }
    } catch (err) {
      console.error('Failed to reject review:', err);
      showToast('Failed to reject review', 'error');
    }
  }, [fetchReviews, showToast]);

  const deleteReview = useCallback(async (id) => {
    try {
      const res = await fetch(`http://localhost:5000/api/reviews/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        await fetchReviews();
        showToast('Review deleted', 'info');
      } else {
        showToast('Failed to delete review', 'error');
      }
    } catch (err) {
      console.error('Failed to delete review:', err);
      showToast('Error deleting review', 'error');
    }
  }, [fetchReviews, showToast]);



  /* ── Offers ── */
  const addOffer = useCallback((o) => {
    const id = `O${String(Date.now()).slice(-4)}`;
    setOffers(prev => [...prev, { ...o, id, image: 'https://images.unsplash.com/photo-1581783898377-1c85bf937427?w=300&h=160&fit=crop', color: 'from-brand-500 to-brand-400' }]);
  }, []);

  const updateOffer = useCallback((updated) => {
    setOffers(prev => prev.map(o => o.id === updated.id ? updated : o));
  }, []);

  const deleteOffer = useCallback((id) => {
    setOffers(prev => prev.filter(o => o.id !== id));
  }, []);

  const toggleOfferStatus = useCallback((id) => {
    setOffers(prev => prev.map(o =>
      o.id === id
        ? { ...o, status: o.status === 'Active' ? 'Scheduled' : o.status === 'Scheduled' ? 'Active' : o.status }
        : o
    ));
  }, []);

  /* ── Banners ── */
  const addBanner = useCallback((b) => {
    const id = `B${String(Date.now()).slice(-4)}`;
    setBanners(prev => [...prev, { ...b, id }]);
  }, []);

  const updateBanner = useCallback((updated) => {
    setBanners(prev => prev.map(b => b.id === updated.id ? updated : b));
  }, []);

  const deleteBanner = useCallback((id) => {
    setBanners(prev => prev.filter(b => b.id !== id));
  }, []);

  const toggleBanner = useCallback((id) => {
    setBanners(prev => prev.map(b => b.id === id ? { ...b, active: !b.active } : b));
  }, []);

  /* ── Inventory ── */
  const restockProduct = useCallback((id, qty) => {
    setProducts(prev => prev.map(p => {
      if (p.id !== id) return p;
      const newStock = p.stock + qty;
      return { ...p, stock: newStock, status: newStock > 0 ? 'Active' : 'Out of Stock' };
    }));
  }, []);

  /* ── Settings ── */
  const updateSettings = useCallback((s) => {
    setSettings(prev => ({ ...prev, ...s }));
  }, []);

  /* ── Coupons ── */
  const addCoupon = useCallback(async (c) => {
    try {
      const res = await fetch('http://localhost:5000/api/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...c, admin_id: 1 })
      });
      const data = await res.json();
      if (data.coupon) {
        setCoupons(prev => [data.coupon, ...prev]);
        return data.coupon;
      }
    } catch (err) {
      console.error('Failed to add coupon:', err);
    }
  }, []);

  const updateCoupon = useCallback(async (updated) => {
    try {
      const res = await fetch(`http://localhost:5000/api/coupons/${updated.coupon_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      });
      const data = await res.json();
      if (data.coupon) {
        setCoupons(prev => prev.map(c => c.coupon_id === updated.coupon_id ? data.coupon : c));
        return data.coupon;
      }
    } catch (err) {
      console.error('Failed to update coupon:', err);
    }
  }, []);

  const deleteCoupon = useCallback(async (id) => {
    try {
      const res = await fetch(`http://localhost:5000/api/coupons/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setCoupons(prev => prev.filter(c => c.coupon_id !== id));
      }
    } catch (err) {
      console.error('Failed to delete coupon:', err);
    }
  }, []);

  /* ── New Module Mutations ── */
  const updatePaymentStatus = useCallback(async (id, status) => {
    try {
      const res = await fetch(`http://localhost:5000/api/admin/payments/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        await fetchAdminPayments();
        fetchAdminFinance();
        fetchAdminSales();
      }
    } catch (err) { console.error('Error updating payment status:', err); }
  }, [fetchAdminPayments, fetchAdminFinance, fetchAdminSales]);

  const updateReturnStatus = useCallback(async (id, status, note, admin_id) => {
    try {
      const res = await fetch(`http://localhost:5000/api/admin/returns/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, note, admin_id })
      });
      if (res.ok) await fetchAdminReturns();
    } catch (err) { console.error('Error updating return request:', err); }
  }, [fetchAdminReturns]);

  const updateVendorStatus = useCallback(async (id, status) => {
    try {
      const res = await fetch(`http://localhost:5000/api/admin/vendors/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) await fetchAdminVendors();
    } catch (err) { console.error('Error updating vendor status:', err); }
  }, [fetchAdminVendors]);

  /* ── Derived: user-facing product lists by category ── */
  const getUserProducts = useCallback((category) => {
    return products
      .filter(p => p.status === 'Active' && p.category === category)
      .map(p => ({
        id: p.id,
        name: p.name,
        image: p.image,
        description: p.description || p.name,
        price: String(p.price),
        originalPrice: p.originalPrice ? String(p.originalPrice) : undefined,
        rating: p.rating,
        reviews: p.reviews,
        category: p.category,
        stock: p.stock,
        badge: p.badge,
        featured: p.featured,
        bestseller: p.bestseller,
        newArrival: p.newArrival,
        sku: p.sku,
        brand: p.brand,
        material: p.material,
        ageGroup: p.ageGroup,
      }));
  }, [products]);

  const getApprovedReviews = useCallback((productName) => {
    if (productName) {
      return reviews.filter(r => r.status === 'Approved' && r.product === productName);
    }
    return reviews.filter(r => r.status === 'Approved');
  }, [reviews]);

  const getActiveBanners = useCallback(() => {
    return banners.filter(b => b.active);
  }, [banners]);

  const getActiveOffers = useCallback(() => {
    return offers.filter(o => o.status === 'Active');
  }, [offers]);

  /* ── Stats & Analytics (derived) ── */
  const computeAnalytics = () => {
    const salesDataRaw = {};
    const now = new Date();
    const nowMonth = now.getMonth();
    const nowYear = now.getFullYear();

    // Initialize last 6 months (default view)
    for (let i = 11; i >= 0; i--) {
      let d = new Date(nowYear, nowMonth - i, 1);
      const monthStr = d.toLocaleString('default', { month: 'short' });
      salesDataRaw[monthStr] = { month: monthStr, revenue: 0, orders: 0, target: 15000, timestamp: d.getTime() };
    }

    let curMonthRev = 0, prevMonthRev = 0;
    let curMonthOrd = 0, prevMonthOrd = 0;
    let curMonthCust = 0, prevMonthCust = 0;

    orders.forEach(o => {
      if (!o.rawDate) return;
      const d = new Date(o.rawDate);
      const mStr = d.toLocaleString('default', { month: 'short' });

      if (salesDataRaw[mStr]) {
        salesDataRaw[mStr].revenue += (o.amount || 0);
        salesDataRaw[mStr].orders += 1;
      }

      const diffMonths = (nowYear - d.getFullYear()) * 12 + (nowMonth - d.getMonth());
      if (diffMonths === 0) {
        curMonthRev += (o.amount || 0);
        curMonthOrd += 1;
      } else if (diffMonths === 1) {
        prevMonthRev += (o.amount || 0);
        prevMonthOrd += 1;
      }
    });

    customers.forEach(c => {
      if (!c.createdAt) return;
      const d = new Date(c.createdAt);
      const diffMonths = (nowYear - d.getFullYear()) * 12 + (nowMonth - d.getMonth());
      if (diffMonths === 0) curMonthCust += 1;
      else if (diffMonths === 1) prevMonthCust += 1;
    });

    const salesData = Object.values(salesDataRaw).sort((a, b) => a.timestamp - b.timestamp);

    const calcGrowth = (curr, prev) => {
      if (!prev || prev === 0) return curr > 0 ? 100 : 0;
      return parseFloat(((curr - prev) / prev * 100).toFixed(1));
    };

    return {
      salesData,
      adminStats: {
        totalProducts: products.length,
        totalCategories: categories.length,
        totalOrders: orders.length,
        totalCustomers: customers.length,
        totalRevenue: orders.reduce((s, o) => s + (o.amount || 0), 0),
        lowStockItems: products.filter(p => p.stock > 0 && p.stock <= 8).length,
        revenueGrowth: calcGrowth(curMonthRev, prevMonthRev),
        ordersGrowth: calcGrowth(curMonthOrd, prevMonthOrd),
        customersGrowth: calcGrowth(curMonthCust, prevMonthCust),
        productsGrowth: 0, // No easy way to track historical product creation date without specific field
      }
    };
  };

  const { salesData, adminStats } = computeAnalytics();

  return (
    <AdminContext.Provider value={{
      /* State */
      products, categories, orders, customers, reviews, offers, banners, settings, coupons, toast,
      /* Actions */
      showToast,
      /* Product actions */

      addProduct, updateProduct, deleteProduct,
      /* Category actions */
      addCategory, updateCategory, deleteCategory, toggleCategoryVisibility,
      /* Order actions */
      updateOrderStatus,
      /* Review actions */
      approveReview, rejectReview, deleteReview,
      /* Offer actions */
      addOffer, updateOffer, deleteOffer, toggleOfferStatus,
      /* Banner actions */
      addBanner, updateBanner, deleteBanner, toggleBanner,
      /* Coupon actions */
      addCoupon, updateCoupon, deleteCoupon, fetchCoupons,
      /* Inventory */
      restockProduct,
      /* Settings */
      updateSettings,
      /* Derived helpers */
      getUserProducts, getApprovedReviews, getActiveBanners, getActiveOffers,
      /* Stats & Analytics */
      adminStats, salesData,
      /* New Admin State & Actions */
      adminPayments, adminReturns, adminVendors, adminFinance, adminSales, adminPaymentsStats, adminPeriodFinance, financePeriod,
      fetchAdminPaymentsStats, fetchAdminFinance,
      updatePaymentStatus, updateReturnStatus, updateVendorStatus, syncAdminFinance,
    }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error('useAdmin must be used within AdminProvider');
  return ctx;
}
