export interface ProductOption {
  id: string;
  name: string;
  price: number;
}

export interface ProductAddOn {
  id: string;
  name: string;
  price: number;
  category?: string;
}

export type ProductCategory =
  | 'Jus Reguler'
  | 'Musiman'
  | 'Yogurt Series'
  | 'Skincare Series'
  | 'Healthy Series'
  | 'Makanan'
  | 'Snack'
  | 'Add-on';

export type FileUploadCategory =
  | 'PAYMENT_PROOF'
  | 'PRODUCT_IMAGE'
  | 'DELIVERY_PROOF'
  | 'INVOICE'
  | 'RESERVATION_SLIP'
  | 'GENERAL'
  | 'OTHER';

export interface AttachedFile {
  key: string;
  url: string;
  name: string;
  size: number;
  type?: string;
  uploadedAt: string;
  bucket?: string;
  category?: FileUploadCategory;
}

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  description: string;
  image: string;
  imageKey?: string;
  attachment?: AttachedFile;
  priceMed: number;
  priceUp?: number; // Optional large/upsize price
  price?: number; // Single/base price alias
  hasSizes: boolean;
  isAvailable: boolean;
  isOutOfStock?: boolean;
  isNew?: boolean;
  isPromo?: boolean;
  promoDiscount?: number; // e.g. 15 for 15%
  isBestSeller?: boolean;
  tags?: string[];
  calories?: number;
  ingredients?: string[];
  benefits?: string[];
  addOnIds?: string[];
}

export interface CartItemOption {
  size?: 'MED' | 'UP';
  addOns?: ProductAddOn[];
  notes?: string;
}

export interface CartItem {
  cartItemId: string; // unique per item + options config
  product: Product;
  size: 'MED' | 'UP';
  selectedAddOns: ProductAddOn[];
  notes: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
}

export type OrderType = 'DINE-IN' | 'TAKEAWAY' | 'KURIR' | 'RESERVASI';

export type PaymentMethod = 'TRANSFER' | 'QRIS' | 'CASH';

export type OrderStatus =
  | 'PESANAN_DIBUAT'
  | 'MENUNGGU_VERIFIKASI'
  | 'PEMBAYARAN_DIVERIFIKASI'
  | 'SEDANG_DIPROSES'
  | 'SIAP_DIAMBIL'
  | 'SEDANG_DIANTAR'
  | 'SELESAI'
  | 'DIBATALKAN';

export interface CustomerInfo {
  name: string;
  phone: string; // WhatsApp number
  address?: string;
  addressNotes?: string;
  tableNumber?: string;
  pickupTime?: string;
  // Reservation specific
  reservationDate?: string;
  reservationTime?: string;
  guestCount?: number;
  eventType?: string;
  reservationNotes?: string;
}

export interface Order {
  id: string; // e.g. #MJ-98231
  createdAt: string;
  customer: CustomerInfo;
  orderType: OrderType;
  items: CartItem[];
  subtotal: number;
  discount: number;
  deliveryFeeNote?: string;
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: 'MENUNGGU_VERIFIKASI' | 'TERVERIFIKASI' | 'DIBAYAR_TUNAI' | 'DIBATALKAN';
  orderStatus: OrderStatus;
  cancellationReason?: string;
  receiptUrl?: string;
  attachment?: AttachedFile;
  attachments?: AttachedFile[];
  reviewedGoogle?: boolean;
  reviewSentAt?: string;
  stampsEarned?: number;
  stampAwarded?: boolean;
}

export interface CustomerLoyalty {
  phone: string;
  name: string;
  customerName?: string;
  totalOrders: number;
  totalSpent: number;
  stamps: number; // 0 to 10
  rewardsAvailable: number; // count of free salads earned
  rewardsUsed: number;
  lastOrderAt?: string;
}

export type ReservationStatus = 'MENUNGGU' | 'DITERIMA' | 'SELESAI' | 'DIBATALKAN';

export interface Reservation {
  id: string;
  name: string;
  phone: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  guestCount: number;
  eventType: string;
  notes?: string;
  preOrderItems?: { productName: string; quantity: number }[];
  status: ReservationStatus;
  attachment?: AttachedFile;
  attachments?: AttachedFile[];
  createdAt: string;
}

export interface PromoBanner {
  id: string;
  title: string;
  subtitle: string;
  highlight?: string;
  tag?: string;
  bgColor?: string;
  textColor?: string;
  badgeColor?: string;
  actionCategory?: ProductCategory;
  code?: string;
  discountPercentage?: number;
  minSpend?: number;
  badge?: string;
  color?: string;
  isActive?: boolean;
  description?: string;
}

export type AddOnOption = ProductAddOn;

export interface CrewContact {
  id: string;
  name: string;
  role: string;
  phone: string; // WhatsApp format 62xxxx
  isActive?: boolean;
  notes?: string;
  avatarColor?: string;
}

export interface OrderGroupContact {
  id: string;
  name: string;
  phone: string;
  inviteLink?: string;
  description?: string;
  isDefault?: boolean;
  isActive?: boolean;
}

export interface OrderGroupConfig {
  name: string;
  phone: string;
  inviteLink?: string;
}

export type ViewRole = 'CUSTOMER' | 'ADMIN';

