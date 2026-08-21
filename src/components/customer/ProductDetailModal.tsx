import React, { useState } from 'react';
import { Product, ProductAddOn, CartItem } from '../../types';
import { COMMON_ADD_ONS } from '../../data/mockData';
import { formatRupiah } from '../../utils/formatters';
import { X, Plus, Minus, Check, Sparkles, Ban, AlertCircle } from 'lucide-react';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (item: Omit<CartItem, 'cartItemId'>) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onAddToCart,
}) => {
  if (!product) return null;

  const isOutOfStock = !product.isAvailable || product.isOutOfStock === true;

  const [selectedSize, setSelectedSize] = useState<'MED' | 'UP'>('MED');
  const [selectedAddOns, setSelectedAddOns] = useState<ProductAddOn[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');

  // Calculate unit price based on size and add-ons
  const basePrice =
    selectedSize === 'UP' && product.priceUp ? product.priceUp : product.priceMed;
  const addOnsTotal = selectedAddOns.reduce((sum, item) => sum + item.price, 0);
  const unitPrice = basePrice + addOnsTotal;
  const totalPrice = unitPrice * quantity;

  const toggleAddOn = (addon: ProductAddOn) => {
    if (isOutOfStock) return;
    setSelectedAddOns((prev) => {
      const exists = prev.some((a) => a.id === addon.id);
      if (exists) {
        return prev.filter((a) => a.id !== addon.id);
      } else {
        return [...prev, addon];
      }
    });
  };

  const handleAdd = () => {
    if (isOutOfStock) return;
    onAddToCart({
      product,
      size: product.hasSizes ? selectedSize : 'MED',
      selectedAddOns,
      notes: notes.trim(),
      unitPrice,
      quantity,
      totalPrice,
    });
    onClose();
  };

  // Filter relevant addons based on category
  const relevantAddOns = COMMON_ADD_ONS.filter((a) => {
    if (product.category === 'Makanan' || product.category === 'Snack') {
      return a.category === 'Makanan' || a.category === 'Semua';
    }
    return a.category === 'Minuman' || a.category === 'Semua';
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-t-[32px] sm:rounded-[32px] max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-bottom-6 duration-300">
        {/* Header Photo Container */}
        <div className="relative h-56 sm:h-64 w-full bg-emerald-100 shrink-0">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src =
                'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30" />

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/50 hover:bg-black/70 active:scale-95 text-white flex items-center justify-center backdrop-blur-xs transition-all"
            aria-label="Tutup Detail"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Category Tag & Badge */}
          <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-2">
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="bg-emerald-600 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
                  {product.category}
                </span>
                {isOutOfStock && (
                  <span className="bg-rose-600 text-white text-[11px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-sm flex items-center gap-1">
                    <Ban className="w-3 h-3 stroke-[2.5]" />
                    <span>Habis</span>
                  </span>
                )}
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white leading-tight mt-1.5 drop-shadow-md">
                {product.name}
              </h2>
            </div>
            {product.calories && (
              <span className="bg-white/90 text-emerald-950 font-extrabold text-xs px-2.5 py-1 rounded-xl shadow-md shrink-0">
                🔥 {product.calories} kcal
              </span>
            )}
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-5 overflow-y-auto space-y-5 text-zinc-800 flex-1">
          {/* Out of Stock Warning Banner */}
          {isOutOfStock && (
            <div className="bg-rose-50 border border-rose-200/90 rounded-2xl p-3.5 flex items-start gap-3 text-rose-900 shadow-xs">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-rose-700">
                  Stok Menu Sedang Habis (Not Available)
                </h4>
                <p className="text-xs text-rose-800/90 mt-0.5 leading-relaxed font-medium">
                  Mohon maaf, menu ini sedang tidak dapat dipesan saat ini. Silakan explore varian jus segar atau menu lezat lainnya!
                </p>
              </div>
            </div>
          )}

          {/* Description */}
          <div>
            <p className="text-sm text-zinc-600 leading-relaxed font-medium">
              {product.description}
            </p>

            {/* Health / Skin Benefits if available */}
            {product.benefits && product.benefits.length > 0 && (
              <div className="mt-3 bg-emerald-50 rounded-2xl p-3 border border-emerald-100/80">
                <div className="text-xs font-bold text-emerald-900 flex items-center gap-1.5 mb-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Manfaat Sehat & Cantik:</span>
                </div>
                <ul className="space-y-1">
                  {product.benefits.map((b, idx) => (
                    <li key={idx} className="text-xs text-emerald-800 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Size Selection (if product has sizes) */}
          {product.hasSizes && (
            <div className="border-t border-zinc-100 pt-4">
              <div className="flex items-center justify-between mb-2.5">
                <h3 className="font-extrabold text-sm text-zinc-900">
                  Pilih Ukuran <span className="text-rose-500">*</span>
                </h3>
                <span className="text-xs text-zinc-500 font-semibold">Wajib 1</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedSize('MED')}
                  className={`p-3 rounded-2xl border text-left transition-all relative flex flex-col justify-between ${
                    selectedSize === 'MED'
                      ? 'border-emerald-500 bg-emerald-50/70 ring-2 ring-emerald-500/20'
                      : 'border-zinc-200 hover:border-zinc-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-zinc-900">Medium (MED)</span>
                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        selectedSize === 'MED'
                          ? 'border-emerald-600 bg-emerald-600 text-white'
                          : 'border-zinc-300'
                      }`}
                    >
                      {selectedSize === 'MED' && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                    </div>
                  </div>
                  <span className="text-xs font-black text-emerald-800 mt-2">
                    {formatRupiah(product.priceMed)}
                  </span>
                </button>

                {product.priceUp && (
                  <button
                    type="button"
                    onClick={() => setSelectedSize('UP')}
                    className={`p-3 rounded-2xl border text-left transition-all relative flex flex-col justify-between ${
                      selectedSize === 'UP'
                        ? 'border-emerald-500 bg-emerald-50/70 ring-2 ring-emerald-500/20'
                        : 'border-zinc-200 hover:border-zinc-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <span className="font-bold text-sm text-zinc-900">Upsize (UP)</span>
                        <span className="bg-amber-100 text-amber-900 text-[10px] font-black px-1.5 py-0.2 rounded-md">
                          +Puas
                        </span>
                      </div>
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          selectedSize === 'UP'
                            ? 'border-emerald-600 bg-emerald-600 text-white'
                            : 'border-zinc-300'
                        }`}
                      >
                        {selectedSize === 'UP' && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                      </div>
                    </div>
                    <span className="text-xs font-black text-emerald-800 mt-2">
                      {formatRupiah(product.priceUp)}
                    </span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Add-ons / Toppings */}
          {relevantAddOns.length > 0 && (
            <div className="border-t border-zinc-100 pt-4">
              <div className="flex items-center justify-between mb-2.5">
                <h3 className="font-extrabold text-sm text-zinc-900">Tambahan / Extra Topping</h3>
                <span className="text-xs text-zinc-500">Opsional</span>
              </div>

              <div className="space-y-2">
                {relevantAddOns.map((addon) => {
                  const isChecked = selectedAddOns.some((a) => a.id === addon.id);
                  return (
                    <label
                      key={addon.id}
                      onClick={() => toggleAddOn(addon)}
                      className={`flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer ${
                        isChecked
                          ? 'border-emerald-500 bg-emerald-50/60'
                          : 'border-zinc-200 hover:border-zinc-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-colors ${
                            isChecked
                              ? 'border-emerald-600 bg-emerald-600 text-white'
                              : 'border-zinc-300 bg-white'
                          }`}
                        >
                          {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                        <span className="text-xs sm:text-sm font-semibold text-zinc-800">
                          {addon.name}
                        </span>
                      </div>
                      <span className="text-xs font-extrabold text-emerald-800">
                        +{formatRupiah(addon.price)}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* Order Notes */}
          <div className="border-t border-zinc-100 pt-4">
            <h3 className="font-extrabold text-sm text-zinc-900 mb-1.5">Catatan Pesanan</h3>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contoh: Es batu sedikit, tanpa gula, pedas sedang, dll."
              rows={2}
              className="w-full text-xs sm:text-sm p-3 rounded-2xl border border-zinc-200 focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 resize-none transition-all placeholder:text-zinc-400"
            />
          </div>
        </div>

        {/* Sticky Footer: Quantity Selector & Add Button */}
        <div className="p-4 bg-white border-t border-zinc-100 shadow-xl flex items-center gap-3 shrink-0">
          {/* Quantity Controls */}
          <div className="flex items-center bg-zinc-100 rounded-2xl p-1 shrink-0 border border-zinc-200">
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              disabled={isOutOfStock || quantity <= 1}
              className="w-8 h-8 rounded-xl bg-white disabled:opacity-30 disabled:cursor-not-allowed text-zinc-800 flex items-center justify-center shadow-xs active:scale-95 transition-all cursor-pointer"
              aria-label="Kurangi Jumlah"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span
              className={`w-8 text-center font-black text-sm ${
                isOutOfStock ? 'text-zinc-400' : 'text-zinc-900'
              }`}
            >
              {quantity}
            </span>
            <button
              onClick={() => setQuantity((q) => q + 1)}
              disabled={isOutOfStock}
              className="w-8 h-8 rounded-xl bg-white disabled:opacity-30 disabled:cursor-not-allowed text-zinc-800 flex items-center justify-center shadow-xs active:scale-95 transition-all cursor-pointer"
              aria-label="Tambah Jumlah"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Add to Cart CTA / Out of stock CTA */}
          {isOutOfStock ? (
            <button
              disabled
              className="flex-1 py-3.5 px-4 bg-zinc-100 text-zinc-400 font-extrabold text-xs sm:text-sm rounded-2xl border border-zinc-200 flex items-center justify-center gap-2 cursor-not-allowed shadow-none select-none"
            >
              <Ban className="w-4 h-4 text-rose-500 stroke-[2.5]" />
              <span className="text-zinc-600 font-black">Menu Sedang Habis (Tidak Tersedia)</span>
            </button>
          ) : (
            <button
              onClick={handleAdd}
              className="flex-1 py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-emerald-600/30 flex items-center justify-between transition-all cursor-pointer"
            >
              <span>Tambah ke Keranjang</span>
              <span className="bg-emerald-800/60 px-2.5 py-1 rounded-xl text-xs font-black">
                {formatRupiah(totalPrice)}
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
