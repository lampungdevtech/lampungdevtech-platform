"use client";

import { Card } from "@/components/ui/card";
import { Target, Compass, CheckCircle2, Quote, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";

export default function VisionMissionPage() {
  const t = useTranslations('about');

  const visionList = t.raw('visionList') as Array<{ title: string; desc: string }>;
  const missionList = t.raw('missionList') as string[];

  return (
    <div className="min-h-screen py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider mb-4">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Fondasi & Nilai Komunitas</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 text-foreground">
            Visi & Misi Komunitas
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
            Komitmen bersama untuk membangun ekosistem teknologi yang kuat, inklusif, dan berdaya saing global di Lampung.
          </p>
        </div>

        {/* Vision Section */}
        <div className="space-y-8">
          <div className="text-center max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider mb-2">
              <Compass className="h-4 w-4" />
              <span>Visi Masa Depan</span>
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight">
              {t('visionTitle')}
            </h2>
            <p className="text-muted-foreground text-sm mt-1">
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
                      <span className="h-2.5 w-2.5 rounded-full bg-primary" />
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

        {/* Mission Section */}
        <div className="space-y-8">
          <div className="text-center max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider mb-2">
              <Target className="h-4 w-4" />
              <span>Aksi Nyata</span>
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight">
              {t('missionTitle')}
            </h2>
            <p className="text-muted-foreground text-sm mt-1">
              {t('missionSubtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.isArray(missionList) &&
              missionList.map((missionText, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3.5 p-4.5 rounded-xl border bg-card hover:border-primary/40 transition-all shadow-xs"
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
      </div>
    </div>
  );
}