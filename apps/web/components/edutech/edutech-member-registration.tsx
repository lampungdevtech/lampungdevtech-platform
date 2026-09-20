"use client";

import React, { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { UserRole } from './types';
import { Sparkles, ShieldCheck, GraduationCap, Users, Lock, CheckCircle2 } from 'lucide-react';

interface Props {
  onRegister: (data: {
    name: string;
    email: string;
    phone: string;
    role: UserRole;
    childName?: string;
    childAge?: number;
  }) => void;
}

export function EdutechMemberRegistration({ onRegister }: Props) {
  const t = useTranslations('edutech');
  const locale = useLocale();
  const isEn = locale === 'en';

  const [role, setRole] = useState<UserRole>('PARENT');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [childName, setChildName] = useState('');
  const [childAge, setChildAge] = useState<number>(9);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return;

    setIsSubmitting(true);
    setTimeout(() => {
      onRegister({
        name,
        email: email || `${name.toLowerCase().replace(/\s+/g, '')}@gmail.com`,
        phone,
        role,
        childName: role === 'PARENT' ? (childName || (isEn ? 'Student' : 'Ananda')) : undefined,
        childAge: role === 'PARENT' ? childAge : undefined,
      });
      setIsSubmitting(false);
      setIsSuccess(true);
    }, 400);
  };

  return (
    <div className="relative max-w-2xl mx-auto my-8">
      {/* Glow Effect */}
      <div className="absolute -inset-1 bg-gradient-to-r from-primary/30 via-purple-500/20 to-blue-500/30 rounded-2xl blur-xl opacity-75 group-hover:opacity-100 transition duration-1000 -z-10" />

      <Card className="border-border/60 bg-card/90 backdrop-blur-md shadow-2xl">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-3">
            <Badge variant="outline" className="px-3 py-1 bg-primary/10 text-primary border-primary/20 flex items-center gap-1.5 text-xs font-semibold">
              <Lock className="w-3.5 h-3.5" />
              {isEn ? 'Gated Member Access • Enrollment Gate' : 'Gated Member Access • Registrasi Bimbel'}
            </Badge>
          </div>
          <CardTitle className="text-2xl sm:text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground via-foreground/90 to-primary bg-clip-text">
            {t('gatedTitle')}
          </CardTitle>
          <CardDescription className="text-muted-foreground text-sm max-w-md mx-auto mt-1.5">
            {t('gatedDesc')}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Role Switcher */}
            <div>
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
                {t('roleLabel')}
              </Label>
              <div className="grid grid-cols-3 gap-2.5">
                <button
                  type="button"
                  onClick={() => setRole('PARENT')}
                  className={`p-3 rounded-xl border text-left flex flex-col items-start gap-1 transition-all ${
                    role === 'PARENT'
                      ? 'border-primary bg-primary/10 ring-2 ring-primary/20 text-primary'
                      : 'border-border/60 hover:border-primary/40 bg-background/50 text-muted-foreground'
                  }`}
                >
                  <Users className="w-5 h-5 mb-0.5" />
                  <span className="text-xs font-semibold">{t('roleParent')}</span>
                  <span className="text-[10px] opacity-80 leading-tight">{t('roleParentDesc')}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRole('TEACHER')}
                  className={`p-3 rounded-xl border text-left flex flex-col items-start gap-1 transition-all ${
                    role === 'TEACHER'
                      ? 'border-primary bg-primary/10 ring-2 ring-primary/20 text-primary'
                      : 'border-border/60 hover:border-primary/40 bg-background/50 text-muted-foreground'
                  }`}
                >
                  <GraduationCap className="w-5 h-5 mb-0.5" />
                  <span className="text-xs font-semibold">{t('roleTeacher')}</span>
                  <span className="text-[10px] opacity-80 leading-tight">{t('roleTeacherDesc')}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRole('ADMIN')}
                  className={`p-3 rounded-xl border text-left flex flex-col items-start gap-1 transition-all ${
                    role === 'ADMIN'
                      ? 'border-primary bg-primary/10 ring-2 ring-primary/20 text-primary'
                      : 'border-border/60 hover:border-primary/40 bg-background/50 text-muted-foreground'
                  }`}
                >
                  <ShieldCheck className="w-5 h-5 mb-0.5" />
                  <span className="text-xs font-semibold">{t('roleAdmin')}</span>
                  <span className="text-[10px] opacity-80 leading-tight">{t('roleAdminDesc')}</span>
                </button>
              </div>
            </div>

            {/* Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="space-y-1.5">
                <Label htmlFor="reg-name" className="text-xs font-medium">{t('fullName')}</Label>
                <Input
                  id="reg-name"
                  placeholder={role === 'PARENT' ? (isEn ? 'John Doe' : 'Budi Santoso') : role === 'TEACHER' ? 'Kak Fikri Ramadhan' : 'Admin Operations'}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="h-10 text-sm bg-background/60"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="reg-phone" className="text-xs font-medium">{t('whatsapp')}</Label>
                <Input
                  id="reg-phone"
                  placeholder="0812-3456-7890"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  className="h-10 text-sm bg-background/60"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="reg-email" className="text-xs font-medium">{t('email')}</Label>
              <Input
                id="reg-email"
                type="email"
                placeholder="name@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-10 text-sm bg-background/60"
              />
            </div>

            {/* Role specific extras */}
            {role === 'PARENT' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 p-3.5 rounded-xl bg-muted/40 border border-border/50">
                <div className="space-y-1.5">
                  <Label htmlFor="reg-child" className="text-xs font-medium">{t('childName')}</Label>
                  <Input
                    id="reg-child"
                    placeholder={isEn ? 'Alex Doe' : 'Kenzo Al-Ghifari'}
                    value={childName}
                    onChange={(e) => setChildName(e.target.value)}
                    className="h-9 text-xs bg-background/80"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="reg-age" className="text-xs font-medium">{t('childAge')}</Label>
                  <Input
                    id="reg-age"
                    type="number"
                    min={4}
                    max={18}
                    value={childAge}
                    onChange={(e) => setChildAge(Number(e.target.value))}
                    className="h-9 text-xs bg-background/80"
                  />
                </div>
              </div>
            )}

            <Button
              type="submit"
              disabled={isSubmitting || !name || !phone}
              className="w-full h-11 text-sm font-semibold rounded-xl bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-700 shadow-md flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <span>{t('btnProcessing')}</span>
              ) : isSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-white" />
                  <span>{t('btnSuccess')}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>{t('btnRegister')}</span>
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
