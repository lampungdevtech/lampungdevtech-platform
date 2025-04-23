"use client";

import { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Calendar, Users, Lightbulb, ArrowRight } from 'lucide-react';
import { FaTelegramPlane } from 'react-icons/fa';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { events } from '@/constants/events';
import { testimonials } from '@/constants/testimonials';

export function HomePage() {
  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
      easing: 'ease-out',
    });
  }, []);

  const upcomingEvents = events.filter(event => event.status === 'upcoming');
  const previousEvents = events
    .filter(event => event.status === 'past')
    .slice(0, 3);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-primary to-primary/80 text-primary-foreground py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center" data-aos="fade-up">
            <div className="flex items-center justify-center mb-6 group">
              <Image
                src="/lampungdevtech-logo.svg"
                alt="LampungDevTech Logo"
                width={64}
                height={64}
                className="transform transition-transform duration-300 group-hover:rotate-12"
              />
              <h1 className="text-4xl md:text-5xl font-bold ml-4 transform transition-transform duration-300 group-hover:scale-105">
                LampungDevTech
              </h1>
            </div>
            <p className="text-xl md:text-2xl mb-2 max-w-3xl mx-auto">
              Bergabunglah dengan komunitas developer teknologi terbesar di Lampung. Belajar, berbagi, dan berkembang bersama.
            </p>
            <p className="text-lg mb-8 text-primary-foreground/80">#SangBumiRuwaJurai</p>
            <div className="flex justify-center gap-4" data-aos="fade-up" data-aos-delay="200">
              <Button 
                size="icon"
                className="bg-[#229ED9] hover:bg-[#1d8abf] text-white w-12 h-12 rounded-md transition-all duration-300 hover:scale-110 hover:rotate-12" 
                asChild
              >
                <a href="https://t.me/lampungdevtech" target="_blank" rel="noopener noreferrer">
                  <FaTelegramPlane className="h-6 w-6" />
                </a>
              </Button>
              <Button 
                size="lg" 
                variant="secondary" 
                className="transition-all duration-300 hover:scale-105 hover:shadow-lg"
                asChild
              >
                <Link href="/login">Bergabung Sekarang</Link>
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="bg-transparent text-primary-foreground hover:bg-primary-foreground hover:text-primary border-primary-foreground transition-all duration-300 hover:scale-105 hover:shadow-lg" 
                asChild
              >
                <Link href="/about">Pelajari Lebih Lanjut</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Community Image Section */}
      <section className="py-16 bg-background">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl overflow-hidden shadow-2xl" data-aos="zoom-in">
            <img
              src="/lampungdevtech-photo-collage.jpeg"
              alt="Komunitas Developer Lampung"
              className="w-full h-auto object-cover"
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="p-6" data-aos="fade-up" data-aos-delay="0">
              <Calendar className="h-12 w-12 mb-4 text-primary" />
              <h3 className="text-xl font-semibold mb-2">Acara Rutin</h3>
              <p className="text-muted-foreground">
                Casual meetup, Work From Cafe (WFC) dan Tech Meetup rutin untuk meningkatkan soft skill dan hard skill Anda.
              </p>
            </Card>
            <Card className="p-6" data-aos="fade-up" data-aos-delay="100">
              <Users className="h-12 w-12 mb-4 text-primary" />
              <h3 className="text-xl font-semibold mb-2">Komunitas Aktif</h3>
              <p className="text-muted-foreground">
                Bergabung dengan ratusan developer aktif di Lampung untuk networking dan kolaborasi.
              </p>
            </Card>
            <Card className="p-6" data-aos="fade-up" data-aos-delay="200">
              <Lightbulb className="h-12 w-12 mb-4 text-primary" />
              <h3 className="text-xl font-semibold mb-2">Dapatkan Wawasan Berharga</h3>
              <p className="text-muted-foreground">
                Pelajari langsung hard skill dan soft skill dari para profesional yang aktif di industri melalui sesi networking disemua event.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Upcoming Events Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12" data-aos="fade-up">
            <h2 className="text-3xl font-bold mb-4">Acara Mendatang</h2>
            <p className="text-muted-foreground">Jangan lewatkan acara-acara menarik dari komunitas kami</p>
          </div>
          {upcomingEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              {upcomingEvents.map((event, index) => (
                <Link href={`/events/${event.slug}`} key={index}>
                  <Card 
                    className="overflow-hidden hover:shadow-lg transition-shadow"
                    data-aos="fade-up"
                    data-aos-delay={index * 100}
                  >
                    <div className="aspect-square relative">
                      <img
                        src={event.image}
                        alt={event.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-semibold mb-2">{event.title}</h3>
                      <p className="text-muted-foreground mb-4">
                        {event.date} • {event.location}
                      </p>
                      <Button variant="default" className="w-full">
                        Daftar Sekarang
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12" data-aos="fade-up">
              <Calendar className="h-24 w-24 text-muted-foreground mb-6" />
              <h3 className="text-2xl font-semibold mb-2">Belum Ada Acara Selanjutnya</h3>
              <p className="text-muted-foreground text-center max-w-md mb-6">
                Kami sedang menyiapkan acara-acara menarik untuk Anda. Pantau terus halaman ini untuk informasi terbaru.
              </p>
              <Button variant="outline" asChild>
                <Link href="/events">
                  Lihat Semua Acara
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          )}
          <div className="text-center" data-aos="fade-up">
            <Button size="lg" asChild>
              <Link href="/events">
                Lihat Lebih Banyak Acara
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Previous Events Section */}
      <section className="py-20 bg-muted/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12" data-aos="fade-up">
            <h2 className="text-3xl font-bold mb-4">Acara Sebelumnya</h2>
            <p className="text-muted-foreground">Lihat kembali acara-acara yang telah kami selenggarakan</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {previousEvents.map((event, index) => (
              <Link href={`/events/${event.slug}`} key={index}>
                <Card 
                  className="overflow-hidden hover:shadow-lg transition-shadow"
                  data-aos="fade-up"
                  data-aos-delay={index * 100}
                >
                  <div className="aspect-square relative">
                    <img
                      src={event.image}
                      alt={event.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold mb-2">{event.title}</h3>
                    <p className="text-muted-foreground mb-4">
                      {event.date} • {event.location}
                    </p>
                    <Button variant="outline" className="w-full">
                      Lihat Detail
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
          <div className="text-center" data-aos="fade-up">
            <Button size="lg" asChild>
              <Link href="/events">
                Lihat Lebih Banyak Acara
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12" data-aos="fade-up">
            <h2 className="text-3xl font-bold mb-4">Apa Kata Mereka</h2>
            <p className="text-muted-foreground">Testimoni dari anggota komunitas kami</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card 
                key={index} 
                className="p-6"
                data-aos="fade-up"
                data-aos-delay={index * 100}
              >
                <div className="flex items-center mb-4">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full mr-4"
                  />
                  <div>
                    <h4 className="font-semibold">{testimonial.name}</h4>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-muted-foreground">{testimonial.content}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center" data-aos="fade-up">
          <h2 className="text-3xl font-bold mb-4">Siap Bergabung?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Jadilah bagian dari komunitas developer terbesar di Lampung dan kembangkan karirmu bersama kami.
          </p>
          <Button size="lg" variant="secondary" asChild>
            <Link href="/login">Bergabung Sekarang</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
