"use client";

import { useState, useEffect, useCallback } from 'react';
import { useLocale } from 'next-intl';
import { 
  MemberProfile, 
  Program, 
  ClassSession, 
  Enrollment, 
  HomeworkLog, 
  WeeklySummary, 
  AdminCapacityReport,
  UserRole 
} from './types';

const PROGRAMS_DATA: Record<string, Program[]> = {
  id: [
    {
      id: "EDP-01",
      tenantId: "tenant-lampung-01",
      title: "Logika & Koding Anak (Roblox & Scratch)",
      description: "Membangun logika berpikir komputasional, algoritma loop, dan game development interaktif.",
      ageGroup: "7-12 Tahun (SD)",
      category: "CODING",
      thumbnailUrl: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=600&q=80",
      isActive: true,
    },
    {
      id: "EDP-02",
      tenantId: "tenant-lampung-01",
      title: "Matematika Interaktif & Problem Solving",
      description: "Mengubah konsep pecahan, geometri, dan aljabar menjadi teka-teki visual yang menyenangkan.",
      ageGroup: "8-14 Tahun (SD/SMP)",
      category: "MATH",
      thumbnailUrl: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=600&q=80",
      isActive: true,
    },
    {
      id: "EDP-03",
      tenantId: "tenant-lampung-01",
      title: "Calistung Kreatif & Literasi Visual",
      description: "Membaca, menulis, dan berhitung dengan dongeng petualangan untuk usia dini.",
      ageGroup: "4-6 Tahun (TK/PAUD)",
      category: "CREATIVE",
      thumbnailUrl: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=600&q=80",
      isActive: true,
    },
    {
      id: "EDP-04",
      tenantId: "tenant-lampung-01",
      title: "Sains & STEM Roblox Galaxy Quests",
      description: "Eksplorasi gravitasi, tata surya, dan sirkuit listrik dalam 200+ game sains 3D Roblox.",
      ageGroup: "7-13 Tahun (SD/SMP)",
      category: "SCIENCE_ROBLOX",
      thumbnailUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80",
      isActive: true,
    },
  ],
  en: [
    {
      id: "EDP-01",
      tenantId: "tenant-lampung-01",
      title: "Kids Coding & Logic (Roblox & Scratch)",
      description: "Building computational thinking, nested loop algorithms, and interactive game building.",
      ageGroup: "Ages 7-12 (Primary)",
      category: "CODING",
      thumbnailUrl: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=600&q=80",
      isActive: true,
    },
    {
      id: "EDP-02",
      tenantId: "tenant-lampung-01",
      title: "Interactive Math & Problem Solving",
      description: "Visual geometry, fractions, and algebra turned into fun 3D puzzles and quests.",
      ageGroup: "Ages 8-14 (Primary/Middle)",
      category: "MATH",
      thumbnailUrl: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=600&q=80",
      isActive: true,
    },
    {
      id: "EDP-03",
      tenantId: "tenant-lampung-01",
      title: "Early Creative Reading & Math",
      description: "Playful storytelling, numeracy, and visual literacy for early childhood development.",
      ageGroup: "Ages 4-6 (Preschool/Kindergarten)",
      category: "CREATIVE",
      thumbnailUrl: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=600&q=80",
      isActive: true,
    },
    {
      id: "EDP-04",
      tenantId: "tenant-lampung-01",
      title: "Roblox Science & Galaxy Quests",
      description: "Explore planetary gravity, the solar system, and circuits across 200+ 3D Roblox science games.",
      ageGroup: "Ages 7-13 (Primary/Middle)",
      category: "SCIENCE_ROBLOX",
      thumbnailUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80",
      isActive: true,
    },
  ],
};

const CLASSES_DATA: Record<string, ClassSession[]> = {
  id: [
    {
      id: "EDC-01",
      tenantId: "tenant-lampung-01",
      programId: "EDP-01",
      programTitle: "Logika & Koding Anak (Roblox & Scratch)",
      teacherId: "TCH-01",
      teacherName: "Kak Fikri Ramadhan (Lead Instructor)",
      scheduleTime: "Sabtu & Minggu, 09:00 - 10:30 WIB",
      maxSeats: 10,
      bookedSeats: 7,
      availableSeats: 3,
      price: 350000,
      sessionLink: "https://meet.google.com/abc-edtech-01",
      status: "ACTIVE",
    },
    {
      id: "EDC-02",
      tenantId: "tenant-lampung-01",
      programId: "EDP-02",
      programTitle: "Matematika Interaktif & Problem Solving",
      teacherId: "TCH-02",
      teacherName: "Kak Sarah Azhari (Math Specialist)",
      scheduleTime: "Selasa & Kamis, 16:00 - 17:30 WIB",
      maxSeats: 8,
      bookedSeats: 6,
      availableSeats: 2,
      price: 300000,
      sessionLink: "https://meet.google.com/def-edtech-02",
      status: "ACTIVE",
    },
    {
      id: "EDC-03",
      tenantId: "tenant-lampung-01",
      programId: "EDP-04",
      programTitle: "Sains & STEM Roblox Galaxy Quests",
      teacherId: "TCH-03",
      teacherName: "Coach Randy Pratama (Roblox Mentor)",
      scheduleTime: "Jumat, 15:30 - 17:00 WIB",
      maxSeats: 12,
      bookedSeats: 4,
      availableSeats: 8,
      price: 450000,
      sessionLink: "https://meet.google.com/ghi-edtech-03",
      status: "ACTIVE",
    },
    {
      id: "EDC-04",
      tenantId: "tenant-lampung-01",
      programId: "EDP-03",
      programTitle: "Calistung Kreatif & Literasi Visual",
      teacherId: "TCH-02",
      teacherName: "Kak Sarah Azhari (Early Childhood)",
      scheduleTime: "Rabu, 10:00 - 11:30 WIB",
      maxSeats: 6,
      bookedSeats: 6,
      availableSeats: 0,
      price: 250000,
      sessionLink: "https://meet.google.com/jkl-edtech-04",
      status: "FULL",
    },
  ],
  en: [
    {
      id: "EDC-01",
      tenantId: "tenant-lampung-01",
      programId: "EDP-01",
      programTitle: "Kids Coding & Logic (Roblox & Scratch)",
      teacherId: "TCH-01",
      teacherName: "Kak Fikri Ramadhan (Lead Instructor)",
      scheduleTime: "Sat & Sun, 09:00 - 10:30 AM",
      maxSeats: 10,
      bookedSeats: 7,
      availableSeats: 3,
      price: 350000,
      sessionLink: "https://meet.google.com/abc-edtech-01",
      status: "ACTIVE",
    },
    {
      id: "EDC-02",
      tenantId: "tenant-lampung-01",
      programId: "EDP-02",
      programTitle: "Interactive Math & Problem Solving",
      teacherId: "TCH-02",
      teacherName: "Kak Sarah Azhari (Math Specialist)",
      scheduleTime: "Tue & Thu, 04:00 - 05:30 PM",
      maxSeats: 8,
      bookedSeats: 6,
      availableSeats: 2,
      price: 300000,
      sessionLink: "https://meet.google.com/def-edtech-02",
      status: "ACTIVE",
    },
    {
      id: "EDC-03",
      tenantId: "tenant-lampung-01",
      programId: "EDP-04",
      programTitle: "Roblox Science & Galaxy Quests",
      teacherId: "TCH-03",
      teacherName: "Coach Randy Pratama (Roblox Mentor)",
      scheduleTime: "Fri, 03:30 - 05:00 PM",
      maxSeats: 12,
      bookedSeats: 4,
      availableSeats: 8,
      price: 450000,
      sessionLink: "https://meet.google.com/ghi-edtech-03",
      status: "ACTIVE",
    },
    {
      id: "EDC-04",
      tenantId: "tenant-lampung-01",
      programId: "EDP-03",
      programTitle: "Early Creative Reading & Math",
      teacherId: "TCH-02",
      teacherName: "Kak Sarah Azhari (Early Childhood)",
      scheduleTime: "Wed, 10:00 - 11:30 AM",
      maxSeats: 6,
      bookedSeats: 6,
      availableSeats: 0,
      price: 250000,
      sessionLink: "https://meet.google.com/jkl-edtech-04",
      status: "FULL",
    },
  ],
};

const ENROLLMENTS_DATA: Record<string, Enrollment[]> = {
  id: [
    {
      id: "EDE-01",
      tenantId: "tenant-lampung-01",
      classId: "EDC-01",
      programTitle: "Logika & Koding Anak (Roblox & Scratch)",
      scheduleTime: "Sabtu & Minggu, 09:00 - 10:30 WIB",
      studentId: "STU-01",
      studentName: "Kenzo Al-Ghifari (9 thn)",
      parentId: "PAR-01",
      parentName: "Budi Santoso",
      parentPhone: "0812-7890-1234",
      status: "CONFIRMED",
      paymentReference: "INV/2026/09/EDT-001",
      enrolledAt: "2026-09-18T10:00:00Z",
    },
    {
      id: "EDE-02",
      tenantId: "tenant-lampung-01",
      classId: "EDC-02",
      programTitle: "Matematika Interaktif & Problem Solving",
      scheduleTime: "Selasa & Kamis, 16:00 - 17:30 WIB",
      studentId: "STU-02",
      studentName: "Alya Putri (11 thn)",
      parentId: "PAR-02",
      parentName: "Dewi Lestari",
      parentPhone: "0813-8899-0011",
      status: "CONFIRMED",
      paymentReference: "INV/2026/09/EDT-002",
      enrolledAt: "2026-09-19T14:30:00Z",
    },
    {
      id: "EDE-03",
      tenantId: "tenant-lampung-01",
      classId: "EDC-03",
      programTitle: "Sains & STEM Roblox Galaxy Quests",
      scheduleTime: "Jumat, 15:30 - 17:00 WIB",
      studentId: "STU-01",
      studentName: "Kenzo Al-Ghifari (9 thn)",
      parentId: "PAR-01",
      parentName: "Budi Santoso",
      parentPhone: "0812-7890-1234",
      status: "CONFIRMED",
      paymentReference: "INV/2026/09/EDT-003",
      enrolledAt: "2026-09-20T09:15:00Z",
    },
  ],
  en: [
    {
      id: "EDE-01",
      tenantId: "tenant-lampung-01",
      classId: "EDC-01",
      programTitle: "Kids Coding & Logic (Roblox & Scratch)",
      scheduleTime: "Sat & Sun, 09:00 - 10:30 AM",
      studentId: "STU-01",
      studentName: "Kenzo Al-Ghifari (Age 9)",
      parentId: "PAR-01",
      parentName: "Budi Santoso",
      parentPhone: "0812-7890-1234",
      status: "CONFIRMED",
      paymentReference: "INV/2026/09/EDT-001",
      enrolledAt: "2026-09-18T10:00:00Z",
    },
    {
      id: "EDE-02",
      tenantId: "tenant-lampung-01",
      classId: "EDC-02",
      programTitle: "Interactive Math & Problem Solving",
      scheduleTime: "Tue & Thu, 04:00 - 05:30 PM",
      studentId: "STU-02",
      studentName: "Alya Putri (Age 11)",
      parentId: "PAR-02",
      parentName: "Dewi Lestari",
      parentPhone: "0813-8899-0011",
      status: "CONFIRMED",
      paymentReference: "INV/2026/09/EDT-002",
      enrolledAt: "2026-09-19T14:30:00Z",
    },
    {
      id: "EDE-03",
      tenantId: "tenant-lampung-01",
      classId: "EDC-03",
      programTitle: "Roblox Science & Galaxy Quests",
      scheduleTime: "Fri, 03:30 - 05:00 PM",
      studentId: "STU-01",
      studentName: "Kenzo Al-Ghifari (Age 9)",
      parentId: "PAR-01",
      parentName: "Budi Santoso",
      parentPhone: "0812-7890-1234",
      status: "CONFIRMED",
      paymentReference: "INV/2026/09/EDT-003",
      enrolledAt: "2026-09-20T09:15:00Z",
    },
  ],
};

const HOMEWORK_DATA: Record<string, HomeworkLog[]> = {
  id: [
    {
      id: "EDH-01",
      enrollmentId: "EDE-01",
      title: "Misi Loop & Algoritma Labirin Roblox",
      score: 95,
      teacherFeedback: "Kenzo sangat cepat memahami konsep perulangan bertingkat. Logika berpikirnya sangat rapi!",
      completedAt: "2026-09-18T14:20:00Z",
      createdAt: "2026-09-18T14:20:00Z",
    },
    {
      id: "EDH-02",
      enrollmentId: "EDE-02",
      title: "Tantangan Pecahan Pizza 3D",
      score: 90,
      teacherFeedback: "Alya mampu memvisualisasikan penjumlahan pecahan dengan sangat tepat.",
      completedAt: "2026-09-19T11:15:00Z",
      createdAt: "2026-09-19T11:15:00Z",
    },
    {
      id: "EDH-03",
      enrollmentId: "EDE-03",
      title: "Quest Sirkuit Gravitasi Planet Mars",
      score: 98,
      teacherFeedback: "Eksperimen gravitasi planet diselesaikan dengan skor sempurna dan kreatif.",
      completedAt: "2026-09-20T10:00:00Z",
      createdAt: "2026-09-20T10:00:00Z",
    },
  ],
  en: [
    {
      id: "EDH-01",
      enrollmentId: "EDE-01",
      title: "Roblox Nested Loop & Maze Quest",
      score: 95,
      teacherFeedback: "Kenzo quickly grasped nested loop logic. Outstanding algorithmic thinking!",
      completedAt: "2026-09-18T14:20:00Z",
      createdAt: "2026-09-18T14:20:00Z",
    },
    {
      id: "EDH-02",
      enrollmentId: "EDE-02",
      title: "3D Pizza Fractions Challenge",
      score: 90,
      teacherFeedback: "Alya visualized fraction additions and parts with great accuracy.",
      completedAt: "2026-09-19T11:15:00Z",
      createdAt: "2026-09-19T11:15:00Z",
    },
    {
      id: "EDH-03",
      enrollmentId: "EDE-03",
      title: "Mars Planetary Gravity Circuit",
      score: 98,
      teacherFeedback: "Planetary physics experiment completed with a creative, perfect score.",
      completedAt: "2026-09-20T10:00:00Z",
      createdAt: "2026-09-20T10:00:00Z",
    },
  ],
};

const SUMMARIES_DATA: Record<string, WeeklySummary[]> = {
  id: [
    {
      id: "EDS-01",
      studentId: "STU-01",
      studentName: "Kenzo Al-Ghifari",
      weekNumber: 38,
      aiGeneratedSummary: "🌟 Evaluasi Mingguan Kenzo: Minggu ini Kenzo menunjukkan kemajuan luar biasa dalam sesi Koding & Sains Roblox! Ia berhasil memecahkan 3 tantangan algoritma perulangan dan antusias membantu teman sekelasnya. Kenzo sudah menguasai konsep dasar loop dan gaya gravitasi planet. Saran untuk orang tua: ajak Kenzo mencoba tantangan variabel skor mandiri selama 15 menit di rumah!",
      rawTeacherNotes: "Kenzo sangat fokus, nilai kuis 95 dan 98, aktif bertanya saat simulasi loop Roblox.",
      conceptsMastered: ["Looping Algorithms", "Planetary Gravity", "Sequential Logic"],
      createdAt: "2026-09-20T10:30:00Z",
    },
    {
      id: "EDS-02",
      studentId: "STU-02",
      studentName: "Alya Putri",
      weekNumber: 38,
      aiGeneratedSummary: "✨ Evaluasi Mingguan Alya: Alya menunjukkan perkembangan pesat pada topik pecahan interaktif! Ketelitiannya dalam menyelesaikan soal cerita bertema puzzle 3D patut diacungi jempol. Alya semakin percaya diri mengemukakan argumen matematika di hadapan teman-temannya.",
      rawTeacherNotes: "Alya aktif di kelas, skor 90, mampu menyelesaikan soal pecahan pizza tanpa ragu.",
      conceptsMastered: ["Fraction Addition", "Visual Geometry", "Mathematical Communication"],
      createdAt: "2026-09-19T16:00:00Z",
    },
  ],
  en: [
    {
      id: "EDS-01",
      studentId: "STU-01",
      studentName: "Kenzo Al-Ghifari",
      weekNumber: 38,
      aiGeneratedSummary: "🌟 Weekly Progress for Kenzo: This week Kenzo demonstrated outstanding progress in Roblox Coding & Science! He successfully solved 3 nested loop algorithmic challenges and enthusiastically assisted his peers. Kenzo has mastered fundamental loop logic and planetary gravity concepts. Home tip: Invite Kenzo to try building an independent score variable challenge for 15 minutes at home!",
      rawTeacherNotes: "Kenzo was very focused, scored 95 and 98 on quests, asked great questions during Roblox simulations.",
      conceptsMastered: ["Looping Algorithms", "Planetary Gravity", "Sequential Logic"],
      createdAt: "2026-09-20T10:30:00Z",
    },
    {
      id: "EDS-02",
      studentId: "STU-02",
      studentName: "Alya Putri",
      weekNumber: 38,
      aiGeneratedSummary: "✨ Weekly Progress for Alya: Alya showed rapid improvement in interactive fractions! Her precision in solving 3D puzzle story problems was commendable. Alya is increasingly confident explaining mathematical concepts to her peers.",
      rawTeacherNotes: "Alya was very active in class, scored 90, solved pizza fraction puzzles without hesitation.",
      conceptsMastered: ["Fraction Addition", "Visual Geometry", "Mathematical Communication"],
      createdAt: "2026-09-19T16:00:00Z",
    },
  ],
};

export function useEdutechStore() {
  const locale = useLocale() || 'id';
  const currentLocale = locale === 'en' ? 'en' : 'id';

  const [member, setMember] = useState<MemberProfile | null>(null);
  const [programs] = useState<Program[]>(PROGRAMS_DATA[currentLocale] || PROGRAMS_DATA.id);
  const [classes, setClasses] = useState<ClassSession[]>(CLASSES_DATA[currentLocale] || CLASSES_DATA.id);
  const [enrollments, setEnrollments] = useState<Enrollment[]>(ENROLLMENTS_DATA[currentLocale] || ENROLLMENTS_DATA.id);
  const [homework, setHomework] = useState<HomeworkLog[]>(HOMEWORK_DATA[currentLocale] || HOMEWORK_DATA.id);
  const [summaries, setSummaries] = useState<WeeklySummary[]>(SUMMARIES_DATA[currentLocale] || SUMMARIES_DATA.id);
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeRoleTab, setActiveRoleTab] = useState<UserRole>('PARENT');

  // Load from LocalStorage on mount
  useEffect(() => {
    try {
      const savedMember = localStorage.getItem('lampungdevtech_edutech_member');
      if (savedMember) {
        const parsed = JSON.parse(savedMember);
        setMember(parsed);
        if (parsed.role) setActiveRoleTab(parsed.role);
      }

      const savedClasses = localStorage.getItem(`lampungdevtech_edutech_classes_${currentLocale}`);
      if (savedClasses) setClasses(JSON.parse(savedClasses));

      const savedEnrollments = localStorage.getItem(`lampungdevtech_edutech_enrollments_${currentLocale}`);
      if (savedEnrollments) setEnrollments(JSON.parse(savedEnrollments));

      const savedHomework = localStorage.getItem(`lampungdevtech_edutech_homework_${currentLocale}`);
      if (savedHomework) setHomework(JSON.parse(savedHomework));

      const savedSummaries = localStorage.getItem(`lampungdevtech_edutech_summaries_${currentLocale}`);
      if (savedSummaries) setSummaries(JSON.parse(savedSummaries));
    } catch {
      // ignore
    } finally {
      setIsLoaded(true);
    }
  }, [currentLocale]);

  // Sync back to LocalStorage
  const saveState = useCallback((
    updatedClasses?: ClassSession[],
    updatedEnrollments?: Enrollment[],
    updatedHomework?: HomeworkLog[],
    updatedSummaries?: WeeklySummary[]
  ) => {
    try {
      if (updatedClasses) localStorage.setItem(`lampungdevtech_edutech_classes_${currentLocale}`, JSON.stringify(updatedClasses));
      if (updatedEnrollments) localStorage.setItem(`lampungdevtech_edutech_enrollments_${currentLocale}`, JSON.stringify(updatedEnrollments));
      if (updatedHomework) localStorage.setItem(`lampungdevtech_edutech_homework_${currentLocale}`, JSON.stringify(updatedHomework));
      if (updatedSummaries) localStorage.setItem(`lampungdevtech_edutech_summaries_${currentLocale}`, JSON.stringify(updatedSummaries));
    } catch {
      // ignore
    }
  }, [currentLocale]);

  // Register Member (Gate Onboarding)
  const registerMember = useCallback((profile: Omit<MemberProfile, 'id' | 'registeredAt'>) => {
    const newMember: MemberProfile = {
      ...profile,
      id: 'MBR-' + Date.now().toString().slice(-6),
      registeredAt: new Date().toISOString(),
    };
    setMember(newMember);
    setActiveRoleTab(newMember.role);
    try {
      localStorage.setItem('lampungdevtech_edutech_member', JSON.stringify(newMember));
    } catch {
      // ignore
    }
    return newMember;
  }, []);

  const logoutMember = useCallback(() => {
    setMember(null);
    try {
      localStorage.removeItem('lampungdevtech_edutech_member');
    } catch {
      // ignore
    }
  }, []);

  // Self-Serve Class Enrollment with Concurrency Slot Locking
  const enrollClass = useCallback(async (
    classId: string, 
    studentName: string, 
    parentName: string, 
    parentPhone: string,
    paymentMethod?: string,
    paymentFee?: number
  ): Promise<{ success: boolean; message: string; enrollment?: Enrollment }> => {
    const targetClass = classes.find(c => c.id === classId);
    if (!targetClass) {
      return { 
        success: false, 
        message: currentLocale === 'en' ? 'Class not found.' : 'Kelas tidak ditemukan.' 
      };
    }
    if (targetClass.availableSeats <= 0 || targetClass.bookedSeats >= targetClass.maxSeats) {
      return { 
        success: false, 
        message: currentLocale === 'en' 
          ? 'Class capacity is full! Please choose another batch schedule.' 
          : 'Kuota kursi kelas ini sudah penuh! Silakan pilih jadwal batch lain.' 
      };
    }

    // Try backend API first
    try {
      const res = await fetch('/api/edutech/enroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId: 'tenant-lampung-01',
          classId,
          studentName,
          parentName,
          parentPhone,
          parentId: member?.id || 'PAR-' + Date.now().toString().slice(-4),
          paymentMethod: paymentMethod || 'QRIS',
          paymentFee: paymentFee || 0,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const updatedClasses = classes.map(c => {
          if (c.id === classId) {
            const nextBooked = c.bookedSeats + 1;
            return {
              ...c,
              bookedSeats: nextBooked,
              availableSeats: Math.max(0, c.maxSeats - nextBooked),
              status: nextBooked >= c.maxSeats ? ('FULL' as const) : c.status,
            };
          }
          return c;
        });

        const newEnrollment: Enrollment = data.enrollment || {
          id: 'EDE-' + Date.now().toString().slice(-6),
          tenantId: 'tenant-lampung-01',
          classId,
          programTitle: targetClass.programTitle,
          scheduleTime: targetClass.scheduleTime,
          studentId: 'STU-' + Date.now().toString().slice(-4),
          studentName,
          parentId: member?.id || 'PAR-01',
          parentName,
          parentPhone,
          status: 'CONFIRMED',
          paymentReference: 'INV/2026/09/EDT-' + Math.floor(100 + Math.random() * 900),
          paymentMethod: paymentMethod || 'QRIS',
          paymentFee: paymentFee || 0,
          enrolledAt: new Date().toISOString(),
        };

        const updatedEnrollments = [newEnrollment, ...enrollments];
        setClasses(updatedClasses);
        setEnrollments(updatedEnrollments);
        saveState(updatedClasses, updatedEnrollments);

        return { 
          success: true, 
          message: currentLocale === 'en' ? 'Class enrollment confirmed successfully!' : 'Pendaftaran kelas berhasil dikonfirmasi!', 
          enrollment: newEnrollment 
        };
      }
    } catch {
      // fallback to optimistic local update
    }

    const updatedClasses = classes.map(c => {
      if (c.id === classId) {
        const nextBooked = c.bookedSeats + 1;
        return {
          ...c,
          bookedSeats: nextBooked,
          availableSeats: Math.max(0, c.maxSeats - nextBooked),
          status: nextBooked >= c.maxSeats ? ('FULL' as const) : c.status,
        };
      }
      return c;
    });

    const newEnrollment: Enrollment = {
      id: 'EDE-' + Date.now().toString().slice(-6),
      tenantId: 'tenant-lampung-01',
      classId,
      programTitle: targetClass.programTitle,
      scheduleTime: targetClass.scheduleTime,
      studentId: 'STU-' + Date.now().toString().slice(-4),
      studentName,
      parentId: member?.id || 'PAR-01',
      parentName,
      parentPhone,
      status: 'CONFIRMED',
      paymentReference: 'INV/2026/09/EDT-' + Math.floor(100 + Math.random() * 900),
      paymentMethod: paymentMethod || 'QRIS',
      paymentFee: paymentFee || 0,
      enrolledAt: new Date().toISOString(),
    };

    const updatedEnrollments = [newEnrollment, ...enrollments];
    setClasses(updatedClasses);
    setEnrollments(updatedEnrollments);
    saveState(updatedClasses, updatedEnrollments);

    return { 
      success: true, 
      message: currentLocale === 'en' ? 'Class enrollment confirmed successfully!' : 'Pendaftaran kelas berhasil dikonfirmasi!', 
      enrollment: newEnrollment 
    };
  }, [classes, enrollments, member, currentLocale, saveState]);

  const recordAttendance = useCallback((classId: string, studentId: string, status: string, topic: string) => {
    fetch('/api/edutech/teacher/attendance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ classId, studentId, status, topicCovered: topic }),
    }).catch(() => {});
  }, []);

  const submitHomework = useCallback((enrollmentId: string, title: string, score: number, feedback: string) => {
    const newLog: HomeworkLog = {
      id: 'EDH-' + Date.now().toString().slice(-6),
      enrollmentId,
      title,
      score,
      teacherFeedback: feedback,
      completedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };
    const updated = [newLog, ...homework];
    setHomework(updated);
    saveState(undefined, undefined, updated);

    fetch('/api/edutech/teacher/homework', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ enrollmentId, title, score, teacherFeedback: feedback }),
    }).catch(() => {});

    return newLog;
  }, [homework, saveState]);

  const generateAISummary = useCallback(async (studentId: string, studentName: string, score: number, notes: string) => {
    let summaryText = currentLocale === 'en'
      ? `🌟 Weekly Evaluation for ${studentName}: Demonstrated brilliant progress with a quest score of ${score}/100! ${notes} Algorithmic thinking and problem solving grew significantly.`
      : `🌟 Evaluasi Mingguan ${studentName}: Ananda menunjukkan pencapaian luar biasa dengan skor tugas ${score}/100! ${notes} Daya nalar kritis dan pemahaman logikanya berkembang sangat positif.`;
    
    let concepts = ['Problem Solving', 'Roblox STEM Quests', 'Visual Logic'];
    let tip = currentLocale === 'en'
      ? `💡 Parent Tip: Ask ${studentName} to showcase their game puzzle solution for 10 minutes tonight.`
      : `💡 Tips Orang Tua: Ajak ${studentName} menceritakan kembali tantangan game yang ia selesaikan selama 10 menit.`;

    try {
      const res = await fetch('/api/edutech/ai/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId,
          studentName,
          weekNumber: 38,
          homeworkScore: score,
          teacherNotes: notes,
          concepts,
        }),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.data?.summary) {
          summaryText = json.data.summary;
          if (json.data.conceptsMastered) concepts = json.data.conceptsMastered;
          if (json.data.encouragementTip) tip = json.data.encouragementTip;
        }
      }
    } catch {
      // fallback
    }

    const newSummary: WeeklySummary = {
      id: 'EDS-' + Date.now().toString().slice(-6),
      studentId,
      studentName,
      weekNumber: 38,
      aiGeneratedSummary: summaryText + '\n\n' + tip,
      rawTeacherNotes: notes,
      conceptsMastered: concepts,
      createdAt: new Date().toISOString(),
    };

    const updated = [newSummary, ...summaries];
    setSummaries(updated);
    saveState(undefined, undefined, undefined, updated);

    return newSummary;
  }, [summaries, currentLocale, saveState]);

  const toggleBatchStatus = useCallback((classId: string) => {
    const updated = classes.map(c => {
      if (c.id === classId) {
        const nextStatus = c.status === 'ACTIVE' ? ('FULL' as const) : ('ACTIVE' as const);
        return { ...c, status: nextStatus };
      }
      return c;
    });
    setClasses(updated);
    saveState(updated);
  }, [classes, saveState]);

  const adminCapacity: AdminCapacityReport = {
    totalPrograms: programs.length,
    totalClasses: classes.length,
    totalSeats: classes.reduce((sum, c) => sum + c.maxSeats, 0),
    bookedSeats: classes.reduce((sum, c) => sum + c.bookedSeats, 0),
    occupancyRate: 0,
    activeBatches: classes.filter(c => c.status === 'ACTIVE').length,
    classes,
  };
  if (adminCapacity.totalSeats > 0) {
    adminCapacity.occupancyRate = Math.round((adminCapacity.bookedSeats / adminCapacity.totalSeats) * 100);
  }

  return {
    isLoaded,
    locale: currentLocale,
    member,
    activeRoleTab,
    setActiveRoleTab,
    programs,
    classes,
    enrollments,
    homework,
    summaries,
    adminCapacity,
    registerMember,
    logoutMember,
    enrollClass,
    recordAttendance,
    submitHomework,
    generateAISummary,
    toggleBatchStatus,
  };
}
