import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { StoreProvider } from './context/StoreContext.jsx';
import { AdminProvider } from './context/AdminContext.jsx';
import { SellerOnboardingProvider } from './context/SellerOnboardingContext.jsx';
import UserLayout from './layouts/UserLayout';
import AdminLayout from './layouts/AdminLayout';
import SellerLayout from './layouts/SellerLayout';
import SellerRouteGuard from './components/seller/SellerRouteGuard.jsx';

import Home from './pages/user/Home';
import Cart from './pages/user/Cart';
import Wishlist from './pages/user/Wishlist';
import ProductDetails from './pages/user/ProductDetails';
import AuthPage from './pages/user/AuthPage';
import CheckoutPage from './pages/user/CheckoutPage';
import UserPage from './pages/user/UserPage';
import CategoryProductsPage from './pages/user/CategoryProductsPage';
import AgeCategory from './pages/user/AgeCategory';

import Dashboard from './pages/admin/Dashboard';
import Products from './pages/admin/Products';
import Orders from './pages/admin/Orders';
import Customers from './pages/admin/Customers';
import Inventory from './pages/admin/Inventory';
import Settings from './pages/admin/Settings';
import Categories from './pages/admin/Categories';
import Reviews from './pages/admin/Reviews';
import Offers from './pages/admin/Offers';

import SellerDashboard from './pages/seller/Dashboard';
import SellerProducts from './pages/seller/Products';
import SellerOrders from './pages/seller/Orders';
import SellerInventory from './pages/seller/Inventory';
import SellerReviews from './pages/seller/Reviews';
import SellerProfile from './pages/seller/Profile';
import SellerOnboarding from './pages/seller/Onboarding';

export default function App() {
  return (
    <StoreProvider>
      <SellerOnboardingProvider>
        <Routes>
          {/* Default */}
          <Route path="/" element={<Navigate to="/home" replace />} />

          {/* Auth */}
          <Route path="/auth" element={<AuthPage />} />

          {/* User */}
          <Route
            path="/home"
            element={
              <UserLayout>
                <Home />
              </UserLayout>
            }
          />
          <Route
            path="/product/:id"
            element={
              <UserLayout>
                <ProductDetails />
              </UserLayout>
            }
          />
          <Route
            path="/cart"
            element={
              <UserLayout>
                <Cart />
              </UserLayout>
            }
          />
          <Route
            path="/wishlist"
            element={
              <UserLayout>
                <Wishlist />
              </UserLayout>
            }
          />
          <Route
            path="/profile"
            element={
              <UserLayout>
                <UserPage />
              </UserLayout>
            }
          />
          <Route
            path="/checkout"
            element={
              <UserLayout>
                <CheckoutPage />
              </UserLayout>
            }
          />
          <Route
            path="/category/:slug"
            element={
              <UserLayout>
                <CategoryProductsPage />
              </UserLayout>
            }
          />

          {/* Age category */}
          <Route
            path="/age/:slug"
            element={
              <UserLayout>
                <AgeCategory />
              </UserLayout>
            }
          />

          {/* Admin */}
          <Route
            path="/admin"
            element={
              <AdminProvider>
                <AdminLayout>
                  <Dashboard />
                </AdminLayout>
              </AdminProvider>
            }
          />
          <Route
            path="/admin/products"
            element={
              <AdminProvider>
                <AdminLayout>
                  <Products />
                </AdminLayout>
              </AdminProvider>
            }
          />
          <Route
            path="/admin/orders"
            element={
              <AdminProvider>
                <AdminLayout>
                  <Orders />
                </AdminLayout>
              </AdminProvider>
            }
          />
          <Route
            path="/admin/customers"
            element={
              <AdminProvider>
                <AdminLayout>
                  <Customers />
                </AdminLayout>
              </AdminProvider>
            }
          />
          <Route
            path="/admin/inventory"
            element={
              <AdminProvider>
                <AdminLayout>
                  <Inventory />
                </AdminLayout>
              </AdminProvider>
            }
          />
          <Route
            path="/admin/settings"
            element={
              <AdminProvider>
                <AdminLayout>
                  <Settings />
                </AdminLayout>
              </AdminProvider>
            }
          />
          <Route
            path="/admin/categories"
            element={
              <AdminProvider>
                <AdminLayout>
                  <Categories />
                </AdminLayout>
              </AdminProvider>
            }
          />
          <Route
            path="/admin/reviews"
            element={
              <AdminProvider>
                <AdminLayout>
                  <Reviews />
                </AdminLayout>
              </AdminProvider>
            }
          />
          <Route
            path="/admin/offers"
            element={
              <AdminProvider>
                <AdminLayout>
                  <Offers />
                </AdminLayout>
              </AdminProvider>
            }
          />

          {/* Seller onboarding */}
          <Route
            path="/seller/onboarding"
            element={
              <SellerRouteGuard mode="onboarding">
                <SellerOnboarding />
              </SellerRouteGuard>
            }
          />

          {/* Seller protected routes */}
          <Route
            path="/seller"
            element={
              <SellerRouteGuard mode="dashboard">
                <SellerLayout>
                  <SellerDashboard />
                </SellerLayout>
              </SellerRouteGuard>
            }
          />
          <Route
            path="/seller/products"
            element={
              <SellerRouteGuard mode="dashboard">
                <SellerLayout>
                  <SellerProducts />
                </SellerLayout>
              </SellerRouteGuard>
            }
          />
          <Route
            path="/seller/orders"
            element={
              <SellerRouteGuard mode="dashboard">
                <SellerLayout>
                  <SellerOrders />
                </SellerLayout>
              </SellerRouteGuard>
            }
          />
          <Route
            path="/seller/inventory"
            element={
              <SellerRouteGuard mode="dashboard">
                <SellerLayout>
                  <SellerInventory />
                </SellerLayout>
              </SellerRouteGuard>
            }
          />
          <Route
            path="/seller/reviews"
            element={
              <SellerRouteGuard mode="dashboard">
                <SellerLayout>
                  <SellerReviews />
                </SellerLayout>
              </SellerRouteGuard>
            }
          />
          <Route
            path="/seller/profile"
            element={
              <SellerRouteGuard mode="dashboard">
                <SellerLayout>
                  <SellerProfile />
                </SellerLayout>
              </SellerRouteGuard>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
      </SellerOnboardingProvider>
    </StoreProvider>
  );
}