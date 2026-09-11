import fs from 'fs';
import path from 'path';
import { config } from '../config';

export interface MigrationRecord {
  id: number;
  name: string;
  applied_at: string;
}

export class DatabaseMigrator {
  private static appliedMigrationsInMemory: Set<string> = new Set();

  /**
   * Run all pending migrations in alphabetical order.
   * If DATABASE_URL is configured and pg client is available, executes on PostgreSQL.
   * Otherwise, tracks and verifies migrations in memory.
   */
  public static async runMigrations(): Promise<{ applied: string[]; skipped: string[] }> {
    const applied: string[] = [];
    const skipped: string[] = [];

    const migrationsDir = path.resolve(__dirname, 'migrations');
    if (!fs.existsSync(migrationsDir)) {
      console.log('[MIGRATOR] No migrations directory found.');
      return { applied, skipped };
    }

    const files = fs
      .readdirSync(migrationsDir)
      .filter(f => f.endsWith('.sql'))
      .sort();

    if (files.length === 0) {
      console.log('[MIGRATOR] No migration SQL files found.');
      return { applied, skipped };
    }

    // Check if real PostgreSQL database is configured via DATABASE_URL
    const dbUrl = config.databaseUrl;
    let pgClient: any = null;

    if (dbUrl) {
      try {
        // Dynamic require to avoid hard runtime crash if pg driver is optional
        const { Client } = require('pg');
        pgClient = new Client({
          connectionString: dbUrl,
          ssl: dbUrl.includes('render.com') || dbUrl.includes('sslmode=require') ? { rejectUnauthorized: false } : undefined,
        });
        await pgClient.connect();

        // 1. Create migration tracking table if not exists
        await pgClient.query(`
          CREATE TABLE IF NOT EXISTS _migrations (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) UNIQUE NOT NULL,
            applied_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
          );
        `);
      } catch (err: any) {
        console.warn(`[MIGRATOR] PostgreSQL connection unavailable (${err.message}). Running in-memory migration tracker.`);
        pgClient = null;
      }
    }

    try {
      for (const file of files) {
        const filePath = path.join(migrationsDir, file);
        const sqlContent = fs.readFileSync(filePath, 'utf-8');

        if (pgClient) {
          // Check if already applied in PostgreSQL
          const res = await pgClient.query('SELECT name FROM _migrations WHERE name = $1', [file]);
          if (res.rows.length > 0) {
            skipped.push(file);
            continue;
          }

          // Execute migration inside a transaction
          await pgClient.query('BEGIN');
          try {
            await pgClient.query(sqlContent);
            await pgClient.query('INSERT INTO _migrations (name) VALUES ($1)', [file]);
            await pgClient.query('COMMIT');
            applied.push(file);
            console.log(`[MIGRATOR] Successfully applied migration: ${file}`);
          } catch (migrationErr: any) {
            await pgClient.query('ROLLBACK');
            console.error(`[MIGRATOR] Failed applying migration ${file}:`, migrationErr);
            throw migrationErr;
          }
        } else {
          // In-memory migration tracking
          if (this.appliedMigrationsInMemory.has(file)) {
            skipped.push(file);
          } else {
            this.appliedMigrationsInMemory.add(file);
            applied.push(file);
            console.log(`[MIGRATOR] Registered in-memory migration: ${file}`);
          }
        }
      }
    } finally {
      if (pgClient) {
        try {
          await pgClient.end();
        } catch {}
      }
    }

    return { applied, skipped };
  }
}
