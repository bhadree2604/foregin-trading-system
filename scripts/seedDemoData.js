/**
 * Demo Data Seeder for Foreign Trading System (MySQL version).
 * Establishes the master test scenario:
 * 1. Exporter: ABC Electronics India Ltd
 * 2. Buyer: XYZ GmbH Germany
 * 3. Product: Industrial Sensor (USD 500)
 * 4. Order: 100 units (Total: USD 54,500)
 * 5. Shipment: FTS20260001 (Chennai -> Singapore -> Dubai -> Hamburg)
 *
 * Usage: node scripts/seedDemoData.js
 */
import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';

const config = {
  host: process.env.MYSQL_HOST || 'localhost',
  port: Number(process.env.MYSQL_PORT || 3306),
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || 'anime@#26',
  database: process.env.MYSQL_DATABASE || 'foreign_trading_system',
};

export async function seedDemoData() {
  console.log('Seeding Foreign Trading System Demo Data (MySQL)...');
  const conn = await mysql.createConnection(config);
  try {
    const hash = await bcrypt.hash('demo1234', 10);

    await conn.execute(
      `INSERT INTO companies (company_id, name, registration_number, country, address, phone, email, type, verification_status, owner_id)
       VALUES ('company_exporter_001', 'ABC Electronics India Ltd', 'IN-33AAACR1234F1Z5', 'India', 'Industrial Technology Corridor, Chennai', '+91 44 2841 9000', 'export@abcelectronics.example', 'exporter', 'verified', 'exporter_demo_001')
       ON DUPLICATE KEY UPDATE name=VALUES(name), verification_status='verified'`
    );
    await conn.execute(
      `INSERT INTO companies (company_id, name, registration_number, country, address, phone, email, type, verification_status, owner_id)
       VALUES ('company_buyer_001', 'XYZ GmbH Germany', 'DE-814592103', 'Germany', 'HafenCity Terminal 4, Hamburg, Germany', '+49 40 3801 200', 'procurement@xyz-gmbh.example', 'buyer', 'verified', 'buyer_demo_001')
       ON DUPLICATE KEY UPDATE name=VALUES(name), verification_status='verified'`
    );
    await conn.execute(
      `INSERT INTO users (uid, name, email, password_hash, role, company_id, company_name, country, status)
       VALUES ('exporter_demo_001', 'Rajesh Sharma', 'exporter@demo.example', ?, 'exporter', 'company_exporter_001', 'ABC Electronics India Ltd', 'India', 'active')
       ON DUPLICATE KEY UPDATE name=VALUES(name)`,
      [hash]
    );
    await conn.execute(
      `INSERT INTO users (uid, name, email, password_hash, role, company_id, company_name, country, status)
       VALUES ('buyer_demo_001', 'Dr. Klaus Becker', 'buyer@demo.example', ?, 'buyer', 'company_buyer_001', 'XYZ GmbH Germany', 'Germany', 'active')
       ON DUPLICATE KEY UPDATE name=VALUES(name)`,
      [hash]
    );
    await conn.execute(
      `INSERT INTO users (uid, name, email, password_hash, role, company_id, company_name, country, status)
       VALUES ('admin_demo_001', 'Master Compliance Officer', 'admin@demo.example', ?, 'admin', 'company_buyer_001', 'Foreign Trading System Admin', 'Singapore', 'active')
       ON DUPLICATE KEY UPDATE name=VALUES(name)`,
      [hash]
    );
    await conn.execute(
      `INSERT INTO products (product_id, exporter_id, company_id, name, description, category, hs_code, price, currency, quantity, minimum_order_quantity, country_of_origin, exporter_company, weight, dimensions, status, image_urls)
       VALUES ('demo-prod-001', 'exporter_demo_001', 'company_exporter_001', 'Industrial Micro-Sensor Modules (Precision Grade)', 'Precision multi-axis sensors for automated manufacturing.', 'Electronics', '9031.80.80', 500, 'USD', 1000, 50, 'India', 'ABC Electronics India Ltd', '0.25 kg/unit', '12 x 8 x 4 cm', 'active', ?)
       ON DUPLICATE KEY UPDATE name=VALUES(name)`,
      [JSON.stringify(['https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80'])]
    );
    await conn.execute(
      `INSERT INTO orders (order_id, buyer_id, buyer_company_id, buyer_company_name, exporter_id, exporter_company_id, exporter_company, product_id, product_name, quantity, unit_price, subtotal, shipping_cost, tax_amount, total_amount, currency, status, shipment_id, origin_country, destination_country, delivery_address, shipping_method, accepted_at, paid_at, shipped_at, delivered_at)
       VALUES ('demo-order-001', 'buyer_demo_001', 'company_buyer_001', 'XYZ GmbH Germany', 'exporter_demo_001', 'company_exporter_001', 'ABC Electronics India Ltd', 'demo-prod-001', 'Industrial Micro-Sensor Modules', 100, 500, 50000, 3000, 1500, 54500, 'USD', 'DELIVERED', 'FTS20260001', 'India', 'Germany', 'HafenCity Terminal 4, Hamburg, Germany', 'Ocean Freight (FCL)', NOW(), NOW(), NOW(), NOW())
       ON DUPLICATE KEY UPDATE status='DELIVERED'`
    );
    await conn.execute(
      `INSERT INTO shipments (shipment_id, order_id, carrier, tracking_number, origin, destination, current_location, latitude, longitude, status)
       VALUES ('FTS20260001', 'demo-order-001', 'Pacific Orient Container Lines', 'POCL-9920194-HAM', 'Chennai Port (India)', 'Port of Hamburg (Germany)', 'Port of Hamburg Terminal', 53.5511, 9.9937, 'DELIVERED')
       ON DUPLICATE KEY UPDATE status='DELIVERED'`
    );
    console.log('Seeding completed successfully.');
    console.log('Demo logins (password: demo1234): buyer@demo.example / exporter@demo.example / admin@demo.example');
  } finally {
    await conn.end();
  }
}

seedDemoData().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
