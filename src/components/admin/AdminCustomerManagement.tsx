import React, { useState } from 'react';
import { CustomerLoyalty } from '../../types';
import { formatRupiah, getWhatsAppUrl } from '../../utils/formatters';
import {
  Users,
  Search,
  Award,
  Sparkles,
  Phone,
  Gift,
  Plus,
  Minus,
  MessageCircle,
  TrendingUp,
} from 'lucide-react';
import { manualAdjustStamps } from '../../services/storeService';

interface AdminCustomerManagementProps {
  loyalties: Record<string, CustomerLoyalty>;
}

export const AdminCustomerManagement: React.FC<AdminCustomerManagementProps> = ({
  loyalties,
}) => {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'SEMUA' | 'HAMPIR_REWARD' | 'PUNYA_REWARD'>('SEMUA');

  const customerList: CustomerLoyalty[] = Object.values(loyalties || {}) as CustomerLoyalty[];

  const filtered = customerList.filter((c) => {
    const custName = (c.customerName || c.name || '').toLowerCase();
    if (filter === 'HAMPIR_REWARD' && c.stamps < 9) return false;
    if (filter === 'PUNYA_REWARD' && c.rewardsAvailable <= 0) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        custName.includes(q) ||
        c.phone.includes(q)
      );
    }
    return true;
  });

  const handleAdjust = (phone: string, delta: number) => {
    manualAdjustStamps(phone, delta);
  };

  const getSapaWhatsAppUrl = (c: CustomerLoyalty) => {
    const displayName = c.customerName || c.name || 'Pelanggan';
    let msg = `Halo Kak ${displayName}! 💚 Terima kasih telah menjadi pelanggan setia MiJUS Go Healthy.`;
    if (c.stamps === 9) {
      msg += `\n\n🎉 Kamu tinggal butuh 1 stamp lagi untuk mendapatkan FREE SALAD Fresh! Yuk pesan jus favoritmu hari ini!`;
    } else if (c.rewardsAvailable > 0) {
      msg += `\n\n🎁 Kamu memiliki ${c.rewardsAvailable} voucher Free Salad yang siap digunakan saat checkout!`;
    } else {
      msg += `\n\nSaat ini kamu memiliki ${c.stamps}/10 stamp di kartu reward MiJUS kamu.`;
    }
    return getWhatsAppUrl(c.phone, msg);
  };

  return (
    <div className="space-y-5 pb-12">
      {/* Header */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-zinc-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-black text-zinc-900">
              Database Pelanggan & Loyalty Card
            </h2>
            <p className="text-xs text-zinc-500">
              Identifikasi otomatis via nomor WhatsApp ({customerList.length} pelanggan terdaftar)
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => setFilter('SEMUA')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filter === 'SEMUA'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
              }`}
            >
              Semua ({customerList.length})
            </button>
            <button
              onClick={() => setFilter('HAMPIR_REWARD')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filter === 'HAMPIR_REWARD'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-amber-50 text-amber-900 hover:bg-amber-100'
              }`}
            >
              🔥 9/10 Stamp ({customerList.filter((c) => c.stamps >= 9).length})
            </button>
            <button
              onClick={() => setFilter('PUNYA_REWARD')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filter === 'PUNYA_REWARD'
                  ? 'bg-rose-700 text-white shadow-xs'
                  : 'bg-rose-50 text-rose-900 hover:bg-rose-100'
              }`}
            >
              🎁 Punya Voucher ({customerList.filter((c) => c.rewardsAvailable > 0).length})
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-zinc-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama atau nomor WhatsApp customer..."
            className="w-full text-xs pl-9 pr-4 py-2 rounded-xl border border-zinc-200"
          />
        </div>
      </div>

      {/* Customer Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.length === 0 ? (
          <div className="col-span-full bg-white rounded-3xl p-12 text-center text-zinc-400 border border-zinc-200">
            <p className="font-bold text-zinc-700">Tidak ada data pelanggan yang cocok</p>
          </div>
        ) : (
          filtered.map((customer) => {
            const waUrl = getSapaWhatsAppUrl(customer);

            return (
              <div
                key={customer.phone}
                className="bg-white rounded-3xl p-4 sm:p-5 border border-zinc-200 hover:border-emerald-300 shadow-sm transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Top Customer Info */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-black text-sm text-zinc-900">
                          {customer.customerName || customer.name || 'Pelanggan'}
                        </h3>
                        {customer.stamps >= 9 && (
                          <span className="bg-amber-100 text-amber-900 font-extrabold text-[9px] px-2 py-0.5 rounded-full border border-amber-300">
                            🔥 9/10 Stamp!
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-zinc-500 font-mono flex items-center gap-1 mt-0.5">
                        <Phone className="w-3 h-3 text-emerald-600" />
                        <span>{customer.phone}</span>
                      </div>
                    </div>

                    <a
                      href={waUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl transition-colors shrink-0"
                      title="Sapa Pelanggan via WhatsApp"
                    >
                      <MessageCircle className="w-4 h-4" />
                    </a>
                  </div>

                  {/* Stamp Progress Bar */}
                  <div className="bg-emerald-50/70 p-3 rounded-2xl border border-emerald-100 mb-3 space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-emerald-950 flex items-center gap-1">
                        <Award className="w-3.5 h-3.5 text-emerald-700" />
                        <span>Kartu Stamp</span>
                      </span>
                      <span className="font-black text-emerald-900">
                        {customer.stamps} / 10 Stamp
                      </span>
                    </div>

                    <div className="w-full h-2 bg-zinc-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-amber-400 rounded-full"
                        style={{ width: `${(customer.stamps / 10) * 100}%` }}
                      />
                    </div>

                    {/* Manual Adjust Controls */}
                    <div className="flex items-center justify-between pt-1 text-[11px]">
                      <span className="text-zinc-500">Koreksi Stamp:</span>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleAdjust(customer.phone, -1)}
                          disabled={customer.stamps <= 0}
                          className="w-6 h-6 rounded-lg bg-zinc-200 hover:bg-zinc-300 disabled:opacity-30 text-zinc-800 font-bold flex items-center justify-center transition-colors"
                          title="Kurangi 1 stamp"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="font-mono font-bold text-xs px-1">
                          {customer.stamps}
                        </span>
                        <button
                          onClick={() => handleAdjust(customer.phone, 1)}
                          disabled={customer.stamps >= 10}
                          className="w-6 h-6 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center justify-center transition-colors"
                          title="Tambah 1 stamp"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Summary Stats */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2 bg-zinc-50 rounded-xl border border-zinc-100">
                      <div className="text-[10px] text-zinc-500">Total Transaksi</div>
                      <div className="font-bold text-zinc-800 mt-0.5">
                        {customer.totalOrders}x ({formatRupiah(customer.totalSpent)})
                      </div>
                    </div>
                    <div className="p-2 bg-zinc-50 rounded-xl border border-zinc-100">
                      <div className="text-[10px] text-zinc-500">Voucher Free Salad</div>
                      <div className="font-bold text-amber-800 mt-0.5">
                        {customer.rewardsAvailable} Aktif • {customer.rewardsUsed} Terpakai
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
