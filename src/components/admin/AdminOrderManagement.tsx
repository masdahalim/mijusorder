import React, { useState, useRef, useEffect } from 'react';
import { Order, OrderStatus, OrderType } from '../../types';
import {
  formatRupiah,
  formatDateTime,
  getOrderStatusLabel,
  getOrderTypeBadge,
  getPaymentMethodLabel,
  getWhatsAppUrl,
} from '../../utils/formatters';
import {
  Search,
  CheckCircle2,
  XCircle,
  MessageCircle,
  Eye,
  Star,
  ChefHat,
  MoreVertical,
  ArrowRight,
  ShieldCheck,
  Clock,
  MapPin,
  Utensils,
  Download,
  Check,
  Phone,
  Calendar,
  CalendarDays,
  RotateCcw,
  X,
  Filter,
  SlidersHorizontal,
  FileSpreadsheet,
  ChevronDown,
  FileText,
  Paperclip,
  UploadCloud,
  Database,
  ExternalLink,
  Copy,
} from 'lucide-react';
import {
  updateOrderStatus,
  verifyOrderPayment,
} from '../../services/storeService';
import { InsForgeFileUploader } from '../common/InsForgeFileUploader';
import { attachFileToOrder, formatFileSize, isImageFile } from '../../services/storageService';
import { GoogleReviewModal } from './GoogleReviewModal';
import { ForwardToCrewModal } from './ForwardToCrewModal';

interface AdminOrderManagementProps {
  orders: Order[];
  initialFilter?: string;
}

export const AdminOrderManagement: React.FC<AdminOrderManagementProps> = ({
  orders,
  initialFilter = 'Semua',
}) => {
  const [filter, setFilter] = useState<string>(initialFilter);
  const [searchQuery, setSearchQuery] = useState('');
  const [phoneQuery, setPhoneQuery] = useState('');
  const [orderTypeFilter, setOrderTypeFilter] = useState<string>('SEMUA');
  const [datePreset, setDatePreset] = useState<'SEMUA' | 'HARI_INI' | 'KEMARIN' | '7_HARI' | 'BULAN_INI' | 'KUSTOM'>('SEMUA');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showCancelModal, setShowCancelModal] = useState<Order | null>(null);
  const [cancelReason, setCancelReason] = useState('Bahan habis / stok tidak tersedia');
  const [reviewModalOrder, setReviewModalOrder] = useState<Order | null>(null);
  const [forwardModalOrder, setForwardModalOrder] = useState<Order | null>(null);
  const [openActionMenuId, setOpenActionMenuId] = useState<string | null>(null);
  const [exportedSuccess, setExportedSuccess] = useState(false);
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const [exportFeedback, setExportFeedback] = useState<{
    title: string;
    filename: string;
    count: number;
    totalRev: number;
  } | null>(null);

  const exportDropdownRef = useRef<HTMLDivElement>(null);

  // Close export dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        exportDropdownRef.current &&
        !exportDropdownRef.current.contains(event.target as Node)
      ) {
        setShowExportDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Date helper utilities
  const getTodayStr = () => new Date().toISOString().split('T')[0];
  const getYesterdayStr = () => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toISOString().split('T')[0];
  };
  const getDaysAgoStr = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() - days);
    return d.toISOString().split('T')[0];
  };
  const getStartOfMonthStr = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
  };

  const handleSelectDatePreset = (preset: 'SEMUA' | 'HARI_INI' | 'KEMARIN' | '7_HARI' | 'BULAN_INI') => {
    setDatePreset(preset);
    if (preset === 'SEMUA') {
      setStartDate('');
      setEndDate('');
    } else if (preset === 'HARI_INI') {
      const today = getTodayStr();
      setStartDate(today);
      setEndDate(today);
    } else if (preset === 'KEMARIN') {
      const yesterday = getYesterdayStr();
      setStartDate(yesterday);
      setEndDate(yesterday);
    } else if (preset === '7_HARI') {
      setStartDate(getDaysAgoStr(7));
      setEndDate(getTodayStr());
    } else if (preset === 'BULAN_INI') {
      setStartDate(getStartOfMonthStr());
      setEndDate(getTodayStr());
    }
  };

  const handleResetFilters = () => {
    setFilter('Semua');
    setSearchQuery('');
    setPhoneQuery('');
    setOrderTypeFilter('SEMUA');
    setDatePreset('SEMUA');
    setStartDate('');
    setEndDate('');
  };

  const isAnyFilterActive =
    filter !== 'Semua' ||
    searchQuery.trim() !== '' ||
    phoneQuery.trim() !== '' ||
    orderTypeFilter !== 'SEMUA' ||
    startDate !== '' ||
    endDate !== '';

  // Filters calculation
  const filteredOrders = orders.filter((order) => {
    // Status filter
    if (filter === 'Baru' && !(order.orderStatus === 'PESANAN_DIBUAT' || order.orderStatus === 'MENUNGGU_VERIFIKASI')) return false;
    if (filter === 'Menunggu Pembayaran' && order.paymentStatus !== 'MENUNGGU_VERIFIKASI') return false;
    if (filter === 'Pembayaran Diverifikasi' && order.orderStatus !== 'PEMBAYARAN_DIVERIFIKASI') return false;
    if (filter === 'Diproses' && order.orderStatus !== 'SEDANG_DIPROSES') return false;
    if (filter === 'Siap' && !(order.orderStatus === 'SIAP_DIAMBIL' || order.orderStatus === 'SEDANG_DIANTAR')) return false;
    if (filter === 'Selesai' && order.orderStatus !== 'SELESAI') return false;
    if (filter === 'Batal' && order.orderStatus !== 'DIBATALKAN') return false;

    // Order type filter
    if (orderTypeFilter !== 'SEMUA' && order.orderType !== orderTypeFilter) {
      return false;
    }

    // Phone query filter
    if (phoneQuery.trim()) {
      const rawFilter = phoneQuery.trim().toLowerCase();
      const targetDigits = phoneQuery.replace(/\D/g, '');
      const orderPhoneRaw = (order.customer?.phone || '').toLowerCase();
      const orderPhoneDigits = (order.customer?.phone || '').replace(/\D/g, '');
      
      const orderPhoneAlt = orderPhoneDigits.startsWith('62')
        ? '0' + orderPhoneDigits.slice(2)
        : orderPhoneDigits.startsWith('0')
        ? '62' + orderPhoneDigits.slice(1)
        : orderPhoneDigits;

      const matchesDigits =
        targetDigits.length > 0 &&
        (orderPhoneDigits.includes(targetDigits) || orderPhoneAlt.includes(targetDigits));

      const matchesRaw = orderPhoneRaw.includes(rawFilter);

      if (!matchesDigits && !matchesRaw) {
        return false;
      }
    }

    // General Search query (ID, Name, Phone)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchId = order.id.toLowerCase().includes(q);
      const matchName = (order.customer?.name || '').toLowerCase().includes(q);
      const matchPhone = (order.customer?.phone || '').toLowerCase().includes(q);
      if (!matchId && !matchName && !matchPhone) {
        return false;
      }
    }

    // Date range filter
    if (startDate) {
      const orderTime = new Date(order.createdAt).getTime();
      const startDateTime = new Date(`${startDate}T00:00:00`).getTime();
      if (!isNaN(startDateTime) && orderTime < startDateTime) {
        return false;
      }
    }

    if (endDate) {
      const orderTime = new Date(order.createdAt).getTime();
      const endDateTime = new Date(`${endDate}T23:59:59.999`).getTime();
      if (!isNaN(endDateTime) && orderTime > endDateTime) {
        return false;
      }
    }

    return true;
  });

  const handleVerifyPayment = (orderId: string) => {
    verifyOrderPayment(orderId);
    if (selectedOrder?.id === orderId) {
      setSelectedOrder((prev) => (prev ? { ...prev, paymentStatus: 'TERVERIFIKASI', orderStatus: 'PEMBAYARAN_DIVERIFIKASI' } : null));
    }
  };

  const handleUpdateStatus = (orderId: string, newStatus: OrderStatus) => {
    updateOrderStatus(orderId, newStatus);
    if (selectedOrder?.id === orderId) {
      setSelectedOrder((prev) => (prev ? { ...prev, orderStatus: newStatus } : null));
    }
  };

  const handleConfirmCancel = () => {
    if (showCancelModal) {
      updateOrderStatus(showCancelModal.id, 'DIBATALKAN', cancelReason);
      setShowCancelModal(null);
      if (selectedOrder?.id === showCancelModal.id) {
        setSelectedOrder((prev) => (prev ? { ...prev, orderStatus: 'DIBATALKAN', cancellationReason: cancelReason } : null));
      }
    }
  };

  const handleExportCSVWithScope = (
    scope: 'FILTERED' | 'TODAY' | 'YESTERDAY' | '7_DAYS' | 'THIS_MONTH' | 'ALL' = 'FILTERED'
  ) => {
    let listToExport: Order[] = [];
    let reportTitle = 'Laporan Pesanan';
    let fileSuffix = 'rekap';

    const todayStr = getTodayStr();
    const yesterdayStr = getYesterdayStr();

    if (scope === 'TODAY') {
      listToExport = orders.filter((o) => o.createdAt && o.createdAt.startsWith(todayStr));
      reportTitle = `Laporan Harian (${todayStr})`;
      fileSuffix = `harian_${todayStr}`;
    } else if (scope === 'YESTERDAY') {
      listToExport = orders.filter((o) => o.createdAt && o.createdAt.startsWith(yesterdayStr));
      reportTitle = `Laporan Kemarin (${yesterdayStr})`;
      fileSuffix = `kemarin_${yesterdayStr}`;
    } else if (scope === '7_DAYS') {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const sevenDaysAgoTime = sevenDaysAgo.getTime();
      listToExport = orders.filter((o) => new Date(o.createdAt).getTime() >= sevenDaysAgoTime);
      reportTitle = `Laporan 7 Hari Terakhir`;
      fileSuffix = `7_hari_${todayStr}`;
    } else if (scope === 'THIS_MONTH') {
      const monthStart = getStartOfMonthStr();
      listToExport = orders.filter((o) => o.createdAt && o.createdAt >= monthStart);
      reportTitle = `Laporan Bulan Ini (${todayStr.slice(0, 7)})`;
      fileSuffix = `bulanan_${todayStr.slice(0, 7)}`;
    } else if (scope === 'ALL') {
      listToExport = [...orders];
      reportTitle = `Semua Riwayat Pesanan`;
      fileSuffix = `semua_data_${todayStr}`;
    } else {
      // 'FILTERED'
      listToExport = filteredOrders.length > 0 ? filteredOrders : orders;
      const datePart =
        startDate && endDate
          ? `${startDate}_sd_${endDate}`
          : startDate
          ? `dari_${startDate}`
          : todayStr;
      reportTitle = isAnyFilterActive ? `Laporan Filtered (${listToExport.length} pesanan)` : `Laporan Pesanan`;
      fileSuffix = `filtered_${datePart}`;
    }

    if (listToExport.length === 0) {
      alert('Tidak ada data pesanan yang cocok untuk diekspor.');
      setShowExportDropdown(false);
      return;
    }

    const escapeCSV = (val: unknown) => {
      if (val === undefined || val === null) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const headers = [
      'No.',
      'ID Pesanan',
      'Tanggal Transaksi',
      'Jam Transaksi (WIB)',
      'Nama Pelanggan',
      'No. WhatsApp',
      'Tipe Pesanan',
      'Detail Meja / Lokasi / Alamat',
      'Rincian Menu & Item',
      'Detail Topping & Add-ons',
      'Total Qty Item (Pcs)',
      'Subtotal (Rp)',
      'Diskon Voucher (Rp)',
      'Total Akhir (Rp)',
      'Metode Pembayaran',
      'Status Pembayaran',
      'Status Pesanan',
      'Catatan Pelanggan / Alasan Batal',
    ];

    let grandTotalQty = 0;
    let grandSubtotal = 0;
    let grandDiscount = 0;
    let grandTotalRev = 0;

    const rows = listToExport.map((o, idx) => {
      const itemsSummary = (o.items || [])
        .map((i) => `${i.product?.name || 'Menu'} x${i.quantity || 1} (${i.size || 'MED'})`)
        .join('; ');

      const addOnsSummary = (o.items || [])
        .flatMap((i) => (i.selectedAddOns || []).map((a) => `${i.product?.name || 'Item'}: +${a.name}`))
        .join('; ');

      const totalQty = (o.items || []).reduce((acc, curr) => acc + (curr.quantity || 1), 0);
      const subtotalVal = o.subtotal || o.total;
      const discountVal = o.discount || 0;
      const totalVal = o.total;

      grandTotalQty += totalQty;
      grandSubtotal += subtotalVal;
      grandDiscount += discountVal;
      grandTotalRev += totalVal;

      let dateFormatted = '-';
      let timeFormatted = '-';
      if (o.createdAt) {
        const d = new Date(o.createdAt);
        dateFormatted = d.toISOString().split('T')[0];
        timeFormatted = d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
      }

      const locationInfo =
        o.orderType === 'DINE-IN'
          ? `Meja ${o.customer?.tableNumber || '-'}`
          : o.orderType === 'KURIR'
          ? `${o.customer?.address || '-'} ${o.customer?.addressNotes ? `(${o.customer.addressNotes})` : ''}`
          : o.orderType === 'RESERVASI'
          ? `Reservasi ${o.customer?.reservationDate || ''} ${o.customer?.reservationTime || ''} (${o.customer?.guestCount || 1} org)`
          : 'Takeaway';

      const customerNotes =
        o.cancellationReason ||
        o.customer?.addressNotes ||
        o.customer?.reservationNotes ||
        (o.items || [])
          .map((i) => i.notes)
          .filter(Boolean)
          .join('; ') ||
        '-';

      return [
        escapeCSV(idx + 1),
        escapeCSV(o.id),
        escapeCSV(dateFormatted),
        escapeCSV(timeFormatted),
        escapeCSV(o.customer?.name || 'Pelanggan'),
        escapeCSV(o.customer?.phone || '-'),
        escapeCSV(o.orderType),
        escapeCSV(locationInfo),
        escapeCSV(itemsSummary),
        escapeCSV(addOnsSummary || '-'),
        escapeCSV(totalQty),
        escapeCSV(subtotalVal),
        escapeCSV(discountVal),
        escapeCSV(totalVal),
        escapeCSV(o.paymentMethod),
        escapeCSV(o.paymentStatus),
        escapeCSV(o.orderStatus),
        escapeCSV(customerNotes),
      ].join(',');
    });

    // Summary bottom row
    const summaryRow = [
      escapeCSV('TOTAL'),
      escapeCSV(`${listToExport.length} Pesanan`),
      escapeCSV(''),
      escapeCSV(''),
      escapeCSV(''),
      escapeCSV(''),
      escapeCSV(''),
      escapeCSV(''),
      escapeCSV(''),
      escapeCSV(''),
      escapeCSV(grandTotalQty),
      escapeCSV(grandSubtotal),
      escapeCSV(grandDiscount),
      escapeCSV(grandTotalRev),
      escapeCSV(''),
      escapeCSV(''),
      escapeCSV(''),
      escapeCSV(''),
    ].join(',');

    const csvContent = '\uFEFF' + [headers.join(','), ...rows, summaryRow].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const filename = `MiJUS_Laporan_Pesanan_${fileSuffix}.csv`;
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setExportedSuccess(true);
    setShowExportDropdown(false);
    setExportFeedback({
      title: reportTitle,
      filename,
      count: listToExport.length,
      totalRev: grandTotalRev,
    });

    setTimeout(() => {
      setExportedSuccess(false);
    }, 4000);

    setTimeout(() => {
      setExportFeedback(null);
    }, 6000);
  };

  const handleExportCSV = () => {
    handleExportCSVWithScope('FILTERED');
  };

  const filterTabs = [
    'Semua',
    'Baru',
    'Menunggu Pembayaran',
    'Diproses',
    'Siap',
    'Selesai',
    'Batal',
  ];

  const getStatusCount = (statusTab: string) => {
    return orders.filter((o) => {
      if (statusTab === 'Baru') return o.orderStatus === 'PESANAN_DIBUAT' || o.orderStatus === 'MENUNGGU_VERIFIKASI';
      if (statusTab === 'Menunggu Pembayaran') return o.paymentStatus === 'MENUNGGU_VERIFIKASI';
      if (statusTab === 'Diproses') return o.orderStatus === 'SEDANG_DIPROSES';
      if (statusTab === 'Siap') return o.orderStatus === 'SIAP_DIAMBIL' || o.orderStatus === 'SEDANG_DIANTAR';
      if (statusTab === 'Selesai') return o.orderStatus === 'SELESAI';
      if (statusTab === 'Batal') return o.orderStatus === 'DIBATALKAN';
      return true;
    }).length;
  };

  return (
    <div className="space-y-5 pb-12 text-zinc-800">
      {/* Search & Filter Header */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-zinc-200 shadow-sm space-y-4">
        {/* Top Header Row */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-emerald-100 text-emerald-900 text-[10px] font-black uppercase px-2 py-0.5 rounded-md">
                MANAJEMEN ORDER
              </span>
              {isAnyFilterActive && (
                <span className="bg-amber-100 text-amber-900 text-[10px] font-black uppercase px-2 py-0.5 rounded-md flex items-center gap-1">
                  <Filter className="w-2.5 h-2.5" />
                  Filter Aktif
                </span>
              )}
            </div>
            <h2 className="text-xl font-black text-zinc-900 mt-1">Kelola Order & Antrean</h2>
            <p className="text-xs text-zinc-500">
              Menampilkan <span className="font-bold text-zinc-800">{filteredOrders.length}</span> dari {orders.length} total pesanan
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Reset Filter Button if any filter active */}
            {isAnyFilterActive && (
              <button
                id="btn-reset-order-filters"
                onClick={handleResetFilters}
                className="px-3 py-2.5 rounded-xl border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 text-zinc-700 text-xs font-bold transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer"
                title="Reset semua pencarian dan filter"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Filter</span>
              </button>
            )}

            {/* Export to CSV Dropdown & Button Group */}
            <div className="relative inline-flex" ref={exportDropdownRef}>
              {/* Primary Direct Export Button */}
              <button
                id="btn-export-orders-csv"
                onClick={() => handleExportCSVWithScope(isAnyFilterActive ? 'FILTERED' : 'TODAY')}
                disabled={orders.length === 0}
                className={`px-3.5 py-2.5 rounded-l-xl font-extrabold text-xs shadow-xs transition-all flex items-center gap-2 shrink-0 active:scale-95 cursor-pointer ${
                  exportedSuccess
                    ? 'bg-emerald-600 text-white'
                    : 'bg-emerald-800 hover:bg-emerald-900 text-white disabled:opacity-50 disabled:cursor-not-allowed'
                }`}
                title="Download data order (CSV/Excel) untuk pelaporan harian"
              >
                {exportedSuccess ? (
                  <>
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>CSV Terunduh</span>
                  </>
                ) : (
                  <>
                    <FileSpreadsheet className="w-4 h-4 text-emerald-300" />
                    <span>Export to CSV ({filteredOrders.length})</span>
                  </>
                )}
              </button>

              {/* Dropdown Trigger Button */}
              <button
                id="btn-export-dropdown-toggle"
                onClick={() => setShowExportDropdown((prev) => !prev)}
                disabled={orders.length === 0}
                className={`px-2 py-2.5 rounded-r-xl border-l border-emerald-700 font-extrabold text-xs shadow-xs transition-all flex items-center justify-center shrink-0 cursor-pointer ${
                  exportedSuccess
                    ? 'bg-emerald-600 text-white'
                    : 'bg-emerald-800 hover:bg-emerald-900 text-white disabled:opacity-50 disabled:cursor-not-allowed'
                }`}
                title="Pilih opsi laporan ekspor CSV"
              >
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-200 ${
                    showExportDropdown ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {/* Export Options Dropdown Menu */}
              {showExportDropdown && (
                <div className="absolute right-0 top-full mt-1.5 w-72 bg-white rounded-2xl shadow-xl border border-zinc-200 z-40 p-2 space-y-1 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3 py-2 border-b border-zinc-100 mb-1">
                    <div className="text-[11px] font-black text-zinc-900 flex items-center gap-1.5">
                      <Download className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Download Laporan CSV / Excel</span>
                    </div>
                    <div className="text-[10px] text-zinc-500 mt-0.5">
                      Format kompatibel Microsoft Excel & Google Sheets
                    </div>
                  </div>

                  {/* 1. Laporan Harian (Hari Ini) */}
                  <button
                    onClick={() => handleExportCSVWithScope('TODAY')}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs hover:bg-emerald-50 text-zinc-800 hover:text-emerald-950 transition-colors flex items-center justify-between group cursor-pointer"
                  >
                    <div>
                      <div className="font-bold flex items-center gap-1.5 text-zinc-900 group-hover:text-emerald-900">
                        <Calendar className="w-3.5 h-3.5 text-emerald-700" />
                        <span>Laporan Harian (Hari Ini)</span>
                      </div>
                      <div className="text-[10px] text-zinc-500 ml-5">
                        Rekap harian untuk closing kasir
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                      Harian
                    </span>
                  </button>

                  {/* 2. Sesuai Filter Aktif */}
                  <button
                    onClick={() => handleExportCSVWithScope('FILTERED')}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs hover:bg-emerald-50 text-zinc-800 hover:text-emerald-950 transition-colors flex items-center justify-between group cursor-pointer"
                  >
                    <div>
                      <div className="font-bold flex items-center gap-1.5 text-zinc-900 group-hover:text-emerald-900">
                        <Filter className="w-3.5 h-3.5 text-blue-600" />
                        <span>Sesuai Filter Aktif</span>
                      </div>
                      <div className="text-[10px] text-zinc-500 ml-5">
                        {filteredOrders.length} pesanan yang ditampilkan
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-800">
                      {filteredOrders.length}
                    </span>
                  </button>

                  {/* 3. Laporan Kemarin */}
                  <button
                    onClick={() => handleExportCSVWithScope('YESTERDAY')}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs hover:bg-emerald-50 text-zinc-800 hover:text-emerald-950 transition-colors flex items-center justify-between group cursor-pointer"
                  >
                    <div className="font-medium text-zinc-700 ml-5">
                      <span>Laporan Kemarin</span>
                    </div>
                  </button>

                  {/* 4. Laporan 7 Hari Terakhir */}
                  <button
                    onClick={() => handleExportCSVWithScope('7_DAYS')}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs hover:bg-emerald-50 text-zinc-800 hover:text-emerald-950 transition-colors flex items-center justify-between group cursor-pointer"
                  >
                    <div className="font-medium text-zinc-700 ml-5">
                      <span>Laporan 7 Hari Terakhir</span>
                    </div>
                    <span className="text-[10px] text-zinc-400">Mingguan</span>
                  </button>

                  {/* 5. Laporan Bulan Ini */}
                  <button
                    onClick={() => handleExportCSVWithScope('THIS_MONTH')}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs hover:bg-emerald-50 text-zinc-800 hover:text-emerald-950 transition-colors flex items-center justify-between group cursor-pointer"
                  >
                    <div className="font-medium text-zinc-700 ml-5">
                      <span>Laporan Bulan Ini</span>
                    </div>
                    <span className="text-[10px] text-zinc-400">Bulanan</span>
                  </button>

                  {/* 6. Seluruh Database Order */}
                  <div className="pt-1 border-t border-zinc-100">
                    <button
                      onClick={() => handleExportCSVWithScope('ALL')}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs hover:bg-zinc-100 text-zinc-700 transition-colors flex items-center justify-between cursor-pointer"
                    >
                      <div className="font-semibold text-[11px] text-zinc-600 flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-zinc-400" />
                        <span>Unduh Semua Riwayat ({orders.length} Order)</span>
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Export Success Feedback Toast */}
        {exportFeedback && (
          <div className="bg-emerald-900 text-white rounded-2xl p-3.5 shadow-md flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-700 text-white flex items-center justify-center shrink-0">
                <Check className="w-4 h-4 stroke-[3]" />
              </div>
              <div>
                <div className="text-xs font-black text-amber-300">
                  {exportFeedback.title} Berhasil Diunduh
                </div>
                <div className="text-[11px] text-emerald-200 mt-0.5">
                  <span className="font-mono bg-white/10 px-1.5 py-0.5 rounded text-[10px]">
                    {exportFeedback.filename}
                  </span>{' '}
                  • {exportFeedback.count} pesanan • Total Omzet: {formatRupiah(exportFeedback.totalRev)}
                </div>
              </div>
            </div>
            <button
              onClick={() => setExportFeedback(null)}
              className="text-emerald-300 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Main Search & Customer Phone Filters Row */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5 pt-1">
          {/* General Search Input (ID / Name) */}
          <div className="md:col-span-5 relative">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-zinc-400" />
            <input
              id="input-order-search"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari ID Pesanan (#MJ-...), nama..."
              className="w-full text-xs font-medium pl-10 pr-8 py-2.5 rounded-xl border border-zinc-200 focus:outline-hidden focus:border-emerald-600 bg-zinc-50 focus:bg-white transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2.5 p-1 text-zinc-400 hover:text-zinc-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Customer Phone Filter Input */}
          <div className="md:col-span-4 relative">
            <Phone className="w-4 h-4 absolute left-3.5 top-3 text-emerald-700" />
            <input
              id="input-customer-phone-filter"
              type="text"
              value={phoneQuery}
              onChange={(e) => setPhoneQuery(e.target.value)}
              placeholder="Filter No. WhatsApp (08... / 62...)"
              className="w-full text-xs font-medium pl-10 pr-8 py-2.5 rounded-xl border border-zinc-200 focus:outline-hidden focus:border-emerald-600 bg-zinc-50 focus:bg-white transition-all"
            />
            {phoneQuery && (
              <button
                onClick={() => setPhoneQuery('')}
                className="absolute right-2.5 top-2.5 p-1 text-zinc-400 hover:text-zinc-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Order Type Filter Select */}
          <div className="md:col-span-3">
            <select
              id="select-order-type-filter"
              value={orderTypeFilter}
              onChange={(e) => setOrderTypeFilter(e.target.value)}
              className="w-full text-xs font-bold py-2.5 px-3 rounded-xl border border-zinc-200 focus:outline-hidden focus:border-emerald-600 bg-zinc-50 focus:bg-white text-zinc-700"
            >
              <option value="SEMUA">Semua Tipe Pesanan</option>
              <option value="DINE-IN">🍽️ Dine-In</option>
              <option value="TAKEAWAY">🛍️ Takeaway</option>
              <option value="KURIR">🛵 Kurir Delivery</option>
              <option value="RESERVASI">📅 Reservasi</option>
            </select>
          </div>
        </div>

        {/* Date Range Filter Bar */}
        <div className="bg-zinc-50/80 rounded-2xl p-3 border border-zinc-200/80 space-y-2.5">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2.5">
            {/* Quick Date Presets */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] font-bold text-zinc-500 mr-1 flex items-center gap-1">
                <CalendarDays className="w-3.5 h-3.5 text-zinc-400" />
                Periode:
              </span>
              {(
                [
                  { id: 'SEMUA', label: 'Semua Tanggal' },
                  { id: 'HARI_INI', label: 'Hari Ini' },
                  { id: 'KEMARIN', label: 'Kemarin' },
                  { id: '7_HARI', label: '7 Hari Terakhir' },
                  { id: 'BULAN_INI', label: 'Bulan Ini' },
                ] as const
              ).map((preset) => {
                const isActive = datePreset === preset.id;
                return (
                  <button
                    key={preset.id}
                    onClick={() => handleSelectDatePreset(preset.id)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                      isActive
                        ? 'bg-emerald-700 text-white shadow-xs'
                        : 'bg-white text-zinc-600 hover:bg-zinc-200 border border-zinc-200'
                    }`}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>

            {/* Custom Date Pickers (Dari - Sampai) */}
            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
              <div className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-xl border border-zinc-200">
                <span className="text-[11px] font-bold text-zinc-400">Dari:</span>
                <input
                  id="input-filter-start-date"
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    setDatePreset('KUSTOM');
                  }}
                  className="text-xs font-semibold text-zinc-700 bg-transparent focus:outline-hidden"
                />
              </div>

              <div className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-xl border border-zinc-200">
                <span className="text-[11px] font-bold text-zinc-400">Sampai:</span>
                <input
                  id="input-filter-end-date"
                  type="date"
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    setDatePreset('KUSTOM');
                  }}
                  className="text-xs font-semibold text-zinc-700 bg-transparent focus:outline-hidden"
                />
              </div>

              {(startDate || endDate) && (
                <button
                  onClick={() => {
                    setStartDate('');
                    setEndDate('');
                    setDatePreset('SEMUA');
                  }}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-200 transition-colors cursor-pointer"
                  title="Hapus filter rentang tanggal"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}

              {/* Quick Daily Report Button */}
              <button
                id="btn-quick-daily-csv-export"
                onClick={() => handleExportCSVWithScope('TODAY')}
                className="px-2.5 py-1 rounded-xl text-xs font-bold text-emerald-900 bg-emerald-100 hover:bg-emerald-200 transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer shadow-2xs"
                title="Download Laporan Transaksi Hari Ini untuk Rekap Closing"
              >
                <Download className="w-3.5 h-3.5 text-emerald-700" />
                <span className="hidden sm:inline">Laporan Hari Ini (CSV)</span>
                <span className="sm:hidden">Hari Ini</span>
              </button>
            </div>
          </div>
        </div>

        {/* Status Filter Tabs with Counts */}
        <div className="flex items-center gap-1.5 flex-wrap pt-1 border-t border-zinc-100">
          {filterTabs.map((tab) => {
            const count = getStatusCount(tab);
            const isTabActive = filter === tab;
            return (
              <button
                key={tab}
                id={`tab-filter-order-${tab.toLowerCase().replace(/\s+/g, '-')}`}
                onClick={() => setFilter(tab)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  isTabActive
                    ? 'bg-emerald-800 text-white shadow-xs'
                    : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                }`}
              >
                <span>{tab}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-md font-mono ${
                    isTabActive ? 'bg-emerald-950/40 text-emerald-100' : 'bg-zinc-200/80 text-zinc-600'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Stacked Order Cards */}
      <div className="space-y-3.5">
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center text-zinc-400 border border-zinc-200">
            <div className="text-4xl mb-2">📋</div>
            <p className="font-bold text-zinc-700">Tidak ada order yang cocok dengan filter</p>
            <p className="text-xs text-zinc-500 mt-1">Coba ganti kata kunci pencarian atau tab filter status.</p>
          </div>
        ) : (
          filteredOrders.map((order) => {
            const statusInfo = getOrderStatusLabel(order.orderStatus, order.orderType);
            const typeBadge = getOrderTypeBadge(order.orderType);
            const paymentInfo = getPaymentMethodLabel(order.paymentMethod);
            const custName = order.customer?.name || 'Pelanggan';
            const custPhone = order.customer?.phone || '';
            const waMsg = `Halo Kak ${custName}, terkait pesanan #${order.id} di MiJUS Go Healthy...`;
            const waUrl = getWhatsAppUrl(custPhone, waMsg);
            const isActionMenuOpen = openActionMenuId === order.id;

            return (
              <div
                key={order.id}
                className="bg-white rounded-3xl p-4 sm:p-5 border border-zinc-200 hover:border-emerald-300 shadow-sm transition-all space-y-3.5"
              >
                {/* 1. Header: ID, Badges, Status, and Dropdown */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono font-black text-sm text-emerald-950 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100">
                      #{order.id}
                    </span>

                    <span
                      className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md flex items-center gap-1 ${typeBadge.bg} ${typeBadge.text}`}
                    >
                      <span>{typeBadge.icon}</span>
                      <span>{typeBadge.label}</span>
                    </span>

                    <span
                      className={`text-[11px] font-black px-2.5 py-0.5 rounded-xl border ${statusInfo.bg} ${statusInfo.color} ${statusInfo.border}`}
                    >
                      {statusInfo.label}
                    </span>
                  </div>

                  {/* Top Right Action Menu */}
                  <div className="relative shrink-0">
                    <button
                      onClick={() => setOpenActionMenuId(isActionMenuOpen ? null : order.id)}
                      className="p-1.5 rounded-xl hover:bg-zinc-100 text-zinc-600 transition-colors"
                      title="Menu Lainnya"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    {/* Popover Dropdown */}
                    {isActionMenuOpen && (
                      <>
                        <div
                          className="fixed inset-0 z-20"
                          onClick={() => setOpenActionMenuId(null)}
                        />
                        <div className="absolute right-0 top-8 z-30 w-48 bg-white rounded-2xl shadow-xl border border-zinc-200 py-1.5 text-xs">
                          <button
                            onClick={() => {
                              setSelectedOrder(order);
                              setOpenActionMenuId(null);
                            }}
                            className="w-full px-3.5 py-2 text-left hover:bg-zinc-50 flex items-center gap-2 text-zinc-700 font-bold"
                          >
                            <Eye className="w-3.5 h-3.5 text-zinc-500" />
                            <span>Lihat Detail Lengkap</span>
                          </button>

                          <a
                            href={waUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => setOpenActionMenuId(null)}
                            className="w-full px-3.5 py-2 text-left hover:bg-zinc-50 flex items-center gap-2 text-emerald-800 font-bold"
                          >
                            <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Chat WhatsApp Customer</span>
                          </a>

                          {order.orderStatus === 'SELESAI' && (
                            <button
                              onClick={() => {
                                setReviewModalOrder(order);
                                setOpenActionMenuId(null);
                              }}
                              className="w-full px-3.5 py-2 text-left hover:bg-zinc-50 flex items-center gap-2 text-amber-700 font-bold"
                            >
                              <Star className="w-3.5 h-3.5 text-amber-500" />
                              <span>Kirim Link Review</span>
                            </button>
                          )}

                          {order.orderStatus !== 'SELESAI' && order.orderStatus !== 'DIBATALKAN' && (
                            <button
                              onClick={() => {
                                setShowCancelModal(order);
                                setOpenActionMenuId(null);
                              }}
                              className="w-full px-3.5 py-2 text-left hover:bg-rose-50 flex items-center gap-2 text-rose-600 font-bold border-t border-zinc-100"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              <span>Batalkan Pesanan</span>
                            </button>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* 2. Customer Info & Context */}
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-zinc-600">
                  <div className="font-extrabold text-zinc-900">
                    {custName} <span className="font-mono text-zinc-500 font-normal">({custPhone || '-'})</span>
                  </div>

                  {order.customer?.tableNumber && (
                    <span className="bg-zinc-100 text-zinc-800 px-2 py-0.5 rounded-md font-bold text-[11px] flex items-center gap-1">
                      <Utensils className="w-3 h-3 text-zinc-500" />
                      <span>Meja {order.customer.tableNumber}</span>
                    </span>
                  )}

                  {order.customer?.pickupTime && (
                    <span className="bg-amber-100 text-amber-900 px-2 py-0.5 rounded-md font-bold text-[10px]">
                      Ambil Jam: {order.customer.pickupTime}
                    </span>
                  )}

                  {order.customer?.address && (
                    <span className="bg-blue-50 text-blue-900 px-2 py-0.5 rounded-md text-[11px] flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-blue-600" />
                      <span className="truncate max-w-[200px]">{order.customer.address}</span>
                    </span>
                  )}

                  {order.attachment && (
                    <span className="bg-emerald-100 text-emerald-900 border border-emerald-300 px-2 py-0.5 rounded-md font-bold text-[10px] flex items-center gap-1">
                      <Paperclip className="w-3 h-3 text-emerald-700" />
                      <span>Lampiran Cloud</span>
                    </span>
                  )}

                  <span className="text-[11px] text-zinc-400 ml-auto">
                    {formatDateTime(order.createdAt)}
                  </span>
                </div>

                {/* 3. Items Summary */}
                <div className="bg-zinc-50 p-2.5 rounded-2xl border border-zinc-100 text-xs">
                  <div className="text-zinc-700 leading-relaxed">
                    {(order.items || []).map((it, idx) => (
                      <span key={it.cartItemId || idx} className="inline-block mr-2 font-medium">
                        <strong className="text-zinc-900">{it.quantity || 1}×</strong> {it.product?.name || (it as any).name || 'Menu'}
                        {it.product?.hasSizes ? ` (${it.size})` : ''}
                        {it.selectedAddOns && it.selectedAddOns.length > 0 ? ` (+${it.selectedAddOns.map(a => a.name).join(', ')})` : ''}
                        {idx < (order.items || []).length - 1 ? ' • ' : ''}
                      </span>
                    ))}
                  </div>
                </div>

                {/* 4. Bottom Footer: Total, Payment Status & Action Buttons */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-zinc-100">
                  {/* Total & Payment Badge */}
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-[10px] text-zinc-500 font-bold uppercase">
                        Total ({paymentInfo.label}):
                      </span>
                      <span className="font-black text-base text-emerald-950">
                        {formatRupiah(order.total)}
                      </span>
                    </div>

                    <div className="text-[11px] font-bold mt-0.5">
                      {order.paymentStatus === 'TERVERIFIKASI' ? (
                        <span className="text-emerald-700 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Lunas Terverifikasi</span>
                        </span>
                      ) : (
                        <span className="text-amber-700 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          <span>Menunggu Verifikasi</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Primary & Secondary Action Buttons */}
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Primary Button: Teruskan ke Crew */}
                    {order.orderStatus !== 'DIBATALKAN' && (
                      <button
                        onClick={() => setForwardModalOrder(order)}
                        className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs rounded-xl shadow-xs active:scale-95 transition-all flex items-center gap-1.5"
                        title="Teruskan tiket pesanan ke WhatsApp Crew Kitchen/Bar"
                      >
                        <ChefHat className="w-3.5 h-3.5" />
                        <span>Teruskan ke Crew</span>
                      </button>
                    )}

                    {/* Secondary Action: Next Logical Status Transition */}
                    {order.paymentStatus === 'MENUNGGU_VERIFIKASI' && order.orderStatus !== 'DIBATALKAN' && (
                      <button
                        onClick={() => handleVerifyPayment(order.id)}
                        className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs active:scale-95 transition-all"
                      >
                        ✓ Verifikasi Bayar
                      </button>
                    )}

                    {(order.orderStatus === 'PESANAN_DIBUAT' || order.orderStatus === 'PEMBAYARAN_DIVERIFIKASI') && (
                      <button
                        onClick={() => handleUpdateStatus(order.id, 'SEDANG_DIPROSES')}
                        className="px-3 py-2 bg-zinc-800 hover:bg-zinc-900 text-white font-bold text-xs rounded-xl shadow-xs active:scale-95 transition-all"
                      >
                        Mulai Proses
                      </button>
                    )}

                    {order.orderStatus === 'SEDANG_DIPROSES' && (
                      <button
                        onClick={() =>
                          handleUpdateStatus(
                            order.id,
                            order.orderType === 'KURIR' ? 'SEDANG_DIANTAR' : 'SIAP_DIAMBIL'
                          )
                        }
                        className="px-3 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-xs active:scale-95 transition-all"
                      >
                        Tandai Siap
                      </button>
                    )}

                    {(order.orderStatus === 'SIAP_DIAMBIL' || order.orderStatus === 'SEDANG_DIANTAR') && (
                      <button
                        onClick={() => handleUpdateStatus(order.id, 'SELESAI')}
                        className="px-3.5 py-2 bg-green-700 hover:bg-green-800 text-white font-black text-xs rounded-xl shadow-xs active:scale-95 transition-all"
                      >
                        Tandai Selesai 🥗
                      </button>
                    )}

                    {order.orderStatus === 'SELESAI' && (
                      <button
                        onClick={() => setReviewModalOrder(order)}
                        className={`px-3 py-2 font-bold text-xs rounded-xl flex items-center gap-1 transition-all ${
                          order.reviewedGoogle
                            ? 'bg-amber-100 text-amber-900 border border-amber-300'
                            : 'bg-amber-500 hover:bg-amber-600 text-white shadow-xs'
                        }`}
                      >
                        <Star className="w-3.5 h-3.5 fill-current" />
                        <span>{order.reviewedGoogle ? 'Review Terkirim' : 'Kirim Review'}</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 sm:p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <div>
                <span className="font-mono font-black text-base text-emerald-950">
                  #{selectedOrder.id}
                </span>
                <div className="text-[11px] text-zinc-500">
                  {formatDateTime(selectedOrder.createdAt)}
                </div>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="w-7 h-7 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-600 flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>

            {/* Customer Info Card */}
            <div className="bg-emerald-50 rounded-2xl p-3.5 border border-emerald-100 space-y-1.5">
              <div className="font-bold text-sm text-emerald-950 flex justify-between">
                <span>{selectedOrder.customer?.name || 'Pelanggan'}</span>
                <span className="font-mono text-emerald-800">{selectedOrder.customer?.phone || '-'}</span>
              </div>
              <div>Jenis Pesanan: <strong>{selectedOrder.orderType}</strong></div>
              {selectedOrder.customer?.tableNumber && (
                <div>Nomor Meja: <strong>{selectedOrder.customer.tableNumber}</strong></div>
              )}
              {selectedOrder.customer?.address && (
                <div>Alamat Kurir: {selectedOrder.customer.address}</div>
              )}
              {selectedOrder.customer?.addressNotes && (
                <div>Catatan Alamat: {selectedOrder.customer.addressNotes}</div>
              )}
            </div>

            {/* Items Breakdown */}
            <div>
              <h3 className="font-bold text-zinc-800 mb-2">Daftar Item Pesanan:</h3>
              <div className="space-y-2">
                {(selectedOrder.items || []).map((item) => (
                  <div
                    key={item.cartItemId}
                    className="p-2.5 bg-zinc-50 rounded-xl border border-zinc-200 flex justify-between items-start"
                  >
                    <div>
                      <div className="font-bold text-zinc-900">
                        {item.quantity || 1}x {item.product?.name || 'Menu'}
                        {item.product?.hasSizes ? ` (${item.size})` : ''}
                      </div>
                      {item.selectedAddOns && item.selectedAddOns.length > 0 && (
                        <div className="text-[10px] text-zinc-500">
                          + {item.selectedAddOns.map((a) => a?.name || '').filter(Boolean).join(', ')}
                        </div>
                      )}
                      {item.notes && (
                        <div className="text-[10px] text-zinc-500 italic">Note: {item.notes}</div>
                      )}
                    </div>
                    <span className="font-black text-zinc-900">
                      {formatRupiah(item.totalPrice)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* InsForge Cloud Storage Attachment Section */}
            <div className="p-3.5 bg-emerald-50/60 rounded-2xl border border-emerald-200/80 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-xs text-emerald-950 flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 text-emerald-700" />
                  <span>InsForge Storage - Lampiran Bukti</span>
                </span>
                {selectedOrder.attachment && (
                  <span className="text-[10px] font-bold text-emerald-800 bg-white px-2 py-0.5 rounded-full border border-emerald-200">
                    Tersimpan di Cloud
                  </span>
                )}
              </div>

              {selectedOrder.attachment ? (
                <div className="bg-white p-3 rounded-xl border border-emerald-200 space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      {isImageFile(selectedOrder.attachment.type, selectedOrder.attachment.name) ? (
                        <a
                          href={selectedOrder.attachment.url}
                          target="_blank"
                          rel="noreferrer"
                          className="w-14 h-14 rounded-lg overflow-hidden border border-emerald-200 shrink-0 block group relative"
                        >
                          <img
                            src={selectedOrder.attachment.url}
                            alt={selectedOrder.attachment.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        </a>
                      ) : (
                        <div className="w-14 h-14 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                          <FileText className="w-6 h-6" />
                        </div>
                      )}

                      <div className="min-w-0">
                        <div className="font-bold text-xs text-zinc-900 truncate">
                          {selectedOrder.attachment.name}
                        </div>
                        <div className="text-[11px] text-zinc-500 font-mono mt-0.5">
                          {formatFileSize(selectedOrder.attachment.size)} • {selectedOrder.attachment.bucket || 'mijus_attachments'}
                        </div>
                        <div className="text-[10px] text-zinc-400 font-mono truncate max-w-[220px]">
                          Key: {selectedOrder.attachment.key}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <a
                        href={selectedOrder.attachment.url}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                        title="Buka / Unduh File"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                </div>
              ) : null}

              {/* In-modal uploader to attach or replace file */}
              <div className="pt-1">
                <InsForgeFileUploader
                  category="PAYMENT_PROOF"
                  recordId={selectedOrder.id}
                  currentFile={selectedOrder.attachment}
                  onFileUploaded={(file) => {
                    const updated = attachFileToOrder(selectedOrder.id, file);
                    if (updated) setSelectedOrder(updated);
                  }}
                  onFileRemoved={() => {
                    const updated = attachFileToOrder(selectedOrder.id, undefined as any);
                    if (updated) setSelectedOrder(updated);
                  }}
                  label={selectedOrder.attachment ? 'Ganti Lampiran Bukti' : 'Unggah Bukti Bayar / Slip Transfer'}
                  compact
                />
              </div>
            </div>

            {/* Price Total */}
            <div className="pt-2 border-t border-zinc-100 space-y-1">
              <div className="flex justify-between text-zinc-500">
                <span>Subtotal</span>
                <span>{formatRupiah(selectedOrder.subtotal)}</span>
              </div>
              {selectedOrder.discount > 0 && (
                <div className="flex justify-between text-amber-700 font-bold">
                  <span>Diskon Loyalty</span>
                  <span>-{formatRupiah(selectedOrder.discount)}</span>
                </div>
              )}
              <div className="flex justify-between font-black text-base text-emerald-950 pt-1 border-t border-zinc-100">
                <span>Total Tagihan ({selectedOrder.paymentMethod})</span>
                <span>{formatRupiah(selectedOrder.total)}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-zinc-100 flex gap-2">
              <button
                onClick={() => setSelectedOrder(null)}
                className="w-full py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-bold rounded-xl"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Reason Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 max-w-sm w-full shadow-2xl border border-zinc-200 text-xs">
            <h3 className="font-extrabold text-base text-rose-700 mb-1">Batalkan Pesanan?</h3>
            <p className="text-zinc-500 mb-3">
              Order #{showCancelModal.id} ({showCancelModal.customer?.name || 'Pelanggan'}) akan dibatalkan.
            </p>

            <label className="block font-bold text-zinc-700 mb-1">
              Pilih / Tulis Alasan Pembatalan:
            </label>
            <select
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-zinc-300 mb-3 bg-white"
            >
              <option value="Bahan habis / stok tidak tersedia">Bahan habis / stok tidak tersedia</option>
              <option value="Customer membatalkan pesanan">Customer membatalkan pesanan</option>
              <option value="Jarak pengiriman kurir di luar jangkauan">Jarak pengiriman di luar jangkauan</option>
              <option value="Pembayaran tidak masuk / kadaluarsa">Pembayaran tidak masuk / kadaluarsa</option>
              <option value="Outlet sedang overcapacity / pesanan membludak">Outlet overcapacity</option>
            </select>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setShowCancelModal(null)}
                className="py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-bold rounded-xl"
              >
                Kembali
              </button>
              <button
                onClick={handleConfirmCancel}
                className="py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-md"
              >
                Ya, Batalkan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Google Review Trigger Modal */}
      <GoogleReviewModal
        order={reviewModalOrder}
        isOpen={Boolean(reviewModalOrder)}
        onClose={() => setReviewModalOrder(null)}
      />

      {/* Forward to Crew WhatsApp Modal */}
      {forwardModalOrder && (
        <ForwardToCrewModal
          order={forwardModalOrder}
          onClose={() => setForwardModalOrder(null)}
        />
      )}
    </div>
  );
};

