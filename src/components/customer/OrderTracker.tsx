import React, { useState } from 'react';
import { Order, OrderStatus } from '../../types';
import {
  formatRupiah,
  formatDateTime,
  getOrderStatusLabel,
  getOrderTypeBadge,
  getPaymentMethodLabel,
  buildWhatsAppOrderMessage,
  getWhatsAppUrl,
} from '../../utils/formatters';
import { APP_CONFIG } from '../../config/appConfig';
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  MessageCircle,
  ShoppingBag,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Paperclip,
  Eye,
  FileText,
  UploadCloud,
  Database,
  ExternalLink,
} from 'lucide-react';
import { InsForgeFileUploader } from '../common/InsForgeFileUploader';
import { attachFileToOrder, formatFileSize, isImageFile } from '../../services/storageService';

interface OrderTrackerProps {
  orders: Order[];
  currentPhone: string;
  onBackToHome: () => void;
  onRefreshOrders?: () => void;
}

export const OrderTracker: React.FC<OrderTrackerProps> = ({
  orders,
  currentPhone,
  onBackToHome,
  onRefreshOrders,
}) => {
  const [selectedTab, setSelectedTab] = useState<'AKTIF' | 'RIWAYAT'>('AKTIF');
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [activeUploadOrderId, setActiveUploadOrderId] = useState<string | null>(null);
  const [previewImageUrl, setPreviewImageUrl] = useState<{ url: string; name: string } | null>(null);

  // Filter orders matching customer's phone
  const cleanPhone = (currentPhone || '').replace(/[^0-9]/g, '');
  const customerOrders = (orders || []).filter((o) => {
    const custPhone = o.customer?.phone || '';
    const oPhone = custPhone.replace(/[^0-9]/g, '');
    return oPhone === cleanPhone || custPhone === currentPhone;
  });

  const activeOrders = customerOrders.filter(
    (o) => o.orderStatus !== 'SELESAI' && o.orderStatus !== 'DIBATALKAN'
  );
  const historyOrders = customerOrders.filter(
    (o) => o.orderStatus === 'SELESAI' || o.orderStatus === 'DIBATALKAN'
  );

  const displayedOrders = selectedTab === 'AKTIF' ? activeOrders : historyOrders;

  const toggleExpand = (id: string) => {
    setExpandedOrderId((prev) => (prev === id ? null : id));
  };

  const getStepProgress = (status: OrderStatus, orderType: string) => {
    const steps = [
      { key: 'PESANAN_DIBUAT', label: 'Pesanan Dibuat', icon: '📝' },
      { key: 'PEMBAYARAN_DIVERIFIKASI', label: 'Pembayaran Diverifikasi', icon: '💳' },
      { key: 'SEDANG_DIPROSES', label: 'Sedang Diproses', icon: '🍳' },
      {
        key: 'SIAP_DIAMBIL',
        label: orderType === 'KURIR' ? 'Sedang Diantar' : 'Siap Diambil',
        icon: orderType === 'KURIR' ? '🛵' : '🛍️',
      },
      { key: 'SELESAI', label: 'Selesai', icon: '🎉' },
    ];

    let currentStepIndex = 0;
    if (status === 'PESANAN_DIBUAT' || status === 'MENUNGGU_VERIFIKASI') currentStepIndex = 0;
    else if (status === 'PEMBAYARAN_DIVERIFIKASI') currentStepIndex = 1;
    else if (status === 'SEDANG_DIPROSES') currentStepIndex = 2;
    else if (status === 'SIAP_DIAMBIL' || status === 'SEDANG_DIANTAR') currentStepIndex = 3;
    else if (status === 'SELESAI') currentStepIndex = 4;
    else if (status === 'DIBATALKAN') currentStepIndex = -1;

    return { steps, currentStepIndex };
  };

  return (
    <div className="min-h-[85vh] pb-24 text-zinc-800">
      {/* Header Bar */}
      <div className="bg-gradient-to-r from-emerald-700 via-green-600 to-emerald-600 text-white p-4 sticky top-0 z-30 shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <button
              onClick={onBackToHome}
              className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-all active:scale-95"
              aria-label="Kembali"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <h1 className="font-black text-lg text-white">Status Pesanan Saya</h1>
          </div>

          {onRefreshOrders && (
            <button
              onClick={onRefreshOrders}
              className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white active:scale-95 transition-all"
              title="Perbarui status"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 gap-2 mt-3 p-1 bg-emerald-800/60 rounded-2xl border border-emerald-400/20 text-xs">
          <button
            onClick={() => setSelectedTab('AKTIF')}
            className={`py-2 rounded-xl font-extrabold transition-all flex items-center justify-center gap-1.5 ${
              selectedTab === 'AKTIF'
                ? 'bg-white text-emerald-900 shadow-md'
                : 'text-emerald-100 hover:text-white'
            }`}
          >
            <span>Pesanan Aktif</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                selectedTab === 'AKTIF'
                  ? 'bg-emerald-100 text-emerald-900'
                  : 'bg-emerald-700 text-emerald-200'
              }`}
            >
              {activeOrders.length}
            </span>
          </button>

          <button
            onClick={() => setSelectedTab('RIWAYAT')}
            className={`py-2 rounded-xl font-extrabold transition-all flex items-center justify-center gap-1.5 ${
              selectedTab === 'RIWAYAT'
                ? 'bg-white text-emerald-900 shadow-md'
                : 'text-emerald-100 hover:text-white'
            }`}
          >
            <span>Riwayat Pesanan</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                selectedTab === 'RIWAYAT'
                  ? 'bg-emerald-100 text-emerald-900'
                  : 'bg-emerald-700 text-emerald-200'
              }`}
            >
              {historyOrders.length}
            </span>
          </button>
        </div>
      </div>

      {/* Orders List Content */}
      <div className="p-4 space-y-4 max-w-md mx-auto">
        {displayedOrders.length === 0 ? (
          <div className="py-16 text-center text-zinc-400">
            <div className="w-16 h-16 bg-zinc-100 rounded-3xl mx-auto flex items-center justify-center text-3xl mb-3">
              📋
            </div>
            <p className="font-bold text-zinc-700 text-base">
              {selectedTab === 'AKTIF'
                ? 'Tidak ada pesanan yang sedang aktif'
                : 'Belum ada riwayat pesanan'}
            </p>
            <p className="text-xs text-zinc-500 mt-1">
              {selectedTab === 'AKTIF'
                ? 'Pesan jus atau makanan favoritmu sekarang!'
                : 'Pesanan yang telah selesai akan muncul di sini.'}
            </p>
            <button
              onClick={onBackToHome}
              className="mt-4 px-5 py-2.5 bg-emerald-600 text-white font-bold text-xs rounded-2xl shadow-md hover:bg-emerald-700 active:scale-95 transition-all"
            >
              Buka Katalog Menu
            </button>
          </div>
        ) : (
          displayedOrders.map((order) => {
            const statusInfo = getOrderStatusLabel(order.orderStatus, order.orderType);
            const typeBadge = getOrderTypeBadge(order.orderType);
            const paymentInfo = getPaymentMethodLabel(order.paymentMethod);
            const { steps, currentStepIndex } = getStepProgress(
              order.orderStatus,
              order.orderType
            );
            const isExpanded = expandedOrderId === order.id;
            const waMsg = buildWhatsAppOrderMessage(order);
            const waUrl = getWhatsAppUrl(APP_CONFIG.adminWhatsApp, waMsg);

            return (
              <div
                key={order.id}
                className="bg-white rounded-3xl border border-emerald-100 shadow-md shadow-emerald-900/5 overflow-hidden transition-all"
              >
                {/* Order Top Bar */}
                <div className="p-4 bg-emerald-50/40 border-b border-emerald-100/80">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-sm text-emerald-950">
                        {order.id}
                      </span>
                      <span
                        className={`text-[10px] font-extrabold px-2 py-0.5 rounded-lg flex items-center gap-1 ${typeBadge.bg} ${typeBadge.text}`}
                      >
                        <span>{typeBadge.icon}</span>
                        <span>{typeBadge.label}</span>
                      </span>
                    </div>

                    <span
                      className={`text-xs font-black px-2.5 py-1 rounded-xl border ${statusInfo.bg} ${statusInfo.color} ${statusInfo.border}`}
                    >
                      {statusInfo.label}
                    </span>
                  </div>

                  <div className="text-[11px] text-zinc-500 mt-1 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{formatDateTime(order.createdAt)}</span>
                  </div>
                </div>

                {/* Progress Stepper (Only for active & non-cancelled orders) */}
                {order.orderStatus !== 'DIBATALKAN' && (
                  <div className="p-4 bg-white border-b border-zinc-100">
                    <div className="text-xs font-extrabold text-zinc-800 mb-3">
                      Lacak Tahapan Pesanan:
                    </div>

                    <div className="relative flex items-center justify-between">
                      {/* Connecting line */}
                      <div className="absolute left-3 right-3 top-3.5 h-1 bg-zinc-200 -z-0">
                        <div
                          className="h-full bg-emerald-500 transition-all duration-500"
                          style={{
                            width: `${(Math.max(0, currentStepIndex) / (steps.length - 1)) * 100}%`,
                          }}
                        />
                      </div>

                      {steps.map((step, idx) => {
                        const isDone = idx <= currentStepIndex;
                        const isCurrent = idx === currentStepIndex;

                        return (
                          <div
                            key={step.key}
                            className="relative z-10 flex flex-col items-center text-center max-w-[54px]"
                          >
                            <div
                              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs transition-all ${
                                isCurrent
                                  ? 'bg-emerald-600 text-white ring-4 ring-emerald-100 font-bold scale-110 shadow-sm'
                                  : isDone
                                  ? 'bg-emerald-600 text-white font-bold'
                                  : 'bg-zinc-200 text-zinc-500'
                              }`}
                            >
                              {isDone ? (
                                idx === currentStepIndex ? (
                                  step.icon
                                ) : (
                                  <CheckCircle2 className="w-4 h-4" />
                                )
                              ) : (
                                idx + 1
                              )}
                            </div>
                            <span
                              className={`text-[9px] mt-1.5 font-bold leading-tight ${
                                isCurrent
                                  ? 'text-emerald-900 font-extrabold'
                                  : isDone
                                  ? 'text-zinc-700'
                                  : 'text-zinc-400'
                              }`}
                            >
                              {step.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Cancelled Reason Alert */}
                {order.orderStatus === 'DIBATALKAN' && order.cancellationReason && (
                  <div className="p-3 m-3 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">Alasan Pembatalan:</span>{' '}
                      {order.cancellationReason}
                    </div>
                  </div>
                )}

                {/* Summary / Items Preview */}
                <div className="p-4 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-zinc-600 font-medium">
                    <span>
                      {order.items.reduce((s, i) => s + i.quantity, 0)} Menu • {paymentInfo.label}
                    </span>
                    <button
                      onClick={() => toggleExpand(order.id)}
                      className="text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-1"
                    >
                      <span>{isExpanded ? 'Tutup Detail' : 'Lihat Detail'}</span>
                      {isExpanded ? (
                        <ChevronUp className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>

                  {/* Expanded Items Breakdown */}
                  {isExpanded && (
                    <div className="pt-2.5 pb-1 space-y-2 border-t border-zinc-100">
                      {(order.items || []).map((item, idx) => (
                        <div
                          key={item.cartItemId || idx}
                          className="flex items-start justify-between gap-2 text-zinc-700"
                        >
                          <div>
                            <div className="font-bold">
                              {item.quantity || 1}x {item.product?.name || (item as any).name || 'Menu'}{' '}
                              {item.product?.hasSizes ? `(${item.size})` : ''}
                            </div>
                            {item.selectedAddOns && item.selectedAddOns.length > 0 && (
                              <div className="text-[10px] text-zinc-500">
                                + {item.selectedAddOns.map((a) => a?.name || '').filter(Boolean).join(', ')}
                              </div>
                            )}
                            {item.notes && (
                              <div className="text-[10px] text-zinc-500 italic">
                                Note: {item.notes}
                              </div>
                            )}
                          </div>
                          <span className="font-extrabold shrink-0">
                            {formatRupiah(item.totalPrice)}
                          </span>
                        </div>
                      ))}

                      {order.discount > 0 && (
                        <div className="flex justify-between text-amber-700 font-bold pt-1 border-t border-zinc-100">
                          <span>Diskon Loyalty</span>
                          <span>-{formatRupiah(order.discount)}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Loyalty Stamp Status & Total Amount */}
                  <div className="pt-2 border-t border-zinc-100 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] text-zinc-500 uppercase font-bold">
                        Total Bayar
                      </div>
                      <div className="font-black text-base text-emerald-950">
                        {formatRupiah(order.total)}
                      </div>
                    </div>

                    <div className="text-right">
                      {order.orderStatus === 'SELESAI' ? (
                        order.total >= 50000 ? (
                          <div className="inline-flex items-center gap-1 bg-amber-100 text-amber-950 font-black text-[10px] px-2.5 py-1 rounded-xl border border-amber-300 shadow-xs">
                            <span>🥗</span>
                            <span>+1 Stamp Diterima!</span>
                          </div>
                        ) : (
                          <div className="text-[10px] text-zinc-400 font-semibold">
                            Total &lt; Rp 50rb (Tanpa Stamp)
                          </div>
                        )
                      ) : order.orderStatus === 'DIBATALKAN' ? null : order.total >= 50000 ? (
                        <div className="text-[10px] text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100">
                          ⭐ +1 Stamp saat Selesai
                        </div>
                      ) : (
                        <div className="text-[10px] text-zinc-400">
                          Belum memenuhi min. Rp 50rb
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Attached File Display / InsForge Storage */}
                  {order.attachment ? (
                    <div className="p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-black text-emerald-900 flex items-center gap-1">
                          <Paperclip className="w-3.5 h-3.5 text-emerald-700" />
                          <span>Lampiran Bukti Bayar Terlampir</span>
                        </span>
                        <span className="text-[9px] font-bold text-emerald-800 bg-white px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                          <Database className="w-2.5 h-2.5" />
                          <span>InsForge Cloud</span>
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-2 bg-white p-2 rounded-xl border border-emerald-100">
                        <div className="flex items-center gap-2 min-w-0">
                          {isImageFile(order.attachment.type, order.attachment.name) ? (
                            <button
                              type="button"
                              onClick={() =>
                                setPreviewImageUrl({
                                  url: order.attachment!.url,
                                  name: order.attachment!.name,
                                })
                              }
                              className="w-10 h-10 rounded-lg overflow-hidden border border-emerald-200 shrink-0 relative group"
                            >
                              <img
                                src={order.attachment.url}
                                alt={order.attachment.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                              />
                            </button>
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                              <FileText className="w-5 h-5" />
                            </div>
                          )}

                          <div className="min-w-0">
                            <p className="font-bold text-xs text-zinc-900 truncate" title={order.attachment.name}>
                              {order.attachment.name}
                            </p>
                            <p className="text-[10px] text-zinc-500 font-mono">
                              {formatFileSize(order.attachment.size)} • Key: {order.attachment.key.split('/').pop()}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          {isImageFile(order.attachment.type, order.attachment.name) && (
                            <button
                              type="button"
                              onClick={() =>
                                setPreviewImageUrl({
                                  url: order.attachment!.url,
                                  name: order.attachment!.name,
                                })
                              }
                              className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-bold flex items-center gap-1"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">Lihat</span>
                            </button>
                          )}
                          <a
                            href={order.attachment.url}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 rounded-lg bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
                            title="Buka File Asli"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </div>
                    </div>
                  ) : (
                    order.orderStatus !== 'SELESAI' &&
                    order.orderStatus !== 'DIBATALKAN' && (
                      <div className="pt-1">
                        {activeUploadOrderId === order.id ? (
                          <div className="p-3 bg-zinc-50 rounded-2xl border border-zinc-200 space-y-2">
                            <InsForgeFileUploader
                              category="PAYMENT_PROOF"
                              recordId={order.id}
                              onFileUploaded={(file) => {
                                attachFileToOrder(order.id, file);
                                setActiveUploadOrderId(null);
                                if (onRefreshOrders) onRefreshOrders();
                              }}
                              onFileRemoved={() => setActiveUploadOrderId(null)}
                              label="Unggah Struk / Bukti Bayar Sekarang"
                              compact
                            />
                            <button
                              type="button"
                              onClick={() => setActiveUploadOrderId(null)}
                              className="text-[11px] text-zinc-500 hover:text-zinc-800 font-semibold underline"
                            >
                              Batal
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setActiveUploadOrderId(order.id)}
                            className="w-full py-2 px-3 rounded-xl border border-dashed border-emerald-300 bg-emerald-50/50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
                          >
                            <UploadCloud className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Unggah Bukti Bayar / Slip Transfer (InsForge Storage)</span>
                          </button>
                        )}
                      </div>
                    )
                  )}

                  {/* Actions & WhatsApp Support */}
                  <div className="pt-2 border-t border-zinc-100 flex items-center justify-end">
                    <a
                      href={waUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs rounded-xl flex items-center gap-1.5 border border-emerald-200 transition-all active:scale-95"
                    >
                      <MessageCircle className="w-4 h-4 text-emerald-600" />
                      <span>Chat Admin</span>
                    </a>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Image Preview Modal */}
      {previewImageUrl && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl space-y-3">
            <div className="p-4 border-b border-zinc-100 flex items-center justify-between">
              <span className="font-extrabold text-sm text-zinc-900 truncate">
                {previewImageUrl.name}
              </span>
              <button
                type="button"
                onClick={() => setPreviewImageUrl(null)}
                className="w-7 h-7 rounded-full bg-zinc-100 text-zinc-600 flex items-center justify-center font-bold hover:bg-zinc-200"
              >
                ✕
              </button>
            </div>
            <div className="p-4 flex items-center justify-center max-h-[70vh] bg-zinc-950">
              <img
                src={previewImageUrl.url}
                alt={previewImageUrl.name}
                className="max-h-[60vh] max-w-full object-contain rounded-lg"
              />
            </div>
            <div className="p-4 bg-zinc-50 border-t border-zinc-100 flex justify-end">
              <button
                type="button"
                onClick={() => setPreviewImageUrl(null)}
                className="px-4 py-2 bg-zinc-900 text-white font-bold rounded-xl text-xs"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
