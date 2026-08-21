import React, { useState } from 'react';
import {
  CartItem,
  OrderType,
  PaymentMethod,
  Order,
  CustomerLoyalty,
  AttachedFile,
} from '../../types';
import { APP_CONFIG } from '../../config/appConfig';
import { formatRupiah, generateOrderId } from '../../utils/formatters';
import {
  X,
  User,
  Phone,
  MapPin,
  Calendar,
  Clock,
  Users,
  CreditCard,
  QrCode,
  Banknote,
  CheckCircle2,
  Copy,
  Check,
  AlertCircle,
  Sparkles,
  ArrowRight,
  Info,
} from 'lucide-react';
import {
  createOrder,
  createReservation,
  getCustomerLoyalty,
  redeemLoyaltyReward,
} from '../../services/storeService';
import { InsForgeFileUploader } from '../common/InsForgeFileUploader';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onOrderSuccess: (order: Order) => void;
  defaultCustomer?: { phone: string; name: string };
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  items,
  onOrderSuccess,
  defaultCustomer,
}) => {
  if (!isOpen) return null;

  const [orderType, setOrderType] = useState<OrderType>('DINE-IN');
  const [name, setName] = useState(defaultCustomer?.name || 'Rian Saputra');
  const [phone, setPhone] = useState(defaultCustomer?.phone || '081298765432');
  const [tableNumber, setTableNumber] = useState('Meja 04');
  const [pickupTime, setPickupTime] = useState('15-20 Menit Lagi');
  const [address, setAddress] = useState('');
  const [addressNotes, setAddressNotes] = useState('');

  // Reservation specific
  const [reservationDate, setReservationDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [reservationTime, setReservationTime] = useState('18:30');
  const [guestCount, setGuestCount] = useState(4);
  const [eventType, setEventType] = useState('Makan bersama');
  const [reservationNotes, setReservationNotes] = useState('');

  // Payment
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('QRIS');
  const [copiedBank, setCopiedBank] = useState<string | null>(null);
  const [uploadedProof, setUploadedProof] = useState<AttachedFile | null>(null);

  // Loyalty reward use
  const customerLoyalty: CustomerLoyalty | null = getCustomerLoyalty(phone);
  const hasReward = customerLoyalty && customerLoyalty.rewardsAvailable > 0;
  const [useRewardVoucher, setUseRewardVoucher] = useState(false);

  // Validation errors
  const [errorMsg, setErrorMsg] = useState('');
  const [conflictWarning, setConflictWarning] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
  const rewardDiscount = useRewardVoucher && hasReward ? 25000 : 0; // Value of Free Salad approx
  const total = Math.max(0, subtotal - rewardDiscount);

  const copyToClipboard = (text: string, bank: string) => {
    navigator.clipboard.writeText(text);
    setCopiedBank(bank);
    setTimeout(() => setCopiedBank(null), 2000);
  };

  const handleProcessOrder = () => {
    setErrorMsg('');
    setConflictWarning(null);

    // Basic Validation
    if (!name.trim()) {
      setErrorMsg('Nama pemesan wajib diisi.');
      return;
    }
    if (!phone.trim() || phone.trim().length < 8) {
      setErrorMsg('Nomor WhatsApp diperlukan untuk konfirmasi pesanan.');
      return;
    }

    if (orderType === 'KURIR' && !address.trim()) {
      setErrorMsg('Mohon masukkan alamat lengkap pengiriman kurir.');
      return;
    }

    if (orderType === 'RESERVASI') {
      if (!reservationDate || !reservationTime) {
        setErrorMsg('Mohon lengkapi tanggal dan jam reservasi.');
        return;
      }
      if (guestCount < 1) {
        setErrorMsg('Jumlah tamu minimal 1 orang.');
        return;
      }
    }

    setIsSubmitting(true);

    try {
      // If order is a reservation, register in reservation store as well
      if (orderType === 'RESERVASI') {
        const preOrderItems = items.map((i) => ({
          productName: `${i.product.name}${i.product.hasSizes ? ` (${i.size})` : ''}`,
          quantity: i.quantity,
        }));

        const resCheck = createReservation({
          name: name.trim(),
          phone: phone.trim(),
          date: reservationDate,
          time: reservationTime,
          guestCount,
          eventType,
          notes: reservationNotes.trim(),
          preOrderItems,
        });

        if (resCheck.conflict && resCheck.conflictMessage) {
          setConflictWarning(resCheck.conflictMessage);
        }
      }

      // If user claimed a reward voucher
      if (useRewardVoucher && hasReward) {
        redeemLoyaltyReward(phone.trim());
      }

      // Create Order
      const newOrder = createOrder({
        id: generateOrderId(),
        customer: {
          name: name.trim(),
          phone: phone.trim(),
          address: address.trim(),
          addressNotes: addressNotes.trim(),
          tableNumber: orderType === 'DINE-IN' ? tableNumber : undefined,
          pickupTime: orderType === 'TAKEAWAY' ? pickupTime : undefined,
          reservationDate: orderType === 'RESERVASI' ? reservationDate : undefined,
          reservationTime: orderType === 'RESERVASI' ? reservationTime : undefined,
          guestCount: orderType === 'RESERVASI' ? guestCount : undefined,
          eventType: orderType === 'RESERVASI' ? eventType : undefined,
          reservationNotes: orderType === 'RESERVASI' ? reservationNotes : undefined,
        },
        orderType,
        items,
        subtotal,
        discount: rewardDiscount,
        deliveryFeeNote:
          orderType === 'KURIR'
            ? 'Ongkir akan dikonfirmasi oleh admin via WhatsApp.'
            : undefined,
        total,
        paymentMethod,
        attachment: uploadedProof || undefined,
        attachments: uploadedProof ? [uploadedProof] : undefined,
        receiptUrl: uploadedProof?.url || undefined,
      });

      setIsSubmitting(false);
      onClose();
      onOrderSuccess(newOrder);
    } catch {
      setIsSubmitting(false);
      setErrorMsg('Gagal memproses pesanan. Silakan coba lagi.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-t-[32px] sm:rounded-[32px] max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-bottom-6 duration-300">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-100 flex items-center justify-between bg-white shrink-0">
          <div>
            <h2 className="font-black text-lg text-zinc-900 leading-tight">
              Checkout Pesanan
            </h2>
            <p className="text-xs text-zinc-500 font-medium">
              Lengkapi data untuk proses pesananmu
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-zinc-100 hover:bg-zinc-200 active:scale-95 text-zinc-600 flex items-center justify-center transition-all"
            aria-label="Tutup Checkout"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-5 text-zinc-800 flex-1">
          {/* Order Type Tabs */}
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-emerald-950 mb-2">
              1. Pilih Jenis Pesanan <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-4 gap-1.5 p-1 bg-zinc-100 rounded-2xl border border-zinc-200">
              {(['DINE-IN', 'TAKEAWAY', 'KURIR', 'RESERVASI'] as OrderType[]).map((type) => {
                const isActive = orderType === type;
                const labels: Record<OrderType, { title: string; icon: string }> = {
                  'DINE-IN': { title: 'Dine-In', icon: '🍽️' },
                  'TAKEAWAY': { title: 'Takeaway', icon: '🛍️' },
                  'KURIR': { title: 'Kurir', icon: '🛵' },
                  'RESERVASI': { title: 'Reservasi', icon: '📅' },
                };

                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setOrderType(type)}
                    className={`py-2.5 px-1 rounded-xl text-center transition-all ${
                      isActive
                        ? 'bg-emerald-600 text-white font-extrabold shadow-md scale-[1.02]'
                        : 'text-zinc-600 hover:text-zinc-900 font-bold hover:bg-white/60'
                    }`}
                  >
                    <div className="text-base">{labels[type].icon}</div>
                    <div className="text-[11px] mt-0.5 leading-tight">{labels[type].title}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Customer Identitas */}
          <div className="space-y-3 bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100">
            <h3 className="text-xs font-black uppercase tracking-wider text-emerald-950 flex items-center gap-1.5">
              <User className="w-4 h-4 text-emerald-700" />
              <span>2. Informasi Pemesan</span>
            </h3>

            <div>
              <label className="block text-xs font-bold text-zinc-700 mb-1">
                Nama Lengkap <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Masukkan nama kamu"
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-zinc-200 bg-white focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-700 mb-1">
                Nomor WhatsApp <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Contoh: 081234567890"
                  className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-zinc-200 bg-white focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all font-medium"
                />
                <span className="absolute right-3 top-2.5 text-[10px] bg-emerald-100 text-emerald-900 font-bold px-1.5 py-0.5 rounded-md">
                  Loyalty ID
                </span>
              </div>
              <p className="text-[10px] text-zinc-500 mt-1">
                Digunakan untuk konfirmasi pesanan & pengumpulan stamp otomatis.
              </p>
            </div>

            {/* DINE-IN Specific Fields */}
            {orderType === 'DINE-IN' && (
              <div className="p-3 bg-emerald-100/60 rounded-xl border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2">
                <span className="text-base">🍽️</span>
                <span>Pesanan akan disajikan untuk santap di outlet. Tim kami akan memanggil nama kamu saat pesanan siap.</span>
              </div>
            )}

            {/* TAKEAWAY Specific Fields */}
            {orderType === 'TAKEAWAY' && (
              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">
                  Estimasi Waktu Pengambilan
                </label>
                <select
                  value={pickupTime}
                  onChange={(e) => setPickupTime(e.target.value)}
                  className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-zinc-200 bg-white focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                >
                  <option value="15-20 Menit Lagi">15 - 20 Menit Lagi</option>
                  <option value="30 Menit Lagi">30 Menit Lagi</option>
                  <option value="45 Menit Lagi">45 Menit Lagi</option>
                  <option value="1 Jam Lagi">1 Jam Lagi</option>
                  <option value="Nanti Sore (16:00 WIB)">Nanti Sore (16:00 WIB)</option>
                  <option value="Nanti Malam (19:00 WIB)">Nanti Malam (19:00 WIB)</option>
                </select>
              </div>
            )}

            {/* KURIR Specific Fields */}
            {orderType === 'KURIR' && (
              <div className="space-y-2.5">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">
                    Alamat Lengkap Pengiriman <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Nama jalan, nomor rumah/kantor, RT/RW, kelurahan, kecamatan"
                    rows={2}
                    className="w-full text-xs sm:text-sm p-3 rounded-xl border border-zinc-200 bg-white focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 resize-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">
                    Catatan Alamat / Patokan (Opsional)
                  </label>
                  <input
                    type="text"
                    value={addressNotes}
                    onChange={(e) => setAddressNotes(e.target.value)}
                    placeholder="Contoh: Rumah pagar hitam samping minimarket / titip satpam"
                    className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-zinc-200 bg-white focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                  />
                </div>
                <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200/80 text-[11px] text-amber-900 flex items-start gap-2">
                  <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <span>
                    <strong>Catatan Kurir:</strong> Ongkir akan dihitung dan dikonfirmasi langsung oleh admin MiJUS via WhatsApp sesuai jarak tempuh alamatmu.
                  </span>
                </div>
              </div>
            )}

            {/* RESERVASI Specific Fields */}
            {orderType === 'RESERVASI' && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-xs font-bold text-zinc-700 mb-1">
                      Tanggal Reservasi <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={reservationDate}
                      onChange={(e) => setReservationDate(e.target.value)}
                      className="w-full text-xs px-3 py-2.5 rounded-xl border border-zinc-200 bg-white focus:outline-hidden focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-700 mb-1">
                      Jam <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="time"
                      value={reservationTime}
                      onChange={(e) => setReservationTime(e.target.value)}
                      className="w-full text-xs px-3 py-2.5 rounded-xl border border-zinc-200 bg-white focus:outline-hidden focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-xs font-bold text-zinc-700 mb-1">
                      Jumlah Orang (Pax) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="40"
                      value={guestCount}
                      onChange={(e) => setGuestCount(parseInt(e.target.value) || 1)}
                      className="w-full text-xs px-3 py-2.5 rounded-xl border border-zinc-200 bg-white focus:outline-hidden focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-700 mb-1">
                      Jenis Kegiatan <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={eventType}
                      onChange={(e) => setEventType(e.target.value)}
                      className="w-full text-xs px-3 py-2.5 rounded-xl border border-zinc-200 bg-white focus:outline-hidden focus:border-emerald-500"
                    >
                      <option value="Makan bersama">Makan Bersama</option>
                      <option value="Meeting Tim / Kantor">Meeting Tim / Kantor</option>
                      <option value="Ulang tahun / Syukuran">Ulang Tahun / Syukuran</option>
                      <option value="Gathering Komunitas">Gathering Komunitas</option>
                      <option value="Arisan / Reuni">Arisan / Reuni</option>
                      <option value="Lainnya">Lainnya</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">
                    Catatan Khusus Reservasi
                  </label>
                  <input
                    type="text"
                    value={reservationNotes}
                    onChange={(e) => setReservationNotes(e.target.value)}
                    placeholder="Contoh: Butuh proyektor / stopkontak / area smoking"
                    className="w-full text-xs px-3.5 py-2 rounded-xl border border-zinc-200 bg-white focus:outline-hidden focus:border-emerald-500"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Loyalty Reward Redemption Checkbox */}
          {hasReward && (
            <div className="p-3.5 bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl border border-amber-300 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">🎉</span>
                <div>
                  <div className="text-xs font-extrabold text-amber-950">
                    Kamu punya {customerLoyalty.rewardsAvailable} Reward FREE SALAD!
                  </div>
                  <div className="text-[11px] text-amber-800">
                    Potongan Rp 25.000 untuk pesanan ini
                  </div>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={useRewardVoucher}
                  onChange={(e) => setUseRewardVoucher(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-10 h-6 bg-zinc-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>
          )}

          {/* Payment Method Selection */}
          <div className="space-y-3">
            <label className="block text-xs font-black uppercase tracking-wider text-emerald-950">
              3. Metode Pembayaran <span className="text-rose-500">*</span>
            </label>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod('QRIS')}
                className={`p-3 rounded-2xl border text-center transition-all ${
                  paymentMethod === 'QRIS'
                    ? 'border-emerald-600 bg-emerald-50 ring-2 ring-emerald-500/20'
                    : 'border-zinc-200 hover:border-zinc-300 bg-white'
                }`}
              >
                <QrCode className="w-5 h-5 mx-auto text-emerald-700 mb-1" />
                <div className="font-extrabold text-xs text-zinc-900">QRIS</div>
                <div className="text-[10px] text-zinc-500">GoPay, OVO, dll</div>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('TRANSFER')}
                className={`p-3 rounded-2xl border text-center transition-all ${
                  paymentMethod === 'TRANSFER'
                    ? 'border-emerald-600 bg-emerald-50 ring-2 ring-emerald-500/20'
                    : 'border-zinc-200 hover:border-zinc-300 bg-white'
                }`}
              >
                <CreditCard className="w-5 h-5 mx-auto text-emerald-700 mb-1" />
                <div className="font-extrabold text-xs text-zinc-900">Transfer</div>
                <div className="text-[10px] text-zinc-500">BCA, Mandiri, BRI</div>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('CASH')}
                className={`p-3 rounded-2xl border text-center transition-all ${
                  paymentMethod === 'CASH'
                    ? 'border-emerald-600 bg-emerald-50 ring-2 ring-emerald-500/20'
                    : 'border-zinc-200 hover:border-zinc-300 bg-white'
                }`}
              >
                <Banknote className="w-5 h-5 mx-auto text-emerald-700 mb-1" />
                <div className="font-extrabold text-xs text-zinc-900">Tunai / Cash</div>
                <div className="text-[10px] text-zinc-500">Bayar di Outlet</div>
              </button>
            </div>

            {/* Payment Details Container */}
            {paymentMethod === 'QRIS' && (
              <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-200 text-center space-y-2.5">
                <div className="inline-block p-2 bg-white rounded-2xl border border-zinc-200 shadow-sm">
                  {/* QRIS SVG graphic */}
                  <svg className="w-36 h-36 mx-auto" viewBox="0 0 100 100" fill="currentColor">
                    <rect width="100" height="100" fill="white" />
                    {/* Corner 1 */}
                    <rect x="10" y="10" width="25" height="25" fill="#14532d" />
                    <rect x="15" y="15" width="15" height="15" fill="white" />
                    <rect x="18" y="18" width="9" height="9" fill="#14532d" />
                    {/* Corner 2 */}
                    <rect x="65" y="10" width="25" height="25" fill="#14532d" />
                    <rect x="70" y="15" width="15" height="15" fill="white" />
                    <rect x="73" y="18" width="9" height="9" fill="#14532d" />
                    {/* Corner 3 */}
                    <rect x="10" y="65" width="25" height="25" fill="#14532d" />
                    <rect x="15" y="70" width="15" height="15" fill="white" />
                    <rect x="18" y="73" width="9" height="9" fill="#14532d" />
                    {/* Random patterns */}
                    <rect x="42" y="12" width="6" height="6" fill="#14532d" />
                    <rect x="52" y="18" width="6" height="6" fill="#14532d" />
                    <rect x="42" y="28" width="8" height="8" fill="#14532d" />
                    <rect x="12" y="42" width="6" height="6" fill="#14532d" />
                    <rect x="25" y="48" width="8" height="8" fill="#14532d" />
                    <rect x="42" y="42" width="16" height="16" fill="#14532d" />
                    <rect x="46" y="46" width="8" height="8" fill="white" />
                    <rect x="68" y="42" width="6" height="8" fill="#14532d" />
                    <rect x="78" y="52" width="8" height="6" fill="#14532d" />
                    <rect x="42" y="68" width="8" height="8" fill="#14532d" />
                    <rect x="56" y="72" width="8" height="6" fill="#14532d" />
                    <rect x="72" y="72" width="14" height="14" fill="#14532d" />
                  </svg>
                </div>
                <div className="text-xs font-bold text-zinc-800">
                  NMID: {APP_CONFIG.qrisConfig.nmid}
                </div>
                <p className="text-[11px] text-zinc-500">
                  {APP_CONFIG.qrisConfig.tip}
                </p>
                <div className="text-[10px] text-amber-700 bg-amber-50 p-2 rounded-xl font-medium border border-amber-200">
                  Status awal: <strong>Menunggu Verifikasi</strong>. Pembayaran akan dicek & diverifikasi oleh Admin.
                </div>
              </div>
            )}

            {paymentMethod === 'TRANSFER' && (
              <div className="p-3.5 bg-zinc-50 rounded-2xl border border-zinc-200 space-y-2.5">
                <div className="text-xs font-bold text-zinc-800 mb-1">
                  Pilih Rekening Tujuan Transfer:
                </div>
                {APP_CONFIG.bankAccounts.map((b) => (
                  <div
                    key={b.bank}
                    className="p-2.5 bg-white rounded-xl border border-zinc-200 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-extrabold text-emerald-950 flex items-center gap-1.5">
                        <span>{b.icon}</span>
                        <span>Bank {b.bank}</span>
                      </div>
                      <div className="font-mono font-bold text-zinc-800 text-sm mt-0.5">
                        {b.accountNumber}
                      </div>
                      <div className="text-[10px] text-zinc-500">a.n {b.accountHolder}</div>
                    </div>

                    <button
                      type="button"
                      onClick={() => copyToClipboard(b.accountNumber.replace(/[^0-9]/g, ''), b.bank)}
                      className="px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center gap-1 transition-colors"
                    >
                      {copiedBank === b.bank ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Tersalin</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Salin</span>
                        </>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            )}

            {paymentMethod === 'CASH' && (
              <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-900">
                <div className="font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                  <span>Bayar Langsung di Outlet / Kasir</span>
                </div>
                <p className="text-[11px] text-emerald-800 mt-1 leading-relaxed">
                  Silakan tunjukkan nomor pesanan kamu ke barista / kasir MiJUS saat pesanan siap atau saat makan di tempat.
                </p>
              </div>
            )}
          </div>

          {/* Section 4: File Upload / Bukti Pembayaran */}
          <div className="p-4 bg-zinc-50/80 rounded-2xl border border-zinc-200/80 space-y-2">
            <InsForgeFileUploader
              category="PAYMENT_PROOF"
              currentFile={uploadedProof}
              onFileUploaded={(file) => setUploadedProof(file)}
              onFileRemoved={() => setUploadedProof(null)}
              label="4. Lampiran Bukti Transfer / QRIS (Opsional)"
              description="Unggah screenshot struk pembayaran untuk verifikasi cepat oleh kasir"
            />
          </div>

          {/* Error / Conflict Alert */}
          {errorMsg && (
            <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2 animate-shake">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {conflictWarning && (
            <div className="p-3 rounded-2xl bg-amber-50 border border-amber-300 text-xs text-amber-900 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>{conflictWarning}</span>
            </div>
          )}
        </div>

        {/* Order Summary & Confirm Button */}
        <div className="p-4 sm:p-5 bg-white border-t border-zinc-100 shadow-xl space-y-3 shrink-0">
          <div className="space-y-1.5 text-xs text-zinc-600">
            <div className="flex justify-between">
              <span>Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} menu)</span>
              <span className="font-bold text-zinc-900">{formatRupiah(subtotal)}</span>
            </div>
            {rewardDiscount > 0 && (
              <div className="flex justify-between text-amber-700 font-bold">
                <span>Voucher Loyalty (Free Salad)</span>
                <span>-{formatRupiah(rewardDiscount)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm font-black text-emerald-950 pt-1 border-t border-zinc-100">
              <span>Total Pembayaran</span>
              <span className="text-base text-emerald-800">{formatRupiah(total)}</span>
            </div>
          </div>

          <button
            onClick={handleProcessOrder}
            disabled={isSubmitting}
            className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] disabled:opacity-50 text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all"
          >
            {isSubmitting ? (
              <span>Memproses Pesanan...</span>
            ) : (
              <>
                <span>Konfirmasi & Buat Pesanan</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
