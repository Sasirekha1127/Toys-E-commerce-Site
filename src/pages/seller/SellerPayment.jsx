import React, { useEffect, useMemo, useState } from 'react';
import { IndianRupee, Wallet, Clock3, Receipt, Download } from 'lucide-react';

const STORAGE_KEY = 'toySellerPayments_v1';

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

function getInitialPayments() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    if (stored) return stored;
  } catch {}

  localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultPayments));
  return defaultPayments;
}

function StatusBadge({ status }) {
  const map = {
    Paid: 'badge-green',
    Pending: 'badge-orange',
    Success: 'badge-green',
    Processed: 'badge-blue',
    Failed: 'badge-red',
  };

  return (
    <span className={`badge ${map[status] || 'badge-gray'} whitespace-nowrap`}>
      {status}
    </span>
  );
}

export default function SellerPayments() {
  const [payments, setPayments] = useState(getInitialPayments);
  

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payments));
  }, [payments]);

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

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-4 rounded-2xl">
          <div className="flex items-center gap-2 text-gray-500 text-xs font-semibold uppercase tracking-wide">
            <IndianRupee size={15} />
            Total Earnings
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mt-2 break-words">
            ₹{fmt(summary.totalEarnings)}
          </h3>
        </div>

        <div className="card p-4 rounded-2xl">
          <div className="flex items-center gap-2 text-gray-500 text-xs font-semibold uppercase tracking-wide">
            <Wallet size={15} />
            This Month
          </div>
          <h3 className="text-2xl font-bold text-green-600 mt-2 break-words">
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
            Transactions
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mt-2">
            {summary.totalTransactions}
          </h3>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <div className="xl:col-span-2 card overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <p className="text-base font-semibold text-gray-900">Recent Transactions</p>
          </div>

          <div className="w-full">
            <table className="w-full table-fixed">
              <thead className="bg-gray-50/70 border-b border-gray-100">
                <tr>
                  <th className="table-th w-[18%]">Txn ID</th>
                  <th className="table-th w-[18%]">Order ID</th>
                  <th className="table-th w-[22%]">Customer</th>
                  <th className="table-th w-[14%]">Amount</th>
                  <th className="table-th w-[12%]">Type</th>
                  <th className="table-th w-[16%]">Status</th>
                </tr>
              </thead>

              <tbody>
                {payments.transactions.map((t) => (
                  <tr key={t.id} className="table-row">
                    <td className="table-td font-medium text-orange-600 truncate">
                      {t.id}
                    </td>

                    <td className="table-td text-gray-700 truncate">
                      {t.orderId}
                    </td>

                    <td className="table-td text-gray-700 truncate">
                      {t.customer}
                    </td>

                    <td className="table-td font-semibold whitespace-nowrap">
                      ₹{fmt(t.amount)}
                    </td>

                    <td className="table-td text-gray-700 truncate">
                      {t.type}
                    </td>

                    <td className="table-td">
                      <StatusBadge status={t.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="border-t border-gray-100 px-5 py-3 bg-gray-50/40">
            <p className="text-xs text-gray-400">
              Showing {payments.transactions.length} recent transactions
            </p>
          </div>
        </div>

        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <p className="text-base font-semibold text-gray-900">Payouts</p>
          </div>

          <div className="p-4 space-y-3">
            {payments.payouts.map((payout) => (
              <div
                key={payout.id}
                className="rounded-2xl border border-gray-100 bg-gray-50/70 p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold text-gray-900 break-words">{payout.id}</p>
                  <StatusBadge status={payout.status} />
                </div>

                <div className="mt-3 space-y-1 text-sm">
                  <p className="text-gray-700 break-words">
                    Amount: <span className="font-semibold">₹{fmt(payout.amount)}</span>
                  </p>
                  <p className="text-gray-500 break-words">Method: {payout.method}</p>
                  <p className="text-gray-500 break-words">Date: {payout.date}</p>
                </div>
              </div>
            ))}
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