ALTER TABLE users 
MODIFY COLUMN role ENUM('customer', 'pharmacy', 'rider') NOT NULL DEFAULT 'customer';