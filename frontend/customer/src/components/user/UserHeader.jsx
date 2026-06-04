import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { ShoppingCart, Heart, Menu, X, User, ChevronRight, LayoutDashboard, LogOut } from "lucide-react";
import { useStore } from "../../hooks/useStore";

// ── Category + subcategory data 
const CATEGORY_MAP = [
  {
    name: "All Categories",
    subs: [],
  },
  {
    name: "Soft Toys",
    subs: ["Teddy Bears", "Plush Animals", "Cartoon Toys", "Baby Soft Toys"],
  },
  {
    name: "Educational Toys",
    subs: ["Learning Kits", "Puzzle Games", "STEM Toys", "Montessori Toys"],
  },
  {
    name: "Electronic Toys",
    subs: ["Remote Control Toys", "Musical Toys", "Interactive Toys", "Battery Operated Toys"],
  },
  {
    name: "Wooden Toys",
    subs: ["Wooden Blocks", "Wooden Puzzles", "Wooden Vehicles", "Wooden Learning Toys"],
  },
];

export default function Header({ onCategoryChange, onSearch }) {
  const { 
    cartCount, 
    wishlist, 
    currentUser, 
    currentSeller, 
    logout,
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory
  } = useStore();
  const navigate  = useNavigate();
  const location  = useLocation();

  // ── State ─────────────────────────────────────────────────────────────────
  const [showOffer,        setShowOffer]        = useState(true);
  const [mobileMenuOpen,   setMobileMenuOpen]   = useState(false);
  const [dropdownOpen,     setDropdownOpen]     = useState(false);
  const [hoveredCat,       setHoveredCat]       = useState(null);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const categoryRef = useRef(null);
  const profileRef  = useRef(null);
  const closeTimer  = useRef(null);
  const isHomePage  = location.pathname === "/" || location.pathname === "/home";

  // ── Offer bar scroll hide ─────────────────────────────────────────────────
  useEffect(() => {
    if (!isHomePage) return;
    const onScroll = () => setShowOffer(window.scrollY <= 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, [isHomePage]);

  useEffect(() => {
    if (isHomePage) {
      setShowOffer(window.scrollY <= 50);
    } else {
      setShowOffer(false);
      setMobileMenuOpen(false);
      setDropdownOpen(false);
    }
  }, [isHomePage]);

  // ── Close category dropdown on outside click 
  useEffect(() => {
    const onOutside = (e) => {
      if (categoryRef.current && !categoryRef.current.contains(e.target)) {
        setDropdownOpen(false);
        setHoveredCat(null);
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", onOutside);
    return () => document.removeEventListener("mousedown", onOutside);
  }, []);

  // ── Selection ─────────────────────────────────────────────────────────────
  const selectCategory = useCallback((name) => {
    setSelectedCategory(name);
    setDropdownOpen(false);
    setHoveredCat(null);
    onCategoryChange?.(name);
    if (!isHomePage) navigate('/home');
  }, [setSelectedCategory, onCategoryChange, isHomePage, navigate]);

  const selectSubcategory = useCallback((sub) => {
    setSelectedCategory(sub);
    setDropdownOpen(false);
    setHoveredCat(null);
    onCategoryChange?.(sub);
    if (!isHomePage) navigate('/home');
  }, [setSelectedCategory, onCategoryChange, isHomePage, navigate]);

  const handleInput = (e) => {
    setSearchTerm(e.target.value);
    onSearch?.(e.target.value);
    if (!isHomePage && e.target.value.trim() !== '') navigate('/home');
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    onSearch?.(e.target.value);
    if (!isHomePage && e.target.value.trim() !== '') navigate('/home');
  };

  const getInitials = (name = "") =>
    name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);

  // ── Hover helpers (delay prevents flicker when moving between panels) ─────
  const onMainEnter = (catName) => {
    clearTimeout(closeTimer.current);
    setHoveredCat(catName);
  };
  const onMainLeave     = () => { closeTimer.current = setTimeout(() => setHoveredCat(null), 120); };
  const onSubpanelEnter = () => { clearTimeout(closeTimer.current); };
  const onSubpanelLeave = () => { closeTimer.current = setTimeout(() => setHoveredCat(null), 120); };

  const hoveredCatObj = CATEGORY_MAP.find((c) => c.name === hoveredCat);

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-white">
      {/* ── Offer bar ── */}
      {isHomePage && (
        <div
          className={`bg-orange-500 text-white text-center text-sm font-semibold overflow-hidden transition-all duration-300 ${
            showOffer ? "max-h-10 py-2 opacity-100" : "max-h-0 py-0 opacity-0"
          }`}
        >
          Flat 20% OFF on Soft Toys | Instant Delivery
        </div>
      )}

      {/* ── Navbar ── */}
      <nav className="shadow-sm sticky top-0 z-50 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">

          {/* Logo — unchanged */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl flex items-center justify-center shadow-toy group-hover:shadow-toy-hover transition-all duration-300 group-hover:scale-105 group-hover:rotate-3">
              <span className="text-white text-xl"></span>
            </div>
            <div>
              <span className="font-bold text-2xl text-orange-600">ToyStore</span>
            </div>
          </Link>

          {/* ── Desktop: search + multi-level category dropdown ── */}
            <div
              className="hidden md:flex flex-1 max-w-md mx-4 items-center gap-2 relative"
              ref={categoryRef}
            >
              {/* Trigger button — same border/rounded/text-sm as original */}
              <div className="relative">
                <button
                  className={`flex items-center gap-2 border rounded px-4 py-2 text-sm transition-all whitespace-nowrap ${
                    selectedCategory === "All Categories"
                      ? "bg-orange-100 border-orange-400 text-orange-600"
                      : "bg-orange-50 border-orange-300 text-orange-700"
                  }`}
                  onClick={() => { setDropdownOpen((o) => !o); setHoveredCat(null); }}
                >
                  <span className="truncate max-w-[140px]">{selectedCategory}</span>
                  <X
                    size={14}
                    className={`flex-none transition-transform duration-200 ${dropdownOpen ? "rotate-45" : ""}`}
                  />
                </button>

                {/* ── Multi-level dropdown ── */}
                {dropdownOpen && (
                  <div className="absolute top-full left-0 mt-1 z-[60] flex shadow-xl rounded-xl overflow-hidden border border-orange-100 bg-white">

                    {/* LEFT PANEL — main categories */}
                    <ul className="min-w-[190px] py-1.5 bg-white">
                      {CATEGORY_MAP.map((cat) => (
                        <li
                          key={cat.name}
                          onMouseEnter={() =>
                            cat.subs.length > 0 ? onMainEnter(cat.name) : setHoveredCat(null)
                          }
                          onMouseLeave={onMainLeave}
                          onClick={() => selectCategory(cat.name)}
                          className={`flex items-center justify-between px-4 py-2.5 cursor-pointer text-sm transition-colors group
                            ${selectedCategory === cat.name
                              ? "bg-orange-100 text-orange-700 font-semibold"
                              : "text-gray-700 hover:bg-orange-50 hover:text-orange-600"}
                            ${hoveredCat === cat.name ? "bg-orange-50 text-orange-600" : ""}`}
                        >
                          <span className="flex items-center gap-2.5">
                            {cat.emoji && <span className="text-base">{cat.emoji}</span>}
                            {cat.name}
                          </span>
                          {cat.subs.length > 0 && (
                            <ChevronRight
                              size={14}
                              className={`flex-none transition-colors ${
                                hoveredCat === cat.name
                                  ? "text-orange-500"
                                  : "text-gray-300 group-hover:text-orange-400"
                              }`}
                            />
                          )}
                        </li>
                      ))}
                    </ul>

                    {/* RIGHT PANEL — subcategories flyout */}
                    {hoveredCatObj && hoveredCatObj.subs.length > 0 && (
                      <div
                        className="min-w-[190px] py-1.5 bg-orange-50 border-l border-orange-100"
                        onMouseEnter={onSubpanelEnter}
                        onMouseLeave={onSubpanelLeave}
                      >
                        {/* Section header */}
                        <p className="px-4 py-1.5 text-[10px] font-bold text-orange-400 uppercase tracking-widest border-b border-orange-100 mb-1">
                          {hoveredCatObj.emoji} {hoveredCatObj.name}
                        </p>

                        <ul>
                          {hoveredCatObj.subs.map((sub) => (
                            <li
                              key={sub}
                              onClick={(e) => { e.stopPropagation(); selectSubcategory(sub); }}
                              className={`px-4 py-2.5 cursor-pointer text-sm transition-colors
                                ${selectedCategory === sub
                                  ? "bg-orange-100 text-orange-700 font-semibold"
                                  : "text-gray-600 hover:bg-orange-100 hover:text-orange-700"}`}
                            >
                              <span className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-orange-300 flex-none" />
                                {sub}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Search input — unchanged */}
              <input
                type="text"
                placeholder="Search toys..."
                value={searchTerm}
                onChange={handleInput}
                className="border p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>

          {/* ── Right icons — unchanged ── */}
          <div className="flex items-center gap-3">
            {/* Wishlist */}
            <div className="relative cursor-pointer" onClick={() => navigate("/wishlist")}>
              <Heart
                className="text-gray-500 hover:text-orange-400 transition-colors duration-200"
                size={20}
              />
              {wishlist.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-orange-400 text-white text-[10px] px-1 rounded-full flex items-center justify-center">
                  {wishlist.length}
                </span>
              )}
            </div>

            {/* Cart */}
            <div className="relative cursor-pointer" onClick={() => navigate("/cart")}>
              <ShoppingCart
                className="text-gray-500 hover:text-orange-400 transition-colors duration-200"
                size={20}
              />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-orange-400 text-white text-[10px] px-1 rounded-full flex items-center justify-center">
                  {cartCount > 9 ? "9+" : cartCount}
                </span>
              )}
            </div>

            {/* Profile — with dropdown */}
            <div className="relative" ref={profileRef}>
              <button
                type="button"
                onClick={() => setProfileDropdownOpen((o) => !o)}
                className="relative w-10 h-10 rounded-xl bg-orange-100 hover:bg-orange-500 flex items-center justify-center transition-all duration-200 group overflow-hidden border border-orange-200"
                aria-label="Open profile menu"
                title="Open profile menu"
              >
                {(currentUser?.profile_pic || currentUser?.profileImage) ? (
                  <img
                    src={currentUser.profile_pic || currentUser.profileImage}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : currentUser?.name ? (
                  <span className="text-orange-600 group-hover:text-white font-black text-[11px] transition-colors">
                    {getInitials(currentUser.name)}
                  </span>
                ) : (
                  <User
                    size={16}
                    className="text-gray-500 group-hover:text-white transition-colors"
                  />
                )}
              </button>

              {/* Profile dropdown */}
              {profileDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-orange-100 rounded-2xl shadow-xl z-[70] overflow-hidden py-1">
                  <button
                    type="button"
                    onClick={() => { setProfileDropdownOpen(false); navigate("/profile"); }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors text-left"
                  >
                    <User size={15} className="text-orange-400 flex-none" />
                    My Account
                  </button>
                  {currentSeller && (
                    <button
                      type="button"
                      onClick={() => { setProfileDropdownOpen(false); navigate("/seller"); }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors text-left"
                    >
                      <LayoutDashboard size={15} className="text-orange-400 flex-none" />
                      Seller Dashboard
                    </button>
                  )}
                  <div className="h-px bg-orange-100 mx-2 my-1" />
                  {currentUser || currentSeller ? (
                    <button
                      type="button"
                      onClick={() => { setProfileDropdownOpen(false); logout(); navigate("/"); }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors text-left"
                    >
                      <LogOut size={15} className="text-red-400 flex-none" />
                      Sign Out
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => { setProfileDropdownOpen(false); navigate("/auth"); }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-orange-600 hover:bg-orange-50 transition-colors text-left"
                    >
                      <User size={15} className="text-orange-400 flex-none" />
                      Sign In
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Mobile hamburger — unchanged */}
              <button
                type="button"
                className="md:hidden w-10 h-10 flex items-center justify-center rounded-xl text-gray-600 hover:bg-orange-50 hover:text-orange-500 transition-all"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
          </div>
        </div>

        {/* ── Mobile menu — uses optgroup for same multi-level feel ── */}
        {mobileMenuOpen && (
          <div className="md:hidden px-4 pb-4 space-y-3 bg-white border-t border-orange-100">
            <select
              value={selectedCategory}
              onChange={(e) => {
                const val = e.target.value.trim();
                setSelectedCategory(val);
                onCategoryChange?.(val);
              }}
              className="w-full border rounded px-3 py-2 text-sm"
            >
              {CATEGORY_MAP.map((cat) => (
                <optgroup
                  key={cat.name}
                  label={cat.subs.length > 0 ? `─ ${cat.name}` : cat.name}
                >
                  <option value={cat.name}>{cat.name} (All)</option>
                  {cat.subs.map((sub) => (
                    <option key={sub} value={sub}>
                      &nbsp;&nbsp;{sub}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>

            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-orange-500"
            />
          </div>
        )}
      </nav>
    </header>
  );
}
