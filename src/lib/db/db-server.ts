import 'server-only';
import { Client } from 'pg';

/**
 * PG Migration Runner: Executes SQL against a sovereign database.
 * This file is marked 'server-only' to prevent pg from leaking into the browser bundle.
 */
export async function applyInitialSchema(dbId: string, sql: string, password: string) {
  const client = new Client({
    host: `db.${dbId}.supabase.co`,
    port: 5432,
    user: 'postgres',
    password: password,
    database: 'postgres',
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    await client.query(sql);
    console.log(`[PG] Schema applied successfully to ${dbId}`);
  } catch (err: any) {
    console.error(`[PG] Schema application failed for ${dbId}:`, err);
    throw err;
  } finally {
    await client.end();
  }
}
