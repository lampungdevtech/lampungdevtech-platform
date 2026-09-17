import { ObjectId } from 'mongodb';

export interface IEvent {
  _id?: string | ObjectId;
  id?: string;
  title: string;
  slug: string;
  description: string;
  category?: string;
  type: string;
  location: string;
  locationUrl?: string;
  coordinates?: {
    lat: string;
    lng: string;
  };
  image: string;
  date: string;
  time: string;
  maxCapacity: number;
  registeredCount: number;
  entryFee: number;
  status: 'upcoming' | 'past';
  registrationStatus: 'OPEN' | 'CLOSED';
  learningPoints?: string[];
  requirements?: string[];
  createdBy?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface IEventRegistration {
  _id?: string | ObjectId;
  id?: string;
  eventId: string;
  userId?: string;
  name: string;
  email: string;
  phone: string;
  organization?: string;
  status: 'REGISTERED' | 'WAITING_LIST' | 'CANCELLED';
  attended: boolean;
  attendedAt?: string | Date | null;
  checkInQrToken: string;
  registeredAt: string | Date;
}

export type GetEventsParams = {
  page?: number;
  limit?: number;
  search?: string;
  status?: 'all' | 'upcoming' | 'past';
  category?: string;
};

export type PaginatedEventsResponse = {
  events: IEvent[];
  metadata: {
    currentPage: number;
    totalPages: number;
    totalEvents: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
};

export type RegistrationResult = {
  success: boolean;
  status: 'REGISTERED' | 'WAITING_LIST';
  message: string;
  qrToken?: string;
  registrationId?: string;
};
