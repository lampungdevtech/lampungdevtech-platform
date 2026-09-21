"use client";

import React, { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Program, ClassSession, MemberProfile, Enrollment } from './types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Sparkles, Calendar, Clock, UserCheck, Flame, CheckCircle, AlertTriangle, BookOpen } from 'lucide-react';
import { PaymentMethodSelector } from '@/components/payment/payment-method-selector';
import { PaymentInstructionModal } from '@/components/payment/payment-instruction-modal';
import type { PaymentMethodItem, PaymentResult } from '@/lib/payment/types';
import { getWeselAjaMerchantFee } from '@/lib/payment/weselaja';

interface Props {
  programs: Program[];
  classes: ClassSession[];
  member: MemberProfile | null;
  onEnroll: (
    classId: string, 
    studentName: string, 
    parentName: string, 
    parentPhone: string,
    paymentMethod?: string,
    paymentFee?: number
  ) => Promise<{ success: boolean; message: string; enrollment?: Enrollment }>;
}

export function EdutechProgramCatalog({ programs, classes, member, onEnroll }: Props) {
  const t = useTranslations('edutech');
  const locale = useLocale();
  const isEn = locale === 'en';

  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [activeBookingClass, setActiveBookingClass] = useState<ClassSession | null>(null);
  const [studentName, setStudentName] = useState(member?.childName || '');
  const [parentName, setParentName] = useState(member?.name || '');
  const [parentPhone, setParentPhone] = useState(member?.phone || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // WeselAja Payment Selection State
  const [selectedMethod, setSelectedMethod] = useState<string>('QRIS');
  const [selectedMethodItem, setSelectedMethodItem] = useState<PaymentMethodItem | null>(null);
  const [paymentResult, setPaymentResult] = useState<PaymentResult | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const categories = [
    { id: 'ALL', label: t('catAll') },
    { id: 'CODING', label: t('catCoding') },
    { id: 'MATH', label: t('catMath') },
    { id: 'SCIENCE_ROBLOX', label: t('catScience') },
    { id: 'CREATIVE', label: t('catCreative') },
  ];

  const filteredPrograms = selectedCategory === 'ALL'
    ? programs
    : programs.filter(p => p.category === selectedCategory);

  const handleOpenBooking = (cls: ClassSession) => {
    setActiveBookingClass(cls);
    setStudentName(member?.childName || '');
    setParentName(member?.name || '');
    setParentPhone(member?.phone || '');
    setSelectedMethod('QRIS');
    setSelectedMethodItem(null);
    setNotification(null);
  };

  const handleConfirmEnrollment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeBookingClass) return;

    setIsSubmitting(true);
    const defaultStudent = isEn ? 'Student' : 'Ananda Murid';
    const defaultParent = isEn ? 'Parent' : 'Orang Tua';

    const rawPrice = activeBookingClass.price;
    const fee = selectedMethodItem?.totalFee || getWeselAjaMerchantFee(selectedMethod, rawPrice);

    try {
      // 1. Request payment from WeselAja API
      const payRes = await fetch('/api/payment/weselaja/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: 'EDT-' + Date.now().toString().slice(-6),
          amount: rawPrice,
          customerName: studentName || defaultStudent,
          customerEmail: member?.email || 'parent@lampungdevtech.my.id',
          customerPhone: parentPhone || '0812-0000-0000',
          itemName: `${activeBookingClass.programTitle} - ${activeBookingClass.scheduleTime}`,
          paymentMethod: selectedMethod,
        }),
      });

      const payData: PaymentResult = await payRes.json();

      // 2. Perform optimistic and atomic enrollment in store & backend
      const res = await onEnroll(
        activeBookingClass.id, 
        studentName || defaultStudent, 
        parentName || defaultParent, 
        parentPhone || '0812-0000-0000',
        selectedMethod,
        fee
      );

      setIsSubmitting(false);

      if (res.success) {
        setActiveBookingClass(null);
        setPaymentResult({
          ...payData,
          totalAmount: rawPrice + fee,
          feeAmount: fee,
          paymentMethod: selectedMethod,
        });
        setIsPaymentModalOpen(true);
      } else {
        setNotification({ type: 'error', message: res.message });
      }
    } catch {
      setIsSubmitting(false);
      setNotification({ type: 'error', message: 'Gagal memproses pembayaran. Silakan coba lagi.' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
              selectedCategory === cat.id
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'bg-muted/70 hover:bg-muted text-muted-foreground'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Program Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredPrograms.map((prog) => {
          const progClasses = classes.filter(c => c.programId === prog.id);

          return (
            <Card key={prog.id} className="border-border/60 overflow-hidden flex flex-col hover:border-primary/40 transition-all shadow-sm">
              {/* Program Header with Visual Banner */}
              <div className="relative h-44 w-full bg-slate-900 overflow-hidden">
                <img
                  src={prog.thumbnailUrl}
                  alt={prog.title}
                  className="w-full h-full object-cover opacity-75 hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-black/40" />
                <div className="absolute top-3 left-3 flex gap-2">
                  <Badge variant="secondary" className="bg-black/60 backdrop-blur-md text-white border-none text-[10px] font-semibold">
                    {prog.ageGroup}
                  </Badge>
                  {prog.category === 'SCIENCE_ROBLOX' && (
                    <Badge className="bg-amber-500/90 text-white border-none text-[10px] font-semibold flex items-center gap-1">
                      <Flame className="w-3 h-3 fill-current" />
                      200+ STEM Games
                    </Badge>
                  )}
                </div>
              </div>

              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-bold leading-snug">{prog.title}</CardTitle>
                <CardDescription className="text-xs text-muted-foreground line-clamp-2 mt-1">
                  {prog.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-3 flex-1">
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  {t('batchSchedule')}
                </div>

                {progClasses.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic py-2">{t('noBatch')}</p>
                ) : (
                  <div className="space-y-2.5">
                    {progClasses.map((cls) => {
                      const isFull = cls.availableSeats <= 0 || cls.status === 'FULL';
                      const percentBooked = Math.round((cls.bookedSeats / cls.maxSeats) * 100);

                      return (
                        <div
                          key={cls.id}
                          className={`p-3 rounded-xl border transition-all ${
                            isFull
                              ? 'bg-muted/30 border-dashed border-border/70 opacity-70'
                              : 'bg-card/70 border-border/60 hover:border-primary/30'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="flex items-center gap-1.5 text-xs font-medium text-foreground">
                                <Clock className="w-3.5 h-3.5 text-primary" />
                                {cls.scheduleTime}
                              </div>
                              <div className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-1">
                                <UserCheck className="w-3 h-3" />
                                {cls.teacherName}
                              </div>
                            </div>

                            <div className="text-right">
                              <span className="text-xs font-bold text-primary">
                                Rp {cls.price.toLocaleString(isEn ? 'en-US' : 'id-ID')}
                              </span>
                              <span className="text-[10px] text-muted-foreground block">{t('perMonth')}</span>
                            </div>
                          </div>

                          {/* Seat Capacity Bar */}
                          <div className="mt-2.5 pt-2 border-t border-border/40 flex items-center justify-between gap-3">
                            <div className="flex-1">
                              <div className="flex justify-between text-[10px] mb-1">
                                <span className="text-muted-foreground font-medium">{t('seatCapacity')}</span>
                                <span className={`font-semibold ${isFull ? 'text-destructive' : 'text-foreground'}`}>
                                  {cls.bookedSeats} / {cls.maxSeats} {t('occupied')}
                                </span>
                              </div>
                              <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                                <div
                                  className={`h-full transition-all duration-500 rounded-full ${
                                    isFull ? 'bg-destructive' : percentBooked > 75 ? 'bg-amber-500' : 'bg-primary'
                                  }`}
                                  style={{ width: `${percentBooked}%` }}
                                />
                              </div>
                            </div>

                            <Button
                              size="sm"
                              disabled={isFull}
                              onClick={() => handleOpenBooking(cls)}
                              className={`h-8 px-3 text-xs font-medium rounded-lg shrink-0 ${
                                isFull
                                  ? 'bg-muted text-muted-foreground cursor-not-allowed'
                                  : 'bg-primary hover:bg-primary/90 text-primary-foreground'
                              }`}
                            >
                              {isFull ? t('btnFull') : t('btnBook')}
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>

              <CardFooter className="pt-2 border-t border-border/40 bg-muted/20 text-[11px] text-muted-foreground flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <BookOpen className="w-3 h-3 text-primary" />
                  Live Class + Modul Roblox
                </span>
                <span className="text-emerald-500 font-medium">{t('liveGuarantee')}</span>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      {/* Booking Dialog Modal */}
      {activeBookingClass && (
        <Dialog open={!!activeBookingClass} onOpenChange={(open) => !open && setActiveBookingClass(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-lg">
                <Sparkles className="w-5 h-5 text-primary" />
                {t('modalBookingTitle')}
              </DialogTitle>
              <DialogDescription className="text-xs">
                {t('modalBookingDesc')}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleConfirmEnrollment} className="space-y-4 py-2">
              <div className="p-3 rounded-xl bg-muted/40 border border-border/60 space-y-1">
                <div className="text-xs font-semibold text-foreground">{activeBookingClass.programTitle}</div>
                <div className="text-[11px] text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3 h-3 text-primary" />
                  {activeBookingClass.scheduleTime}
                </div>
                <div className="text-[11px] text-muted-foreground">
                  {isEn ? 'Instructor' : 'Instruktur'}: {activeBookingClass.teacherName}
                </div>
                <div className="text-xs font-bold text-primary pt-1">
                  {isEn ? 'Tuition Fee' : 'Investasi Belajar'}: Rp {activeBookingClass.price.toLocaleString(isEn ? 'en-US' : 'id-ID')} {t('perMonth')}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="book-student" className="text-xs font-medium">{t('childName')}</Label>
                <Input
                  id="book-student"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder={isEn ? "Student's full name" : "Nama lengkap anak"}
                  required
                  className="h-9 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="book-parent" className="text-xs font-medium">{isEn ? 'Parent Name *' : 'Nama Wali Murid *'}</Label>
                  <Input
                    id="book-parent"
                    value={parentName}
                    onChange={(e) => setParentName(e.target.value)}
                    placeholder={isEn ? "Parent's name" : "Nama orang tua"}
                    required
                    className="h-9 text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="book-phone" className="text-xs font-medium">{t('whatsapp')}</Label>
                  <Input
                    id="book-phone"
                    value={parentPhone}
                    onChange={(e) => setParentPhone(e.target.value)}
                    placeholder="0812-xxxx"
                    required
                    className="h-9 text-xs"
                  />
                </div>
              </div>

              {/* WeselAja Payment Method Selector */}
              <div className="pt-1">
                <PaymentMethodSelector
                  amount={activeBookingClass.price}
                  selectedMethod={selectedMethod}
                  onSelectMethod={(item) => {
                    setSelectedMethod(item.code);
                    setSelectedMethodItem(item);
                  }}
                  isEn={isEn}
                />
              </div>

              {/* Price Breakdown */}
              {(() => {
                const fee = selectedMethodItem?.totalFee ?? getWeselAjaMerchantFee(selectedMethod, activeBookingClass.price);
                const grandTotal = activeBookingClass.price + fee;

                return (
                  <div className="p-3 rounded-xl bg-card border border-border/80 space-y-1.5 text-xs">
                    <div className="flex justify-between text-muted-foreground">
                      <span>{isEn ? 'Program Tuition' : 'Biaya Belajar (Bimbel)'}</span>
                      <span>Rp {activeBookingClass.price.toLocaleString(isEn ? 'en-US' : 'id-ID')}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>{isEn ? 'Gateway Fee (WeselAja)' : 'Biaya Layanan (WeselAja)'}</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                        +{fee > 0 ? `Rp ${fee.toLocaleString('id-ID')}` : (isEn ? 'Free' : 'Gratis')}
                      </span>
                    </div>
                    <div className="flex justify-between font-bold text-foreground pt-1.5 border-t border-border/60 text-sm">
                      <span>{isEn ? 'Total Payment' : 'Total Pembayaran'}</span>
                      <span className="text-primary font-extrabold">
                        Rp {grandTotal.toLocaleString(isEn ? 'en-US' : 'id-ID')}
                      </span>
                    </div>
                  </div>
                );
              })()}

              {notification && (
                <div className={`p-2.5 rounded-lg text-xs flex items-center gap-2 ${
                  notification.type === 'success'
                    ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                    : 'bg-destructive/10 text-destructive border border-destructive/20'
                }`}>
                  {notification.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                  <span>{notification.message}</span>
                </div>
              )}

              <DialogFooter className="pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveBookingClass(null)}
                  disabled={isSubmitting}
                >
                  {t('modalBtnCancel')}
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isSubmitting || !studentName || !parentName || !parentPhone}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
                >
                  {isSubmitting ? t('modalSecuring') : (isEn ? 'Confirm & Pay' : 'Daftar & Bayar Sekarang')}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* WeselAja Payment Instruction / Settlement Modal */}
      <PaymentInstructionModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        paymentResult={paymentResult}
        orderTitle={isEn ? 'EdTech Class Tuition' : 'Biaya Pendaftaran Kelas'}
        isEn={isEn}
      />
    </div>
  );
}
