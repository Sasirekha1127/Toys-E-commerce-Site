// =============================================================
// frontend/VariantSelector.jsx
// Reusable, toy-store styled variant selector
// Supports: color swatches, size pills, pack buttons, any string value
// =============================================================

import React, { useMemo } from 'react';
import { CheckCircle2 } from 'lucide-react';

// ── Toy-brand color map for color variant swatches ────────────
const COLOR_MAP = {
  red:    '#EF4444', blue:    '#3B82F6', green:  '#22C55E',
  yellow: '#EAB308', pink:    '#EC4899', purple: '#A855F7',
  orange: '#F97316', black:   '#1F2937', white:  '#F9FAFB',
  brown:  '#92400E', grey:    '#9CA3AF', gray:   '#9CA3AF',
  teal:   '#14B8A6', navy:    '#1E3A5F', maroon: '#7F1D1D',
  gold:   '#D97706', silver:  '#CBD5E1', cyan:   '#06B6D4',
};


function getSwatch(value) {
  const lower = value.toLowerCase().trim();
  // Direct match
  if (COLOR_MAP[lower]) return COLOR_MAP[lower];
  // Partial match (e.g. "Light Blue")
  for (const [key, hex] of Object.entries(COLOR_MAP)) {
    if (lower.includes(key)) return hex;
  }
  return null;
}

function isColorVariant(variantName) {
  if (!variantName) return false;
  const name = String(variantName).toLowerCase().trim();
  // Support any variation of color, colour, shade, etc.
  return name.includes('color') || name.includes('colour') || name.includes('shade') || name.includes('variant');
}

// ── Group variants by their variant_name ─────────────────────
function groupVariants(variants) {
  if (!Array.isArray(variants)) return {};
  return variants.reduce((acc, v) => {
    // Standardize variant name to 'Color' if it matches color pattern
    const rawName = v.variant_name || v.variant_type || 'Color';
    const name = isColorVariant(rawName) ? 'Color' : rawName;
    
    if (!acc[name]) acc[name] = [];
    acc[name].push({
      ...v,
      variant_name: name // Normalize for consistent usage
    });
    return acc;
  }, {});
}

// ── Single color swatch button ────────────────────────────────
function ColorSwatch({ variant, isSelected, onSelect, outOfStock }) {
  const swatch = getSwatch(variant.variant_value);
  const isLight = ['white', '#F9FAFB', '#CBD5E1'].includes(swatch);

  return (
    <button
      title={`${variant.variant_value}${outOfStock ? ' – Out of Stock' : ''}`}
      onClick={() => !outOfStock && onSelect(variant)}
      className={`
        relative w-9 h-9 rounded-full border-2 transition-all duration-200
        hover:scale-110 active:scale-95
        ${outOfStock ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
        ${isSelected
          ? 'border-orange-500 scale-110 shadow-md ring-2 ring-orange-300 ring-offset-1'
          : isLight
            ? 'border-gray-300 hover:border-orange-300'
            : 'border-transparent hover:border-orange-300'
        }
      `}
      style={{ backgroundColor: swatch || '#E5E7EB' }}
      disabled={outOfStock}
    >
      {isSelected && (
        <CheckCircle2
          size={14}
          className={`absolute inset-0 m-auto ${isLight ? 'text-orange-600' : 'text-white'}`}
        />
      )}
      {outOfStock && (
        <span
          className="absolute inset-0 flex items-center justify-center"
          aria-hidden="true"
        >
          <span className="w-full h-px bg-red-400 rotate-45 block" />
        </span>
      )}
    </button>
  );
}

// ── Pill / text button ────────────────────────────────────────
function VariantPill({ variant, isSelected, onSelect, outOfStock }) {
  return (
    <button
      onClick={() => !outOfStock && onSelect(variant)}
      disabled={outOfStock}
      className={`
        relative px-4 py-2 rounded-xl border-2 text-sm font-bold transition-all duration-200
        hover:scale-105 active:scale-95
        ${outOfStock ? 'opacity-40 cursor-not-allowed line-through' : 'cursor-pointer'}
        ${isSelected
          ? 'border-orange-500 bg-orange-500 text-white shadow-md scale-105'
          : 'border-orange-100 bg-white text-gray-700 hover:border-orange-300 hover:bg-orange-50'
        }
      `}
    >
      {variant.variant_value}
      {variant.price && (
        <span className={`ml-1.5 text-[10px] font-semibold ${isSelected ? 'text-orange-100' : 'text-orange-400'}`}>
          ₹{Number(variant.price)}
        </span>
      )}
    </button>
  );
}

// ── Main VariantSelector ──────────────────────────────────────
export default function VariantSelector({ variants, selectedVariant, onSelect }) {
  const grouped = useMemo(() => groupVariants(variants), [variants]);

  if (!variants || variants.length === 0) return null;

  return (
    <div className="space-y-4">
      {Object.entries(grouped)
        .filter(([groupName]) => isColorVariant(groupName))
        .map(([groupName, groupVariants]) => {
        const isColor = isColorVariant(groupName);
        // Find the selected variant within this group (null if none in this group)
        const selectedInGroup = selectedVariant?.variant_name === groupName
          ? selectedVariant
          : null;

        return (
          <div key={groupName} className="space-y-2">
            {/* Group label */}
            <div className="flex items-center gap-2">
              <p className="text-sm font-bold text-gray-700">Select {groupName}:</p>
              {selectedInGroup && (
                <span className="text-sm font-semibold text-orange-600">
                  {selectedInGroup.variant_value}
                  {selectedInGroup.stock_quantity <= 5 && selectedInGroup.stock_quantity > 0 && (
                    <span className="ml-2 text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                      Only {selectedInGroup.stock_quantity} left!
                    </span>
                  )}
                </span>
              )}
            </div>

            {/* Variant options */}
            <div className="flex flex-wrap gap-2">
              {isColor
                ? groupVariants.map((v) => (
                    <ColorSwatch
                      key={v.variant_id || v.sku || v.id}
                      variant={v}
                      isSelected={selectedInGroup?.variant_id === v.variant_id}
                      onSelect={onSelect}
                      outOfStock={v.stock_quantity === 0}
                    />
                  ))
                : groupVariants.map((v) => (
                    <VariantPill
                      key={v.variant_id || v.sku || v.id}
                      variant={v}
                      isSelected={selectedInGroup?.variant_id === v.variant_id}
                      onSelect={onSelect}
                      outOfStock={v.stock_quantity === 0}
                    />
                  ))
              }
            </div>
          </div>
        );
      })}

      {/* Clear selection link */}
      {selectedVariant && (
        <button
          onClick={() => onSelect(null)}
          className="text-xs text-gray-400 hover:text-orange-500 font-medium transition-colors underline-offset-2 hover:underline"
        >
          Clear selection
        </button>
      )}
    </div>
  );
}