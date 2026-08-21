import React, { useState } from 'react';
import { Order, Reservation, CustomerLoyalty, Product } from '../../types';
import { formatRupiah, formatDateTime } from '../../utils/formatters';
import {
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Calendar,
  Award,
  Download,
  Filter,
  BarChart3,
  PieChart,
  Users,
  Flame,
} from 'lucide-react';

interface AdminReportsProps {
  orders: Order[];
  reservations: Reservation[];
  loyalties: Record<string, CustomerLoyalty>;
  products: Product[];
}

export const AdminReports: React.FC<AdminReportsProps> = ({
  orders,
  reservations,
  loyalties,
  products,
}) => {
  const [timeframe, setTimeframe] = useState<'HARI_INI' | '7_HARI' | 'BULAN_INI' | 'SEMUA'>('SEMUA');

  const todayStr = new Date().toISOString().split('T')[0];
  const startOfMonthStr = `${todayStr.slice(0, 7)}-01`;
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const sevenDaysAgoTime = sevenDaysAgo.getTime();

  // Filter orders by timeframe
  const filteredOrders = orders.filter((o) => {
    if (!o.createdAt) return timeframe === 'SEMUA';
    if (timeframe === 'HARI_INI') {
      return o.createdAt.startsWith(todayStr);
    }
    if (timeframe === '7_HARI') {
      return new Date(o.createdAt).getTime() >= sevenDaysAgoTime;
    }
    if (timeframe === 'BULAN_INI') {
      return o.createdAt >= startOfMonthStr;
    }
    return true;
  });

  const completedOrders = filteredOrders.filter((o) => o.orderStatus === 'SELESAI');
  const totalRevenue = completedOrders.reduce((sum, o) => sum + o.total, 0);
  const avgOrderValue = completedOrders.length > 0 ? Math.round(totalRevenue / completedOrders.length) : 0;

  // Order type breakdown
  const typeCounts = {
    TAKEAWAY: completedOrders.filter((o) => o.orderType === 'TAKEAWAY').length,
    'DINE-IN': completedOrders.filter((o) => o.orderType === 'DINE-IN').length,
    KURIR: completedOrders.filter((o) => o.orderType === 'KURIR').length,
    RESERVASI: completedOrders.filter((o) => o.orderType === 'RESERVASI').length,
  };

  // Payment method breakdown
  const paymentCounts = {
    QRIS: completedOrders.filter((o) => o.paymentMethod === 'QRIS').length,
    TRANSFER: completedOrders.filter((o) => o.paymentMethod === 'TRANSFER').length,
    CASH: completedOrders.filter((o) => o.paymentMethod === 'CASH').length,
  };

  // Product sales breakdown
  const productSalesMap: Record<string, { name: string; category: string; count: number; total: number }> = {};
  (completedOrders || []).forEach((o) => {
    (o?.items || []).forEach((i) => {
      const pId = i?.product?.id || (i as any)?.productId || 'unknown';
      if (!productSalesMap[pId]) {
        productSalesMap[pId] = {
          name: i?.product?.name || (i as any)?.name || 'Menu MiJUS',
          category: i?.product?.category || 'Minuman',
          count: 0,
          total: 0,
        };
      }
      productSalesMap[pId].count += i.quantity || 1;
      productSalesMap[pId].total += i.totalPrice || 0;
    });
  });

  const rankedProducts = Object.values(productSalesMap).sort((a, b) => b.count - a.count);

  const handleExportCSV = () => {
    const escapeCSV = (val: unknown) => {
      if (val === undefined || val === null) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const headers = [
      'No.',
      'ID Pesanan',
      'Tanggal Transaksi',
      'Nama Pelanggan',
      'No. WhatsApp',
      'Tipe Pesanan',
      'Rincian Menu',
      'Total Qty',
      'Subtotal (Rp)',
      'Diskon (Rp)',
      'Total Akhir (Rp)',
      'Metode Pembayaran',
      'Status Pembayaran',
      'Status Pesanan',
    ];

    const rows = filteredOrders.map((o, idx) => {
      const itemsSummary = (o.items || [])
        .map((i) => `${i.product?.name || 'Menu'} x${i.quantity || 1}`)
        .join('; ');
      const totalQty = (o.items || []).reduce((acc, curr) => acc + (curr.quantity || 1), 0);

      return [
        escapeCSV(idx + 1),
        escapeCSV(o.id),
        escapeCSV(o.createdAt ? new Date(o.createdAt).toLocaleString('id-ID') : '-'),
        escapeCSV(o.customer?.name || 'Pelanggan'),
        escapeCSV(o.customer?.phone || '-'),
        escapeCSV(o.orderType),
        escapeCSV(itemsSummary),
        escapeCSV(totalQty),
        escapeCSV(o.subtotal || o.total),
        escapeCSV(o.discount || 0),
        escapeCSV(o.total),
        escapeCSV(o.paymentMethod),
        escapeCSV(o.paymentStatus),
        escapeCSV(o.orderStatus),
      ].join(',');
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `MiJUS_Laporan_Analisis_${timeframe.toLowerCase()}_${todayStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 pb-12 text-zinc-800">
      {/* Top Header & Timeframe Pills */}
      <div className="bg-white rounded-3xl p-5 border border-zinc-200 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-zinc-900">Laporan & Rekapitulasi Operasional</h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            Analisis penjualan, performa menu, serta loyalitas customer MiJUS.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Timeframe Selector */}
          <div className="flex items-center gap-1 bg-zinc-100 p-1 rounded-2xl">
            {[
              { id: 'HARI_INI' as const, label: 'Hari Ini' },
              { id: '7_HARI' as const, label: '7 Hari' },
              { id: 'BULAN_INI' as const, label: 'Bulan Ini' },
              { id: 'SEMUA' as const, label: 'Semua Waktu' },
            ].map((tf) => (
              <button
                key={tf.id}
                onClick={() => setTimeframe(tf.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                  timeframe === tf.id
                    ? 'bg-white text-emerald-950 shadow-xs'
                    : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                {tf.label}
              </button>
            ))}
          </div>

          <button
            onClick={handleExportCSV}
            className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs rounded-xl shadow-xs flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer"
            title="Download Laporan CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-white rounded-3xl p-4 border border-zinc-200 shadow-sm">
          <div className="w-9 h-9 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mb-2">
            <DollarSign className="w-5 h-5" />
          </div>
          <div className="text-[11px] font-bold text-zinc-500">Total Omzet Selesai</div>
          <div className="text-lg sm:text-xl font-black text-emerald-950 mt-0.5">
            {formatRupiah(totalRevenue)}
          </div>
        </div>

        <div className="bg-white rounded-3xl p-4 border border-zinc-200 shadow-sm">
          <div className="w-9 h-9 rounded-2xl bg-blue-100 text-blue-800 flex items-center justify-center mb-2">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div className="text-[11px] font-bold text-zinc-500">Pesanan Selesai</div>
          <div className="text-lg sm:text-xl font-black text-blue-950 mt-0.5">
            {completedOrders.length} <span className="text-xs font-normal text-zinc-500">/ {orders.length} total</span>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-4 border border-zinc-200 shadow-sm">
          <div className="w-9 h-9 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mb-2">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div className="text-[11px] font-bold text-zinc-500">Rata-rata Order (AOV)</div>
          <div className="text-lg sm:text-xl font-black text-amber-950 mt-0.5">
            {formatRupiah(avgOrderValue)}
          </div>
        </div>

        <div className="bg-white rounded-3xl p-4 border border-zinc-200 shadow-sm">
          <div className="w-9 h-9 rounded-2xl bg-purple-100 text-purple-800 flex items-center justify-center mb-2">
            <Award className="w-5 h-5" />
          </div>
          <div className="text-[11px] font-bold text-zinc-500">Total Member Loyalty</div>
          <div className="text-lg sm:text-xl font-black text-purple-950 mt-0.5">
            {Object.keys(loyalties).length} <span className="text-xs font-normal text-zinc-500">Customer</span>
          </div>
        </div>
      </div>

      {/* Breakdown Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Order Type Distribution */}
        <div className="bg-white rounded-3xl p-5 border border-zinc-200 shadow-sm">
          <h3 className="font-extrabold text-sm text-zinc-900 mb-3 flex items-center gap-2">
            <PieChart className="w-4 h-4 text-emerald-700" />
            <span>Distribusi Jenis Pesanan</span>
          </h3>

          <div className="space-y-3">
            {[
              { label: 'Takeaway (Bawa Pulang)', count: typeCounts.TAKEAWAY, color: 'bg-amber-500' },
              { label: 'Dine-In (Santap di Outlet)', count: typeCounts['DINE-IN'], color: 'bg-emerald-500' },
              { label: 'Kurir Delivery', count: typeCounts.KURIR, color: 'bg-blue-500' },
              { label: 'Reservasi Acara', count: typeCounts.RESERVASI, color: 'bg-purple-500' },
            ].map((item, idx) => {
              const percentage =
                completedOrders.length > 0
                  ? Math.round((item.count / completedOrders.length) * 100)
                  : 0;

              return (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs font-bold text-zinc-700">
                    <span>{item.label}</span>
                    <span>{item.count} pesanan ({percentage}%)</span>
                  </div>
                  <div className="w-full h-2.5 bg-zinc-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${item.color} rounded-full transition-all duration-500`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Payment Methods Breakdown */}
        <div className="bg-white rounded-3xl p-5 border border-zinc-200 shadow-sm">
          <h3 className="font-extrabold text-sm text-zinc-900 mb-3 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-emerald-700" />
            <span>Metode Pembayaran</span>
          </h3>

          <div className="space-y-3">
            {[
              { label: 'QRIS (Semua E-Wallet/Bank)', count: paymentCounts.QRIS, color: 'bg-emerald-600' },
              { label: 'Transfer Bank (BCA / Mandiri / BRI)', count: paymentCounts.TRANSFER, color: 'bg-blue-600' },
              { label: 'Cash (Bayar di Outlet)', count: paymentCounts.CASH, color: 'bg-zinc-600' },
            ].map((item, idx) => {
              const percentage =
                completedOrders.length > 0
                  ? Math.round((item.count / completedOrders.length) * 100)
                  : 0;

              return (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs font-bold text-zinc-700">
                    <span>{item.label}</span>
                    <span>{item.count} transaksi ({percentage}%)</span>
                  </div>
                  <div className="w-full h-2.5 bg-zinc-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${item.color} rounded-full transition-all duration-500`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Top Ranking Products Table */}
      <div className="bg-white rounded-3xl p-5 border border-zinc-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-extrabold text-sm text-zinc-900 flex items-center gap-2">
            <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span>Ranking Menu Terlaris (Top Selling Products)</span>
          </h3>
          <span className="text-xs text-zinc-500 font-medium">Berdasarkan pesanan selesai</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-zinc-200 text-zinc-500">
                <th className="py-2.5 px-3 font-bold">Rank</th>
                <th className="py-2.5 px-3 font-bold">Nama Menu</th>
                <th className="py-2.5 px-3 font-bold">Kategori</th>
                <th className="py-2.5 px-3 font-bold text-center">Jumlah Terjual</th>
                <th className="py-2.5 px-3 font-bold text-right">Total Penjualan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {rankedProducts.slice(0, 10).map((prod, idx) => (
                <tr key={idx} className="hover:bg-zinc-50 transition-colors">
                  <td className="py-3 px-3 font-black text-emerald-950">#{idx + 1}</td>
                  <td className="py-3 px-3 font-bold text-zinc-900">{prod.name}</td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 rounded-lg text-[10px] font-bold">
                      {prod.category}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center font-extrabold text-zinc-800">
                    {prod.count} porsi
                  </td>
                  <td className="py-3 px-3 text-right font-black text-emerald-800">
                    {formatRupiah(prod.total)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
