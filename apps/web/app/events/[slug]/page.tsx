import { Metadata, ResolvingMetadata } from 'next';
import { notFound } from 'next/navigation';
import { events } from '@/constants/events';

type Props = {
  params: { slug: string };
};

export async function generateMetadata(
  props: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { params } = props;
  const event = events.find((e) => e.slug === params.slug);

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

// Split into client and server components
import ClientEventPage from './client-page';

export default async function EventDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const event = events.find((e) => e.slug === params.slug);

  if (!event) {
    notFound();
  }

  return (
    <ClientEventPage
      event={{ ...event, status: event.status as 'upcoming' | 'past' }}
    />
  );
}
