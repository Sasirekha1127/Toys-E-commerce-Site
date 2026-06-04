import React, { useEffect, useMemo, useState } from 'react';
import { IndianRupee, Wallet, Clock3, Receipt, Download } from 'lucide-react';



const defaultPayments = {
  summary: {
    totalEarnings: 125430,
    thisMonth: 28450,
    pendingPayout: 9200,
    totalTransactions: 18,
  },
  payouts: [
    {
      id: 'PAY-1001',
      date: '2026-04-08',
      amount: 12500,
      status: 'Paid',
      method: 'Bank Transfer',
    },
    {
      id: 'PAY-1002',
      date: '2026-04-05',
      amount: 9200,
      status: 'Pending',
      method: 'Bank Transfer',
    },
  ],
  transactions: [
    {
      id: 'TXN-9001',
      orderId: 'ORD-8821',
      customer: 'Priya Mehta',
      amount: 2499,
      type: 'Credit',
      status: 'Success',
      date: '2026-04-09',
    },
    {
      id: 'TXN-9002',
      orderId: 'ORD-8819',
      customer: 'Amit Verma',
      amount: 4999,
      type: 'Credit',
      status: 'Success',
      date: '2026-04-08',
    },
    {
      id: 'TXN-9003',
      orderId: 'ORD-8816',
      customer: 'Riya',
      amount: 1299,
      type: 'Refund',
      status: 'Processed',
      date: '2026-04-06',
    },
  ],
};

function fmt(n) {
  return new Intl.NumberFormat('en-IN').format(Number(n || 0));
}

function getInitialMockPayments() {
  return defaultPayments;
}

function StatusBadge({ status }) {
  const s = (status || '').toLowerCase();
  const map = {
    paid: 'badge-green',
    pending: 'badge-orange',
    success: 'badge-green',
    processed: 'badge-blue',
    completed: 'badge-green',
    processing: 'badge-orange',
    failed: 'badge-red',
  };

  return (
    <span className={`badge ${map[s] || 'badge-gray'} whitespace-nowrap capitalize`}>
      {status}
    </span>
  );
}

export default function SellerPayments() {
  const currentSeller = useMemo(() => JSON.parse(localStorage.getItem('toyCurrentSeller') || '{}'), []);
  const isDemo = currentSeller?.email === 'kidstoys@gmail.com';

  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState({
    summary: {
      totalEarnings: 0,
      thisMonth: 0,
      pendingPayout: 0,
      totalTransactions: 0,
    },
    payouts: [],
    transactions: [],
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!currentSeller?.seller_id && !isDemo) return;
      
      setLoading(true);
      try {
        const sid = currentSeller.seller_id;
        
        const [summaryRes, payoutsRes, transRes] = await Promise.all([
          fetch(`http://localhost:5000/api/seller/finance/summary?seller_id=${sid}`),
          fetch(`http://localhost:5000/api/seller/finance/payouts?seller_id=${sid}`),
          fetch(`http://localhost:5000/api/seller/finance/transactions?seller_id=${sid}`)
        ]);

        const summaryData = await summaryRes.json();
        const payoutsData = await payoutsRes.json();
        const transData = await transRes.json();

        setPayments({
          summary: {
            totalEarnings: summaryData.totalEarnings || 0,
            thisMonth: summaryData.thisMonth || 0,
            pendingPayout: summaryData.pendingPayout || 0,
            totalTransactions: summaryData.totalTransactions || 0,
            completedPayout: summaryData.completedPayout || 0
          },
          payouts: payoutsData.payouts || [],
          transactions: transData.transactions || []
        });
      } catch (err) {
        console.error('Error fetching payment data:', err);
      } finally {
        setLoading(false);
      }
    };

    if (!isDemo) {
      fetchData();
    } else {
      setPayments(getInitialMockPayments());
      setLoading(false);
    }
  }, [currentSeller, isDemo]);

  const summary = useMemo(() => payments.summary, [payments]);

  const downloadSettlementReport = () => {
    const lines = [
      'TOYSTORE SELLER SETTLEMENT REPORT',
      '--------------------------------',
      `Total Earnings: ₹${fmt(summary.totalEarnings)}`,
      `This Month: ₹${fmt(summary.thisMonth)}`,
      `Pending Payout: ₹${fmt(summary.pendingPayout)}`,
      `Total Transactions: ${summary.totalTransactions}`,
      '',
      'PAYOUTS',
      '-------',
      ...payments.payouts.map(
        (p) =>
          `${p.id} | ${p.date} | ₹${fmt(p.amount)} | ${p.status} | ${p.method}`
      ),
      '',
      'TRANSACTIONS',
      '------------',
      ...payments.transactions.map(
        (t) =>
          `${t.id} | ${t.orderId} | ${t.customer} | ₹${fmt(t.amount)} | ${t.type} | ${t.status} | ${t.date}`
      ),
    ];

    const blob = new Blob([lines.join('\n')], {
      type: 'text/plain;charset=utf-8',
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'settlement-report.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-5 overflow-x-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Payments & Earnings</h2>
          <p className="text-sm text-gray-500">
            Track earnings, payouts, transactions and settlement reports
          </p>
        </div>

        <button
          onClick={downloadSettlementReport}
          className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 bg-orange-500 text-white font-semibold hover:bg-orange-600 transition"
        >
          <Download size={16} />
          Download Report
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="card p-4 rounded-2xl">
          <div className="flex items-center gap-2 text-gray-500 text-xs font-semibold uppercase tracking-wide">
            <IndianRupee size={15} />
            Total Earnings
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mt-2 break-words">
            ₹{fmt(summary.totalEarnings)}
          </h3>
        </div>

        <div className="card p-4 rounded-2xl text-green-600">
          <div className="flex items-center gap-2 text-gray-500 text-xs font-semibold uppercase tracking-wide">
            <Wallet size={15} />
            This Month
          </div>
          <h3 className="text-2xl font-bold mt-2 break-words text-green-600">
            ₹{fmt(summary.thisMonth)}
          </h3>
        </div>

        <div className="card p-4 rounded-2xl">
          <div className="flex items-center gap-2 text-gray-500 text-xs font-semibold uppercase tracking-wide">
            <Clock3 size={15} />
            Pending Payout
          </div>
          <h3 className="text-2xl font-bold text-orange-500 mt-2 break-words">
            ₹{fmt(summary.pendingPayout)}
          </h3>
        </div>

        <div className="card p-4 rounded-2xl">
          <div className="flex items-center gap-2 text-gray-500 text-xs font-semibold uppercase tracking-wide">
            <Receipt size={15} />
            Completed Payout
          </div>
          <h3 className="text-2xl font-bold text-blue-600 mt-2 break-words">
            ₹{fmt(summary.completedPayout)}
          </h3>
        </div>

        <div className="card p-4 rounded-2xl">
          <div className="flex items-center gap-2 text-gray-500 text-xs font-semibold uppercase tracking-wide">
            <Receipt size={15} />
            Transactions
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mt-2">
            {summary.totalTransactions}
          </h3>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Recent Transactions Table */}
        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center">
            <p className="text-base font-semibold text-gray-900">Recent Transactions</p>
            <span className="text-xs text-gray-500">Customer payments & order status</span>
          </div>

          <div className="w-full overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead className="bg-gray-50/70 border-b border-gray-100">
                <tr>
                  <th className="table-th text-left px-5">Txn ID</th>
                  <th className="table-th text-left">Order ID</th>
                  <th className="table-th text-left">Customer</th>
                  <th className="table-th text-left">Amount</th>
                  <th className="table-th text-left">Type</th>
                  <th className="table-th text-left px-5">Status</th>
                </tr>
              </thead>

              <tbody>
                {payments.transactions.length > 0 ? (
                  payments.transactions.map((t) => (
                    <tr key={t.id} className="table-row">
                      <td className="table-td px-5 font-medium text-orange-600">
                        TXN-{t.id}
                      </td>
                      <td className="table-td text-gray-700">
                        ORD-{t.order_id}
                      </td>
                      <td className="table-td text-gray-700">
                        {t.customer || 'Guest Customer'}
                      </td>
                      <td className="table-td font-semibold">
                        ₹{fmt(t.amount)}
                      </td>
                      <td className="table-td text-gray-700">
                        {t.type}
                      </td>
                      <td className="table-td px-5">
                        <StatusBadge status={t.status} />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="py-10 text-center text-gray-500">No transactions found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Payouts Table */}
        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center">
            <p className="text-base font-semibold text-gray-900">Payout History</p>
            <span className="text-xs text-gray-500">Money payable to you</span>
          </div>

          <div className="w-full overflow-x-auto">
            <table className="w-full min-w-[1000px]">
              <thead className="bg-gray-50/70 border-b border-gray-100">
                <tr>
                  <th className="table-th text-left px-5">Payout ID</th>
                  <th className="table-th text-left">Order ID</th>
                  <th className="table-th text-left">Gross Amt</th>
                  <th className="table-th text-left">Commission</th>
                  <th className="table-th text-left">Net Payout</th>
                  <th className="table-th text-left">Status</th>
                  <th className="table-th text-left px-5">Payout Date</th>
                </tr>
              </thead>

              <tbody>
                {payments.payouts.length > 0 ? (
                  payments.payouts.map((p) => (
                    <tr key={p.payout_id} className="table-row">
                      <td className="table-td px-5 font-medium text-orange-600">
                        PAY-{p.payout_id}
                      </td>
                      <td className="table-td text-gray-700">
                        ORD-{p.order_id}
                      </td>
                      <td className="table-td text-gray-700">
                        ₹{fmt(p.sale_amount)}
                      </td>
                      <td className="table-td text-red-500">
                        -₹{fmt(p.commission_amount)}
                      </td>
                      <td className="table-td font-bold text-green-600">
                        ₹{fmt(p.payout_amount)}
                      </td>
                      <td className="table-td">
                        <StatusBadge status={p.status} />
                      </td>
                      <td className="table-td px-5 text-gray-500">
                        {p.date ? new Date(p.date).toLocaleDateString() : '-'}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="py-10 text-center text-gray-500">No payouts found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="card p-4 sm:hidden">
        <p className="text-sm font-semibold text-gray-900 mb-3">Transaction Details</p>
        <div className="space-y-3">
          {payments.transactions.map((t) => (
            <div key={t.id} className="rounded-2xl border border-gray-100 p-3">
              <div className="flex items-center justify-between gap-2">
                <p className="font-medium text-orange-600">{t.id}</p>
                <StatusBadge status={t.status} />
              </div>
              <div className="mt-2 space-y-1 text-sm text-gray-600">
                <p>Order: {t.orderId}</p>
                <p>Customer: {t.customer}</p>
                <p>Amount: ₹{fmt(t.amount)}</p>
                <p>Type: {t.type}</p>
                <p>Date: {t.date}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}