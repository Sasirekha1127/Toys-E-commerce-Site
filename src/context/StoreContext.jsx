import React, { createContext, useState, useEffect, useCallback } from 'react';

export const StoreContext = createContext(null);

export function StoreProvider({ children }) {
  const [cart, setCart] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('toystore-cart')) || [];
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

  const getCurrentUser = () => {
    try {
      return JSON.parse(localStorage.getItem('toyCurrentUser'));
    } catch {
      return null;
    }
  };

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const syncWithDB = useCallback(async () => {
    const user = getCurrentUser();
    if (!user || !user.id) return;

    try {
      const alreadySynced = localStorage.getItem("cart_synced");

      const localCart = JSON.parse(localStorage.getItem('toystore-cart')) || [];
      const localWishlist = JSON.parse(localStorage.getItem('toystore-wishlist')) || [];

      // 🚀 IMPORTANT FIX
      if (localCart.length > 0 && !alreadySynced) {
        for (const item of localCart) {
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
        }

        localStorage.setItem("cart_synced", "true"); 
        localStorage.removeItem('toystore-cart');
      }
      // Merge local wishlist into DB
      if (localWishlist.length > 0) {
        for (const item of localWishlist) {
          try {
            await fetch('http://localhost:5000/api/wishlist', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                customer_id: user.id,
                product_id: item.id,
                name: item.name,
                price: item.price,
                image: item.image,
                description: item.description,
                category: item.category,
              }),
            });
          } catch (e) {
            console.error('Failed to sync wishlist item:', item.id, e);
          }
        }
        localStorage.removeItem('toystore-wishlist');
      }

      // Final DB fetch
      const finalCartRes = await fetch(`http://localhost:5000/api/cart/${user.id}`);
      const finalCartData = await finalCartRes.json();

      if (finalCartData.cart) {
        setCart(
          finalCartData.cart.map((i) => ({
            ...i,
            id: i.product_id,
            qty: i.quantity,
            price: Number(i.unit_price),
          }))
        );
      }

      const finalWishlistRes = await fetch(`http://localhost:5000/api/wishlist/${user.id}`);
      const finalWishlistData = await finalWishlistRes.json();

      if (finalWishlistData.wishlist) {
        setWishlist(
          finalWishlistData.wishlist.map((i) => ({
            ...i,
            id: i.product_id,
            price: Number(i.price)
          }))
        );
      }
    } catch (err) {
      console.error('Error syncing with DB:', err);
    }
  }, []);

  useEffect(() => {
    syncWithDB();
  }, [syncWithDB]);

  useEffect(() => {
    localStorage.setItem('toystore-cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('toystore-wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  useEffect(() => {
    localStorage.setItem('toystore-orders', JSON.stringify(orders));
  }, [orders]);

  const addOrder = useCallback((order) => {
    setOrders((prev) => [order, ...prev]);
  }, []);

  const addToCart = useCallback(
    async (product) => {
      const user = getCurrentUser();

      if (user && user.id) {
        try {
          const res = await fetch('http://localhost:5000/api/cart', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              customer_id: user.id,
              product_id: product.id,
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
            throw new Error(data.error || 'Failed to add to cart');
          }

          setCart((prev) => {
            const exists = prev.find((i) => i.id === product.id);

            if (exists) {
              return prev.map((i) =>
                i.id === product.id ? { ...i, qty: (i.qty || 0) + 1 } : i
              );
            }

            return [...prev, { ...product, qty: 1 }];
          });

          showToast(`${product.name} added to cart! 🛒`);
        } catch (err) {
          console.error('Error adding to DB cart:', err);
          showToast(err.message || 'Error adding to cart', 'error');
        }
      } else {
        setCart((prev) => {
          const existing = prev.find((item) => item.id === product.id);

          if (existing) {
            showToast(`${product.name} qty updated!`);
            return prev.map((item) =>
              item.id === product.id ? { ...item, qty: (item.qty || 0) + 1 } : item
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
    async (id) => {
      const user = getCurrentUser();

      if (user && user.id) {
        try {
          const res = await fetch(`http://localhost:5000/api/cart/${user.id}/${id}`, {
            method: 'DELETE',
          });

          const data = await res.json();

          if (!res.ok) {
            throw new Error(data.error || 'Failed to remove item');
          }
        } catch (err) {
          console.error('Error removing from DB cart:', err);
          showToast('Error removing from cart', 'error');
          return;
        }
      }

      setCart((prev) => prev.filter((item) => item.id !== id));
      showToast('Removed from cart', 'info');
    },
    [showToast]
  );

  const updateQty = useCallback(async (id, qty) => {
    if (qty < 1) return;

    const user = getCurrentUser();

    if (user && user.id) {
      try {
        const res = await fetch('http://localhost:5000/api/cart/update-qty', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            customer_id: user.id,
            product_id: id,
            quantity: qty,
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || 'Failed to update quantity');
        }
      } catch (err) {
        console.error('Error updating DB cart qty:', err);
        showToast('Error updating quantity', 'error');
        return;
      }
    }

    setCart((prev) =>
      prev.map((item) => (item.id === id ? { ...item, qty } : item))
    );
  }, [showToast]);

  const clearCart = useCallback(() => {
    setCart([]);
    showToast('Cart cleared', 'info');
  }, [showToast]);

  const toggleWishlist = useCallback(async (product) => {
    const user = getCurrentUser();
    const isNowWishlisted = !wishlist.some((i) => i.id === product.id);

    if (user && user.id) {
      try {
        if (isNowWishlisted) {
          await fetch('http://localhost:5000/api/wishlist', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              customer_id: user.id,
              product_id: product.id,
              name: product.name,
              price: product.price,
              image: product.image,
              description: product.description,
              category: product.category,
            }),
          });
        } else {
          await fetch(`http://localhost:5000/api/wishlist/${user.id}/${product.id}`, {
            method: 'DELETE',
          });
        }
      } catch (err) {
        console.error('Error toggling DB wishlist:', err);
      }
    }

    setWishlist((prev) => {
      const exists = prev.find((item) => item.id === product.id);
      if (exists) {
        return prev.filter((item) => item.id !== product.id);
      }
      return [...prev, product];
    });
  }, [wishlist]);

  const isWishlisted = useCallback((id) => {
    return wishlist.some((item) => item.id === id);
  }, [wishlist]);

  const isInCart = useCallback((id) => {
    return cart.some((item) => item.id === id);
  }, [cart]);

  const cartTotal = cart.reduce((sum, item) => sum + Number(item.price) * (item.qty || 0), 0);
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
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}