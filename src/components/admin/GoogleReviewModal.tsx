import React, { useState } from 'react';
import { Order } from '../../types';
import { APP_CONFIG } from '../../config/appConfig';
import { formatRupiah, getWhatsAppUrl } from '../../utils/formatters';
import { X, MessageCircle, Star, FileText, CheckCircle2, Copy, Check, Upload } from 'lucide-react';
import { markGoogleReviewSent } from '../../services/storeService';

interface GoogleReviewModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
}

export const GoogleReviewModal: React.FC<GoogleReviewModalProps> = ({
  order,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !order) return null;

  const [receiptNote, setReceiptNote] = useState(`Nota Order ${order.id} - ${order.customer.name}`);
  const [copied, setCopied] = useState(false);
  const [simulatedFile, setSimulatedFile] = useState<string | null>(null);

  const reviewMessage = `Terima kasih sudah order di MiJUS 💚

Pesanan kamu (${order.id}) sudah selesai dan siap dinikmati!

Kalau berkenan, bantu kami dengan memberikan rating dan ulasan di Google Review ya kak ${order.customer.name} 🙏 Ulasan kakak sangat berarti bagi kami untuk terus menjaga kesegaran & kualitas menu MiJUS.

Link Google Review:
${APP_CONFIG.googleReviewUrl}

Sampai jumpa di pesanan sehat berikutnya! 🥗🥤`;

  const waUrl = getWhatsAppUrl(order.customer.phone, reviewMessage);

  const handleSendWA = () => {
    markGoogleReviewSent(order.id);
    window.open(waUrl, '_blank');
    onClose();
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(reviewMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSimulateUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSimulatedFile(e.target.files[0].name);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-3xl p-5 sm:p-6 shadow-2xl border border-emerald-100 max-h-[92vh] overflow-y-auto animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <Star className="w-4 h-4 fill-amber-500" />
            </div>
            <h2 className="font-black text-base text-zinc-900">Kirim Bukti & Review Google</h2>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-600 flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4 my-4 text-xs">
          {/* Customer Summary */}
          <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-100">
            <div className="font-bold text-emerald-950 flex justify-between">
              <span>{order.customer.name}</span>
              <span className="font-mono text-emerald-700">{order.customer.phone}</span>
            </div>
            <div className="text-[11px] text-zinc-600 mt-1">
              Order: <span className="font-bold text-zinc-800">{order.id}</span> • Total:{' '}
              <span className="font-bold text-emerald-800">{formatRupiah(order.total)}</span>
            </div>
          </div>

          {/* Receipt Attachment (Simulated) */}
          <div>
            <label className="block font-bold text-zinc-700 mb-1">
              Lampirkan Bukti / Nota Transaksi (Opsional)
            </label>
            <div className="flex items-center gap-2">
              <label className="flex-1 border-2 border-dashed border-zinc-300 hover:border-emerald-500 rounded-xl p-3 text-center cursor-pointer bg-zinc-50 transition-colors">
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleSimulateUpload}
                  className="hidden"
                />
                <div className="flex items-center justify-center gap-2 text-zinc-600">
                  <Upload className="w-4 h-4 text-emerald-600" />
                  <span className="font-semibold text-[11px]">
                    {simulatedFile ? `Terlampir: ${simulatedFile}` : 'Pilih Foto Struk / Nota'}
                  </span>
                </div>
              </label>
            </div>
          </div>

          {/* Message Preview Box */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-bold text-zinc-700">Pesan WhatsApp Otomatis:</label>
              <button
                type="button"
                onClick={handleCopy}
                className="text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-1"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Tersalin' : 'Salin Pesan'}</span>
              </button>
            </div>
            <div className="p-3 bg-zinc-100 rounded-2xl border border-zinc-200 text-zinc-800 font-mono text-[11px] whitespace-pre-line leading-relaxed max-h-48 overflow-y-auto">
              {reviewMessage}
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2 border-t border-zinc-100">
          <button
            onClick={handleSendWA}
            className="w-full py-3 px-4 bg-green-600 hover:bg-green-700 active:scale-98 text-white font-extrabold text-xs rounded-2xl shadow-lg shadow-green-600/30 flex items-center justify-center gap-2 transition-all"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Kirim Pesan Review via WhatsApp</span>
          </button>
        </div>
      </div>
    </div>
  );
};
