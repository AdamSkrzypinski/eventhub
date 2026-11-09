import { DatabaseConnection } from '../config/database.js';

export interface User {
  id: number;
  email: string;
  password_hash: string;
  role: 'USER' | 'ADMIN';
}

export interface CreateUserData {
  email: string;
  password_hash: string;
  role?: 'USER' | 'ADMIN';
}

export class UserRepository {
  private db = DatabaseConnection.getInstance();

  public findByEmail(email: string): User | undefined {
    const stmt = this.db.prepare('SELECT * FROM users WHERE email = ?');
    return stmt.get(email) as User | undefined;
  }

  public findById(id: number): User | undefined {
    const stmt = this.db.prepare('SELECT * FROM users WHERE id = ?');
    return stmt.get(id) as User | undefined;
  }

  public create(data: CreateUserData): User {
    const role = data.role || 'USER';
    const stmt = this.db.prepare(
      'INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?)'
    );
    const result = stmt.run(data.email, data.password_hash, role);

    return {
      id: Number(result.lastInsertRowid),
      email: data.email,
      password_hash: data.password_hash,
      role,
    };
  }
}