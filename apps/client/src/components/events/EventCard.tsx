import React from 'react';
import { Calendar, MapPin, Users, Ticket } from 'lucide-react';
import type { EventDTO } from '@eventhub/shared';

interface EventCardProps {
  event: EventDTO;
  isAuthenticated: boolean;
  isBooking: boolean;
  onBook: (eventId: number) => void;
}

export const EventCard: React.FC<EventCardProps> = ({
  event,
  isAuthenticated,
  isBooking,
  onBook,
}) => {
  const isSoldOut = event.available_seats <= 0;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between hover:border-slate-700 transition-colors">
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

      {isAuthenticated ? (
        <button
          onClick={() => onBook(event.id)}
          disabled={isSoldOut || isBooking}
          className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:cursor-not-allowed"
        >
          <Ticket className="w-4 h-4" />
          {isBooking
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
};