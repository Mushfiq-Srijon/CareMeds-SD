ALTER TABLE orders ADD COLUMN consignment_id VARCHAR(255) NULL AFTER status;
ALTER TABLE orders ADD COLUMN recipient_name VARCHAR(255) NULL AFTER consignment_id;