import React, { useState } from 'react';
import { Bell, CheckCheck, ShoppingBag, AlertTriangle, Star } from 'lucide-react';


const initialNotifications = [
  {
    id: 1,
    title: 'New order received',
    message: 'Order #ORD-8821 has been placed successfully.',
    time: '5m ago',
    unread: true,
    type: 'order',
  },
  {
    id: 2,
    title: 'Low stock alert',
    message: 'Magnetic Drawing Board has only 3 items left in stock.',
    time: '30m ago',
    unread: true,
    type: 'stock',
  },
  {
    id: 3,
    title: 'New product review',
    message: 'Classic Teddy Bear received a new 5★ review.',
    time: '2h ago',
    unread: false,
    type: 'review',
  },
  {
    id: 4,
    title: 'Payment settled',
    message: 'Your last payout has been credited successfully.',
    time: 'Yesterday',
    unread: false,
    type: 'payment',
  },
  
];

function NotificationIcon({ type }) {
  if (type === 'order') {
    return (
      <div className="w-11 h-11 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center">
        <ShoppingBag size={20} />
      </div>
    );
  }

  if (type === 'stock') {
    return (
      <div className="w-11 h-11 rounded-2xl bg-red-100 text-red-500 flex items-center justify-center">
        <AlertTriangle size={20} />
      </div>
    );
  }

  if (type === 'review') {
    return (
      <div className="w-11 h-11 rounded-2xl bg-yellow-100 text-yellow-600 flex items-center justify-center">
        <Star size={20} />
      </div>
    );
  }

  return (
    <div className="w-11 h-11 rounded-2xl bg-green-100 text-green-600 flex items-center justify-center">
      <Bell size={20} />
    </div>
  );
}

export default function SellerNotifications() {
  const [items, setItems] = useState(initialNotifications);

  const unreadCount = items.filter((item) => item.unread).length;

  const markAllAsRead = () => {
    setItems((prev) => prev.map((item) => ({ ...item, unread: false })));
  };

  const markOneAsRead = (id) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, unread: false } : item
      )
    );
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-[#f8f8f8] min-h-[calc(100vh-64px)]">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-[28px] border border-orange-100 shadow-sm overflow-hidden">
          <div className="px-5 sm:px-7 py-5 border-b border-orange-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">All Notifications</h2>
              <p className="text-sm text-gray-500 mt-1">
                View all updates related to your shop here.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="px-3 py-1.5 rounded-full bg-orange-100 text-orange-700 text-sm font-semibold">
                {unreadCount} unread
              </div>

              <button
                onClick={markAllAsRead}
                className="inline-flex items-center gap-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-4 py-2.5 transition"
              >
                <CheckCheck size={17} />
                Mark all as read
              </button>
            </div>
          </div>

          <div className="divide-y divide-orange-50">
            {items.length > 0 ? (
              items.map((item) => (
                <div
                  key={item.id}
                  onClick={() => markOneAsRead(item.id)}
                  className={`px-5 sm:px-7 py-5 flex items-start gap-4 hover:bg-orange-50/40 transition cursor-pointer ${
                    item.unread ? 'bg-orange-50/60' : 'bg-white'
                  }`}
                >
                  <NotificationIcon type={item.type} />

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                      <div>
                        <h3 className="text-base font-semibold text-gray-800">
                          {item.title}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1 leading-6">
                          {item.message}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {item.unread && (
                          <span className="w-2.5 h-2.5 rounded-full bg-orange-500 mt-1" />
                        )}
                        <span className="text-xs text-gray-400">{item.time}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-6 py-16 text-center">
                <div className="w-16 h-16 mx-auto rounded-full bg-orange-100 text-orange-500 flex items-center justify-center">
                  <Bell size={28} />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-gray-800">
                  No notifications
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  You’re all caught up for now.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}