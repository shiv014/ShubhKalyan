import { neon } from '@neondatabase/serverless';

// Convert SQLite ? placeholders to PostgreSQL $1, $2, $3...
function toPgQuery(query) {
  let i = 0;
  return query.replace(/\?/g, () => `$${++i}`);
}

let _sql = null;
let _tablesReady = false;

function getSql() {
  if (!_sql) {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL environment variable is not set. Add it in Vercel dashboard.');
    }
    _sql = neon(process.env.DATABASE_URL);
  }
  return _sql;
}

async function ensureTables(sql) {
  if (_tablesReady) return;

  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS events (
      id SERIAL PRIMARY KEY,
      user_id INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      template_id TEXT NOT NULL DEFAULT 'tpl-1',
      slug TEXT UNIQUE,
      bride_name TEXT,
      groom_name TEXT,
      event_date TEXT,
      venue TEXT,
      status TEXT DEFAULT 'draft',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS photos (
      id SERIAL PRIMARY KEY,
      event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
      file_path TEXT NOT NULL,
      public_id TEXT,
      caption TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS rsvps (
      id SERIAL PRIMARY KEY,
      event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      email TEXT,
      attending INTEGER NOT NULL DEFAULT 1,
      guests_count INTEGER DEFAULT 1,
      message TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  _tablesReady = true;
}

/**
 * Returns a SQLite-compatible db object backed by Neon PostgreSQL.
 * Supports: db.get(), db.all(), db.run()
 */
export async function getDb() {
  const sql = getSql();
  await ensureTables(sql);

  return {
    // Returns first matching row or null
    async get(query, params = []) {
      const rows = await sql(toPgQuery(query), params);
      return rows[0] ?? null;
    },

    // Returns all matching rows
    async all(query, params = []) {
      return sql(toPgQuery(query), params);
    },

    // Executes a write query, returns { lastID } for INSERTs
    async run(query, params = []) {
      const pgQuery = toPgQuery(query);
      const trimmed = pgQuery.trim().toUpperCase();
      const isInsert = trimmed.startsWith('INSERT') && !trimmed.includes('RETURNING');
      const finalQuery = isInsert ? `${pgQuery} RETURNING id` : pgQuery;
      const rows = await sql(finalQuery, params);
      return { lastID: rows[0]?.id ?? null };
    }
  };
}
