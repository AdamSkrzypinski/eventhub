import React, { useEffect, useState } from 'react';
import { PlusCircle, Trash2, ShieldCheck, Calendar, MapPin, Users } from 'lucide-react';
import { apiFetch, ApiError } from '../lib/api';
import { Alert } from '../components/ui/Alert';
import { FormInput } from '../components/ui/FormInput';
import type { EventDTO } from '@eventhub/shared';

export const AdminPage: React.FC = () => {
  const [events, setEvents] = useState<EventDTO[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const [maxSeats, setMaxSeats] = useState(20);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const fetchEvents = async () => {
    try {
      const data = await apiFetch<EventDTO[]>('/events');
      setEvents(data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Błąd pobierania listy wydarzeń.');
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFeedback(null);
    setLoading(true);

    try {
      await apiFetch('/events', {
        method: 'POST',
        body: JSON.stringify({
          title,
          description: description.trim() || undefined,
          date: new Date(date).toISOString(),
          location,
          max_seats: Number(maxSeats),
        }),
      });

      setFeedback('Nowe wydarzenie zostało utworzone.');
      setTitle('');
      setDescription('');
      setDate('');
      setLocation('');
      setMaxSeats(20);
      await fetchEvents();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Nie udało się utworzyć wydarzenia.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    setError(null);
    setFeedback(null);

    try {
      await apiFetch(`/events/${id}`, { method: 'DELETE' });
      setFeedback('Wydarzenie zostało usunięte.');
      setEvents((prev) => prev.filter((ev) => ev.id !== id));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Nie udało się usunąć wydarzenia.');
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 space-y-8">
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-xl">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-100">Panel Administratora</h1>
          <p className="text-slate-400 text-sm">Twórz nowe wydarzenia oraz zarządzaj istniejącą ofertą.</p>
        </div>
      </div>

      {error && <Alert type="error" message={error} />}
      {feedback && <Alert type="success" message={feedback} />}

      <form
        onSubmit={handleCreate}
        className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4"
      >
        <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
          <PlusCircle className="w-5 h-5 text-indigo-400" />
          Dodaj nowe wydarzenie
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput
            label="Tytuł wydarzenia *"
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="np. Warsztaty TypeScript & Node.js"
          />

          <FormInput
            label="Lokalizacja *"
            type="text"
            required
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="np. Warszawa / Sala A12"
          />

          <FormInput
            label="Data i godzina *"
            type="datetime-local"
            required
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />

          <FormInput
            label="Liczba miejsc *"
            type="number"
            required
            min={1}
            value={maxSeats}
            onChange={(e) => setMaxSeats(Number(e.target.value))}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">
            Opis wydarzenia
          </label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Krótki opis programu wydarzenia..."
            className="w-full px-4 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium transition-colors cursor-pointer"
        >
          {loading ? 'Zapisywanie...' : 'Opublikuj wydarzenie'}
        </button>
      </form>

      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-100">
          Istniejące wydarzenia ({events.length})
        </h2>
        {events.map((ev) => (
          <div
            key={ev.id}
            className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div>
              <h3 className="font-semibold text-slate-100">{ev.title}</h3>
              <div className="flex flex-wrap gap-4 text-xs text-slate-400 mt-1">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                  {new Date(ev.date).toLocaleString('pl-PL')}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                  {ev.location}
                </span>
                <span className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-indigo-400" />
                  Zajęte: {ev.booked_seats} / {ev.max_seats}
                </span>
              </div>
            </div>

            <button
              onClick={() => handleDelete(ev.id)}
              className="px-3.5 py-2 rounded-lg bg-red-950/50 hover:bg-red-900/60 border border-red-800/60 text-red-400 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-center"
            >
              <Trash2 className="w-4 h-4" />
              Usuń
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};