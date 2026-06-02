import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { SellerOnboardingProvider } from './context/SellerOnboardingContext.jsx';
import SellerLayout from './layouts/SellerLayout';
import SellerRouteGuard from './components/seller/SellerRouteGuard.jsx';

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
    <SellerOnboardingProvider>
      <Routes>
        {/* Default */}
        <Route path="/" element={<Navigate to="/seller" replace />} />

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
        <Route path="*" element={<Navigate to="/seller" replace />} />
      </Routes>
    </SellerOnboardingProvider>
  );
}