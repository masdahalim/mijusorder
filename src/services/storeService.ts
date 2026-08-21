import {
  Product,
  CartItem,
  Order,
  OrderStatus,
  Reservation,
  CustomerLoyalty,
  PaymentMethod,
  PromoBanner,
  ProductAddOn,
  AddOnOption,
  CrewContact,
  OrderGroupContact,
} from '../types';
import {
  INITIAL_PRODUCTS,
  INITIAL_ORDERS,
  INITIAL_RESERVATIONS,
  INITIAL_LOYALTIES,
  COMMON_ADD_ONS,
  INITIAL_PROMO_BANNERS,
  INITIAL_CREW_CONTACTS,
  INITIAL_ORDER_GROUPS,
} from '../data/mockData';
import { APP_CONFIG } from '../config/appConfig';
import { insforge } from './insforge';

const STORAGE_KEYS = {
  PRODUCTS: 'mijus_products_v1',
  ORDERS: 'mijus_orders_v1',
  RESERVATIONS: 'mijus_reservations_v1',
  LOYALTY: 'mijus_loyalty_v1',
  PROMOS: 'mijus_promos_v1',
  ADDONS: 'mijus_addons_v1',
  CREW: 'mijus_crew_contacts_v1',
  ORDER_GROUPS: 'mijus_order_groups_v1',
  ACTIVE_PHONE: 'mijus_active_phone_v1',
  ACTIVE_CUSTOMER_NAME: 'mijus_active_name_v1',
};

// Simple event emitter for reactive updates across components
type Listener = () => void;
const listeners: Set<Listener> = new Set();

function notifyListeners() {
  listeners.forEach((l) => l());
}

export function subscribeToStore(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

// ---------------- ASYNC INSFORGE SYNC ----------------
let isInitialSyncDone = false;
let syncIntervalId: any = null;

export async function syncFromInsForge(): Promise<void> {
  try {
    // 1. Fetch Products from InsForge
    const { data: dbProducts, error: prodErr } = await insforge.database
      .from('mijus_products')
      .select('*');

    if (!prodErr && dbProducts && dbProducts.length > 0) {
      const parsedProducts: Product[] = dbProducts.map((row: any) => {
        const sizes = Array.isArray(row.sizes) ? row.sizes : [];
        const medSize = sizes.find((s: any) => s.name?.toLowerCase().includes('medium')) || sizes[0];
        const upSize = sizes.find((s: any) => s.name?.toLowerCase().includes('upsize')) || sizes[1];

        return {
          id: row.id,
          name: row.name,
          category: row.category,
          description: row.description || '',
          priceMed: medSize?.price || Number(row.price) || 15000,
          priceUp: upSize?.price || (medSize ? medSize.price + 3000 : 18000),
          image: row.image_url || 'https://images.unsplash.com/photo-1537640538966-79f369143f8f?w=600&auto=format&fit=crop&q=80',
          isBestSeller: Boolean(row.is_best_seller),
          isAvailable: row.is_available !== false,
          calories: Number(row.calories) || 0,
          benefits: Array.isArray(row.benefits) ? row.benefits : [],
          tags: Array.isArray(row.tags) ? row.tags : [],
          hasSizes: row.has_sizes !== false,
        };
      });

      // Merge with local fallback
      const local = getProducts();
      const mergedMap = new Map<string, Product>();
      local.forEach((p) => mergedMap.set(p.id, p));
      parsedProducts.forEach((p) => mergedMap.set(p.id, p));
      const finalProducts = Array.from(mergedMap.values());
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(finalProducts));
    }

    // 2. Fetch Orders from InsForge
    const { data: dbOrders, error: orderErr } = await insforge.database
      .from('mijus_orders')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (!orderErr && dbOrders && dbOrders.length > 0) {
      const parsedOrders: Order[] = dbOrders.map((row: any) => ({
        id: row.id,
        customer: {
          name: row.customer_name,
          phone: row.customer_phone,
          tableNumber: row.customer_table_number,
          pickupTime: row.customer_pickup_time,
          address: row.customer_address,
          notes: row.customer_notes,
        },
        orderType: row.order_type as any,
        orderStatus: row.order_status as any,
        paymentMethod: row.payment_method as any,
        paymentStatus: row.payment_status as any,
        items: row.items || [],
        subtotal: Number(row.subtotal) || 0,
        discount: Number(row.discount) || 0,
        total: Number(row.total) || 0,
        source: row.source || 'CUSTOMER_WEB',
        reviewedGoogle: Boolean(row.reviewed_google),
        createdAt: row.created_at || new Date().toISOString(),
      }));

      // Merge with local orders
      const local = getOrders();
      const mergedMap = new Map<string, Order>();
      local.forEach((o) => mergedMap.set(o.id, o));
      parsedOrders.forEach((o) => mergedMap.set(o.id, o));
      const finalOrders = Array.from(mergedMap.values()).sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(finalOrders));
    }

    // 3. Fetch Reservations
    const { data: dbRes, error: resErr } = await insforge.database
      .from('mijus_reservations')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (!resErr && dbRes && dbRes.length > 0) {
      const parsedRes: Reservation[] = dbRes.map((r: any) => ({
        id: r.id,
        name: r.name,
        phone: r.phone,
        date: r.date,
        time: r.time,
        guestCount: r.guest_count,
        eventType: r.event_type,
        notes: r.notes,
        preOrderItems: r.pre_order_items || [],
        status: r.status as any,
        createdAt: r.created_at || new Date().toISOString(),
      }));
      const local = getReservations();
      const mergedMap = new Map<string, Reservation>();
      local.forEach((r) => mergedMap.set(r.id, r));
      parsedRes.forEach((r) => mergedMap.set(r.id, r));
      const finalRes = Array.from(mergedMap.values()).sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      localStorage.setItem(STORAGE_KEYS.RESERVATIONS, JSON.stringify(finalRes));
    }

    // 4. Fetch Loyalties
    const { data: dbLoyalties, error: loyalErr } = await insforge.database
      .from('mijus_loyalties')
      .select('*');

    if (!loyalErr && dbLoyalties && dbLoyalties.length > 0) {
      const currentLoyalties = getLoyalties();
      dbLoyalties.forEach((l: any) => {
        const clean = (l.phone || '').replace(/[^0-9]/g, '');
        if (clean) {
          currentLoyalties[clean] = {
            phone: l.phone,
            name: l.name,
            stamps: l.total_stamps || 0,
            rewardsAvailable: l.rewards_available || 0,
            totalOrders: currentLoyalties[clean]?.totalOrders || 1,
            totalSpent: Number(l.total_spent) || 0,
            rewardsUsed: currentLoyalties[clean]?.rewardsUsed || 0,
            lastOrderAt: l.last_visit || new Date().toISOString(),
          };
        }
      });
      localStorage.setItem(STORAGE_KEYS.LOYALTY, JSON.stringify(currentLoyalties));
    }

    isInitialSyncDone = true;
    notifyListeners();
  } catch (err) {
    console.warn('InsForge background sync error (fallback to local):', err);
  }
}

export interface InsForgeSyncResult {
  success: boolean;
  productsCount: number;
  ordersCount: number;
  reservationsCount: number;
  loyaltiesCount: number;
  timestamp: string;
  error?: string;
}

export async function pushAllToInsForge(): Promise<InsForgeSyncResult> {
  try {
    const products = getProducts();
    const orders = getOrders();
    const reservations = getReservations();
    const loyalties = getLoyalties();

    // 1. Upload Products
    const dbProducts = products.map((p) => ({
      id: p.id,
      name: p.name,
      category: p.category,
      description: p.description || '',
      price: p.priceMed || p.priceUp || 15000,
      image_url: p.image || '',
      is_best_seller: Boolean(p.isBestSeller),
      is_available: p.isAvailable !== false,
      calories: p.calories || 0,
      benefits: p.benefits || [],
      tags: p.tags || [],
      has_sizes: p.hasSizes !== false,
      sizes: p.hasSizes
        ? [
            { name: 'Medium (16oz)', price: p.priceMed || 15000 },
            { name: 'Upsize (22oz)', price: p.priceUp || 18000 },
          ]
        : [{ name: 'Regular', price: p.priceMed || 15000 }],
      allowed_sugar_levels: ['100% (Normal)', '50% (Less Sugar)', '0% (No Sugar)'],
      allowed_ice_levels: ['Normal Ice', 'Less Ice', 'No Ice'],
    }));

    // Batch upsert to InsForge
    for (let i = 0; i < dbProducts.length; i += 25) {
      const chunk = dbProducts.slice(i, i + 25);
      await insforge.database.from('mijus_products').upsert(chunk);
    }

    // 2. Upload Orders
    if (orders.length > 0) {
      const dbOrders = orders.map((o) => ({
        id: o.id,
        customer_name: o.customer.name,
        customer_phone: o.customer.phone || '081234567890',
        customer_table_number: o.customer.tableNumber || null,
        customer_pickup_time: o.customer.pickupTime || null,
        customer_address: o.customer.address || null,
        customer_notes: (o.customer as any).notes || o.customer.addressNotes || o.customer.reservationNotes || null,
        order_type: o.orderType,
        order_status: o.orderStatus,
        payment_method: o.paymentMethod,
        payment_status: o.paymentStatus,
        items: o.items || [],
        subtotal: o.subtotal,
        discount: o.discount || 0,
        total: o.total,
        source: (o as any).source || 'CUSTOMER_WEB',
        reviewed_google: Boolean(o.reviewedGoogle),
        created_at: o.createdAt || new Date().toISOString(),
      }));

      for (let i = 0; i < dbOrders.length; i += 25) {
        const chunk = dbOrders.slice(i, i + 25);
        await insforge.database.from('mijus_orders').upsert(chunk);
      }
    }

    // 3. Upload Reservations
    if (reservations.length > 0) {
      const dbReservations = reservations.map((r) => ({
        id: r.id,
        name: r.name,
        phone: r.phone,
        date: r.date,
        time: r.time,
        guest_count: r.guestCount,
        event_type: r.eventType,
        notes: r.notes || '',
        pre_order_items: r.preOrderItems || [],
        status: r.status,
        created_at: r.createdAt || new Date().toISOString(),
      }));

      for (let i = 0; i < dbReservations.length; i += 25) {
        const chunk = dbReservations.slice(i, i + 25);
        await insforge.database.from('mijus_reservations').upsert(chunk);
      }
    }

    // 4. Upload Loyalties
    const loyaltyList = Object.values(loyalties);
    if (loyaltyList.length > 0) {
      const dbLoyalties = loyaltyList.map((l) => ({
        phone: l.phone,
        name: l.name,
        total_stamps: l.stamps || 0,
        rewards_available: l.rewardsAvailable || 0,
        total_spent: l.totalSpent || 0,
        last_visit: l.lastOrderAt || new Date().toISOString(),
        created_at: new Date().toISOString(),
      }));

      for (let i = 0; i < dbLoyalties.length; i += 25) {
        const chunk = dbLoyalties.slice(i, i + 25);
        await insforge.database.from('mijus_loyalties').upsert(chunk);
      }
    }

    // Trigger sync pull to align state
    await syncFromInsForge();

    return {
      success: true,
      productsCount: products.length,
      ordersCount: orders.length,
      reservationsCount: reservations.length,
      loyaltiesCount: loyaltyList.length,
      timestamp: new Date().toLocaleTimeString('id-ID'),
    };
  } catch (err: any) {
    console.error('Failed to push data to InsForge:', err);
    return {
      success: false,
      productsCount: 0,
      ordersCount: 0,
      reservationsCount: 0,
      loyaltiesCount: 0,
      timestamp: new Date().toLocaleTimeString('id-ID'),
      error: err?.message || 'Gagal sinkronisasi data ke InsForge',
    };
  }
}

// Auto-run initial sync and periodic real-time sync
if (typeof window !== 'undefined') {
  setTimeout(() => {
    syncFromInsForge();
  }, 100);

  if (!syncIntervalId) {
    syncIntervalId = setInterval(() => {
      syncFromInsForge();
    }, 8000);
  }
}

// ---------------- PRODUCTS ----------------
export function getProducts(): Product[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
      return INITIAL_PRODUCTS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_PRODUCTS;
  }
}

export function saveProducts(products: Product[]): void {
  localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  notifyListeners();
}

export function addProduct(product: Omit<Product, 'id'>): Product {
  const products = getProducts();
  const newProduct: Product = {
    ...product,
    id: `prod-${Date.now()}`,
  };
  products.unshift(newProduct);
  saveProducts(products);

  // Sync to InsForge
  try {
    insforge.database
      .from('mijus_products')
      .insert([
        {
          id: newProduct.id,
          name: newProduct.name,
          category: newProduct.category,
          description: newProduct.description || null,
          price: newProduct.priceMed || 0,
          image_url: newProduct.image || null,
          is_best_seller: Boolean(newProduct.isBestSeller),
          is_available: newProduct.isAvailable !== false,
          calories: newProduct.calories || 0,
          benefits: newProduct.benefits || [],
          tags: newProduct.tags || [],
          has_sizes: newProduct.hasSizes !== false,
          sizes: [
            { name: 'Medium (16oz)', price: newProduct.priceMed || 15000 },
            { name: 'Upsize (22oz)', price: newProduct.priceUp || 18000 },
          ],
          allowed_sugar_levels: ['100% (Normal)', '50% (Less Sugar)', '0% (No Sugar)'],
          allowed_ice_levels: ['Normal Ice', 'Less Ice', 'No Ice'],
        },
      ])
      .then(({ error }) => {
        if (error) console.warn('InsForge product insert notice:', error);
      });
  } catch (err) {
    console.warn('InsForge product insert error:', err);
  }

  return newProduct;
}

export function updateProduct(updated: Product): void {
  const products = getProducts().map((p) => (p.id === updated.id ? updated : p));
  saveProducts(products);

  // Sync to InsForge
  try {
    insforge.database
      .from('mijus_products')
      .upsert([
        {
          id: updated.id,
          name: updated.name,
          category: updated.category,
          description: updated.description || null,
          price: updated.priceMed || 0,
          image_url: updated.image || null,
          is_best_seller: Boolean(updated.isBestSeller),
          is_available: updated.isAvailable !== false,
          calories: updated.calories || 0,
          benefits: updated.benefits || [],
          tags: updated.tags || [],
          has_sizes: updated.hasSizes !== false,
          sizes: [
            { name: 'Medium (16oz)', price: updated.priceMed || 15000 },
            { name: 'Upsize (22oz)', price: updated.priceUp || 18000 },
          ],
        },
      ])
      .then(({ error }) => {
        if (error) console.warn('InsForge product update notice:', error);
      });
  } catch (err) {
    console.warn('InsForge product update error:', err);
  }
}

export function saveProduct(product: Product): void {
  const products = getProducts();
  const existingIndex = products.findIndex((p) => p.id === product.id);
  const normalizedProduct = {
    ...product,
    priceMed: product.priceMed || (product as any).price || 15000,
    isAvailable: product.isAvailable !== undefined ? product.isAvailable : !(product as any).isOutOfStock,
  };
  if (existingIndex >= 0) {
    products[existingIndex] = normalizedProduct;
  } else {
    products.unshift(normalizedProduct);
  }
  saveProducts(products);
  updateProduct(normalizedProduct);
}

export function toggleProductAvailability(id: string): void {
  let updatedAvail = true;
  const products = getProducts().map((p) => {
    if (p.id === id) {
      const newAvail = !p.isAvailable;
      updatedAvail = newAvail;
      return { ...p, isAvailable: newAvail, isOutOfStock: !newAvail };
    }
    return p;
  });
  saveProducts(products);

  // Sync to InsForge
  try {
    insforge.database
      .from('mijus_products')
      .update({ is_available: updatedAvail })
      .eq('id', id)
      .then(({ error }) => {
        if (error) console.warn('InsForge product availability update notice:', error);
      });
  } catch (err) {
    console.warn('InsForge product availability update error:', err);
  }
}

export function toggleProductOutOfStock(id: string): void {
  toggleProductAvailability(id);
}

export function deleteProduct(id: string): void {
  const products = getProducts().filter((p) => p.id !== id);
  saveProducts(products);

  // Sync to InsForge
  try {
    insforge.database
      .from('mijus_products')
      .delete()
      .eq('id', id)
      .then(({ error }) => {
        if (error) console.warn('InsForge product delete notice:', error);
      });
  } catch (err) {
    console.warn('InsForge product delete error:', err);
  }
}

// ---------------- ORDERS ----------------
export function getOrders(): Order[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ORDERS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(INITIAL_ORDERS));
      return INITIAL_ORDERS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_ORDERS;
  }
}

export function saveOrders(orders: Order[]): void {
  localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
  notifyListeners();
}

export function createOrder(orderData: Omit<Order, 'createdAt' | 'orderStatus' | 'paymentStatus' | 'stampAwarded'>): Order {
  const orders = getOrders();
  const newOrder: Order = {
    ...orderData,
    createdAt: new Date().toISOString(),
    orderStatus: 'PESANAN_DIBUAT',
    paymentStatus: orderData.paymentMethod === 'CASH' ? 'MENUNGGU_VERIFIKASI' : 'MENUNGGU_VERIFIKASI',
    stampAwarded: false,
  };

  orders.unshift(newOrder);
  saveOrders(orders);

  // Async push to InsForge Postgres
  try {
    insforge.database
      .from('mijus_orders')
      .insert([
        {
          id: newOrder.id,
          customer_name: newOrder.customer.name,
          customer_phone: newOrder.customer.phone,
          customer_table_number: newOrder.customer.tableNumber || null,
          customer_pickup_time: newOrder.customer.pickupTime || null,
          customer_address: newOrder.customer.address || null,
          customer_notes: newOrder.customer.addressNotes || newOrder.customer.reservationNotes || null,
          order_type: newOrder.orderType,
          order_status: newOrder.orderStatus,
          payment_method: newOrder.paymentMethod,
          payment_status: newOrder.paymentStatus,
          items: newOrder.items,
          subtotal: newOrder.subtotal,
          discount: newOrder.discount,
          total: newOrder.total,
          source: 'CUSTOMER_WEB',
          reviewed_google: false,
          created_at: newOrder.createdAt,
        },
      ])
      .then(({ error }) => {
        if (error) console.warn('InsForge order insert notice:', error);
      });
  } catch (err) {
    console.warn('InsForge push error:', err);
  }

  // Save active customer info for easier return
  if (orderData.customer.phone) {
    setActiveCustomer(orderData.customer.phone, orderData.customer.name);
    touchCustomerRecord(orderData.customer.phone, orderData.customer.name);
  }

  return newOrder;
}

export function updateOrderStatus(orderId: string, newStatus: OrderStatus, cancellationReason?: string): void {
  const orders = getOrders();
  const orderIndex = orders.findIndex((o) => o.id === orderId);
  if (orderIndex === -1) return;

  const currentOrder = orders[orderIndex];
  const updatedOrder: Order = {
    ...currentOrder,
    orderStatus: newStatus,
    ...(cancellationReason ? { cancellationReason } : {}),
  };

  // RULE: Stamps are ONLY awarded when order status is updated to 'SELESAI'
  if (newStatus === 'SELESAI' && !updatedOrder.stampAwarded) {
    const custPhone = updatedOrder.customer?.phone || '';
    const custName = updatedOrder.customer?.name || 'Pelanggan MiJUS';

    // 1 stamp for every transaction >= Rp 50.000
    if (updatedOrder.total >= APP_CONFIG.loyalty.minTransactionForStamp && custPhone) {
      const result = awardStampToCustomer(custPhone, custName, updatedOrder.total);
      updatedOrder.stampAwarded = true;
      updatedOrder.stampsEarned = 1;

      // Notify UI of potential reward
      if (typeof window !== 'undefined' && result.earnedReward) {
        window.dispatchEvent(new CustomEvent('mijus_free_salad_reward', {
          detail: { phone: custPhone, name: custName, rewardName: APP_CONFIG.loyalty.rewardName }
        }));
      }
    } else {
      updatedOrder.stampAwarded = true;
      updatedOrder.stampsEarned = 0;
    }
  }

  // If status is verified
  if (newStatus === 'PEMBAYARAN_DIVERIFIKASI') {
    updatedOrder.paymentStatus = 'TERVERIFIKASI';
  }

  orders[orderIndex] = updatedOrder;
  saveOrders(orders);

  // Async update in InsForge
  try {
    insforge.database
      .from('mijus_orders')
      .update({
        order_status: newStatus,
        payment_status: updatedOrder.paymentStatus,
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId)
      .then(({ error }) => {
        if (error) console.warn('InsForge order update notice:', error);
      });
  } catch (err) {
    console.warn('InsForge update error:', err);
  }
}

export function verifyOrderPayment(orderId: string): void {
  const orders = getOrders();
  const order = orders.find((o) => o.id === orderId);
  if (order) {
    order.paymentStatus = 'TERVERIFIKASI';
    if (order.orderStatus === 'MENUNGGU_VERIFIKASI' || order.orderStatus === 'PESANAN_DIBUAT') {
      order.orderStatus = 'PEMBAYARAN_DIVERIFIKASI';
    }
    saveOrders(orders);

    // Sync to InsForge
    try {
      insforge.database
        .from('mijus_orders')
        .update({
          payment_status: 'TERVERIFIKASI',
          order_status: order.orderStatus,
          updated_at: new Date().toISOString(),
        })
        .eq('id', orderId)
        .then(({ error }) => {
          if (error) console.warn('InsForge payment verify notice:', error);
        });
    } catch (err) {
      console.warn('InsForge payment verify error:', err);
    }
  }
}

export function markGoogleReviewSent(orderId: string): void {
  const orders = getOrders();
  const order = orders.find((o) => o.id === orderId);
  if (order) {
    order.reviewedGoogle = true;
    order.reviewSentAt = new Date().toISOString();
    saveOrders(orders);

    // Sync to InsForge
    try {
      insforge.database
        .from('mijus_orders')
        .update({
          reviewed_google: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', orderId)
        .then(({ error }) => {
          if (error) console.warn('InsForge review flag notice:', error);
        });
    } catch (err) {
      console.warn('InsForge review flag error:', err);
    }
  }
}

// ---------------- LOYALTY ----------------
export function getLoyalties(): Record<string, CustomerLoyalty> {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.LOYALTY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.LOYALTY, JSON.stringify(INITIAL_LOYALTIES));
      return INITIAL_LOYALTIES;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_LOYALTIES;
  }
}

export function saveLoyalties(loyalties: Record<string, CustomerLoyalty>): void {
  localStorage.setItem(STORAGE_KEYS.LOYALTY, JSON.stringify(loyalties));
  notifyListeners();
}

export function getCustomerLoyalty(phone: string): CustomerLoyalty | null {
  if (!phone) return null;
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  const loyalties = getLoyalties();
  return loyalties[cleanPhone] || loyalties[phone] || null;
}

export function lookupCustomerLoyalty(phone: string): { found: boolean; loyalty: CustomerLoyalty | null } {
  if (!phone) return { found: false, loyalty: null };
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  const loyalties = getLoyalties();
  const rec = loyalties[cleanPhone] || loyalties[phone] || null;
  
  if (!rec) {
    return { found: false, loyalty: null };
  }

  // Has history if has stamps, rewards, or past orders
  const hasHistory = rec.stamps > 0 || rec.rewardsAvailable > 0 || rec.rewardsUsed > 0 || rec.totalOrders > 0;
  if (!hasHistory) {
    return { found: false, loyalty: null };
  }

  return { found: true, loyalty: rec };
}

export function touchCustomerRecord(phone: string, name: string): void {
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  const loyalties = getLoyalties();
  if (!loyalties[cleanPhone]) {
    loyalties[cleanPhone] = {
      phone: cleanPhone,
      name,
      totalOrders: 0,
      totalSpent: 0,
      stamps: 0,
      rewardsAvailable: 0,
      rewardsUsed: 0,
      lastOrderAt: new Date().toISOString(),
    };
    saveLoyalties(loyalties);
  }
}

export function awardStampToCustomer(phone: string, name: string, orderTotal: number): { stamps: number; earnedReward: boolean } {
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  const loyalties = getLoyalties();
  const current = loyalties[cleanPhone] || {
    phone: cleanPhone,
    name: name || 'Pelanggan MiJUS',
    totalOrders: 0,
    totalSpent: 0,
    stamps: 0,
    rewardsAvailable: 0,
    rewardsUsed: 0,
  };

  current.totalOrders += 1;
  current.totalSpent += orderTotal;
  current.lastOrderAt = new Date().toISOString();

  let earnedReward = false;
  current.stamps += 1;

  if (current.stamps >= APP_CONFIG.loyalty.stampsRequiredForReward) {
    current.stamps -= APP_CONFIG.loyalty.stampsRequiredForReward;
    current.rewardsAvailable += 1;
    earnedReward = true;
  }

  loyalties[cleanPhone] = current;
  saveLoyalties(loyalties);

  // Async upsert to InsForge
  try {
    insforge.database
      .from('mijus_loyalties')
      .upsert([
        {
          phone: cleanPhone,
          name: current.name,
          total_stamps: current.stamps,
          rewards_available: current.rewardsAvailable,
          total_spent: current.totalSpent,
          last_visit: current.lastOrderAt,
        },
      ])
      .then(({ error }) => {
        if (error) console.warn('InsForge loyalty sync notice:', error);
      });
  } catch (err) {
    console.warn('InsForge loyalty error:', err);
  }

  return { stamps: current.stamps, earnedReward };
}

export function manualAdjustStamps(phone: string, delta: number): void {
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  const loyalties = getLoyalties();
  const current = loyalties[cleanPhone] || loyalties[phone];
  if (!current) return;

  const target = current.stamps + delta;
  if (target >= APP_CONFIG.loyalty.stampsRequiredForReward) {
    current.stamps = target - APP_CONFIG.loyalty.stampsRequiredForReward;
    current.rewardsAvailable += 1;
  } else {
    current.stamps = Math.max(0, target);
  }

  loyalties[cleanPhone] = current;
  saveLoyalties(loyalties);

  // Sync to InsForge
  try {
    insforge.database
      .from('mijus_loyalties')
      .upsert([
        {
          phone: cleanPhone,
          name: current.name,
          total_stamps: current.stamps,
          rewards_available: current.rewardsAvailable,
          total_spent: current.totalSpent,
          last_visit: new Date().toISOString(),
        },
      ])
      .then(({ error }) => {
        if (error) console.warn('InsForge loyalty update notice:', error);
      });
  } catch (err) {
    console.warn('InsForge loyalty update error:', err);
  }
}

export function redeemLoyaltyReward(phone: string): boolean {
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  const loyalties = getLoyalties();
  const customer = loyalties[cleanPhone];
  if (customer && customer.rewardsAvailable > 0) {
    customer.rewardsAvailable -= 1;
    customer.rewardsUsed += 1;
    saveLoyalties(loyalties);

    // Sync to InsForge
    try {
      insforge.database
        .from('mijus_loyalties')
        .upsert([
          {
            phone: cleanPhone,
            name: customer.name,
            total_stamps: customer.stamps,
            rewards_available: customer.rewardsAvailable,
            total_spent: customer.totalSpent,
            last_visit: new Date().toISOString(),
          },
        ])
        .then(({ error }) => {
          if (error) console.warn('InsForge loyalty reward notice:', error);
        });
    } catch (err) {
      console.warn('InsForge loyalty reward error:', err);
    }

    return true;
  }
  return false;
}

// ---------------- RESERVATIONS ----------------
export function getReservations(): Reservation[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.RESERVATIONS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.RESERVATIONS, JSON.stringify(INITIAL_RESERVATIONS));
      return INITIAL_RESERVATIONS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_RESERVATIONS;
  }
}

export function saveReservations(reservations: Reservation[]): void {
  localStorage.setItem(STORAGE_KEYS.RESERVATIONS, JSON.stringify(reservations));
  notifyListeners();
}

export function createReservation(data: Omit<Reservation, 'id' | 'status' | 'createdAt'>): { reservation: Reservation; conflict: boolean; conflictMessage?: string } {
  const reservations = getReservations();
  
  // Simple conflict check: check if same date and same time slot (+/- 1 hour) has accepted reservations with high guest count
  const existingSameSlot = reservations.filter(
    (r) => r.date === data.date && r.status === 'DITERIMA' && Math.abs(parseInt(r.time.replace(':', ''), 10) - parseInt(data.time.replace(':', ''), 10)) <= 100
  );

  const totalGuests = existingSameSlot.reduce((sum, r) => sum + r.guestCount, 0);
  const conflict = totalGuests + data.guestCount > 30; // Max outlet reservation capacity 30 pax

  const newReservation: Reservation = {
    ...data,
    id: `RES-${Math.floor(1000 + Math.random() * 9000)}`,
    status: 'MENUNGGU',
    createdAt: new Date().toISOString(),
  };

  reservations.unshift(newReservation);
  saveReservations(reservations);

  // Sync to InsForge
  try {
    insforge.database
      .from('mijus_reservations')
      .insert([
        {
          id: newReservation.id,
          name: newReservation.name,
          phone: newReservation.phone,
          date: newReservation.date,
          time: newReservation.time,
          guest_count: newReservation.guestCount,
          event_type: newReservation.eventType,
          notes: newReservation.notes || null,
          pre_order_items: newReservation.preOrderItems || [],
          status: newReservation.status,
          created_at: newReservation.createdAt,
        },
      ])
      .then(({ error }) => {
        if (error) console.warn('InsForge reservation insert notice:', error);
      });
  } catch (err) {
    console.warn('InsForge reservation insert error:', err);
  }

  return {
    reservation: newReservation,
    conflict,
    conflictMessage: conflict
      ? `Perhatian: Waktu reservasi ini mendekati kapasitas maksimal (${totalGuests + data.guestCount}/30 kursi terisi). Admin akan meninjau sebelum konfirmasi.`
      : undefined,
  };
}

export function updateReservationStatus(id: string, status: Reservation['status']): void {
  const reservations = getReservations().map((r) => (r.id === id ? { ...r, status } : r));
  saveReservations(reservations);

  // Sync to InsForge
  try {
    insforge.database
      .from('mijus_reservations')
      .update({ status })
      .eq('id', id)
      .then(({ error }) => {
        if (error) console.warn('InsForge reservation status update notice:', error);
      });
  } catch (err) {
    console.warn('InsForge reservation status error:', err);
  }
}

// ---------------- PROMOS ----------------
export function getPromos(): PromoBanner[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROMOS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.PROMOS, JSON.stringify(INITIAL_PROMO_BANNERS));
      return INITIAL_PROMO_BANNERS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_PROMO_BANNERS;
  }
}

export function savePromos(promos: PromoBanner[]): void {
  localStorage.setItem(STORAGE_KEYS.PROMOS, JSON.stringify(promos));
  notifyListeners();
}

export function savePromo(promo: PromoBanner): void {
  const promos = getPromos();
  const existingIndex = promos.findIndex((p) => p.id === promo.id);
  if (existingIndex >= 0) {
    promos[existingIndex] = promo;
  } else {
    promos.unshift(promo);
  }
  savePromos(promos);
}

export function deletePromo(id: string): void {
  const promos = getPromos().filter((p) => p.id !== id);
  savePromos(promos);
}

export function togglePromoActive(id: string): void {
  const promos = getPromos().map((p) => {
    if (p.id === id) {
      return { ...p, isActive: p.isActive === undefined ? false : !p.isActive };
    }
    return p;
  });
  savePromos(promos);
}

// ---------------- ADD-ONS ----------------
export function getAddOns(): AddOnOption[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ADDONS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.ADDONS, JSON.stringify(COMMON_ADD_ONS));
      return COMMON_ADD_ONS;
    }
    return JSON.parse(raw);
  } catch {
    return COMMON_ADD_ONS;
  }
}

export function saveAddOns(addOns: AddOnOption[]): void {
  localStorage.setItem(STORAGE_KEYS.ADDONS, JSON.stringify(addOns));
  notifyListeners();
}

export function saveAddOn(addOn: AddOnOption): void {
  const addOns = getAddOns();
  const existingIndex = addOns.findIndex((a) => a.id === addOn.id);
  if (existingIndex >= 0) {
    addOns[existingIndex] = addOn;
  } else {
    addOns.unshift(addOn);
  }
  saveAddOns(addOns);
}

export function deleteAddOn(id: string): void {
  const addOns = getAddOns().filter((a) => a.id !== id);
  saveAddOns(addOns);
}

// ---------------- ACTIVE USER HELPER ----------------
export function getActiveCustomer(): { phone: string; name: string } {
  try {
    const rawPhone = localStorage.getItem(STORAGE_KEYS.ACTIVE_PHONE);
    const rawName = localStorage.getItem(STORAGE_KEYS.ACTIVE_CUSTOMER_NAME);
    const phone = rawPhone && rawPhone.trim() ? rawPhone.trim() : '081298765432';
    const name = rawName && rawName.trim() ? rawName.trim() : 'Rian Saputra';
    return { phone, name };
  } catch {
    return { phone: '081298765432', name: 'Rian Saputra' };
  }
}

export function setActiveCustomer(phone: string, name: string): void {
  localStorage.setItem(STORAGE_KEYS.ACTIVE_PHONE, phone);
  localStorage.setItem(STORAGE_KEYS.ACTIVE_CUSTOMER_NAME, name);
  touchCustomerRecord(phone, name);
  notifyListeners();
}

// ---------------- REVIEWS (INSFORGE) ----------------
export async function getReviewsFromInsForge(): Promise<Array<{
  id: string;
  customerName: string;
  rating: number;
  comment: string;
  orderId?: string;
  tags: string[];
  createdAt: string;
}>> {
  try {
    const { data, error } = await insforge.database
      .from('mijus_reviews')
      .select('*')
      .eq('is_published', true)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error || !data) return [];
    return data.map((r: any) => ({
      id: r.id,
      customerName: r.customer_name,
      rating: r.rating,
      comment: r.comment || '',
      orderId: r.order_id,
      tags: Array.isArray(r.tags) ? r.tags : [],
      createdAt: r.created_at,
    }));
  } catch {
    return [];
  }
}

export async function submitReviewToInsForge(review: {
  customerName: string;
  rating: number;
  comment: string;
  orderId?: string;
  tags?: string[];
}): Promise<boolean> {
  try {
    const { error } = await insforge.database.from('mijus_reviews').insert([
      {
        id: `rev-${Date.now()}`,
        customer_name: review.customerName,
        rating: review.rating,
        comment: review.comment,
        order_id: review.orderId || null,
        tags: review.tags || ['Customer Web'],
        is_published: true,
      },
    ]);
    return !error;
  } catch {
    return false;
  }
}

// ---------------- CREW CONTACTS (CRUD) ----------------
export function getCrewContacts(): CrewContact[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CREW);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.CREW, JSON.stringify(INITIAL_CREW_CONTACTS));
      APP_CONFIG.crewWhatsApps = INITIAL_CREW_CONTACTS;
      return INITIAL_CREW_CONTACTS;
    }
    const parsed = JSON.parse(raw);
    APP_CONFIG.crewWhatsApps = parsed;
    return parsed;
  } catch {
    return INITIAL_CREW_CONTACTS;
  }
}

export function saveCrewContacts(crews: CrewContact[]): void {
  localStorage.setItem(STORAGE_KEYS.CREW, JSON.stringify(crews));
  APP_CONFIG.crewWhatsApps = crews;
  notifyListeners();
}

export function addCrewContact(crew: Omit<CrewContact, 'id'>): CrewContact {
  const crews = getCrewContacts();
  const cleanPhone = (crew.phone || '').replace(/[^0-9]/g, '');
  const formattedPhone = cleanPhone.startsWith('0')
    ? '62' + cleanPhone.slice(1)
    : cleanPhone.startsWith('62')
    ? cleanPhone
    : '62' + cleanPhone;

  const newCrew: CrewContact = {
    ...crew,
    id: `crew-${Date.now()}`,
    phone: formattedPhone,
    isActive: crew.isActive !== undefined ? crew.isActive : true,
    avatarColor: crew.avatarColor || '#059669',
  };

  crews.push(newCrew);
  saveCrewContacts(crews);
  return newCrew;
}

export function updateCrewContact(updated: CrewContact): void {
  const crews = getCrewContacts();
  const cleanPhone = (updated.phone || '').replace(/[^0-9]/g, '');
  const formattedPhone = cleanPhone.startsWith('0')
    ? '62' + cleanPhone.slice(1)
    : cleanPhone.startsWith('62')
    ? cleanPhone
    : '62' + cleanPhone;

  const finalUpdated: CrewContact = {
    ...updated,
    phone: formattedPhone,
  };

  const nextCrews = crews.map((c) => (c.id === updated.id ? finalUpdated : c));
  saveCrewContacts(nextCrews);
}

export function deleteCrewContact(id: string): void {
  const crews = getCrewContacts();
  const nextCrews = crews.filter((c) => c.id !== id);
  saveCrewContacts(nextCrews);
}

export function toggleCrewActiveStatus(id: string): void {
  const crews = getCrewContacts();
  const nextCrews = crews.map((c) => (c.id === id ? { ...c, isActive: !c.isActive } : c));
  saveCrewContacts(nextCrews);
}

// ---------------- ORDER GROUPS (CRUD) ----------------
export function getOrderGroups(): OrderGroupContact[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ORDER_GROUPS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.ORDER_GROUPS, JSON.stringify(INITIAL_ORDER_GROUPS));
      const defaultGrp = INITIAL_ORDER_GROUPS.find((g) => g.isDefault) || INITIAL_ORDER_GROUPS[0];
      if (defaultGrp) {
        APP_CONFIG.orderGroupWhatsApp = {
          name: defaultGrp.name,
          phone: defaultGrp.phone,
          inviteLink: defaultGrp.inviteLink,
        };
      }
      return INITIAL_ORDER_GROUPS;
    }
    const parsed: OrderGroupContact[] = JSON.parse(raw);
    const defaultGrp = parsed.find((g) => g.isDefault) || parsed[0];
    if (defaultGrp) {
      APP_CONFIG.orderGroupWhatsApp = {
        name: defaultGrp.name,
        phone: defaultGrp.phone,
        inviteLink: defaultGrp.inviteLink,
      };
    }
    return parsed;
  } catch {
    return INITIAL_ORDER_GROUPS;
  }
}

export function saveOrderGroups(groups: OrderGroupContact[]): void {
  localStorage.setItem(STORAGE_KEYS.ORDER_GROUPS, JSON.stringify(groups));
  const defaultGrp = groups.find((g) => g.isDefault) || groups[0];
  if (defaultGrp) {
    APP_CONFIG.orderGroupWhatsApp = {
      name: defaultGrp.name,
      phone: defaultGrp.phone,
      inviteLink: defaultGrp.inviteLink,
    };
  }
  notifyListeners();
}

export function addOrderGroup(group: Omit<OrderGroupContact, 'id'>): OrderGroupContact {
  const groups = getOrderGroups();
  const cleanPhone = (group.phone || '').replace(/[^0-9]/g, '');
  const formattedPhone = cleanPhone.startsWith('0')
    ? '62' + cleanPhone.slice(1)
    : cleanPhone.startsWith('62')
    ? cleanPhone
    : '62' + cleanPhone;

  // If new group is set as default, unset others
  const isFirst = groups.length === 0;
  const isDefault = group.isDefault || isFirst;

  if (isDefault) {
    groups.forEach((g) => {
      g.isDefault = false;
    });
  }

  const newGroup: OrderGroupContact = {
    ...group,
    id: `grp-${Date.now()}`,
    phone: formattedPhone,
    isDefault,
    isActive: group.isActive !== undefined ? group.isActive : true,
  };

  groups.push(newGroup);
  saveOrderGroups(groups);
  return newGroup;
}

export function updateOrderGroup(updated: OrderGroupContact): void {
  const groups = getOrderGroups();
  const cleanPhone = (updated.phone || '').replace(/[^0-9]/g, '');
  const formattedPhone = cleanPhone.startsWith('0')
    ? '62' + cleanPhone.slice(1)
    : cleanPhone.startsWith('62')
    ? cleanPhone
    : '62' + cleanPhone;

  if (updated.isDefault) {
    groups.forEach((g) => {
      if (g.id !== updated.id) {
        g.isDefault = false;
      }
    });
  }

  const finalUpdated: OrderGroupContact = {
    ...updated,
    phone: formattedPhone,
  };

  const nextGroups = groups.map((g) => (g.id === updated.id ? finalUpdated : g));
  saveOrderGroups(nextGroups);
}

export function deleteOrderGroup(id: string): void {
  const groups = getOrderGroups();
  let nextGroups = groups.filter((g) => g.id !== id);

  // If deleted group was default, set the first remaining one as default
  if (nextGroups.length > 0 && !nextGroups.some((g) => g.isDefault)) {
    nextGroups[0].isDefault = true;
  }

  saveOrderGroups(nextGroups);
}

export function setDefaultOrderGroup(id: string): void {
  const groups = getOrderGroups();
  const nextGroups = groups.map((g) => ({
    ...g,
    isDefault: g.id === id,
  }));
  saveOrderGroups(nextGroups);
}

// ---------------- RESET DEMO DATA ----------------
export function resetDemoData(): void {
  localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
  localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(INITIAL_ORDERS));
  localStorage.setItem(STORAGE_KEYS.RESERVATIONS, JSON.stringify(INITIAL_RESERVATIONS));
  localStorage.setItem(STORAGE_KEYS.LOYALTY, JSON.stringify(INITIAL_LOYALTIES));
  localStorage.setItem(STORAGE_KEYS.PROMOS, JSON.stringify(INITIAL_PROMO_BANNERS));
  localStorage.setItem(STORAGE_KEYS.ADDONS, JSON.stringify(COMMON_ADD_ONS));
  localStorage.setItem(STORAGE_KEYS.CREW, JSON.stringify(INITIAL_CREW_CONTACTS));
  localStorage.setItem(STORAGE_KEYS.ORDER_GROUPS, JSON.stringify(INITIAL_ORDER_GROUPS));
  APP_CONFIG.crewWhatsApps = INITIAL_CREW_CONTACTS;
  APP_CONFIG.orderGroupWhatsApp = {
    name: INITIAL_ORDER_GROUPS[0].name,
    phone: INITIAL_ORDER_GROUPS[0].phone,
    inviteLink: INITIAL_ORDER_GROUPS[0].inviteLink,
  };
  notifyListeners();
}

