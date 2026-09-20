"use client";

import React from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { AdminCapacityReport, Enrollment, MemberProfile } from './types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Building2, 
  Users, 
  Layers, 
  TrendingUp, 
  CreditCard, 
  ToggleLeft, 
  ToggleRight, 
  Calendar,
  DollarSign
} from 'lucide-react';

interface Props {
  member: MemberProfile | null;
  adminCapacity: AdminCapacityReport;
  enrollments: Enrollment[];
  onToggleBatch: (classId: string) => void;
}

export function EdutechAdminOps({ member, adminCapacity, enrollments, onToggleBatch }: Props) {
  const t = useTranslations('edutech');
  const locale = useLocale();
  const isEn = locale === 'en';

  const estimatedRevenue = adminCapacity.classes.reduce(
    (total, c) => total + (c.bookedSeats * c.price),
    0
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-blue-500/10 via-primary/10 to-indigo-500/10 border border-blue-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-500/20 text-blue-600 dark:text-blue-400">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-bold text-foreground">
                {t('adminOpsTitle')} • {member?.name || (isEn ? 'Admin LampungDevTech' : 'Admin LampungDevTech')}
              </h2>
              <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/30 text-[10px]">
                Multi-Tenant Ops
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {t('adminOpsDesc')}
            </p>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-border/60">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-xs text-muted-foreground font-medium">{t('kpiOccupancy')}</span>
              <div className="text-xl font-bold text-primary mt-1">
                {adminCapacity.occupancyRate}%
              </div>
              <span className="text-[10px] text-muted-foreground">
                {adminCapacity.bookedSeats} {isEn ? 'of' : 'dari'} {adminCapacity.totalSeats} {isEn ? 'seats filled' : 'kursi terisi'}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
              <TrendingUp className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-xs text-muted-foreground font-medium">{t('kpiActiveBatches')}</span>
              <div className="text-xl font-bold text-foreground mt-1">
                {adminCapacity.activeBatches} / {adminCapacity.totalClasses}
              </div>
              <span className="text-[10px] text-muted-foreground">
                {adminCapacity.totalPrograms} {isEn ? 'Curriculums Running' : 'Kurikulum Berjalan'}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500">
              <Layers className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-xs text-muted-foreground font-medium">{t('kpiTotalStudents')}</span>
              <div className="text-xl font-bold text-foreground mt-1">
                {enrollments.length} {isEn ? 'Students' : 'Siswa'}
              </div>
              <span className="text-[10px] text-muted-foreground">
                {isEn ? 'Active in live batches' : 'Aktif di kelas live'}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-500">
              <Users className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-xs text-muted-foreground font-medium">{t('kpiRevenue')}</span>
              <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                Rp {(estimatedRevenue / 1000000).toFixed(1)} {isEn ? 'M' : 'Jt'}
              </div>
              <span className="text-[10px] text-muted-foreground">
                {isEn ? 'September 2026' : 'Bulan September 2026'}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500">
              <DollarSign className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Class Batch Capacity Management Table */}
      <Card className="border-border/60">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" />
              <CardTitle className="text-base font-bold">{t('tableBatchTitle')}</CardTitle>
            </div>
            <Badge variant="outline" className="text-[10px]">
              Distributed Lock Guarded
            </Badge>
          </div>
          <CardDescription className="text-xs">
            {t('tableBatchDesc')}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border/60 text-muted-foreground text-left">
                  <th className="pb-2.5 font-semibold">{t('thBatch')}</th>
                  <th className="pb-2.5 font-semibold">{t('thTeacher')}</th>
                  <th className="pb-2.5 font-semibold">{t('thSchedule')}</th>
                  <th className="pb-2.5 font-semibold">{t('thCapacity')}</th>
                  <th className="pb-2.5 font-semibold">{t('thStatus')}</th>
                  <th className="pb-2.5 font-semibold text-right">{t('thAction')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {adminCapacity.classes.map((cls) => {
                  const percent = Math.round((cls.bookedSeats / cls.maxSeats) * 100);
                  const isFull = cls.status === 'FULL' || cls.availableSeats <= 0;

                  return (
                    <tr key={cls.id} className="hover:bg-muted/20 transition-colors">
                      <td className="py-3 pr-2">
                        <div className="font-bold text-foreground">{cls.id}</div>
                        <div className="text-[11px] text-muted-foreground line-clamp-1">{cls.programTitle}</div>
                      </td>
                      <td className="py-3 pr-2 text-foreground font-medium">
                        {cls.teacherName}
                      </td>
                      <td className="py-3 pr-2 text-muted-foreground">
                        {cls.scheduleTime}
                      </td>
                      <td className="py-3 pr-2 w-44">
                        <div className="flex justify-between text-[10px] mb-1">
                          <span className="font-semibold">{cls.bookedSeats} / {cls.maxSeats}</span>
                          <span className="text-muted-foreground">{percent}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${isFull ? 'bg-destructive' : 'bg-primary'}`}
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </td>
                      <td className="py-3 pr-2">
                        <Badge
                          variant="outline"
                          className={`text-[10px] ${
                            cls.status === 'ACTIVE'
                              ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                              : 'bg-rose-500/10 text-rose-600 border-rose-500/20'
                          }`}
                        >
                          {cls.status}
                        </Badge>
                      </td>
                      <td className="py-3 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onToggleBatch(cls.id)}
                          className="h-7 px-2 text-[11px] font-semibold gap-1 text-muted-foreground hover:text-foreground"
                        >
                          {cls.status === 'ACTIVE' ? (
                            <>
                              <ToggleRight className="w-4 h-4 text-emerald-500" />
                              <span>{t('btnCloseBatch')}</span>
                            </>
                          ) : (
                            <>
                              <ToggleLeft className="w-4 h-4 text-rose-500" />
                              <span>{t('btnOpenBatch')}</span>
                            </>
                          )}
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Enrollment & Invoicing Reconciliation */}
      <Card className="border-border/60">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-emerald-500" />
              <CardTitle className="text-base font-bold">{t('tableReconTitle')}</CardTitle>
            </div>
            <Badge variant="secondary" className="text-[10px]">
              {enrollments.length} {isEn ? 'Confirmed Transactions' : 'Transaksi Terkonfirmasi'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border/60 text-muted-foreground text-left">
                  <th className="pb-2 font-semibold">{t('thInvoice')}</th>
                  <th className="pb-2 font-semibold">{t('thStudent')}</th>
                  <th className="pb-2 font-semibold">{t('thParent')}</th>
                  <th className="pb-2 font-semibold">{t('thProgram')}</th>
                  <th className="pb-2 font-semibold text-right">{t('thStatus')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {enrollments.map((enr) => (
                  <tr key={enr.id} className="hover:bg-muted/20">
                    <td className="py-2.5 font-mono text-[11px] text-primary">{enr.paymentReference}</td>
                    <td className="py-2.5 font-medium text-foreground">{enr.studentName}</td>
                    <td className="py-2.5 text-muted-foreground">{enr.parentName} ({enr.parentPhone})</td>
                    <td className="py-2.5 text-muted-foreground">{enr.programTitle || (isEn ? 'STEM & Science' : 'Sains & STEM')}</td>
                    <td className="py-2.5 text-right">
                      <Badge className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-[10px]">
                        {t('paid')}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
