CREATE TABLE orders (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    pharmacy_id BIGINT NOT NULL,
    delivery_type ENUM('home_delivery','pickup') NOT NULL,
    delivery_charge DECIMAL(8,2) DEFAULT 0,
    total_price DECIMAL(10,2) NOT NULL,
    rider_id BIGINT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);