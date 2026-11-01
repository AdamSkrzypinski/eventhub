import Database from 'better-sqlite3';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class DatabaseConnection {
  private static instance: Database.Database | null = null;

  private constructor() {}

  public static getInstance(): Database.Database {
    if (!DatabaseConnection.instance) {
      const dbPath = process.env.DB_PATH || './database.sqlite';
      DatabaseConnection.instance = new Database(dbPath);

      DatabaseConnection.instance.pragma('foreign_keys = ON');
      DatabaseConnection.instance.pragma('journal_mode = WAL');

      DatabaseConnection.runMigrations(DatabaseConnection.instance);
      console.log('[SQLite] Polaczenie zainicjalizowane (Singleton)');
    }
    return DatabaseConnection.instance;
  }

  private static runMigrations(db: Database.Database): void {
    const schemaPath = path.resolve(__dirname, '../database/schema.sql');
    if (fs.existsSync(schemaPath)) {
      const schemaSql = fs.readFileSync(schemaPath, 'utf-8');
      db.exec(schemaSql);
      console.log('[SQLite] Migracje tabel wykonane pomyslnie');
    }
  }
}