import React from 'react';
import { useMemo, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../../components/user/UserHeader';
import ProductCard from '../../components/user/ProductCard';
import { softToys, educationalToys, electronicToys, woodenToys } from '../../data/user';
import { ArrowLeft } from 'lucide-react';

const categoryMap = {
    'soft-toys': {
        title: 'Soft Toys',
        data: softToys,
    },
    'educational-toys': {
        title: 'Educational Toys',
        data: educationalToys,
    },
    'electronic-toys': {
        title: 'Electronic Toys',
        data: electronicToys,
    },
    'wooden-toys': {
        title: 'Wooden Toys',
        data: woodenToys,
    },
};

export default function CategoryProductsPage() {
    const { slug } = useParams();
    const navigate = useNavigate();

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All Categories');
    const [sellerProducts, setSellerProducts] = useState([]);

    const categoryInfo = categoryMap[slug];

    useEffect(() => {
        fetch('http://localhost:5000/api/seller-products')
            .then((res) => res.json())
            .then((data) => {
                if (data.products) {
                    const mapped = data.products.map((p) => ({
                        id: String(p.id),
                        name: p.title || p.name,
                        image: p.image_urls?.[0] || p.image || '',
                        description: p.description || '',
                        price: Number(p.price),
                        rating: p.rating || 4.5,
                        reviews: p.reviews || 0,
                        category: p.category || 'Soft Toys',
                        subcategory: p.subcategory || '',
                    }));
                    setSellerProducts(mapped);
                }
            })
            .catch((err) => console.error('Error fetching seller products:', err));
    }, []);

    const allProducts = useMemo(() => {
        if (!categoryInfo) return [];

        return [
            ...categoryInfo.data,
            ...sellerProducts.filter((p) => p.category === categoryInfo.title),
        ];
    }, [categoryInfo, sellerProducts]);

    const filteredProducts = allProducts.filter((p) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (!categoryInfo) {
        return (
            <div className="min-h-screen flex items-center justify-center text-center px-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-3">Category not found</h2>
                    <button
                        onClick={() => navigate('/')}
                        className="px-5 py-2.5 rounded-xl bg-orange-500 text-white font-semibold hover:bg-orange-600 transition"
                    >
                        Go Home
                    </button>
                </div>
            </div>
        );

    }

    return (
        <div className="min-h-screen bg-orange-50/30">
            <Header
                onSearch={setSearchTerm}
                onCategoryChange={setSelectedCategory}
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 pb-12 ">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8 ">
                    <div>
                        <button
                            onClick={() => navigate(-1)}
                            className="inline-flex items-center mt-20 gap-2 px-4 py-2.5 rounded-2xl border-2 border-orange-200 text-orange-600 font-semibold hover:bg-orange-500 hover:text-white hover:border-orange-500 transition-all duration-300 hover:scale-105 active:scale-95 shadow-sm"
                        >
                            <ArrowLeft size={18} /> Back
                        </button>
                        <h1 className="font-display text-3xl md:text-4xl text-gray-800 mt-10">
                            {categoryInfo.title}
                        </h1>
                        <p className="text-gray-500 mt-2">
                            {filteredProducts.length} products available
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                    {filteredProducts.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>

                {filteredProducts.length === 0 && (
                    <div className="text-center py-16">
                        <p className="text-gray-500 text-lg">No products found.</p>
                    </div>
                )}
            </div>
        </div>
    );
}