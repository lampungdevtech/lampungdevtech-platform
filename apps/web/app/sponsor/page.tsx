"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { previousSponsors } from '@/constants/sponsors';

export default function SponsorPage() {
  return (
    <div className="min-h-screen py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold mb-4">Sponsor LampungDevTech</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Dukung perkembangan komunitas teknologi di Lampung dan dapatkan exposure untuk brand Anda
          </p>
        </div>

        {/* Previous Sponsors Section */}
        <div className="mb-20">
          <h2 className="text-2xl font-bold text-center mb-8">Sponsor Kami</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {previousSponsors.map((sponsor, index) => (
              <div key={index} className="flex items-center justify-center h-40">
                <a 
                  href={sponsor.instagram} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="relative block w-32 h-32 group"
                >
                  {sponsor.type && (
                    <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-primary/90 text-primary-foreground px-3 py-1 rounded-full text-sm opacity-0 group-hover:opacity-100 group-hover:-translate-y-2 transition-all duration-300 whitespace-nowrap z-10">
                      {sponsor.type}
                    </span>
                  )}
                  <div className="relative z-0 w-full h-full flex items-center justify-center">
                    <img
                      src={sponsor.logo}
                      alt={sponsor.name}
                      className="max-w-full max-h-full object-contain transition-transform duration-300 group-hover:scale-110"
                    />
                  </div>
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* Benefits Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4">Brand Visibility</h3>
            <p className="text-muted-foreground">
              Tampilkan brand Anda ke ribuan developer dan tech enthusiast di Lampung melalui website, 
              social media, dan event-event kami.
            </p>
          </Card>
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4">Talent Access</h3>
            <p className="text-muted-foreground">
              Akses langsung ke talent pool developer berkualitas untuk kebutuhan rekrutmen 
              perusahaan Anda.
            </p>
          </Card>
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4">Community Impact</h3>
            <p className="text-muted-foreground">
              Berkontribusi dalam pengembangan ekosistem teknologi di Lampung dan 
              pemberdayaan developer lokal.
            </p>
          </Card>
        </div>

        {/* CTA Section */}
        <Card className="p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Mulai Sponsorship</h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Tertarik untuk mendukung komunitas? Mari diskusikan bagaimana kita bisa berkolaborasi 
            untuk memajukan ekosistem teknologi di Lampung.
          </p>
          <Button size="lg" asChild>
            <a href="/contact">Hubungi Kami</a>
          </Button>
        </Card>
      </div>
    </div>
  );
}