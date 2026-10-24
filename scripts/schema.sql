-- Foreign Trading System — MySQL schema
-- Compatible with MySQL 8.0
CREATE DATABASE IF NOT EXISTS `foreign_trading_system`
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `foreign_trading_system`;

-- ─── Users ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `users` (
  `uid` VARCHAR(64) NOT NULL PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(64) DEFAULT '',
  `role` VARCHAR(32) NOT NULL DEFAULT 'buyer',
  `company_id` VARCHAR(64) DEFAULT NULL,
  `company_name` VARCHAR(255) DEFAULT '',
  `country` VARCHAR(128) DEFAULT '',
  `status` VARCHAR(32) NOT NULL DEFAULT 'active',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `last_login_at` DATETIME NULL,
  INDEX `idx_users_role` (`role`),
  INDEX `idx_users_company` (`company_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── Companies ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `companies` (
  `company_id` VARCHAR(64) NOT NULL PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `registration_number` VARCHAR(128) DEFAULT '',
  `tax_id` VARCHAR(128) DEFAULT '',
  `country` VARCHAR(128) DEFAULT '',
  `address` VARCHAR(512) DEFAULT '',
  `city` VARCHAR(128) DEFAULT '',
  `postal_code` VARCHAR(32) DEFAULT '',
  `phone` VARCHAR(64) DEFAULT '',
  `email` VARCHAR(255) DEFAULT '',
  `type` VARCHAR(32) DEFAULT 'buyer',
  `verification_status` VARCHAR(32) NOT NULL DEFAULT 'pending',
  `documents` JSON NULL,
  `owner_id` VARCHAR(64) DEFAULT NULL,
  `rejection_reason` TEXT NULL,
  `suspension_reason` TEXT NULL,
  `verified_at` DATETIME NULL,
  `verified_by` VARCHAR(64) NULL,
  `reviewed_by` VARCHAR(64) NULL,
  `suspended_by` VARCHAR(64) NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_companies_status` (`verification_status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── Products ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `products` (
  `product_id` VARCHAR(64) NOT NULL PRIMARY KEY,
  `exporter_id` VARCHAR(64) DEFAULT NULL,
  `company_id` VARCHAR(64) DEFAULT NULL,
  `name` VARCHAR(255) NOT NULL,
  `description` TEXT NULL,
  `category` VARCHAR(128) DEFAULT '',
  `hs_code` VARCHAR(64) DEFAULT '',
  `price` DECIMAL(14,2) NOT NULL DEFAULT 0,
  `currency` VARCHAR(8) NOT NULL DEFAULT 'USD',
  `quantity` INT NOT NULL DEFAULT 0,
  `minimum_order_quantity` INT NOT NULL DEFAULT 1,
  `country_of_origin` VARCHAR(128) DEFAULT '',
  `exporter_company` VARCHAR(255) DEFAULT '',
  `weight` VARCHAR(64) DEFAULT '',
  `dimensions` VARCHAR(128) DEFAULT '',
  `status` VARCHAR(32) NOT NULL DEFAULT 'active',
  `image_urls` JSON NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_products_exporter` (`exporter_id`),
  INDEX `idx_products_status` (`status`),
  INDEX `idx_products_category` (`category`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── Orders ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `orders` (
  `order_id` VARCHAR(64) NOT NULL PRIMARY KEY,
  `buyer_id` VARCHAR(64) DEFAULT NULL,
  `buyer_company_id` VARCHAR(64) DEFAULT NULL,
  `buyer_company_name` VARCHAR(255) DEFAULT '',
  `exporter_id` VARCHAR(64) DEFAULT NULL,
  `exporter_company_id` VARCHAR(64) DEFAULT NULL,
  `exporter_company` VARCHAR(255) DEFAULT '',
  `product_id` VARCHAR(64) DEFAULT NULL,
  `product_name` VARCHAR(255) DEFAULT '',
  `quantity` INT NOT NULL DEFAULT 1,
  `unit_price` DECIMAL(14,2) NOT NULL DEFAULT 0,
  `subtotal` DECIMAL(14,2) NOT NULL DEFAULT 0,
  `shipping_cost` DECIMAL(14,2) NOT NULL DEFAULT 0,
  `tax_amount` DECIMAL(14,2) NOT NULL DEFAULT 0,
  `other_fees` DECIMAL(14,2) NOT NULL DEFAULT 0,
  `total_amount` DECIMAL(14,2) NOT NULL DEFAULT 0,
  `currency` VARCHAR(8) NOT NULL DEFAULT 'USD',
  `status` VARCHAR(32) NOT NULL DEFAULT 'PENDING',
  `payment_id` VARCHAR(64) DEFAULT NULL,
  `shipment_id` VARCHAR(64) DEFAULT NULL,
  `origin_country` VARCHAR(128) DEFAULT '',
  `destination_country` VARCHAR(128) DEFAULT '',
  `delivery_address` VARCHAR(512) DEFAULT '',
  `shipping_method` VARCHAR(128) DEFAULT '',
  `rejection_reason` TEXT NULL,
  `cancellation_reason` TEXT NULL,
  `items` JSON NULL,
  `accepted_at` DATETIME NULL,
  `paid_at` DATETIME NULL,
  `shipped_at` DATETIME NULL,
  `delivered_at` DATETIME NULL,
  `completed_at` DATETIME NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_orders_buyer` (`buyer_id`),
  INDEX `idx_orders_exporter` (`exporter_id`),
  INDEX `idx_orders_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── Payments ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `payments` (
  `payment_id` VARCHAR(64) NOT NULL PRIMARY KEY,
  `order_id` VARCHAR(64) DEFAULT NULL,
  `buyer_id` VARCHAR(64) DEFAULT NULL,
  `amount` DECIMAL(14,2) NOT NULL DEFAULT 0,
  `currency` VARCHAR(8) NOT NULL DEFAULT 'USD',
  `provider` VARCHAR(64) DEFAULT 'SANDBOX',
  `provider_payment_id` VARCHAR(128) DEFAULT '',
  `status` VARCHAR(32) NOT NULL DEFAULT 'PENDING',
  `failure_reason` TEXT NULL,
  `refund_status` VARCHAR(32) DEFAULT NULL,
  `mode` VARCHAR(64) DEFAULT 'SANDBOX_TEST_PAYMENT',
  `paid_at` DATETIME NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_payments_order` (`order_id`),
  INDEX `idx_payments_buyer` (`buyer_id`),
  INDEX `idx_payments_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── Invoices ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `invoices` (
  `invoice_id` VARCHAR(64) NOT NULL PRIMARY KEY,
  `invoice_number` VARCHAR(64) NOT NULL UNIQUE,
  `order_id` VARCHAR(64) DEFAULT NULL,
  `buyer_id` VARCHAR(64) DEFAULT NULL,
  `buyer_company_id` VARCHAR(64) DEFAULT NULL,
  `exporter_id` VARCHAR(64) DEFAULT NULL,
  `exporter_company_id` VARCHAR(64) DEFAULT NULL,
  `items` JSON NULL,
  `subtotal` DECIMAL(14,2) NOT NULL DEFAULT 0,
  `shipping_cost` DECIMAL(14,2) NOT NULL DEFAULT 0,
  `tax_amount` DECIMAL(14,2) NOT NULL DEFAULT 0,
  `total_amount` DECIMAL(14,2) NOT NULL DEFAULT 0,
  `currency` VARCHAR(8) NOT NULL DEFAULT 'USD',
  `payment_status` VARCHAR(32) NOT NULL DEFAULT 'PENDING',
  `payment_id` VARCHAR(64) DEFAULT NULL,
  `paid_at` DATETIME NULL,
  `generated_at` DATETIME NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_invoices_order` (`order_id`),
  INDEX `idx_invoices_buyer` (`buyer_id`),
  INDEX `idx_invoices_exporter` (`exporter_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── Shipments ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `shipments` (
  `shipment_id` VARCHAR(64) NOT NULL PRIMARY KEY,
  `order_id` VARCHAR(64) DEFAULT NULL,
  `carrier` VARCHAR(255) DEFAULT '',
  `tracking_number` VARCHAR(128) DEFAULT '',
  `origin` VARCHAR(255) DEFAULT '',
  `destination` VARCHAR(255) DEFAULT '',
  `current_location` VARCHAR(255) DEFAULT '',
  `latitude` DECIMAL(10,6) NULL,
  `longitude` DECIMAL(10,6) NULL,
  `status` VARCHAR(64) NOT NULL DEFAULT 'CREATED',
  `estimated_delivery` DATETIME NULL,
  `logistics_provider_id` VARCHAR(64) DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_shipments_order` (`order_id`),
  INDEX `idx_shipments_status` (`status`),
  INDEX `idx_shipments_provider` (`logistics_provider_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── Tracking events ───────────────────────────────────
CREATE TABLE IF NOT EXISTS `tracking_events` (
  `event_id` VARCHAR(64) NOT NULL PRIMARY KEY,
  `shipment_id` VARCHAR(64) NOT NULL,
  `order_id` VARCHAR(64) DEFAULT NULL,
  `status` VARCHAR(64) DEFAULT '',
  `location` VARCHAR(255) DEFAULT '',
  `latitude` DECIMAL(10,6) NULL,
  `longitude` DECIMAL(10,6) NULL,
  `note` TEXT NULL,
  `timestamp` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_tracking_shipment` (`shipment_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── Documents ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `documents` (
  `document_id` VARCHAR(64) NOT NULL PRIMARY KEY,
  `order_id` VARCHAR(64) DEFAULT NULL,
  `company_id` VARCHAR(64) DEFAULT NULL,
  `uploaded_by` VARCHAR(64) DEFAULT NULL,
  `type` VARCHAR(128) DEFAULT '',
  `file_name` VARCHAR(512) DEFAULT '',
  `file_size` BIGINT NOT NULL DEFAULT 0,
  `mime_type` VARCHAR(128) DEFAULT '',
  `storage_path` VARCHAR(1024) DEFAULT '',
  `download_url` VARCHAR(1024) DEFAULT '',
  `verification_status` VARCHAR(32) NOT NULL DEFAULT 'pending',
  `verified_by` VARCHAR(64) NULL,
  `verified_at` DATETIME NULL,
  `remarks` TEXT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_documents_order` (`order_id`),
  INDEX `idx_documents_company` (`company_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── Notifications ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS `notifications` (
  `notification_id` VARCHAR(64) NOT NULL PRIMARY KEY,
  `user_id` VARCHAR(64) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `message` TEXT NULL,
  `type` VARCHAR(64) DEFAULT 'GENERAL',
  `resource_id` VARCHAR(64) DEFAULT NULL,
  `is_read` TINYINT(1) NOT NULL DEFAULT 0,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_notifications_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── Audit logs ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `audit_logs` (
  `log_id` VARCHAR(64) NOT NULL PRIMARY KEY,
  `actor_id` VARCHAR(64) DEFAULT NULL,
  `actor_role` VARCHAR(32) DEFAULT '',
  `action` VARCHAR(128) DEFAULT '',
  `resource_type` VARCHAR(64) DEFAULT '',
  `resource_id` VARCHAR(64) DEFAULT NULL,
  `result` VARCHAR(32) DEFAULT 'success',
  `metadata` JSON NULL,
  `timestamp` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_audit_actor` (`actor_id`),
  INDEX `idx_audit_action` (`action`),
  INDEX `idx_audit_resource` (`resource_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── Watchlists ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `watchlists` (
  `user_id` VARCHAR(64) NOT NULL PRIMARY KEY,
  `symbols` JSON NULL,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── Market alerts ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS `market_alerts` (
  `alert_id` VARCHAR(64) NOT NULL PRIMARY KEY,
  `user_id` VARCHAR(64) NOT NULL,
  `symbol` VARCHAR(32) DEFAULT '',
  `condition_type` VARCHAR(32) DEFAULT '',
  `target_price` DECIMAL(18,6) NULL,
  `active` TINYINT(1) NOT NULL DEFAULT 1,
  `triggered` TINYINT(1) NOT NULL DEFAULT 0,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `triggered_at` DATETIME NULL,
  INDEX `idx_alerts_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── Paper trading ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS `paper_accounts` (
  `user_id` VARCHAR(64) NOT NULL PRIMARY KEY,
  `balance` DECIMAL(18,2) NOT NULL DEFAULT 100000,
  `initial_balance` DECIMAL(18,2) NOT NULL DEFAULT 100000,
  `currency` VARCHAR(8) NOT NULL DEFAULT 'USD',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `paper_orders` (
  `paper_order_id` VARCHAR(64) NOT NULL PRIMARY KEY,
  `user_id` VARCHAR(64) NOT NULL,
  `symbol` VARCHAR(32) DEFAULT '',
  `side` VARCHAR(8) DEFAULT 'BUY',
  `quantity` DECIMAL(18,6) NOT NULL DEFAULT 0,
  `price` DECIMAL(18,6) NOT NULL DEFAULT 0,
  `status` VARCHAR(32) NOT NULL DEFAULT 'FILLED',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_paper_orders_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `paper_positions` (
  `position_id` VARCHAR(64) NOT NULL PRIMARY KEY,
  `user_id` VARCHAR(64) NOT NULL,
  `symbol` VARCHAR(32) DEFAULT '',
  `side` VARCHAR(8) DEFAULT 'BUY',
  `quantity` DECIMAL(18,6) NOT NULL DEFAULT 0,
  `entry_price` DECIMAL(18,6) NOT NULL DEFAULT 0,
  `current_price` DECIMAL(18,6) NULL,
  `unrealized_pl` DECIMAL(18,2) NOT NULL DEFAULT 0,
  `realized_pl` DECIMAL(18,2) NULL,
  `status` VARCHAR(16) NOT NULL DEFAULT 'OPEN',
  `opened_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `closed_at` DATETIME NULL,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_paper_positions_user` (`user_id`),
  INDEX `idx_paper_positions_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── Market cache / logs ───────────────────────────────
CREATE TABLE IF NOT EXISTS `market_quotes` (
  `symbol` VARCHAR(64) NOT NULL PRIMARY KEY,
  `data` JSON NULL,
  `provider` VARCHAR(64) DEFAULT 'Twelve Data',
  `cached_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `market_data_status` (
  `status_id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `data` JSON NULL,
  `logged_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── Support messages ──────────────────────────────────
CREATE TABLE IF NOT EXISTS `support_messages` (
  `message_id` VARCHAR(64) NOT NULL PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `subject` VARCHAR(255) DEFAULT 'General Inquiry',
  `message` TEXT NOT NULL,
  `status` VARCHAR(16) NOT NULL DEFAULT 'NEW',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── Webhook idempotency ────────────────────────────────
CREATE TABLE IF NOT EXISTS `processed_webhook_events` (
  `event_id` VARCHAR(128) NOT NULL PRIMARY KEY,
  `order_id` VARCHAR(64) DEFAULT NULL,
  `payment_id` VARCHAR(64) DEFAULT NULL,
  `processed_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
