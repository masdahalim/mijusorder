import React from 'react';
import { CartItem } from '../../types';
import { formatRupiah } from '../../utils/formatters';
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight, Sparkles } from 'lucide-react';
import { APP_CONFIG } from '../../config/appConfig';

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (cartItemId: string, newQty: number) => void;
  onRemoveItem: (cartItemId: string) => void;
  onClearCart: () => void;
  onProceedCheckout: () => void;
  customerStamps?: number;
}

export const CartModal: React.FC<CartModalProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onProceedCheckout,
}) => {
  if (!isOpen) return null;

  const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const isEligibleForStamp = subtotal >= APP_CONFIG.loyalty.minTransactionForStamp;

  return (
    <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-t-[32px] sm:rounded-[32px] max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-bottom-6 duration-300">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-100 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-base sm:text-lg text-zinc-900 leading-tight">
                Keranjang Pesanan
              </h2>
              <p className="text-xs text-zinc-500 font-medium">
                {totalItems} menu dipilih
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {items.length > 0 && (
              <button
                onClick={onClearCart}
                className="text-xs text-rose-600 hover:text-rose-700 font-semibold px-2 py-1 hover:bg-rose-50 rounded-xl transition-colors"
              >
                Kosongkan
              </button>
            )}
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-zinc-100 hover:bg-zinc-200 active:scale-95 text-zinc-600 flex items-center justify-center transition-all"
              aria-label="Tutup Keranjang"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Items List */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4">
          {items.length === 0 ? (
            <div className="py-12 text-center text-zinc-400">
              <div className="w-20 h-20 mx-auto mb-3 rounded-3xl bg-zinc-100 flex items-center justify-center text-4xl">
                🛒
              </div>
              <p className="font-bold text-zinc-700 text-base">Keranjangmu masih kosong</p>
              <p className="text-xs text-zinc-500 mt-1 max-w-xs mx-auto">
                Yuk pilih jus segar dan makanan lezat favoritmu dari katalog MiJUS!
              </p>
              <button
                onClick={onClose}
                className="mt-5 px-6 py-2.5 bg-emerald-600 text-white font-bold text-xs rounded-2xl shadow-md hover:bg-emerald-700 active:scale-95 transition-all"
              >
                Jelajahi Menu
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.cartItemId}
                className="bg-zinc-50/80 rounded-2xl p-3.5 border border-zinc-200/70 flex gap-3 items-start relative group"
              >
                {/* Item Thumbnail */}
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-emerald-100 shrink-0 border border-zinc-200">
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-extrabold text-sm text-zinc-900 leading-snug line-clamp-1">
                      {item.product.name}
                    </h3>
                    <button
                      onClick={() => onRemoveItem(item.cartItemId)}
                      className="text-zinc-400 hover:text-rose-600 transition-colors p-0.5"
                      title="Hapus menu"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Size & Add-ons tags */}
                  <div className="flex flex-wrap items-center gap-1 mt-1">
                    {item.product.hasSizes && (
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-1.5 py-0.2 rounded-md">
                        Size {item.size}
                      </span>
                    )}
                    {item.selectedAddOns.map((addon) => (
                      <span
                        key={addon.id}
                        className="bg-amber-100 text-amber-900 text-[10px] font-semibold px-1.5 py-0.2 rounded-md"
                      >
                        +{addon.name}
                      </span>
                    ))}
                  </div>

                  {/* Item Notes */}
                  {item.notes && (
                    <p className="text-[11px] text-zinc-500 italic mt-1 bg-white/70 p-1.5 rounded-lg border border-zinc-200/50">
                      "{item.notes}"
                    </p>
                  )}

                  {/* Price & Quantity Controls */}
                  <div className="mt-2.5 flex items-center justify-between">
                    <span className="font-black text-sm text-emerald-800">
                      {formatRupiah(item.totalPrice)}
                    </span>

                    <div className="flex items-center bg-white rounded-xl border border-zinc-200 p-0.5 shadow-2xs">
                      <button
                        onClick={() => onUpdateQuantity(item.cartItemId, item.quantity - 1)}
                        className="w-6 h-6 rounded-lg text-zinc-700 hover:bg-zinc-100 flex items-center justify-center transition-colors"
                        aria-label="Kurang"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-7 text-center font-bold text-xs text-zinc-900">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => onUpdateQuantity(item.cartItemId, item.quantity + 1)}
                        className="w-6 h-6 rounded-lg text-zinc-700 hover:bg-zinc-100 flex items-center justify-center transition-colors"
                        aria-label="Tambah"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}

          {/* Loyalty Stamp Reminder Banner */}
          {items.length > 0 && (
            <div
              className={`p-3 rounded-2xl border text-xs flex items-center gap-2.5 ${
                isEligibleForStamp
                  ? 'bg-amber-50 border-amber-200 text-amber-950'
                  : 'bg-zinc-50 border-zinc-200 text-zinc-600'
              }`}
            >
              <div className="text-xl shrink-0">🥗</div>
              <div>
                <div className="font-bold flex items-center gap-1">
                  <span>Stamp MiJUS Loyalty</span>
                  {isEligibleForStamp && (
                    <span className="bg-amber-500 text-white text-[9px] font-black px-1.5 py-0.2 rounded-md">
                      +1 STAMP AKTIF
                    </span>
                  )}
                </div>
                <div className="text-[11px] mt-0.5">
                  {isEligibleForStamp
                    ? 'Pesanan ini berhak mendapatkan 1 stamp loyalty setelah selesai!'
                    : `Tambah belanja ${formatRupiah(
                        APP_CONFIG.loyalty.minTransactionForStamp - subtotal
                      )} lagi untuk dapat 1 stamp (min. Rp 50.000).`}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer & Checkout Action */}
        {items.length > 0 && (
          <div className="p-4 sm:p-5 bg-white border-t border-zinc-100 shadow-xl space-y-3 shrink-0">
            <div className="flex items-center justify-between text-sm">
              <span className="text-zinc-500 font-medium">Subtotal Pesanan</span>
              <span className="font-extrabold text-base text-zinc-900">
                {formatRupiah(subtotal)}
              </span>
            </div>

            <button
              onClick={() => {
                onClose();
                onProceedCheckout();
              }}
              className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-emerald-600/30 flex items-center justify-between transition-all"
            >
              <span>Lanjut ke Pembayaran</span>
              <div className="flex items-center gap-1.5">
                <span className="bg-emerald-800/60 px-2.5 py-0.8 rounded-xl text-xs font-black">
                  {formatRupiah(subtotal)}
                </span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
