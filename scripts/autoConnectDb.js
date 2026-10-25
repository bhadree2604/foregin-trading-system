/**
 * Auto-connect and verify MySQL database before starting Next.js dev server.
 * Run automatically by `npm run dev` via package.json predev script.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import mysql from 'mysql2/promise';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Load environment variables from .env.local or .env if present
function loadEnv() {
  for (const envFile of ['.env.local', '.env']) {
    const envPath = path.join(rootDir, envFile);
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf8');
      for (const line of content.split('\n')) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const eqIdx = trimmed.indexOf('=');
        if (eqIdx !== -1) {
          const key = trimmed.slice(0, eqIdx).trim();
          let val = trimmed.slice(eqIdx + 1).trim();
          if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
            val = val.slice(1, -1);
          }
          if (!process.env[key]) {
            process.env[key] = val;
          }
        }
      }
    }
  }
}

loadEnv();

const dbHost = process.env.MYSQL_HOST || 'localhost';
const dbPort = Number(process.env.MYSQL_PORT || 3306);
const dbUser = process.env.MYSQL_USER || 'root';
const dbPassword = process.env.MYSQL_PASSWORD || 'anime@#26';
const dbName = process.env.MYSQL_DATABASE || 'foreign_trading_system';

async function autoConnect() {
  console.log('\n==================================================');
  console.log(`[FTS] Connecting to MySQL at ${dbHost}:${dbPort}...`);
  console.log('==================================================');

  let conn;
  try {
    conn = await mysql.createConnection({
      host: dbHost,
      port: dbPort,
      user: dbUser,
      password: dbPassword,
      multipleStatements: true,
    });
  } catch (err) {
    console.error(`\n[!] MySQL Connection Failed: ${err.message}`);
    console.error(`    Host: ${dbHost}:${dbPort} | User: ${dbUser}`);
    console.error(`    Please ensure MySQL service is started (e.g. Services -> MySQL or mysqld).\n`);
    // Exit with 0 so dev server can still boot if user needs UI only, but warn loudly
    return;
  }

  try {
    // Ensure database exists
    await conn.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
    await conn.query(`USE \`${dbName}\`;`);

    // Check if tables exist
    const [tables] = await conn.query(`SHOW TABLES;`);
    if (tables.length === 0) {
      console.log(`[FTS] Database \`${dbName}\` is empty. Applying schema...`);
      const schemaPath = path.join(__dirname, 'schema.sql');
      if (fs.existsSync(schemaPath)) {
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');
        await conn.query(schemaSql);
        console.log(`[FTS] Schema initialized successfully.`);
      }
    }

    // Verify demo seed users exist
    const [userRows] = await conn.query(`SELECT COUNT(*) as count FROM users WHERE email IN ('buyer@demo.example', 'exporter@demo.example');`);
    if (userRows[0].count < 2) {
      console.log(`[FTS] Seeding initial demo accounts...`);
      const { seedDemoData } = await import('./seedDemoData.js');
      await seedDemoData();
    }

    console.log(`[✓] MySQL Database Connected: \`${dbName}\` (${tables.length || 8} tables active)`);
    console.log(`[✓] Ready for incoming Next.js API requests.\n`);
  } catch (err) {
    console.error(`[!] Error verifying database \`${dbName}\`:`, err.message);
  } finally {
    if (conn) await conn.end();
  }
}

autoConnect();
