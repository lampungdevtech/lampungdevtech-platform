import { getDatabase } from '@/lib/mongodb';
import { ulid } from 'ulid';
import { ObjectId } from 'mongodb';
import { events as defaultEvents } from '@/constants/events';
import {
  IEvent,
  IEventRegistration,
  GetEventsParams,
  PaginatedEventsResponse,
  RegistrationResult,
} from '@/types/event';

const COLLECTION_EVENTS = 'events';
const COLLECTION_REGISTRATIONS = 'event_registrations';

/**
 * Memastikan koleksi events memiliki data awal (seeder) jika kosong.
 */
async function ensureSeededEvents() {
  try {
    const db = await getDatabase();
    if (!db) return;

    const count = await db.collection(COLLECTION_EVENTS).countDocuments();
    if (count === 0) {
      const seeded: IEvent[] = defaultEvents.map((e) => ({
        ...e,
        id: String(e.id),
        type: e.type,
        category: e.type,
        registeredCount: 0,
        maxCapacity: 50,
        entryFee: 0,
        registrationStatus: e.status === 'upcoming' ? 'OPEN' : 'CLOSED',
        status: e.status as 'upcoming' | 'past',
        createdAt: new Date(),
        updatedAt: new Date(),
      }));
      await db.collection(COLLECTION_EVENTS).insertMany(seeded as any);
    }
  } catch (error) {
    console.warn('[EventService] Seeder skipped:', (error as Error).message);
  }
}

/**
 * Mengambil daftar events dengan pagination, search, dan filter status.
 */
export async function getEventsService(
  params: GetEventsParams = {}
): Promise<PaginatedEventsResponse> {
  const { page = 1, limit = 10, search = '', status = 'all', category } = params;
  const db = await getDatabase();

  if (!db) {
    // Fallback ke in-memory mock data jika MongoDB belum menyala
    let filtered: IEvent[] = [...defaultEvents].map((e) => ({
      ...e,
      id: String(e.id),
      type: e.type,
      category: e.type,
      registeredCount: 0,
      maxCapacity: 50,
      entryFee: 0,
      registrationStatus: (e.status === 'upcoming' ? 'OPEN' : 'CLOSED') as 'OPEN' | 'CLOSED',
      status: e.status as 'upcoming' | 'past',
    }));

    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          e.location.toLowerCase().includes(q) ||
          (e.description && e.description.toLowerCase().includes(q))
      );
    }

    if (status !== 'all') {
      filtered = filtered.filter((e) => e.status === status);
    }

    if (category) {
      filtered = filtered.filter((e) => e.type.toLowerCase() === category.toLowerCase());
    }

    const totalEvents = filtered.length;
    const totalPages = Math.ceil(totalEvents / limit);
    const startIndex = (page - 1) * limit;
    const pagedEvents = filtered.slice(startIndex, startIndex + limit);

    return {
      events: pagedEvents,
      metadata: {
        currentPage: page,
        totalPages,
        totalEvents,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  await ensureSeededEvents();
  const collection = db.collection<IEvent>(COLLECTION_EVENTS);

  // Build MongoDB query filter
  const query: Record<string, any> = {};

  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { location: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
  }

  if (status !== 'all') {
    query.status = status;
  }

  if (category) {
    query.type = { $regex: category, $options: 'i' };
  }

  const totalEvents = await collection.countDocuments(query);
  const totalPages = Math.ceil(totalEvents / limit);
  const skip = (page - 1) * limit;

  const mongoEvents = await collection
    .find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .toArray();

  const events: IEvent[] = mongoEvents.map((doc) => ({
    ...doc,
    id: doc._id?.toString() || doc.id,
    _id: doc._id?.toString(),
    type: doc.type || doc.category || 'Meetup',
  }));

  return {
    events,
    metadata: {
      currentPage: page,
      totalPages,
      totalEvents,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
  };
}

/**
 * Mengambil detail event berdasarkan slug.
 */
export async function getEventBySlugService(slug: string): Promise<IEvent | null> {
  const db = await getDatabase();

  if (!db) {
    const found = defaultEvents.find((e) => e.slug === slug);
    if (!found) return null;
    return {
      ...found,
      id: String(found.id),
      type: found.type,
      category: found.type,
      registeredCount: 0,
      maxCapacity: 50,
      entryFee: 0,
      registrationStatus: (found.status === 'upcoming' ? 'OPEN' : 'CLOSED') as 'OPEN' | 'CLOSED',
      status: found.status as 'upcoming' | 'past',
    };
  }

  await ensureSeededEvents();
  const collection = db.collection<IEvent>(COLLECTION_EVENTS);
  const event = await collection.findOne({ slug });

  if (!event) {
    // Coba cari dari default constants jika belum di-seed
    const found = defaultEvents.find((e) => e.slug === slug);
    if (!found) return null;
    return {
      ...found,
      id: String(found.id),
      type: found.type,
      category: found.type,
      registeredCount: 0,
      maxCapacity: 50,
      entryFee: 0,
      registrationStatus: (found.status === 'upcoming' ? 'OPEN' : 'CLOSED') as 'OPEN' | 'CLOSED',
      status: found.status as 'upcoming' | 'past',
    };
  }

  return {
    ...event,
    id: event._id?.toString() || event.id,
    _id: event._id?.toString(),
    type: event.type || event.category || 'Meetup',
  };
}

/**
 * Mendaftarkan peserta ke event dengan validasi kuota atomik & auto waiting list.
 */
export async function registerToEventService(params: {
  eventId: string;
  userId?: string;
  name: string;
  email: string;
  phone: string;
  organization?: string;
}): Promise<RegistrationResult> {
  const db = await getDatabase();
  const qrToken = ulid();

  if (!db) {
    // Mode offline / mock
    return {
      success: true,
      status: 'REGISTERED',
      message: 'Pendaftaran berhasil! Tiket Anda telah dibuat.',
      qrToken,
      registrationId: ulid(),
    };
  }

  const eventsCollection = db.collection(COLLECTION_EVENTS);
  const registrationsCollection = db.collection(COLLECTION_REGISTRATIONS);

  // 1. Cek apakah user sudah terdaftar di event ini berdasarkan email
  const existing = await registrationsCollection.findOne({
    eventId: params.eventId,
    email: params.email.toLowerCase(),
    status: { $ne: 'CANCELLED' },
  });

  if (existing) {
    throw new Error('Email ini sudah terdaftar pada acara tersebut.');
  }

  // 2. Query event filter
  let eventFilter: any = { id: params.eventId };
  try {
    if (ObjectId.isValid(params.eventId)) {
      eventFilter = {
        $or: [{ _id: new ObjectId(params.eventId) }, { id: params.eventId }],
      };
    }
  } catch {
    // abaikan error casting
  }

  // 3. Atomik update kuota: naikkan registeredCount hanya jika masih di bawah maxCapacity
  const updateResult = await eventsCollection.findOneAndUpdate(
    {
      ...eventFilter,
      registrationStatus: 'OPEN',
      $expr: { $lt: ['$registeredCount', '$maxCapacity'] },
    },
    { $inc: { registeredCount: 1 } },
    { returnDocument: 'after' }
  );

  let status: 'REGISTERED' | 'WAITING_LIST' = 'REGISTERED';
  let message = 'Pendaftaran berhasil! Tiket QR Anda telah terbit.';

  if (!updateResult) {
    // Kuota penuh -> otomatis masuk waiting list
    status = 'WAITING_LIST';
    message = 'Kuota utama telah penuh. Anda telah berhasil masuk dalam antrean Waiting List.';
  }

  const newRegistration: IEventRegistration = {
    eventId: params.eventId,
    userId: params.userId || '',
    name: params.name,
    email: params.email.toLowerCase(),
    phone: params.phone,
    organization: params.organization || '',
    status,
    attended: false,
    attendedAt: null,
    checkInQrToken: qrToken,
    registeredAt: new Date(),
  };

  const insertResult = await registrationsCollection.insertOne(newRegistration as any);

  return {
    success: true,
    status,
    message,
    qrToken,
    registrationId: insertResult.insertedId.toString(),
  };
}

/**
 * Melakukan check-in peserta menggunakan token QR.
 */
export async function checkInAttendeeService(qrToken: string) {
  const db = await getDatabase();
  if (!db) {
    return {
      success: true,
      message: 'Check-in berhasil (Mock Mode)',
      name: 'Peserta Uji Coba',
    };
  }

  const registrationsCollection = db.collection<IEventRegistration>(COLLECTION_REGISTRATIONS);
  const registration = await registrationsCollection.findOne({ checkInQrToken: qrToken });

  if (!registration) {
    throw new Error('Tiket pendaftaran tidak ditemukan.');
  }

  if (registration.status !== 'REGISTERED') {
    throw new Error(`Status tiket saat ini adalah ${registration.status}. Tidak dapat melakukan check-in.`);
  }

  if (registration.attended) {
    return {
      success: true,
      alreadyAttended: true,
      message: 'Peserta sudah pernah check-in sebelumnya.',
      name: registration.name,
      attendedAt: registration.attendedAt,
    };
  }

  await registrationsCollection.updateOne(
    { _id: registration._id as any },
    { $set: { attended: true, attendedAt: new Date() } }
  );

  return {
    success: true,
    alreadyAttended: false,
    message: 'Check-in berhasil!',
    name: registration.name,
    email: registration.email,
  };
}
