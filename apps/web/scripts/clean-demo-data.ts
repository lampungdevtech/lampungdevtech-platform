import { MongoClient } from 'mongodb';
import {
  COLLECTION_EVENTS,
  COLLECTION_EVENT_REGISTRATIONS,
  COLLECTION_POS_APPLICATIONS,
  COLLECTION_STORES,
  COLLECTION_STORE_PRODUCTS,
  COLLECTION_STORE_ORDERS,
} from '../services/demo-data.service';

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/lampungdevtech';
const options = {
  serverSelectionTimeoutMS: 3000,
  connectTimeoutMS: 3000,
};

async function runClean() {
  console.log(`[Clean Demo] Menghubungkan ke MongoDB di: ${uri}`);
  const client = new MongoClient(uri, options);

  try {
    await client.connect();
    const db = client.db();

    console.log('[Clean Demo] Mengosongkan koleksi data demo...');
    const [delEvents, delRegs, delPos, delStores, delProds, delOrders] = await Promise.all([
      db.collection(COLLECTION_EVENTS).deleteMany({}),
      db.collection(COLLECTION_EVENT_REGISTRATIONS).deleteMany({}),
      db.collection(COLLECTION_POS_APPLICATIONS).deleteMany({}),
      db.collection(COLLECTION_STORES).deleteMany({}),
      db.collection(COLLECTION_STORE_PRODUCTS).deleteMany({}),
      db.collection(COLLECTION_STORE_ORDERS).deleteMany({}),
    ]);

    console.log(`-> Dihapus ${delEvents.deletedCount} events.`);
    console.log(`-> Dihapus ${delRegs.deletedCount} tiket registrasi.`);
    console.log(`-> Dihapus ${delPos.deletedCount} pengajuan mitra POS.`);
    console.log(`-> Dihapus ${delStores.deletedCount} toko mitra.`);
    console.log(`-> Dihapus ${delProds.deletedCount} produk digital/fisik.`);
    console.log(`-> Dihapus ${delOrders.deletedCount} pesanan toko.`);

    console.log('[Clean Demo] ✅ Seluruh data demo berhasil dibersihkan dari database!');
  } catch (err: any) {
    console.error('[Clean Demo] ❌ Gagal membersihkan data:', err.message);
  } finally {
    await client.close();
  }
}

runClean();
