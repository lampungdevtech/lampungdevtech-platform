"use client";

import { Card } from "@/components/ui/card";
import { Target, Lightbulb, Users, Code, BookOpen, Globe } from "lucide-react";

export default function VisionMissionPage() {
  return (
    <div className="min-h-screen py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold mb-4">Visi & Misi</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Membangun ekosistem teknologi yang kuat dan berkelanjutan di Lampung
          </p>
        </div>

        {/* Vision Section */}
        <div className="mb-20">
          <Card className="p-8">
            <div className="flex flex-col items-center text-center mb-12">
              <Target className="h-16 w-16 text-primary mb-4" />
              <h2 className="text-3xl font-bold mb-4">Visi</h2>
              <p className="text-xl text-muted-foreground max-w-2xl">
                Menjadi pusat pengembangan teknologi terkemuka di Lampung yang mendorong inovasi, 
                kolaborasi, dan pertumbuhan ekosistem digital yang berkelanjutan.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="flex items-start">
                <Lightbulb className="h-8 w-8 text-primary mr-4 flex-shrink-0" />
                <div>
                  <h3 className="text-xl font-semibold mb-2">Inovasi Teknologi</h3>
                  <p className="text-muted-foreground">
                    Mendorong pengembangan solusi teknologi inovatif yang menjawab kebutuhan lokal dan global.
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <Users className="h-8 w-8 text-primary mr-4 flex-shrink-0" />
                <div>
                  <h3 className="text-xl font-semibold mb-2">Komunitas Inklusif</h3>
                  <p className="text-muted-foreground">
                    Membangun komunitas teknologi yang inklusif dan mendukung pertumbuhan bersama.
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Mission Section */}
        <div>
          <Card className="p-8">
            <div className="flex flex-col items-center text-center mb-12">
              <Target className="h-16 w-16 text-primary mb-4" />
              <h2 className="text-3xl font-bold mb-4">Misi</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="flex flex-col items-center text-center">
                <Code className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">Pengembangan Skill</h3>
                <p className="text-muted-foreground">
                  Menyelenggarakan program pelatihan dan workshop untuk meningkatkan kemampuan teknis developer di Lampung.
                </p>
              </div>

              <div className="flex flex-col items-center text-center">
                <BookOpen className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">Berbagi Pengetahuan</h3>
                <p className="text-muted-foreground">
                  Memfasilitasi pertukaran pengetahuan dan pengalaman melalui meetup, seminar, dan forum diskusi.
                </p>
              </div>

              <div className="flex flex-col items-center text-center">
                <Globe className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">Kolaborasi Global</h3>
                <p className="text-muted-foreground">
                  Membangun jaringan dengan komunitas teknologi global untuk membuka peluang kolaborasi.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}