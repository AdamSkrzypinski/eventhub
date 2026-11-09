import { DatabaseConnection } from '../config/database.js';

export interface Event {
  id: number;
  title: string;
  description: string | null;
  date: string;
  location: string;
  max_seats: number;
}

export interface EventWithStats extends Event {
  booked_seats: number;
  available_seats: number;
}

export interface CreateEventData {
  title: string;
  description?: string;
  date: string;
  location: string;
  max_seats: number;
}

export class EventRepository {
  private db = DatabaseConnection.getInstance();

  public findAll(): EventWithStats[] {
    const query = `
      SELECT 
        e.*,
        COUNT(r.id) AS booked_seats,
        (e.max_seats - COUNT(r.id)) AS available_seats
      FROM events e
      LEFT JOIN reservations r ON e.id = r.event_id
      GROUP BY e.id
      ORDER BY e.date ASC
    `;
    return this.db.prepare(query).all() as EventWithStats[];
  }

  public findById(id: number): EventWithStats | undefined {
    const query = `
      SELECT 
        e.*,
        COUNT(r.id) AS booked_seats,
        (e.max_seats - COUNT(r.id)) AS available_seats
      FROM events e
      LEFT JOIN reservations r ON e.id = r.event_id
      WHERE e.id = ?
      GROUP BY e.id
    `;
    return this.db.prepare(query).get(id) as EventWithStats | undefined;
  }

  public create(data: CreateEventData): Event {
    const stmt = this.db.prepare(
      'INSERT INTO events (title, description, date, location, max_seats) VALUES (?, ?, ?, ?, ?)'
    );
    const result = stmt.run(
      data.title,
      data.description || null,
      data.date,
      data.location,
      data.max_seats
    );

    return {
      id: Number(result.lastInsertRowid),
      title: data.title,
      description: data.description || null,
      date: data.date,
      location: data.location,
      max_seats: data.max_seats,
    };
  }

  public update(id: number, data: Partial<CreateEventData>): boolean {
    const fields: string[] = [];
    const values: any[] = [];

    if (data.title !== undefined) { fields.push('title = ?'); values.push(data.title); }
    if (data.description !== undefined) { fields.push('description = ?'); values.push(data.description); }
    if (data.date !== undefined) { fields.push('date = ?'); values.push(data.date); }
    if (data.location !== undefined) { fields.push('location = ?'); values.push(data.location); }
    if (data.max_seats !== undefined) { fields.push('max_seats = ?'); values.push(data.max_seats); }

    if (fields.length === 0) return false;

    values.push(id);
    const query = `UPDATE events SET ${fields.join(', ')} WHERE id = ?`;
    const result = this.db.prepare(query).run(...values);

    return result.changes > 0;
  }

  public delete(id: number): boolean {
    const stmt = this.db.prepare('DELETE FROM events WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }
}