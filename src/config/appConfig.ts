const DEFAULT_APP_CONFIG = {
  brandName: 'MiJUS Go Healthy',
  appName: 'MijusOrder',
  appLogo: 'https://lh3.googleusercontent.com/d/1_IvjmdeqMr9ge7h2dgpQyZXbHxxHn3oJ',
  logoUrl: 'https://lh3.googleusercontent.com/d/1_IvjmdeqMr9ge7h2dgpQyZXbHxxHn3oJ',
  tagline: 'Real Fruit • 100% Fresh • Go Healthy',
  outletName: 'MiJUS Outlet Utama',
  outletAddress: 'Jl. Rinjani No. 45, Kawasan Kuliner Sehat, Kota Bandung',
  operatingHours: '08:00 - 22:00 WIB',
  isOpen: true,
  
  // WhatsApp Configuration (editable, central)
  adminWhatsApp: '6282260947865', // Format: 62XXXXXXXXXXX
  adminWhatsAppDisplay: '+62 822-6094-7865',

  // Crew WhatsApp on-duty contacts (for Admin "Teruskan ke Crew")
  crewWhatsApps: [
    { id: 'crew-1', name: 'Barista (Budi)', role: 'Barista / Minuman', phone: '6281234567801' },
    { id: 'crew-2', name: 'Kitchen (Siti)', role: 'Dapur / Makanan', phone: '6281234567802' },
    { id: 'crew-3', name: 'Crew Onsite (Agus)', role: 'Operasional Onsite', phone: '6281234567803' },
  ],

  // Order Group WhatsApp configuration
  orderGroupWhatsApp: {
    name: 'Grup Order MiJUS Outlet',
    phone: '6281234567899',
    inviteLink: 'https://chat.whatsapp.com/sampleOrderGroup',
  },
  
  // Google Review URL
  googleReviewUrl: 'https://maps.app.goo.gl/WWUy1YULExtxZaNs8',
  googleReviewURL: 'https://maps.app.goo.gl/WWUy1YULExtxZaNs8',

  // QRIS configuration
  qrisImage: 'https://images.unsplash.com/photo-1595079672139-5470805086e7?w=500&auto=format&fit=crop&q=80',
  qrisConfig: {
    merchantName: 'MIJUS GO HEALTHY',
    nmid: 'ID1020039485712',
    tip: 'Bisa scan dengan GoPay, OVO, Dana, ShopeePay, BCA, Livin, dll.',
  },

  // Payment configuration (Bank accounts)
  bankAccount: [
    {
      bank: 'BCA',
      accountNumber: '8910-2345-67',
      accountHolder: 'MIJUS GO HEALTHY INDONESIA',
      icon: '🏦',
    },
    {
      bank: 'Mandiri',
      accountNumber: '132-00-9876543-2',
      accountHolder: 'MIJUS GO HEALTHY INDONESIA',
      icon: '🏛️',
    },
    {
      bank: 'BRI',
      accountNumber: '0206-01-002345-50-8',
      accountHolder: 'MIJUS GO HEALTHY INDONESIA',
      icon: '🏢',
    }
  ],
  bankAccounts: [
    {
      bank: 'BCA',
      accountNumber: '8910-2345-67',
      accountHolder: 'MIJUS GO HEALTHY INDONESIA',
      icon: '🏦',
    },
    {
      bank: 'Mandiri',
      accountNumber: '132-00-9876543-2',
      accountHolder: 'MIJUS GO HEALTHY INDONESIA',
      icon: '🏛️',
    },
    {
      bank: 'BRI',
      accountNumber: '0206-01-002345-50-8',
      accountHolder: 'MIJUS GO HEALTHY INDONESIA',
      icon: '🏢',
    }
  ],

  // Brand Colors
  brandColors: {
    primaryGreen: '#15803d', // emerald-700
    darkGreen: '#064e3b',    // emerald-950
    accentOrange: '#f97316', // orange-500
    accentYellow: '#eab308', // yellow-500
    bgWhite: '#ffffff',
    bgLight: '#f8fafc',
  },

  // Loyalty rules
  loyalty: {
    minTransactionForStamp: 50000, // Rp 50.000 = 1 Stamp (only on SELESAI)
    stampsRequiredForReward: 10,   // 10 Stamps = Free Salad
    rewardName: 'FREE SALAD',
    rewardDescription: 'Voucher Salad Buah / Sayur Fresh Spesial MiJUS',
  },

  // Admin credentials (mock)
  mockAdmin: {
    phone: '08123456789',
    password: 'admin',
    name: 'Admin MiJUS',
  },

  // Socials
  instagram: '@mijus.gohealthy',
};

// Initialize with saved overrides if present in browser localStorage
function loadSavedConfig() {
  if (typeof window === 'undefined') return DEFAULT_APP_CONFIG;
  try {
    const saved = localStorage.getItem('mijus_app_settings');
    if (saved) {
      const parsed = JSON.parse(saved);
      return { ...DEFAULT_APP_CONFIG, ...parsed };
    }
  } catch {
    // fallback
  }
  return DEFAULT_APP_CONFIG;
}

export const APP_CONFIG = loadSavedConfig();

export function saveAppConfig(overrides: Partial<typeof DEFAULT_APP_CONFIG>) {
  Object.assign(APP_CONFIG, overrides);
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('mijus_app_settings', JSON.stringify(APP_CONFIG));
    } catch {
      // ignore
    }
  }
}

