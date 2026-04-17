import React, { useMemo, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ProductCard from '../../components/user/ProductCard';
import { AGE_GROUPS } from '../../data/user/AgeCategorySection';
import {
  softToys,
  educationalToys,
  electronicToys,
  woodenToys,
} from '../../data/user/index';

const MAIN_CATEGORIES = [
  'All Categories',
  'Soft Toys',
  'Educational Toys',
  'Electronic Toys',
  'Wooden Toys',
];

export default function AgeCategory() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');

  const [softToysList, setSoftToysList] = useState(softToys || []);
  const [educationalToysList, setEducationalToysList] = useState(educationalToys || []);
  const [electronicToysList, setElectronicToysList] = useState(electronicToys || []);
  const [woodenToysList, setWoodenToysList] = useState(woodenToys || []);

  useEffect(() => {
    fetch('http://localhost:5000/api/seller-products')
      .then((res) => res.json())
      .then((data) => {
        if (data?.products) {
          const mapped = data.products.map((p) => ({
            id: String(p.id),
            name: p.title || p.name || 'Toy',
            image: p.image_urls?.[0] || p.image || '',
            description: p.description || '',
            price: Number(p.price) || 0,
            rating: p.rating || 4.5,
            reviews: p.reviews || 0,
            category: p.category || 'Soft Toys',
            subcategory: p.subcategory || '',
            ageGroup: Array.isArray(p.ageGroup)
              ? p.ageGroup
              : p.age
              ? [String(p.age).trim()]
              : ['3-5'],
          }));

          setSoftToysList([
            ...(softToys || []),
            ...mapped.filter((p) => p.category === 'Soft Toys'),
          ]);

          setEducationalToysList([
            ...(educationalToys || []),
            ...mapped.filter((p) => p.category === 'Educational Toys'),
          ]);

          setElectronicToysList([
            ...(electronicToys || []),
            ...mapped.filter((p) => p.category === 'Electronic Toys'),
          ]);

          setWoodenToysList([
            ...(woodenToys || []),
            ...mapped.filter((p) => p.category === 'Wooden Toys'),
          ]);
        }
      })
      .catch((err) => console.error('Error fetching seller products:', err));
  }, []);

  const allProducts = useMemo(() => {
    return [
      ...softToysList,
      ...educationalToysList,
      ...electronicToysList,
      ...woodenToysList,
    ];
  }, [softToysList, educationalToysList, electronicToysList, woodenToysList]);

  const currentAgeGroup = AGE_GROUPS.find(
    (group) => String(group.id).trim().toLowerCase() === String(slug).trim().toLowerCase()
  );

  const filteredProducts = useMemo(() => {
    const currentSlug = String(slug || '').trim().toLowerCase();
    const term = searchTerm.toLowerCase();

    return allProducts.filter((p) => {
      const ages = Array.isArray(p.ageGroup)
        ? p.ageGroup.map((age) => String(age).trim().toLowerCase())
        : [String(p.age || '').trim().toLowerCase()].filter(Boolean);

      const matchAge = ages.includes(currentSlug);

      const matchSearch =
        !term ||
        p.name?.toLowerCase().includes(term) ||
        p.description?.toLowerCase().includes(term) ||
        p.category?.toLowerCase().includes(term) ||
        p.subcategory?.toLowerCase().includes(term);

      let matchCategory = true;
      if (selectedCategory !== 'All Categories') {
        matchCategory = String(p.category || '').trim() === selectedCategory;
      }

      return matchAge && matchSearch && matchCategory;
    });
  }, [allProducts, slug, searchTerm, selectedCategory]);

  const visibleProducts = filteredProducts.slice(0, 5);

  if (!currentAgeGroup) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="bg-white border border-orange-100 rounded-3xl p-8 text-center shadow-sm">
          <h2 className="text-2xl font-bold text-red-500 mb-2">Invalid Age Category</h2>
          <p className="text-gray-500">This age category does not exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8 rounded-3xl bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-100 p-6 md:p-8 shadow-sm">
        <button
          onClick={() => navigate('/home')}
          className="mb-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-orange-200 bg-white text-orange-600 font-semibold text-sm hover:bg-orange-50 transition-all duration-300"
        >
          ← Back to Home
        </button>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-orange-400 mb-2">
              Shop by Age
            </p>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
              {currentAgeGroup.emoji} {currentAgeGroup.label}
            </h1>
            <p className="text-gray-600">{currentAgeGroup.desc}</p>
          </div>

          <div className="w-full md:w-[320px]">
            <input
              type="text"
              placeholder="Search toys..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-2xl border border-orange-200 px-4 py-3 outline-none focus:ring-2 focus:ring-orange-300"
            />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        {MAIN_CATEGORIES.map((category) => {
          const active = selectedCategory === category;

          return (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full border text-sm font-semibold transition-all duration-300 ${
                active
                  ? 'bg-orange-500 text-white border-orange-500'
                  : 'bg-white text-orange-600 border-orange-200 hover:bg-orange-50'
              }`}
            >
              {category}
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-between mb-5">
        <h2 className="text-2xl font-bold text-gray-800">
          Toys for {currentAgeGroup.label}
        </h2>
        <span className="px-4 py-2 rounded-full bg-orange-100 text-orange-600 text-sm font-bold">
          {visibleProducts.length} Products
        </span>
      </div>

      {visibleProducts.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-6">
          {visibleProducts.map((product, index) => (
            <ProductCard
              key={`${product.category}-${product.id}-${index}`}
              product={product}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white border border-orange-100 rounded-3xl p-10 text-center shadow-sm">
          <h3 className="text-2xl font-bold text-gray-800 mb-2">No toys found</h3>
          <p className="text-gray-500">No products are available for this age group right now.</p>
        </div>
      )}
    </div>
  );
}