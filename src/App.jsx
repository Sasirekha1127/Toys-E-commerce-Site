import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { StoreProvider } from './context/StoreContext.jsx';
import { AdminProvider } from './context/AdminContext.jsx';
import { SellerOnboardingProvider } from './context/SellerOnboardingContext.jsx';
import UserLayout from './layouts/UserLayout';
import AdminLayout from './layouts/AdminLayout';
import SellerLayout from './layouts/SellerLayout';
import SellerRouteGuard from './components/seller/SellerRouteGuard.jsx';
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

import Dashboard from './pages/admin/Dashboard';
import Products from './pages/admin/Products';
import Orders from './pages/admin/Orders';
import Customers from './pages/admin/Customers';
import Inventory from './pages/admin/Inventory';
import Settings from './pages/admin/Settings';
import Categories from './pages/admin/Categories';
import Reviews from './pages/admin/Reviews';
import Offers from './pages/admin/Offers';
import Payments from './pages/admin/Payments';
import Returns from './pages/admin/Returns';
import Vendors from './pages/admin/Vendors';
import Finance from './pages/admin/Finance';
import SalesReports from './pages/admin/SalesReports';

import SellerDashboard from './pages/seller/Dashboard';
import SellerProducts from './pages/seller/Products';
import SellerOrders from './pages/seller/Orders';
import SellerInventory from './pages/seller/Inventory';
import SellerReviews from './pages/seller/Reviews';
import SellerProfile from './pages/seller/Profile';
import SellerOnboarding from './pages/seller/Onboarding';
import Analytics from './pages/seller/Analytics';
import SellerPayments from './pages/seller/SellerPayment';
import SellerDiscounts from './pages/seller/Discount';

export default function App() {


  return (
    <StoreProvider>
      <SellerOnboardingProvider>
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
          <Route
            path="/admin/payments"
            element={
              <AdminProvider>
                <AdminLayout>
                  <Payments />
                </AdminLayout>
              </AdminProvider>
            }
          />
          <Route
            path="/admin/returns"
            element={
              <AdminProvider>
                <AdminLayout>
                  <Returns />
                </AdminLayout>
              </AdminProvider>
            }
          />
          <Route
            path="/admin/vendors"
            element={
              <AdminProvider>
                <AdminLayout>
                  <Vendors />
                </AdminLayout>
              </AdminProvider>
            }
          />
          <Route
            path="/admin/finance"
            element={
              <AdminProvider>
                <AdminLayout>
                  <Finance />
                </AdminLayout>
              </AdminProvider>
            }
          />
          <Route
            path="/admin/sales"
            element={
              <AdminProvider>
                <AdminLayout>
                  <SalesReports />
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
          <Route
            path="/seller/payments"
            element={
              <SellerRouteGuard mode="dashboard">
                <SellerLayout>
                  <SellerPayments />
                </SellerLayout>
              </SellerRouteGuard>
            }
          />
          <Route
            path="/seller/analytics"
            element={
              <SellerRouteGuard mode="dashboard">
                <SellerLayout>
                  <Analytics />
                </SellerLayout>
              </SellerRouteGuard>
            }
          />
          <Route
            path="/seller/discounts"
            element={
              <SellerRouteGuard mode="dashboard">
                <SellerLayout>
                  <SellerDiscounts />
                </SellerLayout>
              </SellerRouteGuard>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/auth" replace />} />
        </Routes>
      </SellerOnboardingProvider>
    </StoreProvider>
  );
}