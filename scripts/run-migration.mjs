// Quick migration runner — run with: node scripts/run-migration.mjs
import { readFileSync } from "fs";
import { Client } from "pg";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

const DB_URL = process.env.SUPABASE_DB_URL
  || "postgresql://postgres.amomlgahljhqvsyqoxvy:rDSDEBjB2dopUow7@aws-0-eu-west-1.pooler.supabase.com:5432/postgres";

async function main() {
  const sqlPath = join(__dirname, "..", "supabase", "migrations", "001_initial_schema.sql");
  const sql = readFileSync(sqlPath, "utf-8");

  console.log("Connecting to database...");
  const client = new Client({ connectionString: DB_URL, ssl: { rejectUnauthorized: false } });
  await client.connect();
  console.log("Connected.\n");

  // Drop and recreate the schema cleanly
  console.log("Dropping existing initra schema...");
  await client.query("DROP SCHEMA IF EXISTS initra CASCADE;");
  console.log("Schema dropped. Running migration...\n");

  try {
    await client.query(sql);
    console.log("✅ Migration applied successfully!");

    // Verify tables
    const res = await client.query(`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'initra'
      ORDER BY table_name;
    `);
    console.log(`\nCreated ${res.rows.length} tables in initra schema:`);
    for (const row of res.rows) {
      console.log(`  - ${row.table_name}`);
    }
  } catch (err) {
    console.error("❌ Migration error:", err.message);
    if (err.detail) console.error("   Detail:", err.detail);
    if (err.hint) console.error("   Hint:", err.hint);
    if (err.position) {
      const pos = parseInt(err.position);
      const before = sql.substring(Math.max(0, pos - 100), pos);
      const after = sql.substring(pos, pos + 100);
      console.error(`\n   Near: ...${before}>>>HERE>>>${after}...`);
    }
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
