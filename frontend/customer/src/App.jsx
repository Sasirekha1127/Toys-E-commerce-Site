import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { StoreProvider } from './context/StoreContext.jsx';
import UserLayout from './layouts/UserLayout';
import UserRouteGuard from './components/user/UserRouteGuard.jsx';

import Home from './pages/user/Home';
import Cart from './pages/user/Cart';
import Wishlist from './pages/user/Wishlist';
import ProductDetails from './pages/user/ProductDetails';
import AuthPage from './pages/user/AuthPage';
import CheckoutPage from './pages/user/CheckoutPage';
import UserPage from './pages/user/UserPage';
import CategoryProductsPage from './pages/user/CategoryProductsPage';
import AgeCategory from './pages/user/AgeCategory';

export default function App() {
  return (
    <StoreProvider>
      <Routes>
        {/* Default */}
        <Route path="/" element={<Navigate to="/auth" replace />} />

        {/* Auth */}
        <Route path="/auth" element={<AuthPage />} />

        {/* User */}
        <Route
          path="/home"
          element={
            <UserRouteGuard>
              <UserLayout>
                <Home />
              </UserLayout>
            </UserRouteGuard>
          }
        />
        <Route
          path="/product/:id"
          element={
            <UserRouteGuard>
              <UserLayout>
                <ProductDetails />
              </UserLayout>
            </UserRouteGuard>
          }
        />
        <Route
          path="/cart"
          element={
            <UserRouteGuard>
              <UserLayout>
                <Cart />
              </UserLayout>
            </UserRouteGuard>
          }
        />
        <Route
          path="/wishlist"
          element={
            <UserRouteGuard>
              <UserLayout>
                <Wishlist />
              </UserLayout>
            </UserRouteGuard>
          }
        />
        <Route
          path="/profile"
          element={
            <UserRouteGuard>
              <UserLayout>
                <UserPage />
              </UserLayout>
            </UserRouteGuard>
          }
        />
        <Route
          path="/checkout"
          element={
            <UserRouteGuard>
              <UserLayout>
                <CheckoutPage />
              </UserLayout>
            </UserRouteGuard>
          }
        />
        <Route
          path="/category/:slug"
          element={
            <UserRouteGuard>
              <UserLayout>
                <CategoryProductsPage />
              </UserLayout>
            </UserRouteGuard>
          }
        />

        {/* Age category */}
        <Route
          path="/age/:slug"
          element={
            <UserRouteGuard>
              <UserLayout>
                <AgeCategory />
              </UserLayout>
            </UserRouteGuard>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/auth" replace />} />
      </Routes>
    </StoreProvider>
  );
}