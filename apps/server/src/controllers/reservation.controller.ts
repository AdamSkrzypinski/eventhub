import { Request, Response } from 'express';
import { z } from 'zod';
import { ReservationRepository } from '../repositories/ReservationRepository.js';

const reservationRepo = new ReservationRepository();

const createReservationSchema = z.object({
  eventId: z.number().int().positive('Wymagane poprawne ID wydarzenia'),
});

export class ReservationController {
  public static create(req: Request, res: Response): void {
    if (!req.user) {
      res.status(401).json({ error: 'Brak autoryzacji' });
      return;
    }

    const parseResult = createReservationSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        error: 'Niepoprawne dane wejściowe',
        details: parseResult.error.format(),
      });
      return;
    }

    const { eventId } = parseResult.data;

    try {
      const reservation = reservationRepo.createReservation(req.user.id, eventId);
      res.status(201).json({
        message: 'Miejsce zarezerwowane pomyślnie',
        reservation,
      });
    } catch (error: any) {
      if (error.message === 'EVENT_NOT_FOUND') {
        res.status(404).json({ error: 'Wydarzenie nie istnieje' });
        return;
      }
      if (error.message === 'ALREADY_RESERVED') {
        res.status(409).json({ error: 'Jesteś już zapisany na to wydarzenie' });
        return;
      }
      if (error.message === 'NO_SEATS_AVAILABLE') {
        res.status(409).json({ error: 'Brak wolnych miejsc na to wydarzenie (Overbooking prevention)' });
        return;
      }
      res.status(500).json({ error: 'Błąd serwera podczas dokonywania rezerwacji' });
    }
  }

  public static getMyReservations(req: Request, res: Response): void {
    if (!req.user) {
      res.status(401).json({ error: 'Brak autoryzacji' });
      return;
    }

    try {
      const reservations = reservationRepo.findByUser(req.user.id);
      res.status(200).json(reservations);
    } catch {
      res.status(500).json({ error: 'Błąd podczas pobierania rezerwacji' });
    }
  }

  public static cancel(req: Request, res: Response): void {
    if (!req.user) {
      res.status(401).json({ error: 'Brak autoryzacji' });
      return;
    }

    const reservationId = Number(req.params.id);
    const isAdmin = req.user.role === 'ADMIN';

    try {
      const deleted = reservationRepo.delete(reservationId, req.user.id, isAdmin);
      if (!deleted) {
        res.status(404).json({ error: 'Rezerwacja nie istnieje lub brak uprawnień do jej usunięcia' });
        return;
      }
      res.status(204).send();
    } catch {
      res.status(500).json({ error: 'Błąd podczas anulowania rezerwacji' });
    }
  }
}