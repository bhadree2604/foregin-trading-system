import mysql from 'mysql2/promise';

let pool = null;

export function getPool() {
  if (pool) return pool;
  pool = mysql.createPool({
    host: process.env.MYSQL_HOST || 'localhost',
    port: Number(process.env.MYSQL_PORT || 3306),
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || 'anime@#26',
    database: process.env.MYSQL_DATABASE || 'foreign_trading_system',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    dateStrings: true,
  });
  return pool;
}

export async function query(sql, params = []) {
  const p = getPool();
  const [rows] = await p.query(sql, params);
  return rows;
}

export async function getConnection() {
  return getPool().getConnection();
}

export function rowToObject(row) {
  if (!row) return null;
  const out = { ...row };
  // Parse JSON columns back to objects
  for (const key of ['items', 'imageUrls', 'documents', 'metadata']) {
    if (typeof out[key] === 'string') {
      try {
        out[key] = JSON.parse(out[key]);
      } catch (_) {
        // keep raw string
      }
    }
  }
  return out;
}

export function toJson(value) {
  if (value === undefined || value === null) return null;
  if (typeof value === 'string') return value;
  return JSON.stringify(value);
}
