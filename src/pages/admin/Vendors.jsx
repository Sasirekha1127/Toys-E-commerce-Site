import React from 'react';
import { useAdmin } from '../../context/AdminContext';
import { Store, Phone, Mail, Package, Users, ShieldCheck, TrendingUp, Search, Filter, Globe } from 'lucide-react';
import { StatCard, SectionHeader, StatusBadge, Avatar } from '../../components/admin/ui/index.jsx';

export default function Vendors() {
  const { adminVendors, updateVendorStatus } = useAdmin();

  const handleVerifyToggle = (id, isVerified) => {
    updateVendorStatus(id, isVerified ? 'Verified' : 'Pending');
  };

  const verifiedCount = adminVendors.filter(v => v.status === 'Verified').length;
  const totalProducts = adminVendors.reduce((sum, v) => sum + (v.total_products || 0), 0);

  return (
    <div className="p-4 space-y-6 page-enter">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Vendors</h1>
        <p className="text-sm text-gray-500 mt-1">Manage and monitor seller performance and access</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard 
          icon={<Users size={22} />} 
          label="Total Vendors" 
          value={adminVendors.length.toString()} 
          growth={4.2} 
          color="brand" 
          delay={0} 
        />
        <StatCard 
          icon={<ShieldCheck size={22} />} 
          label="Verified Sellers" 
          value={verifiedCount.toString()} 
          growth={12.5} 
          color="green" 
          delay={80} 
        />
        <StatCard 
          icon={<Package size={22} />} 
          label="Vendor Products" 
          value={totalProducts.toString()} 
          growth={8.1} 
          color="blue" 
          delay={160} 
        />
        <StatCard 
          icon={<TrendingUp size={22} />} 
          label="Vendor Revenue" 
          value="₹4.8L" 
          growth={15.3} 
          color="purple" 
          delay={240} 
        />
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <SectionHeader title="Active Sellers" subtitle="Managing your partner ecosystem" />
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
            <input type="text" placeholder="Search vendors..." className="pl-9 pr-4 py-2 text-xs border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-100 focus:border-brand-400 outline-none w-full sm:w-64 transition-all" />
          </div>
          <button className="p-2 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
            <Filter size={14} className="text-gray-500" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {adminVendors && adminVendors.length > 0 ? (
          adminVendors.map((vendor) => (
            <div key={vendor.seller_id} className="card p-5 flex flex-col group hover:-translate-y-1 transition-all duration-300">
              <div className="flex justify-between items-start mb-4">
                <Avatar name={vendor.store_name || vendor.name} size="lg" className="ring-4 ring-orange-50" />
                <StatusBadge status={vendor.status || 'Pending'} />
              </div>
              
              <div className="mb-4">
                <h3 className="font-bold text-gray-800 text-lg group-hover:text-brand-600 transition-colors">
                  {vendor.store_name || vendor.name || 'Unnamed Vendor'}
                </h3>
                <p className="text-xs text-gray-400 font-medium mt-0.5 flex items-center gap-1">
                  <Globe size={10} /> ID: {vendor.seller_id.slice(0, 8).toUpperCase()}
                </p>
              </div>
              
              <div className="space-y-2.5 flex-1 mb-6">
                <div className="flex items-center gap-2 text-xs text-gray-500 hover:text-gray-800 transition-colors cursor-pointer">
                  <Mail size={14} className="text-gray-400" />
                  <span className="truncate">{vendor.email}</span>
                </div>
                {vendor.contact_number && (
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Phone size={14} className="text-gray-400" />
                    <span>{vendor.contact_number}</span>
                  </div>
                )}
                <div className="bg-orange-50 rounded-xl p-2.5 mt-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Package size={14} className="text-orange-500" />
                    <span className="text-xs font-bold text-orange-700">Inventory</span>
                  </div>
                  <span className="text-xs font-black text-orange-800">{vendor.total_products || 0} items</span>
                </div>
              </div>

              <button 
                onClick={() => handleVerifyToggle(vendor.seller_id, vendor.status !== 'Verified')}
                className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm ${
                  vendor.status === 'Verified' 
                  ? 'bg-gray-100 text-gray-700 hover:bg-gray-200 active:scale-95' 
                  : 'bg-brand-600 text-white hover:bg-brand-700 shadow-brand-100 hover:shadow-lg active:scale-95'
                }`}
              >
                {vendor.status === 'Verified' ? 'Revoke Access' : 'Approve Access'}
              </button>
            </div>
          ))
        ) : (
          <div className="col-span-full py-20 text-center card bg-gray-50/50">
            <div className="flex flex-col items-center justify-center text-gray-400">
              <Store size={48} className="mb-3 opacity-20" />
              <p className="text-sm font-medium">No vendors registered yet</p>
              <p className="text-xs mt-1">Sellers will appear here once they complete onboarding</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
