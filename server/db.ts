import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import { schema } from '../shared/schema';

const sqlite = new Database('./disisolves.db');
export const db = drizzle(sqlite, { schema });
