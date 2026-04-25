import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { parsePrice } from '../../context/StoreContext';
import BannerCarousel from '../../components/user/BannerCarousel';
import ProductCarousel from '../../components/user/ProductCarousel';
import Header from "../../components/user/UserHeader";
import { AGE_GROUPS } from '../../data/user/AgeCategorySection';
import {
  ShieldCheck,
  Truck,
  RotateCcw,
  HeadphonesIcon,
  Star,
} from 'lucide-react';
import { softToys, educationalToys, electronicToys, woodenToys } from '../../data/user';

const features = [
  {
    icon: <ShieldCheck size={22} />,
    title: 'Safe & Certified',
    desc: 'All toys meet international safety standards',
    color: 'bg-green-100 text-green-600',
  },
  {
    icon: <Truck size={22} />,
    title: 'Free Shipping',
    desc: 'On all orders above ₹999',
    color: 'bg-orange-100 text-orange-600',
  },
  {
    icon: <RotateCcw size={22} />,
    title: 'Easy Returns',
    desc: '30-day hassle-free returns',
    color: 'bg-purple-100 text-purple-600',
  },
  {
    icon: <HeadphonesIcon size={22} />,
    title: '24/7 Support',
    desc: 'Always here when you need us',
    color: 'bg-orange-100 text-orange-600',
  },
];

function AgeCategorySection() {
  const navigate = useNavigate();

  const ageRouteMap = {
    '0 – 2 Years': '0-2',
    '3 – 5 Years': '3-5',
    '6 – 8 Years': '6-8',
    '9 – 12 Years': '9-12',
    '12 + Years': '12-plus',
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-orange-400 text-2xl">✨</span>
          <h2 className="font-display text-3xl md:text-4xl text-gray-800">
            Shop by Age
          </h2>
        </div>
        <p className="text-gray-500 text-sm md:text-base">
          Find the perfect toys for every age group
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {AGE_GROUPS.map((group) => (
          <button
            key={group.id}
            onClick={() => navigate(`/age/${ageRouteMap[group.label]}`)}
            className={`rounded-3xl border p-5 text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${group.bg} ${group.border}`}
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-3xl">{group.emoji}</span>
              <span className={`w-2.5 h-2.5 rounded-full ${group.dot}`} />
            </div>

            <h3 className="font-bold text-gray-800 text-lg leading-snug">
              {group.label}
            </h3>
            <p className="text-sm text-gray-500 mt-1">{group.desc}</p>
            <p className="text-xs text-orange-500 font-semibold mt-3">
              Explore Toys →
            </p>
          </button>
        ))}
      </div>
    </section>
  );
}

function SectionHeader({ title, subtitle, icon, onViewAll }) {
  return (
    <div className="flex items-center justify-between mb-4 px-1">
      <div className="flex items-center gap-3">
        {icon && (
          <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center text-2xl shadow-sm border border-orange-200">
            {icon}
          </div>
        )}
        <div>
          <h2 className="font-display text-2xl md:text-3xl text-gray-800">
            {title}
          </h2>
          {subtitle && <p className="text-sm text-gray-400 font-body">{subtitle}</p>}
        </div>
      </div>

      <button
        onClick={onViewAll}
        className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-2xl border border-orange-200 text-orange-600 font-semibold hover:bg-orange-500 hover:text-white hover:border-orange-500 transition-all duration-300"
      >
        View All →
      </button>
    </div>
  );
}

export default function Home() {
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');

  const [softToysList, setSoftToysList] = useState([]);
  const [educationalToysList, setEducationalToysList] = useState([]);
  const [electronicToysList, setElectronicToysList] = useState([]);
  const [woodenToysList, setWoodenToysList] = useState([]);

  useEffect(() => {
    // Requirements: Home page must use JS data files, no backend API fetch for Home product cards.
    // Ensure allProducts is created without overwriting image field (requirement 6).
    const allProducts = [
      ...softToys,
      ...educationalToys,
      ...electronicToys,
      ...woodenToys,
    ];

    const mapProduct = (p) => ({
      ...p,
      id: String(p.id),
      name: p.name || p.title || '',
      price: parsePrice(p.price),
      // Requirement 8: Keep original image field from JS file unchanged.
    });

    const normalizeCat = (cat) => (cat || '').toLowerCase().trim();

    setSoftToysList(softToys.map(mapProduct));
    setEducationalToysList(educationalToys.map(mapProduct));
    setElectronicToysList(electronicToys.map(mapProduct));
    setWoodenToysList(woodenToys.map(mapProduct));
  }, []);


  const handleSearch = (value) => setSearchTerm(value);
  const handleCategoryChange = (cat) => setSelectedCategory(cat);

  const filterProducts = (products) =>
    products.filter((p) => {
      const term = searchTerm.toLowerCase().trim();

      const matchSearch =
        !term ||
        p.name?.toLowerCase().includes(term) ||
        p.description?.toLowerCase().includes(term) ||
        p.category?.toLowerCase().includes(term) ||
        p.subcategory?.toLowerCase().includes(term);

      const matchCategory =
        selectedCategory === 'All Categories' ||
        p.category === selectedCategory ||
        p.subcategory === selectedCategory;

      return matchSearch && matchCategory;
    });

  return (
    <div className="page-enter">
      <Header
        onSearch={handleSearch}
        onCategoryChange={handleCategoryChange}
      />

      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 pb-2">
        <BannerCarousel />
      </section>

      <AgeCategorySection />

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center gap-4 py-4">
          <div className="flex-1 h-px bg-orange-100" />
          <span className="text-orange-300 text-sm font-bold tracking-wider">
            OUR COLLECTION
          </span>
          <div className="flex-1 h-px bg-orange-100" />
        </div>

        <div id="soft-toys" className="mb-6">
          <SectionHeader
            title="Soft Toys"
            onViewAll={() => navigate('/category/soft-toys')}
          />
          <ProductCarousel
            products={filterProducts(softToysList).slice(0, 10)}
            color="orange"
          />
        </div>

        <div className="my-6 rounded-3xl bg-gradient-to-r from-amber-400 to-orange-500 p-8 flex items-center justify-between overflow-hidden relative shadow-xl">
          <div className="relative z-10">
            <p className="text-white/80 text-sm font-bold uppercase tracking-widest mb-1">
              Limited Time
            </p>
            <h3 className="font-display text-3xl md:text-4xl text-white mb-2">
              Up to 40% OFF
            </h3>
            <p className="text-white/90 text-base mb-4">
              On selected educational & STEM toys this week only!
            </p>
            <button
              className="bg-white text-orange-600 font-bold px-6 py-2.5 rounded-xl hover:bg-orange-50 transition-all hover:scale-105 shadow-lg"
              onClick={() =>
                document.getElementById('educational-toys')?.scrollIntoView({
                  behavior: 'smooth',
                })
              }
            >
              Shop the Sale →
            </button>
          </div>
          <div className="absolute -bottom-6 -right-6 w-40 h-40 border-4 border-white/20 rounded-full" />
          <div className="absolute -bottom-10 -right-10 w-60 h-60 border-4 border-white/10 rounded-full" />
        </div>

        <div id="educational-toys" className="mb-6">
          <SectionHeader
            title="Educational Toys"
            onViewAll={() => navigate('/category/educational-toys')}
          />
          <ProductCarousel
            products={filterProducts(educationalToysList).slice(0, 10)}
            color="orange"
          />
        </div>

        <div id="electronic-toys" className="mb-6">
          <SectionHeader
            title="Electronic Toys"
            onViewAll={() => navigate('/category/electronic-toys')}
          />
          <ProductCarousel
            products={filterProducts(electronicToysList).slice(0, 10)}
            color="orange"
          />
        </div>

        <div id="wooden-toys" className="mb-6">
          <SectionHeader
            title="Wooden Toys"
            onViewAll={() => navigate('/category/wooden-toys')}
          />
          <ProductCarousel
            products={filterProducts(woodenToysList).slice(0, 10)}
            color="orange"
          />
        </div>
      </div>

      <section className="bg-gradient-to-br from-orange-50 to-amber-50 py-16 mt-10 dots-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <h2 className="font-display text-3xl md:text-4xl text-orange-800 mb-2">
              Happy Little Customers
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                name: "Sarah M.",
                kid: "Mom of 3",
                review:
                  "ToyLand is our family's go-to! Quality is incredible and my kids absolutely love every single toy we've ordered.",
                rating: 5,
                avatar: "",
              },
              {
                name: "James R.",
                kid: "Dad of twins",
                review:
                  "Fast shipping, amazing packaging, and the educational toys have genuinely helped my kids learn faster. Highly recommend!",
                rating: 5,
                avatar: "",
              },
              {
                name: "Priya K.",
                kid: "Mom of 1",
                review:
                  "The soft toys are SO soft and the quality is premium. My daughter sleeps with her bunny every night! Worth every penny.",
                rating: 5,
                avatar: "",
              },
            ].map((t, i) => (
              <div
                key={i}
                className="bg-white rounded-3xl p-6 shadow-toy hover:shadow-toy-hover transition-all hover:-translate-y-1"
              >
                <div className="flex gap-1 mb-3">
                  {[...Array(t.rating)].map((_, j) => (
                    <Star
                      key={j}
                      size={16}
                      className="text-amber-400 fill-amber-400"
                    />
                  ))}
                </div>

                <p className="text-gray-600 text-sm leading-relaxed mb-4 font-body italic">
                  "{t.review}"
                </p>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-xl">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="font-bold text-gray-800 text-sm">{t.name}</p>
                    <p className="text-xs text-gray-400">{t.kid}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {features.map((f, i) => (
            <div
              key={i}
              className="flex items-start gap-3 bg-white rounded-2xl p-4 shadow-toy transition-all hover:shadow-lg hover:shadow-orange-300 hover:-translate-y-1"
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center flex-none ${f.color}`}
              >
                {f.icon}
              </div>
              <div>
                <p className="font-bold text-gray-800 text-sm">{f.title}</p>
                <p className="text-xs text-gray-400 mt-0.5">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}