import { MongoClient } from 'mongodb';
import { getInitialDemoDataset, COLLECTION_EVENTS, COLLECTION_EVENT_REGISTRATIONS, COLLECTION_POS_APPLICATIONS, COLLECTION_STORES, COLLECTION_STORE_PRODUCTS, COLLECTION_STORE_ORDERS } from '../services/demo-data.service';

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/lampungdevtech';
const options = {
  serverSelectionTimeoutMS: 3000,
  connectTimeoutMS: 3000,
};

async function runSeed() {
  console.log(`[Seed Demo] Menghubungkan ke MongoDB di: ${uri}`);
  const client = new MongoClient(uri, options);

  try {
    await client.connect();
    const db = client.db();
    const dataset = getInitialDemoDataset();

    console.log('[Seed Demo] Mengisi koleksi Events...');
    const eventsCol = db.collection(COLLECTION_EVENTS);
    await eventsCol.deleteMany({});
    const resEvents = await eventsCol.insertMany(dataset.events as any);
    await eventsCol.createIndex({ slug: 1 }, { unique: true });
    await eventsCol.createIndex({ status: 1, date: 1 });
    await eventsCol.createIndex({ title: 'text', description: 'text', location: 'text' });
    console.log(`-> Berhasil memasukkan ${resEvents.insertedCount} events (Termasuk event status 'past' / selesai).`);

    console.log('[Seed Demo] Mengisi koleksi Event Registrations...');
    const regCol = db.collection(COLLECTION_EVENT_REGISTRATIONS);
    await regCol.deleteMany({});
    const resRegs = await regCol.insertMany(dataset.registrations as any);
    await regCol.createIndex({ checkInQrToken: 1 }, { unique: true });
    await regCol.createIndex({ eventId: 1, email: 1 });
    console.log(`-> Berhasil memasukkan ${resRegs.insertedCount} tiket registrasi (Termasuk QR token pengujian check-in).`);

    console.log('[Seed Demo] Mengisi koleksi POS Applications...');
    const posCol = db.collection(COLLECTION_POS_APPLICATIONS);
    await posCol.deleteMany({});
    const resPos = await posCol.insertMany(dataset.posApplications as any);
    console.log(`-> Berhasil memasukkan ${resPos.insertedCount} pengajuan mitra POS.`);

    console.log('[Seed Demo] Mengisi koleksi Toko, Produk, & Pesanan...');
    const storesCol = db.collection(COLLECTION_STORES);
    await storesCol.deleteMany({});
    await storesCol.insertMany(dataset.stores as any);

    const prodsCol = db.collection(COLLECTION_STORE_PRODUCTS);
    await prodsCol.deleteMany({});
    await prodsCol.insertMany(dataset.products as any);

    const ordersCol = db.collection(COLLECTION_STORE_ORDERS);
    await ordersCol.deleteMany({});
    await ordersCol.insertMany(dataset.orders as any);
    console.log(`-> Berhasil memasukkan toko, ${dataset.products.length} produk, dan simulasi pesanan Wesel Aja.`);

    console.log('[Seed Demo] ✅ Seluruh data seeder pengujian berhasil dimasukkan!');
  } catch (err: any) {
    console.error('[Seed Demo] ❌ Gagal menjalankan seeder:', err.message);
  } finally {
    await client.close();
  }
}

runSeed();
