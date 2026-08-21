import React, { useState, useEffect } from 'react';
import { Order, CrewContact, OrderGroupContact } from '../../types';
import { APP_CONFIG } from '../../config/appConfig';
import {
  buildWhatsAppForwardToCrewMessage,
  getWhatsAppUrl,
} from '../../utils/formatters';
import {
  X,
  MessageCircle,
  Users,
  UserCheck,
  Copy,
  Check,
  ChefHat,
  ExternalLink,
  Info,
} from 'lucide-react';
import {
  updateOrderStatus,
  getCrewContacts,
  getOrderGroups,
} from '../../services/storeService';

interface ForwardToCrewModalProps {
  order: Order;
  onClose: () => void;
  onOrderUpdated?: (updatedOrder: Order) => void;
}

export const ForwardToCrewModal: React.FC<ForwardToCrewModalProps> = ({
  order,
  onClose,
  onOrderUpdated,
}) => {
  const [crews, setCrews] = useState<CrewContact[]>(() => getCrewContacts());
  const [groups, setGroups] = useState<OrderGroupContact[]>(() => getOrderGroups());

  const activeCrews = crews.filter((c) => c.isActive !== false);
  const activeGroups = groups.filter((g) => g.isActive !== false);
  const defaultGroup = activeGroups.find((g) => g.isDefault) || activeGroups[0] || groups[0];

  const [targetType, setTargetType] = useState<'CREW' | 'GROUP'>('CREW');
  const [selectedCrewId, setSelectedCrewId] = useState<string>(
    activeCrews[0]?.id || crews[0]?.id || ''
  );
  const [selectedGroupId, setSelectedGroupId] = useState<string>(
    defaultGroup?.id || ''
  );
  const [copied, setCopied] = useState(false);

  const selectedCrew =
    crews.find((c) => c.id === selectedCrewId) || activeCrews[0] || crews[0];
  const selectedGroup =
    groups.find((g) => g.id === selectedGroupId) || defaultGroup;

  const targetPhone =
    targetType === 'CREW'
      ? selectedCrew?.phone || APP_CONFIG.adminWhatsApp
      : selectedGroup?.phone || APP_CONFIG.orderGroupWhatsApp.phone;

  const targetLabel =
    targetType === 'CREW'
      ? `${selectedCrew?.name || 'Crew'} (${selectedCrew?.role || 'Staff'})`
      : selectedGroup?.name || 'Grup Order Outlet';

  const message = buildWhatsAppForwardToCrewMessage(order);
  const waUrl = getWhatsAppUrl(targetPhone, message);

  const handleCopy = () => {
    navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendToWhatsApp = () => {
    // If order was PESANAN_DIBUAT or MENUNGGU_VERIFIKASI, mark as SEDANG_DIPROSES
    updateOrderStatus(order.id, 'SEDANG_DIPROSES');
    if (onOrderUpdated) {
      onOrderUpdated({ ...order, orderStatus: 'SEDANG_DIPROSES' });
    }
    window.open(waUrl, '_blank');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-zinc-200 overflow-hidden flex flex-col max-h-[92vh] text-zinc-800 animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-900 to-emerald-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-700/80 flex items-center justify-center text-white font-black text-lg">
              <ChefHat className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-base text-white">
                Teruskan Order #{order.id}
              </h3>
              <p className="text-xs text-emerald-200">
                Pilih tujuan pengiriman tiket pesanan dapur
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-emerald-800/80 hover:bg-emerald-700 text-white flex items-center justify-center transition-all"
            aria-label="Tutup"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs">
          {/* Target Selector */}
          <div>
            <label className="block text-xs font-black text-zinc-900 mb-2">
              Pilihan Tujuan:
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              {/* Option 1: 🟢 Crew Onsite */}
              <button
                type="button"
                onClick={() => setTargetType('CREW')}
                className={`p-3.5 rounded-2xl border text-left transition-all flex items-center gap-3 ${
                  targetType === 'CREW'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold ring-2 ring-emerald-600/30'
                    : 'border-zinc-200 hover:border-zinc-300 text-zinc-700 font-medium bg-white'
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    targetType === 'CREW'
                      ? 'bg-emerald-700 text-white'
                      : 'bg-zinc-100 text-zinc-600'
                  }`}
                >
                  <UserCheck className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-black text-xs text-zinc-900">🟢 Crew Onsite</div>
                  <div className="text-[10px] text-zinc-500">{activeCrews.length} Staff Aktif</div>
                </div>
              </button>

              {/* Option 2: 💬 Grup Order Outlet */}
              <button
                type="button"
                onClick={() => setTargetType('GROUP')}
                className={`p-3.5 rounded-2xl border text-left transition-all flex items-center gap-3 ${
                  targetType === 'GROUP'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold ring-2 ring-emerald-600/30'
                    : 'border-zinc-200 hover:border-zinc-300 text-zinc-700 font-medium bg-white'
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    targetType === 'GROUP'
                      ? 'bg-emerald-700 text-white'
                      : 'bg-zinc-100 text-zinc-600'
                  }`}
                >
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-black text-xs text-zinc-900">💬 Grup WhatsApp</div>
                  <div className="text-[10px] text-zinc-500">{activeGroups.length} Grup Outlet</div>
                </div>
              </button>
            </div>
          </div>

          {/* If Crew Onsite is chosen */}
          {targetType === 'CREW' && (
            <div className="p-3 bg-zinc-50 rounded-2xl border border-zinc-200 space-y-1.5">
              <label className="block text-xs font-bold text-zinc-800">
                Pilih Anggota Crew Bertugas:
              </label>
              {crews.length === 0 ? (
                <div className="text-zinc-500 text-xs py-2">Belum ada crew terdaftar.</div>
              ) : (
                <select
                  value={selectedCrewId}
                  onChange={(e) => setSelectedCrewId(e.target.value)}
                  className="w-full text-xs font-bold px-3 py-2.5 rounded-xl border border-zinc-300 bg-white focus:outline-hidden focus:border-emerald-600"
                >
                  {crews.map((crew) => (
                    <option key={crew.id} value={crew.id}>
                      {crew.isActive === false ? '❌ (Off) ' : '🟢 '}
                      {crew.name} ({crew.role}) — {crew.phone}
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}

          {/* If Group is chosen */}
          {targetType === 'GROUP' && (
            <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-950 space-y-2">
              <label className="block text-xs font-bold text-emerald-950">
                Pilih Grup WhatsApp Tujuan:
              </label>
              {groups.length === 0 ? (
                <div className="text-emerald-800 text-xs py-1">Belum ada grup terdaftar.</div>
              ) : groups.length === 1 ? (
                <div className="space-y-0.5">
                  <div className="font-bold flex items-center gap-1.5 text-xs">
                    <Users className="w-3.5 h-3.5 text-emerald-700" />
                    <span>{groups[0].name}</span>
                    {groups[0].isDefault && (
                      <span className="text-[9px] bg-amber-400 text-amber-950 px-1.5 py-0.2 rounded font-black">
                        DEFAULT
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-emerald-800 font-mono">
                    Nomor: {groups[0].phone}
                  </div>
                </div>
              ) : (
                <select
                  value={selectedGroupId}
                  onChange={(e) => setSelectedGroupId(e.target.value)}
                  className="w-full text-xs font-bold px-3 py-2.5 rounded-xl border border-emerald-300 bg-white text-zinc-900 focus:outline-hidden focus:border-emerald-600"
                >
                  {groups.map((grp) => (
                    <option key={grp.id} value={grp.id}>
                      {grp.isDefault ? '⭐ [Default] ' : ''}
                      {grp.name} ({grp.phone})
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}

          {/* Info note */}
          <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 flex items-start gap-2 text-amber-900">
            <Info className="w-4 h-4 shrink-0 text-amber-700 mt-0.5" />
            <p className="text-[11px] leading-relaxed">
              <strong>Catatan:</strong> Admin akan diarahkan ke WhatsApp tujuan (<strong>{targetLabel}</strong>) untuk menekan tombol <em>Send</em>. Status pesanan akan otomatis dicatat sebagai sedang diproses.
            </p>
          </div>

          {/* Message Preview */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-extrabold text-zinc-800">
                Preview Pesan WhatsApp:
              </span>
              <button
                type="button"
                onClick={handleCopy}
                className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:text-emerald-800 active:scale-95 transition-all"
              >
                {copied ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-600 stroke-[3]" />
                    <span className="text-emerald-700">Tersalin!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Salin Pesan</span>
                  </>
                )}
              </button>
            </div>

            <div className="bg-zinc-900 text-emerald-300 font-mono text-[11px] p-3 rounded-2xl border border-zinc-800 whitespace-pre-wrap leading-relaxed max-h-36 overflow-y-auto">
              {message}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-zinc-50 border-t border-zinc-200 flex items-center gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="py-2.5 px-4 rounded-xl border border-zinc-300 bg-white hover:bg-zinc-100 text-zinc-700 font-bold text-xs active:scale-95 transition-all"
          >
            Batal
          </button>

          <button
            type="button"
            onClick={handleSendToWhatsApp}
            className="flex-1 py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs rounded-xl shadow-md shadow-emerald-700/20 flex items-center justify-center gap-2 active:scale-98 transition-all"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Buka WhatsApp</span>
          </button>
        </div>
      </div>
    </div>
  );
};

