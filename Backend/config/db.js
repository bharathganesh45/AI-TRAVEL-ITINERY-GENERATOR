import pg from 'pg';

const { Pool } = pg;

let pool = null;

export async function initDb() {
  try {
    
    const poolConfig = {
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 5432,
      database: process.env.DB_NAME?.trim(),
    };

    pool = new Pool(poolConfig);

    const client = await pool.connect();
    client.release();

    await createSchema();
  } catch (error) {
    console.error(' Failed to initialize database:', error);
    throw error;
  }
}

async function createSchema() {
  const queries = [
    `CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      profile_image TEXT,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )`,

    `CREATE TABLE IF NOT EXISTS trips (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      destination TEXT,
      trip_type TEXT DEFAULT 'Leisure',
      start_date TEXT,
      end_date TEXT,
      duration_days INTEGER DEFAULT 6,
      travelers_count INTEGER DEFAULT 2,
      status TEXT DEFAULT 'Draft',
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW(),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`,

    `CREATE TABLE IF NOT EXISTS documents (
      id TEXT PRIMARY KEY,
      trip_id TEXT NOT NULL,
      file_name TEXT NOT NULL,
      file_path TEXT NOT NULL,
      file_size INTEGER,
      mime_type TEXT,
      document_type TEXT DEFAULT 'Other',
      processing_status TEXT DEFAULT 'Pending',
      extracted_text TEXT,
      created_at TIMESTAMP DEFAULT NOW(),
      FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE
    )`,

    `CREATE TABLE IF NOT EXISTS booking_information (
      id TEXT PRIMARY KEY,
      document_id TEXT UNIQUE NOT NULL,
      booking_type TEXT,
      airline TEXT,
      flight_number TEXT,
      train_number TEXT,
      bus_operator TEXT,
      hotel_name TEXT,
      departure_city TEXT,
      arrival_city TEXT,
      departure_time TEXT,
      arrival_time TEXT,
      check_in TEXT,
      check_out TEXT,
      booking_reference TEXT,
      passenger_name TEXT,
      raw_text TEXT,
      confidence_score NUMERIC DEFAULT 0.95,
      created_at TIMESTAMP DEFAULT NOW(),
      FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE
    )`,

    `CREATE TABLE IF NOT EXISTS itineraries (
      id TEXT PRIMARY KEY,
      trip_id TEXT UNIQUE NOT NULL,
      user_id TEXT,
      summary TEXT,
      ai_response TEXT,
      itinerary_json TEXT,
      created_at TIMESTAMP DEFAULT NOW(),
      FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`,

    `CREATE TABLE IF NOT EXISTS share_links (
      id TEXT PRIMARY KEY,
      trip_id TEXT NOT NULL,
      share_token TEXT UNIQUE NOT NULL,
      expires_at TIMESTAMP,
      is_active BOOLEAN DEFAULT TRUE,
      views_count INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT NOW(),
      FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE
    )`,

    `CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`,
    `CREATE INDEX IF NOT EXISTS idx_trips_user ON trips(user_id)`,
    `CREATE INDEX IF NOT EXISTS idx_documents_trip ON documents(trip_id)`,
    `CREATE INDEX IF NOT EXISTS idx_booking_doc ON booking_information(document_id)`,
    `CREATE INDEX IF NOT EXISTS idx_itineraries_trip ON itineraries(trip_id)`,
    `CREATE INDEX IF NOT EXISTS idx_share_token ON share_links(share_token)`,
  ];

  try {
    for (const query of queries) {
      await pool.query(query);
    }
    
  } catch (error) {
    console.error(' Schema creation error:', error.message);
    throw error;
  }
}

function convertPlaceholders(sql, params) {
  let paramIndex = 1;
  const convertedSql = sql.replace(/\?/g, () => `$${paramIndex++}`);
  return { sql: convertedSql, params };
}

function sanitizeParams(params) {
  if (!Array.isArray(params)) return [];
  return params.map((p) => (p === undefined ? null : p));
}

export async function dbRun(sql, params = []) {
  if (!pool) throw new Error('Database not initialized');
  try {
    const safeParams = sanitizeParams(params);
    const { sql: convertedSql } = convertPlaceholders(sql, safeParams);
    const result = await pool.query(convertedSql, safeParams);
    return { changes: result.rowCount };
  } catch (error) {
    console.error(' Database error in dbRun:', sql, error);
    throw error;
  }
}

export async function dbGet(sql, params = []) {
  if (!pool) throw new Error('Database not initialized');
  try {
    const safeParams = sanitizeParams(params);
    const { sql: convertedSql } = convertPlaceholders(sql, safeParams);
    const result = await pool.query(convertedSql, safeParams);
    return result.rows[0] || undefined;
  } catch (error) {
    console.error(' Database error in dbGet:', sql, error);
    throw error;
  }
}

export async function dbAll(sql, params = []) {
  if (!pool) throw new Error('Database not initialized');
  try {
    const safeParams = sanitizeParams(params);
    const { sql: convertedSql } = convertPlaceholders(sql, safeParams);
    const result = await pool.query(convertedSql, safeParams);
    return result.rows;
  } catch (error) {
    console.error(' Database error in dbAll:', sql, error);
    throw error;
  }
}

export function saveDb() {
  // No-op for PostgreSQL - data is persisted automatically
}

export async function withWriteLock(fn) {
  // PostgreSQL handles locking internally - just execute the function
  return fn();
}

export default { initDb, dbRun, dbGet, dbAll, saveDb, withWriteLock };
