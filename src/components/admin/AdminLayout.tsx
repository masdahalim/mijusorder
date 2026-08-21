import React, { useState } from 'react';
import {
  Order,
  Reservation,
  CustomerLoyalty,
  Product,
  PromoBanner,
  AddOnOption,
} from '../../types';
import { APP_CONFIG } from '../../config/appConfig';
import {
  LayoutDashboard,
  ShoppingBag,
  Calendar,
  UtensilsCrossed,
  Users,
  Tag,
  LogOut,
  ArrowLeft,
  BarChart3,
  Settings,
  Menu,
  X,
  Sparkles,
  ChevronRight,
  MessageCircle,
} from 'lucide-react';
import { AdminDashboard } from './AdminDashboard';
import { AdminOrderManagement } from './AdminOrderManagement';
import { AdminReservationManagement } from './AdminReservationManagement';
import { AdminMenuManagement } from './AdminMenuManagement';
import { AdminCustomerManagement } from './AdminCustomerManagement';
import { AdminPromoManagement } from './AdminPromoManagement';
import { AdminReports } from './AdminReports';
import { AdminSettings } from './AdminSettings';
import { AdminCrewManagement } from './AdminCrewManagement';

export type AdminTab =
  | 'DASHBOARD'
  | 'ORDERS'
  | 'RESERVATIONS'
  | 'MENU'
  | 'CUSTOMERS'
  | 'PROMOS'
  | 'REPORTS'
  | 'CREW'
  | 'SETTINGS';

interface AdminLayoutProps {
  orders: Order[];
  reservations: Reservation[];
  loyalties: Record<string, CustomerLoyalty>;
  products: Product[];
  promos: PromoBanner[];
  addOns: AddOnOption[];
  onLogout: () => void;
  onBackToCustomer: () => void;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  orders,
  reservations,
  loyalties,
  products,
  promos,
  addOns,
  onLogout,
  onBackToCustomer,
}) => {
  const [currentTab, setCurrentTab] = useState<AdminTab>('DASHBOARD');
  const [initialOrderFilter, setInitialOrderFilter] = useState<string>('Semua');
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  const pendingOrdersCount = orders.filter(
    (o) => o.orderStatus === 'PESANAN_DIBUAT' || o.orderStatus === 'MENUNGGU_VERIFIKASI'
  ).length;

  const pendingResCount = reservations.filter((r) => r.status === 'MENUNGGU').length;

  const navItems = [
    {
      id: 'DASHBOARD' as AdminTab,
      label: 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      id: 'ORDERS' as AdminTab,
      label: 'Kelola Order',
      icon: ShoppingBag,
      badge: pendingOrdersCount > 0 ? pendingOrdersCount : undefined,
    },
    {
      id: 'RESERVATIONS' as AdminTab,
      label: 'Reservasi',
      icon: Calendar,
      badge: pendingResCount > 0 ? pendingResCount : undefined,
    },
    {
      id: 'MENU' as AdminTab,
      label: 'Menu & Stok',
      icon: UtensilsCrossed,
    },
    {
      id: 'CUSTOMERS' as AdminTab,
      label: 'Loyalty & User',
      icon: Users,
    },
    {
      id: 'PROMOS' as AdminTab,
      label: 'Promo & Add-on',
      icon: Tag,
    },
    {
      id: 'REPORTS' as AdminTab,
      label: 'Laporan',
      icon: BarChart3,
    },
    {
      id: 'CREW' as AdminTab,
      label: 'WhatsApp Crew & Grup',
      icon: MessageCircle,
    },
    {
      id: 'SETTINGS' as AdminTab,
      label: 'Settings',
      icon: Settings,
    },
  ];

  const handleSelectTab = (tab: AdminTab, orderFilter?: string) => {
    setCurrentTab(tab);
    if (tab === 'ORDERS' && orderFilter) {
      setInitialOrderFilter(orderFilter);
    } else if (tab === 'ORDERS') {
      setInitialOrderFilter('Semua');
    }
    setIsMobileDrawerOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-zinc-100 text-zinc-800 flex flex-col lg:flex-row overflow-x-hidden">
      {/* DESKTOP SIDEBAR (Sticky Left) */}
      <aside className="hidden lg:flex flex-col w-64 bg-emerald-950 text-white shrink-0 sticky top-0 h-screen z-40 border-r border-emerald-900 shadow-xl">
        {/* Brand Header */}
        <div className="p-5 border-b border-emerald-900/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white p-1 border border-emerald-700 flex items-center justify-center shadow-md overflow-hidden shrink-0">
              <img
                src={APP_CONFIG.appLogo}
                alt={APP_CONFIG.brandName}
                className="w-full h-full object-cover rounded-xl"
                onError={(e) => {
                  (e.currentTarget as HTMLElement).style.display = 'none';
                  if (e.currentTarget.parentElement) {
                    e.currentTarget.parentElement.innerText = '🥗';
                  }
                }}
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-base text-white tracking-tight">
                  {APP_CONFIG.brandName}
                </span>
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="bg-amber-400 text-amber-950 text-[10px] font-black uppercase px-2 py-0.5 rounded-md tracking-wider">
                  ADMIN
                </span>
                <span className="text-[11px] text-emerald-300 font-medium">Outlet Portal</span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-3.5 space-y-1 overflow-y-auto">
          <div className="px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-emerald-400/80">
            Menu Operasional
          </div>

          {navItems.map((item) => {
            const isActive = currentTab === item.id;
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                onClick={() => handleSelectTab(item.id)}
                className={`w-full px-3.5 py-2.5 rounded-2xl text-xs font-bold flex items-center justify-between transition-all group ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-md font-black'
                    : 'text-emerald-100/90 hover:text-white hover:bg-emerald-900/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                      isActive ? 'text-white' : 'text-emerald-300'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>

                {item.badge !== undefined && (
                  <span className="bg-rose-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-xs">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer Actions */}
        <div className="p-3.5 border-t border-emerald-900/80 space-y-1.5 bg-emerald-950/60">
          <button
            onClick={onBackToCustomer}
            className="w-full px-3 py-2 bg-emerald-900/80 hover:bg-emerald-800 text-emerald-100 hover:text-white rounded-xl text-xs font-bold transition-all flex items-center justify-between"
            title="Buka Tampilan Pemesanan Customer"
          >
            <div className="flex items-center gap-2">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Tampilan Customer</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 opacity-60" />
          </button>

          <button
            onClick={onLogout}
            className="w-full px-3 py-2 bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 hover:text-rose-100 rounded-xl text-xs font-bold transition-all flex items-center gap-2"
            title="Keluar dari Akun Admin"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* MOBILE TOP HEADER (Sticky Top on Small Screens) */}
      <header className="lg:hidden bg-emerald-950 text-white sticky top-0 z-40 shadow-md border-b border-emerald-900">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white p-0.5 flex items-center justify-center overflow-hidden shrink-0 border border-emerald-700">
              <img
                src={APP_CONFIG.appLogo}
                alt={APP_CONFIG.brandName}
                className="w-full h-full object-cover rounded-lg"
                onError={(e) => {
                  (e.currentTarget as HTMLElement).style.display = 'none';
                  if (e.currentTarget.parentElement) {
                    e.currentTarget.parentElement.innerText = '🥗';
                  }
                }}
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-sm text-white">
                  {APP_CONFIG.brandName}
                </span>
                <span className="bg-amber-400 text-amber-950 text-[9px] font-black uppercase px-1.5 py-0.2 rounded-md">
                  ADMIN
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onBackToCustomer}
              className="px-2.5 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
              title="Tampilan Customer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="text-[11px]">Customer</span>
            </button>

            <button
              onClick={() => setIsMobileDrawerOpen(true)}
              className="p-2 bg-emerald-800 hover:bg-emerald-700 text-white rounded-lg transition-all cursor-pointer"
              aria-label="Buka Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* MOBILE DRAWER MODAL */}
      {isMobileDrawerOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileDrawerOpen(false)}
          />

          <div className="relative w-4/5 max-w-xs bg-emerald-950 text-white h-full flex flex-col z-10 shadow-2xl">
            {/* Drawer Header */}
            <div className="p-4 border-b border-emerald-900 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-white p-0.5 flex items-center justify-center overflow-hidden shrink-0 border border-emerald-700">
                  <img
                    src={APP_CONFIG.appLogo}
                    alt={APP_CONFIG.brandName}
                    className="w-full h-full object-cover rounded-lg"
                    onError={(e) => {
                      (e.currentTarget as HTMLElement).style.display = 'none';
                      if (e.currentTarget.parentElement) {
                        e.currentTarget.parentElement.innerText = '🥗';
                      }
                    }}
                  />
                </div>
                <div>
                  <h3 className="font-black text-sm text-white">{APP_CONFIG.brandName}</h3>
                  <span className="bg-amber-400 text-amber-950 text-[9px] font-black uppercase px-1.5 py-0.2 rounded-md">
                    ADMIN
                  </span>
                </div>
              </div>

              <button
                onClick={() => setIsMobileDrawerOpen(false)}
                className="w-8 h-8 rounded-full bg-emerald-900 text-white flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Drawer Links */}
            <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
              {navItems.map((item) => {
                const isActive = currentTab === item.id;
                const Icon = item.icon;

                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelectTab(item.id)}
                    className={`w-full px-3 py-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition-all ${
                      isActive
                        ? 'bg-emerald-600 text-white font-black'
                        : 'text-emerald-100 hover:bg-emerald-900/60'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </div>

                    {item.badge !== undefined && (
                      <span className="bg-rose-500 text-white text-[10px] font-black px-1.5 py-0.2 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Drawer Footer */}
            <div className="p-3 border-t border-emerald-900 space-y-1.5 bg-emerald-950">
              <button
                onClick={onBackToCustomer}
                className="w-full px-3 py-2 bg-emerald-900 text-emerald-100 rounded-xl text-xs font-bold flex items-center gap-2"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Tampilan Customer</span>
              </button>

              <button
                onClick={onLogout}
                className="w-full px-3 py-2 bg-rose-500/20 text-rose-200 rounded-xl text-xs font-bold flex items-center gap-2"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 pb-20 lg:pb-8">
        <main className="flex-1 w-full max-w-7xl mx-auto p-3.5 sm:p-5 lg:p-6 min-w-0">
          {currentTab === 'DASHBOARD' && (
            <AdminDashboard
              orders={orders}
              reservations={reservations}
              loyalties={loyalties}
              products={products}
              onNavigateTo={(tab) => handleSelectTab(tab as AdminTab)}
              onSelectOrderFilter={(status) => handleSelectTab('ORDERS', status)}
            />
          )}

          {currentTab === 'ORDERS' && (
            <AdminOrderManagement
              orders={orders}
              initialFilter={initialOrderFilter}
            />
          )}

          {currentTab === 'RESERVATIONS' && (
            <AdminReservationManagement reservations={reservations} />
          )}

          {currentTab === 'MENU' && (
            <AdminMenuManagement products={products} />
          )}

          {currentTab === 'CUSTOMERS' && (
            <AdminCustomerManagement loyalties={loyalties} />
          )}

          {currentTab === 'PROMOS' && (
            <AdminPromoManagement promos={promos} addOns={addOns} />
          )}

          {currentTab === 'REPORTS' && (
            <AdminReports
              orders={orders}
              reservations={reservations}
              loyalties={loyalties}
              products={products}
            />
          )}

          {currentTab === 'CREW' && <AdminCrewManagement />}

          {currentTab === 'SETTINGS' && <AdminSettings />}
        </main>
      </div>

      {/* MOBILE COMPACT BOTTOM NAVIGATION BAR */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-zinc-200 shadow-lg px-2 py-1.5 flex items-center justify-around">
        <button
          onClick={() => handleSelectTab('DASHBOARD')}
          className={`flex flex-col items-center py-1 px-2.5 rounded-xl transition-all ${
            currentTab === 'DASHBOARD'
              ? 'text-emerald-700 font-extrabold'
              : 'text-zinc-500 font-medium'
          }`}
        >
          <LayoutDashboard className="w-4 h-4 mb-0.5" />
          <span className="text-[10px]">Dashboard</span>
        </button>

        <button
          onClick={() => handleSelectTab('ORDERS')}
          className={`relative flex flex-col items-center py-1 px-2.5 rounded-xl transition-all ${
            currentTab === 'ORDERS'
              ? 'text-emerald-700 font-extrabold'
              : 'text-zinc-500 font-medium'
          }`}
        >
          <div className="relative">
            <ShoppingBag className="w-4 h-4 mb-0.5" />
            {pendingOrdersCount > 0 && (
              <span className="absolute -top-1 -right-2 bg-rose-500 text-white text-[9px] font-black px-1 rounded-full">
                {pendingOrdersCount}
              </span>
            )}
          </div>
          <span className="text-[10px]">Order</span>
        </button>

        <button
          onClick={() => handleSelectTab('RESERVATIONS')}
          className={`relative flex flex-col items-center py-1 px-2.5 rounded-xl transition-all ${
            currentTab === 'RESERVATIONS'
              ? 'text-emerald-700 font-extrabold'
              : 'text-zinc-500 font-medium'
          }`}
        >
          <div className="relative">
            <Calendar className="w-4 h-4 mb-0.5" />
            {pendingResCount > 0 && (
              <span className="absolute -top-1 -right-2 bg-rose-500 text-white text-[9px] font-black px-1 rounded-full">
                {pendingResCount}
              </span>
            )}
          </div>
          <span className="text-[10px]">Reservasi</span>
        </button>

        <button
          onClick={() => setIsMobileDrawerOpen(true)}
          className="flex flex-col items-center py-1 px-2.5 rounded-xl text-zinc-500 font-medium hover:text-zinc-800"
        >
          <Menu className="w-4 h-4 mb-0.5" />
          <span className="text-[10px]">More</span>
        </button>
      </div>
    </div>
  );
};

