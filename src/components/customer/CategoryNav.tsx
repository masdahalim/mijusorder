import React, { useState } from 'react';
import { ProductCategory } from '../../types';
import { CATEGORIES, CATEGORY_ICONS } from '../../data/mockData';
import { ChevronDown, ChevronUp, LayoutGrid, Check } from 'lucide-react';

interface CategoryNavProps {
  selectedCategory: ProductCategory | 'Semua';
  onSelectCategory: (category: ProductCategory | 'Semua') => void;
  categoryCounts?: Record<string, number>;
}

// Category visual metadata (thematic background accents & descriptions)
const CATEGORY_META: Record<
  string,
  {
    bgGradient: string;
    borderActive: string;
    iconBg: string;
    description: string;
  }
> = {
  Semua: {
    bgGradient: 'from-emerald-50 to-teal-50/80',
    borderActive: 'border-emerald-600 bg-emerald-50/90 ring-2 ring-emerald-500/30',
    iconBg: 'bg-emerald-100 text-emerald-900',
    description: 'Semua menu sehat',
  },
  'Jus Reguler': {
    bgGradient: 'from-amber-50 to-orange-50/80',
    borderActive: 'border-amber-600 bg-amber-50/90 ring-2 ring-amber-500/30',
    iconBg: 'bg-amber-100 text-amber-900',
    description: '100% Buah murni',
  },
  Musiman: {
    bgGradient: 'from-yellow-50 to-amber-50/80',
    borderActive: 'border-yellow-600 bg-yellow-50/90 ring-2 ring-yellow-500/30',
    iconBg: 'bg-yellow-100 text-yellow-900',
    description: 'Musim panen terbaik',
  },
  'Yogurt Series': {
    bgGradient: 'from-indigo-50 to-blue-50/80',
    borderActive: 'border-indigo-600 bg-indigo-50/90 ring-2 ring-indigo-500/30',
    iconBg: 'bg-indigo-100 text-indigo-900',
    description: 'Creamy & probiotik',
  },
  'Skincare Series': {
    bgGradient: 'from-rose-50 to-pink-50/80',
    borderActive: 'border-rose-600 bg-rose-50/90 ring-2 ring-rose-500/30',
    iconBg: 'bg-rose-100 text-rose-900',
    description: 'Glow & anti-aging',
  },
  'Healthy Series': {
    bgGradient: 'from-emerald-50 to-green-50/80',
    borderActive: 'border-emerald-600 bg-emerald-50/90 ring-2 ring-emerald-500/30',
    iconBg: 'bg-emerald-100 text-emerald-900',
    description: 'Detox & diet sehat',
  },
  Makanan: {
    bgGradient: 'from-orange-50 to-amber-50/80',
    borderActive: 'border-orange-600 bg-orange-50/90 ring-2 ring-orange-500/30',
    iconBg: 'bg-orange-100 text-orange-900',
    description: 'Rice bowl & toast',
  },
  Snack: {
    bgGradient: 'from-yellow-50 to-orange-50/80',
    borderActive: 'border-yellow-600 bg-yellow-50/90 ring-2 ring-yellow-500/30',
    iconBg: 'bg-yellow-100 text-yellow-900',
    description: 'Camilan renyah',
  },
  'Add-on': {
    bgGradient: 'from-zinc-50 to-slate-50/80',
    borderActive: 'border-zinc-700 bg-zinc-100 ring-2 ring-zinc-500/30',
    iconBg: 'bg-zinc-200 text-zinc-800',
    description: 'Topping & ekstra',
  },
};

export const CategoryNav: React.FC<CategoryNavProps> = ({
  selectedCategory,
  onSelectCategory,
  categoryCounts,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // All category entries including "Semua"
  const allCategoryList: Array<{ id: ProductCategory | 'Semua'; name: string; icon: string }> = [
    { id: 'Semua', name: 'Semua Menu', icon: '🌟' },
    ...CATEGORIES.map((cat) => ({
      id: cat,
      name: cat,
      icon: CATEGORY_ICONS[cat] || '🥗',
    })),
  ];

  // Total items count
  const totalMenuCount = categoryCounts
    ? Object.values(categoryCounts).reduce<number>((a, b) => a + (typeof b === 'number' ? b : 0), 0)
    : 0;

  // Initial limit: maximum 6 categories on home
  const initialLimit = 6;
  const displayedCategories = isExpanded
    ? allCategoryList
    : allCategoryList.slice(0, initialLimit);

  const hasMoreCategories = allCategoryList.length > initialLimit;

  return (
    <nav
      id="category-grid-nav"
      aria-label="Kategori Menu MiJUS"
      className="bg-white border-b border-zinc-200/80 p-4 shadow-xs"
    >
      {/* Category Section Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
            <LayoutGrid className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-black text-zinc-900 tracking-tight">Kategori Pilihan</h2>
            <p className="text-[11px] text-zinc-500">
              Pilih menu sehat favorit berdasarkan kategori
            </p>
          </div>
        </div>

        {hasMoreCategories && (
          <button
            type="button"
            onClick={() => setIsExpanded((prev) => !prev)}
            className="text-xs font-bold text-emerald-800 hover:text-emerald-950 flex items-center gap-1 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1.5 rounded-xl border border-emerald-200/60 transition-all cursor-pointer active:scale-95"
            aria-expanded={isExpanded}
          >
            <span>{isExpanded ? 'Tutup' : 'Lihat Semua'}</span>
            {isExpanded ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>
        )}
      </div>

      {/* 2-Column Mobile Responsive Grid with Large Touch Targets */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3">
        {displayedCategories.map((item) => {
          const isSelected = selectedCategory === item.id;
          const meta = CATEGORY_META[item.id] || CATEGORY_META['Semua'];
          const count =
            item.id === 'Semua'
              ? totalMenuCount
              : categoryCounts
              ? categoryCounts[item.id] ?? 0
              : 0;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectCategory(item.id)}
              className={`relative text-left p-3 sm:p-3.5 rounded-2xl border transition-all duration-200 cursor-pointer min-h-[76px] flex flex-col justify-between group active:scale-[0.98] ${
                isSelected
                  ? meta.borderActive
                  : 'bg-gradient-to-br ' +
                    meta.bgGradient +
                    ' border-zinc-200/80 hover:border-emerald-300 hover:shadow-sm'
              }`}
            >
              {/* Top Row: Icon/Thumbnail & Active Check Indicator */}
              <div className="flex items-center justify-between w-full mb-1.5">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg shadow-xs transition-transform group-hover:scale-110 ${meta.iconBg}`}
                >
                  <span>{item.icon}</span>
                </div>

                {isSelected ? (
                  <span className="w-5 h-5 rounded-full bg-emerald-700 text-white flex items-center justify-center shadow-xs">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </span>
                ) : (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-white/80 text-zinc-600 border border-zinc-200/60 shadow-2xs">
                    {count} Menu
                  </span>
                )}
              </div>

              {/* Bottom Row: Category Name & Subtitle */}
              <div>
                <div className="flex items-center justify-between gap-1">
                  <h3
                    className={`font-black text-xs sm:text-sm line-clamp-1 ${
                      isSelected ? 'text-emerald-950 font-extrabold' : 'text-zinc-900'
                    }`}
                  >
                    {item.name}
                  </h3>
                  {isSelected && (
                    <span className="text-[10px] font-black text-emerald-800 shrink-0">
                      {count}
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-zinc-500 line-clamp-1 font-medium mt-0.5">
                  {meta.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Expanded Footer Button (when not expanded) */}
      {!isExpanded && hasMoreCategories && (
        <button
          type="button"
          onClick={() => setIsExpanded(true)}
          className="w-full mt-3 py-2.5 px-4 rounded-2xl bg-zinc-50 hover:bg-emerald-50 border border-dashed border-zinc-300 hover:border-emerald-300 text-xs font-bold text-zinc-600 hover:text-emerald-800 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
        >
          <span>Lihat Semua {allCategoryList.length} Kategori Menu</span>
          <ChevronDown className="w-4 h-4 text-emerald-700" />
        </button>
      )}
    </nav>
  );
};
