import React, { useState, useEffect } from 'react';
import { CustomerLoyalty } from '../../types';
import { APP_CONFIG } from '../../config/appConfig';
import { formatRupiah } from '../../utils/formatters';
import { lookupCustomerLoyalty } from '../../services/storeService';
import {
  Sparkles,
  Award,
  Gift,
  HelpCircle,
  Phone,
  CheckCircle2,
  Star,
  ChevronRight,
  ArrowRight,
  TrendingUp,
  PartyPopper,
  Search,
  RefreshCw,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface LoyaltyViewProps {
  loyalty: CustomerLoyalty | null;
  customerPhone: string;
  customerName: string;
  onUpdatePhone: (phone: string, name: string) => void;
  onGoToMenu: () => void;
}

export const LoyaltyView: React.FC<LoyaltyViewProps> = ({
  loyalty,
  customerPhone,
  customerName,
  onUpdatePhone,
  onGoToMenu,
}) => {
  const [phoneNumberInput, setPhoneNumberInput] = useState(customerPhone || '');
  const [activeLookupPhone, setActiveLookupPhone] = useState(customerPhone || '');
  const [lookupResult, setLookupResult] = useState<{
    found: boolean;
    loyalty: CustomerLoyalty | null;
  } | null>(null);

  // Sync with prop
  useEffect(() => {
    if (customerPhone) {
      setPhoneNumberInput(customerPhone);
      setActiveLookupPhone(customerPhone);
      const res = lookupCustomerLoyalty(customerPhone);
      setLookupResult(res);
    }
  }, [customerPhone, loyalty]);

  const activeLoyalty = lookupResult?.loyalty || loyalty;
  const stamps = activeLoyalty?.stamps || 0;
  const rewardsAvailable = activeLoyalty?.rewardsAvailable || 0;
  const rewardsUsed = activeLoyalty?.rewardsUsed || 0;
  const totalOrders = activeLoyalty?.totalOrders || 0;
  const totalSpent = activeLoyalty?.totalSpent || 0;
  const currentName = activeLoyalty?.name || customerName || 'Pelanggan MiJUS';

  const remainingStamps = Math.max(0, 10 - stamps);
  const isRewardReached = stamps >= 10 || rewardsAvailable > 0;

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 120,
        spread: 90,
        origin: { y: 0.55 },
        colors: ['#10b981', '#f59e0b', '#34d399', '#fbbf24', '#047857'],
      });
    } catch {
      // safe fallback
    }
  };

  useEffect(() => {
    if (isRewardReached) {
      triggerConfetti();
    }
  }, [stamps, rewardsAvailable, isRewardReached]);

  const handleSearchPhone = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = phoneNumberInput.trim().replace(/[^0-9]/g, '');
    if (!clean) return;

    setActiveLookupPhone(clean);
    const res = lookupCustomerLoyalty(clean);
    setLookupResult(res);

    if (res.found && res.loyalty) {
      onUpdatePhone(res.loyalty.phone, res.loyalty.name);
      if (res.loyalty.stamps >= 10 || res.loyalty.rewardsAvailable > 0) {
        triggerConfetti();
      }
    }
  };

  const handleQuickLookup = (phone: string) => {
    setPhoneNumberInput(phone);
    setActiveLookupPhone(phone);
    const res = lookupCustomerLoyalty(phone);
    setLookupResult(res);
    if (res.found && res.loyalty) {
      onUpdatePhone(res.loyalty.phone, res.loyalty.name);
      if (res.loyalty.stamps >= 10 || res.loyalty.rewardsAvailable > 0) {
        triggerConfetti();
      }
    }
  };

  const isFound = lookupResult ? lookupResult.found : !!activeLoyalty;

  return (
    <div className="min-h-[85vh] pb-24 text-zinc-800">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-green-800 text-white p-5 sticky top-0 z-30 shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 text-amber-950 flex items-center justify-center text-xl shadow-md font-black">
              🥗
            </div>
            <div>
              <h1 className="font-black text-xl leading-tight">Loyalty MiJUS</h1>
              <p className="text-xs text-emerald-200">Cek stamp cukup dengan nomor WhatsApp</p>
            </div>
          </div>
        </div>

        {/* Search / Lookup Box */}
        <form onSubmit={handleSearchPhone} className="mt-3.5 flex gap-2">
          <div className="relative flex-1">
            <Phone className="w-4 h-4 absolute left-3 top-3 text-emerald-300" />
            <input
              type="tel"
              value={phoneNumberInput}
              onChange={(e) => setPhoneNumberInput(e.target.value)}
              placeholder="08xxxxxxxxxx"
              className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-emerald-950/60 border border-emerald-400/30 text-white text-xs placeholder:text-emerald-300/60 focus:outline-hidden focus:ring-2 focus:ring-amber-400 font-mono"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-amber-950 font-black text-xs rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer transition-all active:scale-95 shrink-0"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Lihat Stamp</span>
          </button>
        </form>
      </div>

      <div className="p-4 max-w-md mx-auto space-y-4">
        {isFound && activeLoyalty ? (
          /* ================= FOUND LOYALTY CARD ================= */
          <div className="space-y-4">
            {/* 10 Stamp Card Container */}
            <div className="bg-gradient-to-br from-emerald-800 via-emerald-700 to-green-800 rounded-3xl p-5 text-white shadow-xl relative overflow-hidden border border-emerald-400/30">
              <div className="absolute -top-10 -right-10 w-36 h-36 bg-white/10 rounded-full blur-xl pointer-events-none" />
              <div className="absolute -bottom-10 -left-10 w-36 h-36 bg-amber-400/10 rounded-full blur-xl pointer-events-none" />

              {/* Stamp Header & Progress Badge */}
              <div className="flex items-start justify-between relative z-10 mb-3">
                <div>
                  <span className="bg-amber-400 text-amber-950 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full shadow-xs">
                    Loyalty MiJUS
                  </span>
                  <h2 className="text-2xl font-black mt-1 text-white tracking-tight">
                    {currentName}
                  </h2>
                  <p className="text-[11px] text-emerald-200 font-mono">
                    {activeLoyalty.phone}
                  </p>
                </div>

                <div className="text-right bg-emerald-950/50 px-3.5 py-2 rounded-2xl border border-white/10 shrink-0">
                  <div className="text-xl sm:text-2xl font-black text-amber-300 drop-shadow-sm">
                    {stamps} / 10 Stamp
                  </div>
                  <div className="text-[9px] font-bold text-emerald-300 uppercase tracking-wider">
                    {stamps >= 10 ? 'Target Lengkap' : `${remainingStamps} Lagi`}
                  </div>
                </div>
              </div>

              {/* Visual Stamp Indicator (● ● ● ● ● ● ○ ○ ○ ○) */}
              <div className="relative z-10 my-3 p-3 rounded-2xl bg-emerald-950/40 border border-white/10 flex items-center justify-between">
                <span className="text-[11px] font-extrabold text-emerald-200">Indikator:</span>
                <div className="flex items-center gap-1.5 text-lg">
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

              {/* 10 Stamp Grid */}
              <div className="grid grid-cols-5 gap-2.5 relative z-10 my-3.5">
                {Array.from({ length: 10 }).map((_, index) => {
                  const isFilled = index < stamps;
                  const isTenth = index === 9;
                  const isNextTarget = index === stamps;

                  return (
                    <div
                      key={index}
                      className={`aspect-square rounded-2xl flex flex-col items-center justify-center p-1.5 transition-all duration-300 border relative ${
                        isFilled
                          ? 'bg-amber-400 border-amber-300 text-amber-950 shadow-md scale-105 ring-2 ring-amber-300/50'
                          : isTenth
                          ? 'bg-amber-500/20 border-dashed border-amber-300 text-amber-300 animate-pulse ring-1 ring-amber-400/40'
                          : isNextTarget
                          ? 'bg-white/20 border-white/40 text-white ring-2 ring-white/30 scale-100'
                          : 'bg-white/10 border-white/15 text-white/40'
                      }`}
                    >
                      {isFilled ? (
                        <span className="text-lg animate-in zoom-in-50">🥗</span>
                      ) : isTenth ? (
                        <Gift className="w-5 h-5 animate-pulse text-amber-300" />
                      ) : isNextTarget ? (
                        <Star className="w-4 h-4 text-amber-300 fill-amber-300/40" />
                      ) : (
                        <Star className="w-4 h-4" />
                      )}
                      <span className="text-[9px] font-black mt-0.5">
                        {isTenth ? 'FREE' : `#${index + 1}`}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Progress Bar */}
              <div className="relative z-10 pt-1">
                <div className="flex justify-between items-center text-[11px] font-extrabold mb-1">
                  <span className="text-emerald-200">Progress: {stamps} / 10 Stamp</span>
                  <span className="text-amber-300 font-black">
                    {Math.round((Math.min(10, stamps) / 10) * 100)}%
                  </span>
                </div>
                <div className="w-full h-3 bg-emerald-950/60 rounded-full overflow-hidden p-0.5 border border-white/20">
                  <div
                    className="h-full bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-200 rounded-full transition-all duration-500 shadow-sm"
                    style={{ width: `${Math.min(100, (stamps / 10) * 100)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* If stamps < 10: "Tinggal X stamp lagi untuk mendapatkan Free Salad!" */}
            {stamps < 10 && (
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-200 flex items-center justify-center text-xl shrink-0">
                  🎁
                </div>
                <div>
                  <div className="text-xs font-black text-amber-900">
                    🎁 Tinggal {remainingStamps} stamp lagi untuk mendapatkan Free Salad!
                  </div>
                  <p className="text-[11px] text-amber-800 mt-0.5 font-medium">
                    1 transaksi minimal Rp 50.000 = 1 stamp setelah pesanan selesai.
                  </p>
                </div>
              </div>
            )}

            {/* Celebratory Notification when 10 Stamps reached or Rewards Available */}
            {isRewardReached && (
              <div
                onClick={triggerConfetti}
                className="bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 rounded-3xl p-5 text-amber-950 shadow-xl border-2 border-amber-200 cursor-pointer relative overflow-hidden animate-in zoom-in-95 duration-300"
              >
                <div className="absolute top-0 right-0 translate-x-3 -translate-y-3 w-24 h-24 bg-white/25 rounded-full blur-md" />
                <div className="flex items-start gap-3.5 relative z-10">
                  <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-2xl shadow-md shrink-0 animate-bounce">
                    🎉
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="bg-emerald-900 text-amber-300 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                        Reward Tersedia
                      </span>
                      <span className="text-[10px] font-bold text-amber-950/80">
                        Klik untuk Selebrasi 🎊
                      </span>
                    </div>
                    <h3 className="font-black text-base sm:text-lg text-amber-950 mt-1">
                      🎉 Selamat! Kamu mendapatkan Free Salad.
                    </h3>
                    <p className="text-xs font-semibold text-amber-950/90 mt-0.5 leading-relaxed">
                      Target 10 stamp telah tercapai! Kamu berhak mendapatkan <strong>1 Porsi Salad Segar Spesial MiJUS Gratis</strong>.
                      {rewardsAvailable > 0 ? ` (${rewardsAvailable}x Voucher Aktif Tersedia)` : ''} Voucher otomatis dapat dipotong langsung pada halaman Checkout.
                    </p>

                    <div className="mt-3 flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onGoToMenu();
                        }}
                        className="px-4 py-2 bg-emerald-900 hover:bg-emerald-950 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center gap-1.5 transition-all"
                      >
                        <span>Gunakan di Menu Sekarang</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* ================= NOT FOUND VIEW ================= */
          <div className="py-8 px-4 text-center space-y-4 bg-emerald-50/60 rounded-3xl border border-emerald-100">
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
                Nomor WhatsApp kamu otomatis menjadi identitas loyalty saat checkout tanpa perlu membuat akun.
              </p>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={onGoToMenu}
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-2xl shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <span>Lihat Menu</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* How It Works Card */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-emerald-100 shadow-md space-y-3">
          <h3 className="font-extrabold text-sm text-zinc-900 flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-emerald-600" />
            <span>Cara Mendapatkan Stamp MiJUS (Tanpa Login)</span>
          </h3>

          <div className="space-y-2.5 text-xs text-zinc-600">
            <div className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-black flex items-center justify-center shrink-0 text-[11px]">
                1
              </span>
              <div>
                <strong className="text-zinc-800">Pilih Menu & Checkout:</strong> Masukkan nomor
                WhatsApp kamu saat memesan. Tidak perlu registrasi akun atau password.
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-black flex items-center justify-center shrink-0 text-[11px]">
                2
              </span>
              <div>
                <strong className="text-zinc-800">Belanja ≥ Rp 50.000:</strong> Setiap total
                belanja minimal Rp 50.000 otomatis mendapatkan 1 stamp saat status pesanan <strong>Selesai</strong>.
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-black flex items-center justify-center shrink-0 text-[11px]">
                3
              </span>
              <div>
                <strong className="text-zinc-800">10 Stamp = 1 Free Salad:</strong> Setelah terkumpul
                10 stamp, kamu berhak mendapatkan voucher 1 Porsi Free Salad Buah / Sayur Fresh!
              </div>
            </div>
          </div>

          <button
            onClick={onGoToMenu}
            className="w-full mt-2 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-2xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>Pesan Sekarang & Kumpulkan Stamp</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Customer Stats Summary (if found) */}
        {isFound && activeLoyalty && (
          <div className="grid grid-cols-3 gap-2.5 text-center">
            <div className="bg-white p-3 rounded-2xl border border-emerald-100 shadow-xs">
              <div className="text-[10px] text-zinc-500 font-bold uppercase">Total Order</div>
              <div className="text-lg font-black text-emerald-900 mt-0.5">{totalOrders}x</div>
            </div>
            <div className="bg-white p-3 rounded-2xl border border-emerald-100 shadow-xs">
              <div className="text-[10px] text-zinc-500 font-bold uppercase">Total Belanja</div>
              <div className="text-xs font-black text-emerald-900 mt-1">
                {formatRupiah(totalSpent)}
              </div>
            </div>
            <div className="bg-white p-3 rounded-2xl border border-emerald-100 shadow-xs">
              <div className="text-[10px] text-zinc-500 font-bold uppercase">Reward Diklaim</div>
              <div className="text-lg font-black text-amber-600 mt-0.5">{rewardsUsed}x</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
