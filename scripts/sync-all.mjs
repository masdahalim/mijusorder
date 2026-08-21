import fs from 'fs';

const API_BASE = "https://qpmq42rd.ap-southeast.insforge.app/api/database/records";
const ANON_KEY = "anon_8306839b9ffaa6949e16f425647064ee7cdab79683ed60eb8fa8cdd5842bf7c0";

const headers = {
  "Content-Type": "application/json",
  "apikey": ANON_KEY,
  "Authorization": `Bearer ${ANON_KEY}`,
  "Prefer": "resolution=merge-duplicates"
};

async function uploadTable(tableName, records) {
  console.log(`\n🚀 Uploading ${records.length} records to '${tableName}'...`);
  // Upload in chunks of 20
  for (let i = 0; i < records.length; i += 20) {
    const chunk = records.slice(i, i + 20);
    try {
      const res = await fetch(`${API_BASE}/${tableName}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(chunk)
      });
      if (res.ok) {
        console.log(`  ✅ [${tableName}] Batch ${i / 20 + 1} (${chunk.length} items) uploaded successfully.`);
      } else {
        const errText = await res.text();
        console.error(`  ❌ [${tableName}] Error on batch ${i / 20 + 1}:`, res.status, errText);
      }
    } catch (e) {
      console.error(`  ❌ [${tableName}] Network error:`, e.message);
    }
  }
}

// Parse mockData.ts to extract products, orders, reservations, loyalties
async function run() {
  console.log("=== STARTING FULL INSFORGE SYNCHRONIZATION ===");
  
  // 1. Let's load the data from src/data/mockData.ts
  const mockDataRaw = fs.readFileSync('./src/data/mockData.ts', 'utf8');

  // Let's create a temporary bundle using esbuild to cleanly import TS data
  const { execSync } = await import('child_process');
  execSync('npx esbuild src/data/mockData.ts --bundle --platform=node --format=esm --outfile=scripts/.temp-mock.mjs');
  
  const mockModule = await import('./.temp-mock.mjs');
  const { INITIAL_PRODUCTS, INITIAL_ORDERS, INITIAL_RESERVATIONS, INITIAL_LOYALTIES } = mockModule;

  // Clean temp file
  try { fs.unlinkSync('scripts/.temp-mock.mjs'); } catch (_) {}

  console.log(`Found:`);
  console.log(`- Products: ${INITIAL_PRODUCTS.length}`);
  console.log(`- Orders: ${INITIAL_ORDERS.length}`);
  console.log(`- Reservations: ${INITIAL_RESERVATIONS.length}`);
  console.log(`- Loyalties: ${Object.keys(INITIAL_LOYALTIES).length}`);

  // 1. Map and Upload Products
  const dbProducts = INITIAL_PRODUCTS.map((p) => ({
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

  await uploadTable('mijus_products', dbProducts);

  // 2. Map and Upload Orders
  const dbOrders = INITIAL_ORDERS.map((o) => ({
    id: o.id,
    customer_name: o.customer.name,
    customer_phone: o.customer.phone || '081234567890',
    customer_table_number: o.customer.tableNumber || null,
    customer_pickup_time: o.customer.pickupTime || null,
    customer_address: o.customer.address || null,
    customer_notes: o.customer.notes || o.customer.addressNotes || null,
    order_type: o.orderType,
    order_status: o.orderStatus,
    payment_method: o.paymentMethod,
    payment_status: o.paymentStatus,
    items: o.items || [],
    subtotal: o.subtotal,
    discount: o.discount || 0,
    total: o.total,
    source: o.source || 'CUSTOMER_WEB',
    reviewed_google: Boolean(o.reviewedGoogle),
    created_at: o.createdAt || new Date().toISOString(),
  }));

  await uploadTable('mijus_orders', dbOrders);

  // 3. Map and Upload Reservations
  const dbReservations = INITIAL_RESERVATIONS.map((r) => ({
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

  await uploadTable('mijus_reservations', dbReservations);

  // 4. Map and Upload Loyalties
  const dbLoyalties = Object.values(INITIAL_LOYALTIES).map((l) => ({
    phone: l.phone,
    name: l.name,
    total_stamps: l.stamps || 0,
    rewards_available: l.rewardsAvailable || 0,
    total_spent: l.totalSpent || 0,
    last_visit: l.lastOrderAt || new Date().toISOString(),
    created_at: new Date().toISOString(),
  }));

  await uploadTable('mijus_loyalties', dbLoyalties);

  // 5. Seed Reviews if needed
  const initialReviews = [
    {
      id: 'rev-1',
      customer_name: 'Siti Rahmawati',
      rating: 5,
      comment: 'Jus Glowing Berry-nya segar banget dan kerasa buah aslinya! Packaging rapi dan bersih.',
      order_id: '#MJ-84209',
      tags: ['Segar Alami', 'Pelayanan Cepat'],
      is_published: true,
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    },
    {
      id: 'rev-2',
      customer_name: 'Budi Santoso',
      rating: 5,
      comment: 'Salad buahnya juara, buah crunchy dan saus yogurtnya pas tidak eneg! Sangat rekomen buat healthy diet.',
      order_id: '#MJ-84208',
      tags: ['Porsi Pas', 'Segar Alami'],
      is_published: true,
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    },
    {
      id: 'rev-3',
      customer_name: 'Masda Halim',
      rating: 5,
      comment: 'Order lewat web lancar, konfirmasi WhatsApp cepat dan jus alpukat coklatnya mantap!',
      order_id: '#MJ-37395',
      tags: ['Pelayanan Cepat', 'Recommended'],
      is_published: true,
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    }
  ];

  await uploadTable('mijus_reviews', initialReviews);

  console.log("\n✨ ALL DATA HAS BEEN SUCCESSFULLY SYNCHRONIZED TO INSFORGE!");
}

run().catch(console.error);
