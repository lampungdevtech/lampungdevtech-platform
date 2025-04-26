'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Calendar,
  MapPin,
  Clock,
  Users,
  Share2,
  CalendarPlus,
  ExternalLink,
} from 'lucide-react';
import { type FC } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { RegistrationModal } from '@/components/events/registration-modal';

interface Event {
  title: string;
  date: string;
  time: string;
  location: string;
  image: string;
  description?: string;
  learningPoints?: string[];
  requirements?: string[];
  coordinates?: {
    lat: string;
    lng: string;
  };
  status: 'upcoming' | 'past';
  type: string;
  locationUrl?: string;
}

interface ClientEventPageProps {
  event: Event;
}

const ClientEventPage: FC<ClientEventPageProps> = ({ event }) => {
  const shareData = {
    title: event.title,
    text: `Check out this event: ${event.title}`,
    url: window.location.href,
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log('Error sharing:', err);
      }
    }
  };

  const handleSocialShare = (platform: string) => {
    const text = encodeURIComponent(shareData.text);
    const url = encodeURIComponent(shareData.url);

    const shareUrls = {
      twitter: `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
      whatsapp: `https://wa.me/?text=${text}%20${url}`,
      telegram: `https://t.me/share/url?url=${url}&text=${text}`,
    };

    window.open(
      shareUrls[platform as keyof typeof shareUrls],
      '_blank',
      'noopener,noreferrer'
    );
  };

  const handleRegistration = async (data: {
    fullName: string;
    email: string;
  }) => {
    // Here you would typically handle the registration with your backend
    console.log('Registration submitted:', data);
  };

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Event Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link
              href="/events"
              className="text-sm text-muted-foreground hover:text-primary"
            >
              ← Kembali ke Daftar Acara
            </Link>
            <div className="flex-1" />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <Share2 className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {typeof navigator.share === 'function' && (
                  <DropdownMenuItem onClick={handleShare}>
                    Share via Device
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => handleSocialShare('twitter')}>
                  Share on Twitter
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSocialShare('facebook')}>
                  Share on Facebook
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSocialShare('linkedin')}>
                  Share on LinkedIn
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSocialShare('whatsapp')}>
                  Share on WhatsApp
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSocialShare('telegram')}>
                  Share on Telegram
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="outline" size="icon">
              <CalendarPlus className="h-4 w-4" />
            </Button>
          </div>
          <h1 className="text-4xl font-bold mb-4">{event.title}</h1>
          <div className="flex flex-wrap gap-6 text-muted-foreground">
            <div className="flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              <span>{event.date}</span>
            </div>
            <div className="flex items-center">
              <Clock className="h-5 w-5 mr-2" />
              <span>{event.time}</span>
            </div>
            <div className="flex items-center">
              <MapPin className="h-5 w-5 mr-2" />
              <span>{event.location}</span>
            </div>
          </div>
        </div>

        {/* Event Image */}
        <Card className="overflow-hidden mb-8">
          <div className="aspect-square w-full">
            <img
              src={event.image}
              alt={event.title}
              className="w-full h-full object-cover"
            />
          </div>
        </Card>

        {/* Event Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <Card className="p-6">
              <h2 className="text-2xl font-semibold mb-4">Tentang Acara</h2>
              <div className="prose prose-neutral dark:prose-invert max-w-none">
                <p className="text-muted-foreground">
                  {event.description ||
                    `Bergabunglah dalam ${event.title} untuk meningkatkan kemampuan pengembangan software Anda. Acara ini dirancang untuk berbagi pengetahuan dan pengalaman dalam dunia teknologi.`}
                </p>

                <h3 className="text-xl font-semibold mt-6 mb-3">
                  Apa yang akan Anda pelajari:
                </h3>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  {event.learningPoints?.map((point, index) => (
                    <li key={index}>{point}</li>
                  )) ||
                    [
                      'Fundamental dan konsep dasar',
                      'Best practices dan pattern',
                      'Tips dan trik dari praktisi',
                      'Studi kasus dan implementasi praktis',
                    ].map((point, index) => <li key={index}>{point}</li>)}
                </ul>

                <h3 className="text-xl font-semibold mt-6 mb-3">
                  Persyaratan:
                </h3>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  {event.requirements?.map((req, index) => (
                    <li key={index}>{req}</li>
                  )) ||
                    [
                      'Laptop dengan spesifikasi standar',
                      'Pengetahuan dasar pemrograman',
                      'Semangat belajar yang tinggi',
                    ].map((req, index) => <li key={index}>{req}</li>)}
                </ul>

                {event.coordinates && (
                  <>
                    <h3 className="text-xl font-semibold mt-6 mb-3">Lokasi:</h3>
                    <div className="aspect-video w-full rounded-lg overflow-hidden">
                      <iframe
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        loading="lazy"
                        allowFullScreen
                        referrerPolicy="no-referrer-when-downgrade"
                        src={`https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&q=${event.coordinates.lat},${event.coordinates.lng}&zoom=17`}
                      />
                    </div>
                  </>
                )}
              </div>
            </Card>
          </div>

          <div>
            <Card className="p-6 sticky top-24">
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-2">Status</h3>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                      event.status === 'upcoming'
                        ? 'bg-green-100  text-green-800 dark:bg-green-900 dark:text-green-100'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100'
                    }`}
                  >
                    {event.status === 'upcoming'
                      ? 'Pendaftaran Dibuka'
                      : 'Acara Selesai'}
                  </span>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Tipe Acara</h3>
                  <p className="text-muted-foreground">{event.type}</p>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Kapasitas</h3>
                  <div className="flex items-center text-muted-foreground">
                    <Users className="h-4 w-4 mr-2" />
                    <span>30 peserta</span>
                  </div>
                </div>

                {event.locationUrl && event.type !== 'Webinar' && (
                  <div>
                    <h3 className="font-semibold mb-2">Lokasi</h3>
                    <Button variant="outline" className="w-full" asChild>
                      <a
                        href={event.locationUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <MapPin className="h-4 w-4 mr-2" />
                        Buka di Google Maps
                      </a>
                    </Button>
                  </div>
                )}

                {event.status === 'upcoming' ? (
                  <RegistrationModal
                    eventTitle={event.title}
                    onSubmit={handleRegistration}
                  />
                ) : (
                  <Button variant="outline" className="w-full">
                    Lihat Dokumentasi
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </Button>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientEventPage;
