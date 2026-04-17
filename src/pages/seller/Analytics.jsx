import React from "react";
import { BarChart2, TrendingUp, Eye, ShoppingCart } from "lucide-react";

/* Dummy Data (later connect API) */
const analyticsData = {
  revenue: 20495,
  orders: 8,
  visitors: 1200,
  conversionRate: 3.2,
  topProducts: [
    { name: "Teddy Bear", sales: 120 },
    { name: "RC Car", sales: 95 },
    { name: "Science Kit", sales: 60 },
  ],
};

export default function Analytics() {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-gray-500 text-sm">
          Track your store performance
        </p>
      </div>

      {/* Top Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        <Card
          title="Revenue"
          value={`₹${analyticsData.revenue}`}
          icon={<TrendingUp className="text-green-500" />}
        />

        <Card
          title="Orders"
          value={analyticsData.orders}
          icon={<ShoppingCart className="text-blue-500" />}
        />

        <Card
          title="Visitors"
          value={analyticsData.visitors}
          icon={<Eye className="text-purple-500" />}
        />

        <Card
          title="Conversion Rate"
          value={`${analyticsData.conversionRate}%`}
          icon={<BarChart2 className="text-orange-500" />}
        />
      </div>

      {/* Sales Chart (UI only) */}
      <div className="card p-6">
        <h2 className="font-semibold mb-4">Sales Overview</h2>
        <div className="h-40 flex items-end gap-3">
          {[40, 60, 30, 80, 50, 70].map((h, i) => (
            <div
              key={i}
              className="flex-1 bg-orange-400 rounded"
              style={{ height: `${h}%` }}
            />
          ))}
        </div>
      </div>

      {/* Top Products */}
      <div className="card p-6">
        <h2 className="font-semibold mb-4">Top Products</h2>
        <div className="space-y-3">
          {analyticsData.topProducts.map((p, i) => (
            <div key={i} className="flex justify-between text-sm">
              <p className="text-gray-700">{p.name}</p>
              <p className="font-semibold">{p.sales} sales</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* Reusable Card */
function Card({ title, value, icon }) {
  return (
    <div className="card p-5 flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <h2 className="text-xl font-bold">{value}</h2>
      </div>
      <div className="bg-gray-100 p-3 rounded-lg">{icon}</div>
    </div>
  );
}