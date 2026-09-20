"use client";

import React, { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { ClassSession, Enrollment, MemberProfile } from './types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  GraduationCap, 
  Users, 
  Sparkles, 
  Send, 
  BookCheck
} from 'lucide-react';

interface Props {
  member: MemberProfile | null;
  classes: ClassSession[];
  enrollments: Enrollment[];
  onRecordAttendance: (classId: string, studentId: string, status: string, topic: string) => void;
  onSubmitHomework: (enrollmentId: string, title: string, score: number, feedback: string) => void;
  onGenerateAISummary: (studentId: string, studentName: string, score: number, notes: string) => Promise<any>;
}

export function EdutechTeacherWorkflow({
  member,
  classes,
  enrollments,
  onRecordAttendance,
  onSubmitHomework,
  onGenerateAISummary,
}: Props) {
  const t = useTranslations('edutech');
  const locale = useLocale();
  const isEn = locale === 'en';

  const [selectedClassId, setSelectedClassId] = useState<string>(classes[0]?.id || '');
  const [topicCovered, setTopicCovered] = useState(
    isEn 
      ? 'Module 3: Conditional Logic & Dynamic Loops in Roblox' 
      : 'Modul 3: Logika Percabangan & Loop Bergerak Roblox'
  );
  
  // Attendance state map studentId -> 'PRESENT' | 'PERMIT' | 'ABSENT'
  const [attendance, setAttendance] = useState<Record<string, 'PRESENT' | 'PERMIT' | 'ABSENT'>>({
    'STU-01': 'PRESENT',
    'STU-02': 'PRESENT',
  });

  // Homework & AI Form
  const [selectedEnrollmentId, setSelectedEnrollmentId] = useState<string>(enrollments[0]?.id || '');
  const [hwTitle, setHwTitle] = useState(isEn ? 'Nested Loops Maze Quest' : 'Misi Labirin Loop Bertingkat');
  const [hwScore, setHwScore] = useState<number>(95);
  const [teacherNotes, setTeacherNotes] = useState(
    isEn 
      ? 'Student was very proactive asking questions and helping peers solve the loop quest.' 
      : 'Ananda sangat aktif bertanya dan membantu teman menyelesaikan tantangan loop.'
  );
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiOutput, setAiOutput] = useState<string | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const currentClass = classes.find(c => c.id === selectedClassId) || classes[0];
  const classStudents = enrollments.filter(e => e.classId === selectedClassId);

  const handleToggleAttendance = (studentId: string, status: 'PRESENT' | 'PERMIT' | 'ABSENT') => {
    setAttendance(prev => ({ ...prev, [studentId]: status }));
    onRecordAttendance(selectedClassId, studentId, status, topicCovered);
  };

  const handleSaveHomework = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEnrollmentId) return;

    onSubmitHomework(selectedEnrollmentId, hwTitle, hwScore, teacherNotes);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleTriggerAI = async () => {
    const enr = enrollments.find(e => e.id === selectedEnrollmentId) || enrollments[0];
    if (!enr) return;

    setIsGeneratingAI(true);
    setAiOutput(null);
    try {
      const res = await onGenerateAISummary(enr.studentId, enr.studentName, hwScore, teacherNotes);
      if (res?.aiGeneratedSummary) {
        setAiOutput(res.aiGeneratedSummary);
      }
    } finally {
      setIsGeneratingAI(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Teacher Workspace Header */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-primary/10 to-blue-500/10 border border-emerald-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-bold text-foreground">
                {t('teacherDeskTitle')} • {member?.name || (isEn ? 'Kak Fikri Ramadhan' : 'Kak Fikri Ramadhan')}
              </h2>
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30 text-[10px]">
                {isEn ? 'Active Mentor' : 'Mentor Aktif'}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {t('teacherDeskDesc')}
            </p>
          </div>
        </div>

        {/* Batch Class Selector */}
        <div className="flex items-center gap-2">
          <Label className="text-xs font-medium whitespace-nowrap">{t('selectBatch')}</Label>
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="h-9 text-xs rounded-lg border border-border bg-background px-2.5 py-1 focus:ring-1 focus:ring-primary"
          >
            {classes.map(c => (
              <option key={c.id} value={c.id}>
                {c.id} - {c.programTitle.slice(0, 25)}...
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Attendance Roster */}
        <Card className="border-border/60">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-500" />
                <CardTitle className="text-base font-bold">{t('attendanceTitle')}</CardTitle>
              </div>
              <Badge variant="outline" className="text-[10px]">
                {currentClass?.scheduleTime || (isEn ? 'Active Schedule' : 'Jadwal Aktif')}
              </Badge>
            </div>
            <CardDescription className="text-xs">
              {t('attendanceDesc')}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">{t('topicLabel')}</Label>
              <Input
                value={topicCovered}
                onChange={(e) => setTopicCovered(e.target.value)}
                className="h-9 text-xs"
              />
            </div>

            <div className="space-y-2">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {t('roster')} ({classStudents.length > 0 ? classStudents.length : enrollments.length} {isEn ? 'Students' : 'Siswa'})
              </div>

              <div className="space-y-2">
                {(classStudents.length > 0 ? classStudents : enrollments.slice(0, 3)).map((s) => {
                  const currentStatus = attendance[s.studentId] || 'PRESENT';

                  return (
                    <div
                      key={s.id}
                      className="p-3 rounded-xl border border-border/60 bg-muted/20 flex items-center justify-between gap-3"
                    >
                      <div>
                        <div className="text-xs font-bold text-foreground">{s.studentName}</div>
                        <div className="text-[10px] text-muted-foreground">
                          {isEn ? 'Parent' : 'Wali'}: {s.parentName} ({s.parentPhone})
                        </div>
                      </div>

                      {/* Attendance Buttons */}
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleToggleAttendance(s.studentId, 'PRESENT')}
                          className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                            currentStatus === 'PRESENT'
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'bg-muted text-muted-foreground hover:bg-muted/80'
                          }`}
                        >
                          {t('present')}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleAttendance(s.studentId, 'PERMIT')}
                          className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                            currentStatus === 'PERMIT'
                              ? 'bg-amber-500 text-white shadow-xs'
                              : 'bg-muted text-muted-foreground hover:bg-muted/80'
                          }`}
                        >
                          {t('permit')}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleAttendance(s.studentId, 'ABSENT')}
                          className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                            currentStatus === 'ABSENT'
                              ? 'bg-rose-600 text-white shadow-xs'
                              : 'bg-muted text-muted-foreground hover:bg-muted/80'
                          }`}
                        >
                          {t('absent')}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Right Column: Homework & AI Evaluation Synthesizer */}
        <Card className="border-border/60">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookCheck className="w-4 h-4 text-primary" />
                <CardTitle className="text-base font-bold">{t('evalTitle')}</CardTitle>
              </div>
              <Badge variant="secondary" className="text-[10px] font-semibold flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-primary" />
                AI Assistant
              </Badge>
            </div>
            <CardDescription className="text-xs">
              {t('evalDesc')}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <form onSubmit={handleSaveHomework} className="space-y-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">{t('selectStudent')}</Label>
                <select
                  value={selectedEnrollmentId}
                  onChange={(e) => setSelectedEnrollmentId(e.target.value)}
                  className="w-full h-9 text-xs rounded-lg border border-border bg-background px-2.5 py-1 focus:ring-1 focus:ring-primary"
                >
                  {enrollments.map(e => (
                    <option key={e.id} value={e.id}>
                      {e.studentName} ({e.programTitle?.slice(0, 20)}...)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2 space-y-1.5">
                  <Label className="text-xs font-medium">{t('questTitle')}</Label>
                  <Input
                    value={hwTitle}
                    onChange={(e) => setHwTitle(e.target.value)}
                    className="h-9 text-xs"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">{t('score')} (0-100)</Label>
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    value={hwScore}
                    onChange={(e) => setHwScore(Number(e.target.value))}
                    className="h-9 text-xs font-bold text-center"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium">{t('teacherNotes')}</Label>
                <Textarea
                  value={teacherNotes}
                  onChange={(e) => setTeacherNotes(e.target.value)}
                  placeholder={t('teacherNotesPlaceholder')}
                  rows={3}
                  className="text-xs resize-none"
                  required
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <Button
                  type="submit"
                  size="sm"
                  className="h-9 text-xs font-semibold rounded-lg flex-1 bg-secondary text-secondary-foreground hover:bg-secondary/80 gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  {savedSuccess ? (isEn ? 'Saved ✓' : 'Tersimpan ✓') : t('btnSaveHw')}
                </Button>

                <Button
                  type="button"
                  size="sm"
                  onClick={handleTriggerAI}
                  disabled={isGeneratingAI || !teacherNotes}
                  className="h-9 text-xs font-semibold rounded-lg bg-gradient-to-r from-primary to-purple-600 text-white hover:opacity-95 gap-1.5 shadow-xs"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  {isGeneratingAI ? t('btnGeneratingAi') : t('btnGenerateAi')}
                </Button>
              </div>
            </form>

            {/* AI Generated Result Preview Box */}
            {aiOutput && (
              <div className="p-3.5 rounded-xl bg-gradient-to-br from-primary/10 via-purple-500/5 to-card border border-primary/30 space-y-2 animate-in fade-in duration-300">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-primary flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    {t('aiSynthesisResult')}
                  </span>
                  <Badge variant="outline" className="text-[10px] text-emerald-600 border-emerald-500/30">
                    {t('readyForPortal')}
                  </Badge>
                </div>
                <p className="text-xs text-foreground/90 leading-relaxed whitespace-pre-line">
                  {aiOutput}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
