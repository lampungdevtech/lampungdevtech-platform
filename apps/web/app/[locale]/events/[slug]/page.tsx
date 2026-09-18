import { Metadata, ResolvingMetadata } from 'next';
import { notFound } from 'next/navigation';
import { getEventBySlugService } from '@/services/event.service';
import ClientEventPage from './client-page';

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

export async function generateMetadata(
  props: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { slug } = await props.params;
  const event = await getEventBySlugService(slug);

  if (!event) {
    return {
      title: 'Event Not Found',
      description: 'The requested event could not be found.',
    };
  }

  return {
    title: `${event.title} | LampungDevTech`,
    description:
      event.description ||
      `Bergabunglah dalam ${event.title} untuk meningkatkan kemampuan pengembangan software Anda.`,
    openGraph: {
      title: event.title,
      description:
        event.description ||
        `Bergabunglah dalam ${event.title} untuk meningkatkan kemampuan pengembangan software Anda.`,
      images: [
        {
          url: event.image,
          width: 1200,
          height: 630,
          alt: event.title,
        },
      ],
      type: 'website',
      locale: 'id_ID',
    },
    twitter: {
      card: 'summary_large_image',
      title: event.title,
      description:
        event.description ||
        `Bergabunglah dalam ${event.title} untuk meningkatkan kemampuan pengembangan software Anda.`,
      images: [event.image],
    },
  };
}

export default async function EventDetailPage({
  params,
}: Props) {
  const { slug } = await params;
  const event = await getEventBySlugService(slug);

  if (!event) {
    notFound();
  }

  return (
    <ClientEventPage
      event={{
        ...event,
        id: String(event.id || event._id),
        type: event.type || event.category || 'Meetup',
        status: event.status as 'upcoming' | 'past',
      }}
    />
  );
}
