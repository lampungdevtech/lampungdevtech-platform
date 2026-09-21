import { getDatabase } from '../lib/mongodb';
import { ulid } from 'ulid';

export const COLLECTION_FOUNDERS = 'founders';

export interface IFounder {
  id: string;
  name: string;
  title: string; // default: "Co-Founder"
  role: string;  // spesialisasi / peranan teknis
  bio: string;
  bioEn?: string;
  image: string;
  linkedinUrl?: string;
  githubUrl?: string;
  twitterUrl?: string;
  order: number;
  isActive: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export const defaultFounders: IFounder[] = [
  {
    id: 'FND-001',
    name: 'Muhammad Fari Madyan',
    title: 'Co-Founder',
    role: 'Community Lead',
    bio: 'Software engineer dengan pengalaman lebih dari 10 tahun di industri teknologi, perancang arsitektur sistem enterprise dan penggerak komunitas.',
    bioEn: 'Software engineer with over 10 years of tech industry experience, architecting enterprise systems and driving regional engineering communities.',
    image: 'https://media.licdn.com/dms/image/v2/D5603AQFMG8usVzX8uQ/profile-displayphoto-shrink_400_400/B56ZZCzRWnHoAk-/0/1744877459569?e=1750291200&v=beta&t=iwtCnivxa8YPEGEVFyyY3pu60CzHTutHZgskKyo9rWo',
    linkedinUrl: 'https://linkedin.com',
    githubUrl: 'https://github.com/lampungdevtech',
    twitterUrl: 'https://twitter.com/lampungdevtech',
    order: 1,
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'FND-002',
    name: 'Arief Adjie Wicaksono',
    title: 'Co-Founder',
    role: 'Community Manager',
    bio: 'Passionate dalam membangun komunitas teknologi yang inklusif, menghubungkan developer lokal dengan ekosistem digital nasional.',
    bioEn: 'Passionate about building inclusive tech communities, bridging regional developers with the national digital ecosystem.',
    image: 'https://media.licdn.com/dms/image/v2/C5603AQFqKNq4sQ_OCA/profile-displayphoto-shrink_400_400/profile-displayphoto-shrink_400_400/0/1661396529815?e=1750291200&v=beta&t=JtTX3FyNeb0xnu1KUmCoVt0uThUTGr_De5n2qIB4_EY',
    linkedinUrl: 'https://linkedin.com',
    githubUrl: 'https://github.com/lampungdevtech',
    twitterUrl: 'https://twitter.com/lampungdevtech',
    order: 2,
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'FND-003',
    name: 'Ahmad Rosid',
    title: 'Co-Founder',
    role: 'Technical Advisor',
    bio: 'Berpengalaman dalam riset teknologi mendalam, kontribusi open source, arsitektur cloud computing, dan mentoring engineer muda.',
    bioEn: 'Seasoned in deep technology research, active open-source contribution, cloud infrastructure design, and mentoring upcoming engineers.',
    image: 'https://media.licdn.com/dms/image/v2/D5603AQG0XY2piR4R1g/profile-displayphoto-shrink_400_400/B56ZQcNDccGQAk-/0/1735639972263?e=1750291200&v=beta&t=2PCYqnucIU_aMlHzZpWR1TBLie5JYU8GN5RoEhn8z_0',
    linkedinUrl: 'https://linkedin.com',
    githubUrl: 'https://github.com/lampungdevtech',
    twitterUrl: 'https://twitter.com/lampungdevtech',
    order: 3,
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
];

declare global {
  // eslint-disable-next-line no-var
  var _inMemoryFounders: IFounder[] | undefined;
}

function getMemoryFounders(): IFounder[] {
  if (!global._inMemoryFounders) {
    global._inMemoryFounders = [...defaultFounders];
  }
  return global._inMemoryFounders;
}

function setMemoryFounders(founders: IFounder[]) {
  global._inMemoryFounders = founders;
}

export async function ensureSeededFounders() {
  const db = await getDatabase();
  if (!db) return;

  try {
    const collection = db.collection<IFounder>(COLLECTION_FOUNDERS);
    const count = await collection.countDocuments();
    if (count === 0) {
      await collection.insertMany(defaultFounders as any);
      await collection.createIndex({ id: 1 }, { unique: true });
      await collection.createIndex({ order: 1 });
    }
  } catch (err: any) {
    console.warn('[FounderService] Seed check skipped:', err.message);
  }
}

export async function getFoundersService(onlyActive = false): Promise<IFounder[]> {
  const db = await getDatabase();

  if (!db) {
    const list = getMemoryFounders();
    if (onlyActive) {
      return list.filter((f) => f.isActive).sort((a, b) => a.order - b.order);
    }
    return [...list].sort((a, b) => a.order - b.order);
  }

  await ensureSeededFounders();
  const collection = db.collection<IFounder>(COLLECTION_FOUNDERS);
  const query = onlyActive ? { isActive: true } : {};

  const docs = await collection.find(query).sort({ order: 1, createdAt: 1 }).toArray();
  return docs.map((d) => ({
    ...d,
    id: d.id || (d as any)._id?.toString(),
    title: d.title || 'Co-Founder',
  }));
}

export async function getFounderByIdService(id: string): Promise<IFounder | null> {
  const db = await getDatabase();

  if (!db) {
    return getMemoryFounders().find((f) => f.id === id) || null;
  }

  await ensureSeededFounders();
  const collection = db.collection<IFounder>(COLLECTION_FOUNDERS);
  const doc = await collection.findOne({ id });
  if (!doc) return null;

  return {
    ...doc,
    id: doc.id || (doc as any)._id?.toString(),
    title: doc.title || 'Co-Founder',
  };
}

export async function createFounderService(
  input: Omit<IFounder, 'id' | 'createdAt' | 'updatedAt'>
): Promise<IFounder> {
  const id = `FND-${ulid().slice(-6)}`;
  const now = new Date();

  const newFounder: IFounder = {
    ...input,
    id,
    title: input.title?.trim() || 'Co-Founder',
    role: input.role?.trim() || 'Co-Founder',
    order: input.order ?? 99,
    isActive: input.isActive ?? true,
    createdAt: now,
    updatedAt: now,
  };

  const db = await getDatabase();
  if (!db) {
    const current = getMemoryFounders();
    setMemoryFounders([...current, newFounder]);
    return newFounder;
  }

  const collection = db.collection<IFounder>(COLLECTION_FOUNDERS);
  await collection.insertOne(newFounder as any);
  return newFounder;
}

export async function updateFounderService(
  id: string,
  input: Partial<Omit<IFounder, 'id' | 'createdAt'>>
): Promise<IFounder | null> {
  const now = new Date();
  const db = await getDatabase();

  if (!db) {
    const current = getMemoryFounders();
    const idx = current.findIndex((f) => f.id === id);
    if (idx === -1) return null;
    current[idx] = {
      ...current[idx],
      ...input,
      title: input.title ? input.title.trim() : current[idx].title || 'Co-Founder',
      updatedAt: now,
    };
    setMemoryFounders([...current]);
    return current[idx];
  }

  const collection = db.collection<IFounder>(COLLECTION_FOUNDERS);
  const updateData = {
    ...input,
    ...(input.title ? { title: input.title.trim() } : {}),
    updatedAt: now,
  };

  const res = await collection.findOneAndUpdate(
    { id },
    { $set: updateData },
    { returnDocument: 'after' }
  );

  if (!res) return null;
  return {
    ...res,
    id: res.id || (res as any)._id?.toString(),
    title: res.title || 'Co-Founder',
  };
}

export async function deleteFounderService(id: string): Promise<boolean> {
  const db = await getDatabase();

  if (!db) {
    const current = getMemoryFounders();
    const beforeLen = current.length;
    const filtered = current.filter((f) => f.id !== id);
    setMemoryFounders(filtered);
    return filtered.length < beforeLen;
  }

  const collection = db.collection<IFounder>(COLLECTION_FOUNDERS);
  const res = await collection.deleteOne({ id });
  return res.deletedCount > 0;
}
