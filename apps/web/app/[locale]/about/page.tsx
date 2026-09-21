"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Users,
  Heart,
  Target,
  Compass,
  CheckCircle2,
  Linkedin,
  Github,
  Twitter,
  Sparkles,
  Quote,
} from "lucide-react";
import { teamMembers as defaultTeam } from "@/constants/team";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/routing";

interface FounderItem {
  id: string;
  name: string;
  title: string;
  role: string;
  bio: string;
  bioEn?: string;
  image: string;
  linkedinUrl?: string;
  githubUrl?: string;
  twitterUrl?: string;
}

export default function AboutPage() {
  const t = useTranslations('about');
  const locale = useLocale();

  const [founders, setFounders] = useState<FounderItem[]>([]);
  const [loadingFounders, setLoadingFounders] = useState(true);

  useEffect(() => {
    async function loadFounders() {
      try {
        const res = await fetch('/api/founders');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setFounders(data);
            return;
          }
        }
      } catch (err) {
        console.warn('Could not fetch founders from API, using fallback team:', err);
      } finally {
        setLoadingFounders(false);
      }

      // Fallback ke default teamMembers
      setFounders(
        defaultTeam.map((m, idx) => ({
          id: `FND-DEFAULT-${idx + 1}`,
          name: m.name,
          title: 'Co-Founder',
          role: m.role,
          bio: m.description,
          bioEn: m.description,
          image: m.image,
          linkedinUrl: 'https://linkedin.com',
          githubUrl: 'https://github.com/lampungdevtech',
          twitterUrl: 'https://twitter.com/lampungdevtech',
        }))
      );
    }

    loadFounders();
  }, []);

  const visionList = t.raw('visionList') as Array<{ title: string; desc: string }>;
  const missionList = t.raw('missionList') as string[];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-primary text-primary-foreground py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-b from-black/10 to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-foreground/10 text-primary-foreground text-xs font-medium mb-4 backdrop-blur-xs">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Lampung Developer Community</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6">
            {t('heroTitle')}
          </h1>
          <p className="text-lg md:text-xl max-w-3xl mx-auto text-primary-foreground/90 leading-relaxed font-normal">
            {t('heroSubtitle')}
          </p>
        </div>
      </section>

      {/* Story & Pillars Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl font-bold mb-6 tracking-tight">{t('historyTitle')}</h2>
            <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
              {t('storyParagraph1')}
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed">
              {t('storyParagraph2')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <Card className="p-8 text-center border shadow-xs hover:border-primary/40 transition-all">
              <div className="p-3 bg-primary/10 rounded-2xl w-fit mx-auto mb-4 text-primary">
                <Users className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold mb-2">{t('pillars.inclusiveTitle')}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {t('pillars.inclusiveDesc')}
              </p>
            </Card>

            <Card className="p-8 text-center border shadow-xs hover:border-primary/40 transition-all">
              <div className="p-3 bg-primary/10 rounded-2xl w-fit mx-auto mb-4 text-primary">
                <Heart className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold mb-2">{t('pillars.sharingTitle')}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {t('pillars.sharingDesc')}
              </p>
            </Card>

            <Card className="p-8 text-center border shadow-xs hover:border-primary/40 transition-all">
              <div className="p-3 bg-primary/10 rounded-2xl w-fit mx-auto mb-4 text-primary">
                <Target className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold mb-2">{t('pillars.qualityTitle')}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {t('pillars.qualityDesc')}
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Visi Komunitas Section */}
      <section className="py-20 bg-muted/30 border-y border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider mb-3">
              <Compass className="h-4 w-4" />
              <span>Arah & Cita-cita</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4">
              {t('visionTitle')}
            </h2>
            <p className="text-muted-foreground text-base md:text-lg leading-relaxed">
              {t('visionSubtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.isArray(visionList) &&
              visionList.map((item, idx) => (
                <Card
                  key={idx}
                  className={`p-6 border shadow-xs hover:border-primary/50 transition-all flex flex-col justify-between ${
                    idx === 4 ? 'md:col-span-2 lg:col-span-1' : ''
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-2xl font-black text-primary/40">
                        0{idx + 1}
                      </span>
                      <span className="h-2 w-2 rounded-full bg-primary" />
                    </div>
                    <h3 className="text-base font-bold text-foreground mb-3 leading-snug">
                      {item.title}
                    </h3>
                    <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </Card>
              ))}
          </div>
        </div>
      </section>

      {/* Misi Komunitas Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider mb-3">
              <Target className="h-4 w-4" />
              <span>Aksi & Langkah Nyata</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4">
              {t('missionTitle')}
            </h2>
            <p className="text-muted-foreground text-base md:text-lg leading-relaxed">
              {t('missionSubtitle')}
            </p>
          </div>

          {/* 10 Mission Points */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
            {Array.isArray(missionList) &&
              missionList.map((missionText, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3.5 p-4 rounded-xl border bg-card/60 hover:bg-card hover:border-primary/40 transition-all shadow-xs"
                >
                  <div className="p-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <span className="text-xs font-bold text-primary mr-1.5">
                      #{idx + 1}
                    </span>
                    <span className="text-xs md:text-sm text-foreground/90 font-medium leading-relaxed">
                      {missionText}
                    </span>
                  </div>
                </div>
              ))}
          </div>

          {/* Mission Manifesto Card */}
          <Card className="p-8 md:p-10 border-2 border-primary/20 bg-linear-to-br from-primary/5 via-background to-muted/20 shadow-sm relative overflow-hidden">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <div className="p-4 bg-primary/10 rounded-2xl text-primary shrink-0">
                <Quote className="h-8 w-8" />
              </div>
              <div className="flex-1">
                <h4 className="text-base font-bold text-foreground uppercase tracking-wider mb-2">
                  Manifesto Komitmen Bersama
                </h4>
                <p className="text-sm md:text-base text-muted-foreground italic leading-relaxed">
                  "{t('missionManifesto')}"
                </p>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Co-Founders & Team Section */}
      <section className="py-20 bg-muted/40 border-t border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider mb-3">
              <Users className="h-4 w-4" />
              <span>Kepemimpinan & Inisiator</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4">
              {t('teamTitle')}
            </h2>
            <p className="text-muted-foreground text-base md:text-lg leading-relaxed">
              {t('teamSubtitle')}
            </p>
          </div>

          {loadingFounders ? (
            <div className="text-center py-12 text-muted-foreground">
              Memuat data Co-Founders...
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {founders.map((founder) => {
                const bioText =
                  locale === 'en' && founder.bioEn ? founder.bioEn : founder.bio;

                return (
                  <Card
                    key={founder.id}
                    className="p-6 border shadow-xs hover:border-primary/40 transition-all flex flex-col justify-between"
                  >
                    <div className="text-center">
                      <div className="relative inline-block mb-4">
                        <img
                          src={founder.image}
                          alt={founder.name}
                          className="w-28 h-28 rounded-full mx-auto object-cover border-4 border-primary/20 shadow-xs"
                        />
                        {founder.image.endsWith('.webp') && (
                          <span className="absolute bottom-0 right-0 bg-emerald-600 text-white text-[9px] font-bold px-1.5 py-0.2 rounded-full uppercase">
                            WebP
                          </span>
                        )}
                      </div>

                      <div className="inline-block mb-2">
                        <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-primary/10 text-primary">
                          {founder.title || 'Co-Founder'}
                        </span>
                      </div>

                      <h3 className="text-xl font-bold text-foreground mb-1">
                        {founder.name}
                      </h3>
                      <p className="text-xs font-semibold text-primary mb-3">
                        {founder.role}
                      </p>
                      <p className="text-xs md:text-sm text-muted-foreground leading-relaxed line-clamp-4">
                        {bioText}
                      </p>
                    </div>

                    {/* Social links */}
                    <div className="flex items-center justify-center gap-3 pt-6 mt-4 border-t text-muted-foreground">
                      {founder.linkedinUrl && (
                        <a
                          href={founder.linkedinUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-primary transition-colors p-1"
                          aria-label={`LinkedIn ${founder.name}`}
                        >
                          <Linkedin className="h-4 w-4" />
                        </a>
                      )}
                      {founder.githubUrl && (
                        <a
                          href={founder.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-primary transition-colors p-1"
                          aria-label={`GitHub ${founder.name}`}
                        >
                          <Github className="h-4 w-4" />
                        </a>
                      )}
                      {founder.twitterUrl && (
                        <a
                          href={founder.twitterUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-primary transition-colors p-1"
                          aria-label={`Twitter ${founder.name}`}
                        >
                          <Twitter className="h-4 w-4" />
                        </a>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Join Section */}
      <section className="py-20 bg-primary text-primary-foreground text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4 tracking-tight">
            {t('joinTitle')}
          </h2>
          <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto text-primary-foreground/90 leading-relaxed">
            {t('joinSubtitle')}
          </p>
          <Button size="lg" variant="secondary" className="font-bold shadow-md" asChild>
            <Link href="/login">{t('joinButton')}</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}