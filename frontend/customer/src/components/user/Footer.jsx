import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Mail, Phone, MapPin, Sparkles, Facebook, Instagram, Twitter } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-orange-900 text-orange-100 mt-20">
      {/* Top wave */}
      <div className="bg-orange-50 h-8 relative">
        {/* <svg viewBox="0 0 1440 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute bottom-0 w-full">
          <path d="M0 32C240 12 480 0 720 0C960 0 1200 12 1440 32H0Z" fill="#7c2d12"/>
        </svg> */}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-10 h-10 bg-orange-500 rounded-2xl flex items-center justify-center">
                <span className="text-white text-sm ">🧸</span>
              </div>
              <div>
                <span className="font-display text-xl text-orange-300">ToyStore</span>
                <div className="flex items-center gap-1">
                </div>
              </div>
            </div>
            <p className="text-xs text-orange-300 leading-relaxed">
              Where every toy sparks imagination, every smile tells a story, and every child finds their magic.
            </p>
            <div className="flex gap-3 mt-5">
              {[Facebook, Instagram, Twitter].map((Icon, i) => (
                <button key={i} className="w-9 h-9 bg-orange-800 hover:bg-orange-600 rounded-xl flex items-center justify-center transition-all hover:scale-110">
                  <Icon size={16} />
                </button>
              ))}
            </div>
          </div>

          {/* Shop Links */}
          <div>
            <h4 className="font-display text-lg text-orange-200 mb-4">Shop</h4>
            <ul className="space-y-2.5">
              {['Soft Toys', 'Educational Toys', 'Electronic Toys', 'New Arrivals', 'Sale Items'].map(item => (
                <li key={item}>
                  <Link to="/" className="text-xs text-orange-300 hover:text-orange-100 transition-colors flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-orange-500 rounded-full inline-block"/>
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help Links */}
          <div>
            <h4 className="font-display text-lg text-orange-200 mb-4">Help</h4>
            <ul className="space-y-2.5">
              {['Shipping Info', 'Returns & Refunds', 'Size Guide', 'Track Order', 'FAQ'].map(item => (
                <li key={item}>
                  <a href="#" className="text-xs text-orange-300 hover:text-orange-100 transition-colors flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-orange-500 rounded-full inline-block"/>
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display text-lg text-orange-200 mb-4">Contact Us</h4>
            <ul className="space-y-3.5">
              <li className="flex items-start gap-3">
                <MapPin size={16} className="text-orange-500 mt-0.5 flex-none" />
                <span className="text-xs text-orange-300">123 Toy Street, Funville, Magic City 45678</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={16} className="text-orange-500 flex-none" />
                <span className="text-xs text-orange-300">+1 (800) TOY-LAND</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={16} className="text-orange-500 flex-none" />
                <span className="text-xs text-orange-300">hello@toystore.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-orange-800 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-orange-400">
            © 2025 toystore. All rights reserved.
          </p>
          <p className="text-xs text-orange-400 flex items-center gap-1.5">
            Made with <Heart size={13} className="text-red-400 fill-red-400" /> for little dreamers
          </p>
        </div>
      </div>
    </footer>
  );
}
