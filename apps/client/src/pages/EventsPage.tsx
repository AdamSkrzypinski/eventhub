import React, { useEffect, useState } from 'react';
import { Calendar, MapPin, Users, Ticket, AlertCircle, CheckCircle2 } from 'lucide-react';
import { apiFetch, ApiError } from '../lib/api';
import { useAuth } from '../context/AuthContext';
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
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-100">Nadchodzące wydarzenia</h1>
        <p className="text-slate-400 mt-1">Przeglądaj dostępne spotkania i rezerwuj miejsca online.</p>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-950/60 border border-red-800 text-red-300 flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      )}

      {feedback && (
        <div
          className={`mb-6 p-4 rounded-xl border flex items-center gap-2 ${
            feedback.type === 'success'
              ? 'bg-emerald-950/60 border-emerald-800 text-emerald-300'
              : 'bg-red-950/60 border-red-800 text-red-300'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 shrink-0" />
          )}
          <span>{feedback.text}</span>
        </div>
      )}

      {events.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400">
          Brak zaplanowanych wydarzeń w bazie danych.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => {
            const isSoldOut = event.available_seats <= 0;

            return (
              <div
                key={event.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between hover:border-slate-700 transition-colors"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <h2 className="text-xl font-semibold text-slate-100">{event.title}</h2>
                    <span
                      className={`text-xs font-medium px-2.5 py-1 rounded-full shrink-0 ${
                        isSoldOut
                          ? 'bg-red-950 text-red-400 border border-red-800'
                          : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                      }`}
                    >
                      {isSoldOut ? 'Brak miejsc' : `Wolne: ${event.available_seats}/${event.max_seats}`}
                    </span>
                  </div>

                  {event.description && (
                    <p className="text-slate-400 text-sm mb-5 line-clamp-3">{event.description}</p>
                  )}

                  <div className="space-y-2 text-sm text-slate-300 mb-6">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-indigo-400" />
                      <span>{new Date(event.date).toLocaleString('pl-PL')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-indigo-400" />
                      <span>{event.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-indigo-400" />
                      <span>Limit miejsc: {event.max_seats}</span>
                    </div>
                  </div>
                </div>

                {user ? (
                  <button
                    onClick={() => handleBook(event.id)}
                    disabled={isSoldOut || bookingId === event.id}
                    className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:cursor-not-allowed"
                  >
                    <Ticket className="w-4 h-4" />
                    {bookingId === event.id
                      ? 'Rezerwowanie...'
                      : isSoldOut
                      ? 'Wyprzedane'
                      : 'Zarezerwuj miejsce'}
                  </button>
                ) : (
                  <div className="text-center text-xs text-slate-400 py-2.5 bg-slate-950 rounded-xl border border-slate-800">
                    Zaloguj się, aby zarezerwować bilet
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};