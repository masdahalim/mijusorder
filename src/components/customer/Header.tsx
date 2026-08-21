import React, { useState } from 'react';
import { Store, Clock, MapPin, Sparkles, ChevronRight, Phone, Info } from 'lucide-react';
import { APP_CONFIG } from '../../config/appConfig';

interface HeaderProps {
  onOpenInfo?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenInfo }) => {
  const [showInfoModal, setShowInfoModal] = useState(false);

  return (
    <>
      <header className="bg-gradient-to-r from-emerald-700 via-green-600 to-emerald-600 text-white pt-4 pb-5 px-4 shadow-md sticky top-0 z-30">
        <div className="flex items-center justify-between gap-3">
          {/* Brand & Logo */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white p-1 shadow-md flex items-center justify-center border-2 border-emerald-300 transform -rotate-2 hover:rotate-0 transition-transform overflow-hidden shrink-0">
              <img
                src={APP_CONFIG.appLogo}
                alt={APP_CONFIG.brandName}
                className="w-full h-full object-cover rounded-xl"
                onError={(e) => {
                  (e.currentTarget as HTMLElement).style.display = 'none';
                  if (e.currentTarget.parentElement) {
                    e.currentTarget.parentElement.innerText = '🥤';
                  }
                }}
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-xl tracking-tight leading-none text-white drop-shadow-sm">
                  {APP_CONFIG.brandName}
                </h1>
                <span className="bg-amber-400 text-amber-950 text-[10px] font-black uppercase px-2 py-0.5 rounded-full shadow-sm">
                  Fresh
                </span>
              </div>
              <p className="text-xs text-emerald-100 font-medium flex items-center gap-1 mt-0.5">
                <span>{APP_CONFIG.tagline}</span>
              </p>
            </div>
          </div>

          {/* Info Button */}
          <button
            onClick={() => (onOpenInfo ? onOpenInfo() : setShowInfoModal(true))}
            className="w-9 h-9 rounded-full bg-white/15 hover:bg-white/25 active:scale-95 transition-all flex items-center justify-center text-white backdrop-blur-xs border border-white/20"
            title="Info Outlet"
            aria-label="Info Outlet"
          >
            <Info className="w-5 h-5" />
          </button>
        </div>

        {/* Outlet Bar / Hours Pill */}
        <div className="mt-3.5 bg-emerald-800/60 backdrop-blur-md rounded-2xl p-2.5 flex items-center justify-between border border-emerald-400/20 text-xs shadow-inner">
          <div className="flex items-center gap-2 overflow-hidden">
            <span className="flex h-2.5 w-2.5 relative flex-shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-300"></span>
            </span>
            <span className="font-bold text-white truncate">{APP_CONFIG.outletName}</span>
            <span className="text-emerald-300 text-[11px] font-medium hidden sm:inline">• Buka {APP_CONFIG.operatingHours}</span>
          </div>

          <div className="flex items-center gap-1.5 flex-shrink-0">
            <span className="bg-emerald-500/80 text-white font-bold text-[10px] px-2 py-0.5 rounded-full border border-emerald-300/40">
              Buka
            </span>
            <button
              onClick={() => setShowInfoModal(true)}
              className="text-emerald-200 hover:text-white text-[11px] font-semibold flex items-center hover:underline pl-1"
            >
              Detail <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Outlet Details Info Modal */}
      {showInfoModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-emerald-100 text-zinc-800 relative">
            <div className="text-center mb-4">
              <div className="w-16 h-16 bg-white rounded-3xl mx-auto flex items-center justify-center p-1.5 mb-3 shadow-md border-2 border-emerald-200 overflow-hidden">
                <img
                  src={APP_CONFIG.appLogo}
                  alt={APP_CONFIG.brandName}
                  className="w-full h-full object-cover rounded-2xl"
                  onError={(e) => {
                    (e.currentTarget as HTMLElement).style.display = 'none';
                    if (e.currentTarget.parentElement) {
                      e.currentTarget.parentElement.innerText = '🥤';
                    }
                  }}
                />
              </div>
              <h3 className="font-extrabold text-xl text-emerald-950">{APP_CONFIG.brandName}</h3>
              <p className="text-xs text-emerald-700 font-semibold mt-0.5">{APP_CONFIG.outletName}</p>
            </div>

            <div className="space-y-3 text-xs bg-emerald-50/60 p-3.5 rounded-2xl border border-emerald-100 mb-5">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-emerald-700 mt-0.5 shrink-0" />
                <div>
                  <div className="font-bold text-emerald-950">Lokasi Outlet</div>
                  <div className="text-zinc-600 leading-relaxed">{APP_CONFIG.outletAddress}</div>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-emerald-700 mt-0.5 shrink-0" />
                <div>
                  <div className="font-bold text-emerald-950">Jam Operasional</div>
                  <div className="text-zinc-600">Setiap Hari: {APP_CONFIG.operatingHours}</div>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Phone className="w-4 h-4 text-emerald-700 mt-0.5 shrink-0" />
                <div>
                  <div className="font-bold text-emerald-950">WhatsApp CS / Admin</div>
                  <div className="text-zinc-600">{APP_CONFIG.adminWhatsAppDisplay}</div>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowInfoModal(false)}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-bold rounded-2xl shadow-lg shadow-emerald-600/30 transition-all text-sm"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </>
  );
};
