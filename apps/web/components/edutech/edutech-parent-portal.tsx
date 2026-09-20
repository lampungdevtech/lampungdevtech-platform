"use client";

import React from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Enrollment, HomeworkLog, WeeklySummary, MemberProfile } from './types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Sparkles, 
  Video, 
  CheckCircle2, 
  Clock, 
  Award, 
  Lightbulb, 
  Calendar, 
  FileText
} from 'lucide-react';

interface Props {
  member: MemberProfile | null;
  enrollments: Enrollment[];
  homework: HomeworkLog[];
  summaries: WeeklySummary[];
}

export function EdutechParentPortal({ member, enrollments, homework, summaries }: Props) {
  const t = useTranslations('edutech');
  const locale = useLocale();
  const isEn = locale === 'en';

  const myEnrollments = member && member.role === 'PARENT'
    ? enrollments.filter(e => e.parentId === member.id || e.parentName === member.name || enrollments.length <= 3)
    : enrollments;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-primary/15 via-blue-500/10 to-purple-500/15 border border-primary/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg sm:text-xl font-bold text-foreground">
              {t('parentWelcome')}, {member?.name || (isEn ? 'Parents' : 'Ayah Bunda')}! 👋
            </h2>
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 text-[10px]">
              Parent Portal
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1 max-w-xl">
            {t('parentSubtitle')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs px-2.5 py-1">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
            {myEnrollments.length} {t('activeClasses')}
          </Badge>
        </div>
      </div>

      {/* Grid: 2 Columns on Desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Active Classes & Homework */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Classes Card */}
          <Card className="border-border/60">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-primary" />
                  <CardTitle className="text-base font-bold">{t('upcomingSchedule')}</CardTitle>
                </div>
                <span className="text-xs text-muted-foreground font-medium">{t('activeClasses')}</span>
              </div>
              <CardDescription className="text-xs">
                {t('upcomingDesc')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {myEnrollments.length === 0 ? (
                <p className="text-xs text-muted-foreground italic py-3 text-center">
                  {isEn 
                    ? 'No classes enrolled yet. Open the "Catalog & Booking" tab to choose a class.' 
                    : 'Belum ada kelas yang didaftarkan. Silakan buka tab "Katalog Program" untuk memilih kelas.'}
                </p>
              ) : (
                myEnrollments.map((enr) => (
                  <div
                    key={enr.id}
                    className="p-3.5 rounded-xl border border-border/60 bg-card/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-primary/30 transition-all"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-foreground">{enr.studentName}</span>
                        <Badge variant="outline" className="text-[10px] bg-muted/60 text-muted-foreground border-border/60">
                          {enr.paymentReference}
                        </Badge>
                      </div>
                      <div className="text-xs font-semibold text-primary">{enr.programTitle}</div>
                      <div className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                        <Clock className="w-3 h-3 text-muted-foreground" />
                        {enr.scheduleTime}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        size="sm"
                        asChild
                        className="h-8 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 shadow-sm"
                      >
                        <a href="https://meet.google.com/abc-edtech-01" target="_blank" rel="noreferrer">
                          <Video className="w-3.5 h-3.5" />
                          {t('btnJoinLive')}
                        </a>
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Homework & Quest Log Card */}
          <Card className="border-border/60">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-500" />
                  <CardTitle className="text-base font-bold">{t('homeworkTitle')}</CardTitle>
                </div>
                <Badge variant="secondary" className="text-[10px] font-semibold">
                  {homework.length} {t('homeworkCompleted')}
                </Badge>
              </div>
              <CardDescription className="text-xs">
                {t('homeworkDesc')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {homework.map((hw) => (
                <div
                  key={hw.id}
                  className="p-3.5 rounded-xl border border-border/60 bg-muted/20 space-y-2 hover:border-border transition-all"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-xs font-bold text-foreground flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-primary" />
                        {hw.title}
                      </div>
                      <div className="text-[10px] text-muted-foreground mt-0.5">
                        {isEn ? 'Completed' : 'Diselesaikan'}: {new Date(hw.createdAt).toLocaleDateString(isEn ? 'en-US' : 'id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-md border border-amber-500/20 text-xs font-bold">
                      <span>{t('score')}:</span>
                      <span>{hw.score}/100</span>
                    </div>
                  </div>

                  {hw.teacherFeedback && (
                    <div className="text-xs text-muted-foreground bg-background/60 p-2.5 rounded-lg border border-border/40 italic">
                      &quot;{hw.teacherFeedback}&quot;
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right 1 Col: AI Weekly Progress Summarizer Showcase */}
        <div className="space-y-6">
          <Card className="border-primary/30 bg-gradient-to-b from-primary/5 via-card to-card shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 p-3 opacity-10 pointer-events-none">
              <Sparkles className="w-32 h-32 text-primary" />
            </div>

            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Badge className="bg-gradient-to-r from-primary to-purple-600 text-white border-none text-[10px] font-bold px-2 py-0.5 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  {t('badgeAiSummary')}
                </Badge>
              </div>
              <CardTitle className="text-base font-bold mt-2">
                {t('aiReportTitle')}
              </CardTitle>
              <CardDescription className="text-xs">
                {t('aiReportDesc')}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {summaries.map((sum) => (
                <div key={sum.id} className="p-3.5 rounded-xl bg-card border border-border/70 space-y-3 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-foreground">
                      {sum.studentName || 'Kenzo Al-Ghifari'}
                    </span>
                    <Badge variant="outline" className="text-[10px] text-primary border-primary/30">
                      {t('week')} {sum.weekNumber}
                    </Badge>
                  </div>

                  <p className="text-xs text-foreground/90 leading-relaxed">
                    {sum.aiGeneratedSummary}
                  </p>

                  {/* Concepts Mastered */}
                  <div>
                    <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
                      {t('conceptsMastered')}
                    </span>
                    <div className="flex wrap gap-1.5">
                      {sum.conceptsMastered.map((c, i) => (
                        <Badge
                          key={i}
                          variant="secondary"
                          className="bg-primary/10 text-primary hover:bg-primary/20 border-none text-[10px] font-medium"
                        >
                          ✓ {c}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              ))}

              <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-700 dark:text-blue-300 flex items-start gap-2">
                <Lightbulb className="w-4 h-4 shrink-0 mt-0.5 text-blue-500" />
                <div>
                  <strong>{t('tutorTip')}</strong> {t('tutorTipContent')}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
