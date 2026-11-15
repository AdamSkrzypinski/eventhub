import React, { useEffect, useState } from 'react';
import { apiFetch, ApiError } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { Alert } from '../components/ui/Alert';
import { EventCard } from '../components/events/EventCard';
import type { EventDTO } from '@eventhub/shared';

export const EventsPage: React.FC = () => {
  const [events, setEvents] = useState<EventDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [bookingId, setBookingId] = useState<number | null>(null);

  const { user } = useAuth();

  const fetchEvents = async () => {
    try {
      const data = await apiFetch<EventDTO[]>('/events');
      setEvents(data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Nie udało się pobrać wydarzeń.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleBook = async (eventId: number) => {
    setFeedback(null);
    setBookingId(eventId);

    try {
      await apiFetch('/reservations', {
        method: 'POST',
        body: JSON.stringify({ eventId }),
      });

      setFeedback({ type: 'success', text: 'Miejsce zostało pomyślnie zarezerwowane!' });
      await fetchEvents();
    } catch (err) {
      setFeedback({
        type: 'error',
        text: err instanceof ApiError ? err.message : 'Nie udało się dokonać rezerwacji.',
      });
    } finally {
      setBookingId(null);
    }
  };

  if (loading) {
    return <div className="text-center text-slate-400 mt-16">Ładowanie wydarzeń...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-100">Nadchodzące wydarzenia</h1>
        <p className="text-slate-400 mt-1">Przeglądaj dostępne spotkania i rezerwuj miejsca online.</p>
      </div>

      {error && <Alert type="error" message={error} />}
      {feedback && <Alert type={feedback.type} message={feedback.text} />}

      {events.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400">
          Brak zaplanowanych wydarzeń w bazie danych.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              isAuthenticated={Boolean(user)}
              isBooking={bookingId === event.id}
              onBook={handleBook}
            />
          ))}
        </div>
      )}
    </div>
  );
};