// ─── Seller Dashboard Sample Data ────────────────────────────────────────────

export const sellerProducts = [
  {
    id: 'SP001',
    name: 'Classic Teddy Bear',
    category: 'Soft Toys',
    price: 2499,
    stock: 142,
    status: 'Active',
    image: 'https://assets.myntassets.com/w_360,q_50,,dpr_2,fl_progressive,f_webp/assets/images/2026/JANUARY/17/AOoFeGgo_f21628c1999d4f028983f42c6ab3d701.jpg',
  },
  {
    id: 'SP002',
    name: 'Rabbit Plush',
    category: 'Soft Toys',
    price: 1999,
    stock: 94,
    status: 'Active',
    image: '/images/rabbit_plush.png',
  },
  {
    id: 'SP003',
    name: 'Dinosaur Roar Set',
    category: 'Soft Toys',
    price: 2799,
    stock: 0,
    status: 'Out of Stock',
    image: 'https://static.wixstatic.com/media/333417_6485f8c0bb124b9ca50456010639cbba~mv2.jpg',
  },
  {
    id: 'SP004',
    name: 'Science Lab Kit',
    category: 'Educational Toys',
    price: 3499,
    stock: 5,
    status: 'Low Stock',
    image: '/images/science_kit.png',
  },
  {
    id: 'SP005',
    name: 'RC Racing Car',
    category: 'Electronic Toys',
    price: 4999,
    stock: 38,
    status: 'Active',
    image: '/images/rc_car.png',
  },
  {
    id: 'SP006',
    name: 'Magnetic Drawing Board',
    category: 'Educational Toys',
    price: 1299,
    stock: 3,
    status: 'Low Stock',
    image: 'https://m.media-amazon.com/images/I/61MvSBeC8NL._AC_SL1000_.jpg',
  },
  {
    id: 'SP007',
    name: 'Lion Plush Toy',
    category: 'Soft Toys',
    price: 3299,
    stock: 0,
    status: 'Out of Stock',
    image: 'https://www.ikea.com/in/en/images/products/djungelskog-soft-toy-lion__0710172_pe727375_s5.jpg',
  },
  {
    id: 'SP008',
    name: 'Drone Explorer',
    category: 'Electronic Toys',
    price: 5999,
    stock: 12,
    status: 'Active',
    image: 'https://images.unsplash.com/photo-1524143902484-1d455aa73783?q=80&w=1000&auto=format&fit=crop',
  },
];

export const sellerOrders = [
  { id: 'ORD-8821', customer: 'Priya Mehta', product: 'Classic Teddy Bear', amount: 2499, status: 'Delivered', payment: 'Paid', date: '2025-01-20' },
  { id: 'ORD-8819', customer: 'Amit Verma', product: 'RC Racing Car', amount: 4999, status: 'Shipped', payment: 'Paid', date: '2025-01-19' },
  { id: 'ORD-8815', customer: 'Sneha Gupta', product: 'Science Lab Kit', amount: 3499, status: 'Pending', payment: 'Pending', date: '2025-01-19' },
  { id: 'ORD-8810', customer: 'Rohit Singh', product: 'Drone Explorer', amount: 5999, status: 'Processing', payment: 'Paid', date: '2025-01-18' },
  { id: 'ORD-8804', customer: 'Kavita Joshi', product: 'Rabbit Plush', amount: 1999, status: 'Delivered', payment: 'Paid', date: '2025-01-18' },
  { id: 'ORD-8798', customer: 'Deepak Nair', product: 'Magnetic Drawing Board', amount: 1299, status: 'Cancelled', payment: 'Refunded', date: '2025-01-17' },
  { id: 'ORD-8793', customer: 'Ananya Das', product: 'Lion Plush Toy', amount: 3299, status: 'Pending', payment: 'Pending', date: '2025-01-17' },
  { id: 'ORD-8789', customer: 'Vikas Patel', product: 'RC Racing Car', amount: 4999, status: 'Shipped', payment: 'Paid', date: '2025-01-16' },
];

export const sellerReviews = [
  {
    id: 'R001',
    customer: 'Priya M.',
    product: 'Classic Teddy Bear',
    rating: 5,
    comment: 'Amazing quality! My daughter absolutely loves it. Very soft and durable.',
    date: '2025-01-19',
    avatar: 'P',
  },
  {
    id: 'R002',
    customer: 'Amit V.',
    product: 'RC Racing Car',
    rating: 4,
    comment: 'Great car, fast and smooth. Battery life could be better.',
    date: '2025-01-18',
    avatar: 'A',
  },
  {
    id: 'R003',
    customer: 'Sneha G.',
    product: 'Science Lab Kit',
    rating: 5,
    comment: 'Excellent educational toy! Kids learned so much while having fun.',
    date: '2025-01-17',
    avatar: 'S',
  },
  {
    id: 'R004',
    customer: 'Kavita J.',
    product: 'Rabbit Plush',
    rating: 4,
    comment: 'Very cute and well made. Good value for money.',
    date: '2025-01-16',
    avatar: 'K',
  },
  {
    id: 'R005',
    customer: 'Rohit S.',
    product: 'Drone Explorer',
    rating: 5,
    comment: 'Fantastic drone! Easy to fly and great camera. Kids are obsessed.',
    date: '2025-01-15',
    avatar: 'R',
  },
];

export const lowStockAlerts = sellerProducts.filter(
  (p) => p.status === 'Low Stock' || p.status === 'Out of Stock'
);

export const monthlySales = [
  { month: 'Aug', revenue: 18200, orders: 52 },
  { month: 'Sep', revenue: 22400, orders: 61 },
  { month: 'Oct', revenue: 19800, orders: 58 },
  { month: 'Nov', revenue: 28600, orders: 84 },
  { month: 'Dec', revenue: 34200, orders: 98 },
  { month: 'Jan', revenue: 25400, orders: 72 },
];
export const sellerProfile = {
  avatar: "🧸",
  shopName: "ToyShop",
  name: "Kids ToyShop",
  email: "kidstoys@gmail.com",
  phone: "+91 98765 43210",
  location: "Chennai, Tamil Nadu",
  joinedDate: "Jan 2023",
  status: "Active",
  rating: 4.7,
  totalReviews: 1284,
  totalSales: 487500,
};

export const sellerStats = {
  totalProducts: 94,
  totalOrders: 3210,
  totalRevenue: 487500,
  avgRating: 4.7,
};

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