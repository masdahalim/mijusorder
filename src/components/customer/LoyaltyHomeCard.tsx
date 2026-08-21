import React from 'react';
import { CustomerLoyalty } from '../../types';
import { Sparkles, ChevronRight, Gift, Star, Phone } from 'lucide-react';

interface LoyaltyHomeCardProps {
  loyalty: CustomerLoyalty | null;
  onOpenCekStamp: () => void;
}

export const LoyaltyHomeCard: React.FC<LoyaltyHomeCardProps> = ({
  loyalty,
  onOpenCekStamp,
}) => {
  const stamps = loyalty?.stamps || 0;
  const rewardsAvailable = loyalty?.rewardsAvailable || 0;
  const hasHistory = loyalty && (loyalty.totalOrders > 0 || stamps > 0 || rewardsAvailable > 0);

  return (
    <div className="px-4 py-2">
      <div
        id="loyalty-home-card"
        onClick={onOpenCekStamp}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-900 via-emerald-800 to-green-800 p-4 text-white shadow-lg border border-emerald-400/30 cursor-pointer group active:scale-98 transition-all duration-300"
      >
        {/* Background decorative glows */}
        <div className="absolute -right-8 -bottom-8 w-28 h-28 bg-white/10 rounded-full blur-xl pointer-events-none" />
        <div className="absolute top-0 right-16 w-16 h-16 bg-amber-400/10 rounded-full blur-md pointer-events-none" />

        <div className="relative z-10 flex items-center justify-between gap-3">
          <div className="space-y-1 max-w-[70%]">
            <div className="flex items-center gap-1.5">
              <span className="text-base">💚</span>
              <h3 className="font-black text-base tracking-tight text-white flex items-center gap-1">
                Loyalty MiJUS
              </h3>
            </div>
            
            <p className="text-xs text-emerald-100 font-medium">
              Sudah berapa stamp kamu?
            </p>

            {hasHistory ? (
              <div className="pt-1 flex items-center gap-2">
                <span className="text-[11px] font-black text-amber-300 bg-emerald-950/60 px-2 py-0.5 rounded-lg border border-white/10">
                  {stamps} / 10 Stamp
                </span>
                <span className="text-[10px] text-emerald-200">
                  {loyalty.name || 'Member'}
                </span>
              </div>
            ) : (
              <div className="text-[11px] text-emerald-200/90 pt-0.5">
                Cek stamp dengan nomor WhatsApp
              </div>
            )}
          </div>

          <div className="flex flex-col items-end gap-2 shrink-0">
            <div className="w-11 h-11 rounded-2xl bg-amber-400 text-amber-950 flex items-center justify-center text-xl shadow-md font-black">
              🥗
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpenCekStamp();
              }}
              className="px-3.5 py-1.5 bg-amber-400 group-hover:bg-amber-300 text-amber-950 font-black text-xs rounded-xl shadow-md flex items-center gap-1 transition-all cursor-pointer"
            >
              <span>Cek Stamp</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
