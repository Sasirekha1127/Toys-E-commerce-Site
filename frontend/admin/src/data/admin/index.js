export { orders } from './orders';
export { products } from './products';




export const reviews = [
  {
    id: 'R001',
    product: 'Elephant Soft Toy',
    productImg: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSEi4yYfa4AsBM-lEjQXw1l9-dvx6znnJFACw&s',
    customer: 'Priya Sharma',
    avatar: 'PS',
    rating: 5,
    text: 'My daughter absolutely loves this elephant! Super soft and perfect for cuddling. Great quality product.',
    date: '2025-03-27',
    status: 'Approved'
  },
  {
    id: 'R002',
    product: 'Science Kit',
    productImg: 'https://static.wixstatic.com/media/91210f_fc85cd488d314cf5bbe2798d63105167~mv2.webp/v1/fit/w_500,h_500,q_90/file.webp',
    customer: 'Rahul Mehta',
    avatar: 'RM',
    rating: 5,
    text: 'Amazing science kit! My son enjoyed every experiment and learned a lot. Worth every rupee.',
    date: '2025-03-26',
    status: 'Approved'
  },
  {
    id: 'R003',
    product: 'Alphabet Puzzle',
    productImg: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR-I3RypVCRHXlgPZOzx1jC0YSmJ6d2BMa-8g&s',
    customer: 'Anjali Singh',
    avatar: 'AS',
    rating: 4,
    text: 'Very helpful for kids to learn alphabets. Good quality and colorful design. Packaging could improve.',
    date: '2025-03-25',
    status: 'Pending'
  },
  {
    id: 'R004',
    product: 'Space Projector Dome',
    productImg: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=60&h=60&fit=crop',
    customer: 'Kiran Patel',
    avatar: 'KP',
    rating: 5,
    text: 'Transforms the room into a galaxy! My kid loves it every night. Totally worth it.',
    date: '2025-03-24',
    status: 'Approved'
  },
  {
    id: 'R005',
    product: 'Karaoke Star Machine',
    productImg: 'https://images.unsplash.com/photo-1485120750507-a3bf477acd63?w=60&h=60&fit=crop',
    customer: 'Meera Iyer',
    avatar: 'MI',
    rating: 3,
    text: 'Fun product for kids but battery drains a bit fast. Sound quality is decent though.',
    date: '2025-03-23',
    status: 'Pending'
  },
  {
    id: 'R006',
    product: 'Rabbit Plush',
    productImg: 'https://m.media-amazon.com/images/I/61VP9u-+3LL._AC_UF1000,1000_QL80_.jpg',
    customer: 'Deepak Nair',
    avatar: 'DN',
    rating: 5,
    text: 'Super soft and cuddly! My toddler loves this bunny and carries it everywhere.',
    date: '2025-03-22',
    status: 'Approved'
  },
  {
    id: 'R007',
    product: 'Robot Kit',
    productImg: 'https://upload.wikimedia.org/wikipedia/commons/8/8c/Lego_Mindstorms_Nxt-FLL.jpg',
    customer: 'Suresh Kumar',
    avatar: 'SK',
    rating: 2,
    text: 'Some parts were missing in the kit. Requested replacement. Expected better quality.',
    date: '2025-03-21',
    status: 'Rejected'
  },
];

export const offers = [
  {
    id: 'O001',
    title: 'Electronic Toys Mega Sale',
    description: 'Enjoy exciting discounts on remote cars, drones, and electronic gadgets. Grab your favorite tech toys at amazing prices!',
    discount: '30% OFF',
    category: 'Electronic Toys',
    startDate: '2025-04-01',
    endDate: '2025-04-30',
    status: 'Scheduled',
    image: 'https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?w=300&h=160&fit=crop',
    color: 'from-violet-500 to-purple-400'
  },
  {
    id: 'O002',
    title: 'Soft Toys Combo Offer',
    description: 'Buy any 2 soft toys and get the 3rd at 50% off. Perfect cuddly companions for kids!',
    discount: '3rd at 50%',
    category: 'Soft Toys',
    startDate: '2025-03-15',
    endDate: '2025-04-15',
    status: 'Active',
    image: 'https://images.unsplash.com/photo-1581783898377-1c85bf937427?w=300&h=160&fit=crop',
    color: 'from-pink-500 to-rose-400'
  },
  {
    id: 'O003',
    title: 'Educational Toys Offer',
    description: 'Boost learning with puzzles, science kits, and educational toys at special discounted prices.',
    discount: '25% OFF',
    category: 'Educational Toys',
    startDate: '2025-03-01',
    endDate: '2025-03-31',
    status: 'Expired',
    image: 'https://images.unsplash.com/photo-1532094349884-543559b284bb?w=300&h=160&fit=crop',
    color: 'from-blue-500 to-cyan-400'
  },
  {
    id: 'O004',
    title: 'Free Shipping Offer',
    description: 'Get free delivery on all orders above ₹999. Shop more and save on shipping!',
    discount: 'Free Ship',
    category: 'All',
    startDate: '2025-04-05',
    endDate: '2025-04-06',
    status: 'Scheduled',
    image: 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=300&h=160&fit=crop',
    color: 'from-amber-500 to-orange-400'
  }
];

export const salesData = [
  { month:'Oct', revenue:12400, orders:134, target:11000 },
  { month:'Nov', revenue:15800, orders:178, target:14000 },
  { month:'Dec', revenue:24200, orders:289, target:20000 },
  { month:'Jan', revenue:18600, orders:210, target:17000 },
  { month:'Feb', revenue:21300, orders:244, target:19000 },
  { month:'Mar', revenue:26800, orders:312, target:23000 },
];

export const stats = {
  totalProducts: 12,
  totalOrders: 1248,
  totalCustomers: 864,
  totalRevenue: 48392.55,
  revenueGrowth: 18.4,
  ordersGrowth: 12.7,
  customersGrowth: 9.2,
  productsGrowth: 4.5,
};
