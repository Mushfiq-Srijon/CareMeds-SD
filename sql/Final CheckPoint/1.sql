ALTER TABLE orders
ADD COLUMN payment_type ENUM('stripe', 'cod') NOT NULL DEFAULT 'cod' AFTER total_price,
ADD COLUMN payment_status ENUM('pending', 'paid', 'failed') NOT NULL DEFAULT 'pending' AFTER payment_type,
ADD COLUMN stripe_payment_intent_id VARCHAR(255) NULL AFTER payment_status;