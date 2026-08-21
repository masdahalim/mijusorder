import React, { useState, useEffect } from 'react';
import { CustomerLoyalty } from '../../types';
import { APP_CONFIG } from '../../config/appConfig';
import { formatRupiah } from '../../utils/formatters';
import {
  User,
  Phone,
  MapPin,
  Clock,
  MessageCircle,
  Instagram,
  Star,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Info,
  Download,
  Smartphone,
  CheckCircle2,
} from 'lucide-react';

interface ProfileViewProps {
  customerName: string;
  customerPhone: string;
  loyalty: CustomerLoyalty | null;
  onUpdatePhone: (phone: string, name: string) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  customerName,
  customerPhone,
  loyalty,
  onUpdatePhone,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(customerName);
  const [phone, setPhone] = useState(customerPhone);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showInstallGuide, setShowInstallGuide] = useState(false);

  useEffect(() => {
    // Check if already in standalone mode
    if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone) {
      setIsInstalled(true);
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    } else {
      setShowInstallGuide(!showInstallGuide);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.trim()) {
      onUpdatePhone(phone.trim(), name.trim() || 'Pelanggan MiJUS');
      setIsEditing(false);
    }
  };

  return (
    <div className="min-h-[85vh] pb-24 text-zinc-800">
      {/* Header Profile */}
      <div className="bg-gradient-to-r from-emerald-800 via-green-700 to-emerald-600 text-white p-6 sticky top-0 z-30 shadow-md">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-3xl bg-white/20 backdrop-blur-md p-1 border-2 border-white/40 flex items-center justify-center text-3xl shadow-lg">
            👤
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-black text-xl text-white tracking-tight">
                {customerName || 'Pelanggan MiJUS'}
              </h1>
              <span className="bg-amber-400 text-amber-950 text-[10px] font-black px-2 py-0.5 rounded-full">
                Member
              </span>
            </div>
            <p className="text-xs text-emerald-200 font-mono mt-0.5">{customerPhone}</p>
          </div>
        </div>
      </div>

      <div className="p-4 max-w-md mx-auto space-y-4">
        {/* PWA Install Card */}
        <div className="bg-gradient-to-br from-emerald-600 via-emerald-700 to-emerald-900 text-white rounded-3xl p-4 sm:p-5 shadow-lg border border-emerald-500/30 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white p-1 shrink-0 shadow-md flex items-center justify-center overflow-hidden border border-emerald-300">
              <img
                src={APP_CONFIG.appLogo}
                alt="MiJUS Logo"
                className="w-full h-full object-cover rounded-xl"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = '/icon.svg';
                }}
              />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-black text-sm tracking-tight">Install Aplikasi MiJUS</span>
                <span className="bg-emerald-400 text-emerald-950 text-[9px] font-black px-1.5 py-0.5 rounded-md uppercase">
                  PWA
                </span>
              </div>
              <p className="text-[11px] text-emerald-100 mt-0.5">
                {isInstalled
                  ? 'Aplikasi telah terpasang di Homescreen smartphone Anda.'
                  : 'Pasang shortcut cepat di layar utama HP tanpa perlu unduh di App Store.'}
              </p>
            </div>
          </div>

          {!isInstalled ? (
            <div>
              <button
                onClick={handleInstallClick}
                className="w-full py-2.5 px-4 bg-amber-400 hover:bg-amber-300 active:scale-95 text-amber-950 font-black text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>Tambahkan ke Layar Utama (Home Screen)</span>
              </button>

              {showInstallGuide && (
                <div className="mt-3 p-3 bg-emerald-950/80 rounded-2xl border border-emerald-800 text-[11px] text-emerald-200 space-y-2">
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Petunjuk Pemasangan Manual:</span>
                  </div>
                  <ul className="space-y-1.5 pl-1 list-none">
                    <li className="flex items-start gap-1.5">
                      <span className="font-bold text-amber-400">Android:</span>
                      <span>Ketuk menu titik tiga (⋮) di browser Chrome $\rightarrow$ pilih <strong>"Tambahkan ke Layar Utama" / "Install Aplikasi"</strong>.</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="font-bold text-amber-400">iOS (iPhone):</span>
                      <span>Ketuk tombol Share (ikon kotak panah ke atas) di Safari $\rightarrow$ geser ke bawah $\rightarrow$ pilih <strong>"Add to Home Screen" (Tambah ke Layar Utama)</strong>.</span>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-200 bg-emerald-950/50 p-2.5 rounded-xl">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Aplikasi siap diakses offline & instan dari icon HP!</span>
            </div>
          )}
        </div>

        {/* Customer Info Card & Edit */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-emerald-100 shadow-md">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-extrabold text-sm text-zinc-900 flex items-center gap-2">
              <User className="w-4 h-4 text-emerald-700" />
              <span>Identitas Pelanggan (Tanpa Login)</span>
            </h2>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800"
            >
              {isEditing ? 'Batal' : 'Ubah Data'}
            </button>
          </div>

          {isEditing ? (
            <form onSubmit={handleSave} className="space-y-3 pt-1">
              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-zinc-200"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">
                  Nomor WhatsApp
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-zinc-200 font-mono"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-md"
              >
                Simpan Perubahan
              </button>
            </form>
          ) : (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-emerald-50/80 rounded-2xl border border-emerald-200">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-zinc-500 font-bold uppercase">Stamp Aktif</span>
                    {(loyalty?.stamps || 0) === 9 && (
                      <span className="bg-rose-500 text-white text-[9px] font-black px-1.5 py-0.2 rounded-md">
                        🔥 9/10
                      </span>
                    )}
                  </div>
                  <div className="text-base font-black text-emerald-950 mt-1">
                    {loyalty?.stamps || 0} / 10 Stamp
                  </div>
                  <div className="w-full bg-emerald-200/60 rounded-full h-1.5 mt-2 overflow-hidden">
                    <div
                      className="bg-emerald-600 h-full rounded-full transition-all duration-300"
                      style={{ width: `${((loyalty?.stamps || 0) / 10) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="p-3 bg-amber-50/80 rounded-2xl border border-amber-200">
                  <div className="text-[10px] text-amber-900 font-bold uppercase">
                    Reward Free Salad
                  </div>
                  <div className="text-base font-black text-amber-950 mt-1">
                    {loyalty?.rewardsAvailable || 0} Voucher
                  </div>
                  <div className="text-[10px] text-amber-800 font-semibold mt-1.5 flex items-center gap-1">
                    <span>🥗</span>
                    <span>10 Stamp = 1 Porsi</span>
                  </div>
                </div>
              </div>

              {(loyalty?.rewardsAvailable || 0) > 0 && (
                <div className="p-3 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 text-amber-950 flex items-center justify-between shadow-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🎁</span>
                    <div>
                      <div className="font-black text-xs">Voucher FREE SALAD Aktif!</div>
                      <div className="text-[10px] font-semibold text-amber-900">
                        Otomatis dapat digunakan saat checkout
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="text-[11px] text-zinc-500 bg-zinc-50 p-2.5 rounded-xl border border-zinc-100 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                <span>
                  1 Stamp per transaksi ≥ Rp 50.000 (Diberikan saat status pesanan <strong>SELESAI</strong>).
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Customer Support & Contact CS WhatsApp */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-emerald-100 shadow-md space-y-3 text-xs">
          <div className="flex items-center justify-between">
            <h2 className="font-extrabold text-sm text-zinc-900 flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-emerald-700" />
              <span>Bantuan & Layanan Pelanggan</span>
            </h2>
            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
              Online
            </span>
          </div>

          <p className="text-zinc-600 text-xs">
            Butuh bantuan terkait menu, konfirmasi pesanan, katering, atau pertanyaan lainnya? Tim Customer Service MiJUS siap melayani Anda.
          </p>

          <a
            id="btn-contact-cs-whatsapp"
            href={`https://api.whatsapp.com/send?phone=6282260947865&text=${encodeURIComponent(
              `Halo CS MiJUS Go Healthy, saya ${customerName ? customerName : 'Pelanggan'} ingin bertanya mengenai pesanan / menu MiJUS.`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-extrabold rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 text-xs"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Hubungi CS WhatsApp (0822-6094-7865)</span>
            <ExternalLink className="w-3.5 h-3.5 ml-0.5 opacity-80" />
          </a>
        </div>

        {/* Outlet Information */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-emerald-100 shadow-md space-y-3.5 text-xs">
          <h2 className="font-extrabold text-sm text-zinc-900 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-emerald-700" />
            <span>Informasi Outlet MiJUS</span>
          </h2>

          <div className="space-y-3 text-zinc-600">
            <div>
              <div className="font-bold text-zinc-900">{APP_CONFIG.outletName}</div>
              <div className="mt-0.5">{APP_CONFIG.outletAddress}</div>
            </div>

            <div className="flex items-center gap-2 text-emerald-800 font-semibold">
              <Clock className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Buka Setiap Hari: {APP_CONFIG.operatingHours}</span>
            </div>

            <div className="pt-2 border-t border-zinc-100 flex flex-col gap-2">
              <a
                href={`https://api.whatsapp.com/send?phone=6282260947865&text=${encodeURIComponent(
                  'Halo Admin MiJUS, saya ingin bertanya tentang menu/outlet.'
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 bg-emerald-50 hover:bg-emerald-100 rounded-2xl flex items-center justify-between text-emerald-900 font-bold transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <MessageCircle className="w-4 h-4 text-emerald-600" />
                  <span>WhatsApp CS: 0822-6094-7865</span>
                </div>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <a
                href={APP_CONFIG.googleReviewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 bg-amber-50 hover:bg-amber-100 rounded-2xl flex items-center justify-between text-amber-950 font-bold transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <Star className="w-4 h-4 text-amber-600 fill-amber-500" />
                  <span>Beri Rating & Review Google ⭐⭐⭐⭐⭐</span>
                </div>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-6 pb-2 text-center text-zinc-400 text-[11px]">
          <p className="font-medium text-zinc-500">
            © {new Date().getFullYear()} {APP_CONFIG.brandName} • All Rights Reserved
          </p>
        </div>
      </div>
    </div>
  );
};

