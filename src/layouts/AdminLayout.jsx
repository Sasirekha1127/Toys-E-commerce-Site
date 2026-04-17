import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/admin/layout/Sidebar';
import AdminHeader from '../components/admin/layout/AdminHeader';

export default function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem('toyCurrentUser') || 'null');
    if (!currentUser || currentUser.role !== 'admin') {
      navigate('/auth');
    }
  }, [navigate]);

  const currentUser = JSON.parse(localStorage.getItem('toyCurrentUser') || 'null');
  if (!currentUser || currentUser.role !== 'admin') {
    return null; // or loading spinner
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <AdminHeader onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
