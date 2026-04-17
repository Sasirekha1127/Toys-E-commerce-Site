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
  try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
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
  const [products,   setProducts]   = useState(() => load('admin-products',   INIT_PRODUCTS));
  const [categories, setCategories] = useState(() => load('admin-categories', INIT_CATEGORIES));
  const [orders,     setOrders]     = useState(() => load('admin-orders',     INIT_ORDERS));
  const [customers,  setCustomers]  = useState(() => load('admin-customers',  INIT_CUSTOMERS));
  const [reviews,    setReviews]    = useState(() => load('admin-reviews',    INIT_REVIEWS));
  const [offers,     setOffers]     = useState(() => load('admin-offers',     INIT_OFFERS));
  const [banners,    setBanners]    = useState(() => load('admin-banners',    INIT_BANNERS));
  const [settings,   setSettings]   = useState(() => load('admin-settings',   INIT_SETTINGS));

  /* persist */
  useEffect(() => save('admin-products',   products),   [products]);
  useEffect(() => save('admin-categories', categories), [categories]);
  useEffect(() => save('admin-orders',     orders),     [orders]);
  useEffect(() => save('admin-customers',  customers),  [customers]);
  useEffect(() => save('admin-reviews',    reviews),    [reviews]);
  useEffect(() => save('admin-offers',     offers),     [offers]);
  useEffect(() => save('admin-banners',    banners),    [banners]);
  useEffect(() => save('admin-settings',   settings),   [settings]);

  /* ── Products ── */
  const addProduct = useCallback((p) => {
    const id = `P${String(Date.now()).slice(-4)}`;
    const product = { ...p, id, sold: Number(p.sold || 0) };
    setProducts(prev => [product, ...prev]);
    // sync categories count
    setCategories(prev => prev.map(c =>
      c.name === p.category ? { ...c, products: c.products + 1 } : c
    ));
    return product;
  }, []);

  const updateProduct = useCallback((updated) => {
    setProducts(prev => prev.map(p => p.id === updated.id ? updated : p));
  }, []);

  const deleteProduct = useCallback((id) => {
    setProducts(prev => {
      const p = prev.find(x => x.id === id);
      if (p) {
        setCategories(cats => cats.map(c =>
          c.name === p.category ? { ...c, products: Math.max(0, c.products - 1) } : c
        ));
      }
      return prev.filter(x => x.id !== id);
    });
  }, []);

  /* ── Categories ── */
  const addCategory = useCallback((c) => {
    const id = `C${String(Date.now()).slice(-4)}`;
    setCategories(prev => [...prev, { ...c, id, products: 0 }]);
  }, []);

  const updateCategory = useCallback((updated) => {
    setCategories(prev => prev.map(c => c.id === updated.id ? updated : c));
  }, []);

  const deleteCategory = useCallback((id) => {
    setCategories(prev => prev.filter(c => c.id !== id));
  }, []);

  const toggleCategoryVisibility = useCallback((id) => {
    setCategories(prev => prev.map(c => c.id === id ? { ...c, active: !c.active } : c));
  }, []);

  /* ── Orders ── */
  const updateOrderStatus = useCallback((id, status) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
  }, []);

  /* ── Reviews ── */
  const approveReview = useCallback((id) => {
    setReviews(prev => prev.map(r => r.id === id ? { ...r, status: 'Approved' } : r));
  }, []);

  const rejectReview = useCallback((id) => {
    setReviews(prev => prev.map(r => r.id === id ? { ...r, status: 'Rejected' } : r));
  }, []);

  const deleteReview = useCallback((id) => {
    setReviews(prev => prev.filter(r => r.id !== id));
  }, []);

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

  /* ── Stats (derived) ── */
  const adminStats = {
    totalProducts: products.length,
    totalCategories: categories.length,
    totalOrders: orders.length,
    totalCustomers: customers.length,
    totalRevenue: orders.reduce((s, o) => s + (o.amount || 0), 0),
    lowStockItems: products.filter(p => p.stock > 0 && p.stock <= 8).length,
    revenueGrowth: 18.4,
    ordersGrowth: 12.7,
    customersGrowth: 9.2,
    productsGrowth: 4.5,
  };

  return (
    <AdminContext.Provider value={{
      /* State */
      products, categories, orders, customers, reviews, offers, banners, settings,
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
      /* Inventory */
      restockProduct,
      /* Settings */
      updateSettings,
      /* Derived helpers */
      getUserProducts, getApprovedReviews, getActiveBanners, getActiveOffers,
      /* Stats */
      adminStats,
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
