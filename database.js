// database.js
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

export async function openDb() {
  return open({
    filename: './database.db',
    driver: sqlite3.Database
  });
}

// Funktion zur Erstellung der Tabelle
export async function createTables() {
  const db = await openDb();
  await db.exec(`
    CREATE TABLE IF NOT EXISTS stores (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      store_name TEXT,
      api_key TEXT,
      password TEXT,
      rule_type TEXT,
      rule_value TEXT,
      average_spend_per_order REAL
    )
  `);
}
