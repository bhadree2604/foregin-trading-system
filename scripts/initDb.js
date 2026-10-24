/**
 * Initialize MySQL database for Foreign Trading System.
 * Usage: node scripts/initDb.js
 * Reads connection from MYSQL_* env vars (defaults: localhost/root/anime@#26).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import mysql from 'mysql2/promise';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const config = {
  host: process.env.MYSQL_HOST || 'localhost',
  port: Number(process.env.MYSQL_PORT || 3306),
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || 'anime@#26',
  multipleStatements: true,
};

async function main() {
  const schemaPath = path.join(__dirname, 'schema.sql');
  const sql = fs.readFileSync(schemaPath, 'utf8');
  console.log(`Connecting to MySQL ${config.host}:${config.port} as ${config.user} ...`);
  const conn = await mysql.createConnection(config);
  try {
    await conn.query(sql);
    console.log('Database `foreign_trading_system` initialized successfully.');
  } finally {
    await conn.end();
  }
}

main().catch((err) => {
  console.error('DB init failed:', err.message);
  process.exit(1);
});
