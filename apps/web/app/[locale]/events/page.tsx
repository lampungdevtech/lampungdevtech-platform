'use client';

import { useState, useEffect } from 'react';
import { Link } from '@/i18n/routing';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Search, Calendar, MapPin, Clock, FileSearch, Users } from 'lucide-react';
import { events as defaultEvents } from '@/constants/events';
import { useTranslations } from 'next-intl';

export default function EventsPage() {
  const t = useTranslations('events');
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all'); // all, upcoming, past
  const [eventsList, setEventsList] = useState(defaultEvents);

  useEffect(() => {
    let isMounted = true;
    async function fetchEvents() {
      try {
        const queryParams = new URLSearchParams();
        if (filter !== 'all') queryParams.set('status', filter);
        if (searchQuery.trim()) queryParams.set('search', searchQuery.trim());

        const res = await fetch(`/api/events?${queryParams.toString()}`);
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.events) {
            setEventsList(data.events);
          }
        }
      } catch (err) {
        console.warn('Could not fetch events from API, using fallback:', err);
      }
    }

    fetchEvents();
    return () => {
      isMounted = false;
    };
  }, [filter, searchQuery]);

  const filteredEvents = eventsList.filter((event) => {
    const matchesSearch =
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filter === 'all' || event.status === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">{t('title')}</h1>
          <p className="text-muted-foreground">
            {t('subtitle')}
          </p>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="text"
              placeholder={t('searchPlaceholder')}
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              onClick={() => setFilter('all')}
            >
              {t('filterAll')}
            </Button>
            <Button
              variant={filter === 'upcoming' ? 'default' : 'outline'}
              onClick={() => setFilter('upcoming')}
            >
              {t('filterUpcoming')}
            </Button>
            <Button
              variant={filter === 'past' ? 'default' : 'outline'}
              onClick={() => setFilter('past')}
            >
              {t('filterPast')}
            </Button>
          </div>
        </div>

        {/* Events Grid or Empty State */}
        {filteredEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => (
              <Link href={`/events/${event.slug}`} key={event.id || (event as any)._id}>
                <Card className="overflow-hidden h-full hover:shadow-lg transition-shadow flex flex-col justify-between">
                  <div>
                    <div className="h-48 relative">
                      <img
                        src={event.image}
                        alt={event.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-4 right-4">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            event.status === 'upcoming'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100'
                          }`}
                        >
                          {event.status === 'upcoming'
                            ? t('statusUpcoming')
                            : t('statusPast')}
                        </span>
                      </div>
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-semibold mb-2 line-clamp-2">
                        {event.title}
                      </h3>
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center text-muted-foreground text-sm">
                          <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
                          <span>{event.date}</span>
                        </div>
                        <div className="flex items-center text-muted-foreground text-sm">
                          <Clock className="h-4 w-4 mr-2 flex-shrink-0" />
                          <span>{event.time}</span>
                        </div>
                        <div className="flex items-center text-muted-foreground text-sm">
                          <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                          <span className="truncate">{event.location}</span>
                        </div>
                        {(event as any).maxCapacity && (
                          <div className="flex items-center text-muted-foreground text-sm">
                            <Users className="h-4 w-4 mr-2 flex-shrink-0" />
                            <span>
                              {(event as any).maxCapacity - ((event as any).registeredCount || 0)} tiket tersisa
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="p-6 pt-0">
                    <Button
                      className="w-full"
                      variant={
                        event.status === 'upcoming' ? 'default' : 'outline'
                      }
                    >
                      {event.status === 'upcoming'
                        ? t('registerNow')
                        : t('viewDetails')}
                    </Button>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <FileSearch className="h-24 w-24 text-muted-foreground" />
                <Search className="h-12 w-12 absolute bottom-0 right-0 text-primary" />
              </div>
            </div>
            <h3 className="text-2xl font-semibold mb-2">
              {t('notFoundTitle')}
            </h3>
            <p className="text-muted-foreground mb-8">
              {t('notFoundDesc')}
              {searchQuery && ` Coba cari dengan kata kunci yang berbeda.`}
            </p>
            {searchQuery && (
              <Button onClick={() => setSearchQuery('')}>
                {t('resetSearch')}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
