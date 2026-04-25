import React, { createContext, useState, useEffect, useCallback, useRef } from 'react';
import emailjs from 'emailjs-com';

export const StoreContext = createContext(null);

// ─────────────────────────────────────────────────────────────
// Robust Price Parser
// ─────────────────────────────────────────────────────────────
export const parsePrice = (price) => {
  if (typeof price === 'number') return price;
  if (!price || price === '') return 0;
  // Remove currency symbols, commas, and handle leading/trailing whitespace
  const clean = String(price).replace(/[₹$,\s]/g, '');
  const parsed = parseFloat(clean);
  return isNaN(parsed) ? 0 : parsed;
};

/**
 * Ensures an image URL is correctly formatted.
 * - Full URLs (http/https) are returned as-is.
 * - Paths starting with /uploads are prepended with the backend BASE_URL.
 * - Others (like /images/ for local assets) are returned as-is for frontend root resolution.
 */
export const formatImageUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  
  const BASE_URL = 'http://localhost:5000';
  if (url.startsWith('/uploads')) {
    return `${BASE_URL}${url}`;
  }
  
  return url;
};

// ── EmailJS Credentials ──────────────────────────────────────────
const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
const EMAILJS_CART_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_CART_TEMPLATE_ID || EMAILJS_TEMPLATE_ID;
const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

if (EMAILJS_PUBLIC_KEY) {
  emailjs.init(EMAILJS_PUBLIC_KEY);
}

export function StoreProvider({ children }) {
  const [cart, setCart] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('toystore-cart')) || [];
      // 🛡️ PURGE CORRUPTED DATA: Filter out mangled IDs (e.g. PRDT00000000)
      return saved.filter(item => {
        const id = String(item.id || item.product_id || "");
        const isMangled = id.startsWith("PRDT") && id.length > 7;
        return !isMangled;
      });
    } catch {
      return [];
    }
  });

  const [wishlist, setWishlist] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('toystore-wishlist')) || [];
    } catch {
      return [];
    }
  });

  const [orders, setOrders] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('toystore-orders')) || [];
    } catch {
      return [];
    }
  });

  const [toast, setToast] = useState(null);

  const [currentUser, setCurrentUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("toyCurrentUser") || "null");
    } catch {
      return null;
    }
  });

  const [currentSeller, setCurrentSeller] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("toyCurrentSeller") || "null");
    } catch {
      return null;
    }
  });

  const isSyncing = useRef(false);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const syncWithDB = useCallback(async () => {
    const user = currentUser;
    if (!user || !user.id || isSyncing.current) return;

    try {
      isSyncing.current = true;
      const alreadySynced = localStorage.getItem("cart_synced");

      const localCart = JSON.parse(localStorage.getItem('toystore-cart')) || [];
      // Note: Wishlist automatic merging is typically not done per user request in previous sessions, 
      // but we maintain the data fetch logic.

      // 🚀 MERGE LOCAL CART TO DB (Only if not already synced in this session)
      if (localCart.length > 0 && !alreadySynced) {
        console.log(`[StoreContext] Merging local cart (${localCart.length} items) for user: ${user.id}`);
        for (const item of localCart) {
          try {
            await fetch('http://localhost:5000/api/cart', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                customer_id: user.id,
                product_id: item.id,
                quantity: item.qty || 1,
                unit_price: item.price,
              }),
            });
          } catch (itemErr) {
            console.warn(`[StoreContext] Failed to sync item ${item.id}:`, itemErr);
          }
        }
        localStorage.setItem("cart_synced", "true");
        localStorage.removeItem('toystore-cart');
      }

      // 🚀 FETCH FINAL STATE FROM DB
      const [cartRes, wishlistRes] = await Promise.all([
        fetch(`http://localhost:5000/api/cart/${user.id}`),
        fetch(`http://localhost:5000/api/wishlist/${user.id}`)
      ]);

      if (cartRes.ok) {
        const cartData = await cartRes.json();
        if (cartData.cart) {
          setCart(cartData.cart.map((i) => ({
            ...i,
            id: i.product_id,
            qty: i.quantity,
            price: parsePrice(i.unit_price || i.price),
            selectedVariant: i.variant_id ? { variant_id: i.variant_id } : null
          })));
        }
      }

      if (wishlistRes.ok) {
        const wishlistData = await wishlistRes.json();
        if (wishlistData.wishlist) {
          setWishlist(wishlistData.wishlist.map((i) => ({
            ...i,
            id: i.product_id,
            price: parsePrice(i.price),
            selectedVariant: i.variant_id ? { variant_id: i.variant_id } : null
          })));
        }
      }
    } catch (err) {
      console.error('[StoreContext] Critical Error in syncWithDB:', err);
    } finally {
      isSyncing.current = false;
    }
  }, [currentUser, showToast]);

  useEffect(() => {
    syncWithDB();
  }, [syncWithDB, currentUser]);

  useEffect(() => {
    const sync = (e) => {
      // Sync auth state
      const newUser = JSON.parse(localStorage.getItem("toyCurrentUser") || "null");
      const newSeller = JSON.parse(localStorage.getItem("toyCurrentSeller") || "null");
      
      setCurrentUser(newUser);
      setCurrentSeller(newSeller);

      // If item changed in another tab (even for guests)
      if (!e || e.key === 'toystore-cart') {
        const newCart = JSON.parse(localStorage.getItem('toystore-cart')) || [];
        if (!newUser) setCart(newCart);
      }
      if (!e || e.key === 'toystore-wishlist') {
        const newWishlist = JSON.parse(localStorage.getItem('toystore-wishlist')) || [];
        if (!newUser) setWishlist(newWishlist);
      }

      // If authenticated user changed, or window focused, trigger DB sync
      if (newUser && (!e || e.key === 'toyCurrentUser' || e.type === "focus")) {
        syncWithDB();
      }
    };

    window.addEventListener("storage", sync);
    window.addEventListener("focus", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("focus", sync);
    };
  }, [syncWithDB]);

  const login = useCallback((userData, type = 'user') => {
    if (type === 'user' || type === 'admin') {
      localStorage.setItem('toyCurrentUser', JSON.stringify(userData));
      setCurrentUser(userData);
      localStorage.removeItem('toyCurrentSeller');
      setCurrentSeller(null);
    } else if (type === 'seller') {
      localStorage.setItem('toyCurrentSeller', JSON.stringify(userData));
      setCurrentSeller(userData);
      localStorage.removeItem('toyCurrentUser');
      setCurrentUser(null);
    }
    // Clear sync flag to allow fresh sync on login
    localStorage.removeItem("cart_synced");
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('toyCurrentUser');
    localStorage.removeItem('toyCurrentSeller');
    localStorage.removeItem('authToken');
    localStorage.removeItem('cart_synced');
    setCurrentUser(null);
    setCurrentSeller(null);
    setCart([]);
    setWishlist([]);
  }, []);

  useEffect(() => {
    const user = currentUser;
    if (!user || !user.id) {
      localStorage.setItem('toystore-cart', JSON.stringify(cart));
    }
  }, [cart, currentUser]);

  useEffect(() => {
    const user = currentUser;
    if (!user || !user.id) {
      localStorage.setItem('toystore-wishlist', JSON.stringify(wishlist));
    }
  }, [wishlist, currentUser]);

  useEffect(() => {
    localStorage.setItem('toystore-orders', JSON.stringify(orders));
  }, [orders]);

  const addOrder = useCallback((order) => {
    setOrders((prev) => [order, ...prev]);
  }, []);

  const addToCart = useCallback(
    async (product) => {
      const user = currentUser;
      const variantId = product.selectedVariant?.variant_id || null;

      if (user && user.id) {
        try {
          const res = await fetch('http://localhost:5000/api/cart', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              customer_id: user.id,
              product_id: product.product_id || product.id,
              variant_id: variantId,
              quantity: 1,
              unit_price: product.price,
              name: product.name,
              image: product.image,
              description: product.description,
              category: product.category,
            }),
          });

          const data = await res.json();

          if (!res.ok) {
            if (res.status === 404) {
              setCart(prev => prev.filter(i => i.id !== product.id));
              showToast('This product is no longer available', 'error');
              return;
            }
            throw new Error(data.error || 'Failed to add to cart');
          }

          setCart((prev) => {
            const exists = prev.find((i) => i.id === product.id && (i.variant_id === variantId || i.selectedVariant?.variant_id === variantId));

            if (exists) {
              return prev.map((i) =>
                (i.id === product.id && (i.variant_id === variantId || i.selectedVariant?.variant_id === variantId)) 
                  ? { ...i, qty: (i.qty || 0) + 1 } 
                  : i
              );
            }

            return [...prev, { ...product, qty: 1 }];
          });

          showToast(`${product.name}${product.selectedVariant ? ` (${Object.values(product.selectedVariant).filter(v => typeof v === 'string').join(', ')})` : ''} added to cart! 🛒`);

          if (user.email) {
            const templateParams = {
              name: user.name || "Customer",
              email: user.email,
              email_subject: "Added to Cart - ToyStore",
              email_header: "New Item in Your Cart!",
              items: `<div><strong>${product.name}</strong>${product.selectedVariant ? ` (Variant: ${variantId})` : ''} has been added to your cart.</div>`,
              brand_name: "ToyStore",
              email_footer: "Continue shopping to find more amazing toys!",
            };

            emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_CART_TEMPLATE_ID, templateParams)
              .then(() => console.log("Add to Cart email sent"))
              .catch(err => console.error("Add to Cart email error:", err));
          }
        } catch (err) {
          console.error('Error adding to DB cart:', err);
          showToast(err.message || 'Error adding to cart', 'error');
        }
      } else {
        setCart((prev) => {
          const existing = prev.find((item) => item.id === product.id && (item.variant_id === variantId || item.selectedVariant?.variant_id === variantId));

          if (existing) {
            showToast(`${product.name} qty updated!`);
            return prev.map((item) =>
              (item.id === product.id && (item.variant_id === variantId || item.selectedVariant?.variant_id === variantId)) 
                ? { ...item, qty: (item.qty || 0) + 1 } 
                : item
            );
          }

          showToast(`${product.name} added to cart! 🛒`);
          return [...prev, { ...product, qty: 1 }];
        });
      }
    },
    [showToast]
  );

  const removeFromCart = useCallback(
    async (id, variantId = null) => {
      const user = currentUser;

      // 🛡️ Add console log to verify values before API call
      console.log(`[Cart] Attempting remove: productId=${id}, variantId=${variantId || 'none'}, customerId=${user?.id || 'guest'}`);

      if (user && user.id) {
        // 🛡️ FRONTEND FIX: Skip invalid/mangled IDs (e.g. PRDT00000000)
        const isMangled = String(id).startsWith("PRDT") && String(id).length > 7;

        if (!isMangled) {
          try {
            const url = variantId 
              ? `http://localhost:5000/api/cart/${user.id}/${id}?variantId=${variantId}`
              : `http://localhost:5000/api/cart/${user.id}/${id}`;
            
            const res = await fetch(url, { method: 'DELETE' });

            if (!res.ok) {
              if (res.status === 404) {
                 console.warn(`[API] Item ${id} not found in DB cart (expected if already deleted)`);
              } else {
                 const errData = await res.json().catch(() => ({}));
                 console.error('[API] Delete failed:', errData.error || 'Unknown error');
              }
            }
          } catch (err) {
            console.error('[Cart] API connection error:', err);
            // Silent fail: do not crash UI if API fails
          }
        } else {
          console.warn(`[Cart] Preventing API call for mangled ID: ${id}`);
        }
      }

      // Always update local state to keep UI responsive
      setCart((prev) => prev.filter((item) => {
        const itemVariantId = item.variant_id || item.selectedVariant?.variant_id || null;
        return !(item.id === id && itemVariantId === variantId);
      }));
      showToast('Removed from cart', 'info');
    },
    [showToast]
  );

  const updateQty = useCallback(async (id, qty, variantId = null) => {
    if (qty < 1) return;

    const user = currentUser;

    if (user && user.id) {
      try {
        const res = await fetch('http://localhost:5000/api/cart/update-qty', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            customer_id: user.id,
            product_id: id,
            variant_id: variantId,
            quantity: qty,
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          // If the item is already gone from the DB (404), we should still proceed 
          // to update our local state to keep the UI in sync.
          if (res.status === 404) {
            console.warn('Item already removed from server cart');
          } else {
            throw new Error(data.error || 'Failed to update quantity');
          }
        }
      } catch (err) {
        console.error('Error updating DB cart qty:', err);
        showToast('Error updating quantity', 'error');
        return;
      }
    }

    setCart((prev) =>
      prev.map((item) => {
        const itemVariantId = item.variant_id || item.selectedVariant?.variant_id || null;
        return (item.id === id && itemVariantId === variantId) ? { ...item, qty } : item;
      })
    );
  }, [showToast]);

  const clearCart = useCallback(() => {
    setCart([]);
    showToast('Cart cleared', 'info');
  }, [showToast]);

  const toggleWishlist = useCallback(async (product) => {
    const user = currentUser;
    const variantId = product.selectedVariant?.variant_id || null;
    
    const isNowWishlisted = !wishlist.some((i) => {
        const itemVariantId = i.variant_id || i.selectedVariant?.variant_id || null;
        return i.id === product.id && itemVariantId === variantId;
    });

    if (user && user.id) {
      try {
        if (isNowWishlisted) {
          await fetch('http://localhost:5000/api/wishlist', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              customer_id: user.id,
              product_id: product.id,
              variant_id: variantId,
              name: product.name || 'Unknown Product',
              price: product.price || 0,
              image: product.image || (product.images && product.images[0]) || 'default.png',
              description: product.description || '',
              category: product.category || 'Uncategorized',
            }),
          });
        } else {
          const url = variantId 
            ? `http://localhost:5000/api/wishlist/${user.id}/${product.id}?variantId=${variantId}`
            : `http://localhost:5000/api/wishlist/${user.id}/${product.id}`;
          await fetch(url, {
            method: 'DELETE',
          });
        }
      } catch (err) {
        console.error('Error toggling DB wishlist:', err);
      }
    }

    setWishlist((prev) => {
      const exists = prev.find((item) => {
        const itemVariantId = item.variant_id || item.selectedVariant?.variant_id || null;
        return item.id === product.id && itemVariantId === variantId;
      });
      if (exists) {
        return prev.filter((item) => {
          const itemVariantId = item.variant_id || item.selectedVariant?.variant_id || null;
          return !(item.id === product.id && itemVariantId === variantId);
        });
      }
      return [...prev, product];
    });
  }, [wishlist]);

  const isWishlisted = useCallback((id, variantId = null) => {
    return wishlist.some((item) => {
        const itemVariantId = item.variant_id || item.selectedVariant?.variant_id || null;
        return item.id === id && itemVariantId === variantId;
    });
  }, [wishlist]);

  const isInCart = useCallback((id, variantId = null) => {
    return cart.some((item) => {
        const itemVariantId = item.variant_id || item.selectedVariant?.variant_id || null;
        return item.id === id && itemVariantId === variantId;
    });
  }, [cart]);

  const cartTotal = cart.reduce((sum, item) => sum + parsePrice(item.price) * (item.qty || 0), 0);
  const cartCount = cart.reduce((sum, item) => sum + (item.qty || 0), 0);

  return (
    <StoreContext.Provider
      value={{
        cart,
        wishlist,
        toast,
        addToCart,
        removeFromCart,
        updateQty,
        clearCart,
        toggleWishlist,
        isWishlisted,
        isInCart,
        cartTotal,
        cartCount,
        orders,
        addOrder,
        currentUser,
        currentSeller,
        login,
        logout,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}