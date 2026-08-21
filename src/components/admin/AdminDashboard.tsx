import React from 'react';
import { Order, Reservation, CustomerLoyalty, Product } from '../../types';
import { formatRupiah } from '../../utils/formatters';
import {
  ShoppingBag,
  CreditCard,
  ChefHat,
  Calendar,
  DollarSign,
  TrendingUp,
  ArrowRight,
  Sparkles,
  Flame,
  CheckCircle2,
} from 'lucide-react';

interface AdminDashboardProps {
  orders: Order[];
  reservations: Reservation[];
  loyalties: Record<string, CustomerLoyalty>;
  products: Product[];
  onNavigateTo: (tab: 'ORDERS' | 'RESERVATIONS' | 'MENU' | 'CUSTOMERS' | 'PROMOS' | 'REPORTS') => void;
  onSelectOrderFilter?: (status: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  orders,
  reservations,
  loyalties,
  products,
  onNavigateTo,
  onSelectOrderFilter,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];

  // 1. Order Baru (Perlu ditindaklanjuti)
  const newOrders = orders.filter(
    (o) => o.orderStatus === 'PESANAN_DIBUAT' || o.orderStatus === 'MENUNGGU_VERIFIKASI'
  );

  // 2. Pembayaran Menunggu Verifikasi
  const pendingPayments = orders.filter(
    (o) => o.paymentStatus === 'MENUNGGU_VERIFIKASI' && o.orderStatus !== 'DIBATALKAN'
  );

  // 3. Order Aktif (Sedang diproses)
  const activeProcessing = orders.filter(
    (o) =>
      o.orderStatus === 'SEDANG_DIPROSES' ||
      o.orderStatus === 'PEMBAYARAN_DIVERIFIKASI' ||
      o.orderStatus === 'SIAP_DIAMBIL' ||
      o.orderStatus === 'SEDANG_DIANTAR'
  );

  // 4. Reservasi Hari Ini (Perlu diperhatikan)
  const todayReservations = reservations.filter(
    (r) => r.date === todayStr && r.status !== 'DIBATALKAN'
  );

  // Omzet Hari Ini & Keseluruhan
  const completedOrders = orders.filter((o) => o.orderStatus === 'SELESAI');
  const todayCompletedOrders = completedOrders.filter((o) => o.createdAt && o.createdAt.startsWith(todayStr));
  const todayRevenue = todayCompletedOrders.reduce((sum, o) => sum + o.total, 0);
  const totalRevenueAllTime = completedOrders.reduce((sum, o) => sum + o.total, 0);
  const todayTxCount = todayCompletedOrders.length;

  // Produk Terlaris Calculation
  const productSalesMap: Record<string, { product: Product; count: number; revenue: number }> = {};
  (orders || []).forEach((o) => {
    if (o?.orderStatus !== 'DIBATALKAN') {
      (o?.items || []).forEach((item) => {
        const prod = item?.product;
        const id = prod?.id || (item as any)?.productId;
        if (!id) return;
        if (!productSalesMap[id]) {
          productSalesMap[id] = {
            product: prod || {
              id,
              name: (item as any)?.name || 'Menu MiJUS',
              category: 'Pure Juice',
              description: '',
              image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop&q=80',
              priceMed: item.unitPrice || 18000,
              hasSizes: false,
              isAvailable: true,
            },
            count: 0,
            revenue: 0,
          };
        }
        productSalesMap[id].count += item.quantity || 1;
        productSalesMap[id].revenue += item.totalPrice || 0;
      });
    }
  });

  const bestSellers = Object.values(productSalesMap)
    .filter((item) => Boolean(item?.product))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return (
    <div className="space-y-6 pb-6">
      {/* 1. TOP OPERATIONAL FOCUS HEADER */}
      <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-green-800 rounded-3xl p-5 sm:p-6 text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-emerald-700/60">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-amber-400 text-amber-950 font-black text-[10px] uppercase px-2.5 py-0.5 rounded-full">
              Fokus Hari Ini
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Fokus Operasional MiJUS
          </h1>
          <p className="text-xs text-emerald-100/90 mt-1 max-w-xl leading-relaxed">
            Pantau dan tindaklanjuti antrean pesanan, pembayaran, serta reservasi aktif.
          </p>
        </div>

        <div className="shrink-0">
          <button
            onClick={() => onNavigateTo('ORDERS')}
            className="w-full sm:w-auto px-5 py-3 bg-white hover:bg-emerald-50 text-emerald-950 font-black text-xs rounded-2xl shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <ShoppingBag className="w-4 h-4 text-emerald-700" />
            <span>Kelola Semua Order</span>
          </button>
        </div>
      </div>

      {/* 2. OPERATIONAL SUMMARY (4 Core Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Card 1: 🔴 Order Baru */}
        <div
          onClick={() => {
            onNavigateTo('ORDERS');
            if (onSelectOrderFilter) onSelectOrderFilter('Baru');
          }}
          className={`rounded-3xl p-4 sm:p-5 border transition-all cursor-pointer flex flex-col justify-between hover:shadow-md ${
            newOrders.length > 0
              ? 'bg-rose-50/90 border-rose-200'
              : 'bg-white border-zinc-200'
          }`}
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-xs text-rose-950 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
                <span>Order Baru</span>
              </span>
              <span className="text-lg">🔴</span>
            </div>

            <div className="mt-2.5">
              <div className="text-3xl font-black text-rose-950">
                {newOrders.length}
              </div>
              <p className="text-xs font-semibold text-rose-800/90 mt-0.5">
                {newOrders.length > 0 ? 'Perlu ditindaklanjuti' : 'Semua order sudah ditangani 👍'}
              </p>
            </div>
          </div>

          <div className="mt-4 pt-2 border-t border-rose-200/60 flex items-center justify-between text-xs font-black text-rose-700">
            <span>Lihat Order</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Card 2: 💳 Pembayaran */}
        <div
          onClick={() => {
            onNavigateTo('ORDERS');
            if (onSelectOrderFilter) onSelectOrderFilter('Menunggu Pembayaran');
          }}
          className={`rounded-3xl p-4 sm:p-5 border transition-all cursor-pointer flex flex-col justify-between hover:shadow-md ${
            pendingPayments.length > 0
              ? 'bg-blue-50/90 border-blue-200'
              : 'bg-white border-zinc-200'
          }`}
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-xs text-blue-950 flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-blue-600" />
                <span>Pembayaran</span>
              </span>
              <span className="text-lg">💳</span>
            </div>

            <div className="mt-2.5">
              <div className="text-3xl font-black text-blue-950">
                {pendingPayments.length}
              </div>
              <p className="text-xs font-semibold text-blue-800/90 mt-0.5">
                {pendingPayments.length > 0 ? 'Menunggu verifikasi' : 'Semua sudah lunas diverifikasi'}
              </p>
            </div>
          </div>

          <div className="mt-4 pt-2 border-t border-blue-200/60 flex items-center justify-between text-xs font-black text-blue-700">
            <span>Periksa</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Card 3: 🍳 Order Aktif */}
        <div
          onClick={() => {
            onNavigateTo('ORDERS');
            if (onSelectOrderFilter) onSelectOrderFilter('Diproses');
          }}
          className="bg-emerald-50/90 border border-emerald-200 rounded-3xl p-4 sm:p-5 transition-all cursor-pointer flex flex-col justify-between hover:shadow-md"
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-xs text-emerald-950 flex items-center gap-1.5">
                <ChefHat className="w-4 h-4 text-emerald-700" />
                <span>Order Aktif</span>
              </span>
              <span className="text-lg">🍳</span>
            </div>

            <div className="mt-2.5">
              <div className="text-3xl font-black text-emerald-950">
                {activeProcessing.length}
              </div>
              <p className="text-xs font-semibold text-emerald-800/90 mt-0.5">
                Sedang diproses & disiapkan
              </p>
            </div>
          </div>

          <div className="mt-4 pt-2 border-t border-emerald-200/60 flex items-center justify-between text-xs font-black text-emerald-700">
            <span>Lihat</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Card 4: 📅 Reservasi Hari Ini */}
        <div
          onClick={() => onNavigateTo('RESERVATIONS')}
          className="bg-purple-50/90 border border-purple-200 rounded-3xl p-4 sm:p-5 transition-all cursor-pointer flex flex-col justify-between hover:shadow-md"
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-xs text-purple-950 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-purple-700" />
                <span>Reservasi Hari Ini</span>
              </span>
              <span className="text-lg">📅</span>
            </div>

            <div className="mt-2.5">
              <div className="text-3xl font-black text-purple-950">
                {todayReservations.length}
              </div>
              <p className="text-xs font-semibold text-purple-800/90 mt-0.5">
                {todayReservations.length > 0
                  ? 'Perlu diperhatikan'
                  : 'Belum ada jadwal hari ini'}
              </p>
            </div>
          </div>

          <div className="mt-4 pt-2 border-t border-purple-200/60 flex items-center justify-between text-xs font-black text-purple-700">
            <span>Lihat Reservasi</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>

      {/* 3. OMZET & PRODUK TERLARIS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Omzet Card */}
        <div className="bg-white rounded-3xl p-5 border border-zinc-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold">
                  💰
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-zinc-900">Omzet Penjualan</h3>
                  <span className="text-[11px] text-zinc-500">Rekap transaksi selesai</span>
                </div>
              </div>

              <span className="bg-emerald-100 text-emerald-800 font-extrabold text-[10px] px-2 py-0.5 rounded-md flex items-center gap-0.5">
                <TrendingUp className="w-3 h-3" />
                <span>{completedOrders.length} Selesai</span>
              </span>
            </div>

            <div className="my-3 p-4 bg-teal-50/60 rounded-2xl border border-teal-100">
              <div className="text-[11px] font-bold text-teal-800">
                {todayTxCount > 0 ? 'Omzet Hari Ini' : 'Total Omzet Terkumpul'}
              </div>
              <div className="text-2xl sm:text-3xl font-black text-teal-950 mt-0.5">
                {formatRupiah(todayTxCount > 0 ? todayRevenue : totalRevenueAllTime)}
              </div>
              <div className="text-xs text-zinc-600 font-medium mt-1 flex items-center justify-between">
                <span>{todayTxCount} pesanan selesai hari ini</span>
                <span className="text-[11px] text-zinc-400">({completedOrders.length} total)</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigateTo('REPORTS')}
            className="w-full py-2.5 px-3 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer active:scale-98"
          >
            <span>Buka Laporan Lengkap</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Produk Terlaris Compact List */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-5 border border-zinc-200 shadow-sm">
          <div className="flex items-center justify-between mb-3.5">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                🏆
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-zinc-900">Produk Terlaris MiJUS</h3>
                <p className="text-[11px] text-zinc-500">Paling banyak dipesan pelanggan</p>
              </div>
            </div>

            <button
              onClick={() => onNavigateTo('MENU')}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
            >
              <span>Kelola Menu</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2">
            {bestSellers.length === 0 ? (
              <p className="text-xs text-zinc-500 py-4 text-center">Belum ada data transaksi</p>
            ) : (
              bestSellers.slice(0, 4).map((item, index) => {
                if (!item?.product) return null;
                const prodName = item.product.name || 'Menu MiJUS';
                const prodImg = item.product.image || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop&q=80';

                return (
                  <div
                    key={item.product.id || index}
                    className="flex items-center justify-between p-2.5 rounded-2xl bg-zinc-50 border border-zinc-100 hover:bg-emerald-50/50 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span
                        className={`w-6 h-6 rounded-lg flex items-center justify-center text-[11px] font-black shrink-0 ${
                          index === 0
                            ? 'bg-amber-400 text-amber-950'
                            : index === 1
                            ? 'bg-zinc-200 text-zinc-700'
                            : index === 2
                            ? 'bg-amber-800/70 text-white'
                            : 'bg-zinc-100 text-zinc-500'
                        }`}
                      >
                        #{index + 1}
                      </span>

                      <div className="w-10 h-10 rounded-xl overflow-hidden bg-zinc-200 shrink-0">
                        <img
                          src={prodImg}
                          alt={prodName}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="min-w-0">
                        <h4 className="font-bold text-xs text-zinc-900 truncate">
                          {prodName}
                        </h4>
                        <span className="text-[10px] text-zinc-500 font-medium">
                          {item.product.category || 'Pure Juice'}
                        </span>
                      </div>
                    </div>

                    <div className="text-right shrink-0 pl-2">
                      <div className="font-black text-xs text-zinc-900">
                        {item.count} porsi
                      </div>
                      <div className="text-[10px] text-emerald-800 font-bold">
                        {formatRupiah(item.revenue)}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

