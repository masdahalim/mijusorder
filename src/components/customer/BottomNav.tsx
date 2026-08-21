import React from 'react';
import { Home, Receipt, Award, User, ShoppingBag } from 'lucide-react';

export type CustomerTab = 'HOME' | 'PESANAN' | 'LOYALTY' | 'PROFIL';

interface BottomNavProps {
  activeTab: CustomerTab;
  onChangeTab: (tab: CustomerTab) => void;
  activeOrderCount?: number;
  hasReward?: boolean;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onChangeTab,
  activeOrderCount = 0,
  hasReward = false,
}) => {
  const tabs = [
    {
      id: 'HOME' as CustomerTab,
      label: 'Home',
      icon: Home,
    },
    {
      id: 'PESANAN' as CustomerTab,
      label: 'Pesanan',
      icon: Receipt,
      badge: activeOrderCount > 0 ? activeOrderCount : undefined,
    },
    {
      id: 'LOYALTY' as CustomerTab,
      label: 'Loyalty',
      icon: Award,
      dot: hasReward,
    },
    {
      id: 'PROFIL' as CustomerTab,
      label: 'Profil',
      icon: User,
    },
  ];

  return (
    <nav
      aria-label="Navigasi Utama"
      className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-emerald-100 shadow-2xl py-2 px-3 flex justify-center"
    >
      <div className="w-full max-w-md flex items-center justify-around">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              onClick={() => onChangeTab(tab.id)}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all duration-200 relative ${
                isActive
                  ? 'text-emerald-700 font-black scale-105'
                  : 'text-zinc-400 hover:text-zinc-600 font-semibold'
              }`}
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform ${
                    isActive ? 'stroke-[2.5] scale-110 text-emerald-700' : 'stroke-[2]'
                  }`}
                />

                {/* Badge count for active orders */}
                {tab.badge !== undefined && (
                  <span className="absolute -top-1.5 -right-2 bg-rose-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                    {tab.badge}
                  </span>
                )}

                {/* Reward dot for loyalty */}
                {tab.dot && (
                  <span className="absolute -top-1 -right-1 bg-amber-400 w-2.5 h-2.5 rounded-full ring-2 ring-white animate-ping" />
                )}
              </div>

              <span className={`text-[11px] mt-1 tracking-tight ${isActive ? 'font-black text-emerald-950' : 'font-bold'}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
