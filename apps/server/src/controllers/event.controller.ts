import { Request, Response } from 'express';
import { z } from 'zod';
import { EventRepository } from '../repositories/EventRepository.js';

const eventRepo = new EventRepository();

const createEventSchema = z.object({
  title: z.string().min(3, 'Tytuł musi mieć co najmniej 3 znaki'),
  description: z.string().optional(),
  date: z.string().min(1, 'Data jest wymagana'),
  location: z.string().min(2, 'Lokalizacja jest wymagana'),
  max_seats: z.number().int().positive('Liczba miejsc musi być większa od zera'),
});

const updateEventSchema = createEventSchema.partial();

export class EventController {
  public static getAll(_req: Request, res: Response): void {
    try {
      const events = eventRepo.findAll();
      res.status(200).json(events);
    } catch {
      res.status(500).json({ error: 'Nie udało się pobrać listy wydarzeń' });
    }
  }

  public static getById(req: Request, res: Response): void {
    try {
      const id = Number(req.params.id);
      const event = eventRepo.findById(id);

      if (!event) {
        res.status(404).json({ error: 'Wydarzenie o podanym ID nie istnieje' });
        return;
      }

      res.status(200).json(event);
    } catch {
      res.status(500).json({ error: 'Błąd podczas pobierania wydarzenia' });
    }
  }

  public static create(req: Request, res: Response): void {
    const parseResult = createEventSchema.safeParse(req.body);

    if (!parseResult.success) {
      res.status(400).json({
        error: 'Niepoprawne dane wejściowe',
        details: parseResult.error.format(),
      });
      return;
    }

    try {
      const newEvent = eventRepo.create(parseResult.data);
      res.status(201).json(newEvent);
    } catch {
      res.status(500).json({ error: 'Błąd podczas tworzenia wydarzenia' });
    }
  }

  public static update(req: Request, res: Response): void {
    const id = Number(req.params.id);
    const parseResult = updateEventSchema.safeParse(req.body);

    if (!parseResult.success) {
      res.status(400).json({
        error: 'Niepoprawne dane wejściowe',
        details: parseResult.error.format(),
      });
      return;
    }

    try {
      const updated = eventRepo.update(id, parseResult.data);
      if (!updated) {
        res.status(404).json({ error: 'Wydarzenie nie istnieje lub brak zmian' });
        return;
      }
      res.status(200).json({ message: 'Zaktualizowano wydarzenie pomyślnie' });
    } catch {
      res.status(500).json({ error: 'Błąd podczas aktualizacji wydarzenia' });
    }
  }

  public static delete(req: Request, res: Response): void {
    try {
      const id = Number(req.params.id);
      const deleted = eventRepo.delete(id);

      if (!deleted) {
        res.status(404).json({ error: 'Wydarzenie o podanym ID nie istnieje' });
        return;
      }

      res.status(204).send();
    } catch {
      res.status(500).json({ error: 'Błąd podczas usuwania wydarzenia' });
    }
  }
}