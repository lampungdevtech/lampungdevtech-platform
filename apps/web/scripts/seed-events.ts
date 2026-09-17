import { MongoClient } from 'mongodb';
import { events } from '../constants/events';

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/lampungdevtech';

async function seed() {
  console.log(`[Seed Events] Menghubungkan ke MongoDB di: ${uri}`);
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db();
    const eventsCollection = db.collection('events');

    console.log('[Seed Events] Mengosongkan koleksi events lama...');
    await eventsCollection.deleteMany({});

    console.log('[Seed Events] Memasukkan data awal events komunitas...');
    const formattedEvents = events.map((e) => ({
      ...e,
      id: String(e.id),
      maxCapacity: 50,
      registeredCount: 0,
      entryFee: 0,
      registrationStatus: e.status === 'upcoming' ? 'OPEN' : 'CLOSED',
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    const result = await eventsCollection.insertMany(formattedEvents);
    console.log(`[Seed Events] Berhasil memasukkan ${result.insertedCount} events ke MongoDB.`);

    // Buat indeks penting
    console.log('[Seed Events] Membuat indeks pencarian & keunikan...');
    await eventsCollection.createIndex({ slug: 1 }, { unique: true });
    await eventsCollection.createIndex({ status: 1, eventDate: 1 });
    await eventsCollection.createIndex({ title: 'text', description: 'text', location: 'text' });

    const regCollection = db.collection('event_registrations');
    await regCollection.createIndex({ eventId: 1, email: 1 }, { unique: true });
    await regCollection.createIndex({ checkInQrToken: 1 }, { unique: true });

    console.log('[Seed Events] Selesai! Indeks berhasil dibuat.');
  } catch (err: any) {
    console.error('[Seed Events] Terjadi kesalahan:', err.message);
  } finally {
    await client.close();
  }
}

seed();
