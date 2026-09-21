export type UserRole = 'PARENT' | 'TEACHER' | 'ADMIN';

export interface MemberProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  childName?: string;
  childAge?: number;
  registeredAt: string;
}

export interface Program {
  id: string;
  tenantId: string;
  title: string;
  description: string;
  ageGroup: string;
  category: 'CODING' | 'MATH' | 'SCIENCE_ROBLOX' | 'CREATIVE';
  thumbnailUrl: string;
  isActive: boolean;
}

export interface ClassSession {
  id: string;
  tenantId: string;
  programId: string;
  programTitle: string;
  teacherId: string;
  teacherName: string;
  scheduleTime: string;
  maxSeats: number;
  bookedSeats: number;
  availableSeats: number;
  price: number;
  sessionLink?: string;
  status: 'ACTIVE' | 'FULL' | 'COMPLETED';
}

export interface Enrollment {
  id: string;
  tenantId: string;
  classId: string;
  programTitle?: string;
  scheduleTime?: string;
  studentId: string;
  studentName: string;
  parentId: string;
  parentName: string;
  parentPhone: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
  paymentReference: string;
  paymentMethod?: string;
  paymentFee?: number;
  enrolledAt: string;
}

export interface HomeworkLog {
  id: string;
  enrollmentId: string;
  title: string;
  score: number;
  teacherFeedback: string;
  completedAt?: string;
  createdAt: string;
}

export interface WeeklySummary {
  id: string;
  studentId: string;
  studentName?: string;
  weekNumber: number;
  aiGeneratedSummary: string;
  rawTeacherNotes: string;
  conceptsMastered: string[];
  createdAt: string;
}

export interface AdminCapacityReport {
  totalPrograms: number;
  totalClasses: number;
  totalSeats: number;
  bookedSeats: number;
  occupancyRate: number;
  activeBatches: number;
  classes: ClassSession[];
}
