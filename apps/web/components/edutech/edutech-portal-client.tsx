"use client";

import React, { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useEdutechStore } from './use-edutech-store';
import { EdutechMemberRegistration } from './edutech-member-registration';
import { EdutechProgramCatalog } from './edutech-program-catalog';
import { EdutechParentPortal } from './edutech-parent-portal';
import { EdutechTeacherWorkflow } from './edutech-teacher-workflow';
import { EdutechAdminOps } from './edutech-admin-ops';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Gamepad2, 
  Sparkles, 
  ShieldCheck, 
  Users, 
  GraduationCap, 
  Building2, 
  LogOut, 
  Compass, 
  Atom, 
  Bot 
} from 'lucide-react';

type TabView = 'CATALOG' | 'PARENT' | 'TEACHER' | 'ADMIN';

export function EdutechPortalClient() {
  const t = useTranslations('edutech');
  const locale = useLocale();
  const isEn = locale === 'en';

  const {
    isLoaded,
    member,
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
  } = useEdutechStore();

  const [activeTab, setActiveTab] = useState<TabView>('CATALOG');

  // If page is still hydrating from LocalStorage, show a smooth skeleton
  if (!isLoaded) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-muted-foreground font-medium">
            {isEn ? 'Loading EdTech & Learning Center Platform...' : 'Memuat Platform Bimbel & EdTech...'}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 md:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* 1. Platform Hero Header */}
        <div className="text-center space-y-4 max-w-4xl mx-auto">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold border border-primary/20">
            <Sparkles className="h-3.5 w-3.5" />
            <span>{t('heroTag')}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight">
            {t('heroTitle1')} <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-primary via-blue-600 to-purple-600 bg-clip-text text-transparent">
              {t('heroTitle2')}
            </span>
          </h1>

          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {t('heroDesc')}
          </p>

          {/* Feature Highlights Banner */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-1 text-xs">
            <Badge variant="secondary" className="px-3 py-1 gap-1.5 font-medium">
              <Gamepad2 className="w-3.5 h-3.5 text-primary" />
              {t('badgeRoblox')}
            </Badge>
            <Badge variant="secondary" className="px-3 py-1 gap-1.5 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              {t('badgeSlotLock')}
            </Badge>
            <Badge variant="secondary" className="px-3 py-1 gap-1.5 font-medium">
              <Bot className="w-3.5 h-3.5 text-purple-500" />
              {t('badgeAiSummary')}
            </Badge>
            <Badge variant="secondary" className="px-3 py-1 gap-1.5 font-medium">
              <Atom className="w-3.5 h-3.5 text-blue-500" />
              {t('badgeTutor')}
            </Badge>
          </div>
        </div>

        {/* 2. Gated Onboarding Check */}
        {!member ? (
          <div className="space-y-6">
            <EdutechMemberRegistration onRegister={registerMember} />

            {/* What you will get preview banner */}
            <div className="max-w-3xl mx-auto p-5 rounded-2xl border border-border/70 bg-card/50 backdrop-blur-sm grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <div className="p-2 rounded-lg bg-primary/10 text-primary w-fit">
                  <Users className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-foreground">
                  {isEn ? 'Parent Portal Access' : 'Akses Orang Tua'}
                </h4>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  {isEn 
                    ? 'Self-serve class booking, live session schedules, and weekly child-friendly AI progress reports.' 
                    : 'Booking kelas mandiri, notifikasi jadwal live, dan terima rapor naratif buatan AI tiap pekan.'}
                </p>
              </div>

              <div className="space-y-1.5">
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500 w-fit">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-foreground">
                  {isEn ? 'Teacher Workspace' : 'Workspace Guru'}
                </h4>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  {isEn 
                    ? 'Interactive class attendance rosters, quest scoring, and automated AI summary generators.' 
                    : 'Roster presensi kelas interaktif, verifikasi homework, dan prompt generator AI otomatis.'}
                </p>
              </div>

              <div className="space-y-1.5">
                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500 w-fit">
                  <Building2 className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-foreground">
                  {isEn ? 'Class Operations' : 'Operasional Bimbel'}
                </h4>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  {isEn 
                    ? 'Real-time batch seat quota management, occupancy monitoring, and invoice reconciliation.' 
                    : 'Manajemen kuota kursi batch, monitor okupansi, dan rekonsiliasi invoice pendaftaran.'}
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* 3. Member Unlocked Dashboard Area */
          <div className="space-y-6">
            {/* Member Status & Role Switcher Bar */}
            <div className="p-3 sm:p-4 rounded-2xl bg-card border border-border/70 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-xs">
                  {member.name[0]?.toUpperCase() || 'M'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-foreground">{member.name}</span>
                    <Badge variant="outline" className="text-[10px] bg-primary/10 text-primary border-primary/20">
                      {member.role === 'PARENT' ? t('roleParent') : member.role === 'TEACHER' ? t('roleTeacher') : t('roleAdmin')}
                    </Badge>
                  </div>
                  <span className="text-[11px] text-muted-foreground">
                    {t('memberId')}: {member.id} • {t('contact')}: {member.phone}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={logoutMember}
                  className="h-8 text-xs text-muted-foreground hover:text-destructive gap-1"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  {t('btnLogout')}
                </Button>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-muted/50 border border-border/60 overflow-x-auto scrollbar-none">
              <button
                type="button"
                onClick={() => setActiveTab('CATALOG')}
                className={`flex-1 min-w-[140px] py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                  activeTab === 'CATALOG'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Compass className="w-4 h-4 text-primary" />
                <span>{t('tabCatalog')}</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('PARENT')}
                className={`flex-1 min-w-[140px] py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                  activeTab === 'PARENT'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Users className="w-4 h-4 text-blue-500" />
                <span>{t('tabParent')}</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('TEACHER')}
                className={`flex-1 min-w-[140px] py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                  activeTab === 'TEACHER'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <GraduationCap className="w-4 h-4 text-emerald-500" />
                <span>{t('tabTeacher')}</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('ADMIN')}
                className={`flex-1 min-w-[140px] py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                  activeTab === 'ADMIN'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Building2 className="w-4 h-4 text-purple-500" />
                <span>{t('tabAdmin')}</span>
              </button>
            </div>

            {/* Active Tab View */}
            <div className="pt-2">
              {activeTab === 'CATALOG' && (
                <EdutechProgramCatalog
                  programs={programs}
                  classes={classes}
                  member={member}
                  onEnroll={enrollClass}
                />
              )}

              {activeTab === 'PARENT' && (
                <EdutechParentPortal
                  member={member}
                  enrollments={enrollments}
                  homework={homework}
                  summaries={summaries}
                />
              )}

              {activeTab === 'TEACHER' && (
                <EdutechTeacherWorkflow
                  member={member}
                  classes={classes}
                  enrollments={enrollments}
                  onRecordAttendance={recordAttendance}
                  onSubmitHomework={submitHomework}
                  onGenerateAISummary={generateAISummary}
                />
              )}

              {activeTab === 'ADMIN' && (
                <EdutechAdminOps
                  member={member}
                  adminCapacity={adminCapacity}
                  enrollments={enrollments}
                  onToggleBatch={toggleBatchStatus}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
