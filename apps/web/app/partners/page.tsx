"use client";

import { Card } from "@/components/ui/card";
import { Building2, Users, Globe, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const partners = [
  {
    name: "Payungi",
    type: "Mitra Komunitas",
    description: "Kampung Kreatif - Payungi hadir atas inisiatif warga berdaya yang percaya perubahan bisa dilakukan dengan gotong royong.",
    logo: "/payungi-logo.jpg",
    website: "https://payungi.org"
  },
  {
    name: "Kedai Rumah Belajar",
    type: "Mitra Komunitas",
    description: "Kedai Rumah Belajar | Coffee & Space",
    logo: "/rumah-belajar-logo.jpg",
    website: "https://www.instagram.com/rumah.belajar__"
  },
  {
    name: "Suaka Marga Technopreneur",
    type: "Mitra Komunitas",
    description: "Kolaborasi dalam pengembangan ekosistem startup di Lampung.",
    logo: "https://media.licdn.com/dms/image/v2/D560BAQFY8QKaA3rmYg/company-logo_200_200/company-logo_200_200/0/1730430724989?e=1750896000&v=beta&t=q8CC8nHdf9BVZW0kOcR9t8UYOK7PLw1dqMix9dJy6Vg",
    website: "https://startuplampung.com"
  }
];

export default function PartnersPage() {
  return (
    <div className="min-h-screen py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold mb-4">Mitra Komunitas</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Berkolaborasi lintas sektor untuk menciptakan ekosistem teknologi yang lebih inklusif dan berdaya di Lampung.
          </p>
        </div>

        {/* Benefits Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          <Card className="p-6 text-center">
            <Building2 className="h-12 w-12 mx-auto mb-4 text-primary" />
            <h3 className="text-xl font-semibold mb-2">Kolaborasi Program & Event</h3>
            <p className="text-muted-foreground">
              Akses prioritas untuk berkolaborasi dalam berbagai program LampungDevTech
               
            </p>
          </Card>
          <Card className="p-6 text-center">
            <Users className="h-12 w-12 mx-auto mb-4 text-primary" />
            <h3 className="text-xl font-semibold mb-2">Dukungan Promosi</h3>
            <p className="text-muted-foreground">
            Ini bukan hanya soal branding, tapi juga soal membangun kredibilitas dan kepercayaan
            </p>
          </Card>
          <Card className="p-6 text-center">
            <Globe className="h-12 w-12 mx-auto mb-4 text-primary" />
            <h3 className="text-xl font-semibold mb-2">Resources</h3>
            <p className="text-muted-foreground">
              Akses ke sumber daya dan peluang dalam Jaringan Profesional & Talent untuk kolaborasi
            </p>
          </Card>
        </div>

        {/* Partners Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {partners.map((partner, index) => (
            <Card key={index} className="p-6">
              <div className="flex items-start space-x-4">
                <img
                  src={partner.logo}
                  alt={partner.name}
                  className="w-16 h-16 rounded-lg object-cover"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-semibold">{partner.name}</h3>
                      <p className="text-sm text-primary">{partner.type}</p>
                    </div>
                    <Button variant="ghost" size="icon" asChild>
                      <a href={partner.website} target="_blank" rel="noopener noreferrer">
                        <ArrowUpRight className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                  <p className="mt-2 text-muted-foreground">{partner.description}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* CTA Section */}
        <div className="mt-20 text-center">
          <Card className="p-8">
            <h2 className="text-2xl font-bold mb-4">Tertarik Menjadi Mitra?</h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Ayo berkolaborasi membentuk masa depan teknologi di Lampung.
              Terbuka untuk diskusi dan peluang kemitraan – hubungi kami sekarang.
            </p>
            <Button asChild>
              <a href="/contact">Hubungi Kami</a>
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}