import React, { useEffect, useState } from 'react';
import { Calendar, MapPin, Trash2, Ticket } from 'lucide-react';
import { apiFetch, ApiError } from '../lib/api';
import { Alert } from '../components/ui/Alert';
import type { ReservationDTO } from '@eventhub/shared';

export const MyReservationsPage: React.FC = () => {
  const [reservations, setReservations] = useState<ReservationDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [cancelingId, setCancelingId] = useState<number | null>(null);

  const fetchReservations = async () => {
    try {
      const data = await apiFetch<ReservationDTO[]>('/reservations/my');
      setReservations(data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Nie udało się pobrać rezerwacji.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  const handleCancel = async (id: number) => {
    setFeedback(null);
    setError(null);
    setCancelingId(id);

    try {
      await apiFetch(`/reservations/${id}`, { method: 'DELETE' });
      setFeedback('Rezerwacja została anulowana.');
      setReservations((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Nie udało się anulować rezerwacji.');
    } finally {
      setCancelingId(null);
    }
  };

  if (loading) {
    return <div className="text-center text-slate-400 mt-16">Ładowanie Twoich rezerwacji...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-indigo-500/10 text-indigo-400 rounded-xl">
          <Ticket className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-100">Moje rezerwacje</h1>
          <p className="text-slate-400 text-sm">Zarządzaj swoimi biletami na nadchodzące wydarzenia.</p>
        </div>
      </div>

      {error && <Alert type="error" message={error} />}
      {feedback && <Alert type="success" message={feedback} />}

      {reservations.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400">
          Nie masz jeszcze żadnych aktywnych rezerwacji.
        </div>
      ) : (
        <div className="space-y-4">
          {reservations.map((res) => (
            <div
              key={res.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-2">
                <h2 className="text-xl font-semibold text-slate-100">{res.title}</h2>
                <div className="flex flex-wrap gap-4 text-sm text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-indigo-400" />
                    {new Date(res.date).toLocaleString('pl-PL')}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-indigo-400" />
                    {res.location}
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Data rezerwacji: {new Date(res.created_at).toLocaleString('pl-PL')}
                </p>
              </div>

              <button
                onClick={() => handleCancel(res.id)}
                disabled={cancelingId === res.id}
                className="px-4 py-2 rounded-xl bg-red-950/50 hover:bg-red-900/60 border border-red-800/60 text-red-400 text-sm font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" />
                {cancelingId === res.id ? 'Anulowanie...' : 'Anuluj rezerwację'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};