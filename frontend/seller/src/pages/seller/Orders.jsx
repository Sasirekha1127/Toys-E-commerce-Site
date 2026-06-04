import React, { useEffect, useMemo, useState } from "react";
import { Search, Download, Truck, X } from "lucide-react";
import jsPDF from "jspdf";
import { sellerOrders as initialOrders } from "../../data/seller/index.js";

const PAGE_SIZE = 5;

function fmt(n) {
  return new Intl.NumberFormat("en-IN").format(Number(n || 0));
}

function StatusBadge({ status }) {
  const map = {
    Delivered: "badge-green",
    Shipped: "badge-blue",
    Pending: "badge-orange",
    Processing: "badge-gray",
    Cancelled: "badge-red",
    Returned: "badge-red",
    Paid: "badge-green",
    Refunded: "badge-gray",
    Unpaid: "badge-orange",
  };

  return (
    <span className={`badge ${map[status] || "badge-gray"}`}>
      {status}
    </span>
  );
}

const statusOptions = [
  "All",
  "Pending",
  "Processing",
  "Shipped",
  "Delivered",
  "Cancelled",
  "Returned",
];

const editableStatuses = [
  "Pending",
  "Processing",
  "Shipped",
  "Delivered",
  "Cancelled",
  "Returned",
];

function normalizeOrders(list) {
  return list.map((item, index) => ({
    id: item.id || `ORD-${8821 + index}`,
    customer: item.customer || "Customer",
    product: item.product || "Toy Product",
    amount: Number(item.amount || 0),
    payment: item.payment || "Paid",
    status: item.status || "Pending",
    date: item.date || new Date().toLocaleDateString("en-IN"),
    trackingNumber: item.trackingNumber || `TRK${100000 + index}`,
    courier: item.courier || "Delhivery",
    shippingAddress:
      item.shippingAddress ||
      "No. 21, Main Road, Chennai, Tamil Nadu - 600001",
    invoiceNumber:
      item.invoiceNumber || `INV-${item.id || `ORD-${8821 + index}`}`,
  }));
}

function getInitialMockOrders() {
  return normalizeOrders(initialOrders);
}

export default function SellerOrders() {
  const currentSeller = useMemo(() => JSON.parse(localStorage.getItem('toyCurrentSeller') || '{}'), []);
  const isDemo = currentSeller?.email === 'kidstoys@gmail.com';

  const [orders, setOrders] = useState(isDemo ? getInitialMockOrders() : []);
  const [loading, setLoading] = useState(!isDemo);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [sort, setSort] = useState("latest");
  const [page, setPage] = useState(1);

  const [showShippingModal, setShowShippingModal] = useState(false);
  const [activeOrderId, setActiveOrderId] = useState(null);

  const fetchOrders = async () => {
    if (isDemo || !currentSeller?.id) {
       setLoading(false);
       return;
    };
    
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/orders?seller_id=${currentSeller.id}`);
      const data = await res.json();
      if (data.orders) {
        const mapped = data.orders.map((o, idx) => ({
          id: String(o.order_id || o.id),
          customer: o.customer_name || null,
          customerCode: o.customer_db_id ? `CUS${String(o.customer_db_id).padStart(3, '0')}` : (o.customer_id || `CUS${String(idx + 1).padStart(3, '0')}`),
          product: o.product || (o.items && o.items.length > 0 ? o.items[0].name : 'Products'),
          amount: Number(o.total_amount || o.amount || 0),
          payment: o.payment_status || o.payment || 'Paid',
          status: o.order_status || o.status || 'Pending',
          date: o.ordered_at ? new Date(o.ordered_at).toLocaleDateString("en-IN") : (o.date || new Date().toLocaleDateString("en-IN")),
          trackingNumber: o.tracking_number || `TRK${String(o.order_id || o.id).slice(-6)}`,
          courier: o.courier || 'Delhivery',
          shippingAddress: o.shipping_address || 'Address not provided',
          invoiceNumber: o.invoice_id || `INV-${String(o.order_id || o.id).slice(-6)}`,
        }));
        setOrders(mapped);
      }
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [currentSeller?.id, isDemo]);

  const activeOrder = useMemo(
    () => orders.find((o) => o.id === activeOrderId),
    [orders, activeOrderId]
  );

  /* 🔍 Filter + Sort */
  const filtered = useMemo(() => {
    let result = orders.filter((o) => {
      const term = search.toLowerCase();

      return (
        String(o.id).toLowerCase().includes(term) ||
        o.customer.toLowerCase().includes(term) ||
        o.customerCode.toLowerCase().includes(term) ||
        o.product.toLowerCase().includes(term)
      ) && (filterStatus === "All" || o.status === filterStatus);
    });

    if (sort === "latest") {
      result.sort((a, b) => new Date(b.date) - new Date(a.date));
    } else if (sort === "amount") {
      result.sort((a, b) => b.amount - a.amount);
    }

    return result;
  }, [orders, search, filterStatus, sort]);

  /* 📄 Pagination */
  const paginatedOrders = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  /* 📊 Stats */
  const stats = useMemo(() => {
    return {
      total: orders.length,
      pending: orders.filter((o) =>
        ["Pending", "Processing"].includes(o.status)
      ).length,
      shipped: orders.filter((o) => o.status === "Shipped").length,
      delivered: orders.filter((o) => o.status === "Delivered").length,
      revenue: orders.reduce((s, o) => s + o.amount, 0),
    };
  }, [orders]);

  /* 🔄 Status Update */
  const handleStatusChange = async (id, status) => {
    try {
      const res = await fetch(`http://localhost:5000/api/orders/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_status: status })
      });
      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) => (o.id === id ? { ...o, status } : o))
        );
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  /* 📦 Shipping Modal */
  const openShippingModal = (order) => {
    setActiveOrderId(order.id);
    setShowShippingModal(true);
  };

  const closeShippingModal = () => {
    setShowShippingModal(false);
    setActiveOrderId(null);
  };

  /* 📄 PDF Invoice */
  const downloadInvoice = (order) => {
    const doc = new jsPDF();

    doc.text("ToyStore Invoice", 20, 20);
    doc.text(`Order ID: ${order.id}`, 20, 40);
    doc.text(`Customer: ${order.customer}`, 20, 50);
    doc.text(`Product: ${order.product}`, 20, 60);
    doc.text(`Amount: ₹${fmt(order.amount)}`, 20, 70);

    doc.save(`${order.invoiceNumber}.pdf`);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-5">
      {/* Header */}
      <h2 className="text-xl font-bold">
        Orders ({stats.total}) · ₹{fmt(stats.revenue)}
      </h2>

      {/* Controls */}
      <div className="flex gap-3 flex-wrap">
        <input
          className="input"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className="input"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          {statusOptions.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>

        <select
          className="input"
          value={sort}
          onChange={(e) => setSort(e.target.value)}
        >
          <option value="latest">Latest</option>
          <option value="amount">Amount High → Low</option>
        </select>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead>
              <tr>
                <th className="table-th">Order</th>
                <th className="table-th">Customer</th>
                <th className="table-th">Amount</th>
                <th className="table-th">Status</th>
                <th className="table-th">Action</th>
              </tr>
            </thead>

            <tbody>
              {paginatedOrders.map((o) => (
                <tr key={o.id} className="table-row">
                  <td className="table-td font-bold text-orange-600">ORD{String(o.id).padStart(3, '0')}</td>
                  <td className="table-td">
                    {o.customer && <div className="font-semibold text-gray-900">{o.customer}</div>}
                    <div className={o.customer ? "text-[10px] text-gray-400 font-mono" : "font-semibold text-gray-800"}>
                      {o.customerCode}
                    </div>
                  </td>
                  <td className="table-td">₹{fmt(o.amount)}</td>
                  <td className="table-td">
                    <StatusBadge status={o.status} />
                  </td>

                  <td className="table-td flex gap-2">
                    <select
                      value={o.status}
                      onChange={(e) =>
                        handleStatusChange(o.id, e.target.value)
                      }
                    >
                      {editableStatuses.map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>

                    <button onClick={() => openShippingModal(o)}>
                      <Truck size={14} />
                    </button>

                    <button onClick={() => downloadInvoice(o)}>
                      <Download size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex justify-between p-4">
          <button disabled={page === 1} onClick={() => setPage(page - 1)}>
            Prev
          </button>

          <span>Page {page}</span>

          <button
            disabled={page * PAGE_SIZE >= filtered.length}
            onClick={() => setPage(page + 1)}
          >
            Next
          </button>
        </div>
      </div>

      {/* Shipping Modal */}
      {showShippingModal && activeOrder && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center">
          <div className="bg-white p-6 rounded-xl w-[400px]">
            <h3 className="font-bold mb-3">Shipping</h3>

            <input
              className="input mb-2"
              value={activeOrder.courier}
              onChange={(e) =>
                setOrders((prev) =>
                  prev.map((o) =>
                    o.id === activeOrder.id
                      ? { ...o, courier: e.target.value }
                      : o
                  )
                )
              }
            />

            <input
              className="input mb-2"
              value={activeOrder.trackingNumber}
              onChange={(e) =>
                setOrders((prev) =>
                  prev.map((o) =>
                    o.id === activeOrder.id
                      ? { ...o, trackingNumber: e.target.value }
                      : o
                  )
                )
              }
            />

            <button onClick={closeShippingModal}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}