import { OrderStatus, OrderType, PaymentMethod } from '../types';
import { APP_CONFIG } from '../config/appConfig';

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function generateOrderId(): string {
  const randomNum = Math.floor(10000 + Math.random() * 90000);
  return `#MJ-${randomNum}`;
}

export function formatDateTime(isoString: string): string {
  try {
    const date = new Date(isoString);
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch {
    return isoString;
  }
}

export function formatDateOnly(isoString: string): string {
  try {
    const date = new Date(isoString);
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date);
  } catch {
    return isoString;
  }
}

export function formatDate(isoString: string): string {
  return formatDateOnly(isoString);
}

export function formatDateTimeIndo(isoString: string): string {
  return formatDateTime(isoString);
}

export function getReservationStatusLabel(status: string): { label: string; color: string; bg: string; border: string } {
  switch (status) {
    case 'MENUNGGU':
      return { label: 'Menunggu Konfirmasi', color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200' };
    case 'DITERIMA':
      return { label: 'Diterima / Meja Siap', color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200' };
    case 'SELESAI':
      return { label: 'Selesai', color: 'text-purple-700', bg: 'bg-purple-50', border: 'border-purple-200' };
    case 'DIBATALKAN':
      return { label: 'Dibatalkan', color: 'text-rose-700', bg: 'bg-rose-50', border: 'border-rose-200' };
    default:
      return { label: status, color: 'text-zinc-700', bg: 'bg-zinc-100', border: 'border-zinc-200' };
  }
}

export function getOrderStatusLabel(status: OrderStatus, orderType?: OrderType): { label: string; color: string; bg: string; border: string } {
  switch (status) {
    case 'PESANAN_DIBUAT':
      return { label: 'Pesanan Dibuat', color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200' };
    case 'MENUNGGU_VERIFIKASI':
      return { label: 'Menunggu Verifikasi', color: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-200' };
    case 'PEMBAYARAN_DIVERIFIKASI':
      return { label: 'Pembayaran Terverifikasi', color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200' };
    case 'SEDANG_DIPROSES':
      return { label: 'Sedang Diproses', color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200' };
    case 'SIAP_DIAMBIL':
      return {
        label: orderType === 'KURIR' ? 'Siap Diantar' : 'Siap Diambil',
        color: 'text-teal-700',
        bg: 'bg-teal-50',
        border: 'border-teal-200',
      };
    case 'SEDANG_DIANTAR':
      return { label: 'Sedang Diantar Kurir', color: 'text-cyan-700', bg: 'bg-cyan-50', border: 'border-cyan-200' };
    case 'SELESAI':
      return { label: 'Selesai', color: 'text-green-800', bg: 'bg-green-100', border: 'border-green-300' };
    case 'DIBATALKAN':
      return { label: 'Dibatalkan', color: 'text-rose-700', bg: 'bg-rose-50', border: 'border-rose-200' };
    default:
      return { label: status, color: 'text-zinc-700', bg: 'bg-zinc-100', border: 'border-zinc-200' };
  }
}

export function getOrderTypeBadge(type: OrderType): { label: string; icon: string; bg: string; text: string } {
  switch (type) {
    case 'DINE-IN':
      return { label: 'Dine-In', icon: '🍽️', bg: 'bg-emerald-100', text: 'text-emerald-800' };
    case 'TAKEAWAY':
      return { label: 'Takeaway', icon: '🛍️', bg: 'bg-amber-100', text: 'text-amber-800' };
    case 'KURIR':
      return { label: 'Delivery Kurir', icon: '🛵', bg: 'bg-blue-100', text: 'text-blue-800' };
    case 'RESERVASI':
      return { label: 'Reservasi Meja', icon: '📅', bg: 'bg-purple-100', text: 'text-purple-800' };
  }
}

export function getPaymentMethodLabel(method: PaymentMethod): { label: string; icon: string } {
  switch (method) {
    case 'TRANSFER':
      return { label: 'Transfer Bank', icon: '🏦' };
    case 'QRIS':
      return { label: 'QRIS', icon: '📱' };
    case 'CASH':
      return { label: 'Tunai / Cash', icon: '💵' };
  }
}

export function buildWhatsAppOrderMessage(order: {
  id: string;
  customer?: {
    name?: string;
    phone?: string;
    address?: string;
    addressNotes?: string;
    tableNumber?: string;
    eventType?: string;
    guestCount?: number;
    reservationDate?: string;
    reservationTime?: string;
    reservationNotes?: string;
  };
  orderType: OrderType;
  paymentMethod: PaymentMethod;
  total: number;
  items: {
    product?: { name: string; hasSizes?: boolean };
    size?: string;
    quantity: number;
    unitPrice?: number;
    totalPrice?: number;
    selectedAddOns?: { name: string; price?: number }[];
    notes?: string;
  }[];
}): string {
  const itemsText = (order.items || [])
    .map((item) => {
      const prodName = item.product?.name || 'Menu MiJUS';
      const sizeStr = item.product?.hasSizes && item.size ? ` ${item.size}` : '';
      const priceStr = item.totalPrice ? ` — ${formatRupiah(item.totalPrice)}` : '';
      let desc = `${item.quantity || 1}x ${prodName}${sizeStr}${priceStr}`;
      if (item.selectedAddOns && item.selectedAddOns.length > 0) {
        desc += `\n   + ${item.selectedAddOns.map((a) => a?.name || '').filter(Boolean).join(', ')}`;
      }
      if (item.notes) {
        desc += `\n   Catatan: ${item.notes}`;
      }
      return desc;
    })
    .join('\n');

  let typeExtra = '';
  if (order.orderType === 'KURIR' && order.customer?.address) {
    typeExtra = `\nAlamat: ${order.customer.address}${order.customer.addressNotes ? ` (${order.customer.addressNotes})` : ''}`;
  } else if (order.orderType === 'RESERVASI') {
    typeExtra = `\nTanggal: ${order.customer?.reservationDate || '-'} ${order.customer?.reservationTime || '-'}\nTamu: ${order.customer?.guestCount || 1} Pax (${order.customer?.eventType || 'Makan bersama'})${order.customer?.reservationNotes ? `\nCatatan: ${order.customer.reservationNotes}` : ''}`;
  }

  const custName = order.customer?.name || 'Pelanggan';
  const custPhone = order.customer?.phone || '-';
  const paymentLabel = order.paymentMethod === 'TRANSFER' ? 'Transfer Bank' : order.paymentMethod === 'QRIS' ? 'QRIS' : 'Cash (Bayar di Outlet)';

  return `Halo Admin MiJUS 👋

Saya ingin konfirmasi order.

Order: #${order.id}
Nama: ${custName}
WhatsApp: ${custPhone}
Jenis Order: ${order.orderType}${typeExtra}
Pembayaran: ${paymentLabel}

Pesanan:
${itemsText}

Total: ${formatRupiah(order.total)}

Mohon dibantu diproses. Terima kasih.`;
}

export function buildWhatsAppForwardToCrewMessage(order: {
  id: string;
  customer?: {
    name?: string;
    phone?: string;
    address?: string;
    addressNotes?: string;
    eventType?: string;
    guestCount?: number;
    reservationDate?: string;
    reservationTime?: string;
    reservationNotes?: string;
  };
  orderType: OrderType;
  paymentMethod: PaymentMethod;
  total: number;
  items: {
    product?: { name: string; hasSizes?: boolean };
    size?: string;
    quantity: number;
    totalPrice?: number;
    selectedAddOns?: { name: string }[];
    notes?: string;
  }[];
}): string {
  const itemsText = (order.items || [])
    .map((item) => {
      const prodName = item.product?.name || 'Menu MiJUS';
      const sizeStr = item.product?.hasSizes && item.size ? ` ${item.size}` : '';
      const priceStr = item.totalPrice ? ` — ${formatRupiah(item.totalPrice)}` : '';
      let line = `${item.quantity || 1}x ${prodName}${sizeStr}${priceStr}`;
      if (item.selectedAddOns && item.selectedAddOns.length > 0) {
        line += `\n  + ${item.selectedAddOns.map((a) => a?.name || '').filter(Boolean).join(', ')}`;
      }
      return line;
    })
    .join('\n');

  // Collect notes
  const notesList = (order.items || [])
    .filter((i) => i.notes && i.notes.trim())
    .map((i) => `${i.product?.name || 'Menu'}: ${i.notes}`)
    .join('\n');

  let typeExtra = '';
  if (order.orderType === 'KURIR' && order.customer?.address) {
    typeExtra = `\nAlamat: ${order.customer.address}`;
  } else if (order.orderType === 'RESERVASI') {
    typeExtra = `\nJadwal: ${order.customer?.reservationDate || '-'} ${order.customer?.reservationTime || '-'} (${order.customer?.guestCount || 1} Pax - ${order.customer?.eventType || 'Makan bersama'})`;
  }

  const custName = order.customer?.name || 'Pelanggan';
  const paymentLabel = order.paymentMethod === 'TRANSFER' ? 'Transfer Bank' : order.paymentMethod === 'QRIS' ? 'QRIS' : 'Cash';

  return `🟢 ORDER BARU #${order.id}

Jenis: ${order.orderType}${typeExtra}
Nama: ${custName}

${itemsText}

Total: ${formatRupiah(order.total)}
Pembayaran: ${paymentLabel}
${notesList || (order.orderType === 'RESERVASI' && order.customer?.reservationNotes) ? `\nCatatan:\n${notesList || ''}${order.customer?.reservationNotes ? `\n${order.customer.reservationNotes}` : ''}` : ''}

Mohon diproses.`;
}

export function getWhatsAppUrl(phone: string, text: string): string {
  // sanitize phone: remove leading 0 and prepend 62 or keep 62
  let cleanPhone = (phone || '').replace(/[^0-9]/g, '');
  if (cleanPhone.startsWith('0')) {
    cleanPhone = '62' + cleanPhone.slice(1);
  }
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
}

export function buildGoogleReviewMessage(customerName?: string): string {
  const name = customerName || 'Kak';
  return `Terima kasih sudah order di MiJUS 💚

Pesanan kamu sudah selesai.

Kalau berkenan, bantu kami dengan memberikan review di Google ya 🙏

${APP_CONFIG.googleReviewUrl}`;
}
