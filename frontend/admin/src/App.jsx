import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AdminProvider } from './context/AdminContext.jsx';
import AdminLayout from './layouts/AdminLayout';

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

export default function App() {
  return (
    <AdminProvider>
      <Routes>
        {/* Default */}
        <Route path="/" element={<Navigate to="/admin" replace />} />

        {/* Admin routes wrapped in AdminLayout */}
        <Route
          path="/admin"
          element={
            <AdminLayout>
              <Dashboard />
            </AdminLayout>
          }
        />
        <Route
          path="/admin/products"
          element={
            <AdminLayout>
              <Products />
            </AdminLayout>
          }
        />
        <Route
          path="/admin/orders"
          element={
            <AdminLayout>
              <Orders />
            </AdminLayout>
          }
        />
        <Route
          path="/admin/customers"
          element={
            <AdminLayout>
              <Customers />
            </AdminLayout>
          }
        />
        <Route
          path="/admin/inventory"
          element={
            <AdminLayout>
              <Inventory />
            </AdminLayout>
          }
        />
        <Route
          path="/admin/settings"
          element={
            <AdminLayout>
              <Settings />
            </AdminLayout>
          }
        />
        <Route
          path="/admin/categories"
          element={
            <AdminLayout>
              <Categories />
            </AdminLayout>
          }
        />
        <Route
          path="/admin/reviews"
          element={
            <AdminLayout>
              <Reviews />
            </AdminLayout>
          }
        />
        <Route
          path="/admin/offers"
          element={
            <AdminLayout>
              <Offers />
            </AdminLayout>
          }
        />
        <Route
          path="/admin/payments"
          element={
            <AdminLayout>
              <Payments />
            </AdminLayout>
          }
        />
        <Route
          path="/admin/returns"
          element={
            <AdminLayout>
              <Returns />
            </AdminLayout>
          }
        />
        <Route
          path="/admin/vendors"
          element={
            <AdminLayout>
              <Vendors />
            </AdminLayout>
          }
        />
        <Route
          path="/admin/finance"
          element={
            <AdminLayout>
              <Finance />
            </AdminLayout>
          }
        />
        <Route
          path="/admin/sales"
          element={
            <AdminLayout>
              <SalesReports />
            </AdminLayout>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </AdminProvider>
  );
}