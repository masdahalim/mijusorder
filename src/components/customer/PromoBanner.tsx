import React, { useState, useEffect } from 'react';
import { PromoBanner as PromoBannerType, ProductCategory } from '../../types';
import { INITIAL_PROMO_BANNERS } from '../../data/mockData';
import { Sparkles, ChevronRight, Tag } from 'lucide-react';

interface PromoBannerProps {
  onSelectCategory: (cat: ProductCategory) => void;
  onOpenLoyalty: () => void;
}

export const PromoBanner: React.FC<PromoBannerProps> = ({ onSelectCategory, onOpenLoyalty }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % INITIAL_PROMO_BANNERS.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const banner = INITIAL_PROMO_BANNERS[activeIndex];

  const handleClick = () => {
    if (banner.id === 'promo-2') {
      onOpenLoyalty();
    } else if (banner.actionCategory) {
      onSelectCategory(banner.actionCategory);
    }
  };

  return (
    <div className="px-4 pt-3.5 pb-2">
      <div
        onClick={handleClick}
        className={`relative overflow-hidden rounded-3xl bg-gradient-to-r ${banner.bgColor} p-4 text-white shadow-lg cursor-pointer transform active:scale-98 transition-all duration-300 border border-white/20`}
      >
        {/* Playful background decorative shapes */}
        <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none" />
        <div className="absolute top-0 right-10 w-16 h-16 bg-white/10 rounded-full blur-md pointer-events-none" />

        <div className="relative z-10 flex items-start justify-between gap-3">
          <div className="space-y-1 max-w-[82%]">
            <span
              className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${banner.badgeColor} shadow-xs`}
            >
              {banner.tag}
            </span>
            <h3 className="font-extrabold text-base leading-tight tracking-tight drop-shadow-xs">
              {banner.title}
            </h3>
            <p className="text-xs text-white/90 font-medium line-clamp-2">
              {banner.subtitle}
            </p>
            <div className="pt-1 flex items-center gap-1.5 text-xs font-bold text-amber-300">
              <span>{banner.highlight}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </div>

          <div className="text-3xl filter drop-shadow-md">
            {banner.id === 'promo-1' ? '🌿' : banner.id === 'promo-2' ? '🥗' : '✨'}
          </div>
        </div>

        {/* Carousel Indicators */}
        <div className="flex items-center gap-1.5 justify-center mt-3 pt-1">
          {INITIAL_PROMO_BANNERS.map((_, i) => (
            <button
              key={i}
              onClick={(e) => {
                e.stopPropagation();
                setActiveIndex(i);
              }}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === activeIndex ? 'w-6 bg-white shadow-sm' : 'w-2 bg-white/40'
              }`}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
