import React from 'react';
import { CartItem } from '../../types';
import { formatRupiah } from '../../utils/formatters';
import { ShoppingBag, ChevronRight } from 'lucide-react';

interface FloatingCartProps {
  items: CartItem[];
  onOpenCart: () => void;
}

export const FloatingCart: React.FC<FloatingCartProps> = ({ items, onOpenCart }) => {
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + item.totalPrice, 0);

  if (totalItems === 0) return null;

  return (
    <div className="fixed bottom-20 left-0 right-0 z-40 px-4 pointer-events-none flex justify-center">
      <div className="w-full max-w-md pointer-events-auto">
        <button
          onClick={onOpenCart}
          className="w-full bg-gradient-to-r from-emerald-700 via-emerald-600 to-green-600 hover:from-emerald-800 hover:to-green-700 active:scale-[0.98] text-white p-3.5 rounded-3xl shadow-2xl shadow-emerald-950/30 flex items-center justify-between transition-all duration-200 border border-emerald-400/40 backdrop-blur-xs animate-in slide-in-from-bottom-4"
        >
          {/* Left: Bag Icon + Item count */}
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-xs">
              <ShoppingBag className="w-5 h-5 text-white" />
              <span className="absolute -top-1.5 -right-1.5 bg-amber-400 text-amber-950 text-[11px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-md">
                {totalItems}
              </span>
            </div>
            <div className="text-left">
              <div className="text-[11px] font-semibold text-emerald-100 uppercase tracking-wider">
                Total Keranjang
              </div>
              <div className="text-base font-black tracking-tight leading-tight">
                {formatRupiah(totalPrice)}
              </div>
            </div>
          </div>

          {/* Right: CTA Text & Arrow */}
          <div className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-2xl backdrop-blur-xs font-bold text-xs">
            <span>Lihat Pesanan</span>
            <ChevronRight className="w-4 h-4" />
          </div>
        </button>
      </div>
    </div>
  );
};
