import React from 'react';
import ProductCard from './ProductCard';

export default function ProductCarousel({
  products = [],
  title,
  icon,
  color = 'orange',
}) {
  const colorMap = {
    orange: {
      text: 'text-orange-600',
      light: 'bg-orange-50',
      border: 'border-orange-200',
    },
    pink: {
      text: 'text-pink-600',
      light: 'bg-pink-50',
      border: 'border-pink-200',
    },
    blue: {
      text: 'text-blue-600',
      light: 'bg-blue-50',
      border: 'border-blue-200',
    },
    green: {
      text: 'text-green-600',
      light: 'bg-green-50',
      border: 'border-green-200',
    },
  };

  const c = colorMap[color] || colorMap.orange;

  return (
    <section className="py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6 px-1">
        {icon && (
          <div
            className={`w-12 h-12 ${c.light} rounded-2xl flex items-center justify-center text-2xl shadow-sm border ${c.border}`}
          >
            {icon}
          </div>
        )}

        <div>
          <h2 className="font-display text-2xl md:text-3xl text-gray-800 font-semibold">
            {title}
          </h2>
          <p className="text-sm text-gray-400 font-body">
            {products.length} amazing toys
          </p>
        </div>
      </div>

      {/* Products show below */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {products.map((product, idx) => (
          <div key={`${product.id}-${idx}`}>
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </section>
  );
}