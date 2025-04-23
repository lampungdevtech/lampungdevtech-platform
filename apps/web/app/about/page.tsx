"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Users, Heart, Target } from "lucide-react";
import { teamMembers } from "@/constants/team";

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-primary text-primary-foreground py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Tentang LampungDevTech</h1>
          <p className="text-xl max-w-2xl mx-auto">
            Membangun ekosistem teknologi yang kuat di Lampung melalui kolaborasi dan pembelajaran berkelanjutan.
          </p>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl font-bold mb-6">Sejarah Kami</h2>
            <p className="text-lg text-muted-foreground mb-6">
              LampungDevTech didirikan pada tahun 2023 oleh sekelompok developer yang memiliki visi untuk memajukan ekosistem teknologi di Lampung. Berawal dari meetup informal di kedai kopi, komunitas ini tumbuh menjadi wadah kolaborasi dan pembelajaran bagi para pengembang software di Lampung.
            </p>
            <p className="text-lg text-muted-foreground">
              Kami percaya bahwa Lampung memiliki potensi besar untuk menjadi salah satu pusat teknologi di Indonesia. Dengan membangun komunitas yang kuat dan inklusif, kami berharap dapat membantu mengembangkan talenta-talenta digital lokal dan mendorong pertumbuhan industri teknologi di Lampung.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <Card className="p-6 text-center">
              <Users className="h-12 w-12 mx-auto mb-4 text-primary" />
              <h3 className="text-xl font-semibold mb-2">Komunitas Inklusif</h3>
              <p className="text-muted-foreground">
                Terbuka untuk semua level pengembang, dari pemula hingga expert.
              </p>
            </Card>
            <Card className="p-6 text-center">
              <Heart className="h-12 w-12 mx-auto mb-4 text-primary" />
              <h3 className="text-xl font-semibold mb-2">Berbagi Pengetahuan</h3>
              <p className="text-muted-foreground">
                Mendorong budaya berbagi dan pembelajaran berkelanjutan.
              </p>
            </Card>
            <Card className="p-6 text-center">
              <Target className="h-12 w-12 mx-auto mb-4 text-primary" />
              <h3 className="text-xl font-semibold mb-2">Fokus pada Kualitas</h3>
              <p className="text-muted-foreground">
                Mengutamakan kualitas dalam setiap program dan kegiatan.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-muted/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Tim Kami</h2>
            <p className="text-muted-foreground">
              Kenali orang-orang di balik LampungDevTech
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {teamMembers.map((member, index) => (
              <Card key={index} className="p-6">
                <div className="text-center mb-4">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-24 h-24 rounded-full mx-auto mb-4"
                  />
                  <h3 className="text-xl font-semibold">{member.name}</h3>
                  <p className="text-sm text-primary mb-2">{member.role}</p>
                  <p className="text-muted-foreground">{member.description}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Join Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Bergabung dengan Komunitas</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Ayo jadi bagian dari gerakan membangun ekosistem teknologi yang lebih kuat dan berkelanjutan di Lampung!
          </p>
          <Button size="lg" variant="secondary">
            Bergabung Sekarang
          </Button>
        </div>
      </section>
    </div>
  );
}