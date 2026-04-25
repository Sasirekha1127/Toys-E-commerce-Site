import React, { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const slides = [
  {
    id: 1,
    title: "Soft & Snuggly",
    description: "Explore our cuddly collection of plush friends your little one will adore forever.",
    cta: "Shop Soft Toys",
    link: "soft-toys",
    pattern: "circles",
    image: "https://static.vecteezy.com/system/resources/thumbnails/046/096/593/small/plush-yellow-bear-sitting-on-blue-floor-in-playroom-free-photo.jpeg",
  },
  {
    id: 2,
    title: "Learn & Grow",
    description: "Educational toys that make every discovery a celebration and every lesson an adventure.",
    cta: "Shop Educational",
    link: "educational-toys",
    pattern: "stars",
    image: "https://img.freepik.com/premium-photo/decorative-cartoon-kids-toys-banner-must-have-playful-children-is-charming_922357-43058.jpg",
  },
  {
    id: 3,
    title: "Tech & Wonder",
    description: "Electronic toys packed with lights, sound, and magic for endless hours of excitement.",
    cta: "Shop Electronic",
    link: "electronic-toys",
    pattern: "dots",
    image: "https://img.freepik.com/premium-photo/decorative-cartoon-kids-toys-banner-must-have-playful-children-is-charming_922357-44021.jpg?semt=ais_incoming&w=740&q=80",
  },
];

export default function BannerCarousel() {
  const [current, setCurrent] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const go = useCallback((index) => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrent((index + slides.length) % slides.length);
    setTimeout(() => setIsAnimating(false), 400);
  }, [isAnimating]);

  useEffect(() => {
    const timer = setInterval(() => go(current + 1), 5000);
    return () => clearInterval(timer);
  }, [current, go]);

  const slide = slides[current];

  const handleCta = () => {
    const el = document.getElementById(slide.link);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="relative w-screen left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] overflow-hidden shadow-2xl mt-20 h-[480px]">
      {slide.image && (
        <img
          src={slide.image}
          alt={slide.title}
          className="absolute inset-0 w-full h-full object-cover"
          style={{
            objectPosition: 'center 20%',
            animation: 'zoomInOut 12s ease-in-out infinite'
          }}
        />
      )}

      {/* Slide content */}
      <div className="relative z-10 flex items-center min-h-[500px] px-8 md:px-16 py-10">
        <div className="max-w-xl text-white">
          <h1 className="font-display text-5xl md:text-7xl mb-4 leading-none text-shadow">
            {slide.title}
          </h1>
          <p className="text-lg md:text-xl mb-8 font-body leading-relaxed max-w-md">
            {slide.description}
          </p>
          <button
            onClick={handleCta}
            className="bg-white text-orange-600 font-bold text-base px-8 py-3.5 rounded-2xl shadow-lg
              hover:shadow-xl transition-all duration-200 hover:scale-105 active:scale-95 hover:bg-orange-50"
          >
            {slide.cta} →
          </button>
        </div>
      </div>

      {/* Prev / Next buttons */}
      <button
        onClick={() => go(current - 1)}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white/30 hover:bg-white/50 backdrop-blur-sm
          rounded-full flex items-center justify-center text-white transition-all hover:scale-110 border border-white/30"
      >
        <ChevronLeft size={22} />
      </button>
      <button
        onClick={() => go(current + 1)}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white/30 hover:bg-white/50 backdrop-blur-sm
          rounded-full flex items-center justify-center text-white transition-all hover:scale-110 border border-white/30"
      >
        <ChevronRight size={22} />
      </button>

      {/* Dots */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => go(i)}
            className={`h-3 w-3 rounded-full transition ${i === current ? 'bg-white scale-125' : 'bg-white/50'}`}
          />
        ))}
      </div>

      {/* Keyframes for smooth zoom in/out */}
      <style>
        {`
          @keyframes zoomInOut {
            0% { transform: scale(1); }
            50% { transform: scale(1.1); }
            100% { transform: scale(1); }
          }
        `}
      </style>
    </div>
  );
}