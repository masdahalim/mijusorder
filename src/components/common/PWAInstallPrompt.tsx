import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone, Share2, PlusSquare } from 'lucide-react';
import { APP_CONFIG } from '../../config/appConfig';

export const PWAInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already running in standalone mode (installed PWA)
    const isStandalone =
      typeof window !== 'undefined' &&
      (window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true ||
        document.referrer.includes('android-app://'));

    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    // Check dismissal cooldown (dismiss for 24 hours if closed)
    const dismissedAt = localStorage.getItem('mijus_pwa_dismissed_at');
    if (dismissedAt) {
      const hoursSinceDismiss = (Date.now() - parseInt(dismissedAt, 10)) / (1000 * 60 * 60);
      if (hoursSinceDismiss < 24) {
        return;
      }
    }

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isAppleDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isAppleDevice);

    // Listen for Android / Chrome install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Trigger prompt display after a friendly 2.5 second delay
      setTimeout(() => {
        setIsOpen(true);
      }, 2500);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // For iOS or browsers where beforeinstallprompt doesn't fire, show prompt after delay
    const timer = setTimeout(() => {
      if (!isStandalone) {
        setIsOpen(true);
      }
    }, 3500);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      clearTimeout(timer);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
        setIsOpen(false);
      }
      setDeferredPrompt(null);
    } else {
      setShowIOSInstructions((prev) => !prev);
    }
  };

  const handleDismiss = () => {
    setIsOpen(false);
    localStorage.setItem('mijus_pwa_dismissed_at', Date.now().toString());
  };

  if (isInstalled || !isOpen) return null;

  return (
    <div
      id="pwa-install-overlay"
      className="fixed bottom-4 left-4 right-4 max-w-md mx-auto z-50 pointer-events-auto transition-all duration-300 ease-out transform translate-y-0 opacity-100"
    >
      <div className="bg-emerald-950/95 backdrop-blur-md text-white rounded-3xl p-4 sm:p-5 shadow-2xl border border-emerald-500/40 relative overflow-hidden">
        {/* Top decorative gradient bar */}
        <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-amber-400 via-emerald-400 to-teal-300" />

        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white p-1 shrink-0 shadow-lg flex items-center justify-center border border-emerald-200 overflow-hidden">
              <img
                src={APP_CONFIG.appLogo}
                alt="MiJUS Logo"
                className="w-full h-full object-cover rounded-xl"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = '/icon.svg';
                }}
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-black text-sm tracking-tight text-white">
                  Install Aplikasi MiJUS
                </h4>
                <span className="bg-amber-400 text-amber-950 text-[9px] font-black px-1.5 py-0.5 rounded-md uppercase">
                  Cepat & Ringan
                </span>
              </div>
              <p className="text-[11px] text-emerald-200 mt-0.5 leading-snug">
                Pasang di layar HP untuk pesan jus segar lebih cepat & pantau stamp reward!
              </p>
            </div>
          </div>

          <button
            id="btn-close-pwa-prompt"
            onClick={handleDismiss}
            className="w-7 h-7 rounded-full bg-emerald-900/80 hover:bg-emerald-800 text-emerald-300 hover:text-white flex items-center justify-center transition-colors shrink-0"
            aria-label="Tutup"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action Buttons */}
        <div className="mt-3.5 flex items-center gap-2">
          <button
            id="btn-install-pwa"
            onClick={handleInstallClick}
            className="flex-1 py-2.5 px-4 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 active:scale-95 text-amber-950 font-black text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span>Install ke Home Screen</span>
          </button>

          <button
            id="btn-dismiss-pwa"
            onClick={handleDismiss}
            className="py-2.5 px-3 bg-emerald-900/70 hover:bg-emerald-850 text-emerald-200 font-bold text-xs rounded-xl transition-colors"
          >
            Nanti Saja
          </button>
        </div>

        {/* iOS / Browser Instruction Accordion */}
        {showIOSInstructions && (
          <div className="mt-3 pt-3 border-t border-emerald-800/80 text-[11px] text-emerald-100 space-y-2 transition-all duration-200">
            <div className="font-extrabold text-amber-300 flex items-center gap-1.5">
              <Smartphone className="w-3.5 h-3.5" />
              <span>Cara Pasang di {isIOS ? 'iPhone (Safari)' : 'Smartphone'}:</span>
            </div>
            {isIOS ? (
              <ol className="space-y-1.5 list-decimal pl-4 text-emerald-200">
                <li className="flex items-center gap-1.5">
                  <span>1. Ketuk tombol <strong>Share</strong></span>
                  <Share2 className="w-3.5 h-3.5 text-amber-400 shrink-0 inline" />
                  <span>di bar bawah Safari.</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <span>2. Geser & pilih <strong>"Add to Home Screen"</strong></span>
                  <PlusSquare className="w-3.5 h-3.5 text-amber-400 shrink-0 inline" />
                  <span>(Tambah ke Layar Utama).</span>
                </li>
                <li>3. Ketuk <strong>Add</strong> di pojok kanan atas.</li>
              </ol>
            ) : (
              <ul className="space-y-1.5 text-emerald-200 list-disc pl-4">
                <li>Buka menu browser (titik 3 di kanan atas).</li>
                <li>Pilih <strong>"Tambahkan ke Layar Utama"</strong> atau <strong>"Install App"</strong>.</li>
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
