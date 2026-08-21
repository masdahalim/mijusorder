import React, { useState } from 'react';
import { Reservation, ReservationStatus } from '../../types';
import {
  formatDate,
  formatRupiah,
  getReservationStatusLabel,
  getWhatsAppUrl,
} from '../../utils/formatters';
import { APP_CONFIG } from '../../config/appConfig';
import {
  Calendar,
  Clock,
  Users,
  MessageCircle,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Filter,
  Plus,
} from 'lucide-react';
import { updateReservationStatus } from '../../services/storeService';

interface AdminReservationManagementProps {
  reservations: Reservation[];
}

export const AdminReservationManagement: React.FC<AdminReservationManagementProps> = ({
  reservations,
}) => {
  const [filter, setFilter] = useState<string>('Semua');

  const filtered = reservations.filter((r) => {
    if (filter === 'Menunggu' && r.status !== 'MENUNGGU') return false;
    if (filter === 'Diterima' && r.status !== 'DITERIMA') return false;
    if (filter === 'Selesai' && r.status !== 'SELESAI') return false;
    if (filter === 'Dibatalkan' && r.status !== 'DIBATALKAN') return false;
    return true;
  });

  const handleStatus = (id: string, status: ReservationStatus) => {
    updateReservationStatus(id, status);
  };

  const getWaConfirmationUrl = (r: Reservation) => {
    const msg = `Halo Kak ${r.name}, kami dari MiJUS Go Healthy mengonfirmasi reservasi meja Anda:
📅 Tanggal: ${formatDate(r.date)}
⏰ Jam: ${r.time} WIB
👥 Jumlah Tamu: ${r.guestCount} Orang
${r.preOrderItems && r.preOrderItems.length > 0 ? `🥗 Pre-Order Menu: ${r.preOrderItems.length} menu disiapkan` : ''}

Reservasi Anda telah kami catat & siapkan mejanya. Sampai jumpa di outlet MiJUS! 💚`;
    return getWhatsAppUrl(r.phone, msg);
  };

  return (
    <div className="space-y-5 pb-12 text-zinc-800">
      {/* Header */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-zinc-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-black text-zinc-900">
            Jadwal Reservasi Tempat & Acara
          </h2>
          <p className="text-xs text-zinc-500">
            Total {filtered.length} reservasi tercatat ({reservations.length} keseluruhan)
          </p>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {['Semua', 'Menunggu', 'Diterima', 'Selesai', 'Dibatalkan'].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filter === tab
                  ? 'bg-purple-800 text-white shadow-xs'
                  : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Reservation Cards */}
      <div className="space-y-3.5">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center text-zinc-400 border border-zinc-200">
            <div className="text-4xl mb-2">📅</div>
            <p className="font-bold text-zinc-700">Belum ada reservasi dalam kategori ini</p>
          </div>
        ) : (
          filtered.map((res) => {
            const statusInfo = getReservationStatusLabel(res.status);
            const waUrl = getWaConfirmationUrl(res);

            return (
              <div
                key={res.id}
                className="bg-white rounded-3xl p-4 sm:p-5 border border-zinc-200 hover:border-purple-300 shadow-sm transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4"
              >
                {/* Left info */}
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono font-black text-sm text-purple-950 bg-purple-50 px-2 py-0.5 rounded-lg border border-purple-100">
                      #{res.id}
                    </span>
                    <span
                      className={`text-[11px] font-black px-2.5 py-0.5 rounded-xl border ${statusInfo.bg} ${statusInfo.color} ${statusInfo.border}`}
                    >
                      {statusInfo.label}
                    </span>
                  </div>

                  <div className="text-xs text-zinc-700 flex flex-wrap items-center gap-3">
                    <strong className="text-sm text-zinc-900">{res.name}</strong>
                    <span className="font-mono text-zinc-500">{res.phone}</span>
                  </div>

                  {/* Schedule Details */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs bg-purple-50/50 p-2.5 rounded-2xl border border-purple-100">
                    <div className="flex items-center gap-1.5 text-zinc-700">
                      <Calendar className="w-4 h-4 text-purple-700 shrink-0" />
                      <span>{formatDate(res.date)}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-zinc-700">
                      <Clock className="w-4 h-4 text-purple-700 shrink-0" />
                      <span>{res.time} WIB</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-zinc-700">
                      <Users className="w-4 h-4 text-purple-700 shrink-0" />
                      <span className="font-bold">{res.guestCount} Orang</span>
                    </div>
                  </div>

                  {res.notes && (
                    <div className="text-xs text-zinc-600 italic bg-zinc-50 p-2 rounded-xl border border-zinc-100">
                      Catatan / Kegiatan: {res.notes}
                    </div>
                  )}

                  {/* Pre-order menu if any */}
                  {res.preOrderItems && res.preOrderItems.length > 0 && (
                    <div className="text-xs text-zinc-700 bg-zinc-50 p-2 rounded-xl border border-zinc-100">
                      <span className="font-semibold text-zinc-500">Pre-Order Menu: </span>
                      {res.preOrderItems.map((item, idx) => {
                        const pName =
                          (item as any).productName ||
                          (item as any).product?.name ||
                          'Menu MiJUS';
                        const pQty = item.quantity || 1;
                        return (
                          <span key={(item as any).cartItemId || (item as any).id || idx}>
                            {pQty}x {pName}
                            {idx < (res.preOrderItems?.length || 0) - 1 ? ', ' : ''}
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Right action buttons */}
                <div className="flex flex-wrap items-center gap-2 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-zinc-100">
                  {res.status === 'MENUNGGU' && (
                    <button
                      onClick={() => handleStatus(res.id, 'DITERIMA')}
                      className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs active:scale-95 transition-all"
                    >
                      ✓ Terima Reservasi
                    </button>
                  )}

                  {res.status === 'DITERIMA' && (
                    <button
                      onClick={() => handleStatus(res.id, 'SELESAI')}
                      className="px-3.5 py-2 bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs rounded-xl shadow-xs active:scale-95 transition-all"
                    >
                      Tandai Selesai
                    </button>
                  )}

                  {res.status !== 'SELESAI' && res.status !== 'DIBATALKAN' && (
                    <button
                      onClick={() => handleStatus(res.id, 'DIBATALKAN')}
                      className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs rounded-xl transition-all"
                    >
                      Batalkan
                    </button>
                  )}

                  <a
                    href={waUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs rounded-xl flex items-center gap-1.5 border border-emerald-200 transition-all"
                  >
                    <MessageCircle className="w-4 h-4 text-emerald-600" />
                    <span>Konfirmasi WA</span>
                  </a>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

