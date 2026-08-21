import React, { useState, useEffect } from 'react';
import { CustomerLoyalty } from '../../types';
import { APP_CONFIG } from '../../config/appConfig';
import { lookupCustomerLoyalty } from '../../services/storeService';
import {
  X,
  Phone,
  Search,
  Gift,
  Star,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  HelpCircle,
  RefreshCw,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface CekStampModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCustomerPhone: (phone: string, name: string) => void;
  onGoToMenu: () => void;
  initialPhone?: string;
}

export const CekStampModal: React.FC<CekStampModalProps> = ({
  isOpen,
  onClose,
  onSelectCustomerPhone,
  onGoToMenu,
  initialPhone = '',
}) => {
  const [phoneNumber, setPhoneNumber] = useState(initialPhone);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchResult, setSearchResult] = useState<{
    found: boolean;
    loyalty: CustomerLoyalty | null;
  } | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (initialPhone) {
        setPhoneNumber(initialPhone);
        const res = lookupCustomerLoyalty(initialPhone);
        setSearchResult(res);
        setHasSearched(true);
        if (res.found && (res.loyalty?.stamps === 10 || (res.loyalty?.rewardsAvailable || 0) > 0)) {
          triggerConfetti();
        }
      } else {
        setPhoneNumber('');
        setHasSearched(false);
        setSearchResult(null);
      }
    }
  }, [isOpen, initialPhone]);

  if (!isOpen) return null;

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#10b981', '#f59e0b', '#34d399', '#fbbf24', '#047857'],
      });
    } catch {
      // safe fallback
    }
  };

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = phoneNumber.trim().replace(/[^0-9]/g, '');
    if (!clean) return;

    const res = lookupCustomerLoyalty(clean);
    setSearchResult(res);
    setHasSearched(true);

    if (res.found && res.loyalty) {
      onSelectCustomerPhone(res.loyalty.phone, res.loyalty.name);
      if (res.loyalty.stamps >= 10 || res.loyalty.rewardsAvailable > 0) {
        triggerConfetti();
      }
    }
  };

  const handleQuickSelect = (phone: string) => {
    setPhoneNumber(phone);
    const res = lookupCustomerLoyalty(phone);
    setSearchResult(res);
    setHasSearched(true);
    if (res.found && res.loyalty) {
      onSelectCustomerPhone(res.loyalty.phone, res.loyalty.name);
      if (res.loyalty.stamps >= 10 || res.loyalty.rewardsAvailable > 0) {
        triggerConfetti();
      }
    }
  };

  const handleResetSearch = () => {
    setHasSearched(false);
    setSearchResult(null);
    setPhoneNumber('');
  };

  const stamps = searchResult?.loyalty?.stamps || 0;
  const rewardsAvailable = searchResult?.loyalty?.rewardsAvailable || 0;
  const remainingStamps = Math.max(0, 10 - stamps);
  const isRewardReady = stamps >= 10 || rewardsAvailable > 0;

  return (
    <div
      id="cek-stamp-modal"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200"
    >
      <div className="bg-white w-full max-w-md rounded-t-[32px] sm:rounded-[32px] max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-bottom-6 duration-300">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-100 flex items-center justify-between bg-gradient-to-r from-emerald-900 to-green-800 text-white shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 text-amber-950 flex items-center justify-center text-xl font-black shadow-md">
              🥗
            </div>
            <div>
              <h2 className="font-black text-lg text-white leading-tight">Cek Stamp MiJUS</h2>
              <p className="text-xs text-emerald-200">
                Loyalty tanpa login, cukup nomor WhatsApp
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer"
            aria-label="Tutup"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
          {/* STEP 1: Phone Search Form (Shown when not searched or when user wants to re-enter) */}
          {!hasSearched && (
            <div className="space-y-4">
              <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-100">
                <p className="text-xs text-zinc-700 leading-relaxed font-medium">
                  Masukkan nomor WhatsApp yang kamu gunakan saat order. Kami akan mengecek jumlah
                  stamp dan voucher reward kamu secara instan!
                </p>
              </div>

              <form onSubmit={handleSearch} className="space-y-3">
                <div>
                  <label className="block text-xs font-black uppercase text-zinc-600 mb-1.5">
                    Nomor WhatsApp
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute left-3.5 top-3.5 text-zinc-400" />
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="08xxxxxxxxxx"
                      className="w-full pl-10 pr-4 py-3 rounded-2xl bg-zinc-50 border border-zinc-200 text-sm font-bold text-zinc-900 focus:outline-hidden focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 transition-all font-mono"
                      autoFocus
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={!phoneNumber.trim()}
                  className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-zinc-200 disabled:text-zinc-400 text-white font-black text-sm rounded-2xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                >
                  <Search className="w-4 h-4" />
                  <span>Lihat Stamp</span>
                </button>
              </form>
            </div>
          )}

          {/* STEP 2: RESULT VIEW */}
          {hasSearched && (
            <div className="space-y-4">
              {searchResult?.found && searchResult.loyalty ? (
                /* ================= RESULT: FOUND ================= */
                <div className="space-y-3.5">
                  {/* Digital Reward Card (MiJUS Go Healthy Branding) */}
                  <div className="bg-gradient-to-br from-emerald-800 via-emerald-700 to-green-800 rounded-3xl p-5 text-white shadow-xl relative overflow-hidden border border-emerald-400/30">
                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none" />
                    <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-amber-400/10 rounded-full blur-xl pointer-events-none" />

                    {/* Card Header: Loyalty MiJUS + Customer Name */}
                    <div className="flex items-start justify-between relative z-10 mb-3">
                      <div>
                        <span className="bg-amber-400 text-amber-950 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full shadow-xs">
                          Loyalty MiJUS
                        </span>
                        <h3 className="text-2xl font-black mt-1 text-white tracking-tight">
                          {searchResult.loyalty.name || 'Pelanggan MiJUS'}
                        </h3>
                        <p className="text-[11px] text-emerald-200 font-mono">
                          {searchResult.loyalty.phone}
                        </p>
                      </div>

                      <div className="text-right bg-emerald-950/50 px-3 py-1.5 rounded-2xl border border-white/10">
                        <div className="text-xl sm:text-2xl font-black text-amber-300">
                          {stamps} / 10 Stamp
                        </div>
                        <div className="text-[9px] font-bold text-emerald-300 uppercase tracking-wider">
                          {stamps >= 10 ? 'Target Lengkap' : `${remainingStamps} Lagi`}
                        </div>
                      </div>
                    </div>

                    {/* Visual Stamp Dots Indicator (● ● ● ● ● ● ○ ○ ○ ○) */}
                    <div className="relative z-10 my-3 p-2.5 rounded-2xl bg-emerald-950/40 border border-white/10 flex items-center justify-between">
                      <span className="text-[11px] font-extrabold text-emerald-200">Indikator:</span>
                      <div className="flex items-center gap-1.5 text-base sm:text-lg">
                        {Array.from({ length: 10 }).map((_, i) => (
                          <span
                            key={i}
                            className={
                              i < stamps
                                ? 'text-amber-400 font-black animate-pulse'
                                : 'text-white/30'
                            }
                          >
                            {i < stamps ? '●' : '○'}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* 10 Stamp Grid Cards */}
                    <div className="grid grid-cols-5 gap-2 relative z-10 my-3">
                      {Array.from({ length: 10 }).map((_, idx) => {
                        const isFilled = idx < stamps;
                        const isTenth = idx === 9;
                        return (
                          <div
                            key={idx}
                            className={`aspect-square rounded-xl flex flex-col items-center justify-center p-1 border transition-all ${
                              isFilled
                                ? 'bg-amber-400 border-amber-300 text-amber-950 shadow-sm font-black'
                                : isTenth
                                ? 'bg-amber-400/20 border-dashed border-amber-300 text-amber-300'
                                : 'bg-white/10 border-white/15 text-white/40'
                            }`}
                          >
                            {isFilled ? (
                              <span className="text-sm">🥗</span>
                            ) : isTenth ? (
                              <Gift className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                            ) : (
                              <Star className="w-3 h-3" />
                            )}
                            <span className="text-[9px] font-black mt-0.5">
                              {isTenth ? 'FREE' : `#${idx + 1}`}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Visual Progress Bar to 10 Stamps */}
                    <div className="relative z-10 pt-1">
                      <div className="flex justify-between items-center text-[10px] font-bold text-emerald-200 mb-1">
                        <span>Progress Menuju Hadiah</span>
                        <span className="text-amber-300 font-black">
                          {Math.round((Math.min(10, stamps) / 10) * 100)}%
                        </span>
                      </div>
                      <div className="w-full h-2.5 bg-emerald-950/60 rounded-full overflow-hidden p-0.5 border border-white/20">
                        <div
                          className="h-full bg-gradient-to-r from-amber-400 to-yellow-300 rounded-full transition-all duration-500 shadow-sm"
                          style={{ width: `${Math.min(100, (stamps / 10) * 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Stamp Message: Under 10 vs 10 Stamp Reward */}
                  {stamps < 10 && (
                    <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-200 flex items-center justify-center text-xl shrink-0">
                        🎁
                      </div>
                      <div>
                        <div className="text-xs font-black text-amber-900">
                          🎁 Tinggal {remainingStamps} stamp lagi untuk mendapatkan Free Salad!
                        </div>
                        <div className="text-[11px] text-amber-800/90 mt-0.5">
                          Setiap transaksi minimal Rp 50.000 otomatis menambah 1 stamp saat pesanan selesai.
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Celebratory Reward Ready Notice (stamps >= 10 or rewardsAvailable > 0) */}
                  {isRewardReady && (
                    <div
                      onClick={triggerConfetti}
                      className="p-4 rounded-2xl bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 text-amber-950 shadow-md border border-amber-200 cursor-pointer space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="bg-emerald-900 text-amber-300 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                          Reward Tersedia
                        </span>
                        <span className="text-[10px] font-bold">Klik untuk Selebrasi 🎉</span>
                      </div>
                      <h4 className="font-black text-base text-amber-950">
                        🎉 Selamat! Kamu mendapatkan Free Salad.
                      </h4>
                      <p className="text-xs font-semibold text-amber-950/90 leading-relaxed">
                        Target 10 stamp telah tercapai! Status reward: <strong>Reward tersedia</strong> ({rewardsAvailable || 1}x Voucher Aktif).
                        Voucher otomatis dapat dipotong langsung pada halaman Checkout.
                      </p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="pt-2 flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onGoToMenu();
                      }}
                      className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all"
                    >
                      <span>Pesan Menu & Kumpulkan Stamp</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={handleResetSearch}
                      className="w-full py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Cek Nomor Lain</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* ================= RESULT: NOT FOUND ================= */
                <div className="py-6 px-4 text-center space-y-4 bg-emerald-50/50 rounded-3xl border border-emerald-100">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-800 mx-auto flex items-center justify-center text-3xl shadow-xs">
                    🌱
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="font-black text-sm text-zinc-900">
                      Nomor ini belum memiliki riwayat loyalty MiJUS.
                    </h3>
                    <p className="text-xs font-bold text-emerald-800">
                      Yuk lakukan order pertama kamu 💚
                    </p>
                    <p className="text-[11px] text-zinc-500 pt-1 max-w-xs mx-auto">
                      Transaksi minimal Rp 50.000 akan otomatis mendapatkan 1 stamp saat pesanan selesai.
                    </p>
                  </div>

                  <div className="pt-3 flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onGoToMenu();
                      }}
                      className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-2xl shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all"
                    >
                      <span>Lihat Menu</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={handleResetSearch}
                      className="w-full py-2.5 text-zinc-500 hover:text-zinc-800 font-bold text-xs flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Coba Nomor Lain</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Quick Rules Info Footer */}
          <div className="p-3 bg-zinc-50 rounded-2xl border border-zinc-100 text-[11px] text-zinc-500 flex items-start gap-2">
            <HelpCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <strong>Aturan Stamp:</strong> 1 transaksi ≥ Rp 50.000 = 1 stamp (diberikan saat pesanan
              berstatus Selesai). Kumpulkan 10 stamp untuk 1 Porsi Free Salad!
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
