'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, Search } from 'lucide-react';
import { Event } from '@/types/database';
import { db } from '@/lib/services/data-store';
import { useAuth } from '@/context/auth-context';
import { useRealtime } from '@/context/realtime-context';
import { EventCard } from '@/components/resident/EventCard';
import { FilterBar } from '@/components/common/FilterBar';
import { SearchInput } from '@/components/common/SearchInput';
import { EmptyState } from '@/components/common/EmptyState';

export default function ResidentEventsPage() {
  const { currentSociety } = useAuth();
  const { lastEvent } = useRealtime();

  const [events, setEvents] = useState<Event[]>([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('upcoming');

  useEffect(() => {
    if (!currentSociety) return;
    setEvents(db.getEvents(currentSociety.id));
  }, [currentSociety, lastEvent]);

  const filteredEvents = events.filter((e) => {
    const matchSearch = e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.description.toLowerCase().includes(search.toLowerCase()) ||
      e.venue.toLowerCase().includes(search.toLowerCase());

    let matchFilter = true;
    if (filter === 'upcoming') {
      matchFilter = e.status !== 'completed' && e.status !== 'archived';
    } else if (filter === 'registration_open') {
      matchFilter = e.status === 'registration_open';
    } else if (filter === 'completed') {
      matchFilter = e.status === 'completed' || e.status === 'archived';
    }

    return matchSearch && matchFilter;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-3xl glass-panel-highlight border border-white/10">
        <div>
          <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold text-xs uppercase tracking-wider">
            Explore Events
          </span>
          <h1 className="text-xl sm:text-2xl font-black text-white mt-1">
            Society Cultural Gatherings
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Discover community festivals, open mic evenings, and stage performances at {currentSociety?.name}.
          </p>
        </div>
      </div>

      {/* FILTER & SEARCH */}
      <div className="glass-panel p-4 rounded-2xl border border-white/5 space-y-3">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search by festival name, venue, or theme..."
          className="w-full sm:max-w-md"
        />

        <FilterBar
          options={[
            { label: 'Upcoming', value: 'upcoming', count: events.filter((e) => e.status !== 'completed').length },
            { label: 'Registration Open', value: 'registration_open', count: events.filter((e) => e.status === 'registration_open').length },
            { label: 'All Events', value: 'all', count: events.length },
            { label: 'Completed', value: 'completed', count: events.filter((e) => e.status === 'completed').length },
          ]}
          selectedValue={filter}
          onSelect={setFilter}
        />
      </div>

      {filteredEvents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((evt) => (
            <EventCard key={evt.id} event={evt} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No events found"
          description="Your society has no upcoming events matching the selected filter."
        />
      )}
    </div>
  );
}
