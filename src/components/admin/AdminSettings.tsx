import React, { useState, useEffect } from 'react';
import { APP_CONFIG, saveAppConfig } from '../../config/appConfig';
import { AdminCrewManagement } from './AdminCrewManagement';
import {
  pushAllToInsForge,
  syncFromInsForge,
  getProducts,
  getOrders,
  getReservations,
  getLoyalties,
  InsForgeSyncResult,
} from '../../services/storeService';
import {
  getAllUploads,
  formatFileSize,
  isImageFile,
  attachFileToOrder,
  attachImageToProduct,
  attachFileToReservation,
  removeUploadRecord,
} from '../../services/storageService';
import { InsForgeFileUploader } from '../common/InsForgeFileUploader';
import { AttachedFile, FileUploadCategory } from '../../types';
import {
  Settings,
  Store,
  Clock,
  MapPin,
  Phone,
  CreditCard,
  Award,
  Star,
  Users,
  Check,
  Save,
  MessageCircle,
  ShieldCheck,
  ExternalLink,
  Database,
  RefreshCw,
  Server,
  Cloud,
  CheckCircle2,
  AlertCircle,
  Layers,
  ShoppingBag,
  Calendar,
  FolderOpen,
  Paperclip,
  UploadCloud,
  Trash2,
  Copy,
  Eye,
  FileText,
} from 'lucide-react';

export const AdminSettings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'INSFORGE' | 'STORAGE' | 'CREW_GROUPS' | 'OUTLET' | 'LOYALTY'>('INSFORGE');

  const [adminPhone, setAdminPhone] = useState(APP_CONFIG.adminWhatsApp);
  const [googleReviewUrl, setGoogleReviewUrl] = useState(APP_CONFIG.googleReviewUrl);
  const [outletAddress, setOutletAddress] = useState(APP_CONFIG.outletAddress);
  const [operatingHours, setOperatingHours] = useState(APP_CONFIG.operatingHours);
  const [saved, setSaved] = useState(false);

  // InsForge Sync States
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<InsForgeSyncResult | null>(null);
  const [syncActionType, setSyncActionType] = useState<'push' | 'pull' | null>(null);
  const [lastSyncTime, setLastSyncTime] = useState<string>('Baru saja');
  const [localCounts, setLocalCounts] = useState({
    products: 0,
    orders: 0,
    reservations: 0,
    loyalties: 0,
  });

  // Storage tab states
  const [uploads, setUploads] = useState<AttachedFile[]>([]);
  const [storageCategory, setStorageCategory] = useState<FileUploadCategory>('PAYMENT_PROOF');
  const [targetRecordType, setTargetRecordType] = useState<'NONE' | 'ORDER' | 'PRODUCT' | 'RESERVATION'>('NONE');
  const [targetRecordId, setTargetRecordId] = useState<string>('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<AttachedFile | null>(null);

  const reloadUploads = () => {
    setUploads(getAllUploads());
  };

  useEffect(() => {
    setLocalCounts({
      products: getProducts().length,
      orders: getOrders().length,
      reservations: getReservations().length,
      loyalties: Object.keys(getLoyalties()).length,
    });
    reloadUploads();
  }, []);

  const handlePushAllToInsForge = async () => {
    setIsSyncing(true);
    setSyncActionType('push');
    try {
      const res = await pushAllToInsForge();
      setSyncStatus(res);
      setLastSyncTime(new Date().toLocaleTimeString('id-ID'));
      setLocalCounts({
        products: getProducts().length,
        orders: getOrders().length,
        reservations: getReservations().length,
        loyalties: Object.keys(getLoyalties()).length,
      });
    } catch (err: any) {
      setSyncStatus({
        success: false,
        productsCount: 0,
        ordersCount: 0,
        reservationsCount: 0,
        loyaltiesCount: 0,
        timestamp: new Date().toLocaleTimeString('id-ID'),
        error: err?.message || 'Gagal sinkronisasi',
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const handlePullFromInsForge = async () => {
    setIsSyncing(true);
    setSyncActionType('pull');
    try {
      await syncFromInsForge();
      const p = getProducts().length;
      const o = getOrders().length;
      const r = getReservations().length;
      const l = Object.keys(getLoyalties()).length;
      setLocalCounts({ products: p, orders: o, reservations: r, loyalties: l });
      setLastSyncTime(new Date().toLocaleTimeString('id-ID'));
      setSyncStatus({
        success: true,
        productsCount: p,
        ordersCount: o,
        reservationsCount: r,
        loyaltiesCount: l,
        timestamp: new Date().toLocaleTimeString('id-ID'),
      });
    } catch (err: any) {
      setSyncStatus({
        success: false,
        productsCount: 0,
        ordersCount: 0,
        reservationsCount: 0,
        loyaltiesCount: 0,
        timestamp: new Date().toLocaleTimeString('id-ID'),
        error: err?.message || 'Gagal menarik data',
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveAppConfig({
      adminWhatsApp: adminPhone,
      adminWhatsAppDisplay: adminPhone.startsWith('62') ? `+${adminPhone}` : adminPhone,
      googleReviewUrl,
      googleReviewURL: googleReviewUrl,
      outletAddress,
      operatingHours,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-6 pb-12 text-zinc-800">
      {/* Header */}
      <div className="bg-white rounded-3xl p-5 border border-zinc-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-emerald-100 text-emerald-900 text-[10px] font-black uppercase px-2 py-0.5 rounded-md">
              PENGATURAN OUTLET & BACKEND
            </span>
          </div>
          <h2 className="text-xl font-black text-zinc-900 mt-1">Pengaturan Sistem & InsForge Cloud BaaS</h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            Kelola sinkronisasi backend InsForge BaaS, WhatsApp Crew & Grup, CS Admin, dan informasi outlet.
          </p>
        </div>

        {/* Tab Pill Buttons */}
        <div className="flex items-center gap-1.5 bg-zinc-100 p-1.5 rounded-2xl shrink-0 overflow-x-auto">
          <button
            onClick={() => setActiveTab('INSFORGE')}
            className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'INSFORGE'
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>InsForge DB</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('STORAGE');
              reloadUploads();
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'STORAGE'
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            <FolderOpen className="w-3.5 h-3.5" />
            <span>InsForge Storage ({uploads.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('CREW_GROUPS')}
            className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'CREW_GROUPS'
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>WhatsApp Crew</span>
          </button>

          <button
            onClick={() => setActiveTab('OUTLET')}
            className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'OUTLET'
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            <Store className="w-3.5 h-3.5" />
            <span>CS & Outlet</span>
          </button>

          <button
            onClick={() => setActiveTab('LOYALTY')}
            className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'LOYALTY'
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Loyalty Rules</span>
          </button>
        </div>
      </div>

      {/* TAB 0: INSFORGE BAAS MANAGEMENT */}
      {activeTab === 'INSFORGE' && (
        <div className="space-y-6">
          {/* Main Status & Sync Action Card */}
          <div className="bg-gradient-to-br from-emerald-950 via-emerald-900 to-zinc-900 text-white rounded-3xl p-6 shadow-xl border border-emerald-800 space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
              <div className="flex items-center gap-3.5">
                <div className="w-13 h-13 rounded-2xl bg-white/10 border border-white/20 p-2.5 flex items-center justify-center text-emerald-400 backdrop-blur-xs shadow-inner shrink-0">
                  <Database className="w-7 h-7" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      InsForge BaaS Connected
                    </span>
                    <span className="text-zinc-400 text-xs font-mono">mijusorder</span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-black mt-1">Postgres BaaS Cloud Database</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <a
                      href="https://qpmq42rd.ap-southeast.insforge.app"
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-emerald-200/90 hover:text-white underline font-mono flex items-center gap-1"
                    >
                      <span>https://qpmq42rd.ap-southeast.insforge.app</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2.5 flex-wrap">
                <button
                  onClick={handlePushAllToInsForge}
                  disabled={isSyncing}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-emerald-950/40 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${isSyncing && syncActionType === 'push' ? 'animate-spin' : ''}`} />
                  <span>{isSyncing && syncActionType === 'push' ? 'Menyinkronkan...' : '⚡ Push & Update Semua ke InsForge'}</span>
                </button>

                <button
                  onClick={handlePullFromInsForge}
                  disabled={isSyncing}
                  className="px-3.5 py-2.5 bg-white/10 hover:bg-white/20 active:scale-95 text-white font-extrabold text-xs rounded-xl border border-white/10 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                >
                  <Cloud className={`w-4 h-4 ${isSyncing && syncActionType === 'pull' ? 'animate-spin' : ''}`} />
                  <span>Tarik Data Terbaru</span>
                </button>
              </div>
            </div>

            {/* Quick Deployment & Link Reference */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 relative z-10 bg-black/20 p-4 rounded-2xl border border-emerald-700/50">
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-zinc-300 flex items-center gap-1.5">
                  <ExternalLink className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Live App Production URL:</span>
                </span>
                <div className="flex items-center gap-2">
                  <a
                    href="https://ais-pre-cfqw7j357lxi6ko7pb2rvw-266350912232.asia-southeast1.run.app"
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-white font-mono font-bold hover:underline truncate"
                  >
                    https://ais-pre-cfqw7j357lxi6ko7pb2rvw-266350912232.asia-southeast1.run.app
                  </a>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[11px] font-bold text-zinc-300 flex items-center gap-1.5">
                  <Server className="w-3.5 h-3.5 text-blue-400" />
                  <span>InsForge API Backend Endpoint:</span>
                </span>
                <div className="flex items-center gap-2">
                  <a
                    href="https://qpmq42rd.ap-southeast.insforge.app"
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-emerald-300 font-mono font-bold hover:underline truncate"
                  >
                    https://qpmq42rd.ap-southeast.insforge.app
                  </a>
                </div>
              </div>
            </div>

            {/* Sync Feedback Alert */}
            {syncStatus && (
              <div
                className={`p-4 rounded-2xl border text-xs flex items-start gap-3 animate-in fade-in duration-200 relative z-10 ${
                  syncStatus.success
                    ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-100'
                    : 'bg-rose-500/20 border-rose-500/40 text-rose-100'
                }`}
              >
                {syncStatus.success ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                )}
                <div className="space-y-0.5">
                  <h4 className="font-extrabold text-sm">
                    {syncStatus.success ? 'Sinkronisasi InsForge Berhasil Sempurna!' : 'Sinkronisasi Mengalami Kendala'}
                  </h4>
                  <p className="opacity-90">
                    {syncStatus.success
                      ? `Semua tabel telah sinkron: ${syncStatus.productsCount} Menu Produk, ${syncStatus.ordersCount} Pesanan, ${syncStatus.reservationsCount} Reservasi, dan ${syncStatus.loyaltiesCount} Data Loyalitas aktif pada pukul ${syncStatus.timestamp}.`
                      : syncStatus.error || 'Terjadi kesalahan jaringan saat memperbarui data ke InsForge.'}
                  </p>
                </div>
              </div>
            )}

            {/* Cloud Database Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 relative z-10">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 space-y-1">
                <div className="flex items-center justify-between text-zinc-400 text-xs">
                  <span>Tabel Menu (Products)</span>
                  <ShoppingBag className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-2xl font-black text-white">{localCounts.products}</div>
                <div className="text-[10px] text-emerald-400 font-bold">mijus_products • 100% Sync</div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 space-y-1">
                <div className="flex items-center justify-between text-zinc-400 text-xs">
                  <span>Tabel Pesanan (Orders)</span>
                  <Layers className="w-4 h-4 text-blue-400" />
                </div>
                <div className="text-2xl font-black text-white">{localCounts.orders}</div>
                <div className="text-[10px] text-blue-300 font-bold">mijus_orders • Realtime</div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 space-y-1">
                <div className="flex items-center justify-between text-zinc-400 text-xs">
                  <span>Tabel Reservasi (Bookings)</span>
                  <Calendar className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-2xl font-black text-white">{localCounts.reservations}</div>
                <div className="text-[10px] text-amber-300 font-bold">mijus_reservations • Terhubung</div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 space-y-1">
                <div className="flex items-center justify-between text-zinc-400 text-xs">
                  <span>Tabel Loyalty (Stamps)</span>
                  <Award className="w-4 h-4 text-purple-400" />
                </div>
                <div className="text-2xl font-black text-white">{localCounts.loyalties}</div>
                <div className="text-[10px] text-purple-300 font-bold">mijus_loyalties • Aktif</div>
              </div>
            </div>
          </div>

          {/* Table Details & Info Card */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-zinc-200 shadow-sm space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-sm text-zinc-900 flex items-center gap-2">
                <Server className="w-4 h-4 text-emerald-700" />
                <span>Daftar Tabel Database BaaS InsForge</span>
              </h3>
              <span className="text-xs text-zinc-500 font-medium">Terakhir sinkron: {lastSyncTime}</span>
            </div>

            <div className="divide-y divide-zinc-100 text-xs">
              <div className="py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md">
                    public.mijus_products
                  </span>
                  <span className="text-zinc-600">Menyimpan 60 menu jus, makanan & snack, harga size, kalori, dan status ketersediaan.</span>
                </div>
                <span className="bg-emerald-100 text-emerald-900 font-bold px-2 py-0.5 rounded-full text-[10px]">Aktif</span>
              </div>

              <div className="py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-blue-800 bg-blue-50 px-2 py-0.5 rounded-md">
                    public.mijus_orders
                  </span>
                  <span className="text-zinc-600">Tiket pesanan masuk, customer details, status verifikasi, dan item transaksi.</span>
                </div>
                <span className="bg-emerald-100 text-emerald-900 font-bold px-2 py-0.5 rounded-full text-[10px]">Aktif</span>
              </div>

              <div className="py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md">
                    public.mijus_reservations
                  </span>
                  <span className="text-zinc-600">Daftar booking meja acara, jumlah tamu, tanggal, waktu, dan item pre-order.</span>
                </div>
                <span className="bg-emerald-100 text-emerald-900 font-bold px-2 py-0.5 rounded-full text-[10px]">Aktif</span>
              </div>

              <div className="py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-purple-800 bg-purple-50 px-2 py-0.5 rounded-md">
                    public.mijus_loyalties
                  </span>
                  <span className="text-zinc-600">Akumulasi digital stamps per nomor HP pelanggan dan voucher rewards gratis.</span>
                </div>
                <span className="bg-emerald-100 text-emerald-900 font-bold px-2 py-0.5 rounded-full text-[10px]">Aktif</span>
              </div>

              <div className="py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-rose-800 bg-rose-50 px-2 py-0.5 rounded-md">
                    public.mijus_reviews
                  </span>
                  <span className="text-zinc-600">Ulasan & rating bintang kepuasan pelanggan dari web & pesanan.</span>
                </div>
                <span className="bg-emerald-100 text-emerald-900 font-bold px-2 py-0.5 rounded-full text-[10px]">Aktif</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 0.5: INSFORGE STORAGE & ATTACHMENTS */}
      {activeTab === 'STORAGE' && (
        <div className="space-y-6">
          {/* Storage Connectivity & Statistics Card */}
          <div className="bg-gradient-to-br from-emerald-950 via-emerald-900 to-zinc-900 text-white rounded-3xl p-6 shadow-xl border border-emerald-800 space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border border-emerald-400/30">
                  <Cloud className="w-3.5 h-3.5" />
                  <span>InsForge Storage Bucket • mijus_attachments</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black">InsForge Cloud Object Storage</h3>
                <p className="text-xs text-zinc-300 max-w-xl">
                  Penyimpanan berkas cloud untuk bukti transfer pelanggan, foto katalog menu jus/makanan, struk pesanan, dan slip reservasi dengan presigned public URLs.
                </p>
              </div>

              <button
                type="button"
                onClick={reloadUploads}
                className="px-4 py-2.5 bg-emerald-700/80 hover:bg-emerald-600 active:scale-95 text-white font-black text-xs rounded-2xl flex items-center gap-2 transition-all self-start sm:self-auto border border-emerald-500/40"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Segarkan Berkas ({uploads.length})</span>
              </button>
            </div>

            {/* Storage Metric Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 relative z-10">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 space-y-1">
                <div className="flex items-center justify-between text-zinc-400 text-xs">
                  <span>Total Berkas Terunggah</span>
                  <FolderOpen className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-2xl font-black text-white">{uploads.length}</div>
                <div className="text-[10px] text-emerald-300 font-bold">Semua Kategori</div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 space-y-1">
                <div className="flex items-center justify-between text-zinc-400 text-xs">
                  <span>Bukti Pembayaran</span>
                  <Paperclip className="w-4 h-4 text-blue-400" />
                </div>
                <div className="text-2xl font-black text-white">
                  {uploads.filter((u) => u.category === 'PAYMENT_PROOF').length}
                </div>
                <div className="text-[10px] text-blue-300 font-bold">orders/{'{id}'}/proof</div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 space-y-1">
                <div className="flex items-center justify-between text-zinc-400 text-xs">
                  <span>Foto Menu & Produk</span>
                  <ShoppingBag className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-2xl font-black text-white">
                  {uploads.filter((u) => u.category === 'PRODUCT_IMAGE').length}
                </div>
                <div className="text-[10px] text-amber-300 font-bold">products/{'{id}'}/img</div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 space-y-1">
                <div className="flex items-center justify-between text-zinc-400 text-xs">
                  <span>Endpoint Storage</span>
                  <Server className="w-4 h-4 text-purple-400" />
                </div>
                <div className="text-xs font-mono font-bold text-white truncate">qpmq42rd.ap-southeast</div>
                <div className="text-[10px] text-purple-300 font-bold">insforge.storage API</div>
              </div>
            </div>
          </div>

          {/* Upload & Link File Tool */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-zinc-200 shadow-sm space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-sm text-zinc-900 flex items-center gap-2">
                  <UploadCloud className="w-4 h-4 text-emerald-700" />
                  <span>Unggah Berkas Baru ke InsForge Storage</span>
                </h3>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Unggah file baru dan sematkan (attach) langsung ke data Pesanan, Menu Produk, atau Slip Reservasi.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-zinc-50 p-4 rounded-2xl border border-zinc-200">
              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">
                  Kategori Berkas
                </label>
                <select
                  value={storageCategory}
                  onChange={(e) => setStorageCategory(e.target.value as FileUploadCategory)}
                  className="w-full text-xs p-2.5 rounded-xl border border-zinc-300 bg-white"
                >
                  <option value="PAYMENT_PROOF">Bukti Pembayaran / Struk (orders/)</option>
                  <option value="PRODUCT_IMAGE">Foto Katalog Menu (products/)</option>
                  <option value="RESERVATION_SLIP">Slip Reservasi Meja (reservations/)</option>
                  <option value="OTHER">Dokumen / Lainnya (general/)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">
                  Lampirkan ke Data (Opsional)
                </label>
                <select
                  value={targetRecordType}
                  onChange={(e) => {
                    setTargetRecordType(e.target.value as any);
                    setTargetRecordId('');
                  }}
                  className="w-full text-xs p-2.5 rounded-xl border border-zinc-300 bg-white"
                >
                  <option value="NONE">Hanya Simpan di Storage</option>
                  <option value="ORDER">Lampirkan ke Pesanan (Order ID)</option>
                  <option value="PRODUCT">Lampirkan ke Menu Produk (Product ID)</option>
                  <option value="RESERVATION">Lampirkan ke Reservasi (Reservation ID)</option>
                </select>
              </div>

              {targetRecordType !== 'NONE' && (
                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">
                    {targetRecordType === 'ORDER' && 'Pilih Nomor Pesanan:'}
                    {targetRecordType === 'PRODUCT' && 'Pilih Menu Produk:'}
                    {targetRecordType === 'RESERVATION' && 'Pilih Reservasi:'}
                  </label>
                  {targetRecordType === 'ORDER' && (
                    <select
                      value={targetRecordId}
                      onChange={(e) => setTargetRecordId(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-xl border border-zinc-300 bg-white"
                    >
                      <option value="">-- Pilih Pesanan --</option>
                      {getOrders().map((o) => (
                        <option key={o.id} value={o.id}>
                          #{o.id} - {o.customer?.name} ({o.orderStatus})
                        </option>
                      ))}
                    </select>
                  )}
                  {targetRecordType === 'PRODUCT' && (
                    <select
                      value={targetRecordId}
                      onChange={(e) => setTargetRecordId(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-xl border border-zinc-300 bg-white"
                    >
                      <option value="">-- Pilih Produk --</option>
                      {getProducts().map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.category})
                        </option>
                      ))}
                    </select>
                  )}
                  {targetRecordType === 'RESERVATION' && (
                    <select
                      value={targetRecordId}
                      onChange={(e) => setTargetRecordId(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-xl border border-zinc-300 bg-white"
                    >
                      <option value="">-- Pilih Reservasi --</option>
                      {getReservations().map((r) => (
                        <option key={r.id} value={r.id}>
                          #{r.id} - {r.name} ({r.date})
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              )}
            </div>

            <InsForgeFileUploader
              category={storageCategory}
              recordId={targetRecordId || undefined}
              onFileUploaded={(file) => {
                if (targetRecordType === 'ORDER' && targetRecordId) {
                  attachFileToOrder(targetRecordId, file);
                } else if (targetRecordType === 'PRODUCT' && targetRecordId) {
                  attachImageToProduct(targetRecordId, file);
                } else if (targetRecordType === 'RESERVATION' && targetRecordId) {
                  attachFileToReservation(targetRecordId, file);
                }
                reloadUploads();
              }}
              label="Klik atau Tarik Berkas untuk Diunggah ke InsForge Storage"
              description="Mendukung gambar (PNG, JPG, WEBP), PDF, struk transfer, dan dokumen hingga 10MB"
            />
          </div>

          {/* Uploaded Files Registry Table */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-zinc-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-sm text-zinc-900 flex items-center gap-2">
                  <Database className="w-4 h-4 text-emerald-700" />
                  <span>Daftar Berkas Terunggah di InsForge Storage</span>
                </h3>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Menampilkan file yang tersimpan beserta URL publik, storage key, ukuran, dan relasi data.
                </p>
              </div>
            </div>

            {uploads.length === 0 ? (
              <div className="py-10 text-center text-zinc-400 space-y-2">
                <FolderOpen className="w-8 h-8 mx-auto text-zinc-300" />
                <p className="text-xs">Belum ada berkas terunggah di InsForge Storage.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-zinc-200 text-zinc-500 font-bold bg-zinc-50">
                      <th className="py-2.5 px-3 rounded-l-xl">Berkas & Preview</th>
                      <th className="py-2.5 px-3">Kategori</th>
                      <th className="py-2.5 px-3">Storage Key & Bucket</th>
                      <th className="py-2.5 px-3">Ukuran</th>
                      <th className="py-2.5 px-3">Waktu Unggah</th>
                      <th className="py-2.5 px-3 text-right rounded-r-xl">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {uploads.map((file) => (
                      <tr key={file.key} className="hover:bg-zinc-50/70 transition-colors">
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2.5">
                            {isImageFile(file.type, file.name) ? (
                              <button
                                type="button"
                                onClick={() => setPreviewImage(file)}
                                className="w-10 h-10 rounded-lg overflow-hidden border border-zinc-200 shrink-0 group relative"
                              >
                                <img
                                  src={file.url}
                                  alt={file.name}
                                  className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                                />
                              </button>
                            ) : (
                              <div className="w-10 h-10 rounded-lg bg-zinc-100 text-zinc-600 flex items-center justify-center shrink-0">
                                <FileText className="w-5 h-5" />
                              </div>
                            )}
                            <div className="min-w-0 max-w-[180px]">
                              <p className="font-bold text-zinc-900 truncate" title={file.name}>
                                {file.name}
                              </p>
                              <p className="text-[10px] text-zinc-400 truncate">
                                {file.type || 'file/attachment'}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-3">
                          <span
                            className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                              file.category === 'PAYMENT_PROOF'
                                ? 'bg-blue-50 text-blue-800 border border-blue-200'
                                : file.category === 'PRODUCT_IMAGE'
                                ? 'bg-amber-50 text-amber-800 border border-amber-200'
                                : file.category === 'RESERVATION_SLIP'
                                ? 'bg-purple-50 text-purple-800 border border-purple-200'
                                : 'bg-zinc-100 text-zinc-800'
                            }`}
                          >
                            {file.category === 'PAYMENT_PROOF'
                              ? 'Bukti Bayar'
                              : file.category === 'PRODUCT_IMAGE'
                              ? 'Foto Menu'
                              : file.category === 'RESERVATION_SLIP'
                              ? 'Slip Booking'
                              : 'Dokumen'}
                          </span>
                        </td>

                        <td className="py-3 px-3 font-mono text-[11px] text-zinc-600">
                          <div className="flex items-center gap-1.5">
                            <span className="truncate max-w-[200px]" title={file.key}>
                              {file.key}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText(file.key);
                                setCopiedKey(file.key);
                                setTimeout(() => setCopiedKey(null), 2000);
                              }}
                              className="p-1 hover:bg-zinc-200 rounded text-zinc-500"
                              title="Salin Key"
                            >
                              {copiedKey === file.key ? (
                                <Check className="w-3 h-3 text-emerald-600" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                          <span className="text-[10px] text-zinc-400">
                            Bucket: {file.bucket || 'mijus_attachments'}
                          </span>
                        </td>

                        <td className="py-3 px-3 font-mono text-zinc-600">
                          {formatFileSize(file.size)}
                        </td>

                        <td className="py-3 px-3 text-zinc-500 text-[11px]">
                          {new Date(file.uploadedAt).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>

                        <td className="py-3 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {isImageFile(file.type, file.name) && (
                              <button
                                type="button"
                                onClick={() => setPreviewImage(file)}
                                className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                                title="Lihat Pratinjau"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                            )}

                            <a
                              href={file.url}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1.5 rounded-lg bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
                              title="Buka / Unduh File Asli"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>

                            <button
                              type="button"
                              onClick={() => {
                                if (window.confirm(`Hapus berkas "${file.name}" dari riwayat penyimpanan?`)) {
                                  removeUploadRecord(file.key);
                                  reloadUploads();
                                }
                              }}
                              className="p-1.5 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100"
                              title="Hapus dari Riwayat"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Image Preview Modal */}
          {previewImage && (
            <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl space-y-3">
                <div className="p-4 border-b border-zinc-100 flex items-center justify-between">
                  <span className="font-extrabold text-sm text-zinc-900 truncate">
                    {previewImage.name}
                  </span>
                  <button
                    type="button"
                    onClick={() => setPreviewImage(null)}
                    className="w-7 h-7 rounded-full bg-zinc-100 text-zinc-600 flex items-center justify-center font-bold hover:bg-zinc-200"
                  >
                    ✕
                  </button>
                </div>
                <div className="p-4 flex items-center justify-center max-h-[70vh] bg-zinc-950">
                  <img
                    src={previewImage.url}
                    alt={previewImage.name}
                    className="max-h-[60vh] max-w-full object-contain rounded-lg"
                  />
                </div>
                <div className="p-4 bg-zinc-50 border-t border-zinc-100 flex items-center justify-between text-xs">
                  <span className="font-mono text-zinc-500">
                    Key: {previewImage.key} ({formatFileSize(previewImage.size)})
                  </span>
                  <a
                    href={previewImage.url}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center gap-1"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Buka File Asli</span>
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 1: CREW & ORDER GROUPS CRUD (Full CRUD Suite) */}
      {activeTab === 'CREW_GROUPS' && <AdminCrewManagement />}

      {/* TAB 2: CS ADMIN & OUTLET INFORMATION */}
      {activeTab === 'OUTLET' && (
        <form onSubmit={handleSave} className="space-y-5">
          {/* WhatsApp & Google Review Section */}
          <div className="bg-white rounded-3xl p-5 border border-zinc-200 shadow-sm space-y-4">
            <h3 className="font-extrabold text-sm text-zinc-900 flex items-center gap-2">
              <Phone className="w-4 h-4 text-emerald-700" />
              <span>Kontak WhatsApp CS Admin & Google Review</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">
                  Nomor WhatsApp CS Admin (Format 62xxxxxxxxxxx)
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={adminPhone}
                    onChange={(e) => setAdminPhone(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 text-xs font-mono font-bold rounded-xl border border-zinc-200 focus:outline-hidden focus:border-emerald-600"
                  />
                </div>
                <p className="text-[11px] text-zinc-500 mt-1">
                  Pesanan customer dan tombol 'Hubungi CS WhatsApp' otomatis diarahkan ke nomor ini.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">
                  URL Google Review
                </label>
                <div className="relative">
                  <Star className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="url"
                    value={googleReviewUrl}
                    onChange={(e) => setGoogleReviewUrl(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 text-xs font-medium rounded-xl border border-zinc-200 focus:outline-hidden focus:border-emerald-600"
                  />
                </div>
                <p className="text-[11px] text-zinc-500 mt-1">
                  Link Google Maps review yang dikirimkan ke pelanggan saat pesanan selesai.
                </p>
              </div>
            </div>
          </div>

          {/* Outlet Information Section */}
          <div className="bg-white rounded-3xl p-5 border border-zinc-200 shadow-sm space-y-4">
            <h3 className="font-extrabold text-sm text-zinc-900 flex items-center gap-2">
              <Store className="w-4 h-4 text-emerald-700" />
              <span>Informasi Outlet & Jam Buka</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">
                  Alamat Outlet Lengkap
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={outletAddress}
                    onChange={(e) => setOutletAddress(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 text-xs font-medium rounded-xl border border-zinc-200 focus:outline-hidden focus:border-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">
                  Jam Operasional
                </label>
                <div className="relative">
                  <Clock className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={operatingHours}
                    onChange={(e) => setOperatingHours(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 text-xs font-medium rounded-xl border border-zinc-200 focus:outline-hidden focus:border-emerald-600"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex items-center gap-3">
            <button
              type="submit"
              className="px-6 py-3 bg-emerald-700 hover:bg-emerald-800 active:scale-95 text-white font-extrabold text-xs rounded-2xl shadow-lg shadow-emerald-700/20 flex items-center gap-2 transition-all cursor-pointer"
            >
              {saved ? (
                <>
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Pengaturan Outlet Tersimpan!</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Simpan Pengaturan Outlet</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* TAB 3: LOYALTY RULES */}
      {activeTab === 'LOYALTY' && (
        <div className="bg-white rounded-3xl p-5 border border-zinc-200 shadow-sm space-y-4">
          <h3 className="font-extrabold text-sm text-zinc-900 flex items-center gap-2">
            <Award className="w-4 h-4 text-emerald-700" />
            <span>Aturan Program Loyalty MiJUS Digital Stamp</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-1">
              <div className="font-extrabold text-emerald-950 text-sm flex items-center gap-1.5">
                <span>⭐ Syarat Akumulasi Stamp</span>
              </div>
              <p className="text-emerald-900 leading-relaxed">
                Setiap 1 Transaksi senilai <strong>≥ Rp50.000</strong> berhak mendapatkan <strong>1 Stamp Digital</strong>. Stamp otomatis dikreditkan ke nomor telepon pelanggan begitu status pesanan diubah menjadi <strong>SELESAI</strong>.
              </p>
            </div>

            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 space-y-1">
              <div className="font-extrabold text-amber-950 text-sm flex items-center gap-1.5">
                <span>🎁 Reward 10 Stamp: Free Salad</span>
              </div>
              <p className="text-amber-900 leading-relaxed">
                Pelanggan yang mengumpulkan <strong>10 Stamps</strong> secara otomatis mendapatkan voucher reward <strong>FREE 1 SPECIAL SALAD</strong> yang dapat langsung diklaim pada pesanan berikutnya.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
