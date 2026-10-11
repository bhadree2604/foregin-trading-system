# Foreign Trading System (FTS) — Full-Stack Web Application

An enterprise-grade, full-stack international trade management platform architected to streamline cross-border trade between global buyers (importers), sellers (exporters), and logistics carriers with authorized payment sessions, cryptographic audit logging, real-time spatial tracking, and customs compliance.

---

## 1. Project Overview & Architecture

Foreign Trading System governs the entire commercial lifecycle of international commerce:

```text
Exporter Registration & Verification
                 ↓
Product Creation & HS Code Classification
                 ↓
Buyer Product Discovery & Trade Order Creation
                 ↓
Exporter Purchase Order Acceptance
                 ↓
Authorized Payment Session & Cryptographic Webhook Settlement
                 ↓
Automated Commercial Invoice Generation
                 ↓
Shipment Dispatch & Vessel Waypoint GPS Logging
                 ↓
Multi-Port Live Map Tracking & Milestone Events
                 ↓
Customs Review & Release
                 ↓
Consignee Delivery & Trade Completion
                 ↓
Aggregated Intelligence & Audit Reports
```

---

## 2. Technology Stack

- **Frontend Core:** Pure React.js (React 19)
- **Tooling & Bundler:** Webpack 5 + Babel (ES6+/JSX) + PostCSS + Tailwind CSS v4
- **Icons & UI:** Lucide React
- **Routing:** React Router v7 (Public, ProtectedRoute, RoleRoute)
- **Data & Auth:** Firebase Authentication & Cloud Firestore
- **File Vault:** Firebase Storage
- **Serverless Compute:** Firebase Cloud Functions
- **Spatial Tracking:** React Leaflet + Leaflet (OSM tiles, custom markers & polylines)
- **Analytics & BI:** Recharts
- **Notifications & Feedback:** React Hot Toast + In-app real-time alerts

---

## 3. Role-Based Access Control (RBAC)

The system enforces 4 strictly partitioned roles:

| Role | Responsibilities | Default Dashboard |
| :--- | :--- | :--- |
| **Buyer / Importer** | Product procurement, order placement, authorized settlement, invoice download, cargo tracking | `/buyer/dashboard` |
| **Exporter / Seller** | Catalog management, MOQ & stock, order approval, cargo handover, revenue tracking | `/exporter/dashboard` |
| **Logistics Carrier** | Fleet assignment, waypoint GPS coordinate updates, port milestone broadcasting | `/logistics/dashboard` |
| **Compliance Admin**| KYB business verification, customs release, financial reconciliation, immutable audit logs | `/admin/dashboard` |

---

## 4. Quick Start & Local Development

### Prerequisites
- Node.js `v20+` or `v24+`
- npm `v10+`

### Installation
```bash
# 1. Clone repository
git clone <repo-url>
cd foregin-trading-system

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env

# 4. Start local development server (Webpack Dev Server)
npm start
# or
npm run dev
```
The application will launch at `http://localhost:3000`.

### Production Build
```bash
# Build optimized static bundle
npm run build
```
Compiled output is generated in `./dist/`.

---

## 5. Pre-configured Demo Accounts

For rapid testing and evaluation, one-click demo credentials are built into the `/login` page:

- **Buyer (Importer):** `buyer@demo.example` (Password: `DemoPassword123!`)
- **Exporter (Seller):** `exporter@demo.example` (Password: `DemoPassword123!`)
- **Logistics Provider:** `logistics@demo.example` (Password: `DemoPassword123!`)
- **System Admin:** `admin@demo.example` (Password: `DemoPassword123!`)

---

## 6. Financial Architecture & Security Rules

### Authoritative Anti-Tamper Payments
- Sensitive credentials (card numbers, PINs, OTPs, internet banking passwords) are **never** requested, entered, or stored.
- Orders must be accepted by the exporter before entering `PAYMENT_PENDING`.
- Payments are generated through server-side authorized sessions (`createPaymentSession`).
- Settlements are confirmed cryptographically via webhooks with HMAC signature validation and event idempotency.
- Settlement automatically generates legal Commercial Invoices (`/buyer/invoices/:id`).

### Security Rules
- `firestore.rules`: Prevents arbitrary status escalation, protects company documents, enforces immutable audit logging (`auditLogs`), and limits payment edits to privileged routines.
- `storage.rules`: Multi-tenant isolation for trade documents (`documents/{companyId}/{orderId}/*`) with strict file type and size guards (15MB max).

---

## 7. Master Acceptance Test Scenario (Section 95)

1. Exporter logs in as `exporter@demo.example` and reviews product catalog.
2. Buyer logs in as `buyer@demo.example`, selects **Industrial Micro-Sensor Modules**, and orders 100 units.
3. System Authoritative Calculation:
   - Subtotal: **$50,000**
   - Freight & Handling: **$3,000**
   - Taxes & Customs: **$1,500**
   - Total: **$54,500**
4. Exporter reviews and accepts order (`CONFIRMED` → `PAYMENT_PENDING`).
5. Buyer clicks **PAY NOW** and completes authorized sandbox test payment.
6. Webhook verifies payment: status becomes `PAID`, commercial invoice is generated.
7. Exporter prepares cargo and creates shipment manifest `FTS20260001`.
8. Logistics logs waypoints (`Chennai` → `Singapore` → `Dubai` → `Hamburg`).
9. Buyer tracks live satellite positioning and milestone progression on Leaflet map.
10. Customs clears cargo and consignee receives delivery (`DELIVERED` → `COMPLETED`).
11. Admin audits immutable cryptographic event trail in `/admin/audit-logs`.

---

## 8. License & Production Notice
This application demonstrates enterprise-grade architecture for cross-border commerce. Live production money settlement requires acquiring provider merchant credentials, KYC/KYB banking approval, and regulatory compliance.
"# sample" 
