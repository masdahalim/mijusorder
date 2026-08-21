import React, { useEffect } from 'react';
import { Order } from '../../types';
import { APP_CONFIG } from '../../config/appConfig';
import {
  formatRupiah,
  getOrderTypeBadge,
  getPaymentMethodLabel,
  buildWhatsAppOrderMessage,
  getWhatsAppUrl,
} from '../../utils/formatters';
import { CheckCircle2, MessageCircle, ArrowRight, ShoppingBag, Clock, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

interface OrderSuccessModalProps {
  order: Order | null;
  onClose: () => void;
  onTrackOrder: (order: Order) => void;
}

export const OrderSuccessModal: React.FC<OrderSuccessModalProps> = ({
  order,
  onClose,
  onTrackOrder,
}) => {
  if (!order) return null;

  useEffect(() => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#16a34a', '#22c55e', '#f59e0b', '#fbbf24', '#ffffff'],
      });
    } catch {
      // safe fallback
    }
  }, []);

  const typeBadge = getOrderTypeBadge(order.orderType);
  const paymentLabel = getPaymentMethodLabel(order.paymentMethod);
  const waMessage = buildWhatsAppOrderMessage(order);
  const waUrl = getWhatsAppUrl(APP_CONFIG.adminWhatsApp, waMessage);

  const handleOpenWhatsApp = () => {
    window.open(waUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-3xl p-5 sm:p-6 shadow-2xl border border-emerald-100 max-h-[92vh] overflow-y-auto animate-in zoom-in-95 duration-300">
        {/* Animated Success Badge */}
        <div className="text-center mb-4">
          <div className="w-16 h-16 bg-emerald-100 rounded-full mx-auto flex items-center justify-center text-emerald-600 mb-3 shadow-inner ring-8 ring-emerald-50 animate-bounce">
            <CheckCircle2 className="w-9 h-9 stroke-[2.5]" />
          </div>
          <span className="bg-amber-100 text-amber-900 font-extrabold text-[10px] uppercase px-2.5 py-0.5 rounded-full">
            Order Berhasil Dibuat
          </span>
          <h2 className="text-xl font-black text-zinc-900 mt-1">
            Terima Kasih, {order.customer.name}! 💚
          </h2>
          <div className="inline-block mt-2 px-3.5 py-1 bg-emerald-50 rounded-2xl border border-emerald-200">
            <span className="text-xs text-zinc-500 font-semibold">Nomor Pesanan: </span>
            <span className="font-mono font-black text-sm text-emerald-800">
              {order.id}
            </span>
          </div>
        </div>

        {/* Order Summary Card */}
        <div className="bg-zinc-50 rounded-2xl p-4 border border-zinc-200/80 space-y-3 text-xs mb-5">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-200">
            <span className="text-zinc-500 font-medium">Jenis Pesanan</span>
            <span
              className={`font-extrabold px-2 py-0.5 rounded-lg flex items-center gap-1 ${typeBadge.bg} ${typeBadge.text}`}
            >
              <span>{typeBadge.icon}</span>
              <span>{typeBadge.label}</span>
            </span>
          </div>

          <div className="flex items-center justify-between pb-2 border-b border-zinc-200">
            <span className="text-zinc-500 font-medium">Metode Pembayaran</span>
            <span className="font-bold text-zinc-900 flex items-center gap-1">
              <span>{paymentLabel.icon}</span>
              <span>{paymentLabel.label}</span>
            </span>
          </div>

          <div className="flex items-center justify-between pb-2 border-b border-zinc-200">
            <span className="text-zinc-500 font-medium">Status Pembayaran</span>
            <span className="font-extrabold text-orange-700 bg-orange-100 px-2 py-0.5 rounded-md">
              Menunggu Verifikasi Admin
            </span>
          </div>

          <div>
            <div className="text-zinc-500 font-medium mb-1.5">Menu Dipesan:</div>
            <div className="space-y-1">
              {order.items.map((item) => (
                <div
                  key={item.cartItemId}
                  className="flex items-center justify-between text-zinc-800"
                >
                  <span className="line-clamp-1">
                    {item.quantity}x {item.product.name}
                    {item.product.hasSizes ? ` (${item.size})` : ''}
                  </span>
                  <span className="font-bold shrink-0">{formatRupiah(item.totalPrice)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t border-zinc-200 flex items-center justify-between text-sm font-black text-emerald-950">
            <span>Total Pembayaran</span>
            <span className="text-emerald-800 text-base">{formatRupiah(order.total)}</span>
          </div>
        </div>

        {/* WhatsApp Auto-connect Prompt */}
        <div className="space-y-2.5 mb-5">
          <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-900 flex items-start gap-2.5">
            <MessageCircle className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold">Konfirmasi Otomatis ke WhatsApp Admin</div>
              <div className="text-[11px] text-emerald-800 mt-0.5">
                Kirim detail pesanan ke WhatsApp Admin MiJUS agar segera disiapkan & diverifikasi.
              </div>
            </div>
          </div>

          <button
            onClick={handleOpenWhatsApp}
            className="w-full py-3.5 px-4 bg-green-600 hover:bg-green-700 active:scale-[0.98] text-white font-black text-sm rounded-2xl shadow-lg shadow-green-600/30 flex items-center justify-center gap-2 transition-all"
          >
            <MessageCircle className="w-5 h-5" />
            <span>Kirim Konfirmasi ke WhatsApp</span>
          </button>
        </div>

        {/* Navigation Action Buttons */}
        <div className="grid grid-cols-2 gap-2.5 pt-2 border-t border-zinc-100">
          <button
            onClick={() => {
              onClose();
              onTrackOrder(order);
            }}
            className="py-2.5 px-3 bg-emerald-100 hover:bg-emerald-200 active:scale-95 text-emerald-900 font-bold text-xs rounded-xl flex items-center justify-center gap-1 transition-all"
          >
            <span>Lacak Status</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={onClose}
            className="py-2.5 px-3 bg-zinc-100 hover:bg-zinc-200 active:scale-95 text-zinc-700 font-bold text-xs rounded-xl transition-all"
          >
            Kembali ke Katalog
          </button>
        </div>
      </div>
    </div>
  );
};
