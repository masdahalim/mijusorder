import React from 'react';
import { Product } from '../../types';
import { formatRupiah } from '../../utils/formatters';
import { Plus, Flame, Ban } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
  onQuickAdd?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onSelect }) => {
  const isOutOfStock = !product.isAvailable || product.isOutOfStock === true;

  return (
    <div
      onClick={() => onSelect(product)}
      className={`group relative bg-white rounded-3xl p-3.5 border transition-all duration-200 cursor-pointer flex gap-3.5 items-center justify-between ${
        isOutOfStock
          ? 'border-zinc-200/90 bg-zinc-50/80 hover:border-zinc-300'
          : 'border-emerald-100 hover:border-emerald-400 hover:shadow-lg hover:shadow-emerald-500/10 active:scale-[0.99]'
      }`}
    >
      {/* Left Info */}
      <div className="flex-1 min-w-0 pr-1">
        {/* Badges */}
        <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
          {isOutOfStock ? (
            <span className="inline-flex items-center gap-1 bg-rose-600 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full shadow-xs uppercase tracking-wider">
              <Ban className="w-3 h-3 stroke-[2.5]" />
              <span>Habis</span>
            </span>
          ) : (
            <>
              {product.isBestSeller && (
                <span className="inline-flex items-center gap-0.5 bg-amber-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-xs">
                  <Flame className="w-3 h-3 fill-amber-200" /> Best Seller
                </span>
              )}
              {product.tags && product.tags.length > 0 && (
                <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {product.tags[0]}
                </span>
              )}
            </>
          )}
        </div>

        {/* Product Name */}
        <h3
          className={`font-extrabold text-sm sm:text-base leading-snug line-clamp-1 transition-colors ${
            isOutOfStock
              ? 'text-zinc-500 group-hover:text-zinc-700'
              : 'text-zinc-900 group-hover:text-emerald-700'
          }`}
        >
          {product.name}
        </h3>

        {/* Product Description */}
        <p
          className={`text-xs font-normal line-clamp-2 mt-0.5 leading-relaxed ${
            isOutOfStock ? 'text-zinc-400' : 'text-zinc-500'
          }`}
        >
          {product.description}
        </p>

        {/* Pricing Display */}
        <div className="mt-2.5 flex items-baseline gap-2">
          {isOutOfStock ? (
            <div className="flex items-center gap-2">
              <span className="text-zinc-400 font-extrabold text-sm line-through">
                {formatRupiah(product.priceMed)}
              </span>
              <span className="text-[11px] font-bold text-rose-600 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-md">
                Stok Habis
              </span>
            </div>
          ) : product.hasSizes && product.priceUp ? (
            <div className="flex items-baseline gap-1.5 flex-wrap">
              <span className="text-emerald-800 font-extrabold text-sm sm:text-base">
                {formatRupiah(product.priceMed)}
              </span>
              <span className="text-[11px] font-bold text-zinc-500">
                (MED) • {formatRupiah(product.priceUp)} (UP)
              </span>
            </div>
          ) : (
            <span className="text-emerald-800 font-extrabold text-sm sm:text-base">
              {formatRupiah(product.priceMed)}
            </span>
          )}
        </div>
      </div>

      {/* Right Image + Action Button */}
      <div className="relative shrink-0 w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden bg-emerald-50 border border-emerald-100 shadow-inner">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className={`w-full h-full object-cover transition-transform duration-500 ${
            isOutOfStock ? 'grayscale opacity-60' : 'group-hover:scale-105'
          }`}
          onError={(e) => {
            // Fallback image in case network fails
            (e.currentTarget as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80';
          }}
        />

        {/* Out of stock overlay badge */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-zinc-950/65 backdrop-blur-[1px] flex flex-col items-center justify-center p-1 text-center">
            <span className="bg-rose-600 text-white font-black text-[11px] uppercase tracking-wider px-2 py-0.5 rounded-lg shadow-md flex items-center gap-1 border border-rose-400/50">
              <Ban className="w-3 h-3 stroke-[2.5]" />
              <span>Habis</span>
            </span>
            <span className="text-[9px] text-zinc-200 font-semibold mt-1">Stok Kosong</span>
          </div>
        )}

        {/* Plus / Add Button Overlay */}
        {!isOutOfStock && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelect(product);
            }}
            className="absolute bottom-1.5 right-1.5 bg-emerald-600 hover:bg-emerald-700 active:scale-90 text-white p-1.5 sm:p-2 rounded-xl shadow-lg shadow-emerald-700/40 transition-all flex items-center justify-center border border-white/50 cursor-pointer"
            title="Tambah ke Keranjang"
            aria-label={`Tambah ${product.name}`}
          >
            <Plus className="w-4 h-4 sm:w-4.5 sm:h-4.5 stroke-[2.5]" />
          </button>
        )}
      </div>
    </div>
  );
};
