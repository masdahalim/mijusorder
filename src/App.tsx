import React, { useState, useEffect, useMemo } from 'react';
import {
  Product,
  CartItem,
  Order,
  Reservation,
  CustomerLoyalty,
  ProductCategory,
  PromoBanner as PromoBannerType,
  AddOnOption,
} from './types';
import {
  getProducts,
  getOrders,
  getReservations,
  getLoyalties,
  getPromos,
  getAddOns,
  getActiveCustomer,
  setActiveCustomer,
  subscribeToStore,
} from './services/storeService';
import { APP_CONFIG } from './config/appConfig';
import { CATEGORIES } from './data/mockData';

// Customer Components
import { Header } from './components/customer/Header';
import { CategoryNav } from './components/customer/CategoryNav';
import { PromoBanner } from './components/customer/PromoBanner';
import { LoyaltyHomeCard } from './components/customer/LoyaltyHomeCard';
import { CekStampModal } from './components/customer/CekStampModal';
import { ProductCard } from './components/customer/ProductCard';
import { ProductDetailModal } from './components/customer/ProductDetailModal';
import { FloatingCart } from './components/customer/FloatingCart';
import { CartModal } from './components/customer/CartModal';
import { CheckoutModal } from './components/customer/CheckoutModal';
import { OrderSuccessModal } from './components/customer/OrderSuccessModal';
import { OrderTracker } from './components/customer/OrderTracker';
import { LoyaltyView } from './components/customer/LoyaltyView';
import { ProfileView } from './components/customer/ProfileView';
import { BottomNav, CustomerTab } from './components/customer/BottomNav';
import { PWAInstallPrompt } from './components/common/PWAInstallPrompt';

// Admin Components
import { AdminLogin } from './components/admin/AdminLogin';
import { AdminLayout } from './components/admin/AdminLayout';

// Icons
import {
  Search,
  X,
  Flame,
  Sparkles,
  ShoppingBag,
  SlidersHorizontal,
  ChevronRight,
} from 'lucide-react';

type AppRole = 'CUSTOMER' | 'ADMIN';

export default function App() {
  // Global Store States synced with localStorage
  const [products, setProducts] = useState<Product[]>(getProducts);
  const [orders, setOrders] = useState<Order[]>(getOrders);
  const [reservations, setReservations] = useState<Reservation[]>(getReservations);
  const [loyalties, setLoyalties] = useState<Record<string, CustomerLoyalty>>(getLoyalties);
  const [promos, setPromos] = useState<PromoBannerType[]>(getPromos);
  const [addOns, setAddOns] = useState<AddOnOption[]>(getAddOns);

  // Active Customer Profile
  const [activeCustomer, setActiveCustomerState] = useState(getActiveCustomer);

  // Sync listener on store updates
  useEffect(() => {
    const unsubscribe = subscribeToStore(() => {
      setProducts(getProducts());
      setOrders(getOrders());
      setReservations(getReservations());
      setLoyalties(getLoyalties());
      setPromos(getPromos());
      setAddOns(getAddOns());
      setActiveCustomerState(getActiveCustomer());
    });
    return unsubscribe;
  }, []);

  // Role Navigation synced with URL Routing (/ vs /admin)
  const [role, setRole] = useState<AppRole>(() => {
    if (typeof window !== 'undefined') {
      return window.location.pathname.startsWith('/admin') || window.location.hash.startsWith('#admin')
        ? 'ADMIN'
        : 'CUSTOMER';
    }
    return 'CUSTOMER';
  });
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);

  // Sync role changes with browser history/URL
  const navigateToRole = (newRole: AppRole) => {
    setRole(newRole);
    if (typeof window !== 'undefined') {
      const targetPath = newRole === 'ADMIN' ? '/admin' : '/';
      if (window.location.pathname !== targetPath) {
        window.history.pushState({ role: newRole }, '', targetPath);
      }
    }
  };

  // Listen to browser Back/Forward (popstate) navigation
  useEffect(() => {
    const handlePopState = () => {
      const isAdminRoute =
        window.location.pathname.startsWith('/admin') || window.location.hash.startsWith('#admin');
      setRole(isAdminRoute ? 'ADMIN' : 'CUSTOMER');
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Customer Navigation State
  const [customerTab, setCustomerTab] = useState<CustomerTab>('HOME');
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | 'Semua'>('Semua');
  const [searchQuery, setSearchQuery] = useState('');

  // Cart & Modals
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isCekStampOpen, setIsCekStampOpen] = useState(false);
  const [lastSuccessOrder, setLastSuccessOrder] = useState<Order | null>(null);

  // Active Customer Loyalty Data
  const customerLoyalty = useMemo(() => {
    const phone = activeCustomer?.phone || '';
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    return loyalties[cleanPhone] || loyalties[phone] || null;
  }, [loyalties, activeCustomer?.phone]);

  // Active Orders Count for Badge
  const activeOrdersCount = useMemo(() => {
    const phone = activeCustomer?.phone || '';
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    return orders.filter((o) => {
      const oPhone = (o.customer?.phone || '').replace(/[^0-9]/g, '');
      const isMine = oPhone === cleanPhone || (o.customer && o.customer.phone === phone);
      return isMine && o.orderStatus !== 'SELESAI' && o.orderStatus !== 'DIBATALKAN';
    }).length;
  }, [orders, activeCustomer?.phone]);

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    products.forEach((p) => {
      counts[p.category] = (counts[p.category] || 0) + 1;
    });
    return counts;
  }, [products]);

  // Filtered Products for Customer Catalog
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchCategory =
        selectedCategory === 'Semua' || product.category === selectedCategory;

      if (!matchCategory) return false;

      if (!searchQuery.trim()) return true;

      const q = searchQuery.toLowerCase();
      const matchName = product.name.toLowerCase().includes(q);
      const matchDesc = product.description.toLowerCase().includes(q);
      const matchTags = product.tags?.some((t) => t.toLowerCase().includes(q));
      const matchBenefits = product.benefits?.some((b) => b.toLowerCase().includes(q));

      return matchName || matchDesc || matchTags || matchBenefits;
    });
  }, [products, selectedCategory, searchQuery]);

  // Best Sellers (Top recommendations)
  const bestSellers = useMemo(() => {
    return products.filter((p) => p.isBestSeller && p.isAvailable);
  }, [products]);

  // Cart Operations
  const handleAddToCart = (item: Omit<CartItem, 'cartItemId'>) => {
    if (item.product.isAvailable === false || item.product.isOutOfStock) {
      alert('Maaf, produk ini sedang habis dan tidak dapat ditambahkan ke keranjang.');
      return;
    }
    const newItem: CartItem = {
      ...item,
      cartItemId: `cart-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    };
    setCart((prev) => [...prev, newItem]);
  };

  const handleUpdateCartQuantity = (cartItemId: string, newQty: number) => {
    if (newQty <= 0) {
      handleRemoveCartItem(cartItemId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => {
        if (item.cartItemId === cartItemId) {
          return {
            ...item,
            quantity: newQty,
            totalPrice: item.unitPrice * newQty,
          };
        }
        return item;
      })
    );
  };

  const handleRemoveCartItem = (cartItemId: string) => {
    setCart((prev) => prev.filter((item) => item.cartItemId !== cartItemId));
  };

  const handleClearCart = () => {
    setCart([]);
  };

  const handleOrderCreatedSuccess = (order: Order) => {
    setCart([]);
    setLastSuccessOrder(order);
  };

  const handleUpdateCustomerPhone = (phone: string, name: string) => {
    setActiveCustomer(phone, name);
  };

  // -------------------------------------------------------------
  // RENDER: ADMIN PORTAL (/admin)
  // -------------------------------------------------------------
  if (role === 'ADMIN') {
    if (!isAdminAuthenticated) {
      return (
        <AdminLogin
          onLoginSuccess={() => setIsAdminAuthenticated(true)}
          onBackToCustomer={() => navigateToRole('CUSTOMER')}
        />
      );
    }

    return (
      <AdminLayout
        orders={orders}
        reservations={reservations}
        loyalties={loyalties}
        products={products}
        promos={promos}
        addOns={addOns}
        onLogout={() => {
          setIsAdminAuthenticated(false);
          navigateToRole('CUSTOMER');
        }}
        onBackToCustomer={() => navigateToRole('CUSTOMER')}
      />
    );
  }

  // -------------------------------------------------------------
  // RENDER: CUSTOMER ORDERING APP (Mobile-first GoFood UX)
  // -------------------------------------------------------------
  return (
    <div className="min-h-screen bg-zinc-100/90 text-zinc-800 antialiased flex flex-col justify-between">
      {/* Main Container constrained to mobile width on larger screens for perfect GoFood feel */}
      <div className="w-full max-w-md mx-auto bg-white min-h-screen shadow-2xl flex flex-col relative pb-20">
        {/* ================= TAB: HOME / CATALOG ================= */}
        {customerTab === 'HOME' && (
          <div className="flex-1">
            {/* Header with outlet status & details */}
            <Header onOpenInfo={() => setCustomerTab('PROFIL')} />

            {/* Sticky Search Bar */}
            <div className="p-4 bg-white border-b border-emerald-50 sticky top-[72px] z-20 shadow-xs">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-zinc-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari jus segar, detox, rice bowl, toast..."
                  className="w-full text-xs sm:text-sm pl-10 pr-9 py-2.5 rounded-2xl bg-zinc-100 border border-zinc-200/80 focus:outline-hidden focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 transition-all placeholder:text-zinc-400"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-3 text-zinc-400 hover:text-zinc-600 p-0.5"
                    aria-label="Hapus Pencarian"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Dynamic Promo Banner Carousel */}
            {!searchQuery && (
              <PromoBanner
                onSelectCategory={(cat) => {
                  setSelectedCategory(cat);
                  // smooth scroll down to category
                  window.scrollTo({ top: 350, behavior: 'smooth' });
                }}
                onOpenLoyalty={() => setIsCekStampOpen(true)}
              />
            )}

            {/* 💚 Loyalty MiJUS Feature Card (Home Access) */}
            {!searchQuery && (
              <LoyaltyHomeCard
                loyalty={customerLoyalty}
                onOpenCekStamp={() => setIsCekStampOpen(true)}
              />
            )}

            {/* Category Navigation Pills */}
            <CategoryNav
              selectedCategory={selectedCategory}
              onSelectCategory={(cat) => setSelectedCategory(cat)}
              categoryCounts={categoryCounts}
            />

            {/* Catalog Content */}
            <div className="p-4 space-y-6">
              {/* Best Seller Section (Shown on 'Semua' and no search query) */}
              {selectedCategory === 'Semua' && !searchQuery && bestSellers.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-1.5">
                      <Flame className="w-5 h-5 text-amber-500 fill-amber-500" />
                      <h2 className="font-black text-base text-zinc-900 tracking-tight">
                        Paling Favorit di MiJUS
                      </h2>
                    </div>
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      Best Seller
                    </span>
                  </div>

                  <div className="space-y-3">
                    {bestSellers.slice(0, 3).map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        onSelect={(p) => setSelectedProduct(p)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Main Products List */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-black text-base text-zinc-900 tracking-tight flex items-center gap-1.5">
                    <span>
                      {selectedCategory === 'Semua' ? 'Semua Pilihan Menu' : selectedCategory}
                    </span>
                  </h2>
                  <span className="text-xs text-zinc-500 font-semibold">
                    {filteredProducts.length} menu tersedia
                  </span>
                </div>

                {filteredProducts.length === 0 ? (
                  <div className="py-12 text-center text-zinc-400">
                    <div className="w-16 h-16 bg-zinc-100 rounded-3xl mx-auto flex items-center justify-center text-3xl mb-3">
                      🔍
                    </div>
                    <p className="font-bold text-zinc-700 text-sm">Menu tidak ditemukan</p>
                    <p className="text-xs text-zinc-500 mt-1">
                      Coba cari dengan kata kunci lain atau pilih kategori menu lainnya.
                    </p>
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedCategory('Semua');
                      }}
                      className="mt-4 px-4 py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-md"
                    >
                      Reset Filter
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredProducts.map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        onSelect={(p) => setSelectedProduct(p)}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB: PESANAN (ORDER TRACKER) ================= */}
        {customerTab === 'PESANAN' && (
          <OrderTracker
            orders={orders}
            currentPhone={activeCustomer?.phone || '081298765432'}
            onBackToHome={() => setCustomerTab('HOME')}
            onRefreshOrders={() => setOrders(getOrders())}
          />
        )}

        {/* ================= TAB: LOYALTY CARD ================= */}
        {customerTab === 'LOYALTY' && (
          <LoyaltyView
            loyalty={customerLoyalty}
            customerPhone={activeCustomer?.phone || '081298765432'}
            customerName={activeCustomer?.name || 'Rian Saputra'}
            onUpdatePhone={handleUpdateCustomerPhone}
            onGoToMenu={() => setCustomerTab('HOME')}
          />
        )}

        {/* ================= TAB: PROFIL & OUTLET ================= */}
        {customerTab === 'PROFIL' && (
          <ProfileView
            customerName={activeCustomer?.name || 'Rian Saputra'}
            customerPhone={activeCustomer?.phone || '081298765432'}
            loyalty={customerLoyalty}
            onUpdatePhone={handleUpdateCustomerPhone}
          />
        )}

        {/* Floating Cart Bar (Shown when cart has items and on HOME tab) */}
        {customerTab === 'HOME' && (
          <FloatingCart items={cart} onOpenCart={() => setIsCartOpen(true)} />
        )}

        {/* Bottom Navigation Bar */}
        <BottomNav
          activeTab={customerTab}
          onChangeTab={(tab) => setCustomerTab(tab)}
          activeOrderCount={activeOrdersCount}
          hasReward={(customerLoyalty?.rewardsAvailable || 0) > 0}
        />
      </div>

      {/* ================= MODALS ================= */}

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={handleAddToCart}
      />

      {/* Cart Modal */}
      <CartModal
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cart}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onClearCart={handleClearCart}
        onProceedCheckout={() => setIsCheckoutOpen(true)}
      />

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        items={cart}
        onOrderSuccess={handleOrderCreatedSuccess}
        defaultCustomer={activeCustomer}
      />

      {/* Cek Stamp MiJUS Modal (Tanpa Login) */}
      <CekStampModal
        isOpen={isCekStampOpen}
        onClose={() => setIsCekStampOpen(false)}
        onSelectCustomerPhone={handleUpdateCustomerPhone}
        onGoToMenu={() => {
          setIsCekStampOpen(false);
          setCustomerTab('HOME');
        }}
        initialPhone={activeCustomer?.phone || ''}
      />

      {/* Order Success Confetti & WhatsApp Confirmation Modal */}
      <OrderSuccessModal
        order={lastSuccessOrder}
        onClose={() => setLastSuccessOrder(null)}
        onTrackOrder={() => {
          setLastSuccessOrder(null);
          setCustomerTab('PESANAN');
        }}
      />

      {/* PWA Install Prompt Banner Overlay */}
      <PWAInstallPrompt />
    </div>
  );
}
