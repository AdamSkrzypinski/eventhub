import { DatabaseConnection } from '../config/database.js';

export interface Reservation {
  id: number;
  user_id: number;
  event_id: number;
  created_at: string;
}

export interface UserReservationDetails {
  id: number;
  event_id: number;
  title: string;
  date: string;
  location: string;
  created_at: string;
}

export class ReservationRepository {
  private db = DatabaseConnection.getInstance();


  public createReservation(userId: number, eventId: number): Reservation {
    const makeReservationTx = this.db.transaction(() => {
      const eventStmt = this.db.prepare('SELECT id, max_seats FROM events WHERE id = ?');
      const event = eventStmt.get(eventId) as { id: number; max_seats: number } | undefined;

      if (!event) {
        throw new Error('EVENT_NOT_FOUND');
      }

      const existingStmt = this.db.prepare(
        'SELECT id FROM reservations WHERE user_id = ? AND event_id = ?'
      );
      const existing = existingStmt.get(userId, eventId);
      if (existing) {
        throw new Error('ALREADY_RESERVED');
      }

      const countStmt = this.db.prepare(
        'SELECT COUNT(*) as booked FROM reservations WHERE event_id = ?'
      );
      const { booked } = countStmt.get(eventId) as { booked: number };

      if (booked >= event.max_seats) {
        throw new Error('NO_SEATS_AVAILABLE');
      }

      const insertStmt = this.db.prepare(
        'INSERT INTO reservations (user_id, event_id) VALUES (?, ?)'
      );
      const result = insertStmt.run(userId, eventId);

      return {
        id: Number(result.lastInsertRowid),
        user_id: userId,
        event_id: eventId,
        created_at: new Date().toISOString(),
      };
    });

    return makeReservationTx();
  }


  public findByUser(userId: number): UserReservationDetails[] {
    const query = `
      SELECT 
        r.id,
        r.event_id,
        e.title,
        e.date,
        e.location,
        r.created_at
      FROM reservations r
      JOIN events e ON r.event_id = e.id
      WHERE r.user_id = ?
      ORDER BY r.created_at DESC
    `;
    return this.db.prepare(query).all(userId) as UserReservationDetails[];
  }


  public delete(id: number, userId: number, isAdmin: boolean): boolean {
    let stmt;
    let result;

    if (isAdmin) {
      stmt = this.db.prepare('DELETE FROM reservations WHERE id = ?');
      result = stmt.run(id);
    } else {
      stmt = this.db.prepare('DELETE FROM reservations WHERE id = ? AND user_id = ?');
      result = stmt.run(id, userId);
    }

    return result.changes > 0;
  }
}